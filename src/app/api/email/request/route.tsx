import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import VacationRequestEmail from 'src/emails/vacation_request'
import { renderToStaticMarkup } from 'react-dom/server'

export async function POST(request: Request) {
  const { email, name, start_date, end_date, days } = await request.json()
  console.log(email, name, start_date, end_date, days)

  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // SMTP username
      pass: process.env.SMTP_PASS // SMTP password
    }
  })

  const emailHtml = renderToStaticMarkup(
    <VacationRequestEmail name={name} start_date={start_date} end_date={end_date} days={days} />
  )

  // Send email using the transporter
  await transporter.sendMail({
    from: process.env.SMTP_FROM, // Sender address
    to: email, // List of receivers
    subject: 'Pedido de Férias', // Subject line
    html: emailHtml // HTML body
  })

  return NextResponse.json({ message: 'Email sent', status: 'OK' })
}
