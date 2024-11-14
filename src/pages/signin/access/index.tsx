import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useAuth } from 'src/hooks/useAuth'

export default function TokenAccess({}) {
  const { query, isReady } = useRouter() // 'isReady' tells us if the query is available
  const auth = useAuth()
  const [tokenChecked, setTokenChecked] = useState(false) // Ensure we handle token check once

  useEffect(() => {
    if (isReady && query.token && !tokenChecked) {
      const token = query?.token as string
      auth.tokenLogin({ token }, error => {
        window.location.href = 'https://uninet.unisced.edu.mz'
        console.log('erro', error)
      })
      setTokenChecked(true) // Set to true to prevent multiple checks
    } else if (isReady && !query.token && !tokenChecked) {
      // Redirect if no token is provided
      window.location.href = 'https://uninet.unisced.edu.mz'
      setTokenChecked(true)
    }
  }, [auth, query.token, isReady, tokenChecked])

  // return <div>Checking token...</div>
}

TokenAccess.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>

TokenAccess.guestGuard = true
