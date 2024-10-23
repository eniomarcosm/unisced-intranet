import { Box, Card, CardContent, CardHeader, Divider, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'
import Link from 'next/link'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'

interface UserStaffData {
  id: string
  avatar: string | null
  title: string
  firstName: string
  lastName: string
  birthday: string | null
  gender: string | null
  phoneOne: string | null
  phoneTwo: string | null
  email: string
  address: string | null
  isProfileComplete: boolean
  role: string
  isNewEmployee: boolean
  isBirthdayGreeting: boolean
  employee: Employee
  lastLogin: string | null
  isFirstLogin: boolean
  isBirthDay: boolean
  officeContact: OfficeContact
}

interface Employee {
  id: string
  position: string
  pbx: string | null
  createdAt: string
  updatedAt: string
  department: string | null
}

interface OfficeContact {
  officePhoneOne: string
  officePhoneTwo: string
  officePhoneThree: string
}

interface CellType {
  row: UserStaffData
}

const renderClient = (row: UserStaffData) => {
  if (row.avatar?.length) {
    return <CustomAvatar src={row.avatar} sx={{ mr: 2.5, width: 38, height: 38 }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color='primary'
        sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
      >
        {getInitials(row.firstName)}
      </CustomAvatar>
    )
  }
}
export default function Colaboradores({}) {
  const [staff, setStaff] = useState<UserStaffData[]>([])

  // const [departments, setDepartments] = useState<SelectiveData[]>([])
  // const [cargos, setCargos] = useState<SelectiveData[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  // const [profCategories, setProfCategories] = useState<SelectiveData[]>([])
  // const authProvider = useAuth()

  // useEffect(() => {
  //   const getData = async () => {
  //     setIsLoading(true)
  //     try {
  //       const userStaffArray: UserStaffData[] = []
  //       const querySnapshot = await getDocs(collection(firestore, 'staff'))
  //       querySnapshot.forEach(doc => {
  //         // doc.data() is never undefined for query doc snapshots
  //         // console.log(doc.id, ' => ', doc.data());
  //         userStaffArray.push(doc.data() as UserStaffData)
  //       })
  //       console.log(userStaffArray)

  //       setStaff(userStaffArray)
  //     } catch (error) {
  //       toast.error('Erro ao solicitar dados!')
  //       console.log(error)
  //     }
  //     setIsLoading(false)
  //   }
  //   getData()
  // }, [])

  // useEffect(() => {
  //   const getData = async () => {
  //     try {
  //       const profCategoriesArray: SelectiveData[] = []
  //       const querySnapshot = await getDocs(collection(firestore, 'job_position'))

  //       querySnapshot.forEach(doc => {
  //         profCategoriesArray.push(doc.data() as SelectiveData)
  //       })
  //       setCargos(profCategoriesArray)
  //     } catch (error) {
  //       toast.error('Erro ao solicitar dados!')
  //       console.log(error)
  //     }
  //   }
  //   getData()
  // }, [])

  // useEffect(() => {
  //   const getData = async () => {
  //     try {
  //       const departmentArray: SelectiveData[] = []
  //       const querySnapshot = await getDocs(collection(firestore, 'departments'))
  //       querySnapshot.forEach(doc => {
  //         departmentArray.push(doc.data() as SelectiveData)
  //       })
  //       setDepartments(departmentArray)
  //     } catch (error) {
  //       toast.error('Erro ao solicitar dados!')
  //       console.log(error)
  //     }
  //   }
  //   getData()
  // }, [])

  // useEffect(() => {
  //   const getData = async () => {
  //     try {
  //       const setProfCategoriesArray: SelectiveData[] = []
  //       const querySnapshot = await getDocs(collection(firestore, 'prof_category'))
  //       querySnapshot.forEach(doc => {
  //         setProfCategoriesArray.push(doc.data() as SelectiveData)
  //       })
  //       setProfCategories(setProfCategoriesArray)
  //     } catch (error) {
  //       toast.error('Erro ao solicitar dados!')
  //       console.log(error)
  //     }
  //   }
  //   getData()
  // }, [])

  // const [isDialogOpen, setDialogOpen] = useState(false)
  // const [selectedId, setSelectedId] = useState<string>('')

  // const handleClickDelete = (id: string) => {
  //   setSelectedId(id)
  //   console.log(selectedId)
  //   setDialogOpen(true)
  // }

  // const onConfirmDelete = async () => {
  //   // auth.(selectedId)
  //   //   .then(() => {
  //   deleteDoc(doc(firestore, 'staff', selectedId))
  //     .then(() => {
  //       setStaff(prevStaff => prevStaff.filter(user => user.id !== selectedId))
  //       setDialogOpen(false)
  //       toast.success('Eliminou com sucesso!')
  //     })

  //     // })
  //     .catch(error => {
  //       console.log('Error deleting user:', error)
  //       toast.error('Houve um erro ao eliminar o usuario!')
  //     })
  // }

  // const filterUsers = [roles.admin, roles.deliver].includes(authProvider.user!.role)
  // ? users
  // : users.filter(user => user.restaurant === authProvider.user?.restaurant)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('http://192.14.0.150:3001/open-users?limit=300')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        setStaff(data.users)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const columns: GridColDef[] = [
    {
      flex: 0.3,
      minWidth: 200,
      field: 'name',
      headerName: 'Nome ',
      renderCell: ({ row }: CellType) => {
        const { id, lastName, firstName, email } = row

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
                {`${firstName} ${lastName}`}
              </Typography>
              <Typography noWrap variant='body2' sx={{ color: 'text.disabled' }}>
                {email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },

    {
      flex: 0.2,
      field: 'position',
      minWidth: 250,

      headerName: 'Departamento',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {/* {departments.find(dpt => dpt.id === params.row.department)?.name} */}
          {params.row.employee.position}
        </Typography>
      )
    },

    {
      flex: 0.2,
      field: 'admited_at',
      minWidth: 120,

      headerName: 'Data de Admissão',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.admited_at?.toDate().toLocaleDateString('pt-BR')}
        </Typography>
      )
    }

    // {
    //   flex: 0.2,
    //   minWidth: 120,
    //   field: 'job_position',
    //   headerName: 'Cargo',
    //   renderCell: (params: GridRenderCellParams) => (
    //     <Typography variant='body2' sx={{ color: 'text.primary' }}>
    //       {cargos.find(cargo => cargo.id === params.row.job_position)?.name}
    //     </Typography>
    //   )
    // },

    // {
    //   flex: 0.2,
    //   field: 'contact1',
    //   headerName: 'Contacto',
    //   renderCell: (params: GridRenderCellParams) => (
    //     <Typography variant='body2' sx={{ color: 'text.primary' }}>
    //       {params.row.contact1}
    //     </Typography>
    //   )
    // },

    // {
    //   flex: 0.2,
    //   field: 'id',
    //   headerName: 'Acções',
    //   renderCell: (params: GridRenderCellParams) => (
    //     <>
    //       <IconButton color='error' onClick={() => handleClickDelete(params.row.id)}>
    //         <IconifyIcon fontSize='1.25rem' icon='tabler:trash' />
    //       </IconButton>
    //     </>
    //   )
    // }
  ]

  return (
    <Card>
      <CardHeader title='Lista de Colaboradores' />
      <Divider />
      {/* <DialogTransition
        title='Restaurantes'
        description='Pretende Realmente Eliminar o Colaborador?'
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={onConfirmDelete}
      /> */}
      <ModalProgressBar open={isLoading} />

      <CardContent></CardContent>
      <DataGrid
        autoHeight
        pagination
        rows={staff}
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
    </Card>
  )
}

Colaboradores.acl = {
  action: 'read',
  subject: 'staff'
}
