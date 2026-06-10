/**
 * LoginScreen — Email + password login.
 * Validates inputs, shows inline errors, persists session on success.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { saveSession } from '../auth/authStorage';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE FIELD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const Field = ({ label, error, inputRef, ...props }) => (
  <View style={fieldStyles.wrapper}>
    <Text style={fieldStyles.label}>{label}</Text>
    <TextInput
      ref={inputRef}
      style={[fieldStyles.input, error && fieldStyles.inputError]}
      placeholderTextColor={COLORS.textMuted}
      {...props}
    />
    {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
  </View>
);

const fieldStyles = StyleSheet.create({
  wrapper:    { marginBottom: SPACING.md },
  label:      { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8, marginBottom: SPACING.xs },
  input: {
    height: 50,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputError: { borderColor: '#EF4444' },
  errorText:  { fontSize: 12, color: '#FCA5A5', marginTop: 4 },
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const LoginScreen = ({ onLoginSuccess, onGoToSignUp }) => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [shake]                 = useState(new Animated.Value(0));

  const passwordRef = useRef(null);

  // Shake animation on failed login
  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shake]);

  const validate = useCallback(() => {
    const e = {};
    if (!email.trim())                    e.email    = `Email is required`;
    else if (!email.includes('@'))        e.email    = `Enter a valid email address`;
    if (!password)                        e.password = `Password is required`;
    else if (password.length < 6)         e.password = `Password must be at least 6 characters`;
    return e;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      triggerShake();
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      // ── Swap this block for a real API call when you have a backend ──
      await new Promise(r => setTimeout(r, 1000)); // simulate network
      const user = { email: email.trim(), name: email.split('@')[0] };
      await saveSession(user);
      onLoginSuccess(user);
    } catch {
      setErrors({ general: `Login failed. Please check your details.` });
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  }, [email, password, validate, triggerShake, onLoginSuccess]);

  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar style="light" />
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* ── HEADER ── */}
              <View style={styles.header}>
                <Text style={styles.icon}>⚡</Text>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Sign in to your Landlord Leaked</Text>
              </View>

              {/* ── FORM ── */}
              <Animated.View style={[styles.form, { transform: [{ translateX: shake }] }]}>

                {errors.general && (
                  <View style={styles.generalError}>
                    <Text style={styles.generalErrorText}>{errors.general}</Text>
                  </View>
                )}

                <Field
                  label="EMAIL ADDRESS"
                  value={email}
                  onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: '' })); }}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  error={errors.email}
                />

                <Field
                  label="PASSWORD"
                  inputRef={passwordRef}
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="••••••••"
                  secureTextEntry
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  error={errors.password}
                />

                {/* ── LOGIN BUTTON ── */}
                <TouchableOpacity
                  style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Sign in"
                >
                  {isLoading
                    ? <ActivityIndicator color={COLORS.white} />
                    : <Text style={styles.primaryBtnText}>SIGN IN</Text>
                  }
                </TouchableOpacity>

                {/* ── DIVIDER ── */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerLabel}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* ── GO TO SIGN UP ── */}
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={onGoToSignUp}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryBtnText}>
                    {`Don't have an account? `}
                    <Text style={styles.secondaryBtnAccent}>Create one</Text>
                  </Text>
                </TouchableOpacity>

              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
  },
  generalError: {
    backgroundColor: '#7F1D1D',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  generalErrorText: {
    color: '#FCA5A5',
    fontSize: 13,
    textAlign: 'center',
  },
  primaryBtn: {
    height: 52,
    backgroundColor: COLORS.fixAccent,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginHorizontal: SPACING.sm,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  secondaryBtnText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  secondaryBtnAccent: {
    color: COLORS.fixAccent,
    fontWeight: '700',
  },
});

export default LoginScreen;
