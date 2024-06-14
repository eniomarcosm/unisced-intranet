import { Button, Card, CardContent, CardHeader, Divider, Grid } from '@mui/material'
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useRef, useState } from 'react'
import { FieldValues } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useReactToPrint } from 'react-to-print'
import IconifyIcon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import AbsenceModalForm from 'src/components/modals/absence/AbsenceModalForm'
import ModalForm from 'src/components/modals/absence/ModalForm'
import { firestore } from 'src/configs/firebaseConfig'
import roles from 'src/constants/roles'
import { AbsenceForm } from 'src/documents/form-absence'
import { useAuth } from 'src/hooks/useAuth'
import { UserStaffData } from 'src/pages/colaborador/cadastrar'
import { AbsenceRequestData, DepartmentData, PrintDataProps, SelectiveData } from 'src/types/pages/generalData'

export default function JustifacaoFaltas({}) {
  const [absenceRequest, setAbsenceRequest] = useState<AbsenceRequestData>()
  const [currentStaf, setCurrentStaff] = useState<UserStaffData>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [cargos, setCargos] = useState<SelectiveData[]>([])
  const [departments, setDepartaments] = useState<DepartmentData[]>([])

  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()

  const getData = async () => {
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

  const [openModal, setOpenModal] = useState(false)

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const [openAbsenceModal, setAbsenceModal] = useState(false)
  const handleOpenAbsenceModal = () => {
    setAbsenceModal(true)
  }

  const handleCloseDateModal = () => {
    setAbsenceModal(false)
  }

  const onSubmit = async (data: FieldValues) => {
    const vacationRequestRef = doc(firestore, 'absence_justification', id as string)

    try {
      setIsLoading(true)
      if (user?.role === roles.director) {
        await updateDoc(vacationRequestRef, {
          ...absenceRequest,
          director: {
            ...data,
            updated_at: new Date(),
            name: user.fullName
          }
        })
        await fetch('/api/email/response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject: 'Resposta ao pedido de faltas',
            email: currentStaf?.personal_email,
            name: `${currentStaf?.name} ${currentStaf?.surname}`,
            start_date: data.start_date,
            end_date: data.end_date,
            days: data.days
          })
        })
      }

      if (user?.role === roles.sessionChief) {
        await updateDoc(vacationRequestRef, {
          ...absenceRequest,
          superior: {
            ...data,
            updated_at: new Date(),
            name: user.fullName
          }
        })
        await fetch('/api/email/response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject: 'Resposta ao pedido de faltas',
            email: currentStaf?.personal_email,
            name: `${currentStaf?.name} ${currentStaf?.surname}`,
            start_date: data.start_date,
            end_date: data.end_date,
            days: data.days
          })
        })
      }

      getData()
      toast.success('Atualizado com sucesso!')
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar')
      setIsLoading(false)
    }
    console.log(data)
    handleCloseModal()
  }

  const onSubmitAbsenceModal = async (data: FieldValues) => {
    const vacationRequestRef = doc(firestore, 'absence_justification', id as string)

    try {
      setIsLoading(true)
      if (user?.role === roles.humanResoursesChief) {
        await updateDoc(vacationRequestRef, {
          ...absenceRequest,
          human_resources: {
            ...data,
            updated_at: new Date(),
            name: user.fullName
          }
        })
        await fetch('/api/email/response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject: 'Resposta ao pedido de faltas',
            email: currentStaf?.personal_email,
            name: `${currentStaf?.name} ${currentStaf?.surname}`,
            start_date: data.start_date,
            end_date: data.end_date,
            days: data.days
          })
        })
      }
      getData()
      toast.success('Atualizado com sucesso!')
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar')
      setIsLoading(false)
    }
    handleCloseDateModal()
  }

  // const values = {
  //   is_approved: absenceRequest?.human_resources?.is_approved,
  //   comment: absenceRequest?.human_resources?.comment,
  //   reason: absenceRequest?.reason
  // }

  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Relatório-Faltas'
  })

  const data: PrintDataProps = {
    name: `${currentStaf?.name} ${currentStaf?.surname}`,
    department: departments?.find(dpt => dpt.id === currentStaf?.department)?.name,
    staff_code: currentStaf?.staff_code,
    request_date: absenceRequest?.request_date?.toDate().toLocaleDateString('pt-BR'),
    reason: absenceRequest?.reason,
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
      {/* <Card>
        <CardHeader title='Detalhes da Solicitação' />
      </Card> */}
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

            <>
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
                <Divider>Resposta da Solicitação</Divider>
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
                  label='Estado dos Recursos Humanos'
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
                  label='Estado da Direcção'
                  value={
                    absenceRequest?.director?.is_approved === 1
                      ? 'Aprovado'
                      : absenceRequest?.director?.is_approved === 2
                      ? 'Reprovado'
                      : undefined
                  }
                />
              </Grid>

              <ModalForm isOpen={openModal} onClose={handleCloseModal} onSubmit={onSubmit} />

              <AbsenceModalForm
                isOpen={openAbsenceModal}
                onClose={handleCloseDateModal}
                onSubmit={onSubmitAbsenceModal}
              />

              {[, roles.sessionChief].includes(user!.role) && (
                <Grid item xs={12} lg={4} sm={4}>
                  <Button
                    type='submit'
                    sx={{ mr: 4 }}
                    onClick={handleOpenModal}
                    startIcon={<IconifyIcon icon={'tabler:checks'} />}
                    variant='contained'
                  >
                    Resposta
                  </Button>
                </Grid>
              )}
              {[, roles.director].includes(user!.role) && (
                <Grid item xs={12} lg={4} sm={4}>
                  <Button
                    type='submit'
                    sx={{ mr: 4 }}
                    disabled={!absenceRequest?.human_resources}
                    onClick={handleOpenModal}
                    startIcon={<IconifyIcon icon={'tabler:checks'} />}
                    variant='contained'
                  >
                    Resposta
                  </Button>
                </Grid>
              )}

              {[roles.humanResoursesChief, roles.admin].includes(user!.role) && (
                <Grid item xs={12} lg={4} sm={4}>
                  <Button
                    type='reset'
                    sx={{ mr: 4 }}
                    color='warning'
                    disabled={!absenceRequest?.superior}
                    variant='contained'
                    onClick={handleOpenAbsenceModal}
                    startIcon={<IconifyIcon icon={'tabler:checks'} />}
                  >
                    Resposta
                  </Button>
                </Grid>
              )}
              <Grid item lg={4} sm={4}>
                <Button
                  type='reset'
                  color='warning'
                  variant='outlined'
                  LinkComponent={Link}
                  href='/faltas/solicitacao'
                  startIcon={<IconifyIcon icon={'tabler:arrow-left'} />}
                >
                  Voltar
                </Button>
              </Grid>
            </>
          </Grid>
        </CardContent>
      </Card>
    </Fragment>
  )
}

JustifacaoFaltas.acl = {
  action: 'read',
  subject: 'absence-request'
}
