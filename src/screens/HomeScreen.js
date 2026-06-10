/**
 * HomeScreen — Three-state flow:
 *   1. Enter postcode → shows address list (AddressPicker)
 *   2. Tap address   → loads full EPC, shows fix cards
 *   3. "Change"      → goes back to address list without re-searching
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

import PostcodeSearch             from '../components/PostcodeSearch';
import AddressPicker              from '../components/AddressPicker';
import FixCard                    from '../components/FixCard';
import { searchEpcByPostcode,
         fetchEpcByCertNumber }   from '../services/epcApiService';
import { processEpcPayload }      from '../engine/normalizationEngine';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

// ─────────────────────────────────────────────────────────────────────────────
// EPC SUMMARY BANNER
// ─────────────────────────────────────────────────────────────────────────────

const EpcSummaryBanner = ({ epcRow, selectedAddress, onChangeAddress }) => {
  const current   = epcRow['current-energy-rating']   || '?';
  const potential = epcRow['potential-energy-rating'] || '?';
  const currScore = epcRow['current-energy-efficiency'];
  const potScore  = epcRow['potential-energy-efficiency'];
  const delta     = currScore && potScore ? `+${potScore - currScore} pts` : null;

  const ratingColor = {
    A: COLORS.ratingA, B: COLORS.ratingB, C: COLORS.ratingC, D: COLORS.ratingD,
    E: COLORS.ratingE, F: COLORS.ratingF, G: COLORS.ratingG,
  };
  const currColor = ratingColor[current]   || COLORS.textMuted;
  const potColor  = ratingColor[potential] || COLORS.textMuted;

  return (
    <View style={bannerStyles.card}>
      {/* Address row with "Change" button */}
      <View style={bannerStyles.addressRow}>
        <Text style={bannerStyles.address} numberOfLines={2} ellipsizeMode="tail">
          {selectedAddress?.label || [epcRow['address1'], epcRow['address2'], epcRow['posttown']].filter(Boolean).join(', ')}
        </Text>
        <TouchableOpacity
          style={bannerStyles.changeBtn}
          onPress={onChangeAddress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Change selected address"
        >
          <Text style={bannerStyles.changeBtnText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Rating row */}
      <View style={bannerStyles.ratingRow}>
        <View style={bannerStyles.ratingBlock}>
          <Text style={bannerStyles.ratingLabel}>CURRENT</Text>
          <Text style={[bannerStyles.ratingValue, { color: currColor }]}>{current}</Text>
        </View>
        <Text style={bannerStyles.arrow}>→</Text>
        <View style={bannerStyles.ratingBlock}>
          <Text style={bannerStyles.ratingLabel}>POTENTIAL</Text>
          <Text style={[bannerStyles.ratingValue, { color: potColor }]}>{potential}</Text>
        </View>
        {delta && (
          <View style={bannerStyles.deltaBlock}>
            <Text style={bannerStyles.deltaLabel}>IMPROVEMENT</Text>
            <Text style={bannerStyles.deltaValue}>{delta}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const bannerStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.cardGap,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  address: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  changeBtn: {
    backgroundColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.badge,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBlock: {
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  ratingLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  arrow: {
    color: COLORS.textMuted,
    fontSize: 20,
    marginHorizontal: SPACING.sm,
  },
  deltaBlock: {
    alignItems: 'center',
    marginLeft: 'auto',
    paddingLeft: SPACING.md,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.divider,
  },
  deltaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  deltaValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.fixAccent,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// STATE SCREENS
// ─────────────────────────────────────────────────────────────────────────────

const EmptyState = () => (
  <View style={stateStyles.container}>
    <Text style={stateStyles.icon}>🏠</Text>
    <Text style={stateStyles.title}>Enter your postcode above</Text>
    <Text style={stateStyles.body}>
      {`We'll find all properties at your postcode so you can pick your exact address and see personalised energy fixes.`}
    </Text>
  </View>
);

const NoResultsState = ({ postcode }) => (
  <View style={stateStyles.container}>
    <Text style={stateStyles.icon}>🔍</Text>
    <Text style={stateStyles.title}>No properties found</Text>
    <Text style={stateStyles.body}>
      {`Nothing came back for ${postcode}.\n\nThis can happen for new builds or properties where no EPC has been lodged. Try a nearby postcode.`}
    </Text>
  </View>
);

const ErrorState = ({ message }) => (
  <View style={stateStyles.container}>
    <Text style={stateStyles.icon}>⚠️</Text>
    <Text style={[stateStyles.title, { color: '#FCA5A5' }]}>Something went wrong</Text>
    <Text style={[stateStyles.body, { color: '#FCA5A5' }]}>{message}</Text>
  </View>
);

const stateStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  icon:  { fontSize: 48, marginBottom: SPACING.md },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginBottom: SPACING.sm },
  body:  { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

// Three distinct UI states
const SCREEN = { IDLE: 'idle', PICKING: 'picking', RESULTS: 'results' };

const HomeScreen = ({ user, onLogout }) => {
  const [screenState,    setScreenState]    = useState(SCREEN.IDLE);
  const [isLoading,      setIsLoading]      = useState(false);
  const [addresses,      setAddresses]      = useState([]);     // list from step 1
  const [selectedAddr,   setSelectedAddr]   = useState(null);  // chosen address object
  const [epcRow,         setEpcRow]         = useState(null);   // normalised cert
  const [fixResults,     setFixResults]     = useState([]);
  const [error,          setError]          = useState('');
  const [searchedCode,   setSearchedCode]   = useState('');
  const [noResults,      setNoResults]      = useState(false);

  const scrollRef = useRef(null);

  // ── STEP 1: search postcode, populate address list ─────────────────────────
  const handleSearch = useCallback(async (postcode) => {
    setIsLoading(true);
    setError('');
    setNoResults(false);
    setAddresses([]);
    setEpcRow(null);
    setFixResults([]);
    setSelectedAddr(null);
    setSearchedCode(postcode);
    setScreenState(SCREEN.IDLE);

    try {
      const list = await searchEpcByPostcode(postcode);

      if (!list || list.length === 0) {
        setNoResults(true);
        return;
      }

      setAddresses(list);
      setScreenState(SCREEN.PICKING);

      // Scroll down so the address list is visible
      setTimeout(() => scrollRef.current?.scrollTo({ y: 160, animated: true }), 200);

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── STEP 2: user picks an address, fetch full certificate ──────────────────
  const handleSelectAddress = useCallback(async (addressItem) => {
    setIsLoading(true);
    setError('');
    setSelectedAddr(addressItem);

    try {
      const cert = await fetchEpcByCertNumber(addressItem.certNumber);

      if (!cert) {
        setError(`No full EPC data found for ${addressItem.label}`);
        return;
      }

      const results = processEpcPayload(cert);
      setEpcRow(cert);
      setFixResults(results);
      setScreenState(SCREEN.RESULTS);

      // Scroll back to top to show the EPC summary banner first
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 200);

    } catch (err) {
      setError(err.message || 'Failed to load property details.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── "Change address" — go back to address list without re-searching ────────
  const handleChangeAddress = useCallback(() => {
    setEpcRow(null);
    setFixResults([]);
    setSelectedAddr(null);
    setScreenState(SCREEN.PICKING);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 160, animated: true }), 200);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" backgroundColor={COLORS.screenBg} />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── HEADER ── */}
            <View style={styles.header}>
              <Text style={styles.title}>⚡ Landlord Leaked</Text>
              <Text style={styles.subtitle}>UK Energy Efficiency — Find your cheap weekend fixes</Text>
            </View>

            {/* ── SEARCH ── */}
            <PostcodeSearch
              onSearch={handleSearch}
              isLoading={isLoading}
              // Lock input while loading cert details too
            />

            {/* ── ERROR ── */}
            {!isLoading && !!error && <ErrorState message={error} />}

            {/* ── IDLE: empty state ── */}
            {!isLoading && screenState === SCREEN.IDLE && !error && !noResults && <EmptyState />}

            {/* ── NO RESULTS ── */}
            {!isLoading && noResults && <NoResultsState postcode={searchedCode} />}

            {/* ── PICKING: address list ── */}
            {screenState === SCREEN.PICKING && !isLoading && (
              <AddressPicker
                addresses={addresses}
                postcode={searchedCode}
                onSelect={handleSelectAddress}
              />
            )}

            {/* ── RESULTS: EPC summary + fix cards ── */}
            {screenState === SCREEN.RESULTS && !isLoading && epcRow && (
              <View>
                <EpcSummaryBanner
                  epcRow={epcRow}
                  selectedAddress={selectedAddr}
                  onChangeAddress={handleChangeAddress}
                />

                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsCount}>
                    {fixResults.filter(r => r.matched).length} issues found
                  </Text>
                </View>

                {fixResults.map((result, i) => (
                  <FixCard key={`${result.category}-${i}`} result={result} />
                ))}

                <Text style={styles.footnote}>
                  {`Data sourced from the MHCLG EPC register.\nAlways check with your landlord before making changes.`}
                </Text>
              </View>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  resultsHeader: {
    marginBottom: SPACING.sm,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  footnote: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 18,
    paddingHorizontal: SPACING.md,
  },
});

export default HomeScreen;
