export type ErrCallbackType = (err: { [key: string]: string }) => void

export type LoginParams = {
  email: string
  password: string
  rememberMe?: boolean
}

export type TokenLoginParams = {
  token: string
}

export type UserDataType = {
  uid: string
  fullName: string
  email: string
  emailVerified: boolean
  phoneNumber?: string | null
  avatar?: string | null
  department: string | null
  role: string
  roleName: string
  staffId: string
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
  loginGoogle: (errorCallback?: ErrCallbackType) => void
  tokenLogin: (params: TokenLoginParams, errorCallback?: ErrCallbackType) => void
}
