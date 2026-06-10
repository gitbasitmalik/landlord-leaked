/**
 * Global design token file — single source of truth for all colours,
 * typography scales, spacing, and border radii used across the app.
 *
 * High-contrast utility aesthetic: dark slate backgrounds, stark white text,
 * vibrant warning/success accents.
 */

// ─────────────────────────────────────────────────────────────────────────────
// COLOUR PALETTE
// ─────────────────────────────────────────────────────────────────────────────

export const COLORS = {
  // Backgrounds
  screenBg:      '#0F172A', // very dark navy — primary screen background
  cardBg:        '#1E293B', // dark slate — card surface
  inputBg:       '#1E293B', // same as card, consistent input feel
  fixBlockBg:    '#0D2818', // deep emerald-tinted bg for fix step blocks

  // Borders
  cardBorder:    '#334155', // slate-600 — subtle card outline
  inputBorder:   '#475569', // slate-500 — visible but not harsh
  divider:       '#334155', // same as card border for internal dividers
  checkboxBorder:'#64748B', // slate-400 — neutral checkbox outline

  // Text
  textPrimary:   '#F8FAFC', // near-white — primary body copy
  textSecondary: '#CBD5E1', // slate-300 — secondary/supporting text
  textMuted:     '#64748B', // slate-400 — de-emphasised (checked items, diagnostics)
  white:         '#FFFFFF',

  // Accents
  fixAccent:     '#10B981', // emerald-500 — all fix/success elements
  buttonBg:      '#10B981', // same emerald for CTA button
  buttonText:    '#FFFFFF',

  // Severity badge backgrounds
  severityHigh:  '#DC2626', // red-600 — high heat loss / draught risk
  severityMedium:'#D97706', // amber-600 — medium efficiency issues
  severityLow:   '#2563EB', // blue-600 — lower-priority / informational

  // Loader
  loaderColor:   '#10B981',

  // EPC rating colours (optional use in future)
  ratingA:       '#00A651',
  ratingB:       '#52B747',
  ratingC:       '#A8CE37',
  ratingD:       '#FFD800',
  ratingE:       '#F7A600',
  ratingF:       '#EB6909',
  ratingG:       '#E31D23',
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY SCALE
// All font definitions collected here — never defined inline in components.
// ─────────────────────────────────────────────────────────────────────────────

export const TYPOGRAPHY = {
  // Screen-level headline
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },

  // Sub-headline / section title
  screenSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Card category label (e.g. "Walls & Insulation")
  categoryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Severity badge text
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  // "THE PROBLEM" / "THE FIX" section headers
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
  },

  // Main body issue description
  bodyText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 21,
  },

  // Fix step lines inside the green block
  fixStepText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.fixAccent,
    lineHeight: 20,
  },

  // Shopping checklist item text
  checklistText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 20,
    flexShrink: 1,
  },

  // Tiny diagnostic text (matched EPC key label)
  diagnosticText: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },

  // Input field text
  inputText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 1.5, // postcodes look better spaced
  },

  // Input placeholder
  placeholderText: COLORS.textMuted,

  // CTA button label
  buttonLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.buttonText,
  },

  // EPC rating display
  epcRatingLarge: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  // Small meta text (address, postcode)
  metaText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textMuted,
  },

  // Error message text
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FCA5A5', // red-300 — readable on dark bg
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SPACING SCALE (in dp)
// ─────────────────────────────────────────────────────────────────────────────

export const SPACING = {
  xs:            4,
  sm:            8,
  md:            16,
  lg:            24,
  xl:            32,
  cardPadding:   16,
  cardGap:       12,
  screenPadding: 16,
  badgePaddingH: 8,
  badgePaddingV: 3,
};

// ─────────────────────────────────────────────────────────────────────────────
// BORDER RADIUS SCALE (in dp)
// ─────────────────────────────────────────────────────────────────────────────

export const RADIUS = {
  xs:    4,
  sm:    6,
  card:  10,
  badge: 20, // pill shape for severity badges
  input: 8,
  button:8,
};
