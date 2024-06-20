import { Button, Card, CardContent, CardHeader, Divider, Grid, MenuItem, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { UserStaffData } from '../../colaborador/cadastrar'
import { useAuth } from 'src/hooks/useAuth'
import { firestore } from 'src/configs/firebaseConfig'
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { DataGrid, GridColDef, GridEditCellProps, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid'
import CustomChip from 'src/@core/components/mui/chip'
import { vacation_status } from 'src/constants/vacation'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import { DepartmentData, VacationRequestData } from 'src/types/pages/generalData'

const vacationAprovalSchema = z.object({
  staffId: z.string(),
  departmentId: z.string()
})

export type VacationAprovalData = z.infer<typeof vacationAprovalSchema>

export default function VacationAproval({}) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [currentStaf, setCurrentStaff] = useState<UserStaffData>()
  const [staff, setStaff] = useState<UserStaffData[]>([])

  const [departments, setDepartaments] = useState<DepartmentData[]>([])

  const [vacationRequest, setVacationRequest] = useState<VacationRequestData[]>([])
  const [editEnable, setEditEnable] = useState<boolean>(false)

  const { user } = useAuth()

  const {
    setValue,
    watch,
    formState: { errors }
  } = useForm<VacationAprovalData>({
    resolver: zodResolver(vacationAprovalSchema)
  })

  const { staffId, departmentId } = watch()

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)

      const docRef = doc(firestore, 'staff', user!.staffId)
      try {
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setCurrentStaff(docSnap.data() as UserStaffData)
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
  }, [user])

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
  //       const dptArray: SelectiveData[] = []
  //       const querySnapshot = await getDocs(collection(firestore, 'departments'))
  //       querySnapshot.forEach(doc => {
  //         dptArray.push(doc.data() as SelectiveData)
  //       })
  //       setDepartaments(dptArray)
  //     } catch (error) {
  //       toast.error('Erro ao solicitar dados!')
  //       console.log(error)
  //     }
  //     setIsLoading(false)
  //   }
  //   getData()
  // }, [currentStaf])

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
  }, [currentStaf, user])

  const setEditedValues = async (request: VacationRequestData, value: number) => {
    const currentVacationRequest = vacationRequest.find(
      vRequest =>
        vRequest.staffId === staffId &&
        vRequest.start_date === request.start_date &&
        vRequest.request_date === request.request_date
    )

    if (currentVacationRequest?.id) {
      const vacationRequestRef = doc(firestore, 'vacation_request', currentVacationRequest.id)
      try {
        setIsLoading(true)
        await updateDoc(vacationRequestRef, {
          ...currentVacationRequest,

          is_approved: value
        })
        toast.success('Atualizado com sucesso!')
        setIsLoading(false)
      } catch (error) {
        console.error(error)
        toast.error('Erro ao atualizar')
        setIsLoading(false)
      }
    }
  }
  const filterStaff = staff.filter(stf => stf.department === departmentId)
  const filterVacationResquests = vacationRequest.filter(vRequest => vRequest.staffId === staffId)

  const columns: GridColDef[] = [
    {
      flex: 0.2,
      minWidth: 100,
      field: 'request_date',
      headerName: 'Data de Início',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.request_date?.toDate().toLocaleDateString('pt-BR')}
        </Typography>
      )
    },

    {
      flex: 0.3,
      minWidth: 100,
      field: 'days',
      headerName: 'Dias',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.days}
        </Typography>
      )
    },
    {
      flex: 0.3,
      minWidth: 200,
      field: 'end_date',
      headerName: 'Data de Fim',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.end_date?.toDate().toLocaleDateString('pt-BR')}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 100,
      field: 'start_date',
      headerName: 'Data da Solicitação',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.start_date?.toDate().toLocaleDateString('pt-BR')}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 100,
      field: 'is_approved',
      headerName: 'Parecer',
      editable: editEnable,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.is_approved === 0 ? (
            <CustomChip rounded size='small' color='warning' label={vacation_status[0].label} />
          ) : params.row?.is_approved === 1 ? (
            <CustomChip rounded size='small' color='error' label={vacation_status[1].label} />
          ) : (
            <CustomChip rounded size='small' color='success' label={vacation_status[2].label} />
          )}
        </Typography>
      ),
      renderEditCell: (params: GridEditCellProps) => {
        return (
          <CustomTextField
            select
            fullWidth
            onChange={event => {
              const value = parseInt(event.target.value, 10)

              // Update the row data directly with the new value
              const updatedRow = {
                ...params.row,
                is_approved: value
              }

              // Update the state with the new row data
              const updatedRows = [...vacationRequest]
              const rowIndex = updatedRows.findIndex(row => row.id === params.id)
              updatedRows[rowIndex] = updatedRow
              setVacationRequest(updatedRows)

              // Call a function to handle the edited values
              setEditedValues(updatedRow, value)
            }}
            value={params.value}
          >
            {vacation_status.map(status => (
              <MenuItem key={status.id} value={status.id}>
                {status.label}
              </MenuItem>
            ))}
          </CustomTextField>
        )
      }
    }
  ]

  return (
    <Card>
      <CardHeader title='Solicitações de Férias' />
      <Divider />
      <ModalProgressBar open={isLoading} />
      <CardContent>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={6}>
            <CustomAutocomplete
              fullWidth
              options={departments}
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
          <Grid item xs={12} sm={6}>
            <CustomAutocomplete
              fullWidth
              options={filterStaff}
              getOptionLabel={option => `${option.name} ${option.surname}` || ''}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Colaborador'
                  error={!!errors.staffId}
                  helperText={errors.staffId?.message}
                />
              )}
              onChange={(_, selectedOption) => {
                setValue('staffId', selectedOption?.id || '')
              }}
            />
          </Grid>
          {staffId && (
            <Grid item xs={12} sm={12}>
              <Button
                onClick={() => setEditEnable(!editEnable)}
                variant='contained'
                color={editEnable ? 'secondary' : 'primary'}
              >
                {editEnable ? 'Desactivar Edição' : 'Activar Edição'}
              </Button>
            </Grid>
          )}
        </Grid>
      </CardContent>
      <CardContent>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={12}>
            <DataGrid
              autoHeight
              pagination
              rows={filterVacationResquests}
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
  )
}
