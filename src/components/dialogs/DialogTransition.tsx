import React, { forwardRef, ReactElement, Ref } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  SlideProps,
  DialogContentText
} from '@mui/material'

interface DialogTransitionProps {
  title: string
  description: string
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

const DialogTransition = ({ title, description, open, onClose, onConfirm }: DialogTransitionProps) => {
  return (
    <Dialog
      open={open}
      keepMounted
      onClose={onClose}
      TransitionComponent={Transition}
      aria-labelledby='alert-dialog-slide-title'
      aria-describedby='alert-dialog-slide-description'
    >
      <DialogTitle sx={{ fontSize: '14pt', fontWeight: 'bold' }} id='alert-dialog-slide-title'>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-slide-description'>{description}</DialogContentText>
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button variant='contained' color='secondary' onClick={onClose}>
          Cancelar
        </Button>
        <Button variant='contained' color='primary' onClick={onConfirm}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogTransition
