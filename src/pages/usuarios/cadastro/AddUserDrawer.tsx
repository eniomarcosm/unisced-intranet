// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import toast from 'react-hot-toast'
import { UserStaffData } from 'src/pages/colaborador/cadastrar'
import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
import { firestore, auth } from 'src/configs/firebaseConfig'
import { InputAdornment } from '@mui/material'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'

interface SidebarAddUserType {
  open: boolean
  toggle: () => void
  users: UserData[]
  refresh: () => void
}

const Header = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const schema = z
  .object({
    id: z.string().optional(),
    corporate_email: z.string().email(),
    password: z.string(),
    confirmPassword: z.string(),
    role: z.string(),
    roleName: z.string().optional(),
    staff: z.string(),
    department: z.string().optional(),
    createdBy: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'A senha de confirmação diferente com a senha!'
  })

export type UserData = z.infer<typeof schema>

const defaultValues = {
  id: '',
  corporate_email: '',
  password: '',
  confirmPassword: '',
  staff: '',
  role: '',
  department: '',
  createdBy: 'hello'
}

export interface RoleData {
  id: string
  name: string
  shortname: string
  previleges: string

  // previleges: { aprove: boolean; all: boolean }
}

const SidebarAddUser = (props: SidebarAddUserType) => {
  // ** Props
  const { open, toggle, users, refresh } = props

  // ** State
  const [roles, setRoles] = useState<RoleData[]>([])
  const [staff, setStaff] = useState<UserStaffData[]>([])

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setConfirmShowPassword] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm<UserData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'onBlur'
  })

  useEffect(() => {
    const getData = async () => {
      try {
        const userStaffArray: UserStaffData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'staff'))
        querySnapshot.forEach(doc => {
          userStaffArray.push(doc.data() as UserStaffData)
        })
        setStaff(userStaffArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
    }
    getData()
  }, [])

  useEffect(() => {
    const getData = async () => {
      try {
        const userStaffArray: UserStaffData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'staff'))
        querySnapshot.forEach(doc => {
          userStaffArray.push(doc.data() as UserStaffData)
        })
        setStaff(userStaffArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
    }
    getData()
  }, [])

  const filterStaff = staff.filter(stf => !users.some(user => user.staff === stf.id))

  useEffect(() => {
    const getData = async () => {
      try {
        const roleArray: RoleData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'roles'))
        querySnapshot.forEach(doc => {
          roleArray.push(doc.data() as RoleData)
        })
        setRoles(roleArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
    }
    getData()
  }, [])

  const onSubmit = async (values: UserData) => {
    if (values.id) {
      console.log(values)
    } else {
      try {
        setIsLoading(true)

        const { user } = await createUserWithEmailAndPassword(auth, values.corporate_email, values.password)

        const completeName = `${staff.find(stf => stf.id === values.staff)?.name} ${
          staff.find(stf => stf.id === values.staff)?.surname
        }`

        await updateProfile(user, { displayName: completeName })
        const userDocRef = doc(firestore, 'user', user.uid)

        const roleData = {
          id: user.uid,
          name: completeName,
          corporate_email: values.corporate_email,
          role: values.role,
          staff: values.staff,
          created_by: 'eniomarcosm',
          roleName: roles.find(role => role.shortname === values.role)?.name
        }

        await setDoc(userDocRef, roleData)

        toast.success('Usuário Cadastrado com Sucesso')
        setIsLoading(false)
        handleClose()
      } catch (error) {
        toast.error('Error creating user')
        console.log(error)
        setIsLoading(false)
      }
    }
  }

  const handleClose = () => {
    refresh()
    reset()
    toggle()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Header>
        <Typography variant='h5'>Adicionar Usuário</Typography>
        <ModalProgressBar open={isLoading} />
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{
            p: '0.438rem',
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>
      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomAutocomplete
            fullWidth
            options={filterStaff}
            getOptionLabel={option => `${option.name} ${option.surname}-${option.personal_email}` || ''}
            renderInput={params => (
              <CustomTextField
                {...params}
                sx={{ mb: 4 }}
                label='Pesquisar Funcionário'
                error={!!errors.staff}
                helperText={errors.staff?.message}
              />
            )}
            onChange={(_, selectedOption) => {
              setValue('staff', selectedOption?.id || '')
            }}
          />
          <Controller
            name='corporate_email'
            control={control}
            render={({ field }) => (
              <CustomTextField
                fullWidth
                sx={{ mb: 4 }}
                {...(errors.corporate_email && { helperText: errors.corporate_email?.message })}
                error={Boolean(errors.corporate_email)}
                label='Email Institucional'
                {...field}
              />
            )}
          />
          <Controller
            name='password'
            control={control}
            render={({ field }) => (
              <CustomTextField
                fullWidth
                sx={{ mb: 4 }}
                label='Password'
                error={Boolean(errors.password)}
                {...(errors.password && { helperText: errors.password?.message })}
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Icon fontSize='1.25rem' icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                {...field}
              />
            )}
          />

          <Controller
            name='confirmPassword'
            control={control}
            render={({ field }) => (
              <CustomTextField
                fullWidth
                sx={{ mb: 4 }}
                label='Confirmar Senha'
                error={Boolean(errors.confirmPassword)}
                {...(errors.confirmPassword && { helperText: errors.confirmPassword?.message })}
                {...field}
                type={showConfirmPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setConfirmShowPassword(!showConfirmPassword)}
                      >
                        <Icon fontSize='1.25rem' icon={showConfirmPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />

          <Controller
            name='role'
            control={control}
            render={({ field }) => (
              <CustomTextField
                fullWidth
                sx={{ mb: 4 }}
                label='Previlégio'
                select
                error={Boolean(errors.role)}
                {...(errors.role && { helperText: errors.role?.message })}
                {...field}
              >
                {roles.map(role => (
                  <MenuItem key={role.id} value={role.shortname}>
                    {role.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />

          <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
            <Button type='submit' variant='contained' sx={{ mr: 3 }}>
              Salvar
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleClose}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}

export default SidebarAddUser
