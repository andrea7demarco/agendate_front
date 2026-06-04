import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetProfessionalByIdQuery } from '../api/professionalsApi';

export const ProfessionalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState('');

  const { data: professional, isLoading, isError } = useGetProfessionalByIdQuery(id!, {
    skip: !id,
  });

  const handleBook = () => {
    alert('Ir a flujo de reserva de turno');
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    alert('Mensaje preparado (falta integrar backend)');
    setMessage('');
  };

  if (isLoading) return <Container sx={{ py: 6 }}><Typography>Cargando profesional...</Typography></Container>;
  if (isError || !professional) return <Container sx={{ py: 6 }}><Typography>No se pudo cargar el perfil.</Typography></Container>;

  const photoUrl = (professional as any).photoUrl ?? '';
  const biography = (professional as any).biography ?? 'Este profesional aún no cargó su biografía.';
  const insuranceProviders: string[] = (professional as any).insuranceProviders ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={3} alignItems="stretch">
        {/* Columna izquierda: perfil */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Avatar
                  src={photoUrl}
                  alt={professional.fullName}
                  sx={{ width: 96, height: 96, fontSize: 28 }}
                >
                  {professional.fullName?.[0] ?? 'P'}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {professional.fullName}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {professional.appointmentType}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Biografía
                </Typography>
                <Typography color="text.secondary">{biography}</Typography>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Datos profesionales
                </Typography>
                <Stack spacing={0.8}>
                  <Typography><b>Dirección:</b> {professional.address ?? 'No informada'}</Typography>
                  <Typography><b>Email:</b> {professional.email}</Typography>
                  <Typography><b>Teléfono:</b> {professional.phoneNumber ?? 'No informado'}</Typography>
                  <Typography><b>DNI:</b> {(professional as any).dni ?? 'No informado'}</Typography>
                  <Typography><b>Lic. Nacional:</b> {professional.nationalLicense ?? 'No informada'}</Typography>
                  <Typography><b>Lic. Provincial:</b> {professional.provincialLicense ?? 'No informada'}</Typography>
                </Stack>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Obras sociales
                </Typography>
                {insuranceProviders.length > 0 ? (
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {insuranceProviders.map((item) => (
                      <Chip key={item} label={item} />
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">No informadas.</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Columna derecha: acciones */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700}>Reserva</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                ${professional.consultationCost}
              </Typography>

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                onClick={handleBook}
              >
                Sacar turno
              </Button>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Enviar mensaje
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  placeholder="Escribe tu consulta para el profesional..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 1.5 }}
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  Enviar mensaje
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};