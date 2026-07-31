export type AddressSuggestion = {
  formattedAddress: string;
  street?: string | null;
  streetNumber?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude: number;
  longitude: number;
  externalPlaceId?: string | null;
  externalProvider: 'Geoapify';
};