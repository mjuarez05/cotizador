import { IInsuranceProvider } from '../IInsuranceProvider';
import {
  CommonQuoteInput,
  NormalizedQuoteResult,
  ProviderField,
  DomainMarca,
  DomainModelo,
  DomainVersion,
  DomainLocalidad,
} from '../../types/domain';
import {
  getMarcas as mercantilGetMarcas,
  getModelos as mercantilGetModelos,
  getVersiones as mercantilGetVersiones,
  getLocalidades as mercantilGetLocalidades,
  cotizarVehiculo as mercantilCotizar,
} from '../../mercantilClient';
import {
  mapRequest,
  normalizeResponse,
  mapMarcas,
  mapModelos,
  mapVersiones,
  mapLocalidades,
} from './mercantilMapper';

export class MercantilProvider implements IInsuranceProvider {
  id = 'mercantil';
  displayName = 'Mercantil Andina';
  logoUrl = '/logos/mercantil.png';

  getRequiredFields(): ProviderField[] {
    return [
      { id: 'infoauto', label: 'Infoauto ID', type: 'number', required: true },
      { id: 'uso', label: 'Uso del vehículo', type: 'select', required: true, options: [
        { label: 'Particular', value: '1' },
        { label: 'Comercial', value: '2' },
      ]},
      { id: 'gnc', label: 'Tiene GNC', type: 'boolean', required: false },
      { id: 'localidadId', label: 'ID de Localidad', type: 'number', required: true },
    ];
  }

  mapRequest(commonInput: CommonQuoteInput): Record<string, any> {
    return mapRequest(commonInput);
  }

  async fetchQuote(params: Record<string, any>): Promise<any> {
    return mercantilCotizar({
      infoauto: params.infoauto,
      anio: params.anio,
      uso: params.uso,
      gnc: params.gnc,
      localidad: params.localidad,
    });
  }

  normalizeResponse(raw: any): NormalizedQuoteResult[] {
    return normalizeResponse(raw);
  }

  async getBrands(): Promise<DomainMarca[]> {
    const data = await mercantilGetMarcas();
    return mapMarcas(data);
  }

  async getModels(brandId: string, year: number): Promise<DomainModelo[]> {
    const data = await mercantilGetModelos(brandId, year.toString());
    console.log("[MercantilProvider.getModels] raw response:", JSON.stringify(data).slice(0, 2000));
    const mapped = mapModelos(data);
    console.log("[MercantilProvider.getModels] mapped:", JSON.stringify(mapped).slice(0, 2000));
    return mapped;
  }

  async getVersions(brandId: string, year: number, modelId: string): Promise<DomainVersion[]> {
    const data = await mercantilGetVersiones(brandId, year.toString(), modelId);
    console.log("[MercantilProvider.getVersions] raw response:", JSON.stringify(data).slice(0, 2000));
    const mapped = mapVersiones(data);
    console.log("[MercantilProvider.getVersions] mapped:", JSON.stringify(mapped).slice(0, 2000));
    return mapped;
  }

  async getLocalidades(zipCode: string): Promise<DomainLocalidad[]> {
    const data = await mercantilGetLocalidades(zipCode);
    return mapLocalidades(data);
  }
}
