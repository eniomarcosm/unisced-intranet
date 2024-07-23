// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType } from './types'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

// ** FireBase Auth
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, firestore } from 'src/configs/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
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

      if (storedUserData) {
        setUser({ ...userData })
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
            console.log(error)
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
        router.push('/sca/login')
      })
      .catch(error => console.error(error))
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
