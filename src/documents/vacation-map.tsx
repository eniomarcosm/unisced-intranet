/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { PrintDataProps } from 'src/types/pages/generalData'

interface VacationMapProps extends React.HTMLAttributes<HTMLDivElement> {
  data: PrintDataProps
}

export const VacationMap = React.forwardRef<HTMLDivElement, VacationMapProps>(() => {
  return <div style={{ backgroundColor: 'white' }}></div>
})
