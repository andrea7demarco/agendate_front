import { Box, Button, Stack, Typography } from '@mui/material';
import {
  TIME_SLOT_OPTIONS,
  WEEK_DAY_OPTIONS,
} from '../constants/professionalOptions';

export type AvailabilityValue = {
  dayOfWeek: number;
  timeSlot: number;
};

type AvailabilitySelectorProps = {
  value: AvailabilityValue[];
  onChange: (value: AvailabilityValue[]) => void;
};

export const AvailabilitySelector = ({
  value,
  onChange,
}: AvailabilitySelectorProps) => {
  const isSelected = (dayOfWeek: number, timeSlot: number) =>
    value.some(
      (item) => item.dayOfWeek === dayOfWeek && item.timeSlot === timeSlot,
    );

  const toggle = (dayOfWeek: number, timeSlot: number) => {
    if (isSelected(dayOfWeek, timeSlot)) {
      onChange(
        value.filter(
          (item) =>
            !(item.dayOfWeek === dayOfWeek && item.timeSlot === timeSlot),
        ),
      );
      return;
    }

    onChange([...value, { dayOfWeek, timeSlot }]);
  };

  return (
    <Stack spacing={1}>
      <Typography fontWeight={700}>Dias y horarios disponibles</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '88px repeat(4, minmax(70px, 1fr))',
            sm: '120px repeat(4, minmax(90px, 1fr))',
          },
          gap: 1,
          overflowX: 'auto',
        }}
      >
        <Box />
        {TIME_SLOT_OPTIONS.map((slot) => (
          <Typography
            key={slot.id}
            variant="body2"
            fontWeight={700}
            textAlign="center"
          >
            {slot.label}
          </Typography>
        ))}

        {WEEK_DAY_OPTIONS.map((day) => (
          <Box key={day.id} display="contents">
            <Typography variant="body2" fontWeight={700} alignSelf="center">
              {day.label}
            </Typography>
            {TIME_SLOT_OPTIONS.map((slot) => {
              const selected = isSelected(day.id, slot.id);

              return (
                <Button
                  key={`${day.id}-${slot.id}`}
                  type="button"
                  variant={selected ? 'contained' : 'outlined'}
                  onClick={() => toggle(day.id, slot.id)}
                  sx={{
                    minWidth: 0,
                    px: 1,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  {selected ? 'Disponible' : 'Libre'}
                </Button>
              );
            })}
          </Box>
        ))}
      </Box>
    </Stack>
  );
};
