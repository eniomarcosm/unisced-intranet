import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import * as handlebars from 'handlebars'
import { EmailRequestTemplate } from 'src/emails/emailRequest'

// import VacationRequestEmail from 'src/emails/vacation_request'

export async function POST(request: Request) {
  const { name, email, position, subject, current_date, start_date, end_date, days } = await request.json()

  // console.log(email, name, start_date, end_date, days)

  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    // host: process.env.SMTP_HOST,
    // port: parseInt(process.env.SMTP_PORT || '587', 10),
    // secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    service: 'gmail',
    auth: {
      user: 'eniomarcos48', // SMTP username
      pass: 'dbta xznp kkwd frne' // SMTP password
    }
  })

  // Send email using the transporter
  await transporter.sendMail({
    from: process.env.SMTP_FROM, // Sender address
    to: email, // List of receivers
    subject: 'Pedido de Férias', // Subject line
    html: compileEmail(name, position, subject, current_date, start_date, end_date, days) // HTML body
  })

  return NextResponse.json({ message: 'Email sent', status: 'OK' })
}

export function compileEmail(
  name: string,
  position: string,
  subject: string,
  current_date: string,
  start_date: string,
  end_date: string,
  days: string
) {
  const template = handlebars.compile(EmailRequestTemplate)

  const htmlBody = template({
    name: name,
    position: position,
    subject: subject,
    current_date: current_date,
    start_date: start_date,
    end_date: end_date,
    days: days
  })

  return htmlBody
}
