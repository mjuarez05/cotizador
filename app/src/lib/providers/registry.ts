import { IInsuranceProvider } from './IInsuranceProvider';
import { MercantilProvider } from './mercantil/MercantilProvider';

const providers = new Map<string, IInsuranceProvider>();

const activeProviders = process.env.ACTIVE_PROVIDERS?.split(',').map(p => p.trim()) || ['mercantil'];

function init() {
  if (activeProviders.includes('mercantil')) {
    providers.set('mercantil', new MercantilProvider());
  }
}

init();

export function getAllActiveProviders(): IInsuranceProvider[] {
  return Array.from(providers.values());
}

export function getProvider(id: string): IInsuranceProvider | undefined {
  return providers.get(id);
}
