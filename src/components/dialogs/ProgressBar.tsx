import React from 'react'
import { Dialog, DialogContent, CircularProgress } from '@mui/material'

interface ModalProgressBarProps {
  open: boolean
}

function ModalProgressBar({ open }: ModalProgressBarProps) {
  return (
    <Dialog open={open} disableAutoFocus={true} disableEscapeKeyDown={true}>
      <DialogContent style={{ textAlign: 'center', padding: '20px' }}>
        <CircularProgress />
        <div style={{ marginTop: '20px' }}>Processando o Pedido...</div>
      </DialogContent>
    </Dialog>
  )
}
export default ModalProgressBar
