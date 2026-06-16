import type { CSSProperties } from 'react';
import Image from 'next/image';
import { InvoiceDetails, OfficeSettings } from '@/types';

interface InvoicePdfTemplateProps {
  invoice: InvoiceDetails;
  settings: OfficeSettings;
}

const page: CSSProperties = {
  width: 1120,
  minHeight: 980,
  direction: 'rtl',
  backgroundColor: '#121622',
  color: '#f8fafc',
  border: '1px solid #2b3347',
  borderRadius: 34,
  padding: 34,
  fontFamily: 'Arial, Tahoma, sans-serif',
  boxSizing: 'border-box',
};

const muted: CSSProperties = {
  color: '#8490a6',
  fontWeight: 700,
};

const card: CSSProperties = {
  border: '1px solid #293044',
  backgroundColor: '#0d111d',
  borderRadius: 30,
  padding: 26,
  boxSizing: 'border-box',
};

const moneyCard: CSSProperties = {
  border: '1px solid #2d384c',
  backgroundColor: '#1a2230',
  borderRadius: 28,
  padding: 28,
  boxSizing: 'border-box',
};

const statusLabel: Record<string, string> = {
  paid: 'مدفوعة',
  partial: 'مدفوعة جزئياً',
  unpaid: 'غير مدفوعة',
  cancelled: 'ملغية',
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB').format(new Date(date));
}

export default function InvoicePdfTemplate({ invoice, settings }: InvoicePdfTemplateProps) {
  return (
    <div id="invoice-pdf-area" data-pdf-safe="true" style={page}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 28, borderBottom: '1px solid #2b3347', paddingBottom: 34 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ position: 'relative', width: 122, height: 82, border: '1px solid #293044', borderRadius: 24, backgroundColor: '#080b12', overflow: 'hidden' }}>
            <Image src={settings.logo_path} alt={settings.office_name} fill sizes="122px" style={{ objectFit: 'contain', padding: 10 }} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#c6f7ff', fontSize: 19, fontWeight: 900 }}>{settings.office_name}</p>
            <h1 style={{ margin: '16px 0 0', color: '#ffffff', fontSize: 40, lineHeight: 1, fontWeight: 900, letterSpacing: 0 }}>
              {invoice.invoice_number}
            </h1>
            <p style={{ ...muted, margin: '18px 0 0', fontSize: 18 }}>{settings.tagline}</p>
            <p style={{ ...muted, margin: '8px 0 0', fontSize: 15 }}>{settings.phone || ''}{settings.address ? ` - ${settings.address}` : ''}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24, paddingTop: 10 }}>
          <span style={{ border: '1px solid #765f27', backgroundColor: '#2a2518', color: '#f7d66b', borderRadius: 999, padding: '10px 20px', fontSize: 16, fontWeight: 900 }}>
            {statusLabel[invoice.status] || invoice.status}
          </span>
          <p style={{ ...muted, margin: 0, fontSize: 18 }}>تاريخ الإصدار: {formatDate(invoice.issued_at)}</p>
        </div>
      </header>

      <main style={{ marginTop: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26 }}>
          <InfoPanel
            title="بيانات العميل"
            rows={[
              ['الاسم', invoice.customer_name],
              ['الهاتف', invoice.customer_phone],
              ['رقم البطاقة', invoice.customer_national_id || '-'],
            ]}
          />
          <InfoPanel
            title="بيانات السيارة"
            rows={[
              ['السيارة', `${invoice.car_name} ${invoice.car_model || ''}`],
              ['السنة/اللون', `${invoice.model_year || '-'} - ${invoice.color || '-'}`],
              ['رقم اللوحة', invoice.plate_number || '-'],
              ['رقم التأجير', invoice.rental_number],
            ]}
          />
        </div>

        <section style={{ ...card, marginTop: 40 }}>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#ffffff' }}>تفاصيل التأجير</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 28 }}>
            <Mini label="بداية التأجير" value={formatDate(invoice.start_date)} />
            <Mini label="نهاية التأجير" value={formatDate(invoice.end_date)} />
            <Mini label="المدة" value={`${invoice.total_days} يوم`} />
            <Mini label="الموظف" value={invoice.employee_name || '-'} />
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, marginTop: 42 }}>
          <Money label="الإجمالي" value={invoice.total_amount} />
          <Money label="المدفوع" value={invoice.paid_amount} />
          <Money label="المتبقي" value={invoice.remaining_amount} />
        </div>
      </main>

      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2b3347', marginTop: 42, paddingTop: 26 }}>
        <span style={{ border: '1px solid #293044', borderRadius: 22, padding: '14px 22px', color: '#d9fbff', fontSize: 18, fontWeight: 900 }}>
          كود التحقق: {invoice.invoice_number}-{invoice.id}
        </span>
        <span style={{ ...muted, fontSize: 18 }}>الموظف المسؤول: {invoice.employee_name || '-'}</span>
      </footer>
    </div>
  );
}

function InfoPanel({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <section style={card}>
      <h2 style={{ margin: 0, fontSize: 25, fontWeight: 900, color: '#ffffff' }}>{title}</h2>
      <div style={{ display: 'grid', gap: 20, marginTop: 28 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 18 }}>
            <span style={{ ...muted, fontSize: 18 }}>{label}</span>
            <span style={{ color: '#e5e7eb', fontSize: 18, fontWeight: 900, direction: 'ltr', textAlign: 'right' }}>{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ ...muted, margin: 0, fontSize: 17 }}>{label}</p>
      <p style={{ margin: '14px 0 0', color: '#ffffff', fontSize: 21, fontWeight: 900 }}>{value}</p>
    </div>
  );
}

function Money({ label, value }: { label: string; value: number }) {
  return (
    <div style={moneyCard}>
      <p style={{ ...muted, margin: 0, fontSize: 17 }}>{label}</p>
      <p style={{ margin: '18px 0 0', color: '#d9fbff', fontSize: 28, fontWeight: 900 }}>{value.toLocaleString('en-US')} جنيه</p>
    </div>
  );
}
