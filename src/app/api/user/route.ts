// import { NextResponse } from 'next/server'
// import { db } from 'src/lib/db'
// import { hash } from 'bcrypt'
// import * as z from 'zod'

// const userSchema = z.object({
//   name: z.string().min(1, 'Name is required').max(100),
//   surname: z.string().min(1, 'Surname is required').max(100),
//   username: z.string().min(1, 'Username is required').max(100),
//   password: z.string().min(1, 'Password is required').max(100),
//   email: z.string().min(1, 'Email is required').email('Invalid email')
// })

// export async function POST(req: Request) {
//   try {
//     const body = await req.json()

//     const { email, username, password, name, surname } = userSchema.parse(body)

//     //* Check if the email alredy exists
//     const existingUserByEmail = await db.user.findUnique({
//       where: { email: email }
//     })

//     if (existingUserByEmail) {
//       return NextResponse.json({ user: null, message: 'User with this email already exists' }, { status: 409 })
//     }

//     //* Check if the username alredy exists
//     const existingUserByUsername = await db.user.findUnique({
//       where: { username: username }
//     })

//     if (existingUserByUsername) {
//       return NextResponse.json({ user: null, message: 'User with this username already exists' }, { status: 409 })
//     }

//     const hashPassword = await hash(password, 10)

//     const newUser = await db.user.create({
//       data: {
//         username,
//         name,
//         surname,
//         email,
//         password: hashPassword
//       }
//     })

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const { password: newUserPassword, ...rest } = newUser

//     return NextResponse.json({ user: rest, message: 'User created successfully' }, { status: 201 })
//   } catch (error) {}
// }
