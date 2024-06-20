import { Card, CardContent, CardHeader, Divider, Grid, IconButton, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import CustomChip from 'src/@core/components/mui/chip'
import { DepartmentData, SelectiveData, AbsenceRequestData } from 'src/types/pages/generalData'
import { firestore } from 'src/configs/firebaseConfig'
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { vacation_status } from 'src/constants/vacation'
import IconifyIcon from 'src/@core/components/icon'
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import { Box } from '@mui/system'
import CustomAvatar from 'src/@core/components/mui/avatar'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { UserStaffData } from 'src/pages/colaborador/cadastrar'
import roles from 'src/constants/roles'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { VacationAprovalHRData, vacationAprovalHRSchema } from 'src/pages/ferias/solicitacao'
import { zodResolver } from '@hookform/resolvers/zod'
import { getInitials } from 'src/@core/utils/get-initials'
import DialogTransition from 'src/components/dialogs/DialogTransition'

interface CellType {
  row: AbsenceRequestData
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

export default function SolicitacaoFaltas({}) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [staff, setStaff] = useState<UserStaffData[]>([])
  const [currentStaf, setCurrentStaff] = useState<UserStaffData>()

  const [absenceRequest, setAbsenceRequest] = useState<AbsenceRequestData[]>([])
  const [departments, setDepartaments] = useState<DepartmentData[]>([])
  const [organicUnit, setOrganicUnit] = useState<SelectiveData[]>([])

  const { user } = useAuth()

  const {
    setValue,
    watch,
    formState: { errors }
  } = useForm<VacationAprovalHRData>({
    resolver: zodResolver(vacationAprovalHRSchema)
  })

  const { departmentId, year, organic_unit } = watch()

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      try {
        const staffArray: UserStaffData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'staff'))
        querySnapshot.forEach(doc => {
          staffArray.push(doc.data() as UserStaffData)
        })
        setStaff(staffArray)
        console.log(staffArray)
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
      setIsLoading(true)

      const docRef = doc(firestore, 'staff', user!.staffId)
      try {
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setCurrentStaff(docSnap.data() as UserStaffData)
          if ([roles.sessionChief, roles.director, roles.rector].includes(user!.role)) {
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
        const absenceRequestArray: AbsenceRequestData[] = []
        const querySnapshot = await getDocs(
          query(collection(firestore, 'absence_justification'), orderBy('request_date', 'desc'))
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
  }, [currentStaf, user])

  useEffect(() => {
    const getData = async () => {
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
    }
    getData()
  }, [])

  const years = [...new Set(absenceRequest.map(request => new Date(request.request_date?.toDate()).getFullYear()))]

  // const filterAbsenceRequests = absenceRequest.filter(aRequest =>
  //   staff.some(
  //     stf =>
  //       stf.department === departmentId &&
  //       stf.id === aRequest.staffId &&
  //       year === new Date(aRequest?.start_date?.toDate()).getFullYear()
  //   )
  // )

  const filterAbsenceRequests = absenceRequest.filter(aRequest => {
    const requestYear = new Date(aRequest.start_date?.toDate()).getFullYear()

    return (
      (departmentId ? staff.some(stf => stf.department === departmentId && stf.id === aRequest.staffId) : true) &&
      (year ? year === requestYear : true)
    )
  })

  const filterDepartmentos = departments.filter(dpt => dpt.organic_unit === organic_unit)

  const getStatusCount = (index: number) => {
    let count = 0

    filterAbsenceRequests.forEach(request => {
      if (request?.director?.is_approved === index) {
        count++
      }

      if (request?.human_resources?.is_approved === index) {
        count++
      }

      if (request?.superior?.is_approved === index) {
        count++
      }

      if (request?.human_resources?.is_approved === undefined) {
        count++
      }
    })

    return count
  }

  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')

  const handleClickDelete = (id: string) => {
    setSelectedId(id)
    console.log(selectedId)
    setDialogOpen(true)
  }

  const onConfirmDelete = async () => {
    deleteDoc(doc(firestore, 'absence_justification', selectedId))
      .then(() => {
        setAbsenceRequest(prevAbsences => prevAbsences.filter(absence => absence.id !== selectedId))
        setDialogOpen(false)
        toast.success('Eliminou com sucesso!')
      })
      .catch(error => {
        console.error(error)
        toast.error('Houve um erro ao eliminar o prato!')
      })
  }

  const columns: GridColDef[] = [
    {
      flex: 0.4,
      minWidth: 280,
      field: 'name',
      headerName: 'Nome ',
      renderCell: ({ row }: CellType) => {
        const { id, staffId } = row

        // const { id, name, surname } = staff

        const currentWorker = staff.find(stf => stf.id === staffId)!

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(currentWorker)}
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
                {`${currentWorker?.name} ${currentWorker?.surname}`}
              </Typography>
              <Typography noWrap variant='body2' sx={{ color: 'text.disabled' }}>
                Admitido em: {currentWorker?.admited_at?.toDate().toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Box>
        )
      }
    },

    // {
    //   flex: 0.2,
    //   minWidth: 50,
    //   field: 'days',
    //   headerName: 'Dias',
    //   renderCell: (params: GridRenderCellParams) => (
    //     <Typography variant='body2' sx={{ color: 'text.primary' }}>
    //       {params.row.days}
    //     </Typography>
    //   )
    // },
    {
      flex: 0.3,
      minWidth: 120,
      field: 'request_date',
      headerName: 'Data de Solicitação',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.request_date?.toDate().toLocaleDateString('pt-BR')}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 100,
      field: 'is_approved_rh',
      headerName: 'Superior',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.superior?.is_approved === 1 ? (
            <CustomChip rounded size='small' color='success' label={vacation_status[1].label} />
          ) : params.row?.superior?.is_approved === 2 ? (
            <CustomChip rounded size='small' color='error' label={vacation_status[2].label} />
          ) : (
            <CustomChip rounded size='small' color='warning' label={vacation_status[0].label} />
          )}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 100,
      field: 'is_aproved_boss',
      headerName: 'RH',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.human_resources?.is_approved === 1 ? (
            <CustomChip rounded size='small' color='success' label={vacation_status[1].label} />
          ) : params.row?.human_resources?.is_approved === 2 ? (
            <CustomChip rounded size='small' color='error' label={vacation_status[2].label} />
          ) : (
            <CustomChip rounded size='small' color='warning' label={vacation_status[0].label} />
          )}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 100,
      field: 'is_approved',
      headerName: 'Direcção',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.director?.is_approved === 1 ? (
            <CustomChip rounded size='small' color='success' label={vacation_status[1].label} />
          ) : params.row?.director?.is_approved === 2 ? (
            <CustomChip rounded size='small' color='error' label={vacation_status[2].label} />
          ) : (
            <CustomChip rounded size='small' color='warning' label={vacation_status[0].label} />
          )}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 100,
      field: 'id',
      headerName: 'Acções',
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton color='info' LinkComponent={Link} href={`/faltas/solicitacao/${params.row.id}`}>
            <IconifyIcon fontSize='1.5rem' icon='tabler:pencil-plus' />
          </IconButton>
          {[roles.humanResoursesChief, roles.admin].includes(user!.role) ? (
            <IconButton color='error' onClick={() => handleClickDelete(params.row.id)}>
              <IconifyIcon fontSize='1.5rem' icon='tabler:trash' />
            </IconButton>
          ) : (
            ''
          )}
        </>
      )
    }
  ]

  return (
    <>
      <DialogTransition
        title='Solicitações de Faltas'
        description='Pretende Realmente Eliminar a Solicitação?'
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={onConfirmDelete}
      />
      <ModalProgressBar open={isLoading} />
      <ApexChartWrapper>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ gap: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant='h5' sx={{ mb: 0.5 }}>
                    {filterAbsenceRequests.length}
                  </Typography>
                  <Typography variant='body2'>Solicitações</Typography>
                </Box>
                <CustomAvatar skin='light' color='info' sx={{ width: 45, height: 45 }}>
                  <IconifyIcon icon='tabler:user-square' fontSize='1.32rem' />
                </CustomAvatar>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ gap: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant='h5' sx={{ mb: 0.5 }}>
                    {getStatusCount(1)}
                  </Typography>
                  <Typography variant='body2'>Aprovadas</Typography>
                </Box>
                <CustomAvatar skin='light' color='success' sx={{ width: 45, height: 45 }}>
                  <IconifyIcon icon='tabler:hourglass' fontSize='1.32rem' />
                </CustomAvatar>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ gap: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant='h5' sx={{ mb: 0.5 }}>
                    {getStatusCount(0)}
                  </Typography>
                  <Typography variant='body2'>Pendentes</Typography>
                </Box>
                <CustomAvatar skin='light' color='warning' sx={{ width: 45, height: 45 }}>
                  <IconifyIcon icon='tabler:hourglass-low' fontSize='1.32rem' />
                </CustomAvatar>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ gap: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant='h5' sx={{ mb: 0.5 }}>
                    {getStatusCount(2)}
                  </Typography>
                  <Typography variant='body2'>Reprovados</Typography>
                </Box>
                <CustomAvatar skin='light' color='error' sx={{ width: 45, height: 45 }}>
                  <IconifyIcon icon='tabler:hourglass-off' fontSize='1.32rem' />
                </CustomAvatar>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </ApexChartWrapper>

      <Card sx={{ mt: 5 }}>
        <CardHeader title='Histórico de Justificação de Faltas' />
        <Divider sx={{ my: '0 !important' }} />
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
                options={years}
                getOptionLabel={option => `${option}`}
                renderInput={params => (
                  <CustomTextField {...params} label='Ano' error={!!errors.year} helperText={errors.year?.message} />
                )}
                onChange={(_, selectedOption) => {
                  setValue('year', selectedOption || 0)
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={12}>
              <DataGrid
                autoHeight
                pagination
                rows={filterAbsenceRequests}
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
        </CardContent>
      </Card>
    </>
  )
}

SolicitacaoFaltas.acl = {
  action: 'read',
  subject: 'absence-response'
}
