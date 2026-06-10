/**
 * AddressPicker — shows a scrollable list of addresses returned for a postcode.
 * User taps one to load its full EPC report.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

// EPC band → colour mapping for the badge
const BAND_COLORS = {
  A: COLORS.ratingA, B: COLORS.ratingB, C: COLORS.ratingC, D: COLORS.ratingD,
  E: COLORS.ratingE, F: COLORS.ratingF, G: COLORS.ratingG,
};

const AddressPicker = ({ addresses, onSelect, postcode }) => {
  if (!addresses || addresses.length === 0) return null;

  const renderItem = ({ item }) => {
    const bandColor = BAND_COLORS[item.currentBand] || COLORS.textMuted;

    return (
      // Each row is a full-width tap target
      <TouchableOpacity
        style={styles.row}
        onPress={() => onSelect(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Select ${item.label}, EPC band ${item.currentBand}`}
      >
        {/* Address text — flex so it wraps before pushing the badge */}
        <Text style={styles.addressText} numberOfLines={2}>{item.label}</Text>

        {/* EPC band badge on the right */}
        <View style={[styles.bandBadge, { backgroundColor: bandColor }]}>
          <Text style={styles.bandText}>{item.currentBand}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {addresses.length} {addresses.length === 1 ? 'property' : 'properties'} found
        </Text>
        <Text style={styles.headerSub}>for {postcode} — tap your address</Text>
      </View>

      {/* Address list — FlatList handles long lists efficiently */}
      <FlatList
        data={addresses}
        keyExtractor={item => item.certNumber}
        renderItem={renderItem}
        scrollEnabled={false}       // parent ScrollView handles scrolling
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.card,
    marginBottom: SPACING.cardGap,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: SPACING.cardPadding,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.cardPadding,
    paddingVertical: SPACING.md,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  bandBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.xs,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bandText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.white,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: SPACING.cardPadding,
  },
});

export default AddressPicker;
