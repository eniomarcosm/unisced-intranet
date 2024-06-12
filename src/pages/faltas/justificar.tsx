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
import DatePicker from 'react-datepicker'
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

const absenceSchema = z.object({
  id: z.string().optional(),
  reason: z.string(),
  start_date: z.any(),
  end_date: z.any(),
  evidenceURL: z.any()
})

export type AbsenceData = z.infer<typeof absenceSchema>
export default function JustificarFalta() {
  const [currentStaff, setCurrentStaff] = useState<UserStaffData>()

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
                Carregar Comprovatido
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
                Formatos permitidos PNG, JPG, JPEG e PDF. Tamanho Máximo de 8MB
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
                    selected={value}
                    showYearDropdown
                    showMonthDropdown
                    required
                    dateFormat='dd/MM/yyyy'
                    onChange={(e: any) => onChange(e)}
                    placeholderText='DD/MM/AAAA'
                    customInput={
                      <CustomInputPicker
                        value={value}
                        onChange={onChange}
                        label='Data de Auséncia'
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
                    selected={value}
                    showYearDropdown
                    showMonthDropdown
                    dateFormat='dd/MM/yyyy'
                    onChange={(e: any) => onChange(e)}
                    placeholderText='DD/MM/AAAA'
                    customInput={
                      <CustomInputPicker
                        value={value}
                        onChange={onChange}
                        label='Data de Regresso'
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
                  <CustomTextField
                    label='Descrição dos Motivos de Ausência:'
                    required
                    multiline
                    minRows={5}
                    fullWidth
                    error={!!errors.reason}
                    placeholder={errors.reason?.message}
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
