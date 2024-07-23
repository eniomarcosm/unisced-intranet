import React, { ChangeEvent, useEffect } from 'react'
import { Controller, FieldValues, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Card, Grid, InputAdornment } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import IconifyIcon from 'src/@core/components/icon'
import { Box } from '@mui/system'
import { CustomInputPicker } from 'src/components/forms/DatePickerHelpers'
import { getCurrentYearRemainingVacationDays, vacationDays } from 'src/pages/sca/ferias/solicitar'
import { UserStaffData } from 'src/pages/sca/colaborador/cadastrar'
import { AbsenceRequestData, VacationRequestData } from 'src/types/pages/generalData'

import DatePicker from 'react-datepicker'

// Define the Zod schema and types for form data
const vacationDateSchema = z.object({
  start_date: z.date(),
  end_date: z.date().optional(),
  days: z.number(),
  reason: z.string().optional()
})

type VacationDate = z.infer<typeof vacationDateSchema>

type DateModalFormProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FieldValues) => void // Update onSubmit prop type
  currentStaff?: UserStaffData
  values?: VacationRequestData
  vacationRequest: VacationRequestData[]
  absenceRequest: AbsenceRequestData[]
}

const VacationDateModalForm: React.FC<DateModalFormProps> = ({
  values,
  isOpen,
  currentStaff,
  absenceRequest,
  vacationRequest,
  onClose,
  onSubmit
}) => {
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch
  } = useForm<VacationDate>({
    resolver: zodResolver(vacationDateSchema),
    defaultValues: {}
  })

  const { start_date, end_date, days } = watch()

  useEffect(() => {
    const newValues = {
      ...values,
      start_date: values?.start_date.toDate(),
      end_date: values?.end_date.toDate()
    }

    reset(newValues)
  }, [reset, values])

  useEffect(() => {
    if (start_date) {
      setValue('end_date', start_date)

      setValue('days', values!.days)
    }
  }, [setValue, start_date, values])

  const filterAbsenceRequests = absenceRequest?.filter(aRequest => {
    const currentYear = new Date().getFullYear()

    return currentYear === aRequest?.request_date?.toDate().getFullYear()
  })

  const absencedDaysThisYear = filterAbsenceRequests?.reduce(
    (totalDays, obj) => totalDays + obj.human_resources.day_vacations,
    0
  )

  const remainingDays =
    getCurrentYearRemainingVacationDays(vacationDays(currentStaff?.admited_at?.toDate()), vacationRequest) -
      absencedDaysThisYear || 0

  const handleValueChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target

    const days = parseInt(value, 10) | 0
    const endDate = new Date(start_date)

    endDate.setDate(start_date?.getDate() + days)

    // const maxDays = vacationDays(currentStaff?.admited_at?.toDate()) || 0

    const newRemaing = remainingDays + values!.days

    console.log(remainingDays)

    if (days > newRemaing) {
      // setError(true)
      setValue('days', newRemaing)
    } else if (days < 0) {
      console.log('Hello')

      setValue('days', 0)
    } else {
      // setError(false)
      setValue('end_date', endDate)
      setValue('days', days)
    }
  }

  return (
    <Card>
      <Dialog open={isOpen} onClose={onClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Pass handleSubmit to onSubmit prop */}
          <DialogTitle id='customized-dialog-title' sx={{ p: 4 }}>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Typography variant='h6' component='span'>
                Actualização da Data de Férias
              </Typography>
              <IconButton aria-label='close' color='error' onClick={onClose}>
                <Icon icon='tabler:x' fontSize='1.25rem' />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ p: theme => theme.spacing(4) + ' !important' }}>
            <Grid container spacing={8} sx={{ pb: 8 }}>
              <Grid item xs={12} sm={12}>
                <Controller
                  name={'start_date'} // Use array notation for the name
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
                      customInput={
                        <CustomInputPicker
                          value={value}
                          onChange={onChange}
                          label={`Data de Inicío`}
                          error={Boolean(errors?.start_date)}
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
              <Grid item xs={12} sm={12}>
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
              <Grid item xs={12} sm={12}>
                <Controller
                  name={`end_date`}
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
                          label={`Data de Término`}
                          error={Boolean(errors.end_date)}
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
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: theme => theme.spacing(3) + ' !important' }}>
            <Button variant='contained' disabled={!isValid} type='submit'>
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Card>
  )
}

export default VacationDateModalForm
