import { NextResponse } from 'next/server'
import { compile } from '@onedoc/react-print'
import pdf from 'html-pdf'
import { Document } from 'src/documents/report'

export const GET = async (req: Request) => {
  const receipt = {
    id: 1,
    date: '2021-01-01',
    total: 100
  }

  const htmlContent = await compile(Document(receipt))

  // Create a new Promise to handle the async nature of html-pdf
  const createPdf = (html: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      pdf.create(html).toBuffer((err, buffer) => {
        if (err) {
          reject(err)
        } else {
          resolve(buffer)
        }
      })
    })
  }

  try {
    const pdfBuffer = await createPdf(htmlContent)

    // Return the PDF
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
