/* eslint-disable lines-around-comment */
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
  MenuItem,
  Typography
} from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from 'src/@core/components/mui/text-field'

import { genders, idTypes } from 'src/constants/user'
import IconifyIcon from 'src/@core/components/icon'
import { SelectiveData } from 'src/types/pages/userStaff'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { firestore } from 'src/configs/firebaseConfig'
import toast from 'react-hot-toast'
import { ButtonStyled, ImgStyled, ResetButtonStyled, UserStaffData, userStaffSchema } from './cadastrar'
import { useRouter } from 'next/router'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { DepartmentData } from 'src/types/pages/generalData'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import { CustomInputPicker } from 'src/components/forms/DatePickerHelpers'

import DatePicker from 'react-datepicker'

export default function CreateStaff({}) {
  const [departaments, setDepartaments] = useState<DepartmentData[]>([])
  const [selectedStaff, setSelectedStaff] = useState<UserStaffData>()
  const [cargos, setCargos] = useState<SelectiveData[]>([])
  const [organicUnit, setOrganicUnit] = useState<SelectiveData[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<UserStaffData>({
    resolver: zodResolver(userStaffSchema),
    defaultValues: {}
  })

  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      try {
        const staffRef = doc(collection(firestore, 'staff'), router.query!.staffId as string)
        const staffSnapshot = await getDoc(staffRef)

        if (staffSnapshot.exists()) {
          let staffData = staffSnapshot.data() as UserStaffData

          staffData = {
            ...staffData,
            admited_at: staffData.admited_at.toDate(),
            birthdate: staffData.birthdate.toDate()
          }

          if (staffData) {
            reset(staffData) // Update form values with the fetched data
          }

          setSelectedStaff(staffData)
        }
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
    }
    getData()
  }, [reset, router, setValue])

  const { id_type, organic_unit } = watch()

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
        const dtpsArray: DepartmentData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'departments'))

        querySnapshot.forEach(doc => {
          dtpsArray.push(doc.data() as DepartmentData)
        })
        setDepartaments(dtpsArray)
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
        const dataArray: SelectiveData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'organic_unit'))

        querySnapshot.forEach(doc => {
          dataArray.push(doc.data() as SelectiveData)
        })
        setOrganicUnit(dataArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
    }
    getData()
  }, [])

  const onSubmit = async (values: UserStaffData) => {
    try {
      setIsLoading(true)
      // Check if we are updating an existing staff member
      const staffId = selectedStaff?.id
      const staffRef = staffId ? doc(firestore, 'staff', staffId) : doc(collection(firestore, 'staff'))

      await setDoc(staffRef, {
        ...values,
        id: staffRef.id
      })

      toast.success(staffId ? 'Dados atualizados com sucesso!' : 'Dados carregados com sucesso!')
      reset(values)

      if (!staffId) {
        router.push(`/colaborador/${staffRef.id}`)
      }
      setIsLoading(false)
    } catch (error) {
      toast.error('Erro ao cadastrar ou atualizar restaurante')
      console.log(error)
    }
    console.log(values)
  }

  const filterDepartmentos = departaments.filter(dpt => dpt.organic_unit === organic_unit)

  // ** Image Uploader

  const [imgSrc, setImgSrc] = useState<string>('/sca/images/avatars/3.png')

  const [inputValue, setInputValue] = useState<string>('')

  const handleInputImageChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(files[0])
      setValue('photoURL', files[0])

      if (reader.result !== null) {
        setInputValue(reader.result as string)
      }
    }
  }

  const handleInputImageReset = () => {
    setInputValue('')
    setValue('photoURL', '')
    setImgSrc('/sca/images/avatars/3.png')
  }

  return (
    <Card>
      <CardHeader title='Cadastro de Colaborador' />
      <Divider />
      <ModalProgressBar open={isLoading} />
      <>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent sx={{ pt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImgStyled src={imgSrc} alt='Foto do Colaborador' />
              <div>
                <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
                  Carregar Foto
                  <input
                    hidden
                    type='file'
                    value={inputValue}
                    accept='image/png, image/jpeg, image/jpg'
                    onChange={handleInputImageChange}
                    id='account-settings-upload-image'
                  />
                </ButtonStyled>
                <ResetButtonStyled color='secondary' variant='tonal' onClick={handleInputImageReset}>
                  Limpar
                </ResetButtonStyled>
                <Typography sx={{ mt: 4, color: 'text.disabled' }}>
                  Formatos permitidos PNG, JPG eJPEG. Tamanho Máximo de 8MB
                </Typography>
              </div>
            </Box>
          </CardContent>
          <Divider />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='name'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Nome'
                      required
                      fullWidth
                      error={!!errors.name}
                      placeholder={errors.name?.message}
                      {...field}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='surname'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Apelido'
                      required
                      fullWidth
                      error={!!errors.surname}
                      placeholder={errors.surname?.message}
                      {...field}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='gender'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Sexo'
                      fullWidth
                      required
                      select
                      value={field.value || ''} // Explicitly set the value
                      onChange={field.onChange}
                      // {...field}
                      error={!!errors.gender}
                      placeholder={errors.gender?.message}
                    >
                      {genders.map(gender => (
                        <MenuItem key={gender} value={gender}>
                          {gender}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name='id_type'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Tipo de Identificação'
                      fullWidth
                      required
                      select
                      value={field.value || ''}
                      onChange={field.onChange}
                      // {...field}
                      error={!!errors.id_type}
                      placeholder={errors.id_type?.message}
                    >
                      {idTypes.map(idType => (
                        <MenuItem key={idType} value={idType}>
                          {idType}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name='id_number'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Número do Documento'
                      required
                      disabled={!id_type}
                      fullWidth
                      error={!!errors.id_number}
                      placeholder={errors.id_number?.message}
                      {...field}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name='nuit'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='NUIT'
                      required
                      fullWidth
                      error={!!errors.nuit}
                      placeholder={errors.nuit?.message}
                      {...field}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name='birthdate'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      locale='ptBR'
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
                          label='Data de Nascimento'
                          error={Boolean(errors.birthdate)}
                          aria-describedby='data-realiazacao'
                          {...(errors.birthdate && { helperText: 'Este campo é obrigatório' })}
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

              <Grid item xs={12} sm={12}>
                <Divider>Informações de Contacto</Divider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='personal_email'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Email Pessoal'
                      required
                      type='email'
                      fullWidth
                      error={!!errors.personal_email}
                      placeholder={errors.personal_email?.message}
                      {...field}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='contact1'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Contacto Primário'
                      required
                      fullWidth
                      error={!!errors.contact1}
                      placeholder={errors.contact1?.message}
                      {...field}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='contact2'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Contacto Secundário'
                      fullWidth
                      error={!!errors.contact2}
                      placeholder={errors.contact2?.message}
                      {...field}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider>Informações Corporativas </Divider>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name='staff_code'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Codico do Trabalhador'
                      fullWidth
                      error={!!errors.staff_code}
                      placeholder={errors.staff_code?.message}
                      {...field}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='organic_unit'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Unidade Orgânica'
                      fullWidth
                      required
                      select
                      value={field.value || ''}
                      onChange={field.onChange}
                      error={!!errors.organic_unit}
                      placeholder={errors.organic_unit?.message}

                      // {...field}
                    >
                      {organicUnit.map(orgUnit => (
                        <MenuItem key={orgUnit.id} value={orgUnit.id}>
                          {`${orgUnit.name}`}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='department'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Departamento'
                      fullWidth
                      required
                      defaultValue={selectedStaff?.department}
                      select
                      value={field.value || ''}
                      onChange={field.onChange}
                      // {...field}
                      error={!!errors.department}
                      placeholder={errors.department?.message}
                    >
                      {filterDepartmentos.map(dpt => (
                        <MenuItem key={dpt.id} value={dpt.id}>
                          {`${dpt.name}-${dpt.shortname}`}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='job_position'
                  control={control}
                  render={({ field }) => (
                    <CustomAutocomplete
                      fullWidth
                      options={cargos}
                      getOptionLabel={option => `${option.name}`}
                      value={cargos.find(option => option.id === field.value) || null}
                      onChange={(_, selectedOption) => {
                        field.onChange(selectedOption ? selectedOption.id : '')
                      }}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label='Cargo'
                          error={!!errors.job_position}
                          helperText={errors.job_position?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='admited_at'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      locale='ptBR'
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
                          label='Data de Admissão'
                          error={Boolean(errors.admited_at)}
                          aria-describedby='data-realiazacao'
                          {...(errors.admited_at && { helperText: 'Este campo é obrigatório' })}
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

              <Grid item xs={12} sm={12}>
                <Button type='submit' disabled={!isValid} sx={{ mr: 2 }} variant='contained'>
                  Guardar
                </Button>
                <Button type='reset' color='secondary' variant='tonal'>
                  Limpar
                </Button>
              </Grid>
            </Grid>
          </CardContent>

          <CardContent />
        </form>
      </>
    </Card>
  )
}

CreateStaff.acl = {
  action: 'create',
  subject: 'staff-edit'
}
