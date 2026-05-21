import {
  CommonQuoteInput,
  NormalizedQuoteResult,
  ProviderField,
  DomainMarca,
  DomainModelo,
  DomainVersion,
  DomainLocalidad,
} from '../types/domain';

export { type CommonQuoteInput, type NormalizedQuoteResult, type ProviderField, type DomainMarca, type DomainModelo, type DomainVersion, type DomainLocalidad };

export interface IInsuranceProvider {
  id: string;
  displayName: string;
  logoUrl: string;

  getRequiredFields(): ProviderField[];
  mapRequest(commonInput: CommonQuoteInput): Record<string, any>;
  fetchQuote(params: Record<string, any>): Promise<any>;
  normalizeResponse(raw: any): NormalizedQuoteResult[];

  getBrands?(): Promise<DomainMarca[]>;
  getModels?(brandId: string, year: number): Promise<DomainModelo[]>;
  getVersions?(brandId: string, year: number, modelId: string): Promise<DomainVersion[]>;
  getLocalidades?(zipCode: string): Promise<DomainLocalidad[]>;
}
