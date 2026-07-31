import {
  Badge,
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Popover,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetSpecialtiesQuery } from '../../../modules/catalogo/api/professionalsApi';
import { ARGENTINA_PROVINCES } from '../../constants/provinces';

type Filters = {
  province: string;
  specialtyId: string;
  appointmentType: string;
};

const ALL_FILTERS = 'all';

const emptyFilters: Filters = {
  province: ALL_FILTERS,
  specialtyId: ALL_FILTERS,
  appointmentType: ALL_FILTERS,
};

export const ProfessionalSearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: specialties = [] } = useGetSpecialtiesQuery();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('search') ?? '');
    setFilters({
      province: params.get('province') ?? ALL_FILTERS,
      specialtyId: params.get('specialtyId') ?? ALL_FILTERS,
      appointmentType: params.get('appointmentType') ?? ALL_FILTERS,
    });
  }, [location.search]);

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== ALL_FILTERS,
  ).length;

  const runSearch = () => {
    const params = new URLSearchParams();

    if (search.trim()) params.set('search', search.trim());
    if (filters.province !== ALL_FILTERS) {
      params.set('province', filters.province);
    }
    if (filters.specialtyId !== ALL_FILTERS) {
      params.set('specialtyId', filters.specialtyId);
    }
    if (filters.appointmentType !== ALL_FILTERS) {
      params.set('appointmentType', filters.appointmentType);
    }

    const query = params.toString();
    navigate(query ? `/?${query}` : '/');
    setAnchorEl(null);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);

    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());

    const query = params.toString();
    navigate(query ? `/?${query}` : '/');
    setAnchorEl(null);
  };

  return (
    <>
      <Paper
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          runSearch();
        }}
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 620,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nombre, carrera o especialidad..."
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& fieldset': { border: 0 },
          }}
        />

        <Tooltip title="Filtros">
          <IconButton
            type="button"
            aria-label="Abrir filtros de busqueda"
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={{ mr: 0.5 }}
          >
            <Badge badgeContent={activeFilterCount} color="secondary">
              <TuneIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Button
          type="submit"
          variant="contained"
          sx={{
            alignSelf: 'stretch',
            borderRadius: 0,
            px: { xs: 1.5, sm: 2.5 },
          }}
        >
          Buscar
        </Button>
      </Paper>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Stack spacing={2} sx={{ width: { xs: 290, sm: 360 }, p: 2.5 }}>
          <TextField
            select
            label="Provincia"
            size="small"
            value={filters.province}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                province: event.target.value,
              }))
            }
          >
            <MenuItem value={ALL_FILTERS}>Todas las provincias</MenuItem>
            {ARGENTINA_PROVINCES.map((province) => (
              <MenuItem key={province} value={province}>
                {province}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Especialidad"
            size="small"
            value={filters.specialtyId}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                specialtyId: event.target.value,
              }))
            }
          >
            <MenuItem value={ALL_FILTERS}>Todas las especialidades</MenuItem>
            {specialties.map((specialty) => (
              <MenuItem key={specialty.id} value={specialty.id}>
                {specialty.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Modalidad"
            size="small"
            value={filters.appointmentType}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                appointmentType: event.target.value,
              }))
            }
          >
            <MenuItem value={ALL_FILTERS}>Todas las modalidades</MenuItem>
            <MenuItem value="Presencial">Presencial</MenuItem>
            <MenuItem value="Online">Online</MenuItem>
            <MenuItem value="Ambos">Presencial y online</MenuItem>
          </TextField>

          <Box display="flex" justifyContent="space-between" gap={1}>
            <Button color="inherit" onClick={clearFilters}>
              Limpiar
            </Button>
            <Button variant="contained" onClick={runSearch}>
              Aplicar filtros
            </Button>
          </Box>
        </Stack>
      </Popover>
    </>
  );
};
