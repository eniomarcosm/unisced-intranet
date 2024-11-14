import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import handlebars from 'handlebars'

// import { google } from 'googleapis'
import { EmailRequestTemplate } from 'src/emails/emailRequest'

export async function POST(request: Request) {
  try {
    const { name, email, position, subject, start_date, end_date, days } = await request.json()

    const current_date = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'long'
    }).format(new Date())

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: subject,
      html: compileEmail(name, position, subject, current_date, start_date, end_date, days)
    }

    const result = await transporter.sendMail(mailOptions)

    console.log('Email sent successfully:', result)

    return NextResponse.json({ message: 'Email sent', status: 'OK' })
  } catch (error) {
    console.error('Error sending email:', error)

    return NextResponse.json({ error: 'Error sending email' }, { status: 500 })
  }
}

function compileEmail(
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
