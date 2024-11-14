import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Grid, MenuItem } from '@mui/material'
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

// Define the Zod schema and types for form data
const schema = z.object({
  is_approved: z.number(),
  comment: z.string()
})

type FormData = z.infer<typeof schema>

type ModalFormProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormData) => void // Update onSubmit prop type
}

const ModalForm: React.FC<ModalFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  return (
    <div>
      <Dialog open={isOpen} onClose={onClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Pass handleSubmit to onSubmit prop */}
          <DialogTitle id='customized-dialog-title' sx={{ p: 4 }}>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Typography variant='h6' component='span'>
                Confirmação de Solicitação
              </Typography>
              <IconButton aria-label='close' color='error' onClick={onClose}>
                <Icon icon='tabler:x' fontSize='1.25rem' />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ p: theme => theme.spacing(4) + ' !important' }}>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={12}>
                <Controller
                  name='is_approved'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Despacho'
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
                      <MenuItem value={1}>Autorizado</MenuItem>
                      <MenuItem value={2}>Não Autorizado</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <Controller
                  name='comment'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      label='Despacho'
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
            <Button variant='outlined' type='reset'>
              Limpar
            </Button>
            <Button variant='contained' disabled={!isValid} type='submit'>
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}

export default ModalForm
