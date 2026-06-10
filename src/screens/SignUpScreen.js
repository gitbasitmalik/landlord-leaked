/**
 * SignUpScreen — Name, email, password + confirm password registration.
 * Validates all fields, shows inline errors, persists session on success.
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
// REUSABLE FIELD
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
// PASSWORD STRENGTH INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: 'transparent' };
    let score = 0;
    if (password.length >= 8)             score++;
    if (/[A-Z]/.test(password))           score++;
    if (/[0-9]/.test(password))           score++;
    if (/[^A-Za-z0-9]/.test(password))    score++;
    if (score <= 1) return { level: 1, label: 'Weak',   color: '#EF4444' };
    if (score === 2) return { level: 2, label: 'Fair',   color: '#F59E0B' };
    if (score === 3) return { level: 3, label: 'Good',   color: '#3B82F6' };
    return              { level: 4, label: 'Strong', color: COLORS.fixAccent };
  };

  const { level, label, color } = getStrength();
  if (!password) return null;

  return (
    <View style={strengthStyles.container}>
      <View style={strengthStyles.bars}>
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[strengthStyles.bar, { backgroundColor: i <= level ? color : COLORS.divider }]}
          />
        ))}
      </View>
      <Text style={[strengthStyles.label, { color }]}>{label}</Text>
    </View>
  );
};

const strengthStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: SPACING.xs },
  bars:      { flexDirection: 'row', flex: 1, gap: 4 },
  bar:       { flex: 1, height: 3, borderRadius: 2 },
  label:     { fontSize: 11, fontWeight: '600', marginLeft: SPACING.sm, width: 44 },
});

// ─────────────────────────────────────────────────────────────────────────────
// SIGN UP SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const SignUpScreen = ({ onSignUpSuccess, onGoToLogin }) => {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [errors,   setErrors]   = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [shake]                 = useState(new Animated.Value(0));

  const emailRef    = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef  = useRef(null);

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
    if (!name.trim())                      e.name     = `Full name is required`;
    if (!email.trim())                     e.email    = `Email is required`;
    else if (!email.includes('@'))         e.email    = `Enter a valid email address`;
    if (!password)                         e.password = `Password is required`;
    else if (password.length < 6)          e.password = `Password must be at least 6 characters`;
    if (!confirm)                          e.confirm  = `Please confirm your password`;
    else if (confirm !== password)         e.confirm  = `Passwords do not match`;
    return e;
  }, [name, email, password, confirm]);

  const handleSignUp = useCallback(async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      triggerShake();
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      // ── Swap for a real API call when you have a backend ──
      await new Promise(r => setTimeout(r, 1000));
      const user = { email: email.trim(), name: name.trim() };
      await saveSession(user);
      onSignUpSuccess(user);
    } catch {
      setErrors({ general: `Sign up failed. Please try again.` });
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  }, [name, email, password, confirm, validate, triggerShake, onSignUpSuccess]);

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
                <Text style={styles.title}>Create account</Text>
                <Text style={styles.subtitle}>Start finding your energy fixes for free</Text>
              </View>

              {/* ── FORM ── */}
              <Animated.View style={[styles.form, { transform: [{ translateX: shake }] }]}>

                {errors.general && (
                  <View style={styles.generalError}>
                    <Text style={styles.generalErrorText}>{errors.general}</Text>
                  </View>
                )}

                <Field
                  label="FULL NAME"
                  value={name}
                  onChangeText={t => { setName(t); setErrors(p => ({ ...p, name: '' })); }}
                  placeholder="Jane Smith"
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  error={errors.name}
                />

                <Field
                  label="EMAIL ADDRESS"
                  inputRef={emailRef}
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
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  error={errors.password}
                />

                {/* Password strength meter */}
                <PasswordStrength password={password} />

                <Field
                  label="CONFIRM PASSWORD"
                  inputRef={confirmRef}
                  value={confirm}
                  onChangeText={t => { setConfirm(t); setErrors(p => ({ ...p, confirm: '' })); }}
                  placeholder="••••••••"
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                  error={errors.confirm}
                />

                {/* ── SIGN UP BUTTON ── */}
                <TouchableOpacity
                  style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
                  onPress={handleSignUp}
                  disabled={isLoading}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Create account"
                >
                  {isLoading
                    ? <ActivityIndicator color={COLORS.white} />
                    : <Text style={styles.primaryBtnText}>CREATE ACCOUNT</Text>
                  }
                </TouchableOpacity>

                {/* ── DIVIDER ── */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerLabel}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* ── BACK TO LOGIN ── */}
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={onGoToLogin}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryBtnText}>
                    Already have an account?{` `}
                    <Text style={styles.secondaryBtnAccent}>Sign in</Text>
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
  dividerLine:  { flex: 1, height: 1, backgroundColor: COLORS.divider },
  dividerLabel: { color: COLORS.textMuted, fontSize: 12, marginHorizontal: SPACING.sm },
  secondaryBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  secondaryBtnText:   { fontSize: 14, color: COLORS.textSecondary },
  secondaryBtnAccent: { color: COLORS.fixAccent, fontWeight: '700' },
});

export default SignUpScreen;
