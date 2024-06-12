import { NextResponse } from 'next/server'
import { Resend } from 'resend'

import VacationConfirmEmail from 'src/emails/vacation_confirm'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { email, name, start_date, end_date, days, subject } = await request.json()
  console.log(email, name, start_date, end_date, days, subject)

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: subject,

    // html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    react: VacationConfirmEmail({ name, start_date, end_date, days })
  })

  return NextResponse.json({ message: 'Email sent', status: 'OK' })
}
