import { Button, Card, CardContent, CardHeader, Divider, Grid, IconButton, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import { getInitials } from 'src/@core/utils/get-initials'
import Link from 'next/link'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import DialogTransition from 'src/components/dialogs/DialogTransition'
import IconifyIcon from 'src/@core/components/icon'
import SidebarAddUser, { UserData } from './cadastro/AddUserDrawer'
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { firestore } from 'src/configs/firebaseConfig'
import { UserStaffData } from '../colaborador/cadastrar'
import { SelectiveData } from 'src/types/pages/userStaff'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import CustomAvatar from 'src/@core/components/mui/avatar'

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
export default function Users({}) {
  const [users, setUsers] = useState<UserData[]>([])
  const [staff, setStaff] = useState<UserStaffData[]>([])
  const [departments, setDepartments] = useState<SelectiveData[]>([])

  // const [roles, setRoles] = useState<RoleData[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const getData = async () => {
    setIsLoading(true)
    try {
      const usersArray: UserData[] = []
      const querySnapshot = await getDocs(collection(firestore, 'user'))
      querySnapshot.forEach(doc => {
        usersArray.push(doc.data() as UserData)
      })
      setUsers(usersArray)
    } catch (error) {
      toast.error('Erro ao solicitar dados!')
      console.log(error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      try {
        const userStaffArray: UserStaffData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'staff'))
        querySnapshot.forEach(doc => {
          // doc.data() is never undefined for query doc snapshots
          // console.log(doc.id, ' => ', doc.data());
          userStaffArray.push(doc.data() as UserStaffData)
        })
        setStaff(userStaffArray)
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
  //       const roleArray: RoleData[] = []
  //       const querySnapshot = await getDocs(collection(firestore, 'roles'))
  //       querySnapshot.forEach(doc => {
  //         roleArray.push(doc.data() as RoleData)
  //       })
  //       setRoles(roleArray)
  //       console.log(roleArray)
  //     } catch (error) {
  //       toast.error('Erro ao solicitar dados!')
  //       console.log(error)
  //     }
  //     setIsLoading(false)
  //   }
  //   getData()
  // }, [])

  useEffect(() => {
    const getData = async () => {
      try {
        const dtpsArray: SelectiveData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'departments'))

        querySnapshot.forEach(doc => {
          dtpsArray.push(doc.data() as SelectiveData)
        })
        setDepartments(dtpsArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
    }
    getData()
  }, [])

  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')

  const [addUserOpen, setAddUserOpen] = useState<boolean>(false)

  const toggleAddUserDrawer = () => setAddUserOpen(!addUserOpen)

  const handleClickDelete = (id: string) => {
    setSelectedId(id)
    console.log(selectedId)
    setDialogOpen(true)
  }

  const onConfirmDelete = async () => {
    // auth.(selectedId)
    //   .then(() => {

    const userId = users.find(user => user.staff === selectedId)!.id!
    deleteDoc(doc(firestore, 'user', userId))
      .then(() => {
        setStaff(prevStaff => prevStaff.filter(staff => staff.id !== selectedId))
        setDialogOpen(false)
        toast.success('Eliminou com sucesso!')
      })

      // })
      .catch(error => {
        console.log('Error deleting user:', error)
        toast.error('Houve um erro ao eliminar o usuario!')
      })
  }

  const onRefresh = async () => {
    await getData()
  }

  const filterStaff = staff.filter(stf => users.some(user => user.staff === stf.id))

  const columns: GridColDef[] = [
    {
      flex: 0.4,
      minWidth: 280,
      field: 'name',
      headerName: 'Nome ',
      renderCell: ({ row }: CellType) => {
        const { id, name, surname } = row

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
                {users.find(user => user.staff === id)?.corporate_email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },

    {
      flex: 0.2,
      field: 'role',
      headerName: 'Previlégio',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {users.find(user => user.staff === params.row.id)?.roleName}
        </Typography>
      )
    },

    {
      flex: 0.2,
      field: 'department',
      headerName: 'Departamento',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {departments.find(dpt => dpt.id === params.row.department)?.name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      field: 'contact1',
      headerName: 'Contacto',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.contact1}
        </Typography>
      )
    },

    {
      flex: 0.2,
      field: 'id',
      headerName: 'Acções',
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton color='error' onClick={() => handleClickDelete(params.row.id)}>
            <IconifyIcon fontSize='1.25rem' icon='tabler:trash' />
          </IconButton>
        </>
      )
    }
  ]

  return (
    <Card>
      <CardHeader title='Lista de Colaboradores' />
      <Divider sx={{ m: '0 !important' }} />
      {/* <TableHeader value={value} toggle={toggleAddUserDrawer} /> */}
      <Box
        sx={{
          py: 4,
          px: 6,
          rowGap: 2,
          columnGap: 4,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Button onClick={toggleAddUserDrawer} variant='contained' sx={{ '& svg': { mr: 2 } }}>
          <Icon fontSize='1.125rem' icon='tabler:plus' />
          Criar Usuário
        </Button>
        <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}></Box>
      </Box>
      <DialogTransition
        title='Restaurantes'
        description='Pretende Realmente Eliminar o Colaborador?'
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={onConfirmDelete}
      />
      <ModalProgressBar open={isLoading} />

      <CardContent>
        <Grid container spacing={5}>
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
          <SidebarAddUser refresh={onRefresh} users={users} open={addUserOpen} toggle={toggleAddUserDrawer} />
        </Grid>
      </CardContent>
    </Card>
  )
}
