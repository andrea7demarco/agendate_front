import { Box, Paper } from '@mui/material';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: '100vw',
      }}
    >
      <Paper sx={{ p: 6, width: 600, maxWidth: '90vw' }}>
        <RegisterForm />
      </Paper>
    </Box>
  );
};
