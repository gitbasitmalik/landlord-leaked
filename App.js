/**
 * App.js — Root navigator.
 *
 * Screen flow:
 *   SPLASH → check stored session
 *     ├─ session found  → HOME
 *     └─ no session     → LOGIN ↔ SIGNUP → HOME
 *
 * No navigation library needed — simple state machine with clean transitions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen  from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen   from './src/screens/HomeScreen';
import { loadSession, clearSession } from './src/auth/authStorage';
import { COLORS } from './src/styles/theme';

// All possible app states
const SCREEN = {
  SPLASH:  'splash',
  LOGIN:   'login',
  SIGNUP:  'signup',
  HOME:    'home',
};

export default function App() {
  const [screen,  setScreen]  = useState(SCREEN.SPLASH);
  const [user,    setUser]    = useState(null);
  const [opacity] = useState(new Animated.Value(1));

  // Crossfade helper — fades out, swaps screen, fades in
  const navigate = useCallback((nextScreen, nextUser = null) => {
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setUser(nextUser);
      setScreen(nextScreen);
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  }, [opacity]);

  // Called when splash animation finishes — check for stored session
  const handleSplashFinish = useCallback(async () => {
    const session = await loadSession();
    if (session) {
      navigate(SCREEN.HOME, session);
    } else {
      navigate(SCREEN.LOGIN);
    }
  }, [navigate]);

  // Auth success — same handler for login and sign-up
  const handleAuthSuccess = useCallback((loggedInUser) => {
    navigate(SCREEN.HOME, loggedInUser);
  }, [navigate]);

  // Logout — called from HomeScreen (passed as prop)
  const handleLogout = useCallback(async () => {
    await clearSession();
    navigate(SCREEN.LOGIN);
  }, [navigate]);

  const renderScreen = () => {
    switch (screen) {
      case SCREEN.SPLASH:
        return <SplashScreen onFinish={handleSplashFinish} />;

      case SCREEN.LOGIN:
        return (
          <LoginScreen
            onLoginSuccess={handleAuthSuccess}
            onGoToSignUp={() => navigate(SCREEN.SIGNUP)}
          />
        );

      case SCREEN.SIGNUP:
        return (
          <SignUpScreen
            onSignUpSuccess={handleAuthSuccess}
            onGoToLogin={() => navigate(SCREEN.LOGIN)}
          />
        );

      case SCREEN.HOME:
        return <HomeScreen user={user} onLogout={handleLogout} />;

      default:
        return null;
    }
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.root, { opacity }]}>
        {renderScreen()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
});
