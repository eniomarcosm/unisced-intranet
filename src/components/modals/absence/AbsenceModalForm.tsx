import React, { useEffect, useState } from 'react'
import { Controller, FieldValues, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Card, Grid, MenuItem } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { Box } from '@mui/system'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { SelectiveData } from 'src/types/pages/generalData'
import { collection, getDocs } from 'firebase/firestore'
import { firestore } from 'src/configs/firebaseConfig'
import toast from 'react-hot-toast'

// Define the Zod schema and types for form data
const vacationDateSchema = z.object({
  comment: z.string(),
  is_approved: z.number(),
  sactions: z.string().array()
})

type VacationDate = z.infer<typeof vacationDateSchema>

type DateModalFormProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FieldValues) => void // Update onSubmit prop type
  // values: Partial<VacationDate>
}

const AbsenceModalForm: React.FC<DateModalFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [penalizacoes, setPenalizacoes] = useState<SelectiveData[]>([])

  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<VacationDate>({
    resolver: zodResolver(vacationDateSchema)
  })

  useEffect(() => {
    const getData = async () => {
      try {
        const penalizationsArray: SelectiveData[] = []
        const querySnapshot = await getDocs(collection(firestore, 'absence_penalties'))

        querySnapshot.forEach(doc => {
          penalizationsArray.push(doc.data() as SelectiveData)
        })
        setPenalizacoes(penalizationsArray)
      } catch (error) {
        toast.error('Erro ao solicitar dados!')
        console.log(error)
      }
    }
    getData()
  }, [])

  console.log(getValues())

  return (
    <Card>
      <Dialog open={isOpen} onClose={onClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Pass handleSubmit to onSubmit prop */}
          <DialogTitle id='customized-dialog-title' sx={{ p: 4 }}>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Typography variant='h6' component='span'>
                Resposta de Solicitação
              </Typography>
              <IconButton aria-label='close' color='error' onClick={onClose}>
                <Icon icon='tabler:x' fontSize='1.25rem' />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ p: theme => theme.spacing(4) + ' !important' }}>
            <Grid container spacing={8} sx={{ pb: 8 }}>
              <Grid item xs={12} sm={12}>
                <Controller
                  name='is_approved'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Estado'
                      fullWidth
                      required
                      defaultValue={0}
                      select
                      {...field}
                      sx={{ marginBottom: theme => theme.spacing(3) }} // Adjust spacing below the input
                      error={!!errors.is_approved}
                      placeholder={errors.is_approved?.message}
                    >
                      <MenuItem value={0}>Selecione Resposta</MenuItem>
                      <MenuItem value={1}>Aprovado</MenuItem>
                      <MenuItem value={2}>Reprovado</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <Controller
                  name='sactions'
                  control={control}
                  render={({ field }) => (
                    <CustomAutocomplete
                      fullWidth
                      multiple
                      options={penalizacoes}
                      getOptionLabel={option => `${option.name}`}
                      onChange={(_, selectedOptions) => {
                        field.onChange(selectedOptions ? selectedOptions.map(option => option.id) : [])
                      }}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label='Penalizações Consequêntes'
                          error={!!errors.sactions}
                          helperText={errors.sactions?.message}
                        />
                      )}
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
                      label='Parecer'
                      required
                      multiline
                      minRows={3}
                      fullWidth
                      error={!!errors.comment}
                      placeholder={errors.comment?.message}
                      {...field}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: theme => theme.spacing(3) + ' !important' }}>
            <Button variant='contained' disabled={!isValid} type='submit'>
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Card>
  )
}

export default AbsenceModalForm
