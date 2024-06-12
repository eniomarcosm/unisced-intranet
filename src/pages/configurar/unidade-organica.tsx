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
import { collection, getDocs } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Controller, FieldValues, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import IconifyIcon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import { firestore } from 'src/configs/firebaseConfig'
import { z } from 'zod'

const organicUnitSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  shortname: z.string()
})

export type OrganitUnitData = z.infer<typeof organicUnitSchema>

export default function UnidadeOrganica({}) {
  const [organicUnits, setOrganicUnits] = useState<OrganitUnitData[]>([])

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<OrganitUnitData>({ resolver: zodResolver(organicUnitSchema) })

  useEffect(() => {
    const getData = async () => {
      try {
        const orgunitArray: OrganitUnitData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'organic_unit'))

        querySnapshot.forEach(doc => {
          orgunitArray.push(doc.data() as OrganitUnitData)
        })
        setOrganicUnits(orgunitArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
    }
    getData()
  }, [])

  const handleClickDelete = (id: string) => {
    console.log(id)
  }

  const onSubmit = (values: FieldValues) => {
    console.log(values)
  }

  const columns: GridColDef[] = [
    {
      flex: 0.5,
      field: 'name',
      headerName: 'Nome',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.name}
        </Typography>
      )
    },

    {
      flex: 0.3,
      field: 'shortname',
      headerName: 'Abreviatura',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.shortname}
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
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Grid container spacing={5}>
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
                name='shortname'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    label='Abreviação'
                    required
                    fullWidth
                    error={!!errors.shortname}
                    placeholder={errors.shortname?.message}
                    {...field}
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
        <CardContent>
          <Grid container spacing={5}>
            {organicUnits.length === 0 ? (
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
                  rows={organicUnits}
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
