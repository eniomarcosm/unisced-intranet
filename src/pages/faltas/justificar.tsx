import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Typography
} from '@mui/material'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { ButtonStyled, ImgStyled, ResetButtonStyled, UserStaffData } from '../colaborador/cadastrar'
import { CustomInputPicker } from 'src/components/forms/DatePickerHelpers'
import CustomTextField from 'src/@core/components/mui/text-field'

import IconifyIcon from 'src/@core/components/icon'
import { firestore, storage } from 'src/configs/firebaseConfig'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'
import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import { useRouter } from 'next/router'
import { SelectiveData } from 'src/types/pages/generalData'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

import DatePicker from 'react-datepicker'

const absenceSchema = z.object({
  id: z.string().optional(),
  reason: z.string(),
  return_time: z.date(),
  start_date: z.any(),
  end_date: z.any(),
  evidenceURL: z.any(),
  comment: z.string()
})

export const isWeekday = (date: Date) => {
  const day = date.getDay()

  return day !== 0 && day !== 6
}

export type AbsenceData = z.infer<typeof absenceSchema>
export default function JustificarFalta({}) {
  const [currentStaff, setCurrentStaff] = useState<UserStaffData>()
  const [motivos, setMotivos] = useState<SelectiveData[]>([])

  const {
    control,
    setValue,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<AbsenceData>({ resolver: zodResolver(absenceSchema) })

  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      try {
        const staffArray: UserStaffData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'staff'))
        querySnapshot.forEach(doc => {
          staffArray.push(doc.data() as UserStaffData)
        })

        const findStaff = staffArray.find(staff => staff.id === user!.staffId)

        setCurrentStaff(findStaff)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
      setIsLoading(false)
    }
    getData()
  }, [user])

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

  // ** Image Uploader

  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/documento-erro.png')

  const [inputValue, setInputValue] = useState<string>('')

  const handleInputImageChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      const selectedFile = files[0]

      reader.onload = () => {
        if (selectedFile.type.toLowerCase() === 'application/pdf') {
          setImgSrc('/images/avatars/documento.png')
        } else {
          setImgSrc(reader.result as string)
        }
      }
      reader.readAsDataURL(files[0])
      setValue('evidenceURL', files[0])

      if (reader.result !== null) {
        setInputValue(reader.result as string)
      }
    }
  }

  const handleInputImageReset = () => {
    setInputValue('')
    setValue('evidenceURL', '')
    setImgSrc('/images/avatars/documento-erro.png')
  }

  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = (values: AbsenceData) => {
    const file = values?.evidenceURL
    if (file) {
      // Create a reference to the storage location
      const storageRef = ref(storage, `documents/absence/${user!.email}/${file.name}`)

      try {
        setIsLoading(true)

        // Upload the file and metadata
        const uploadTask = uploadBytesResumable(storageRef, file)

        const handleProgress = (snapshot: any) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log('Upload is ', progress, '% done')
        }

        const handleError = (error: any) => {
          console.log(error)
          toast.error('Erro ao carregar ficheiro!')
        }

        const handleComplete = async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

          const newRef = doc(collection(firestore, 'absence_justification'))

          await setDoc(newRef, {
            ...values,
            id: newRef.id,
            staffId: currentStaff?.id,
            evidenceURL: downloadURL,
            request_date: new Date()
          })

          await fetch('/api/email/absence/request', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: 'mr.eniomarcos@gmail.com',
              subject: 'Justificação de falta',
              name: `${currentStaff?.name} ${currentStaff?.surname}`,
              start_date: new Intl.DateTimeFormat('pt-BR', {
                dateStyle: 'long'
              }).format(values.start_date),
              end_date: new Intl.DateTimeFormat('pt-BR', {
                dateStyle: 'long'
              }).format(values.end_date)
            })
          })

          toast.success('Dados carregados com sucesso!')
          setIsLoading(false)
          reset()

          router.push('/faltas/historico')
        }

        uploadTask.on('state_changed', handleProgress, handleError, handleComplete)
      } catch (error) {
        toast.error('Erro ao cadastrar prato')
        console.error(error)
        setIsLoading(false)
      }
    } else {
      setError('evidenceURL', {
        type: 'manual',
        message: 'Selecione um arquivo'
      })
    }
  }

  const defaultTime = new Date()
  defaultTime.setHours(8)
  defaultTime.setMinutes(0)
  defaultTime.setSeconds(0)
  defaultTime.setMilliseconds(0)

  return (
    <Card>
      <CardHeader title='Justificar Falta' />
      <Divider />
      <ModalProgressBar open={isLoading} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent sx={{ pt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ImgStyled src={imgSrc} alt='Foto do Comprovativo' />
            <div>
              <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
                Carregar Comprovativo
                <input
                  hidden
                  type='file'
                  value={inputValue}
                  accept='image/png, image/jpeg, image/jpg, application/pdf'
                  onChange={handleInputImageChange}
                  id='account-settings-upload-image'
                />
              </ButtonStyled>
              <ResetButtonStyled color='secondary' variant='tonal' onClick={handleInputImageReset}>
                Limpar
              </ResetButtonStyled>
              <Typography sx={{ mt: 4, color: 'text.disabled' }}>
                Formatos permitidos: PNG, JPG, JPEG, e PDF. Tamanho Máximo de 8MB
              </Typography>
            </div>
          </Box>
        </CardContent>
        <Divider />
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='start_date'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    locale='ptBR'
                    selected={value}
                    showYearDropdown
                    showMonthDropdown
                    required
                    dateFormat='dd/MM/yyyy'
                    onChange={(e: any) => onChange(e)}
                    placeholderText='DD/MM/AAAA'
                    filterDate={isWeekday}
                    customInput={
                      <CustomInputPicker
                        value={value}
                        onChange={onChange}
                        label='Data de Auséncia:'
                        error={Boolean(errors.start_date)}
                        aria-describedby='data-realiazacao'
                        {...(errors.start_date && { helperText: 'Este campo é obrigatório' })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <IconButton>
                                <IconifyIcon icon={'tabler:calendar'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    }
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='end_date'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    locale='ptBR'
                    selected={value}
                    showYearDropdown
                    showMonthDropdown
                    required
                    dateFormat='dd/MM/yyyy'
                    onChange={(e: any) => onChange(e)}
                    placeholderText='DD/MM/AAAA'
                    filterDate={isWeekday}
                    customInput={
                      <CustomInputPicker
                        value={value}
                        onChange={onChange}
                        label='Ao Dia:'
                        error={Boolean(errors.end_date)}
                        aria-describedby='data-realiazacao'
                        {...(errors.end_date && { helperText: 'Este campo é obrigatório' })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <IconButton>
                                <IconifyIcon icon={'tabler:calendar'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='reason'
                control={control}
                render={({ field }) => (
                  <CustomAutocomplete
                    fullWidth
                    options={motivos}
                    value={motivos?.find(option => option.id === field.value) || null}
                    getOptionLabel={option => `${option.name}`}
                    onChange={(_, selectedOptions) => {
                      field.onChange(selectedOptions ? selectedOptions.id : '')
                    }}
                    renderInput={params => (
                      <CustomTextField
                        required
                        {...params}
                        label='Motivo de Ausência:'
                        error={!!errors.reason}
                        helperText={errors.reason?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='return_time'
                control={control}
                defaultValue={defaultTime}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    locale='ptBR'
                    showTimeSelect
                    selected={value}
                    timeIntervals={15}
                    showTimeSelectOnly
                    dateFormat='HH:mm'
                    timeFormat='HH:mm'
                    id='time-only-picker'
                    onChange={date => onChange(date)}
                    customInput={
                      <CustomTextField
                        fullWidth
                        label='Horas de Regresso:'
                        value={
                          value
                            ? value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
                            : ''
                        }
                      />
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <Controller
                name='comment'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    label='Observação:'
                    required
                    multiline
                    minRows={5}
                    fullWidth
                    error={!!errors.comment}
                    placeholder={errors.comment?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Button type='submit' disabled={!isValid} sx={{ mr: 2 }} variant='contained'>
                Submeter
              </Button>
              <Button type='reset' color='secondary' variant='tonal'>
                Limpar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </form>
    </Card>
  )
}

JustificarFalta.acl = {
  action: 'create',
  subject: 'absence-request'
}
