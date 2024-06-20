import {
  Button,
  ButtonProps,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  styled,
  Typography
} from '@mui/material'
import { ChangeEvent, ElementType, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { CustomInputPicker } from 'src/components/forms/DatePickerHelpers'
import CustomTextField from 'src/@core/components/mui/text-field'

import { genders, idTypes } from 'src/constants/user'
import IconifyIcon from 'src/@core/components/icon'
import { SelectiveData } from 'src/types/pages/userStaff'
import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
import { firestore, storage } from 'src/configs/firebaseConfig'

import toast from 'react-hot-toast'
import { Box } from '@mui/system'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import { DepartmentData } from 'src/types/pages/generalData'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

import DatePicker, { registerLocale } from 'react-datepicker'
import ptBR from 'date-fns/locale/pt-BR' // the locale you want

registerLocale('ptBR', ptBR) // register it with the name you want

// import DialogTransition from 'src/components/dialogs/DialogTransition'

export const userStaffSchema = z.object({
  //personal data
  id: z.string().optional(),
  name: z.string(),
  surname: z.string(),
  personal_email: z.string(),
  id_type: z.string(),
  id_number: z.string(),
  nuit: z.string(),
  birthdate: z.any(),
  gender: z.string(),
  contact1: z.string(),
  contact2: z.string().optional(),
  photoURL: z.any(),

  // staff data
  staff_code: z.string(),
  department: z.string(),
  organic_unit: z.string(),
  admited_at: z.any(),
  job_position: z.string()
})

export type UserStaffData = z.infer<typeof userStaffSchema>

export const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(2)
  }
}))

export const ImgStyled = styled('img')(({ theme }) => ({
  width: 150,
  height: 150,
  marginRight: theme.spacing(6),
  borderRadius: theme.shape.borderRadius,
  objectFit: 'cover'
}))

export const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(
  ({ theme }) => ({
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      textAlign: 'center'
    }
  })
)

export default function CreateStaff({}) {
  const [departaments, setDepartaments] = useState<DepartmentData[]>([])
  const [cargos, setCargos] = useState<SelectiveData[]>([])
  const [organicUnit, setOrganicUnit] = useState<SelectiveData[]>([])

  // const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<UserStaffData>({
    resolver: zodResolver(userStaffSchema),
    defaultValues: {
      id: undefined,
      name: '',
      surname: '',
      personal_email: '',
      id_type: '',
      id_number: '',
      nuit: '',
      birthdate: new Date(),
      gender: '',
      contact1: '',
      contact2: '',
      staff_code: '',
      department: '',
      admited_at: new Date()
    }
  })

  const { id_type, organic_unit } = watch()

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

  const [isLoading, setIsLoading] = useState<boolean>(false)

  // const [isDialogOpen, setDialogOpen] = useState(false)

  // ** Image Uploader

  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/3.png')

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
    setImgSrc('/images/avatars/3.png')
  }

  const onSubmit = async (values: UserStaffData) => {
    const file = values?.photoURL

    if (file) {
      // Create a reference to the storage location
      const storageRef = ref(storage, `images/${values.personal_email}/${file.name}`)

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

          const newRef = doc(collection(firestore, 'staff'))

          await setDoc(newRef, {
            ...values,
            id: newRef.id,
            photoURL: downloadURL
          })

          toast.success('Dados carregados com sucesso!')
          setIsLoading(false)
          reset()
        }

        uploadTask.on('state_changed', handleProgress, handleError, handleComplete)
      } catch (error) {
        toast.error('Erro ao cadastrar prato')
        console.error(error)
        setIsLoading(false)
      }
    } else {
      try {
        const newRef = doc(collection(firestore, 'staff'))
        await setDoc(newRef, {
          ...values,
          id: newRef.id,
          photoURL: ''
        })
        toast.success('Dados carregados com sucesso!')
        reset()
      } catch (error) {
        toast.error('Erro ao cadastrar colaborador')
        console.log(error)
      }
    }
  }

  const filterDepartmentos = departaments.filter(dpt => dpt.organic_unit === organic_unit)

  return (
    <Card>
      <CardHeader title='Cadastro de Colaborador' />
      <Divider />
      <ModalProgressBar open={isLoading} />
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
          {/* <DialogTransition
          title='Colaborador'
          description='Pretende Cadastrar o Colaborar?'
          open={isDialogOpen}
          onClose={() => setDialogOpen(false)}
          onConfirm={()=>}
        /> */}
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
                    defaultValue=''
                    select
                    {...field}
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
                    defaultValue=''
                    select
                    {...field}
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
                    defaultValue=''
                    select
                    {...field}
                    error={!!errors.organic_unit}
                    placeholder={errors.organic_unit?.message}
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
                    defaultValue=''
                    select
                    {...field}
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
              <CustomAutocomplete
                fullWidth
                options={cargos}
                getOptionLabel={option => `${option.name}`}
                renderInput={params => (
                  <CustomTextField
                    {...params}
                    label='Cargo'
                    error={!!errors.job_position}
                    helperText={errors.job_position?.message}
                  />
                )}
                onChange={(_, selectedOption) => {
                  setValue('job_position', selectedOption?.id || '')
                }}
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
      </form>
    </Card>
  )
}

CreateStaff.acl = {
  action: 'read',
  subject: 'staff-add'
}
