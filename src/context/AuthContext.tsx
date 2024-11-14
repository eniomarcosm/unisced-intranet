/* eslint-disable react-hooks/exhaustive-deps */
// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Config
import authConfig from 'src/configs/auth'

import { jwtDecode } from 'jwt-decode'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType, TokenLoginParams } from './types'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  tokenLogin: () => Promise.resolve()
}

interface DecodedToken {
  exp: number
  user_id: string
  name: string
  email: string
  email_verified: boolean
  phone_number?: string
  [key: string]: any // Allow other token fields
}

// ** FireBase Auth
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, firestore } from 'src/configs/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const isTokenExpired = (token: string): boolean => {
  const decodedToken: any = jwtDecode(token)
  const currentTime = Date.now() / 1000

  if (!decodedToken.exp) {
    return false
  }

  console.log('hellllll', decodedToken.exp < currentTime)

  return decodedToken.exp < currentTime
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(null)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const storedUserData = window.localStorage.getItem(authConfig.userData)
      const userData: UserDataType = storedUserData ? JSON.parse(storedUserData) : null

      const token = window.localStorage.getItem(authConfig.storageTokenKeyName)

      if (token) {
        try {
          if (isTokenExpired(token as string)) handleLogout()
          else {
            if (storedUserData) {
              setUser({ ...userData })
            }
          }
        } catch (error) {
          console.log('Invalid token', error)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    signInWithEmailAndPassword(auth, params.email, params.password)
      .then(response => {
        response.user
          .getIdToken()
          .then(token => {
            params.rememberMe ? window.localStorage.setItem(authConfig.storageTokenKeyName, token) : null
          })
          .catch(error => {
            console.error(error)
            throw error
          })

        const returnUrl = router.query.returnUrl

        getDoc(doc(firestore, 'user', response.user.uid))
          .then(res => {
            if (res.exists()) {
              getDoc(doc(firestore, 'staff', res.data().staff)).then(staffRes => {
                if (staffRes.exists()) {
                  const userData = {
                    uid: response.user.uid,
                    fullName: response.user.displayName,
                    email: response.user.email,
                    emailVerified: response.user.emailVerified,
                    phoneNumber: response.user.phoneNumber,
                    role: res.data().role,
                    roleName: res.data().roleName,
                    avatar: staffRes.data()?.photoURL ?? response.user.photoURL,
                    department: staffRes.data()?.deparment,
                    staffId: staffRes.id
                  } as UserDataType

                  console.log(userData)

                  setUser({ ...userData })
                  params.rememberMe ? window.localStorage.setItem(authConfig.userData, JSON.stringify(userData)) : null

                  const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'

                  router.replace(redirectURL as string)
                }
              })
            }
          })
          .catch(error => {
            console.log('here', error)
            if (errorCallback) errorCallback(error)
          })
      })
      .catch(err => {
        console.log(err)
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null)
        window.localStorage.removeItem(authConfig.userData)
        window.localStorage.removeItem(authConfig.storageTokenKeyName)
        router.push('/login')
      })
      .catch(error => console.error(error))
  }

  const handleTokenLogin = (params: TokenLoginParams, errorCallback?: ErrCallbackType) => {
    if (isTokenExpired(params.token)) {
      console.log('Token expirou')

      window.location.href = 'https://uninet.unisced.edu.mz'
    }

    // Decode the token
    const decoded: DecodedToken = jwtDecode(params.token)

    if (decoded.user_id) {
      // Fetch user data from Firestore
      getDoc(doc(firestore, 'user', decoded.user_id))
        .then(res => {
          if (res.exists()) {
            // Fetch additional staff data
            getDoc(doc(firestore, 'staff', res.data().staff)).then(staffRes => {
              if (staffRes.exists()) {
                const userData = {
                  uid: decoded?.user_id,
                  fullName: decoded?.name,
                  email: decoded?.email,
                  emailVerified: decoded?.email_verified,
                  phoneNumber: decoded?.phone_number,
                  role: res.data().role,
                  roleName: res.data().roleName,
                  avatar: staffRes.data()?.photoURL ?? decoded.photo_url,
                  department: staffRes.data()?.department,
                  staffId: staffRes.id
                } as UserDataType

                console.log(userData)

                setUser({ ...userData })

                // Store user data in localStorage
                window.localStorage.setItem(authConfig.userData, JSON.stringify(userData))
                window.localStorage.setItem(authConfig.storageTokenKeyName, params.token)

                // Redirect to the specified URL or the homepage

                router.replace('/')
              }
            })
          } else {
            window.location.href = 'https://uninet.unisced.edu.mz'
          }
        })
        .catch(error => {
          console.error('Error fetching data:', error)
          console.log('here', error)
          if (errorCallback) errorCallback(error)

          // Handle Firestore errors here (e.g., redirect or show error message)
        })
    }
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    tokenLogin: handleTokenLogin
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
