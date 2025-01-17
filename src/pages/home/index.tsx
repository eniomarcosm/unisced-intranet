// ** MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CustomChip from 'src/@core/components/mui/chip'
import { CardContent, CardHeader, Divider, IconButton, styled } from '@mui/material'
import Grid, { GridProps } from '@mui/material/Grid'
import { useAuth } from 'src/hooks/useAuth'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import { AbsenceRequestData, VacationRequestData } from 'src/types/pages/generalData'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { firestore } from 'src/configs/firebaseConfig'
import toast from 'react-hot-toast'
import IconifyIcon from 'src/@core/components/icon'
import Link from 'next/link'
import { vacation_status } from 'src/constants/vacation'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'

// import { getInitials } from 'src/@core/utils/get-initials'

const Home = ({}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [vacationRequest, setVacationRequest] = useState<VacationRequestData[]>([])
  const [absenceRequest, setAbsenceRequest] = useState<AbsenceRequestData[]>([])

  const { user } = useAuth()

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      try {
        const vacationRequestArray: VacationRequestData[] = []
        const querySnapshot = await getDocs(
          query(
            collection(firestore, 'vacation_request'),
            where('staffId', '==', user!.staffId),
            orderBy('request_date', 'desc')
          )
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

  const columns: GridColDef[] = [
    {
      flex: 0.2,
      minWidth: 100,
      field: 'id',
      headerName: 'Acções',
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton LinkComponent={Link} href={`/ferias/historico/${params.row.id}`} color='success'>
            <IconifyIcon fontSize='1.5rem' icon='tabler:eye' />
          </IconButton>
        </>
      )
    },
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
      flex: 0.3,
      minWidth: 120,
      field: 'start_date',
      headerName: 'Início',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.start_date?.toDate().toLocaleDateString('pt-BR')}
        </Typography>
      )
    },
    {
      flex: 0.3,
      minWidth: 120,
      field: 'end_date',
      headerName: 'Término',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.end_date?.toDate().toLocaleDateString('pt-BR')}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 50,
      field: 'days',
      headerName: 'Dias',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.days}
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
    }
  ]

  const columns2: GridColDef[] = [
    {
      flex: 0.2,
      minWidth: 100,
      field: 'id',
      headerName: 'Acções',
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton color='info' LinkComponent={Link} href={`/faltas/historico/${params.row.id}`}>
            <IconifyIcon fontSize='1.5rem' icon='tabler:eye' />
          </IconButton>
        </>
      )
    },
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
      flex: 0.3,
      minWidth: 120,
      field: 'start_date',
      headerName: 'Início',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.start_date?.toDate().toLocaleDateString('pt-BR')}
        </Typography>
      )
    },
    {
      flex: 0.3,
      minWidth: 120,
      field: 'end_date',
      headerName: 'Término',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.end_date?.toDate().toLocaleDateString('pt-BR')}
        </Typography>
      )
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
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <ModalProgressBar open={isLoading} />
          <Grid container spacing={6}>
            <StyledGrid item md={4} xs={12}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img width={300} height={176} alt='Welcome Avatar' src='/images/pages/home-baner.png' />
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
                <Typography sx={{ mb: 3.5, color: 'text.secondary' }}>Bem vindo de volta!</Typography>
                <Typography variant='h3' sx={{ mb: 2, color: '#c31d1d' }}>
                  {user?.fullName}
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 500, mb: 3 }}>
                  Você esta no Sistema Interno de Controlo de Abstinência da UnISCED
                </Typography>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
        <Card sx={{ mt: 5 }}>
          <CardHeader title='Minhas Solicitações de Férias Recentes' />
          <Divider sx={{ my: '0 !important' }} />
          <CardContent>
            <Grid item xs={12} sm={12}>
              <DataGrid
                autoHeight
                pagination
                rows={vacationRequest}
                disableDensitySelector
                disableColumnFilter
                disableRowSelectionOnClick
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 5
                    }
                  }
                }}
                pageSizeOptions={[5, 15, 50]}
              />
            </Grid>
          </CardContent>
        </Card>
        <Card sx={{ mt: 5 }}>
          <CardHeader title='Minhas Justifições de Faltas Recentes' />
          <Divider sx={{ my: '0 !important' }} />
          <CardContent>
            <Grid item xs={12} sm={12}>
              <DataGrid
                autoHeight
                pagination
                rows={absenceRequest}
                disableDensitySelector
                disableColumnFilter
                disableRowSelectionOnClick
                columns={columns2}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 5
                    }
                  }
                }}
                pageSizeOptions={[5, 15, 50]}
              />
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Home

Home.acl = {
  action: 'read',
  subject: 'home'
}
