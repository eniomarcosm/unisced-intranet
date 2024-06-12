import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { AbsenceForm } from 'src/documents/form-absence'

export default function PDFViewer() {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Relatório-'
  })

  return (
    <>
      {/* <Card></Card> */}

      <div style={{ display: 'none' }}>
        <AbsenceForm ref={componentRef} data={{ nome: 'ENIOS', apelido: 'MASSINGUE' }} />
      </div>

      {/* <div ref={componentRef} dangerouslySetInnerHTML={{ __html: html }} /> */}
      <button onClick={handlePrint}>Print this out!</button>
    </>
  )
}
