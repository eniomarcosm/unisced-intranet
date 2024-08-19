import { Button, Card, CardContent, CardHeader, Divider, Grid, Typography } from '@mui/material'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { firestore } from 'src/configs/firebaseConfig'
import roles from 'src/constants/roles'
import { useAuth } from 'src/hooks/useAuth'
import { DepartmentData, SelectiveData, VacationReservation } from 'src/types/pages/generalData'
import { VacationAprovalHRData, vacationAprovalHRSchema } from '../solicitacao'
import { zodResolver } from '@hookform/resolvers/zod'
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid'
import { Box } from '@mui/system'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { UserStaffData } from 'src/pages/colaborador/cadastrar'
import { getInitials } from 'src/@core/utils/get-initials'
import Link from 'next/link'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import { AnualData } from 'src/pages/configurar/sessaoanual'
import IconifyIcon from 'src/@core/components/icon'

interface CellType {
  row: UserStaffData
}

const renderClient = (row: UserStaffData) => {
  if (row.photoURL?.length) {
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

// const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
//   <Tooltip {...props} classes={{ popper: className }} />
// ))({
//   [`& .${tooltipClasses.tooltip}`]: {
//     maxWidth: 200
//   }
// })

// const isApprovedAndInMonth = (vrequest: VacationRequestData, month: number) => {
//   const startMonth =
//     vrequest?.start_date instanceof Date ? vrequest?.start_date.getMonth() : vrequest?.start_date?.toDate?.().getMonth()
//   const endMonth =
//     vrequest?.end_date instanceof Date ? vrequest?.end_date.getMonth() : vrequest.end_date?.toDate?.().getMonth()

//   const isInMonth = startMonth === month || endMonth === month
//   const isApproved = vrequest?.director?.is_approved === 1

//   return isInMonth && isApproved
// }

// const isNotApprovedInMonth = (vrequest: VacationRequestData, month: number) => {
//   const startMonth =
//     vrequest?.start_date instanceof Date ? vrequest?.start_date.getMonth() : vrequest?.start_date?.toDate?.().getMonth()
//   const endMonth =
//     vrequest?.end_date instanceof Date ? vrequest?.end_date.getMonth() : vrequest.end_date?.toDate?.().getMonth()

//   const isInMonth = startMonth === month || endMonth === month

//   // const isApproved = vrequest?.ch?.is_approved === 0

//   return isInMonth
// }

export default function VacationMap({}) {
  const { user } = useAuth()
  const [organicUnit, setOrganicUnit] = useState<SelectiveData[]>([])
  const [departments, setDepartaments] = useState<DepartmentData[]>([])
  const [staff, setStaff] = useState<UserStaffData[]>([])
  const [vacationReservation, setVacationReservation] = useState<VacationReservation[]>([])
  const [anos, setAnos] = useState<AnualData[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    setValue,
    watch,
    formState: { errors }
  } = useForm<VacationAprovalHRData>({
    resolver: zodResolver(vacationAprovalHRSchema)
  })

  const { organic_unit, departmentId, year } = watch()

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

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)

      const docRef = doc(firestore, 'staff', user!.staffId)
      try {
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          if ([roles.sessionChief, roles.director, roles.rector, roles.technician].includes(user!.role)) {
            setValue('departmentId', docSnap.data().department)
          }
        } else {
          console.log('No such document!')
        }
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
      setIsLoading(false)
    }

    getData()
  }, [user, setValue])

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
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
      setIsLoading(false)
    }
    getData()
  }, [])

  useEffect(() => {
    const getData = async () => {
      try {
        const dataArray: SelectiveData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'organic_unit'))

        querySnapshot.forEach(doc => {
          dataArray.push(doc.data() as SelectiveData)
        })
        setOrganicUnit(dataArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
    }
    getData()
  }, [])

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      try {
        const dptArray: DepartmentData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'departments'))
        querySnapshot.forEach(doc => {
          dptArray.push(doc.data() as DepartmentData)
        })
        setDepartaments(dptArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
      setIsLoading(false)
    }
    getData()
  }, [])

  // useEffect(() => {
  //   const getData = async () => {
  //     setIsLoading(true)
  //     try {
  //       const vacationRequestArray: VacationRequestData[] = []
  //       const querySnapshot = await getDocs(query(collection(firestore, 'vacation_request')))
  //       querySnapshot.forEach(doc => {
  //         vacationRequestArray.push(doc.data() as VacationRequestData)
  //       })

  //       setVacationRequest(vacationRequestArray)
  //     } catch (error) {
  //       toast.error('Erro ao solicitar dados!')
  //       console.log(error)
  //     }
  //     setIsLoading(false)
  //   }
  //   getData()
  // }, [currentStaf, user])

  // const years = [...new Set(vacationRequest.map(request => new Date(request.start_date?.toDate()).getFullYear()))]

  const filterDepartmentos = departments.filter(dpt => dpt.organic_unit === organic_unit)

  const filterStaff = staff.filter(stf => stf.department === departmentId)

  const filteredReservations = vacationReservation.filter(reservation => reservation.year === year)

  // const filterVacationRequests = vacationRequest.filter(vRequest =>
  //   staff.some(
  //     stf =>
  //       stf.department === departmentId &&
  //       stf.id === vRequest.staffId &&
  //       year === new Date(vRequest?.start_date?.toDate()).getFullYear()
  //   )
  // )

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
    <Card>
      <CardHeader title='Mapa de Férias' />
      <Divider />
      <ModalProgressBar open={isLoading} />
      <CardContent>
        <Grid container spacing={5}>
          {[roles.humanResoursesChief, roles.admin].includes(user!.role) && (
            <>
              <Grid item xs={12} sm={4}>
                <CustomAutocomplete
                  fullWidth
                  options={organicUnit}
                  getOptionLabel={option => `${option.name}`}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label='Unidade Orgânica'
                      error={!!errors.organic_unit}
                      helperText={errors.organic_unit?.message}
                    />
                  )}
                  onChange={(_, selectedOption) => {
                    setValue('organic_unit', selectedOption?.id || '')
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <CustomAutocomplete
                  fullWidth
                  options={filterDepartmentos}
                  getOptionLabel={option => `${option.name}-${option.shortname}`}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label='Departamento'
                      error={!!errors.departmentId}
                      helperText={errors.departmentId?.message}
                    />
                  )}
                  onChange={(_, selectedOption) => {
                    setValue('departmentId', selectedOption?.id || '')
                  }}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={3}>
            <CustomAutocomplete
              fullWidth
              options={anos}
              getOptionLabel={option => `${option.year}`}
              renderInput={params => (
                <CustomTextField {...params} label='Ano' error={!!errors.year} helperText={errors.year?.message} />
              )}
              onChange={(_, selectedOption) => {
                setValue('year', selectedOption?.year || 0)
              }}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Button variant='contained' startIcon={<IconifyIcon icon='tabler:printer' />}>
              Imprimir
            </Button>
          </Grid>
        </Grid>
      </CardContent>
      <CardContent>
        <Grid container spacing={5}>
          <>
            <Grid item xs={12} sm={12}>
              <DataGrid
                autoHeight
                pagination
                rows={year !== 0 ? filterStaff : []}
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
          </>
        </Grid>
      </CardContent>
    </Card>
  )
}

VacationMap.acl = {
  action: 'create',
  subject: 'vacation-map'
}
