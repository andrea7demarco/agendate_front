import { Box, Button, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
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
  const selectedDays = Array.from(
    new Set(value.map((item) => item.dayOfWeek)),
  );

  const isDaySelected = (dayOfWeek: number) =>
    selectedDays.includes(dayOfWeek);

  const isTimeSlotSelected = (dayOfWeek: number, timeSlot: number) =>
    value.some(
      (item) => item.dayOfWeek === dayOfWeek && item.timeSlot === timeSlot,
    );

  const toggleDay = (dayOfWeek: number) => {
    if (isDaySelected(dayOfWeek)) {
      const nextValue = value.filter((item) => item.dayOfWeek !== dayOfWeek);
      onChange(nextValue);
      return;
    }

    onChange([...value, { dayOfWeek, timeSlot: 1 }]);
  };

  const toggleTimeSlot = (dayOfWeek: number, timeSlot: number) => {
    if (isTimeSlotSelected(dayOfWeek, timeSlot)) {
      const nextValue = value.filter(
        (item) =>
          !(item.dayOfWeek === dayOfWeek && item.timeSlot === timeSlot),
      );

      onChange(nextValue);
      return;
    }

    onChange([...value, { dayOfWeek, timeSlot }]);
  };

  const selectedDayOptions = WEEK_DAY_OPTIONS.filter((day) =>
    selectedDays.includes(day.id),
  );

  return (
    <Stack spacing={2}>
      <Box>
        <Typography fontWeight={700} mb={1}>
          Dias disponibles
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1}>
          {WEEK_DAY_OPTIONS.map((day) => (
            <FormControlLabel
              key={day.id}
              control={
                <Checkbox
                  checked={isDaySelected(day.id)}
                  onChange={() => toggleDay(day.id)}
                />
              }
              label={day.label}
            />
          ))}
        </Stack>
      </Box>

      {selectedDayOptions.length > 0 ? (
        <Box>
          <Typography fontWeight={700} mb={1}>
            Horarios disponibles
          </Typography>

          <Box
            sx={{
              width: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: `72px repeat(${selectedDayOptions.length}, minmax(0, 1fr))`,
                  sm: `96px repeat(${selectedDayOptions.length}, minmax(0, 1fr))`,
                },
                width: '100%',
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'grey.100',
                  borderRight: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              />

              {selectedDayOptions.map((day) => (
                <Box
                  key={day.id}
                  sx={{
                    px: { xs: 0.5, sm: 1 },
                    py: 1,
                    bgcolor: 'grey.100',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    fontSize: { xs: '0.68rem', sm: '0.78rem' },
                    lineHeight: 1.15,
                    wordBreak: 'break-word',
                  }}
                >
                  {day.label}
                </Box>
              ))}

              {TIME_SLOT_OPTIONS.map((slot) => (
                <Box key={slot.id} display="contents">
                  <Box
                    sx={{
                      px: { xs: 0.5, sm: 1 },
                      py: 1,
                      borderRight: '1px solid',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      fontWeight: 700,
                      bgcolor: 'grey.50',
                      fontSize: { xs: '0.72rem', sm: '0.85rem' },
                    }}
                  >
                    {slot.label}
                  </Box>

                  {selectedDayOptions.map((day) => {
                    const selected = isTimeSlotSelected(day.id, slot.id);

                    return (
                      <Button
                        key={`${day.id}-${slot.id}`}
                        type="button"
                        onClick={() => toggleTimeSlot(day.id, slot.id)}
                        sx={{
                          m: { xs: 0.35, sm: 0.6 },
                          minWidth: 0,
                          minHeight: { xs: 34, sm: 40 },
                          px: { xs: 0.4, sm: 0.8 },
                          borderRadius: { xs: 1, sm: 1.5 },
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: { xs: '0.62rem', sm: '0.78rem' },
                          lineHeight: 1.1,
                          color: selected ? 'success.dark' : 'error.dark',
                          bgcolor: selected ? '#dff5e7' : '#fde2e2',
                          border: '1px solid',
                          borderColor: selected ? '#6fcf97' : '#f5a3a3',
                          '&:hover': {
                            bgcolor: selected ? '#c9eed8' : '#fbd0d0',
                          },
                        }}
                      >
                        {selected ? 'Disponible' : 'No disponible'}
                      </Button>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography color="text.secondary">
          Selecciona al menos un dia para cargar horarios.
        </Typography>
      )}
    </Stack>
  );
};
