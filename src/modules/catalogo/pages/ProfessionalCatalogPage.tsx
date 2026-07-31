import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Pagination,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetProfessionalsQuery } from '../api/professionalsApi';
import type { ProfessionalSearchParams } from '../types/professional.types';
import { useAuth } from '../../../common/hooks/useAuth';

// fotos re mil nqv dsps las saco es para ver q tal
// Fotos temporales hardcodeadas para maquetar el catalogo.
// Mas adelante deberian venir del perfil del profesional desde el backend.
const PROFESSIONAL_PHOTOS = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=160&q=80',
];
// foto avatar tamb
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 0,
  }).format(value);

export const ProfessionalsCatalogPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const specialtyId = Number(searchParams.get('specialtyId'));
  const appointmentType = searchParams.get('appointmentType');
  const requestedPage = Number(searchParams.get('page'));
  const page = Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;

  const filters: ProfessionalSearchParams = {
    search: searchParams.get('search') || undefined,
    province: searchParams.get('province') || undefined,
    specialtyId: Number.isInteger(specialtyId) && specialtyId > 0
      ? specialtyId
      : undefined,
    appointmentType:
      appointmentType === 'Presencial'
      || appointmentType === 'Online'
      || appointmentType === 'Ambos'
        ? appointmentType
        : undefined,
    page,
    pageSize: 8,
  };

  const {
    data,
    isLoading,
    isError,
  } = useGetProfessionalsQuery(filters);
  const professionals = data?.items ?? [];

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value === 1) {
      nextParams.delete('page');
    } else {
      nextParams.set('page', value.toString());
    }

    navigate({
      pathname: '/',
      search: nextParams.toString(),
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBook = (professionalId: string) => {
    if (!isAuthenticated) {
      const redirect = `/profesionales/${professionalId}?action=book`;
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    navigate(`/profesionales/${professionalId}?action=book`);
  };

  if (isLoading) return <div>Cargando profesionales...</div>;
  if (isError) return <div>No se pudieron cargar los profesionales.</div>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }} fontWeight={700}>
        Profesionales
      </Typography>

      {!isLoading && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {data?.totalCount === 1
            ? 'Encontramos 1 profesional'
            : `Encontramos ${data?.totalCount ?? 0} profesionales`}
        </Typography>
      )}

      {professionals.length === 0 && (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 3,
          }}
        >
          <Typography variant="h6">No encontramos resultados</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Proba cambiando la especialidad, provincia o modalidad.
          </Typography>
        </Box>
      )}
      <Grid container spacing={4}>
  {professionals.map((professional, index) => {
    const career = professional.specialties?.[0];
    const specialties = professional.specialties?.slice(1, 4) ?? [];
    const photo = PROFESSIONAL_PHOTOS[index % PROFESSIONAL_PHOTOS.length];

    const appointmentType =
      professional.appointmentType === 'Ambos'
        ? 'Presencial y online'
        : professional.appointmentType;

    return (
      <Grid size={{ xs: 12, sm: 6, md: 6 }} key={professional.id}>
        <Card
          sx={{
            height: '100%',
            borderRadius: 2,
          }}
        >
          <CardContent
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="flex-start"
              sx={{ minHeight: 112 }}
            >
              <Avatar
                src={photo}
                alt={professional.fullName}
                sx={{
                  width: 72,
                  height: 72,
                  border: '3px solid',
                  borderColor: 'primary.light',
                }}
              />

              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {professional.fullName}
                </Typography>

                <Typography
                  variant="subtitle1"
                  color="primary.main"
                  fontWeight={700}
                  sx={{ mt: 0.25 }}
                >
                  {career || 'Carrera no informada'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {professional.province || 'Provincia no informada'}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
              sx={{ mt: 1.5, minHeight: 32 }}
            >
              <Chip
                size="small"
                label={appointmentType}
                color="primary"
                variant="outlined"
              />

              {specialties.map((specialty) => (
                <Chip
                  key={specialty}
                  size="small"
                  label={specialty}
                />
              ))}
            </Stack>

            <Typography
              variant="body1"
              fontWeight={700}
              sx={{ mt: 2 }}
            >
              ${formatCurrency(professional.consultationCost)}
            </Typography>

            <Button
              onClick={() => handleBook(professional.id)}
              variant="contained"
              fullWidth
              sx={{ mt: 'auto', pt: 1.2, pb: 1.2 }}
            >
              Sacar turno
            </Button>
          </CardContent>
        </Card>
      </Grid>
    );
  })}
</Grid>



      {(data?.totalPages ?? 0) > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 5 }}>
          <Pagination
            page={data?.page ?? page}
            count={data?.totalPages ?? 0}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};
