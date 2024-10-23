import { Timestamp } from 'firebase/firestore'
import { UserStaffData } from 'src/pages/colaborador/cadastrar'

export interface SelectiveData {
  id: string
  name: string
  shortname: string
}

export interface DepartmentData {
  id: string
  name: string
  organic_unit: string
  shortname: string
}

export interface TimestamData {
  miliseconds: number
  seconds: number
}
export interface VacationRequestData {
  id: string
  notify: boolean
  request_date: Timestamp
  staffId: string
  start_date: Timestamp
  end_date: Timestamp
  days: number
  reason: string
  comment: string
  human_resources: {
    comment: string
    updated_at: Timestamp
    is_approved: number
    name: string
    sactions: string[]
  }
  superior: {
    comment: string
    updated_at: Timestamp
    is_approved: number
    name: string
  }

  director: {
    comment: string
    updated_at: Timestamp
    is_approved: number
    name: string
  }
}

export interface AbsenceRequestData {
  id: string
  notify: boolean
  request_date: Timestamp
  staffId: string
  comment: string
  return_time: Timestamp
  evidenceURL: string
  start_date: Timestamp
  days: number
  end_date: Timestamp
  reason: string
  human_resources: {
    comment: string
    updated_at: Timestamp
    sactions: string[]
    reason: string
    day_vacations: number
    is_approved: number
    name: string
  }
  superior: {
    comment: string
    updated_at: Timestamp
    is_approved: number
    name: string
  }
  director: {
    comment: string
    updated_at: Timestamp
    is_approved: number
    name: string
  }
}

export interface PrintDataProps {
  name?: string
  department?: string
  staff?: UserStaffData[]
  vacationReservation?: VacationReservation[]
  staff_code?: string
  request_date?: string
  reason?: string
  return_time?: string
  start_date?: string
  end_date?: string
  superior?: {
    comment: string
    updated_at: Timestamp
    is_approved: number
    name: string
  }
  human_resources?: {
    comment?: string
    updated_at?: Timestamp
    sactions?: string[]
    reason?: string
    day_vacations?: number
    is_approved?: number
    name?: string
  }
  director?: {
    comment: string
    updated_at: Timestamp
    is_approved: number
    name: string
  }
  job_position?: string
}

export interface VacationReservation {
  id: string
  staffId: string
  departmentId: string
  year: number
  month: number
}

export function abbreviateName(fullName = ''): string {
  if (!fullName.trim()) {
    return ''
  }

  const names = fullName.split(' ')
  const firstNameInitial = names[0].length > 1 ? names[0][0] + '.' : names[0]
  const lastName = names[names.length - 1]
  const formattedName = `${firstNameInitial} ${lastName}`

  return formattedName
}
