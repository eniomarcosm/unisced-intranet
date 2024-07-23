import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Typography
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid'
import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import IconifyIcon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import ModalProgressBar from 'src/components/dialogs/ProgressBar'
import { firestore } from 'src/configs/firebaseConfig'
import { z } from 'zod'

const anualSchema = z.object({
  year: z.number(),
  status: z.boolean().default(false).optional()
})

export type AnualData = z.infer<typeof anualSchema>

export default function SessaoAnual({}) {
  const [anos, setAnos] = useState<AnualData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<AnualData>({ resolver: zodResolver(anualSchema) })

  const getData = async () => {
    try {
      setIsLoading(true)
      const anosArray: AnualData[] = []
      const querySnapshot = await getDocs(collection(firestore, 'vacation_years'))

      querySnapshot.forEach(doc => {
        anosArray.push(doc.data() as AnualData)
      })

      setAnos(anosArray.sort((a, b) => b.year - a.year))

      setIsLoading(false)
    } catch (error) {
      toast.error('Erro ao solicitar dados!')
      console.log(error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  const handleClickDelete = (id: string) => {
    console.log(id)
  }

  const onSubmit = async (values: FieldValues) => {
    try {
      const newRef = doc(collection(firestore, 'vacation_years'))

      await setDoc(newRef, {
        ...values,
        id: newRef.id
      })

      getData()
      toast.success('Atualizado com sucesso!')
    } catch (error) {
      console.log(error)
      toast.error('Erro ao actualizar dados!')
    }
  }

  const columns: GridColDef[] = [
    {
      flex: 0.8,
      field: 'year',
      headerName: 'Ano Criado',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.year}
        </Typography>
      )
    },
    {
      flex: 0.2,
      field: 'id',
      headerName: 'Acções',
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton color='error' onClick={() => handleClickDelete(params.row.id)}>
            <IconifyIcon fontSize='1.25rem' icon='tabler:trash' />
          </IconButton>
        </>
      )
    }
  ]

  return (
    <Card>
      <CardHeader title='Unidades Orgânicas' />
      <ModalProgressBar open={isLoading} />
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                label='Criar ano'
                required
                defaultValue={0}
                type='number'
                fullWidth
                error={!!errors.year}
                placeholder={errors.year?.message}
                {...register('year', { valueAsNumber: true })}
              />
            </Grid>

            {/* <Grid item xs={12} sm={6}></Grid> */}

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
        <CardContent>
          <Grid container spacing={5}>
            {anos.length === 0 ? (
              <Grid item xs={12} sm={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CircularProgress />
                </Box>
              </Grid>
            ) : (
              <Grid item xs={12} sm={12}>
                <DataGrid
                  autoHeight
                  pagination
                  rows={anos}
                  disableDensitySelector
                  disableColumnFilter
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 10
                      }
                    }
                  }}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true
                    }
                  }}
                  pageSizeOptions={[10, 25, 50]}
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </form>
    </Card>
  )
}

SessaoAnual.acl = {
  action: 'create',
  subject: 'anual-session-map'
}
