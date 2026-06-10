/**
 * SplashScreen — Animated logo intro shown on cold launch.
 * Fades in the logo + tagline, then calls onFinish after ~2.2s.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING } from '../styles/theme';

const { height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  // Three animated values for staggered entrance
  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(24)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const badgeOpacity   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo fades + rises in
      Animated.parallel([
        Animated.timing(logoOpacity,    { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      // Tagline fades in 200ms later
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, delay: 100, useNativeDriver: true }),
      // Badge line fades in
      Animated.timing(badgeOpacity,   { toValue: 1, duration: 400, delay: 100, useNativeDriver: true }),
      // Hold for a beat, then call onFinish
      Animated.delay(800),
    ]).start(() => onFinish && onFinish());
  }, []);

  return (
    <LinearGradient
      colors={['#0F172A', '#1a2744', '#0F172A']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <StatusBar style="light" />

      <View style={styles.inner}>
        {/* Lightning bolt icon */}
        <Animated.Text
          style={[styles.icon, { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }] }]}
        >
          ⚡
        </Animated.Text>

        {/* App name */}
        <Animated.Text
          style={[styles.appName, { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }] }]}
        >
          Landlord Leaked
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          UK Energy Efficiency
        </Animated.Text>

        {/* Accent divider */}
        <Animated.View style={[styles.divider, { opacity: taglineOpacity }]} />

        {/* Sub-tagline */}
        <Animated.Text style={[styles.sub, { opacity: badgeOpacity }]}>
          Find your cheap weekend fixes
        </Animated.Text>
      </View>

      {/* Bottom credit */}
      <Animated.Text style={[styles.credit, { opacity: badgeOpacity }]}>
        Powered by MHCLG EPC Data
      </Animated.Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.fixAccent,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.fixAccent,
    borderRadius: 2,
    marginBottom: SPACING.md,
  },
  sub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  credit: {
    position: 'absolute',
    bottom: 48,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
