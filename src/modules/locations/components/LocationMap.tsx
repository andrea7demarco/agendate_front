import { Box, Button, Stack, Typography } from '@mui/material';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

type LocationMapProps = {
  name: string;
  formattedAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  instructions?: string | null;
};

export const LocationMap = ({
  name,
  formattedAddress,
  latitude,
  longitude,
  instructions,
}: LocationMapProps) => {
  if (latitude == null || longitude == null) {
    return (
      <Box>
        <Typography fontWeight={700}>Ubicación</Typography>
        <Typography color="text.secondary">
          El profesional todavía no cargó una ubicación precisa.
        </Typography>
      </Box>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography fontWeight={700}>{name}</Typography>
        {formattedAddress && (
          <Typography color="text.secondary">
            {formattedAddress}
          </Typography>
        )}
        {instructions && (
          <Typography variant="body2" color="text.secondary">
            {instructions}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          height: 220,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]}>
            <Popup>
              {formattedAddress || name}
            </Popup>
          </Marker>
        </MapContainer>
      </Box>

      <Button
        variant="outlined"
        fullWidth
        href={googleMapsUrl}
        target="_blank"
        rel="noreferrer"
      >
        Cómo llegar
      </Button>
    </Stack>
  );
};