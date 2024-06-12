import { NextResponse } from 'next/server'
import { Resend } from 'resend'

import VacationRequestEmail from 'src/emails/vacation_request'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { email, name, start_date, end_date, days } = await request.json()
  console.log(email, name, start_date, end_date, days)

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Pedido de Férias',

    // html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    react: VacationRequestEmail({ name, start_date, end_date, days })
  })

  return NextResponse.json({ message: 'Email sent', status: 'OK' })
}
