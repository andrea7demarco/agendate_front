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
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProfessionalByIdQuery } from '../api/professionalsApi';
import { useAuth } from '../../../common/hooks/useAuth';
import { useSnackbar } from 'notistack';
import { LocationMap } from '../../locations/components/LocationMap';
import { normalizePhoneForWhatsApp } from '../../../common/utils/phone';

// --- AGREGAR ESTA FUNCIÓN ---
const formatPhoneNumber = (phone?: string) => {
  if (!phone) return 'No informado';
  
  // Limpiamos por seguridad
  const cleaned = phone.replace(/\D/g, '');

  // Si es de Argentina (+54 9)
  if (cleaned.startsWith('549')) {
    const number = cleaned.slice(3);
    return `+54 9 ${number}`; 
  }
  
  // Si es Chile (+56 9)
  if (cleaned.startsWith('569')) {
    const number = cleaned.slice(3);
    return `+56 9 ${number}`;
  }

  // Si es Bolivia, Paraguay o Uruguay (empiezan con 59)
  if (cleaned.startsWith('59')) {
    const country = cleaned.slice(0, 3);
    const number = cleaned.slice(3);
    return `+${country} ${number}`;
  }

  // Fallback genérico
  return `+${cleaned}`;
};
// ----------------------------


export const ProfessionalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [message, setMessage] = useState('');


  const { data: professional, isLoading, isError } = useGetProfessionalByIdQuery(id!, {
    skip: !id,
  });

  const handleBook = () => {
    if (!id) return;

    if (!isAuthenticated) {
      const redirect = `/profesionales/${id}?action=book`;
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    enqueueSnackbar('Seleccioná una fecha y horario para continuar.', {
      variant: 'info',
    });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    alert('Mensaje preparado (falta integrar backend)');
    setMessage('');
  };

  

  if (isLoading) return <Container sx={{ py: 6 }}><Typography>Cargando profesional...</Typography></Container>;
  if (isError || !professional) return <Container sx={{ py: 6 }}><Typography>No se pudo cargar el perfil.</Typography></Container>;

    //esto es para ver el mapa
  const location = professional.locations?.[0];
  const whatsappPhoneNumber = professional.phoneNumber
    ? normalizePhoneForWhatsApp(professional.phoneNumber)
    : null;
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
                  <Typography>
                    <b>Teléfono:</b>{' '}
                    {professional.phoneNumber ? (
                      <a 
                        href={`tel:+${professional.phoneNumber}`} 
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        title="Haz clic para llamar"
                      >
                        {formatPhoneNumber(professional.phoneNumber)}
                      </a>
                    ) : (
                      'No informado'
                    )}
                  </Typography>
                  <Typography><b>DNI:</b> {(professional as any).dni ?? 'No informado'}</Typography>
                  <Typography><b>Matrícula Nacional:</b> {professional.nationalLicense ?? 'No informada'}</Typography>
                  <Typography><b>Matrícula Provincial:</b> {professional.provincialLicense ?? 'No informada'}</Typography>
                </Stack>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Formación
                </Typography>
                <Typography color="text.secondary">
                  {professional.degreeTitle || 'Título no informado'}
                  {professional.university ? ` - ${professional.university}` : ''}
                  {professional.graduationYear
                    ? ` (${professional.graduationYear})`
                    : ''}
                </Typography>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Pacientes que atiende
                </Typography>
                {(professional.patientGroups ?? []).length > 0 ? (
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {professional.patientGroups?.map((patientGroup) => (
                      <Chip key={patientGroup.id} label={patientGroup.name} />
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">No informado.</Typography>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Disponibilidad
                </Typography>
                {(professional.availabilities ?? []).length > 0 ? (
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {professional.availabilities?.map((availability) => (
                      <Chip
                        key={`${availability.dayOfWeek}-${availability.timeSlot}`}
                        label={`${availability.dayName} - ${availability.timeSlotName}`}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">No informada.</Typography>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Cursos y capacitaciones
                </Typography>
                {(professional.trainings ?? []).length > 0 ? (
                  <Stack spacing={1}>
                    {professional.trainings?.map((training) => (
                      <Box
                        key={training.id}
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                        }}
                      >
                        <Typography fontWeight={700}>{training.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {training.institution || 'Institucion no informada'}
                          {training.year ? ` - ${training.year}` : ''}
                        </Typography>
                        {training.description && (
                          <Typography variant="body2">
                            {training.description}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">No informados.</Typography>
                )}
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

              <Box sx={{ mt: 3 }}>
  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
    Ubicación
  </Typography>

  {location ? (
    <LocationMap
      name={location.name}
      formattedAddress={location.formattedAddress}
      latitude={location.latitude}
      longitude={location.longitude}
      instructions={location.instructions}
    />
  ) : (
    <Typography color="text.secondary">
      El profesional todavía no cargó una ubicación precisa.
    </Typography>
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

              {whatsappPhoneNumber && (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<WhatsAppIcon />}
                  component="a"
                  href={`https://wa.me/${whatsappPhoneNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    mt: 2,
                    backgroundColor: '#25D366',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#128C7E',
                    },
                    textTransform: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  Contactar por WhatsApp
                </Button>
              )}


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
