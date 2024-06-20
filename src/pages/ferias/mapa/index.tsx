import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Tooltip,
  TooltipProps,
  Typography,
  styled,
  tooltipClasses
} from '@mui/material'
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { firestore } from 'src/configs/firebaseConfig'
import roles from 'src/constants/roles'
import { useAuth } from 'src/hooks/useAuth'
import { DepartmentData, SelectiveData, VacationRequestData } from 'src/types/pages/generalData'
import { VacationAprovalHRData, vacationAprovalHRSchema } from '../solicitacao'
import { zodResolver } from '@hookform/resolvers/zod'
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid'
import { Box } from '@mui/system'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { UserStaffData } from 'src/pages/colaborador/cadastrar'
import { getInitials } from 'src/@core/utils/get-initials'
import Link from 'next/link'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'

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

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 200
  }
})

const isApprovedAndInMonth = (vrequest: VacationRequestData, month: number) => {
  const startMonth =
    vrequest?.start_date instanceof Date ? vrequest?.start_date.getMonth() : vrequest?.start_date?.toDate?.().getMonth()
  const endMonth =
    vrequest?.end_date instanceof Date ? vrequest?.end_date.getMonth() : vrequest.end_date?.toDate?.().getMonth()

  const isInMonth = startMonth === month || endMonth === month
  const isApproved = vrequest?.director?.is_approved === 1

  return isInMonth && isApproved
}

const isNotApprovedInMonth = (vrequest: VacationRequestData, month: number) => {
  const startMonth =
    vrequest?.start_date instanceof Date ? vrequest?.start_date.getMonth() : vrequest?.start_date?.toDate?.().getMonth()
  const endMonth =
    vrequest?.end_date instanceof Date ? vrequest?.end_date.getMonth() : vrequest.end_date?.toDate?.().getMonth()

  const isInMonth = startMonth === month || endMonth === month

  // const isApproved = vrequest?.ch?.is_approved === 0

  return isInMonth
}

