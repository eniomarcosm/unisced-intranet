// ** React Imports
import { ReactNode } from 'react'

// ** Next Imports
// import Link from 'next/link'

import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'

// import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'
import { Button } from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
// import * as yup from 'yup'
// import { useForm, FieldValues } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// import useBgColor from 'src/@core/hooks/useBgColor'
// import { useSettings } from 'src/@core/hooks/useSettings'

// ** Configs
// import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

import { uniscedLogoFullText } from 'src/constants/user'
import Image from 'next/image'
import toast from 'react-hot-toast'

// ** Styled Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 680,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12),
  [theme.breakpoints.down(1540)]: {
    maxHeight: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxHeight: 500
  }
}))

const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 450
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 600
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 750
  }
}))

// const LinkStyled = styled(Link)(({ theme }) => ({
//   textDecoration: 'none',
//   color: `${theme.palette.primary.main} !important`
// }))

// const FormControlLabel = styled(MuiFormControlLabel)<FormControlLabelProps>(({ theme }) => ({
//   '& .MuiFormControlLabel-label': {
//     color: theme.palette.text.secondary
//   }
// }))

// const schema = yup.object().shape({
//   email: yup.string().email().required('Este campo não pode ser nulo!'),
//   password: yup.string().min(4).required('Este campo não pode ser nulo!')
// })

// const defaultValues = {
//   password: 'admin',
//   email: 'admin@vuexy.com'
// }

// interface FormData {
//   email: string
//   password: string
// }

const LoginPage = ({}) => {
  // const [rememberMe, setRememberMe] = useState<boolean>(true)
  // const [showPassword, setShowPassword] = useState<boolean>(false)
  // const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // ** Hooks
  const auth = useAuth()

  const theme = useTheme()

  // const bgColors = useBgColor()
  // const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // ** Vars
  // const { skin } = settings

  // const {
  //   control,
  //   setError,
  //   handleSubmit,
  //   formState: { errors }
  // } = useForm({
  //   mode: 'onBlur',
  //   resolver: yupResolver(schema)
  // })

  // const onSubmit = async (data: FieldValues) => {
  //   setIsSubmitting(true)
  //   const { email, password } = data

  //   // try {
  //   //   const signInData = await signIn('credentials', {
  //   //     email: email,
  //   //     password: password
  //   //   })

  //   //   if (signInData?.error) {
  //   //     setError('email', { type: 'manual', message: signInData.error })
  //   //   }
  //   // } catch (error) {
  //   //   console.log('erro', error)
  //   // }

  //   // console.log(signInData)
  //   try {
  //     auth.login({ email, password, rememberMe }, () => {
  //       setError('email', {
  //         type: 'manual',
  //         message: 'Email ou Senha Inválidos'
  //       })
  //       toast.error('Email ou Senha Inválidos')
  //     })
  //   } catch (error) {
  //     console.log('Erro')
  //     toast.error('Email ou Senha Inválidos')
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      const login = auth.loginGoogle(() => {
        toast.error('Usuário Inválido!')
      })

      console.log(login)
    } catch (error) {
      console.error('Error during Google sign-in', error)
      toast.error('Erro ao fazer login com Google')
    }
  }

  // const imageSource = skin === 'bordered' ? 'auth-v2-login-illustration-bordered' : 'auth-v2-login-illustration'

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      {!hidden ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
            borderRadius: '20px',
            justifyContent: 'center',
            backgroundColor: 'customColors.bodyBg',
            margin: theme => theme.spacing(8, 0, 8, 8)
          }}
        >
          <LoginIllustration alt='login-illustration' src={'/images/pages/auth-login.png'} />
          <FooterIllustrationsV2 />
        </Box>
      ) : null}
      <RightWrapper>
        <Box
          sx={{
            p: [6, 12],
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 500 }}>
            <div style={{ width: '100%', maxWidth: '600px', margin: 'auto', padding: '0 6px' }}>
              <Image
                src={uniscedLogoFullText}
                alt='Universidade Jean Piaget de Moçambique'
                width={400}
                height={120}
                layout='responsive'
              />
            </div>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column', // Arrange items vertically
                alignItems: 'center', // Center horizontally
                justifyContent: 'center', // Center vertically
                textAlign: 'center', // Center text alignment
                my: 6
              }}
            >
              <Typography variant='h4' alignContent='center' justifyContent='center' sx={{ mb: 1.5 }}>
                {`Seja Bem-vindo ao Sistema de Controlo de Absentismo`}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Clique no botão abaixo e autentique-se usando a sua conta Google institucional!
              </Typography>
            </Box>

            {/* <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 4 }}>
                <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <CustomTextField
                      fullWidth
                      autoFocus
                      label='Email'
                      variant='outlined' // Add variant prop here
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      error={Boolean(errors?.email)}
                      {...(errors?.email && { placeholder: errors?.email.message?.toString() })}
                    />
                  )}
                />
              </Box>
              <Box sx={{ mb: 1.5 }}>
                <Controller
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      onBlur={onBlur}
                      label='Senha'
                      onChange={onChange}
                      id='auth-login-v2-password'
                      error={Boolean(errors.password)}
                      {...(errors?.password && { placeholder: errors?.password?.message?.toString() })}
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
                    />
                  )}
                />
              </Box>
              <Box
                sx={{
                  mb: 1.75,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <FormControlLabel
                  label='Lembre de mim'
                  control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />}
                />
                <Typography component={LinkStyled} href='/forgot-password'>
                  Esqueceu Senha?
                </Typography>
              </Box>
              <Button disabled={isSubmitting} fullWidth type='submit' variant='contained' sx={{ mb: 4 }}>
                Entrar
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Typography sx={{ color: 'text.secondary', mr: 2 }}>Não possui conta?</Typography>
                <Typography href='/register' component={LinkStyled}>
                  Criar Conta
                </Typography>
              </Box>
              <Divider
                sx={{
                  color: 'text.disabled',
                  '& .MuiDivider-wrapper': { px: 6 },
                  fontSize: theme.typography.body2.fontSize,

                  my: theme => `${theme.spacing(6)} !important`
                }}
              >
                ou
                </form> */}
            {/* <Divider
              sx={{
                color: 'text.disabled',
                '& .MuiDivider-wrapper': { px: 6 },
                fontSize: theme.typography.body2.fontSize,

                my: theme => `${theme.spacing(6)} !important`
              }}
            ></Divider> */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Button
                color='info'
                variant='contained'
                onClick={handleGoogleSignIn}
                sx={{
                  mb: 4,
                  paddingY: 3,
                  paddingX: 6,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'none', // Disable uppercase for a modern look
                  bgcolor: '#4285f4',
                  color: '#fff',
                  '&:hover': {
                    bgcolor: '#357ae8' // Slightly darker shade on hover
                  },
                  borderRadius: 4,
                  boxShadow: '0 4px 10px rgba(66, 133, 244, 0.3)' // Soft glow for focus
                }}
                startIcon={
                  <Icon
                    icon='mdi:google'
                    fontSize='1.5rem' // Adjust size as needed
                  />
                }
              >
                Entrar com Google
              </Button>
            </Box>
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

LoginPage.guestGuard = true

export default LoginPage
