/**
 * PostcodeSearch — Inline postcode input + search button.
 * Validates UK postcode format before firing the search callback.
 * Shows ActivityIndicator inside the button while loading.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../styles/theme';

// Loose UK postcode regex — catches format errors before hitting the API
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;

const PostcodeSearch = ({ onSearch, isLoading }) => {
  const [postcode, setPostcode]           = useState('');
  const [validationError, setValidationError] = useState('');

  // Force uppercase as the user types — postcodes are always uppercase
  const handleChangeText = useCallback((text) => {
    setValidationError('');
    setPostcode(text.toUpperCase());
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = postcode.trim();
    if (!UK_POSTCODE_REGEX.test(trimmed)) {
      setValidationError('Enter a valid UK postcode (e.g. SW1A 2AA)');
      return;
    }
    setValidationError('');
    onSearch(trimmed);
  }, [postcode, onSearch]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {/* TextInput: autoCapitalize="characters" keeps all letters uppercase */}
        <TextInput
          style={styles.input}
          value={postcode}
          onChangeText={handleChangeText}
          placeholder="e.g. SW1A 2AA"
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          keyboardType="default"
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          editable={!isLoading}
          maxLength={8}
          accessibilityLabel="UK postcode input"
        />

        {/* Button swaps to ActivityIndicator while the API call is in flight */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isLoading ? 'Searching...' : 'Search postcode'}
        >
          {isLoading
            ? <ActivityIndicator size="small" color={COLORS.white} />
            : <Text style={styles.buttonLabel}>SEARCH →</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Inline validation error — only renders when there's a message */}
      {validationError ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {validationError}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 1.5,
  },
  button: {
    height: 50,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.buttonBg,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLabel: {
    ...TYPOGRAPHY.buttonLabel,
  },
  errorText: {
    ...TYPOGRAPHY.errorText,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
});

export default PostcodeSearch;
