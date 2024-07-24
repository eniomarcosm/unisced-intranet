import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Typography
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid'
import Link from 'next/link'
import { Controller, FieldValues, useForm } from 'react-hook-form'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { z } from 'zod'
import { UserStaffData } from 'src/pages/sca/colaborador/cadastrar'
import { getInitials } from 'src/@core/utils/get-initials'
import { useEffect, useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { firestore } from 'src/configs/firebaseConfig'
import toast from 'react-hot-toast'
import { VacationReservation } from 'src/types/pages/generalData'
import { AnualData } from 'src/pages/sca/configurar/sessaoanual'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import roles from 'src/constants/roles'

const marcacaoSchema = z.object({
  year: z.number(),
  month: z.number(),
  departmentId: z.string().optional(),
  third_request: z.boolean().default(false).optional(),
  staffId: z.string().optional()
})

export type MarcacaoData = z.infer<typeof marcacaoSchema>

const months = [
  { id: 1, name: 'Janeiro' },
  { id: 2, name: 'Fevereiro' },
  { id: 3, name: 'Março' },
  { id: 4, name: 'Abril' },
  { id: 5, name: 'Maio' },
  { id: 6, name: 'Junho' },
  { id: 7, name: 'Julho' },
  { id: 8, name: 'Agosto' },
  { id: 9, name: 'Setembro' },
  { id: 10, name: 'Outubro' },
  { id: 11, name: 'Novembro' },
  { id: 12, name: 'Dezembro' }
]

interface CellType {
  row: UserStaffData
}

const renderClient = (row: UserStaffData) => {
  if (row?.photoURL?.length) {
    return <CustomAvatar src={row.photoURL} sx={{ mr: 2.5, width: 38, height: 38 }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color='primary'
        sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
      >
        {getInitials(row.name)}
      </CustomAvatar>
    )
  }
}

export default function MarcarFerias({}) {
  const [staff, setStaff] = useState<UserStaffData[]>([])
  const [currentStaf, setCurrentStaff] = useState<UserStaffData>()
  const [vacationReservation, setVacationReservation] = useState<VacationReservation[]>([])

  const [anos, setAnos] = useState<AnualData[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    control,
    setValue,
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<MarcacaoData>({ resolver: zodResolver(marcacaoSchema) })

  const { departmentId, year, third_request } = watch()

  const { user } = useAuth()

  useEffect(() => {
    const getData = async () => {
      // setIsLoading(true)

      const docRef = doc(firestore, 'staff', user!.staffId)
      try {
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setCurrentStaff(docSnap.data() as UserStaffData)

          // if ([roles.sessionChief, roles.director, roles.rector, roles.technician].includes(user!.role)) {
          setValue('departmentId', docSnap.data().department)

          // }
        } else {
          console.log('No such document!')
        }
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }

      // setIsLoading(false)
    }

    getData()
  }, [user, setValue])

  useEffect(() => {
    const getData = async () => {
      // setIsLoading(true)

      try {
        const userStaffArray: UserStaffData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'staff'))
        querySnapshot.forEach(doc => {
          userStaffArray.push(doc.data() as UserStaffData)
        })
        console.log(userStaffArray)

        setStaff(userStaffArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }

      // setIsLoading(false)
    }
    getData()
  }, [])

  const getData = async () => {
    // setIsLoading(true)

    try {
      const vacationRequestArray: VacationReservation[] = []
      const querySnapshot = await getDocs(collection(firestore, 'vacation_reservation'))
      querySnapshot.forEach(doc => {
        vacationRequestArray.push(doc.data() as VacationReservation)
      })
      console.log(vacationRequestArray)

      setVacationReservation(vacationRequestArray)
    } catch (error) {
      toast.error('Erro ao solicitar dados!')
      console.log(error)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    const getData = async () => {
      try {
        const anosArray: AnualData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'vacation_years'))

        querySnapshot.forEach(doc => {
          anosArray.push(doc.data() as AnualData)
        })

        setAnos(anosArray.sort((a, b) => b.year - a.year))
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
    }

    getData()
  })

  const filterStaff = staff.filter(stf => stf.department === departmentId)

  const filteredReservations = vacationReservation.filter(reservation => reservation.year === year)

  const onSubmit = async (values: FieldValues) => {
    try {
      setIsLoading(true)
      const newRef = doc(collection(firestore, 'vacation_reservation'))

      await setDoc(newRef, {
        ...values,
        id: newRef.id,
        staffId: third_request ? values.staffId : currentStaf?.id
      })

      getData()
      toast.success('Atualizado com sucesso!')

      setIsLoading(false)
    } catch (error) {
      console.log(error)
      toast.error('Erro ao actualizar dados!')
      setIsLoading(false)
    }
  }

  const columns: GridColDef[] = [
    {
      flex: 0.3,
      minWidth: 260,
      field: 'name',
      headerName: 'Nome ',
      renderCell: ({ row }: CellType) => {
        const { id, name, surname, admited_at } = row

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography
                noWrap
                component={Link}
                href={`colaborador/${id}`}
                sx={{
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                {`${name} ${surname}`}
              </Typography>
              <Typography noWrap variant='body2' sx={{ color: 'text.disabled' }}>
                Admitido em: {admited_at?.toDate().toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Box>
        )
      }
    },

    {
      field: 'janeiro',
      minWidth: 20,
      headerName: 'Jan',
      renderCell: (params: GridRenderCellParams) => {
        const reservation = filteredReservations.find(
          reservation => reservation.staffId === params.row.id && reservation.month === 1
        )

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {reservation ? (
              <Box
                sx={{
                  bgcolor: '#28c76f',
                  width: 50,
                  height: 50
                }}
              ></Box>
            ) : (
              ''
            )}
          </Typography>
        )
      }
    },
    {
      field: 'feveiro',
      minWidth: 20,
      headerName: 'Fev',
      renderCell: (params: GridRenderCellParams) => {
        const reservation = filteredReservations.find(
          reservation => reservation.staffId === params.row.id && reservation.month === 2
        )

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {reservation ? (
              <Box
                sx={{
                  bgcolor: '#28c76f',
                  width: 50,
                  height: 50
                }}
              ></Box>
            ) : (
              ''
            )}
          </Typography>
        )
      }
    },
    {
      field: 'marco',
      minWidth: 20,
      headerName: 'Mar',
      renderCell: (params: GridRenderCellParams) => {
        const reservation = filteredReservations.find(
          reservation => reservation.staffId === params.row.id && reservation.month === 3
        )

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {reservation ? (
              <Box
                sx={{
                  bgcolor: '#28c76f',
                  width: 50,
                  height: 50
                }}
              ></Box>
            ) : (
              ''
            )}
          </Typography>
        )
      }
    },
    {
      field: 'abril',
      minWidth: 20,
      headerName: 'Abr',
      renderCell: (params: GridRenderCellParams) => {
        const reservation = filteredReservations.find(
          reservation => reservation.staffId === params.row.id && reservation.month === 4
        )

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {reservation ? (
              <Box
                sx={{
                  bgcolor: '#28c76f',
                  width: 50,
                  height: 50
                }}
              ></Box>
            ) : (
              ''
            )}
          </Typography>
        )
      }
    },
    {
      field: 'maio',
      minWidth: 20,
      headerName: 'May',
      renderCell: (params: GridRenderCellParams) => {
        const reservation = filteredReservations.find(
          reservation => reservation.staffId === params.row.id && reservation.month === 5
        )

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {reservation ? (
              <Box
                sx={{
                  bgcolor: '#28c76f',
                  width: 50,
                  height: 50
                }}
              ></Box>
            ) : (
              ''
            )}
          </Typography>
        )
      }
    },
    {
      field: 'junho',
      minWidth: 20,
      headerName: 'Jun',
      renderCell: (params: GridRenderCellParams) => {
        const reservation = filteredReservations.find(
          reservation => reservation.staffId === params.row.id && reservation.month === 6
        )

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {reservation ? (
              <Box
                sx={{
                  bgcolor: '#28c76f',
                  width: 50,
                  height: 50
                }}
              ></Box>
            ) : (
              ''
            )}
          </Typography>
        )
      }
    },
    {
      field: 'julho',
      minWidth: 20,
      headerName: 'Jul',
      renderCell: (params: GridRenderCellParams) => {
        const reservation = filteredReservations.find(
          reservation => reservation.staffId === params.row.id && reservation.month === 7
        )

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {reservation ? (
              <Box
                sx={{
                  bgcolor: '#28c76f',
                  width: 50,
                  height: 50
                }}
              ></Box>
            ) : (
              ''
            )}
          </Typography>
        )
      }
    },
    {
      field: 'agosto',
      minWidth: 20,
      headerName: 'Ago',
      renderCell: (params: GridRenderCellParams) => {
        const reservation = filteredReservations.find(
          reservation => reservation.staffId === params.row.id && reservation.month === 8
        )

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {reservation ? (
              <Box
                sx={{
                  bgcolor: '#28c76f',
                  width: 50,
                  height: 50
                }}
              ></Box>
            ) : (
              ''
            )}
          </Typography>
        )
      }
    },
    {
      field: 'setembro',
      minWidth: 20,
      headerName: 'Set',
      renderCell: (params: GridRenderCellParams) => {
        const reservation = filteredReservations.find(
          reservation => reservation.staffId === params.row.id && reservation.month === 9
        )

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {reservation ? (
              <Box
                sx={{
                  bgcolor: '#28c76f',
                  width: 50,
                  height: 50
                }}
              ></Box>
            ) : (
              ''
            )}
          </Typography>
        )
      }
    },
    {
      field: 'outubro',
      minWidth: 20,
      headerName: 'Out',
      renderCell: (params: GridRenderCellParams) => {
        const reservation = filteredReservations.find(
          reservation => reservation.staffId === params.row.id && reservation.month === 10
        )

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {reservation ? (
              <Box
                sx={{
                  bgcolor: '#28c76f',
                  width: 50,
                  height: 50
                }}
              ></Box>
            ) : (
              ''
            )}
          </Typography>
        )
      }
    },
    {
      field: 'nov',
      minWidth: 20,
      headerName: 'Nov',
      renderCell: (params: GridRenderCellParams) => {
        const reservation = filteredReservations.find(
          reservation => reservation.staffId === params.row.id && reservation.month === 11
        )

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {reservation ? (
              <Box
                sx={{
                  bgcolor: '#28c76f',
                  width: 50,
                  height: 50
                }}
              ></Box>
            ) : (
              ''
            )}
          </Typography>
        )
      }
    },
    {
      field: 'dezembro',
      minWidth: 20,
      headerName: 'Dez',
      renderCell: (params: GridRenderCellParams) => {
        const reservation = filteredReservations.find(
          reservation => reservation.staffId === params.row.id && reservation.month === 12
        )

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {reservation ? (
              <Box
                sx={{
                  bgcolor: '#28c76f',
                  width: 50,
                  height: 50
                }}
              ></Box>
            ) : (
              ''
            )}
          </Typography>
        )
      }
    }
  ]

  return (
    <>
      <div>{/* <VacationMap /> */}</div>
      <Card style={{ display: 'none' }}>
        <CardHeader title='Marcação Anual de Férias' />
        <Divider />
        <ModalProgressBar open={isLoading} />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='year'
                  control={control}
                  render={({ field }) => (
                    <CustomAutocomplete
                      fullWidth
                      options={anos}
                      value={anos?.find(option => option.year === field.value) || null}
                      getOptionLabel={option => `${option.year}`}
                      onChange={(_, selectedOptions) => {
                        field.onChange(selectedOptions ? selectedOptions.year : undefined)
                      }}
                      renderInput={params => (
                        <CustomTextField
                          required
                          {...params}
                          label='Ano'
                          error={!!errors.year}
                          helperText={errors.year?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='month'
                  control={control}
                  render={({ field }) => (
                    <CustomAutocomplete
                      fullWidth
                      options={months}
                      value={months?.find(option => option.id === field.value) || null}
                      getOptionLabel={option => `${option.name}`}
                      onChange={(_, selectedOptions) => {
                        field.onChange(selectedOptions ? selectedOptions.id : '')
                      }}
                      renderInput={params => (
                        <CustomTextField
                          required
                          {...params}
                          label='Mês'
                          error={!!errors.month}
                          helperText={errors.month?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              {roles.technician !== user?.role && (
                <Grid item xs={12} sm={12}>
                  <FormControl>
                    <FormControlLabel
                      label='Marcar férias para outro colaborador'
                      sx={errors.third_request ? { color: 'error.main' } : null}
                      control={
                        <Checkbox
                          color='success'
                          sx={errors.third_request ? { color: 'error.main' } : null}
                          {...register('third_request')}
                        />
                      }
                    />
                  </FormControl>
                </Grid>
              )}
              {third_request && (
                <Grid item xs={12} sm={8}>
                  <CustomAutocomplete
                    fullWidth
                    options={filterStaff}
                    getOptionLabel={option => `${option.name} ${option.surname}-${option.personal_email}` || ''}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        sx={{ mb: 4 }}
                        label='Dar a conhecer'
                        error={!!errors.staffId}
                        helperText={errors.staffId?.message}
                      />
                    )}
                    onChange={(_, option) => {
                      setValue('staffId', option?.id || '')
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={12}>
                <Button variant='contained' type='submit'>
                  Reservar
                </Button>
              </Grid>
              <Grid item xs={12} sm={12}>
                <DataGrid
                  autoHeight
                  pagination
                  rows={filterStaff}
                  disableDensitySelector
                  disableColumnFilter
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 10
                      }
                    }
                  }}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true
                    }
                  }}
                  pageSizeOptions={[10, 25, 50]}
                />
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

MarcarFerias.acl = {
  action: 'create',
  subject: 'vacation-marcation'
}
