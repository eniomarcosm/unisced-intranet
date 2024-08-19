import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text
} from '@react-email/components'
import * as React from 'react'

export interface VacationRequestEmailProps {
  name?: string
  start_date?: Date | string
  end_date?: Date | string
  days?: number
}

const baseUrl = 'https://unisced.edu.mz'

export const VacationRequestEmail = ({ name, start_date, end_date, days }: VacationRequestEmailProps) => {
  let formattedStartDate = ''
  let formattedEndDate = ''

  if (start_date) {
    try {
      const startDateObj = new Date(start_date)
      formattedStartDate = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'long'
      }).format(startDateObj)
    } catch (error) {
      console.error('Invalid start_date:', start_date)
    }
  }

  if (end_date) {
    try {
      const endDateObj = new Date(end_date)
      formattedEndDate = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'long'
      }).format(endDateObj)
    } catch (error) {
      console.error('Invalid end_date:', end_date)
    }
  }

  return (
    <Html>
      <Head />
      <Preview>Pedido de Férias</Preview>
      <Body style={main}>
        <Container>
          <Section style={content}>
            <Row>
              <Img style={image} width={300} src={`${baseUrl}/wp-content/uploads/2023/03/logo.svg`} />
            </Row>

            <Row style={{ ...boxInfos, paddingBottom: '0' }}>
              <Column>
                <Heading style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center' }}>Pedido de férias</Heading>
                <Heading as='h2' style={{ fontSize: 26, fontWeight: 'bold', textAlign: 'center' }}>
                  {name}, solicitou um pedido de férias com os detalhes:
                </Heading>

                <Text style={paragraph}>
                  <b>Início: </b>
                  {formattedStartDate || 'Data inválida'}
                </Text>
                <Text style={{ ...paragraph, marginTop: -5 }}>
                  <b>Fim: </b>
                  {formattedEndDate || 'Data inválida'}
                </Text>
                <Text style={{ ...paragraph, marginTop: -5 }}>
                  <b>Número de dias: </b>
                  {days || 'Não especificado'}
                </Text>
                <Text style={{ color: 'rgb(0,0,0, 0.5)', fontSize: 14, marginTop: -5 }} />

                <Text style={paragraph}>Para dar resposta ao pedido de férias acesse ao link abaixo:</Text>
              </Column>
            </Row>
            <Row style={{ ...boxInfos, paddingTop: '0' }}>
              <Column style={containerButton} colSpan={2}>
                <Button href='http://localhost:3000/ferias/solicitacao' style={button}>
                  Dar Resposta
                </Button>
              </Column>
            </Row>
          </Section>

          <Text style={{ textAlign: 'center', fontSize: 12, color: 'rgb(0,0,0, 0.7)' }}>
            © 2024 |UNISCED | www.unisced.ac.mz
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

VacationRequestEmail.PreviewProps = {
  name: 'Enio Marcos',
  start_date: new Date(),
  end_date: new Date(),
  days: 0
} as VacationRequestEmailProps

export default VacationRequestEmail

const main = {
  backgroundColor: '#fff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'
}

const paragraph = {
  fontSize: 16
}

const containerButton = {
  display: 'flex',
  justifyContent: 'center',
  width: '100%'
}

const button = {
  backgroundColor: '#e00707',
  borderRadius: 3,
  color: '#FFF',
  fontWeight: 'bold',
  border: '1px solid rgb(0,0,0, 0.1)',
  cursor: 'pointer',
  padding: '12px 30px'
}

const content = {
  border: '1px solid rgb(0,0,0, 0.1)',
  borderRadius: '3px',
  overflow: 'hidden'
}

const image = {
  maxWidth: '100%'
}

const boxInfos = {
  padding: '20px'
}
