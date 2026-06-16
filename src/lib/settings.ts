import { OfficeSettings } from '@/types';
import { query } from './db';

export const fallbackSettings: OfficeSettings = {
  id: 1,
  office_name: 'الريان كار',
  tagline: 'تأجير سيارات بثقة وراحة',
  phone: '01033257024',
  whatsapp: '01033257024',
  email: 'admin@alrayyan-cars.com',
  address: 'مصر',
  logo_path: '/logo-transparent.png',
};

export async function getOfficeSettings(): Promise<OfficeSettings> {
  try {
    const rows = await query<OfficeSettings>(
      `SELECT id, office_name, tagline, phone, whatsapp, email, address, logo_path
       FROM office_settings
       WHERE id = 1
       LIMIT 1`
    );

    return rows[0] || fallbackSettings;
  } catch {
    return fallbackSettings;
  }
}
