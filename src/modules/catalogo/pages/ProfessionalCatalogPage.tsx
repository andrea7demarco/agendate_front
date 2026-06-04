import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetProfessionalsQuery } from '../api/professionalsApi';

export const ProfessionalsCatalogPage = () => {
  const navigate = useNavigate();
  const { data: professionals, isLoading, isError } = useGetProfessionalsQuery();

  const handleBook = (professionalId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate(`/login?redirect=/profesionales/${professionalId}`);
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

      <Grid container spacing={4}>
        {professionals?.map((professional) => (
          <Grid size={{ xs: 12, sm: 6, md: 6 }} key={professional.id}>
            <Card sx={{ height: '100%', borderRadius: 1 }}>
              <CardContent
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ minHeight: 72 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {professional.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {professional.appointmentType}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ mt: 2, minHeight: 24 }}>
                  {professional.address}
                </Typography>

                <Typography variant="body1" fontWeight={700} sx={{ mt: 2 }}>
                  ${professional.consultationCost}
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
        ))}
      </Grid>
    </Container>
  );
};