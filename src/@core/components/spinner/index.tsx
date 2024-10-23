// ** MUI Imports
import Box, { BoxProps } from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Image from 'next/image'
import { uniscedLogo } from 'src/constants/user'

const FallbackSpinner = ({ sx }: { sx?: BoxProps['sx'] }) => {
  // ** Hook

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        ...sx
      }}
    >
      <Image src={uniscedLogo} alt='Logo Instituto Piaget' width={100} height={100} />
      <CircularProgress disableShrink sx={{ mt: 6 }} />
    </Box>
  )
}

export default FallbackSpinner
