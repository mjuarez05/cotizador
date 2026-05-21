export type CommonQuoteInput = {
  vehicleYear: number;
  zipCode: string;
  infoauto?: number;
  uso?: number;
  gnc?: boolean;
  providerSpecificFields?: Record<string, any>;
};

export type NormalizedQuoteResult = {
  providerId: string;
  providerName: string;
  productName: string;
  premium: number;
  installments: { count: number; amount: number }[];
  coverageDetails: Record<string, any>;
  rawResponse?: any;
};

export type ProviderField = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  required: boolean;
  options?: { label: string; value: string }[];
};

export type DomainMarca = { id: string; name: string };
export type DomainModelo = { id: string; name: string; year: number };
export type DomainVersion = { id: string; name: string; vehicleId: string };
export type DomainLocalidad = {
  id: number;
  name: string;
  province: string;
  zipCode: number;
};
