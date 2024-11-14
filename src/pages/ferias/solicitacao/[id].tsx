import { Button, Card, CardContent, CardHeader, Divider, Grid } from '@mui/material'
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import CustomTextField from 'src/@core/components/mui/text-field'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import { firestore } from 'src/configs/firebaseConfig'
import { useAuth } from 'src/hooks/useAuth'
import { UserStaffData } from 'src/pages/colaborador/cadastrar'
import { PrintDataProps, SelectiveData, VacationRequestData } from 'src/types/pages/generalData'
import { FieldValues } from 'react-hook-form'
import roles from 'src/constants/roles'
import DateModalForm from './DateModalForm'
import ModalForm from 'src/components/modals/absence/ModalForm'
import { AbsenceForm } from 'src/documents/form-absence'
import IconifyIcon from 'src/@core/components/icon'
import { useReactToPrint } from 'react-to-print'
import { DepartmentData } from 'src/pages/configurar/departamento'

export default function ViewVacationRequest({}) {
  const [currentVacationRequest, setCurrentVacationRequest] = useState<VacationRequestData>()
  const [currentStaf, setCurrentStaff] = useState<UserStaffData>()
  const [cargos, setCargos] = useState<SelectiveData[]>([])
  const [departments, setDepartaments] = useState<DepartmentData[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const router = useRouter()
  const { id } = router.query

  const { user } = useAuth()

  const getData = async () => {
    try {
      setIsLoading(true)

      const vacationRequestRef = doc(collection(firestore, 'vacation_request'), id as string)
      const staffSnapshot = await getDoc(vacationRequestRef)

      if (staffSnapshot.exists()) {
        const vacationData = staffSnapshot.data() as VacationRequestData
        setCurrentVacationRequest(vacationData)
      } else {
        toast.error('Solicitação não encontrada!')
      }
      setIsLoading(false)
    } catch (error) {
      toast.error('Erro ao solicitar dados!')
      console.error(error)
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
        setIsLoading(true)

        if (currentVacationRequest?.staffId) {
          const staffRef = doc(collection(firestore, 'staff'), currentVacationRequest.staffId as string)
          const staffSnapshot = await getDoc(staffRef)

          if (staffSnapshot.exists()) {
            const staffData = staffSnapshot.data() as UserStaffData
            setCurrentStaff(staffData)
          } else {
            toast.error('Solicitação não encontrada!')
          }
          setIsLoading(false)
        }
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.error(error)
        setIsLoading(false)
      }
    }

    getData()
  }, [currentVacationRequest])

  const [openModal, setOpenModal] = useState(false)

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const onSubmit = async (data: FieldValues) => {
    const vacationRequestRef = doc(firestore, 'vacation_request', id as string)

    try {
      setIsLoading(true)
      if (user?.role === roles.humanResoursesChief) {
        await updateDoc(vacationRequestRef, {
          ...currentVacationRequest,
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
            subject: 'Resposta ao pedido de férias',
            email: currentStaf?.personal_email,
            name: `${currentStaf?.name} ${currentStaf?.surname}`,
            start_date: data.start_date,
            end_date: data.end_date,
            days: data.days
          })
        })
      }

      if (user?.role === roles.director) {
        await updateDoc(vacationRequestRef, {
          ...currentVacationRequest,
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
            subject: 'Resposta ao pedido de férias',
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
          ...currentVacationRequest,
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
            subject: 'Resposta ao pedido de férias',
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

  const [openDateModal, setOpenDateModal] = useState(false)
  const handleOpenDateModal = () => {
    setOpenDateModal(true)
  }

  const handleCloseDateModal = () => {
    setOpenDateModal(false)
  }

  const onSubmitDateModal = async (data: FieldValues) => {
    const vacationRequestRef = doc(firestore, 'vacation_request', id as string)

    try {
      setIsLoading(true)
      await updateDoc(vacationRequestRef, {
        ...currentVacationRequest,
        start_date: data.start_date,
        end_date: data.end_date,
        days: data.days,

        updated_at: new Date()
      })

      await fetch('/api/email/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: 'Resposta ao pedido de férias',
          email: currentStaf?.personal_email,
          name: `${currentStaf?.name} ${currentStaf?.surname}`,
          start_date: data.start_date,
          end_date: data.end_date,
          days: data.days
        })
      })

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

  const values = {
    start_date: currentVacationRequest?.start_date?.toDate(),
    end_date: currentVacationRequest?.end_date?.toDate(),
    days: currentVacationRequest?.days,
    reason: currentVacationRequest?.reason
  }

  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Relatório-Férias'
  })

  const data: PrintDataProps = {
    name: `${currentStaf?.name} ${currentStaf?.surname}`,
    department: departments?.find(dpt => dpt.id === currentStaf?.department)?.name,
    staff_code: currentStaf?.staff_code,
    request_date: currentVacationRequest?.request_date?.toDate().toLocaleDateString('pt-BR'),
    reason: currentVacationRequest?.reason,
    start_date: currentVacationRequest?.start_date?.toDate().toLocaleDateString('pt-BR'),
    end_date: currentVacationRequest?.end_date?.toDate().toLocaleDateString('pt-BR'),
    superior: currentVacationRequest?.superior,
    job_position: cargos?.find(cargo => cargo.id === currentStaf?.job_position)?.name,
    human_resources: currentVacationRequest?.human_resources,
    director: currentVacationRequest?.director
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
                disabled={!(currentVacationRequest?.director?.is_approved === 1)}
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

            <Grid item xs={12} sm={12}>
              <Divider>Detalhes da Solicitação</Divider>
            </Grid>

            <>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  disabled
                  label='Data de Início'
                  value={currentVacationRequest?.start_date?.toDate().toLocaleDateString('pt-BR')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  disabled
                  label='Data de Término'
                  value={currentVacationRequest?.end_date?.toDate().toLocaleDateString('pt-BR')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  disabled
                  label='Número de Dias Solicitados'
                  value={currentVacationRequest?.days}
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <CustomTextField
                  fullWidth
                  disabled
                  label='Motivos'
                  multiline
                  rows={2}
                  value={currentVacationRequest?.reason}
                />
              </Grid>

              {/* <Grid item xs={12} sm={4}>
              <CustomTextField
              fullWidth
              disabled
              label='Número de Dias Restantes'
              value={currentVacationRequest?.days}
              />
              </Grid> */}

              <Grid item xs={12} sm={12}>
                <Divider>Resposta da Solicitação</Divider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  multiline
                  minRows={2}
                  fullWidth
                  disabled
                  label='Observação do Superior'
                  value={currentVacationRequest?.superior?.comment}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  multiline
                  minRows={2}
                  fullWidth
                  disabled
                  label='Observação dos Recursos Humanos'
                  value={currentVacationRequest?.human_resources?.comment}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  multiline
                  minRows={2}
                  fullWidth
                  disabled
                  label='Observação da Direcção'
                  value={currentVacationRequest?.director?.comment}
                />
              </Grid>

              {/*// ** Division */}
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  disabled
                  label='Data do Superior '
                  value={currentVacationRequest?.superior?.updated_at?.toDate().toLocaleDateString('pt-BR')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  disabled
                  label='Data dos Recursos Humanos'
                  value={currentVacationRequest?.human_resources?.updated_at?.toDate().toLocaleDateString('pt-BR')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  disabled
                  label='Data da Direcção'
                  value={currentVacationRequest?.director?.updated_at?.toDate().toLocaleDateString('pt-BR')}
                />
              </Grid>

              {/*// ** Division */}
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  disabled
                  label='Despacho do Superior'
                  value={
                    currentVacationRequest?.superior?.is_approved === 1
                      ? 'Autorizado'
                      : currentVacationRequest?.superior?.is_approved === 2
                      ? 'Não Autorizado'
                      : undefined
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  disabled
                  label='Despacho dos Recursos Humanos'
                  value={
                    currentVacationRequest?.human_resources?.is_approved === 1
                      ? 'Autorizado'
                      : currentVacationRequest?.human_resources?.is_approved === 2
                      ? 'Não Autorizado'
                      : undefined
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  disabled
                  label='Despacho da Direcção'
                  value={
                    currentVacationRequest?.director?.is_approved === 1
                      ? 'Autorizado'
                      : currentVacationRequest?.director?.is_approved === 2
                      ? 'Não Autorizado'
                      : undefined
                  }
                />
              </Grid>
            </>
            <ModalForm isOpen={openModal} onClose={handleCloseModal} onSubmit={onSubmit} />

            <DateModalForm
              values={values}
              isOpen={openDateModal}
              onClose={handleCloseDateModal}
              onSubmit={onSubmitDateModal}
            />
            {[roles.humanResoursesChief, roles.admin].includes(user!.role) && (
              <Grid item xs={12} sm={3}>
                <Button
                  type='submit'
                  disabled={!currentVacationRequest?.superior}
                  sx={{ mr: 4 }}
                  onClick={handleOpenModal}
                  variant='contained'
                >
                  Dar Resposta
                </Button>
              </Grid>
            )}
            {[roles.sessionChief].includes(user!.role) && (
              <Grid item xs={12} sm={3}>
                <Button type='submit' sx={{ mr: 4 }} onClick={handleOpenModal} variant='contained'>
                  Dar Resposta
                </Button>
              </Grid>
            )}
            {[roles.director].includes(user!.role) && (
              <Grid item xs={12} sm={3}>
                <Button
                  type='submit'
                  disabled={!currentVacationRequest?.human_resources}
                  sx={{ mr: 4 }}
                  onClick={handleOpenModal}
                  variant='contained'
                >
                  Dar Resposta
                </Button>
              </Grid>
            )}
            {[roles.humanResoursesChief, roles.admin].includes(user!.role) && (
              <Grid item xs={12} sm={3}>
                <Button
                  type='reset'
                  disabled={!currentVacationRequest?.superior}
                  sx={{ mr: 4 }}
                  color='warning'
                  variant='contained'
                  onClick={handleOpenDateModal}
                >
                  Ajustar Datas
                </Button>
              </Grid>
            )}
            <Grid item xs={12} sm={3}>
              <Button type='reset' color='warning' variant='outlined' LinkComponent={Link} href='/ferias/solicitacao'>
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
  subject: 'vacation-response'
}
