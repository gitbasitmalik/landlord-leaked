# ⚡ Tenant Survival Guide

A UK-focused React Native (Expo SDK 54) app that pulls official EPC data for any UK property and returns hyper-targeted, cheap, non-structural DIY energy fixes suitable for renters.

## Features

- 🔍 Search by UK postcode — shows all properties, pick your exact address
- 📋 Pulls live EPC data from the MHCLG Energy Performance of Buildings API
- 🛠️ Rule-based fix engine — no AI, pure deterministic lookup dictionary
- 🛒 Interactive shopping checklist per fix (tap to tick off items)
- 🔐 Login / Sign Up screens with session persistence
- 🎨 Dark utility UI with animated splash screen

## Getting Started

### 1. Install dependencies

```bash
cd tenant-app
npm install
```

### 2. Set up your EPC API token

```bash
cp .env.example .env
```

Edit `.env` and paste your bearer token from:
https://get-energy-performance-data.communities.gov.uk (My Account page)

```
EPC_BEARER_TOKEN=your_token_here
```

### 3. Run the app

```bash
npx expo start --lan
```

Scan the QR code with **Expo Go** (SDK 54) on your phone.

## Project Structure

```
src/
  auth/           # Session persistence (AsyncStorage)
  components/     # PostcodeSearch, AddressPicker, FixCard
  data/           # EPC lookup dictionary (hard-coded fix data)
  engine/         # Normalization & matching engine
  screens/        # Splash, Login, SignUp, Home
  services/       # EPC API service (two-step search + fetch)
  styles/         # Theme tokens (colours, typography, spacing)
```

## API

Uses the [MHCLG Energy Performance of Buildings API](https://get-energy-performance-data.communities.gov.uk).
Requires a free bearer token from your GOV.UK One Login account.

## Notes

- `.env` is gitignored — never commit your bearer token
- Set `DEMO_MODE = true` in `epcApiService.js` to use mock data without a token
- Auth is local-only (AsyncStorage) — swap `authStorage.js` for a real backend when ready