export default function VacationMap({}) {
  const { user } = useAuth()
  const [organicUnit, setOrganicUnit] = useState<SelectiveData[]>([])
  const [departments, setDepartaments] = useState<DepartmentData[]>([])
  const [vacationRequest, setVacationRequest] = useState<VacationRequestData[]>([])
  const [staff, setStaff] = useState<UserStaffData[]>([])
  const [currentStaf, setCurrentStaff] = useState<UserStaffData>()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    setValue,
    watch,
    formState: { errors }
  } = useForm<VacationAprovalHRData>({
    resolver: zodResolver(vacationAprovalHRSchema)
  })

  const { organic_unit, departmentId, year } = watch()

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)

      const docRef = doc(firestore, 'staff', user!.staffId)
      try {
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setCurrentStaff(docSnap.data() as UserStaffData)
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

  console.log(currentStaf, departmentId)

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

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      try {
        const vacationRequestArray: VacationRequestData[] = []
        const querySnapshot = await getDocs(query(collection(firestore, 'vacation_request')))
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

  const years = [...new Set(vacationRequest.map(request => new Date(request.start_date?.toDate()).getFullYear()))]

  const filterDepartmentos = departments.filter(dpt => dpt.organic_unit === organic_unit)

  const filterStaff = staff.filter(stf => stf.department === departmentId)

  const filterVacationRequests = vacationRequest.filter(vRequest =>
    staff.some(
      stf =>
        stf.department === departmentId &&
        stf.id === vRequest.staffId &&
        year === new Date(vRequest?.start_date?.toDate()).getFullYear()
    )
  )

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
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {filterVacationRequests
            .filter(dvR => dvR.staffId === params.row.id)
            .map((vrequest, index) => {
              if (isApprovedAndInMonth(vrequest, 0)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#28c76f',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              } else if (isNotApprovedInMonth(vrequest, 0)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#ff9f43',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              }

              return ''
            })}
        </Typography>
      )
    },
    {
      field: 'fevereiro',
      minWidth: 20,
      headerName: 'Fev',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {filterVacationRequests
            .filter(dvR => dvR.staffId === params.row.id)
            .map((vrequest, index) => {
              if (isApprovedAndInMonth(vrequest, 1)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#28c76f',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              } else if (isNotApprovedInMonth(vrequest, 1)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#ff9f43',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              }

              return ''
            })}
        </Typography>
      )
    },
    {
      field: 'marco',
      minWidth: 20,
      headerName: 'Mar',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {filterVacationRequests
            .filter(dvR => dvR.staffId === params.row.id)
            .map((vrequest, index) => {
              if (isApprovedAndInMonth(vrequest, 2)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#28c76f',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              } else if (isNotApprovedInMonth(vrequest, 2)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#ff9f43',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              }

              return ''
            })}
        </Typography>
      )
    },
    {
      field: 'abril',
      minWidth: 20,
      headerName: 'Abr',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {filterVacationRequests
            .filter(dvR => dvR.staffId === params.row.id)
            .map((vrequest, index) => {
              if (isApprovedAndInMonth(vrequest, 3)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#28c76f',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              } else if (isNotApprovedInMonth(vrequest, 3)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#ff9f43',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              }

              return ''
            })}
        </Typography>
      )
    },
    {
      field: 'maio',
      minWidth: 20,
      headerName: 'Mai',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {filterVacationRequests
            .filter(dvR => dvR.staffId === params.row.id)
            .map((vrequest, index) => {
              if (isApprovedAndInMonth(vrequest, 4)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#28c76f',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              } else if (isNotApprovedInMonth(vrequest, 4)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#ff9f43',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              }

              return ''
            })}
        </Typography>
      )
    },
    {
      field: 'junho',
      minWidth: 20,
      headerName: 'Jun',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {filterVacationRequests
            .filter(dvR => dvR.staffId === params.row.id)
            .map((vrequest, index) => {
              if (isApprovedAndInMonth(vrequest, 5)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#28c76f',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              } else if (isNotApprovedInMonth(vrequest, 5)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#ff9f43',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              }

              return ''
            })}
        </Typography>
      )
    },
    {
      field: 'julho',
      minWidth: 20,
      headerName: 'Jul',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {filterVacationRequests
            .filter(dvR => dvR.staffId === params.row.id)
            .map((vrequest, index) => {
              if (isApprovedAndInMonth(vrequest, 6)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#28c76f',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              } else if (isNotApprovedInMonth(vrequest, 6)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#ff9f43',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              }

              return ''
            })}
        </Typography>
      )
    },
    {
      field: 'agosto',
      minWidth: 20,
      headerName: 'Ago',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {filterVacationRequests
            .filter(dvR => dvR.staffId === params.row.id)
            .map((vrequest, index) => {
              if (isApprovedAndInMonth(vrequest, 7)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#28c76f',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              } else if (isNotApprovedInMonth(vrequest, 7)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#ff9f43',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              }

              return ''
            })}
        </Typography>
      )
    },
    {
      field: 'setembro',
      minWidth: 20,
      headerName: 'Set',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {filterVacationRequests
            .filter(dvR => dvR.staffId === params.row.id)
            .map((vrequest, index) => {
              if (isApprovedAndInMonth(vrequest, 8)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#28c76f',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              } else if (isNotApprovedInMonth(vrequest, 8)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#ff9f43',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              }

              return ''
            })}
        </Typography>
      )
    },
    {
      field: 'outubro',
      minWidth: 20,
      headerName: 'Out',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {filterVacationRequests
            .filter(dvR => dvR.staffId === params.row.id)
            .map((vrequest, index) => {
              if (isApprovedAndInMonth(vrequest, 9)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#28c76f',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              } else if (isNotApprovedInMonth(vrequest, 9)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#ff9f43',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              }

              return ''
            })}
        </Typography>
      )
    },
    {
      field: 'novembro',
      minWidth: 20,
      headerName: 'Nov',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {filterVacationRequests
            .filter(dvR => dvR.staffId === params.row.id)
            .map((vrequest, index) => {
              if (isApprovedAndInMonth(vrequest, 10)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#28c76f',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              } else if (isNotApprovedInMonth(vrequest, 10)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#ff9f43',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              }

              return ''
            })}
        </Typography>
      )
    },
    {
      field: 'dezembro',
      minWidth: 20,
      headerName: 'Dez',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {filterVacationRequests
            .filter(dvR => dvR.staffId === params.row.id)
            .map((vrequest, index) => {
              if (isApprovedAndInMonth(vrequest, 11)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#28c76f',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              } else if (isNotApprovedInMonth(vrequest, 11)) {
                return (
                  <CustomWidthTooltip
                    key={index}
                    title={`Início: ${vrequest.start_date?.toDate().toLocaleDateString('pt-BR')}
                      Término: ${vrequest.end_date?.toDate().toLocaleDateString('pt-BR')}`}
                  >
                    <Box
                      sx={{
                        bgcolor: '#ff9f43',
                        width: 50,
                        height: 50
                      }}
                    ></Box>
                  </CustomWidthTooltip>
                )
              }

              return ''
            })}
        </Typography>
      )
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
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'inline-flex', paddingInline: 2, marginInline: 2 }}>
              <Typography sx={{ paddingRight: 2, fontWeight: 'bold' }}>Legenda:</Typography>
              <Box sx={{ paddingRight: 2 }}>
                <Chip label='Confirmada' color='success' />
              </Box>
              <Box>
                <Chip label='Solicitada' color='warning' />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      <CardContent>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={12}>
            {year && (
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
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

VacationMap.acl = {
  action: 'create',
  subject: 'vacation-map'
}
