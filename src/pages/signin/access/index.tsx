import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { jwtDecode } from 'jwt-decode'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from 'src/configs/firebaseConfig'
import { UserDataType } from 'src/context/types'

import authConfig from 'src/configs/auth'

interface DecodedToken {
  exp: number
  user_id: string
  name: string
  email: string
  email_verified: boolean
  phone_number?: string
  [key: string]: any // Allow other token fields
}

export default function TokenAccess({}) {
  const { query, push } = useRouter()

  useEffect(() => {
    const token = query?.token as string | undefined
    const returnUrl = query?.returnUrl as string | undefined // Handle redirect URL

    if (token) {
      try {
        // Decode the token
        const decoded: DecodedToken = jwtDecode(token)

        // Get the current timestamp (in seconds)
        const currentTime = Math.floor(Date.now() / 1000)

        // Check if token is still valid (exp > currentTime)
        if (decoded.exp && decoded.exp > currentTime) {
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

                    // Store user data in localStorage
                    window.localStorage.setItem(authConfig.userData, JSON.stringify(userData))
                    window.localStorage.setItem(authConfig.storageTokenKeyName, token)

                    // Redirect to the specified URL or the homepage
                    const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'

                    push(redirectURL)
                  }
                })
              }
            })
            .catch(error => {
              console.error('Error fetching data:', error)

              // Handle Firestore errors here (e.g., redirect or show error message)
              push('/error')
            })

          // Store the token in sessionStorage
          window.sessionStorage.setItem('authToken', token)
        } else {
          console.log('Token is expired')

          // Handle expired token
          push('/login')
        }
      } catch (error) {
        console.error('Invalid token', error)

        // Handle invalid token
        push('/login')
      }
    }
  }, [query, push])

  return <div>{query?.token ? 'Checking token...' : 'No token provided'}</div>
}

TokenAccess.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>

TokenAccess.guestGuard = true
