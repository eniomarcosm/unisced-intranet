// src/emails/renderVacationRequestEmail.ts
import { renderToStaticMarkup } from 'react-dom/server'
import { VacationRequestEmail, VacationRequestEmailProps } from './vacation_request'

export const renderVacationRequestEmail = ({ name, start_date, end_date, days }: VacationRequestEmailProps) => {
  return renderToStaticMarkup(
    <VacationRequestEmail name={name} start_date={start_date} end_date={end_date} days={days} />
  )
}
