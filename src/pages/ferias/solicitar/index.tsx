import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  GridProps,
  IconButton,
  InputAdornment,
  Typography,
  styled
} from '@mui/material'
import { Box } from '@mui/system'
import { ChangeEvent, Fragment, useEffect, useState } from 'react'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import { getInitials } from 'src/@core/utils/get-initials'
import { useAuth } from 'src/hooks/useAuth'
import { UserStaffData } from '../../colaborador/cadastrar'
import { firestore } from 'src/configs/firebaseConfig'
import { collection, doc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore'
import toast from 'react-hot-toast'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import { SelectiveData } from 'src/types/pages/userStaff'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CustomInputPicker } from 'src/components/forms/DatePickerHelpers'
import IconifyIcon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { useRouter } from 'next/router'
import { AbsenceRequestData, VacationRequestData } from 'src/types/pages/generalData'
import { isWeekday } from 'src/pages/faltas/justificar'

// ** keynote: Mudar idioma de datepicker
import DatePicker from 'react-datepicker'

// Function to check if a given date is a weekend (Saturday or Sunday)
const isWeekend = (date: Date) => {
  const dayOfWeek = date.getDay()

  return dayOfWeek === 0 || dayOfWeek === 6 // 0 is Sunday, 6 is Saturday
}

// Custom error message for weekend start dates
const weekendErrorMessage = 'As férias não podem iníciar no final de semana'

// Vacation request schema with custom validation for start date
const vacationRequestSchema = z
  .object({
    id: z.string().optional(),
    staffId: z.string().optional(),
    supervisor: z.string().array().optional(),
    notify: z.boolean().optional(),
    reason: z.string(),
    start_date: z.date(),
    end_date: z.date().optional(),
    days: z.number().min(1, 'O número de dias não corresponde')
  })
  .refine(({ start_date }) => {
    if (isWeekend(start_date)) {
      console.log('Is weekend')

      return true // No error, start date is on a weekday
    }

    return {
      start_date: weekendErrorMessage
    } // Error message for start date on weekend
  })

type VacationRequest = z.infer<typeof vacationRequestSchema>

export function vacationDays(admittedDate: Date | undefined) {
  if (!admittedDate || isNaN(admittedDate.getTime())) {
    console.error('Invalid admittedDate provided')

    return 0
  }

  let vacationDays = 0
  const todayDate = new Date()

  // Calculate the number of full months worked
  const yearsDiff = todayDate.getFullYear() - admittedDate.getFullYear()
  const monthsDiff = todayDate.getMonth() - admittedDate.getMonth()
  const daysDiff = todayDate.getDate() - admittedDate.getDate()

  let monthsWorked = yearsDiff * 12 + monthsDiff
  if (daysDiff < 0) {
    monthsWorked -= 1
  }

  if (monthsWorked <= 12) {
    vacationDays = monthsWorked * 1 // 1 day of vacation per month
  } else if (monthsWorked <= 24) {
    vacationDays = (monthsWorked - 12) * 2.5
  } else {
    vacationDays = 30
  }

  return vacationDays
}

export function getCurrentYearRemainingVacationDays(totalDays: number, userVacationRequest: VacationRequestData[]) {
  const today = new Date()
  const currentYear = today?.getFullYear()

  let remainingDays = totalDays

  userVacationRequest.forEach(request => {
    if (request?.start_date?.toDate()?.getFullYear() === currentYear) {
      remainingDays -= request.days
    }
  })

  return remainingDays
}

const StyledGrid = styled(Grid)<GridProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  [theme.breakpoints.up('md')]: {
    borderRight: `0px solid ${theme.palette.divider}`
  }
}))

