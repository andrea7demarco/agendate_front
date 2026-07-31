import type { AddressSuggestion } from '../types/location.types';

type GeoapifyFeature = {
  properties: {
    formatted?: string;
    address_line1?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    lat: number;
    lon: number;
    place_id?: string;
  };
};

type GeoapifyAutocompleteResponse = {
  features: GeoapifyFeature[];
};

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

export const searchAddressSuggestions = async (
  text: string,
): Promise<AddressSuggestion[]> => {
  if (!text.trim() || text.trim().length < 3) {
    return [];
  }

  const params = new URLSearchParams({
    text,
    apiKey: GEOAPIFY_API_KEY,
    limit: '10',
    lang: 'es',
    filter: 'countrycode:ar',
    bias: 'countrycode:ar',
  });

  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error('No se pudieron buscar direcciones.');
  }

  const data = (await response.json()) as GeoapifyAutocompleteResponse;

  return data.features.map((feature) => {
    const properties = feature.properties;

    return {
      formattedAddress:
        properties.formatted ||
        properties.address_line1 ||
        '',
      street: properties.street || null,
      streetNumber: properties.housenumber || null,
      city: properties.city || properties.county || null,
      province: properties.state || null,
      postalCode: properties.postcode || null,
      country: properties.country || null,
      latitude: properties.lat,
      longitude: properties.lon,
      externalPlaceId: properties.place_id || null,
      externalProvider: 'Geoapify',
    };
  });
};