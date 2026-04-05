import { Box, Divider, Paper, Stack } from '@mui/material';
import { LoginForm } from '../components/LoginForm';
import GoogleButton from '../components/GoogleButton';

export const LoginPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: '100vw',
        minHeight: '100vh',
        px: 2,
      }}
    >
      <Paper
        sx={{ p: 4, width: 420, maxWidth: '96vw', borderRadius: 3 }}
        elevation={6}
      >
        <Stack spacing={2}>
          <LoginForm />

          <Divider sx={{ my: 1.5 }} />

          <GoogleButton />
        </Stack>
      </Paper>
    </Box>
  );
};
