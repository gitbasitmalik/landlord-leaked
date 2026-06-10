/**
 * MASTER RENTER-FIX LOOKUP DICTIONARY
 *
 * Maps EPC API text strings to renter-specific, low-cost weekend fixes.
 * All string values use backtick template literals to avoid apostrophe
 * escape issues in the Metro/Babel bundler.
 */

const EPC_LOOKUP_DICTIONARY = {

  // ───────────────────────────────────────────────────────
  // WALLS
  // ───────────────────────────────────────────────────────
  walls: {
    'solid brick, as built, no insulation (assumed)': {
      user_friendly_issue:
        `Your walls are solid Victorian-era brick with zero insulation. Heat passes straight through them — you're essentially heating the street outside.`,
      tenant_actionable_fix:
        `1. Hang thick thermal curtains floor-to-ceiling on all exterior walls, not just windows — fabric acts as a dead-air buffer layer.\n` +
        `2. Place heavy rugs against cold exterior walls to stop cold radiating into the room.\n` +
        `3. Fit draught excluders to all skirting board gaps along exterior walls using self-adhesive foam tape.`,
      screwfix_shopping_list: [
        `Radiator reflector foil panels (pack of 5) — ~£8`,
        `Self-adhesive draught excluder foam tape (10m roll) — ~£4`,
        `Heavy thermal curtain liner (per panel) — ~£12`,
      ],
    },

    'cavity wall, as built, no insulation (assumed)': {
      user_friendly_issue:
        `Your walls have a cavity gap that could hold insulation — but it's empty. That hollow space lets warm air circulate and escape, costing you significantly on heating bills.`,
      tenant_actionable_fix:
        `1. Place furniture like bookshelves or wardrobes against cold exterior cavity walls to add a buffer layer.\n` +
        `2. Apply removable thermal window film to any adjacent windows to stop that wall's cold radiating inward.\n` +
        `3. Use radiator reflector foil panels behind any radiators on exterior walls to redirect heat into the room.`,
      screwfix_shopping_list: [
        `Radiator reflector foil panels (pack of 5) — ~£8`,
        `Removable window insulation film kit — ~£10`,
        `Thermal blackout curtains (pair) — ~£25`,
      ],
    },
  },

  // ───────────────────────────────────────────────────────
  // MAIN HEATING
  // ───────────────────────────────────────────────────────
  main_heating: {
    'electric storage heaters, manual charge control': {
      user_friendly_issue:
        `Storage heaters charge up overnight on cheap electricity then release heat during the day — but manual control means yours is probably charging too much or releasing heat at the wrong time, wasting money.`,
      tenant_actionable_fix:
        `1. Turn the INPUT dial down to 2-3 overnight (it charges on cheap Economy 7 rate). Only raise it if a very cold day is forecast.\n` +
        `2. Set the OUTPUT dial to 0 at night and when you leave the house — stop it bleeding heat into an empty room.\n` +
        `3. Place a shelf just above the heater to direct warm air outward into the room rather than letting it rise straight to the ceiling.\n` +
        `4. Keep a draught-free room by fitting door draught excluders so the stored heat stays where you need it.`,
      screwfix_shopping_list: [
        `Under-door draught excluder brush strip — ~£6`,
        `Chimney draught balloon (if property has unused fireplace) — ~£18`,
        `Plug-in digital room thermometer/hygrometer — ~£8`,
      ],
    },

    'electric panel heaters': {
      user_friendly_issue:
        `Panel heaters are one of the most expensive ways to heat a home — they use direct electrical resistance, meaning every kilowatt costs you full-price with zero efficiency multiplier. They're essentially a last resort heating system.`,
      tenant_actionable_fix:
        `1. Install a plug-in 24/7 programmable timer socket on each panel heater — set them to heat only 30 mins before you wake and arrive home.\n` +
        `2. Draught-proof the entire room aggressively: door bottoms, window frames, and any skirting board gaps — keeping the heat in reduces run time significantly.\n` +
        `3. Use a portable oil-filled radiator on a timer as a supplement — they retain heat after switching off, unlike panel heaters.`,
      screwfix_shopping_list: [
        `7-day plug-in programmable timer socket — ~£8`,
        `Self-adhesive foam draught seal strip (10m) — ~£4`,
        `Window self-adhesive V-seal weatherstrip — ~£5`,
      ],
    },

    'gas boiler and radiators, mains gas': {
      user_friendly_issue:
        `You have gas central heating which is good — but if the boiler is old or the radiators haven't been bled recently, you're burning gas and getting uneven or lukewarm heat in return.`,
      tenant_actionable_fix:
        `1. Bleed every radiator in the property using a radiator bleed key — trapped air at the top is a silent bill-raiser.\n` +
        `2. Fit thermostatic radiator valves (TRVs) to rooms you don't use — turn them down to 1 or frost setting.\n` +
        `3. Fit radiator reflector foil panels behind every radiator on exterior walls to push heat into the room.\n` +
        `4. Ask your landlord in writing to service the boiler annually — this is their legal obligation.`,
      screwfix_shopping_list: [
        `Radiator bleed key (pack of 2) — ~£2`,
        `Radiator reflector foil panels (pack of 5) — ~£8`,
        `Thermostatic radiator valve head (TRV) — ~£12 each`,
      ],
    },
  },

  // ───────────────────────────────────────────────────────
  // WINDOWS
  // ───────────────────────────────────────────────────────
  windows: {
    'single glazing': {
      user_friendly_issue:
        `Single-pane glass is basically a hole in your wall. It conducts heat straight outside and creates cold draughts near every window — making the rooms feel colder than they actually are.`,
      tenant_actionable_fix:
        `1. Apply removable secondary glazing film (shrink-wrap kit) to every single-glazed window — this creates a trapped air layer that mimics double glazing and is fully removable without damage.\n` +
        `2. Fit self-adhesive V-seal draught strips around all window frames where cold air infiltrates.\n` +
        `3. Hang thick thermal-lined curtains that extend 10cm beyond the window frame on each side and reach the floor — this stops the cold pocket of air near the glass entering the room.`,
      screwfix_shopping_list: [
        `Window insulation shrink film kit (covers 3 windows) — ~£10`,
        `Self-adhesive V-seal window draught strip (5m) — ~£5`,
        `Thermal curtain liners (per pair) — ~£14`,
      ],
    },

    'partial double glazing': {
      user_friendly_issue:
        `Some of your windows are double-glazed but not all — the single-glazed ones are acting as cold spots that drag down the whole room's temperature, and you may not even know which ones they are.`,
      tenant_actionable_fix:
        `1. Run your hand slowly around all window frames on a cold day — the cold-to-touch single-pane ones need secondary glazing film applied first.\n` +
        `2. Apply shrink-wrap secondary glazing film to any remaining single-pane windows.\n` +
        `3. Re-seal any double-glazed frames where the rubber seal has cracked or shrunk using self-adhesive foam draught tape.`,
      screwfix_shopping_list: [
        `Window insulation shrink film kit — ~£10`,
        `Self-adhesive foam draught seal tape (10m) — ~£4`,
        `Clear waterproof frame sealant strip — ~£5`,
      ],
    },
  },

  // ───────────────────────────────────────────────────────
  // ROOF
  // ───────────────────────────────────────────────────────
  roof: {
    'no insulation (assumed)': {
      user_friendly_issue:
        `Up to 25% of your home's heat escapes through the roof. With zero loft insulation you are essentially running your heating system with the window wide open — all that warm air rises straight out.`,
      tenant_actionable_fix:
        `1. If you have loft access, speak to your landlord immediately — installing 270mm of mineral wool insulation is cheap and they may be eligible for government grants.\n` +
        `2. In the meantime, hang thick fabric wall hangings or cork board tiles on the ceiling of the top room to add minor thermal mass.\n` +
        `3. Ensure the loft hatch itself has a draught seal and insulation board fitted to the back — this is renter-safe and highly effective.`,
      screwfix_shopping_list: [
        `Loft hatch draught seal kit — ~£12`,
        `Foil-backed loft hatch insulation board (cut to size) — ~£15`,
        `Self-adhesive foam hatch seal tape — ~£4`,
      ],
    },

    'pit, 100 mm loft insulation': {
      user_friendly_issue:
        `100mm of loft insulation is below the current recommended 270mm standard. You have partial protection but significant heat is still escaping — roughly 40% more than a well-insulated home.`,
      tenant_actionable_fix:
        `1. Ask your landlord in writing to top up loft insulation to 270mm — it's inexpensive and they may qualify for ECO4 government scheme funding.\n` +
        `2. Ensure the loft hatch seal is airtight — a worn seal here loses more heat than you'd expect.\n` +
        `3. Thick thermal curtains in top-floor rooms help trap rising warm air before it hits the under-insulated ceiling.`,
      screwfix_shopping_list: [
        `Loft hatch foam draught seal strip — ~£4`,
        `Thermal blackout curtains for top floor rooms — ~£25`,
        `Plug-in digital thermometer (to monitor top floor heat loss) — ~£8`,
      ],
    },
  },
};

export default EPC_LOOKUP_DICTIONARY;
