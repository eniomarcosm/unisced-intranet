/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { PrintDataProps } from 'src/types/pages/generalData'

interface VacationMapProps extends React.HTMLAttributes<HTMLDivElement> {
  data: PrintDataProps
}

// const data = [
//   { id: 1, name: 'Enio Marcos Massingue', admitionAt: '01/02/2023' },
//   { id: 2, name: 'Enio Marcos Massingue', admitionAt: '01/02/2023' },
//   { id: 3, name: 'Enio Marcos Massingue', admitionAt: '01/02/2023' },
//   { id: 4, name: 'Enio Marcos Massingue', admitionAt: '01/02/2023' },
//   { id: 5, name: 'Enio Marcos Massingue', admitionAt: '01/02/2023' },
//   { id: 6, name: 'Enio Marcos Massingue', admitionAt: '01/02/2023' },
//   { id: 7, name: 'Enio Marcos Massingue', admitionAt: '01/02/2023' },
//   { id: 8, name: 'Enio Marcos Massingue', admitionAt: '01/02/2023' },
//   { id: 9, name: 'Enio Marcos Massingue', admitionAt: '01/02/2023' },
//   { id: 10, name: 'Enio Marcos Massingue', admitionAt: '01/02/2023' },
//   { id: 11, name: 'Enio Marcos Massingue', admitionAt: '01/02/2023' },
//   { id: 12, name: 'Enio Marcos Massingue', admitionAt: '01/02/2023' }
// ]

function fixedVacationDays(admittedDate: Date | undefined) {
  if (!admittedDate || isNaN(admittedDate.getTime())) {
    console.error('Invalid admittedDate provided')

    return 0
  }

  let vacationDays = 0
  const todayDate = new Date()

  // Calculate the number of full months worked
  const yearsDiff = todayDate.getFullYear() - admittedDate.getFullYear()
  const monthsDiff = todayDate.getMonth() - admittedDate.getMonth()
  const daysDiff = todayDate.getDate() - admittedDate.getDate()

  let monthsWorked = yearsDiff * 12 + monthsDiff
  if (daysDiff < 0) {
    monthsWorked -= 1
  }

  if (monthsWorked <= 12) {
    vacationDays = 12
  } else if (monthsWorked >= 24) {
    vacationDays = 30
  }

  return vacationDays
}

export const VacationMap = React.forwardRef<HTMLDivElement, VacationMapProps>((props, ref) => {
  const { data } = props

  console.log(data)

  return (
    <div
      style={{
        display: 'flex', // Added to enable flexbox
        flexDirection: 'column', // Added to align content vertically
        height: '100vh', // Makes the div take full viewport height for vertical centering
        backgroundColor: 'white',
        color: 'black',
        padding: '4em 4em 3em 4em',
        fontSize: '9pt',
        fontFamily: 'sans-serif',
        font: 'Arial'
      }}
      ref={ref}
    >
      <div style={{ textAlign: 'center' }}>
        <img src='/images/logo.svg' alt='Logo' />
      </div>
      <div style={{ textAlign: 'center', marginTop: '1.5em', marginBottom: '1.5em', fontWeight: 'bold' }}>
        <p style={{ margin: '0.1em 0' }}>ADMINISTRAÇÃO</p>
        <p style={{ margin: '0.1em 0' }}>DEPARTAMENTO DE RECURSOS HUMANOS</p>
        <p style={{ margin: '0.1em 0' }}>Plano de Férias da/do {data?.department}</p>
      </div>

      <div
        style={{
          position: 'fixed',
          right: 4,
          marginRight: 20,
          textAlign: 'center',
          marginTop: '1.5em',
          marginBottom: '1.5em'
        }}
      >
        <p style={{ margin: '0.1em 0' }}>Visto por</p>
        <p style={{ margin: '0.1em 0', marginRight: 15, textAlign: 'right' }}>O Reitor</p>
        <p style={{ margin: '0.1em 0' }}>__________________________________</p>
        <p style={{ margin: '0.1em 0' }}>Prof. Doutor Martins dos Santos Laita</p>
      </div>
      {/* Adjusted to center the text */}
      <table
        style={{
          marginTop: '1em',
          width: '100%',
          textAlign: 'center',
          borderCollapse: 'collapse',
          border: '2px solid black'
        }}
      >
        <thead>
          <tr>
            <td colSpan={3} style={{ border: '1px solid black', fontWeight: 'bold' }}></td>

            <td colSpan={12} style={{ border: '1px solid black', fontWeight: 'bold' }}>
              Mês planificado
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>ID</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Nome do Colaborador</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Data de Admissão</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Janeiro</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Fevereiro</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Março</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Abril</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Maio</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Junho</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Julho</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Agosto</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Setembro</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Outubro</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Novembro</td>
            <td style={{ border: '1px solid black', fontWeight: 'bold' }}>Dezembro</td>
            <td style={{ border: '1px solid black' }}>Total de Dias</td>
          </tr>
        </thead>
        <tbody>
          {data?.staff?.map((item, index) => {
            const reservation = data?.vacationReservation?.find(reserv => reserv.staffId === item.id)?.month
            console.log(reservation)

            return (
              <tr key={index}>
                <td style={{ border: '1px solid black' }}>{index + 1}</td>
                <td style={{ border: '1px solid black' }}>{`${item.name} ${item.surname}`}</td>
                <td style={{ border: '1px solid black' }}>{item?.admited_at?.toDate().toLocaleDateString('pt-BR')}</td>
                <td style={{ border: '1px solid black', backgroundColor: `${reservation === 1 ? 'black' : ''}` }}></td>
                <td style={{ border: '1px solid black', backgroundColor: `${reservation === 2 ? 'black' : ''}` }}></td>
                <td style={{ border: '1px solid black', backgroundColor: `${reservation === 3 ? 'black' : ''}` }}></td>
                <td style={{ border: '1px solid black', backgroundColor: `${reservation === 4 ? 'black' : ''}` }}></td>
                <td style={{ border: '1px solid black', backgroundColor: `${reservation === 5 ? 'black' : ''}` }}></td>
                <td style={{ border: '1px solid black', backgroundColor: `${reservation === 6 ? 'black' : ''}` }}></td>
                <td style={{ border: '1px solid black', backgroundColor: `${reservation === 7 ? 'black' : ''}` }}></td>
                <td style={{ border: '1px solid black', backgroundColor: `${reservation === 8 ? 'black' : ''}` }}></td>
                <td style={{ border: '1px solid black', backgroundColor: `${reservation === 9 ? 'black' : ''}` }}></td>
                <td style={{ border: '1px solid black', backgroundColor: `${reservation === 10 ? 'black' : ''}` }}></td>
                <td style={{ border: '1px solid black', backgroundColor: `${reservation === 11 ? 'black' : ''}` }}></td>
                <td style={{ border: '1px solid black', backgroundColor: `${reservation === 12 ? 'black' : ''}` }}></td>
                <td style={{ border: '1px solid black' }}>{fixedVacationDays(item?.admited_at?.toDate())}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, marginLeft: 60, marginRight: 60 }}>
        <div style={{ textAlign: 'left' }}>
          <p>Departamento de Recursos Humanos</p>
          <p style={{ borderTop: '1px solid black', margin: '0' }}></p>
          <p>Carmindo António Lenço Fijamo</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p>O Chefe do Gabinete do Reitor</p>
          <p style={{ borderTop: '1px solid black', margin: '0' }}></p>
          <p>Msc. Zacarias Mendes Magibir</p>
        </div>
      </div>
    </div>
  )
})
