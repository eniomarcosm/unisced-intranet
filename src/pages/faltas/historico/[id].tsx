import { Button, Card, CardContent, CardHeader, Divider, Grid } from '@mui/material'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useReactToPrint } from 'react-to-print'
import IconifyIcon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import { firestore } from 'src/configs/firebaseConfig'
import { AbsenceForm } from 'src/documents/form-absence'
import { UserStaffData } from 'src/pages/colaborador/cadastrar'
import { AbsenceRequestData, SelectiveData } from 'src/types/pages/generalData'

export default function ViewVacationRequest({}) {
  const [absenceRequest, setAbsenceRequest] = useState<AbsenceRequestData>()
  const [currentStaf, setCurrentStaff] = useState<UserStaffData>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [cargos, setCargos] = useState<SelectiveData[]>([])

  const router = useRouter()
  const { id } = router.query

  const getData = async () => {
    setIsLoading(true)
    try {
      const vacationRequestRef = doc(collection(firestore, 'absence_justification'), id as string)
      const staffSnapshot = await getDoc(vacationRequestRef)

      if (staffSnapshot.exists()) {
        const vacationData = staffSnapshot.data() as AbsenceRequestData
        setAbsenceRequest(vacationData)
      } else {
        toast.error('Solicitação não encontrada!')
      }
    } catch (error) {
      toast.error('Erro ao solicitar dados!')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    const getData = async () => {
      try {
        const profCategoriesArray: SelectiveData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'job_position'))

        querySnapshot.forEach(doc => {
          profCategoriesArray.push(doc.data() as SelectiveData)
        })
        setCargos(profCategoriesArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
    }
    getData()
  }, [])

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      try {
        if (absenceRequest?.staffId) {
          const staffRef = doc(collection(firestore, 'staff'), absenceRequest.staffId as string)
          const staffSnapshot = await getDoc(staffRef)

          if (staffSnapshot.exists()) {
            const staffData = staffSnapshot.data() as UserStaffData
            setCurrentStaff(staffData)
          } else toast.error('Solicitação não encontrada!')
        }
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    getData()
  }, [absenceRequest])

  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Relatório-'
  })

  return (
    <Fragment>
      <ModalProgressBar open={isLoading} />
      <Card sx={{ mt: 5 }}>
        <CardHeader title='Detalhes da Solicitação' />
        <Divider />
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={12}>
              {/* <IconButton title='Imprimir' color='warning'>
                 <IconifyIcon icon={'tabler:printer'} />
              </IconButton> */}
              <Button
                variant='contained'
                onClick={handlePrint}
                color='warning'
                startIcon={<IconifyIcon icon={'tabler:printer'} />}
              >
                Imprimir
              </Button>
              {currentStaf && (
                <div style={{ display: 'none' }}>
                  <AbsenceForm ref={componentRef} data={currentStaf} />
                </div>
              )}
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Nome Completo'
                value={`${currentStaf?.name} ${currentStaf?.surname}`}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Cargo'
                value={cargos.find(cargo => cargo.id === currentStaf?.job_position)?.name}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField fullWidth disabled label='Códico do Trabalhador' value={currentStaf?.staff_code} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField fullWidth disabled label='Contacto' value={currentStaf?.contact1} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField fullWidth disabled label='Contacto Alternativo' value={`${currentStaf?.contact2}`} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Data de Contratação'
                value={`${currentStaf?.admited_at?.toDate().toLocaleDateString('pt-BR')}`}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField fullWidth disabled label='Email' value={`${currentStaf?.personal_email}`} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField fullWidth disabled label='Sexo' value={`${currentStaf?.gender}`} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField fullWidth disabled value='' label='Assinatura' />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Divider>Data de Ausência</Divider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Data de Início'
                value={absenceRequest?.start_date?.toDate().toLocaleDateString('pt-BR')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Data de Término'
                value={absenceRequest?.end_date?.toDate().toLocaleDateString('pt-BR')}
              />
            </Grid>
            {/* <Grid item xs={12} sm={4}>
              <CustomTextField fullWidth disabled label='Número de Dias Solicitados' value={absenceRequest?.days} />
            </Grid> */}

            {/* <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Número de Dias Restantes'
                value={absenceRequest?.days}
              />
            </Grid> */}

            <Grid item xs={12} sm={12}>
              <Divider>Detalhes da Solicitação</Divider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                multiline
                minRows={2}
                fullWidth
                disabled
                label='Parecer do Superior'
                value={absenceRequest?.superior?.comment}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                multiline
                minRows={2}
                fullWidth
                disabled
                label='Parecer dos Recursos Humanos'
                value={absenceRequest?.human_resources?.comment}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                multiline
                minRows={2}
                fullWidth
                disabled
                label='Parecer da Direcção'
                value={absenceRequest?.director?.comment}
              />
            </Grid>

            {/*// ** Division */}
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Data do Superior '
                value={absenceRequest?.superior?.updated_at?.toDate().toLocaleDateString('pt-BR')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Data dos Recursos Humanos'
                value={absenceRequest?.human_resources?.updated_at?.toDate().toLocaleDateString('pt-BR')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Data da Direcção'
                value={absenceRequest?.director?.updated_at?.toDate().toLocaleDateString('pt-BR')}
              />
            </Grid>

            {/*// ** Division */}
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Estado do Superior'
                value={absenceRequest?.superior?.is_approved}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Estado dos Recursos Humanos'
                value={absenceRequest?.human_resources?.is_approved}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Estado da Direcção'
                value={absenceRequest?.director?.is_approved}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button type='reset' color='warning' variant='outlined' LinkComponent={Link} href='/faltas/histórico'>
                Voltar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fragment>
  )
}

ViewVacationRequest.acl = {
  action: 'read',
  subject: 'vacations-history'
}
