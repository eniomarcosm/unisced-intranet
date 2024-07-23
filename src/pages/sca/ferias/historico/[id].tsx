/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Card, CardContent, CardHeader, Divider, Grid } from '@mui/material'
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useRef, useState } from 'react'
import { FieldValues } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useReactToPrint } from 'react-to-print'
import IconifyIcon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import VacationDateModalForm from 'src/components/modals/vacation/VacationDateModalForm'
import { firestore } from 'src/configs/firebaseConfig'
import { AbsenceForm } from 'src/documents/form-absence'
import { useAuth } from 'src/hooks/useAuth'
import { UserStaffData } from 'src/pages/sca/colaborador/cadastrar'
import {
  AbsenceRequestData,
  DepartmentData,
  PrintDataProps,
  SelectiveData,
  VacationRequestData
} from 'src/types/pages/generalData'

export default function ViewVacationRequest({}) {
  const [vacationRequest, setVacationRequest] = useState<VacationRequestData[]>([])
  const [currentStaff, setCurrentStaff] = useState<UserStaffData>()
  const [departments, setDepartaments] = useState<DepartmentData[]>([])
  const [cargos, setCargos] = useState<SelectiveData[]>([])
  const [absenceRequest, setAbsenceRequest] = useState<AbsenceRequestData[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  const { user } = useAuth()
  const { id } = router.query

  // const getData = async () => {
  //   setIsLoading(true)
  //   try {
  //     const vacationRequestRef = doc(collection(firestore, 'vacation_request'), id as string)
  //     const staffSnapshot = await getDoc(vacationRequestRef)

  //     if (staffSnapshot.exists()) {
  //       const vacationData = staffSnapshot.data() as VacationRequestData
  //       setCurrentVacationRequest(vacationData)
  //     } else {
  //       toast.error('Solicitação não encontrada!')
  //     }
  //   } catch (error) {
  //     toast.error('Erro ao solicitar dados!')
  //     console.error(error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }
  // useEffect(() => {
  //   getData()
  // }, [id])

  const getData = async () => {
    setIsLoading(true)
    try {
      const vacationRequestArray: VacationRequestData[] = []
      const querySnapshot = await getDocs(
        query(collection(firestore, 'vacation_request'), where('staffId', '==', user!.staffId))
      )
      querySnapshot.forEach(doc => {
        vacationRequestArray.push(doc.data() as VacationRequestData)
      })

      setVacationRequest(vacationRequestArray)
    } catch (error) {
      toast.error('Erro ao solicitar dados!')
      console.log(error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    getData()
  }, [user])

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

  const currentVacationRequest = vacationRequest?.find(vRequest => vRequest.id === id)

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
          }
        }
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    getData()
  }, [currentVacationRequest])

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
        const absenceRequestArray: AbsenceRequestData[] = []
        const querySnapshot = await getDocs(
          query(collection(firestore, 'absence_justification'), where('staffId', '==', user!.staffId))
        )
        querySnapshot.forEach(doc => {
          absenceRequestArray.push(doc.data() as AbsenceRequestData)
        })

        setAbsenceRequest(absenceRequestArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
      setIsLoading(false)
    }
    getData()
  }, [user])

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

  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Relatório-'
  })

  const data: PrintDataProps = {
    name: `${currentStaff?.name} ${currentStaff?.surname}`,
    department: departments?.find(dpt => dpt.id === currentStaff?.department)?.name,
    staff_code: currentStaff?.staff_code,
    request_date: currentVacationRequest?.request_date?.toDate().toLocaleDateString('pt-BR'),
    reason: currentVacationRequest?.reason,
    start_date: currentVacationRequest?.start_date?.toDate().toLocaleDateString('pt-BR'),
    end_date: currentVacationRequest?.end_date?.toDate().toLocaleDateString('pt-BR'),
    superior: currentVacationRequest?.superior,
    job_position: cargos?.find(cargo => cargo.id === currentStaff?.job_position)?.name,
    human_resources: currentVacationRequest?.human_resources,
    director: currentVacationRequest?.director
  }

  const [openDateModal, setOpenDateModal] = useState(false)

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

      // await fetch('/api/email/response', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     subject: 'Resposta ao pedido de férias',
      //     email: currentStaff?.personal_email,
      //     name: `${currentStaff?.name} ${currentStaff?.surname}`,
      //     start_date: data.start_date,
      //     end_date: data.end_date,
      //     days: data.days
      //   })
      // })

      getData()
      toast.success('Atualizado com sucesso!')
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar')
      setIsLoading(false)
    }

    setOpenDateModal(false)
  }

  // const values = {
  //   start_date: currentVacationRequest?.start_date?.toDate(),
  //   end_date: currentVacationRequest?.end_date?.toDate(),
  //   days: currentVacationRequest?.days,
  //   reason: currentVacationRequest?.reason
  // }

  return (
    <Fragment>
      <ModalProgressBar open={isLoading} />
      <VacationDateModalForm
        isOpen={openDateModal}
        onClose={() => setOpenDateModal(false)}
        onSubmit={onSubmitDateModal}
        values={currentVacationRequest}
        vacationRequest={vacationRequest || []}
        currentStaff={currentStaff}
        absenceRequest={absenceRequest || []}
      />
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
                disabled={!(currentVacationRequest?.director?.is_approved === 1)}
                color='warning'
                startIcon={<IconifyIcon icon={'tabler:printer'} />}
              >
                Imprimir
              </Button>
              {currentStaff && (
                <div style={{ display: 'none' }}>
                  <AbsenceForm ref={componentRef} data={data} />
                </div>
              )}
            </Grid>

            {/* <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Nome Completo'
                value={`${currentStaff?.name} ${currentStaff?.surname}`}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Cargo'
                value={cargos.find(cargo => cargo.id === currentStaff?.job_position)?.name}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <CustomTextField fullWidth disabled label='Códico do Trabalhador' value={currentStaff?.staff_code} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <CustomTextField fullWidth disabled label='Contacto' value={currentStaff?.contact1} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <CustomTextField fullWidth disabled label='Contacto Alternativo' value={`${currentStaff?.contact2}`} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Data de Contratação'
                value={`${currentStaff?.admited_at?.toDate().toLocaleDateString('pt-BR')}`}
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

            {/* <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                disabled
                label='Número de Dias Restantes'
                value={currentVacationRequest?.days}
              />
            </Grid> */}

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
                label='Parecer do Superior'
                value={
                  currentVacationRequest?.superior?.is_approved === 1
                    ? 'Aprovado'
                    : currentVacationRequest?.superior?.is_approved === 2
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
                  currentVacationRequest?.human_resources?.is_approved === 1
                    ? 'Aprovado'
                    : currentVacationRequest?.human_resources?.is_approved === 2
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
                  currentVacationRequest?.director?.is_approved === 1
                    ? 'Aprovado'
                    : currentVacationRequest?.director?.is_approved === 2
                    ? 'Reprovado'
                    : undefined
                }
              />
            </Grid>

            <Grid item lg={3} sm={3}>
              <Button
                type='reset'
                color='primary'
                variant='contained'
                disabled={currentVacationRequest?.superior?.is_approved === 1}
                startIcon={<IconifyIcon icon={'tabler:pencil'} />}
                onClick={() => setOpenDateModal(true)}
              >
                Editar
              </Button>
            </Grid>

            <Grid item lg={3} sm={3}>
              <Button
                type='reset'
                color='warning'
                variant='outlined'
                LinkComponent={Link}
                href='/ferias/historico'
                startIcon={<IconifyIcon icon={'tabler:arrow-left'} />}
              >
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
