import React, { ChangeEvent, useEffect } from 'react'
import { Controller, FieldValues, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Card, Grid, InputAdornment } from '@mui/material'
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
import IconifyIcon from 'src/@core/components/icon'
import { Box } from '@mui/system'
import DatePicker from 'react-datepicker'
import { CustomInputPicker } from 'src/components/forms/DatePickerHelpers'

// Define the Zod schema and types for form data
const vacationDateSchema = z.object({
  start_date: z.any(),
  end_date: z.any().optional(),
  days: z.number(),
  reason: z.string().optional()
})

type VacationDate = z.infer<typeof vacationDateSchema>

type DateModalFormProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FieldValues) => void // Update onSubmit prop type
  values: Partial<{
    start_date: Date
    end_date: Date
    days: number
    reason: string
  }>
}

const DateModalForm: React.FC<DateModalFormProps> = ({ values, isOpen, onClose, onSubmit }) => {
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch
  } = useForm<VacationDate>({
    resolver: zodResolver(vacationDateSchema),
    defaultValues: {
      start_date: values?.start_date,
      end_date: values?.end_date,
      days: values?.days,
      reason: values?.reason
    }
  })

  const { start_date, end_date, days } = watch()

  useEffect(() => {
    reset(values)
  }, [reset, values])

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const days = parseInt(value, 10) | 0
    setValue('days', days)

    const endDate = new Date(start_date)
    endDate.setDate(start_date.getDate() + days)
    setValue('end_date', endDate)
  }

  return (
    <Card>
      <Dialog open={isOpen} onClose={onClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Pass handleSubmit to onSubmit prop */}
          <DialogTitle id='customized-dialog-title' sx={{ p: 4 }}>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Typography variant='h6' component='span'>
                Modal title
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
                  name={'start_date'} // Use array notation for the name
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      selected={value}
                      showYearDropdown
                      showMonthDropdown
                      dateFormat='dd/MM/yyyy'
                      onChange={date => onChange(date)}
                      placeholderText='DD/MM/AAAA'
                      customInput={
                        <CustomInputPicker
                          value={value}
                          onChange={onChange}
                          label={`Data de Inicío`}
                          error={Boolean(errors?.start_date)}
                          {...(errors?.start_date && {
                            helperText: 'Este campo é obrigatório'
                          })}
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
                <CustomTextField
                  fullWidth
                  label='Dias de Gozo'
                  value={days}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleValueChange(e)}
                  required
                  type='number'
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Controller
                  name={`end_date`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      selected={value}
                      showYearDropdown
                      showMonthDropdown
                      disabled
                      dateFormat='dd/MM/yyyy'
                      onChange={date => onChange(date)}
                      placeholderText='DD/MM/AAAA'
                      customInput={
                        <CustomInputPicker
                          value={end_date}
                          onChange={onChange}
                          label={`Data de Término`}
                          error={Boolean(errors.end_date)}
                          {...(errors?.end_date && {
                            helperText: 'Este campo é obrigatório'
                          })}
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

export default DateModalForm