export default function VacationRequestForm({}) {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  //** States */
  const [currentStaff, setCurrentStaff] = useState<UserStaffData>()
  const [departments, setDepartaments] = useState<SelectiveData[]>([])
  const [supervisorStaff, setSupervisorStaff] = useState<UserStaffData[]>([])
  const [vacationRequest, setVacationRequest] = useState<VacationRequestData[]>([])
  const [isError, setError] = useState<boolean>(false)

  const [absenceRequest, setAbsenceRequest] = useState<AbsenceRequestData[]>([])

  //** Hooks */
  const { user } = useAuth()
  const router = useRouter()

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    register,
    watch,
    formState: { errors, isValid }
  } = useForm<VacationRequest>({
    resolver: zodResolver(vacationRequestSchema),
    defaultValues: {
      start_date: new Date(),
      end_date: new Date(),
      days: 0
    }
  })

  const { days, start_date, end_date } = watch()

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      try {
        const staffArray: UserStaffData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'staff'))
        querySnapshot.forEach(doc => {
          staffArray.push(doc.data() as UserStaffData)
        })

        const findStaff = staffArray.find(staff => staff.id === user!.staffId)
        setCurrentStaff(findStaff)

        const myDepartmentStaff = staffArray.filter(staff => staff.department === findStaff?.department)
        setSupervisorStaff(myDepartmentStaff)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
      setIsLoading(false)
    }
    getData()
  }, [user])

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      try {
        const vacationRequestArray: VacationRequestData[] = []
        const querySnapshot = await getDocs(
          query(collection(firestore, 'vacation_request'), where('staffId', '==', user!.staffId))
        )
        querySnapshot.forEach(doc => {
          vacationRequestArray.push(doc.data() as VacationRequestData)
        })

        setVacationRequest(vacationRequestArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
      setIsLoading(false)
    }
    getData()
  }, [user])

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      try {
        const absenceRequestArray: AbsenceRequestData[] = []
        const querySnapshot = await getDocs(
          query(
            collection(firestore, 'absence_justification'),
            where('staffId', '==', user!.staffId),
            orderBy('request_date', 'desc')
          )
        )
        querySnapshot.forEach(doc => {
          absenceRequestArray.push(doc.data() as AbsenceRequestData)
        })

        setAbsenceRequest(absenceRequestArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
      setIsLoading(false)
    }
    getData()
  }, [user])

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      try {
        const dptArray: SelectiveData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'departments'))
        querySnapshot.forEach(doc => {
          dptArray.push(doc.data() as SelectiveData)
        })
        setDepartaments(dptArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
      setIsLoading(false)
    }
    getData()
  }, [currentStaff])

  useEffect(() => {
    if (start_date) {
      setValue('end_date', start_date)

      setValue('days', 0)
    }
  }, [setValue, start_date])

  const filterAbsenceRequests = absenceRequest.filter(aRequest => {
    const currentYear = new Date().getFullYear()

    return currentYear === aRequest?.request_date?.toDate().getFullYear()
  })

  const absencedDaysThisYear =
    filterAbsenceRequests.reduce((totalDays, obj) => totalDays + obj.human_resources?.day_vacations, 0) || 0

  const remainingDays =
    getCurrentYearRemainingVacationDays(vacationDays(currentStaff?.admited_at?.toDate()), vacationRequest) -
      absencedDaysThisYear || 0

  console.log('remaining', remainingDays)

  const handleValueChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target

    const days = parseInt(value, 10) | 0
    const endDate = new Date(start_date)

    endDate.setDate(start_date?.getDate() + days)

    // const maxDays = vacationDays(currentStaff?.admited_at?.toDate()) || 0

    if (days > remainingDays) {
      setError(true)
      setValue('days', remainingDays)
    } else if (days < 0) {
      setValue('days', 0)
    } else {
      setError(false)
      setValue('end_date', endDate)
      setValue('days', days)
    }
  }

  const isVacationAvailable = true

  const onSubmit = async (values: VacationRequest) => {
    setIsLoading(true)
    console.log(values)
    try {
      const newRef = doc(collection(firestore, 'vacation_request'))

      await setDoc(newRef, {
        id: newRef.id,
        staffId: currentStaff?.id,
        supervisor: values.supervisor,
        request_date: new Date(),
        reason: values.reason,
        start_date: values.start_date,
        end_date: values.end_date,
        days: values.days
      })

      await fetch('/api/email/vacation/request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'mr.eniomarcos@gmail.com',
          name: `${currentStaff?.name} ${currentStaff?.surname}`,
          position: 'Técnico',
          start_date: new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'long'
          }).format(values.start_date),
          end_date: new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'long'
          }).format(values.end_date),
          days: values.days
        })
      })

      router.push('/ferias/historico')

      toast.success('Dados carregados com sucesso!')

      reset()
    } catch (error) {
      toast.error('Erro ao cadastrar colaborador')
      console.log(error)
    }

    setIsLoading(false)
  }

  const currentYear = new Date().getFullYear()
  const maxDate = new Date(currentYear, 11, 31)

  return (
    <Card>
      <CardHeader title='Solicitação de Férias' />
      <Divider>Dados do Funcionário</Divider>
      <ModalProgressBar open={isLoading} />
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Grid container spacing={6}>
            <StyledGrid item md={4} xs={12}>
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                {user?.avatar ? (
                  <CustomAvatar
                    src={user!.avatar}
                    variant='circular'
                    alt={user.fullName}
                    sx={{ width: 150, height: 150, mb: 2 }}
                  />
                ) : (
                  <CustomAvatar
                    skin='light'
                    variant='circular'
                    sx={{ width: 100, height: 100, mb: 2, fontSize: '3rem' }}
                  >
                    {getInitials(user!.fullName)}
                  </CustomAvatar>
                )}
                <Typography variant='h4' sx={{ mb: 3 }}>
                  {`${user?.fullName}`}
                </Typography>
                <CustomChip
                  rounded
                  skin='light'
                  size='small'
                  color='primary'
                  label={user?.roleName}
                  sx={{ textTransform: 'capitalize' }}
                />
              </CardContent>
            </StyledGrid>
            <Grid
              item
              xs={12}
              md={7}
              sx={{
                pt: ['0 !important', '0 !important', '1.5rem !important'],
                pl: ['1.5rem !important', '1.5rem !important', '0 !important']
              }}
            >
              <CardContent>
                <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
                  Detalhes
                </Typography>
                <Box sx={{ pt: 4 }}>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 'bold', color: 'text.secondary' }}>Nome:</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{user?.fullName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 'bold', color: 'text.secondary' }}>Departamento:</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {departments.find(dpt => dpt.id === currentStaff?.department)?.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 'bold', color: 'text.secondary' }}>
                      Data de Contratação:
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {currentStaff?.admited_at?.toDate().toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 'bold', color: 'text.secondary' }}>
                      Dias de Direito:
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {currentStaff?.admited_at ? vacationDays(currentStaff?.admited_at?.toDate()) : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 'bold', color: 'text.secondary' }}>
                      Dias Descontados por Faltas:
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {currentStaff?.admited_at ? absencedDaysThisYear : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 'bold', color: 'text.secondary' }}>
                      Dias de Remanescentes:
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {currentStaff?.admited_at ? remainingDays : ''}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: '0 !important' }}>Dados para a Programação de Férias</Divider>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {isError && (
              <Grid item xs={12} sm={12}>
                <Alert sx={{ marginTop: 3 }} variant='filled' severity={'warning'}>
                  Atingiu o número máximo de dias de ferias que pode solicitar!
                </Alert>
              </Grid>
            )}
            {isVacationAvailable ? (
              <Fragment>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name={`start_date`} // Use array notation for the name
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        locale='ptBR'
                        selected={value}
                        showYearDropdown
                        showMonthDropdown
                        dateFormat='dd/MM/yyyy'
                        onChange={date => onChange(date)}
                        placeholderText='DD/MM/AAAA'
                        maxDate={maxDate}
                        yearDropdownItemNumber={1}
                        scrollableYearDropdown={false}
                        filterDate={isWeekday}
                        customInput={
                          <CustomInputPicker
                            value={value}
                            onChange={onChange}
                            label={`Data de Inicío`}
                            error={Boolean(errors?.start_date)}
                            aria-describedby={`data-realiazacao`}
                            {...(errors?.start_date && {
                              helperText: 'Este campo é obrigatório'
                            })}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <IconButton>
                                    <IconifyIcon icon={'tabler:calendar'} />
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                        }
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    label='Dias de Gozo:'
                    required
                    fullWidth
                    type='number'
                    error={!!errors?.days}
                    placeholder={errors?.days?.message}
                    value={days}
                    onChange={event => handleValueChange(event)}

                    // {...register('days', { required: true })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name={`end_date`} // Use array notation for the name
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        locale='ptBR'
                        selected={value}
                        showYearDropdown
                        showMonthDropdown
                        disabled
                        dateFormat='dd/MM/yyyy'
                        onChange={date => onChange(date)}
                        placeholderText='DD/MM/AAAA'
                        customInput={
                          <CustomInputPicker
                            value={end_date}
                            onChange={onChange}
                            label={`Data de Término`} // Add index to label for each datepicker
                            error={Boolean(errors?.end_date)} // Check error for each datepicker
                            aria-describedby={`data-realiazacao`} // Add index to aria-describedby
                            {...(errors?.end_date && {
                              helperText: 'Este campo é obrigatório'
                            })}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <IconButton>
                                    <IconifyIcon icon={'tabler:calendar'} />
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                        }
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Controller
                    name='reason'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        label='Descrição dos Motivos'
                        required
                        multiline
                        minRows={5}
                        fullWidth
                        error={!!errors?.reason}
                        placeholder={errors?.reason?.message}
                        {...field}
                      />
                    )}
                  />
                </Grid>
                {/* <Grid item xs={2} sm={1}>
                      <IconButton
                        sx={{ border: 1, borderColor: 'red', mt: 4 }}
                        color='error'
                        onClick={() => handleRemoveFields(index)}
                      >
                        <IconifyIcon fontSize='1.25rem' icon='tabler:trash' />
                      </IconButton>
                    </Grid> */}

                {/* <Grid item xs={12} sm={12}>
                  <Button
                    variant='contained'
                    disabled={vacation_schedule.length > 1}
                    color='success'
                    onClick={handleAddFields}
                  >
                    Parcelar
                  </Button>
                </Grid> */}

                <Grid item xs={12} sm={8}>
                  <CustomAutocomplete
                    fullWidth
                    multiple
                    options={supervisorStaff}
                    getOptionLabel={option => `${option.name} ${option.surname}-${option.personal_email}` || ''}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        sx={{ mb: 4 }}
                        label='Dar a conhecer'
                        error={!!errors.supervisor}
                        helperText={errors.supervisor?.message}
                      />
                    )}
                    onChange={(_, selectedOptions) => {
                      const selectedIds = selectedOptions.map(option => option?.id || '')
                      setValue('supervisor', selectedIds || '')
                    }}
                  />
                </Grid>
                <Grid item xl={12} sm={6} xs={12}>
                  <FormControl>
                    <FormControlLabel
                      label='Notificar por email'
                      sx={errors.notify ? { color: 'error.main' } : null}
                      control={
                        <Checkbox
                          defaultChecked
                          sx={errors.notify ? { color: 'error.main' } : null}
                          {...register('notify')}
                        />
                      }
                    />
                  </FormControl>
                </Grid>
              </Fragment>
            ) : (
              <Grid item xs={12} sm={12}>
                <Alert sx={{ marginTop: 3 }} variant='filled' severity='error'>
                  Não possui um ano de trabalho, por isso não dispõe de férias!
                </Alert>
              </Grid>
            )}

            <Grid item xs={12} sm={12}>
              <Button type='submit' disabled={!isValid} sx={{ mr: 2 }} variant='contained'>
                Guardar
              </Button>
              <Button type='reset' color='secondary' variant='tonal'>
                Limpar
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

VacationRequestForm.acl = {
  action: 'create',
  subject: 'vacation-request'
}
