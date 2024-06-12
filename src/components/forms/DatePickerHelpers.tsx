import { InputProps } from '@mui/material'
import { ChangeEvent, forwardRef } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import { DateType } from 'src/types/forms/reactDatepickerTypes'

interface CustomInputProps {
  value: DateType
  label: string
  error: boolean
  InputProps: InputProps
  onChange: (event: ChangeEvent) => void
}

export const CustomInputPicker = forwardRef(({ ...props }: CustomInputProps, ref) => {
  return <CustomTextField fullWidth inputRef={ref} {...props} sx={{ width: '100%' }} />
})
