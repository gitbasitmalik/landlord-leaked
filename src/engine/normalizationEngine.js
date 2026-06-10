/**
 * PHASE 2: DATA NORMALIZATION & MATCHING ENGINE
 *
 * Provides deterministic, rule-based matching of raw EPC API strings
 * against the master lookup dictionary. No AI or external calls involved.
 */

import EPC_LOOKUP_DICTIONARY from '../data/epcLookupDictionary';

// ─────────────────────────────────────────────────────────────────────────────
// SANITIZATION HELPER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sanitizes a raw API string: lowercase, trim whitespace, collapse multiple
 * spaces, and strip leading/trailing punctuation. Guarantees a clean
 * comparison surface before any matching logic runs.
 *
 * @param {string} raw - The raw string from the EPC API response
 * @returns {string} - Normalized, lowercase, trimmed string
 */
function sanitize(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .toLowerCase()         // normalize case
    .trim()                // remove leading/trailing whitespace
    .replace(/\s+/g, ' ')  // collapse internal multiple spaces to single space
    .replace(/[^\w\s,().]/g, ''); // strip exotic punctuation, keep commas/parens/dots
}

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD EXTRACTION MAP
// Maps each category to a set of keyword fragments that anchor a match,
// allowing slight assessor wording variations to still resolve correctly.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-category keyword matchers. Each entry is an array of objects:
 *   - keywords: all of these substrings must appear in the sanitized input
 *   - dictionaryKey: the exact key to look up in EPC_LOOKUP_DICTIONARY[category]
 */
const KEYWORD_MATCHERS = {
  walls: [
    { keywords: ['solid brick', 'no insulation'],  dictionaryKey: 'solid brick, as built, no insulation (assumed)' },
    { keywords: ['cavity wall', 'no insulation'],  dictionaryKey: 'cavity wall, as built, no insulation (assumed)' },
  ],

  main_heating: [
    { keywords: ['storage heater', 'manual'],      dictionaryKey: 'electric storage heaters, manual charge control' },
    { keywords: ['panel heater'],                   dictionaryKey: 'electric panel heaters' },
    { keywords: ['gas boiler', 'radiator'],         dictionaryKey: 'gas boiler and radiators, mains gas' },
    // Extra alias: some assessors write "gas fired boiler"
    { keywords: ['gas fired', 'radiator'],          dictionaryKey: 'gas boiler and radiators, mains gas' },
  ],

  windows: [
    // "partial double glazing" must be checked BEFORE "double glazing" to
    // avoid the more specific case being swallowed by a broader match.
    { keywords: ['partial', 'double glazing'],      dictionaryKey: 'partial double glazing' },
    { keywords: ['single glazing'],                 dictionaryKey: 'single glazing' },
  ],

  roof: [
    { keywords: ['no insulation'],                  dictionaryKey: 'no insulation (assumed)' },
    // "pit" is the EPC assessor term for "pitched roof" — reliable disambiguator
    { keywords: ['100 mm', 'loft insulation'],      dictionaryKey: 'pit, 100 mm loft insulation' },
    { keywords: ['100mm', 'loft insulation'],       dictionaryKey: 'pit, 100 mm loft insulation' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE MATCHING FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * matchEpcFeature — The primary matching function.
 *
 * Takes a raw EPC API text string and a category name, sanitizes the input,
 * runs keyword-based multi-fragment matching, then returns the corresponding
 * dictionary entry or a structured fallback object.
 *
 * @param {string} rawApiText - The raw description string from the EPC API
 * @param {string} category   - One of: 'walls' | 'main_heating' | 'windows' | 'roof'
 * @returns {object} - A match result object with the renter-fix data, or a fallback
 */
export function matchEpcFeature(rawApiText, category) {
  // Step 1: Validate that the requested category exists in the dictionary
  const categoryDict = EPC_LOOKUP_DICTIONARY[category];
  if (!categoryDict) {
    return buildFallback(rawApiText, category, `Unknown category: "${category}"`);
  }

  // Step 2: Sanitize the raw input string
  const sanitized = sanitize(rawApiText);

  if (!sanitized) {
    return buildFallback(rawApiText, category, 'Empty or non-string input');
  }

  // Step 3: Attempt keyword-fragment matching via the KEYWORD_MATCHERS map
  const matchers = KEYWORD_MATCHERS[category] || [];

  for (const matcher of matchers) {
    // ALL keywords in the matcher's array must be present in the sanitized string
    const allPresent = matcher.keywords.every(kw => sanitized.includes(kw));

    if (allPresent) {
      const entry = categoryDict[matcher.dictionaryKey];
      if (entry) {
        // Step 4: Return enriched result including source metadata
        return {
          matched: true,
          category,
          raw_input: rawApiText,
          matched_key: matcher.dictionaryKey,
          ...entry, // spreads: user_friendly_issue, tenant_actionable_fix, screwfix_shopping_list
        };
      }
    }
  }

  // Step 5: Fallback — no keyword match found; return a safe, informative object
  return buildFallback(rawApiText, category, 'No keyword pattern matched');
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOAD PROCESSOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * processEpcPayload — Processes a full EPC API response object.
 *
 * Accepts the raw 'rows' array from the EPC API response, extracts the
 * relevant fields per category, runs each through matchEpcFeature, and
 * returns a structured "Landlord Leak" results array.
 *
 * @param {object} epcRow - A single property row from the EPC API response
 * @returns {Array<object>} - Array of matched (or fallback) fix objects
 */
export function processEpcPayload(epcRow) {
  if (!epcRow || typeof epcRow !== 'object') {
    throw new Error('processEpcPayload: expected a valid EPC row object');
  }

  // Map from EPC API field names → our internal category keys
  const fieldCategoryMap = [
    { apiField: 'walls-description',        category: 'walls'        },
    { apiField: 'mainheat-description',     category: 'main_heating' },
    { apiField: 'windows-description',      category: 'windows'      },
    { apiField: 'roof-description',         category: 'roof'         },
  ];

  const results = [];

  for (const { apiField, category } of fieldCategoryMap) {
    const rawText = epcRow[apiField];

    // Only process if the field is present in the payload
    if (rawText !== undefined && rawText !== null) {
      const matchResult = matchEpcFeature(rawText, category);
      results.push(matchResult);
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildFallback — Constructs a safe, informative fallback object when no
 * dictionary match can be found. Prevents the UI from crashing on unexpected
 * EPC assessor wording variations.
 *
 * @param {string} rawApiText - The original unmatched string
 * @param {string} category   - The category that was queried
 * @param {string} reason     - Debug reason for the fallback
 * @returns {object}
 */
function buildFallback(rawApiText, category, reason) {
  return {
    matched: false,
    category,
    raw_input: rawApiText,
    matched_key: null,
    fallback_reason: reason,
    user_friendly_issue:
      `We couldn't find a specific fix for "${rawApiText}". Consider sharing your full EPC report with a local energy advice service.`,
    tenant_actionable_fix:
      `Contact the Citizens Advice Bureau or your local council's energy efficiency team for tailored advice on this property feature.`,
    screwfix_shopping_list: [
      'Draught excluder foam tape (general purpose) — ~£4',
      'Radiator reflector foil panels — ~£8',
    ],
  };
}
