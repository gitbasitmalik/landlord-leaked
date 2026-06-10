/**
 * EPC API Service — MHCLG Energy Performance of Buildings API
 *
 * Two-step flow:
 *   1. searchEpcByPostcode(postcode) → array of address summaries for the picker
 *   2. fetchEpcByCertNumber(certNumber) → full certificate, normalised for the engine
 */

import Constants from 'expo-constants';

const DEMO_MODE        = false;
// Reads EPC_BEARER_TOKEN from your .env file (gitignored — never commit the real value)
const EPC_BEARER_TOKEN = Constants.expoConfig?.extra?.epcBearerToken
                      || process.env.EPC_BEARER_TOKEN
                      || '';

const EPC_API_BASE = 'https://api.get-energy-performance-data.communities.gov.uk';

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — search by postcode, return address list for the picker UI
// ─────────────────────────────────────────────────────────────────────────────

export async function searchEpcByPostcode(postcode) {
  if (DEMO_MODE) {
    await delay(900);
    return DEMO_ADDRESS_LIST;
  }

  const encoded   = encodeURIComponent(postcode.trim());
  const url       = `${EPC_API_BASE}/api/domestic/search?postcode=${encoded}&page_size=25`;
  const response  = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${EPC_BEARER_TOKEN}`, Accept: 'application/json' },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Bearer token rejected — get a fresh one from your account page.');
    if (response.status === 429) throw new Error('Rate limit hit — please wait a moment and try again.');
    throw new Error(`EPC search error: HTTP ${response.status}`);
  }

  const json    = await response.json();
  const results = json?.data;

  if (!results || !Array.isArray(results) || results.length === 0) return [];

  // Return a clean, UI-ready list — label is the full address string
  return results.map(row => ({
    certNumber:  row.certificateNumber,
    label:       buildAddressLabel(row),
    currentBand: row.currentEnergyEfficiencyBand ?? '?',
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — fetch full certificate by cert number, normalise for the engine
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchEpcByCertNumber(certNumber) {
  if (DEMO_MODE) {
    await delay(900);
    return DEMO_EPC_ROW;
  }

  const url      = `${EPC_API_BASE}/api/certificate?certificate_number=${certNumber}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${EPC_BEARER_TOKEN}`, Accept: 'application/json' },
  });

  if (!response.ok) throw new Error(`EPC certificate fetch error: HTTP ${response.status}`);

  const json    = await response.json();
  const rawCert = json?.data;

  if (!rawCert) return null;

  return normaliseCertificate(rawCert);
}

// ─────────────────────────────────────────────────────────────────────────────
// NORMALISER — maps new API field names → flat format the engine expects
// ─────────────────────────────────────────────────────────────────────────────

function normaliseCertificate(raw) {
  return {
    'lmk-key':                       raw.certificate_number                    ?? '',
    'address1':                      raw.address_line_1                        ?? '',
    'address2':                      raw.address_line_2                        ?? '',
    'posttown':                      raw.post_town                             ?? '',
    'postcode':                      raw.postcode                              ?? '',
    'current-energy-rating':         raw.current_energy_efficiency_band        ?? '',
    'potential-energy-rating':       raw.potential_energy_efficiency_band      ?? '',
    'current-energy-efficiency':     raw.energy_rating_current                 ?? null,
    'potential-energy-efficiency':   raw.energy_rating_potential               ?? null,
    'walls-description':             raw.walls?.[0]?.description               ?? null,
    'roof-description':              raw.roofs?.[0]?.description               ?? null,
    'windows-description':           raw.window?.description                   ?? null,
    'mainheat-description':          raw.main_heating?.[0]?.description        ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function buildAddressLabel(row) {
  return [row.addressLine1, row.addressLine2, row.addressLine3, row.addressLine4]
    .filter(part => part && part !== 'None')
    .join(', ');
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────────────────────
// DEMO DATA
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_ADDRESS_LIST = [
  { certNumber: 'DEMO-001', label: '14 Tenancy Terrace, Flat 1', currentBand: 'F' },
  { certNumber: 'DEMO-002', label: '14 Tenancy Terrace, Flat 2', currentBand: 'E' },
  { certNumber: 'DEMO-003', label: '14 Tenancy Terrace, Flat 3', currentBand: 'D' },
  { certNumber: 'DEMO-004', label: '16 Tenancy Terrace',         currentBand: 'E' },
];

const DEMO_EPC_ROW = {
  'lmk-key':                     'DEMO-LMK-001',
  'address1':                    '14 Tenancy Terrace',
  'address2':                    'Flat 2',
  'posttown':                    'Manchester',
  'postcode':                    'M1 4AB',
  'current-energy-rating':       'E',
  'potential-energy-rating':     'C',
  'current-energy-efficiency':   38,
  'potential-energy-efficiency': 73,
  'walls-description':           'Solid brick, as built, no insulation (assumed)',
  'mainheat-description':        'Electric panel heaters',
  'windows-description':         'Single glazing',
  'roof-description':            'No insulation (assumed)',
};
