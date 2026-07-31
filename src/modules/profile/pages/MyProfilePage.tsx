import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { useGetMyProfileQuery } from '../api/profileApi';

export const MyProfilePage = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetMyProfileQuery();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">No se pudo cargar tu perfil.</Alert>
      </Container>
    );
  }

  const { profile } = data;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
          >
            <Typography variant="h4">Mi perfil</Typography>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate('/mi-perfil/editar')}
            >
              Editar perfil
            </Button>
          </Stack>

          <Chip
            label={
              data.profileType === 'paciente'
                ? 'Paciente'
                : 'Profesional'
            }
            color="primary"
            sx={{ alignSelf: 'flex-start' }}
          />

          <Typography>
            <strong>Nombre:</strong> {profile.fullName}
          </Typography>

          <Typography>
            <strong>Email:</strong> {profile.email}
          </Typography>

          {data.profileType === 'paciente' && (
            <>
              <Typography>
                <strong>Género:</strong> {data.profile.gender}
              </Typography>

              <Typography>
                <strong>Fecha de nacimiento:</strong>{' '}
                {data.profile.birthDate}
              </Typography>

              <Typography>
                <strong>Edad:</strong> {data.profile.age.display}
              </Typography>

              <Typography>
                <strong>CUD:</strong>{' '}
                {data.profile.hasCud ? 'Tiene CUD' : 'No tiene CUD informado'}
              </Typography>

              <Box>
                <Typography fontWeight="bold">Obras sociales:</Typography>

                {data.profile.healthInsurances.length === 0 ? (
                  <Typography color="text.secondary">
                    No tiene obra social informada.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {data.profile.healthInsurances.map((healthInsurance) => (
                      <Box
                        key={healthInsurance.id}
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                        }}
                      >
                        <Typography fontWeight={700}>
                          {healthInsurance.acronym} - {healthInsurance.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Afiliado:{' '}
                          {healthInsurance.affiliateNumber || 'No informado'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Plan: {healthInsurance.planName || 'No informado'}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </>
          )}

          {data.profileType === 'profesional' && (
            <>
              <Typography>
                <strong>DNI:</strong> {data.profile.dni}
              </Typography>

              <Typography>
                <strong>Teléfono:</strong> {data.profile.phoneNumber}
              </Typography>

              <Typography>
                <strong>Provincia:</strong> {data.profile.province}
              </Typography>

              <Typography>
                <strong>Tipo de atención:</strong>{' '}
                {data.profile.appointmentType}
              </Typography>

              <Typography>
                <strong>Costo:</strong> ${data.profile.consultationCost}
              </Typography>

              <Typography>
                <strong>Biografía:</strong>{' '}
                {data.profile.biography || 'Sin biografía'}
              </Typography>

              <Box>
                <Typography fontWeight="bold">Formacion:</Typography>
                <Typography color="text.secondary">
                  {data.profile.degreeTitle || 'Titulo no informado'}
                  {data.profile.university
                    ? ` - ${data.profile.university}`
                    : ''}
                  {data.profile.graduationYear
                    ? ` (${data.profile.graduationYear})`
                    : ''}
                </Typography>
              </Box>

              <Box>
                <Typography fontWeight="bold">
                  Tipos de pacientes que atiende:
                </Typography>
                {(data.profile.patientGroups ?? []).length === 0 ? (
                  <Typography color="text.secondary">
                    No informado.
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {data.profile.patientGroups.map((patientGroup) => (
                      <Chip key={patientGroup.id} label={patientGroup.name} />
                    ))}
                  </Stack>
                )}
              </Box>

              <Box>
                <Typography fontWeight="bold">Disponibilidad:</Typography>
                {(data.profile.availabilities ?? []).length === 0 ? (
                  <Typography color="text.secondary">
                    No informada.
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {data.profile.availabilities.map((availability) => (
                      <Chip
                        key={`${availability.dayOfWeek}-${availability.timeSlot}`}
                        label={`${availability.dayName} - ${availability.timeSlotName}`}
                      />
                    ))}
                  </Stack>
                )}
              </Box>

              <Box>
                <Typography fontWeight="bold">Cursos y capacitaciones:</Typography>
                {(data.profile.trainings ?? []).length === 0 ? (
                  <Typography color="text.secondary">
                    No informados.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {data.profile.trainings.map((training) => (
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
                )}
              </Box>
              <Box>
                <Typography fontWeight="bold">
                  Especialidades:
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {data.profile.specialties.map((specialty) => (
                    <Chip
                      key={specialty.id}
                      label={specialty.name}
                    />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography fontWeight="bold">
                  Obras sociales que atiende:
                </Typography>

                {data.profile.healthInsurances.length === 0 ? (
                  <Typography color="text.secondary">
                    No atiende obras sociales informadas.
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {data.profile.healthInsurances.map((healthInsurance) => (
                      <Chip
                        key={healthInsurance.id}
                        label={`${healthInsurance.acronym} - ${healthInsurance.name}`}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};
