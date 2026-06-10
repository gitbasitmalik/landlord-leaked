/**
 * FixCard — Renders a single identified property issue and its renter fix.
 *
 * Displays: severity badge, plain-language issue description, actionable fix
 * steps (in high-visibility green), and an interactive shopping checklist
 * with tap-to-check behaviour.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../styles/theme';

// Maps category keys to a human-readable label and severity badge config
const CATEGORY_META = {
  walls:        { label: 'Walls & Insulation',  severity: 'HIGH HEAT LOSS',    badgeColor: COLORS.severityHigh   },
  main_heating: { label: 'Heating System',       severity: 'HIGH RUNNING COST', badgeColor: COLORS.severityMedium },
  windows:      { label: 'Windows & Glazing',    severity: 'HIGH DRAUGHT RISK', badgeColor: COLORS.severityHigh   },
  roof:         { label: 'Roof & Loft',          severity: 'HEAT ESCAPE RISK',  badgeColor: COLORS.severityMedium },
};

// ─────────────────────────────────────────────────────────────────────────────
// SHOPPING CHECKLIST ITEM
// Custom checkbox row — React Native has no native checkbox element.
// Tapping toggles local boolean state; shows ✓ and line-through when checked.
// ─────────────────────────────────────────────────────────────────────────────

const ChecklistItem = ({ item, isChecked, onToggle }) => (
  <TouchableOpacity
    style={styles.checklistRow}
    onPress={onToggle}
    activeOpacity={0.7}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: isChecked }}
    accessibilityLabel={item}
  >
    {/* Visual checkbox — filled green with ✓ when checked */}
    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
      {isChecked && <Text style={styles.checkmark}>✓</Text>}
    </View>

    {/* Product text — strikethrough when checked */}
    <Text style={[styles.checklistText, isChecked && styles.checklistTextDone]}>
      {item}
    </Text>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FIX CARD
// ─────────────────────────────────────────────────────────────────────────────

const FixCard = ({ result }) => {
  const {
    category,
    user_friendly_issue,
    tenant_actionable_fix,
    screwfix_shopping_list = [],
    matched,
    matched_key,
  } = result;

  // Per-card checklist state — keyed by item index
  const [checkedItems, setCheckedItems] = useState({});

  const handleToggleItem = useCallback((index) => {
    setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const meta = CATEGORY_META[category] || {
    label: category,
    severity: 'REVIEW NEEDED',
    badgeColor: COLORS.severityLow,
  };

  // Split multi-line fix text into individual step lines
  const fixSteps = tenant_actionable_fix
    ? tenant_actionable_fix.split('\n').filter(line => line.trim().length > 0)
    : [];

  return (
    <View style={styles.card}>

      {/* ── HEADER: category label + severity badge ── */}
      <View style={styles.headerRow}>
        <Text style={styles.categoryLabel}>{meta.label}</Text>
        <View style={[styles.severityBadge, { backgroundColor: meta.badgeColor }]}>
          <Text style={styles.severityText}>{meta.severity}</Text>
        </View>
      </View>

      {/* ── MATCHED EPC KEY (small diagnostic label) ── */}
      {matched && matched_key ? (
        <Text style={styles.matchedKey} numberOfLines={1} ellipsizeMode="tail">
          EPC: {matched_key}
        </Text>
      ) : null}

      {/* ── PROBLEM DESCRIPTION ── */}
      <Text style={styles.sectionLabel}>THE PROBLEM</Text>
      <Text style={styles.issueText}>{user_friendly_issue}</Text>

      {/* ── FIX STEPS — rendered in high-visibility green block ── */}
      <Text style={styles.sectionLabel}>THE FIX</Text>
      <View style={styles.fixBlock}>
        {fixSteps.map((step, i) => (
          <Text key={i} style={styles.fixStepText}>{step}</Text>
        ))}
      </View>

      {/* ── SHOPPING CHECKLIST ── */}
      {screwfix_shopping_list.length > 0 && (
        <View style={styles.shoppingSection}>
          <Text style={styles.sectionLabel}>SHOPPING LIST</Text>
          {screwfix_shopping_list.map((item, index) => (
            <ChecklistItem
              key={index}
              item={item}
              isChecked={!!checkedItems[index]}
              onToggle={() => handleToggleItem(index)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.cardGap,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryLabel: {
    ...TYPOGRAPHY.categoryLabel,
    flex: 1,
    marginRight: SPACING.sm,
  },
  severityBadge: {
    paddingHorizontal: SPACING.badgePaddingH,
    paddingVertical: SPACING.badgePaddingV,
    borderRadius: RADIUS.badge,
  },
  severityText: {
    ...TYPOGRAPHY.badgeText,
  },
  matchedKey: {
    ...TYPOGRAPHY.diagnosticText,
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    ...TYPOGRAPHY.sectionLabel,
    marginBottom: SPACING.xs,
  },
  issueText: {
    ...TYPOGRAPHY.bodyText,
    marginBottom: SPACING.md,
  },
  fixBlock: {
    backgroundColor: COLORS.fixBlockBg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.fixAccent,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  fixStepText: {
    ...TYPOGRAPHY.fixStepText,
    marginBottom: SPACING.xs,
  },
  shoppingSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: COLORS.checkboxBorder,
    borderRadius: RADIUS.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: COLORS.fixAccent,
    borderColor: COLORS.fixAccent,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  checklistText: {
    ...TYPOGRAPHY.checklistText,
    flex: 1,
  },
  checklistTextDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
});

export default FixCard;
