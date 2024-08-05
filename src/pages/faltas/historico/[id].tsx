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
import { DepartmentData } from 'src/pages/configurar/departamento'
import { AbsenceRequestData, PrintDataProps, SelectiveData } from 'src/types/pages/generalData'

export default function ViewVacationRequest({}) {
  const [absenceRequest, setAbsenceRequest] = useState<AbsenceRequestData>()
  const [currentStaf, setCurrentStaff] = useState<UserStaffData>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [motivos, setMotivos] = useState<SelectiveData[]>([])
  const [cargos, setCargos] = useState<SelectiveData[]>([])
  const [departments, setDepartaments] = useState<DepartmentData[]>([])

  // const [cargos, setCargos] = useState<SelectiveData[]>([])

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
        const reasonsArray: SelectiveData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'absence_reasons'))

        querySnapshot.forEach(doc => {
          reasonsArray.push(doc.data() as SelectiveData)
        })
        setMotivos(reasonsArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
    }
    getData()
  }, [])

  useEffect(() => {
    const getData = async () => {
      try {
        const dptArray: DepartmentData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'departments'))
        querySnapshot.forEach(doc => {
          dptArray.push(doc.data() as DepartmentData)
        })
        setDepartaments(dptArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
    }
    getData()
  }, [])

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

  // useEffect(() => {
  //   const getData = async () => {
  //     try {
  //       const profCategoriesArray: SelectiveData[] = []
  //       const querySnapshot = await getDocs(collection(firestore, 'job_position'))

  //       querySnapshot.forEach(doc => {
  //         profCategoriesArray.push(doc.data() as SelectiveData)
  //       })
  //       setCargos(profCategoriesArray)
  //     } catch (error) {
  //       toast.error('Erro ao solicitar dados!')
  //       console.log(error)
  //     }
  //   }
  //   getData()
  // }, [])

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
  const attachmentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Relatório-'
  })

  const handlePrintAttachment = useReactToPrint({
    content: () => attachmentRef.current,
    documentTitle: 'Comprovativo-'
  })

  const data: PrintDataProps = {
    name: `${currentStaf?.name} ${currentStaf?.surname}`,
    department: departments?.find(dpt => dpt.id === currentStaf?.department)?.name,
    staff_code: currentStaf?.staff_code,
    request_date: absenceRequest?.request_date?.toDate().toLocaleDateString('pt-BR'),
    reason: motivos.find(motivo => motivo.id === absenceRequest?.reason)?.name,
    return_time: absenceRequest?.return_time.toDate().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }),
    start_date: absenceRequest?.start_date?.toDate().toLocaleDateString('pt-BR'),
    end_date: absenceRequest?.end_date?.toDate().toLocaleDateString('pt-BR'),
    superior: absenceRequest?.superior,
    job_position: cargos?.find(cargo => cargo.id === currentStaf?.job_position)?.name,
    human_resources: absenceRequest?.human_resources,
    director: absenceRequest?.director
  }

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
                disabled={!(absenceRequest?.director?.is_approved === 1)}
                startIcon={<IconifyIcon icon={'tabler:printer'} />}
              >
                Imprimir
              </Button>
              {currentStaf && (
                <div style={{ display: 'none' }}>
                  <AbsenceForm ref={componentRef} data={data} />
                </div>
              )}
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Data de Ausência'
                value={absenceRequest?.start_date?.toDate().toLocaleDateString('pt-BR')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Ao Dia'
                value={absenceRequest?.end_date?.toDate().toLocaleDateString('pt-BR')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Hora de Regresso'
                value={absenceRequest?.return_time.toDate().toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <CustomTextField
                fullWidth
                disabled
                label='Motivo'
                value={motivos.find(motivo => motivo.id === absenceRequest?.reason)?.name}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button
                sx={{ mt: 5 }}
                variant='contained'
                onClick={handlePrintAttachment}
                color='primary'
                disabled={!absenceRequest?.evidenceURL}
                startIcon={<IconifyIcon icon={'tabler:printer'} />}
              >
                Comprovativo
              </Button>
            </Grid>
            <div style={{ display: 'none' }}>
              <div ref={attachmentRef}>
                <img
                  src={absenceRequest?.evidenceURL}
                  alt='File Viewer'
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>

            <Grid item xs={12} sm={8}>
              <CustomTextField
                fullWidth
                disabled
                label='Observação'
                multiline
                rows={2}
                value={absenceRequest?.comment}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <Divider>Detalhes da Solicitação</Divider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                multiline
                minRows={2}
                fullWidth
                disabled
                label='Observação do Superior'
                value={absenceRequest?.superior?.comment}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                multiline
                minRows={2}
                fullWidth
                disabled
                label='Observação dos Recursos Humanos'
                value={absenceRequest?.human_resources?.comment}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                multiline
                minRows={2}
                fullWidth
                disabled
                label='Observação da Direcção'
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
                label='Parecer do Superior'
                value={
                  absenceRequest?.superior?.is_approved === 1
                    ? 'Aprovado'
                    : absenceRequest?.superior?.is_approved === 2
                    ? 'Reprovado'
                    : undefined
                }
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Parecer dos Recursos Humanos'
                value={
                  absenceRequest?.human_resources?.is_approved === 1
                    ? 'Aprovado'
                    : absenceRequest?.human_resources?.is_approved === 2
                    ? 'Reprovado'
                    : undefined
                }
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Parecer da Direcção'
                value={
                  absenceRequest?.director?.is_approved === 1
                    ? 'Aprovado'
                    : absenceRequest?.director?.is_approved === 2
                    ? 'Reprovado'
                    : undefined
                }
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button type='reset' color='warning' variant='outlined' LinkComponent={Link} href='/faltas/historico'>
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
