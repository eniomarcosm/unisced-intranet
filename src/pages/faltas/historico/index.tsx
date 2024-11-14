import { Card, CardContent, CardHeader, Divider, Grid, IconButton, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import CustomChip from 'src/@core/components/mui/chip'
import { AbsenceRequestData } from 'src/types/pages/generalData'
import { firestore } from 'src/configs/firebaseConfig'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { vacation_status } from 'src/constants/vacation'
import IconifyIcon from 'src/@core/components/icon'
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import { Box } from '@mui/system'
import CustomAvatar from 'src/@core/components/mui/avatar'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import Link from 'next/link'

export default function HistoricoFaltas({}) {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [absenceRequest, setAbsenceRequest] = useState<AbsenceRequestData[]>([])

  const { user } = useAuth()

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

  const getStatusCount = (index: number) => {
    let count = 0

    absenceRequest.forEach(request => {
      if (request?.director?.is_approved === index) {
        count++
      }
    })

    return count
  }

  const columns: GridColDef[] = [
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
    {
      flex: 0.2,
      minWidth: 100,
      field: 'is_approved',
      headerName: 'Estado',
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
    <>
      <ModalProgressBar open={isLoading} />
      <ApexChartWrapper>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ gap: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant='h5' sx={{ mb: 0.5 }}>
                    {absenceRequest.length}
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
            <Grid item xs={12} sm={12}>
              <DataGrid
                autoHeight
                pagination
                rows={absenceRequest}
                disableDensitySelector
                disableColumnFilter
                disableRowSelectionOnClick
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

HistoricoFaltas.acl = {
  action: 'read',
  subject: 'absence-history'
}
