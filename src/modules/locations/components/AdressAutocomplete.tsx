import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { searchAddressSuggestions } from '../api/geopifyApi';
import type { AddressSuggestion } from '../types/location.types';

type AddressAutocompleteProps = {
  label?: string;
  value: AddressSuggestion | null;
  error?: boolean;
  helperText?: React.ReactNode;
  onChange: (value: AddressSuggestion | null) => void;
};

export const AddressAutocomplete = ({
  label = 'Direccion',
  value,
  error,
  helperText,
  onChange,
}: AddressAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(
    value?.formattedAddress ?? '',
  );
  const [options, setOptions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const canSearch = useMemo(
    () => inputValue.trim().length >= 3,
    [inputValue],
  );

  useEffect(() => {
    let active = true;

    if (!canSearch) {
      setOptions(value ? [value] : []);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        const results = await searchAddressSuggestions(inputValue);

        if (active) {
          setOptions(value ? [value, ...results] : results);
        }
      } catch {
        if (active) {
          setOptions(value ? [value] : []);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [canSearch, inputValue, value]);

  return (
    <Autocomplete
      options={options}
      value={value}
      inputValue={inputValue}
      loading={loading}
      filterOptions={(items) => items}
      getOptionLabel={(option) => option.formattedAddress}
      isOptionEqualToValue={(option, selected) =>
        option.externalPlaceId === selected.externalPlaceId &&
        option.formattedAddress === selected.formattedAddress
      }
      noOptionsText={
        canSearch
          ? 'No encontramos direcciones'
          : 'Escribi al menos 3 caracteres'
      }
      onInputChange={(_, nextInputValue) => {
        setInputValue(nextInputValue);
      }}
      onChange={(_, nextValue) => {
        onChange(nextValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={18} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};