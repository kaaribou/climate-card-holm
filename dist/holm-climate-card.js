/* HOLM Climate Card — https://github.com/kaaribou/climate-card-holm (licence MIT)
 * Carte climate compacte et vivante, pensée pour tenir à 2 côte à côte sur
 * mobile (6 colonnes) tout en s'étalant joliment en pleine largeur.
 * - Ambiance dynamique selon l'usage : éteint (sobre, désaturé),
 *   chauffage (lueur chaude + braises qui montent), clim (lueur froide +
 *   flocons qui tombent). Animations actives seulement quand l'appareil
 *   chauffe/refroidit réellement (hvac_action), sinon lueur apaisée.
 * - Roue de consigne 270° (glisser), − / + logés dans l'ouverture de la roue
 * - Modes en pastilles icônes (jamais tronquées) : Éteint / Chauffage / Clim
 * - Ventilation, préréglage, oscillation : puces compactes → volet de choix
 * - Mises à jour optimistes (latence Daikin Cloud)
 * - Vue compacte (layout: compact), consignes mini / maxi, sonde de température
 *   au choix et graphique de température au toucher
 * - Option Versatile Thermostat (vtherm: true) : pastilles fenêtre / présence /
 *   mouvement / délestage / sécurité / verrou, raison de l'arrêt, preset
 *   temporisé avec décompte, puissance de chauffe et température extérieure
 *   + inhibition (avec bypass), arrêt automatique (auto-start/stop), défaut de chauffe,
 *   pastilles actives au toucher (bypass fenêtre, inhibition, auto-start/stop),
 *   volet « Pourquoi cet état ? » (messages du VTherm traduits) au toucher sur l'état
 * - Pastilles d'état configurables (badges) pour n'importe quel thermostat
 */
(() => {
  const VERSION = "1.8.1";
  // Échappement HTML de toute valeur venant d'une entité, de ses attributs ou de la configuration avant insertion dans un gabarit.
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  // ---------- textes (fr = comportement d'origine, langue choisie d'après Home Assistant) ----------
  const I18N = {
    fr: {
      room_temp: "Température",
      ass_mode_t: "Mode à l'arrêt automatique : {0}. Toucher pour changer",
      ass_mode_title: "Mode quand l'auto-start/stop arrête",
      e_vtherm_auto_start_stop_mode: "Liste « mode à l'arrêt » de l'auto-start/stop (automatique si vide)",
      e_main_value: "Grande valeur au centre de la roue",
      e_main_target: "Consigne (mesure en dessous)",
      e_main_current: "Température mesurée (consigne en dessous)",
      setpoint_t: "Consigne",
      e_language: "Langue", e_lang_auto: "Automatique (profil)",
      dec: ",",
      mode_off: "Éteint", mode_heat: "Chauffe", mode_cool: "Clim", mode_heat_cool: "Auto", mode_auto: "Auto", mode_dry: "Déshum.", mode_fan_only: "Ventil.",
      act_heating: "Chauffe", act_cooling: "Refroidit", act_drying: "Déshumidifie", act_fan: "Ventile", act_idle: "En veille", act_off: "Éteint", act_preheating: "Préchauffe", act_defrosting: "Dégivrage",
      fan_auto: "Auto", fan_quiet: "Silence", fan_low: "Faible", fan_medium: "Moyen", fan_high: "Fort", fan_off: "Arrêt",
      preset_none: "Normal", preset_boost: "Boost", preset_away: "Absent", preset_eco: "Éco", preset_comfort: "Confort", preset_sleep: "Nuit", preset_home: "Maison",
      preset_activity: "Activité", preset_frost: "Hors-gel", preset_power: "Délestage", preset_safety: "Sécurité", preset_security: "Sécurité",
      swing_off: "Fixe", swing_stop: "Fixe", swing_on: "Oscille", swing_swing: "Oscille", swing_windnice: "Confort", swing_vertical: "Vertical", swing_horizontal: "Horiz.", swing_both: "Les deux",
      rs_window: "fenêtre ouverte", rs_ass: "auto-start/stop", rs_sleep: "veille", rs_safety: "sécurité", rs_central: "mode central", rs_inhibition: "inhibé",
      rs_fan_ass: "ventilation (auto-start/stop)", rs_dry_ass: "déshumidification (auto-start/stop)",
      msg_safety_detected: "Mode sécurité : la sonde de température ne répond plus",
      msg_overpowering_detected: "Délestage : puissance maximale atteinte",
      msg_hvac_off_manual: "Éteint manuellement",
      msg_hvac_off_auto_start_stop: "Éteint par l'auto-start/stop",
      msg_hvac_off_window_detection: "Éteint par la détection d'ouverture",
      msg_hvac_off_sleep_mode: "Éteint par le mode veille",
      msg_hvac_off_safety_detection: "Éteint par le mode sécurité",
      msg_hvac_off_central_mode: "Éteint par le mode central",
      msg_hvac_off_inhibition: "Thermostat inhibé : commande des appareils suspendue",
      msg_hvac_fan_only_auto_start_stop: "Ventilation seule par l'auto-start/stop",
      msg_hvac_dry_auto_start_stop: "Déshumidification par l'auto-start/stop",
      msg_target_temp_window_eco: "Consigne abaissée : fenêtre ouverte (éco)",
      msg_target_temp_window_frost: "Consigne abaissée : fenêtre ouverte (hors-gel)",
      msg_target_temp_power: "Consigne abaissée : délestage",
      msg_target_temp_central_mode: "Consigne imposée par le mode central",
      msg_target_temp_activity_detected: "Consigne : activité détectée",
      msg_target_temp_activity_not_detected: "Consigne : pas d'activité dans la pièce",
      msg_target_temp_absence_detected: "Consigne : absence détectée",
      msg_target_temp_timed_preset: "Consigne : préréglage temporaire en cours",
      msg_not_initialized: "Thermostat en cours d'initialisation",
      msg_underlying_unavailable: "Un appareil piloté est indisponible",
      err_entity: "Choisis une entité climate dans l'éditeur.",
      history: "Historique de la température", setpoint: "Consigne", lower: "Baisser", raise: "Monter", close: "Fermer", unavailable: "Entité indisponible",
      fan: "Ventilation", preset: "Préréglage", timed: "Préréglage temporaire", timer: "Minuteur", swing_v: "Oscillation verticale", swing_h: "Oscillation horizontale",
      why: "Pourquoi cet état ?",
      st_safety: "Sécurité · sonde muette", st_heat_fail: "Défaut de chauffe", st_cool_fail: "Défaut de refroidissement", st_inhibited: "Arrêté · inhibé",
      st_overpower: "Délestage en cours", st_win_off: "Arrêté · fenêtre ouverte", st_win: "Fenêtre ouverte", st_stopped: "Arrêté · {0}", st_timed: "{0} · encore {1}",
      p_safety: "Sécurité", p_safety_t: "Sonde de température muette : chauffe de sécurité",
      p_overpower: "Délestage", p_overpower_t: "Puissance maximale atteinte : chauffage délesté",
      p_fail: "Défaut", p_heat_fail_t: "Défaut de chauffage détecté : la température ne monte pas", p_cool_fail_t: "Défaut de refroidissement détecté",
      p_inh_bypass: "Inhibition ignorée", p_inh_bypass_t: "Bypass de l'inhibition actif", p_inh_bypass_tap: "Bypass de l'inhibition actif — toucher pour le désactiver",
      p_inh: "Inhibé", p_inh_t: "Commande des appareils suspendue", p_inh_tap: "Commande des appareils suspendue — toucher pour ignorer l'inhibition",
      p_win_bypass: "Fenêtre ignorée", p_win_bypass_tap: "La détection d'ouverture est ignorée — toucher pour la rétablir",
      p_win_open: "Fenêtre ouverte", p_win_open_tap: "Ouverture détectée : chauffage réduit ou coupé — toucher pour l'ignorer",
      p_win_closed_tap: "Fenêtres fermées — toucher pour ignorer la détection d'ouverture",
      p_ass_stop: "Arrêt auto", p_ass_stopped_t: "Arrêté par l'auto-start/stop", p_ass_on_t: "Auto-start/stop actif", p_ass_off_t: "Auto-start/stop désactivé",
      p_tap_off: "{0} — toucher pour le désactiver", p_tap_on: "{0} — toucher pour l'activer",
      p_present_t: "Présence détectée", p_away: "Absent", p_away_t: "Personne à la maison : consigne d'absence",
      p_motion: "Mouvement", p_motion_t: "Mouvement détecté dans la pièce", p_no_motion_t: "Pas de mouvement",
      p_locked: "Verrouillé", p_locked_t: "Thermostat verrouillé",
      pw_heat: "Chauffe {0} %", pw_ext: "Ext. {0}°",
      w_timed: "Préréglage temporaire en cours", w_remaining: "{0}, encore {1}", w_inh_bypass: "Bypass de l'inhibition activé", w_win_bypass: "Détection d'ouverture ignorée (bypass)",
      w_heat_fail: "Défaut de chauffage détecté", w_heat_fail_sub: "La température ne monte pas malgré la chauffe", w_cool_fail: "Défaut de refroidissement détecté",
      w_locked: "Thermostat verrouillé", w_recalc: "Appareil piloté en cours de mise à jour", w_none: "Aucune alerte",
      lk_lock: "Verrouiller", lk_unlock: "Déverrouiller", lk_locked: "Commandes verrouillées : touchez le cadenas pour déverrouiller", lk_vt: "Verrouillé par Versatile Thermostat : touchez pour déverrouiller", lk_vt_open: "Déverrouillé : touchez pour verrouiller", lk_local_open: "Déverrouillé quelques secondes : touchez pour verrouiller", lk_code: "Code de verrouillage", lk_bad: "Code refusé", lk_title: "Verrouillage",
      e_lock: "Verrouiller les commandes (anti-erreur au défilement)", e_lock_delay: "Durée du déverrouillage",
      w_off_sub: "Le thermostat est à l'arrêt.", w_ok_sub: "Le thermostat suit sa consigne normalement.",
      tp_left: "<b>{0}</b> encore {1}", tp_then: " · puis {0}", tp_cancel: "Annuler", tp_for: "Pendant",
      e_entity: "Entité climate", e_name: "Nom affiché", e_icon: "Icône (appareil éteint)", e_show_fan: "Ventilation", e_show_preset: "Préréglage (boost…)",
      e_show_swing: "Oscillation", e_layout: "Présentation", e_min_temp: "Consigne minimum", e_max_temp: "Consigne maximum",
      e_temperature_sensor: "Sonde de température (sinon celle de l'appareil)", e_graph_hours: "Durée du graphique par défaut",
      e_badges: "Pastilles d'état (jusqu'à 4 entités : fenêtre, présence, humidité…)",
      e_vtherm: "Fonctions Versatile Thermostat (fenêtre, présence, délestage, minuteur…)", e_vtherm_info: "Informations sous les commandes",
      e_vtherm_inhibition_bypass: "Interrupteur de bypass de l'inhibition (plugin d'inhibition)", e_vtherm_auto_start_stop: "Interrupteur auto-start/stop (automatique si vide)",
      e_layout_full: "Complète (avec la roue)", e_layout_compact: "Compacte (en largeur, sans la roue)",
      e_theme: "Thème", e_theme_auto: "Automatique (comme Home Assistant)", e_theme_dark: "Sombre", e_theme_light: "Clair", e_hidden_presets: "Préréglages masqués",
      e_info_heat: "Taux de chauffe (%)", e_info_power: "Puissance moyenne (W)", e_info_ext: "Température extérieure", e_info_bar: "Barre de chauffe",
      g_temp: "Température", g_sensor: " · sonde", g_loading: "Chargement…", g_error: "Historique indisponible : {0}", g_nodata: "Aucune donnée de température sur cette période.",
      g_current: "Actuelle", g_min: "Min", g_max: "Max", g_avg: "Moyenne", g_heat: "Chauffe", g_cool: "Clim", g_setpoint: "consigne {0}°",
      g_hours: "{0} h", g_days: "{0} j", g_hour_axis: "{0}h",
      card_desc: "Clim/chauffage compacte et animée selon l'usage (éteint, chauffage, clim), lisible à 2 côte à côte sur mobile.",
    },
    de: {
      room_temp: "Temperatur",
      ass_mode_t: "Modus bei automatischem Stopp: {0}. Tippen zum Ändern",
      ass_mode_title: "Modus, wenn Auto-Start/Stopp anhält",
      e_vtherm_auto_start_stop_mode: "Auswahl „Modus beim Stopp“ von Auto-Start/Stopp (automatisch, wenn leer)",
      e_main_value: "Großer Wert in der Mitte des Drehreglers",
      e_main_target: "Sollwert (Messwert darunter)",
      e_main_current: "Gemessene Temperatur (Sollwert darunter)",
      setpoint_t: "Sollwert",
      e_language: "Sprache", e_lang_auto: "Automatisch (Profil)",
      dec: ",",
      mode_off: "Aus", mode_heat: "Heizen", mode_cool: "Kühlen", mode_heat_cool: "Auto", mode_auto: "Auto", mode_dry: "Entfeuchten", mode_fan_only: "Lüften",
      act_heating: "Heizt", act_cooling: "Kühlt", act_drying: "Entfeuchtet", act_fan: "Lüftet", act_idle: "Leerlauf", act_off: "Aus", act_preheating: "Vorheizen", act_defrosting: "Abtauen",
      fan_auto: "Auto", fan_quiet: "Leise", fan_low: "Niedrig", fan_medium: "Mittel", fan_high: "Hoch", fan_off: "Aus",
      preset_none: "Normal", preset_boost: "Boost", preset_away: "Abwesend", preset_eco: "Eco", preset_comfort: "Komfort", preset_sleep: "Nacht", preset_home: "Zuhause",
      preset_activity: "Aktivität", preset_frost: "Frostschutz", preset_power: "Lastabwurf", preset_safety: "Sicherheit", preset_security: "Sicherheit",
      swing_off: "Fest", swing_stop: "Fest", swing_on: "Schwenken", swing_swing: "Schwenken", swing_windnice: "Komfort", swing_vertical: "Vertikal", swing_horizontal: "Horiz.", swing_both: "Beide",
      rs_window: "Fenster offen", rs_ass: "Auto-Start/Stopp", rs_sleep: "Ruhemodus", rs_safety: "Sicherheit", rs_central: "Zentralmodus", rs_inhibition: "ausgesetzt",
      rs_fan_ass: "Lüften (Auto-Start/Stopp)", rs_dry_ass: "Entfeuchten (Auto-Start/Stopp)",
      msg_safety_detected: "Sicherheitsmodus: Der Temperatursensor antwortet nicht mehr",
      msg_overpowering_detected: "Lastabwurf: maximale Leistung erreicht",
      msg_hvac_off_manual: "Manuell ausgeschaltet",
      msg_hvac_off_auto_start_stop: "Durch Auto-Start/Stopp ausgeschaltet",
      msg_hvac_off_window_detection: "Durch die Fensteröffnungserkennung ausgeschaltet",
      msg_hvac_off_sleep_mode: "Durch den Ruhemodus ausgeschaltet",
      msg_hvac_off_safety_detection: "Durch den Sicherheitsmodus ausgeschaltet",
      msg_hvac_off_central_mode: "Durch den Zentralmodus ausgeschaltet",
      msg_hvac_off_inhibition: "Thermostat ausgesetzt: Gerätesteuerung pausiert",
      msg_hvac_fan_only_auto_start_stop: "Nur Lüften durch Auto-Start/Stopp",
      msg_hvac_dry_auto_start_stop: "Entfeuchten durch Auto-Start/Stopp",
      msg_target_temp_window_eco: "Sollwert abgesenkt: Fenster offen (Eco)",
      msg_target_temp_window_frost: "Sollwert abgesenkt: Fenster offen (Frostschutz)",
      msg_target_temp_power: "Sollwert abgesenkt: Lastabwurf",
      msg_target_temp_central_mode: "Sollwert vom Zentralmodus vorgegeben",
      msg_target_temp_activity_detected: "Sollwert: Aktivität erkannt",
      msg_target_temp_activity_not_detected: "Sollwert: keine Aktivität im Raum",
      msg_target_temp_absence_detected: "Sollwert: Abwesenheit erkannt",
      msg_target_temp_timed_preset: "Sollwert: temporäre Voreinstellung aktiv",
      msg_not_initialized: "Thermostat wird initialisiert",
      msg_underlying_unavailable: "Ein gesteuertes Gerät ist nicht verfügbar",
      err_entity: "Wähle im Editor eine Klima-Entität aus.",
      history: "Temperaturverlauf", setpoint: "Sollwert", lower: "Senken", raise: "Erhöhen", close: "Schließen", unavailable: "Entität nicht verfügbar",
      fan: "Lüfter", preset: "Voreinstellung", timed: "Temporäre Voreinstellung", timer: "Timer", swing_v: "Vertikales Schwenken", swing_h: "Horizontales Schwenken",
      why: "Warum dieser Zustand?",
      st_safety: "Sicherheit · Sensor stumm", st_heat_fail: "Heizungsausfall", st_cool_fail: "Kühlungsausfall", st_inhibited: "Gestoppt · ausgesetzt",
      st_overpower: "Lastabwurf aktiv", st_win_off: "Gestoppt · Fenster offen", st_win: "Fenster offen", st_stopped: "Gestoppt · {0}", st_timed: "{0} · noch {1}",
      p_safety: "Sicherheit", p_safety_t: "Temperatursensor stumm: Sicherheitsheizung",
      p_overpower: "Lastabwurf", p_overpower_t: "Maximale Leistung erreicht: Heizung gedrosselt",
      p_fail: "Ausfall", p_heat_fail_t: "Heizungsausfall erkannt: Die Temperatur steigt nicht", p_cool_fail_t: "Kühlungsausfall erkannt",
      p_inh_bypass: "Aussetzung ignoriert", p_inh_bypass_t: "Bypass der Aussetzung aktiv", p_inh_bypass_tap: "Bypass der Aussetzung aktiv — tippen zum Deaktivieren",
      p_inh: "Ausgesetzt", p_inh_t: "Gerätesteuerung ausgesetzt", p_inh_tap: "Gerätesteuerung ausgesetzt — tippen, um die Aussetzung zu ignorieren",
      p_win_bypass: "Fenster ignoriert", p_win_bypass_tap: "Die Fensteröffnungserkennung wird ignoriert — tippen zum Wiederherstellen",
      p_win_open: "Fenster offen", p_win_open_tap: "Öffnung erkannt: Heizung reduziert oder aus — tippen zum Ignorieren",
      p_win_closed_tap: "Fenster geschlossen — tippen, um die Fensteröffnungserkennung zu ignorieren",
      p_ass_stop: "Auto-Stopp", p_ass_stopped_t: "Durch Auto-Start/Stopp gestoppt", p_ass_on_t: "Auto-Start/Stopp aktiv", p_ass_off_t: "Auto-Start/Stopp deaktiviert",
      p_tap_off: "{0} — tippen zum Deaktivieren", p_tap_on: "{0} — tippen zum Aktivieren",
      p_present_t: "Anwesenheit erkannt", p_away: "Abwesend", p_away_t: "Niemand zu Hause: Abwesenheits-Sollwert",
      p_motion: "Bewegung", p_motion_t: "Bewegung im Raum erkannt", p_no_motion_t: "Keine Bewegung",
      p_locked: "Gesperrt", p_locked_t: "Thermostat gesperrt",
      pw_heat: "Heizung {0} %", pw_ext: "Außen {0}°",
      w_timed: "Temporäre Voreinstellung aktiv", w_remaining: "{0}, noch {1}", w_inh_bypass: "Bypass der Aussetzung aktiviert", w_win_bypass: "Fensteröffnungserkennung ignoriert (Bypass)",
      w_heat_fail: "Heizungsausfall erkannt", w_heat_fail_sub: "Die Temperatur steigt trotz Heizen nicht", w_cool_fail: "Kühlungsausfall erkannt",
      w_locked: "Thermostat gesperrt", w_recalc: "Gesteuertes Gerät wird aktualisiert", w_none: "Keine Warnungen",
      lk_lock: "Sperren", lk_unlock: "Entsperren", lk_locked: "Bedienung gesperrt: Schloss antippen zum Entsperren", lk_vt: "Von Versatile Thermostat gesperrt: antippen zum Entsperren", lk_vt_open: "Entsperrt: antippen zum Sperren", lk_local_open: "Für einige Sekunden entsperrt: antippen zum Sperren", lk_code: "Sperrcode", lk_bad: "Code abgelehnt", lk_title: "Sperre",
      e_lock: "Bedienung sperren (Schutz vor versehentlichem Verstellen beim Scrollen)", e_lock_delay: "Dauer der Entsperrung",
      w_off_sub: "Der Thermostat ist ausgeschaltet.", w_ok_sub: "Der Thermostat folgt normal seinem Sollwert.",
      tp_left: "<b>{0}</b> noch {1}", tp_then: " · danach {0}", tp_cancel: "Abbrechen", tp_for: "Dauer",
      e_entity: "Klima-Entität", e_name: "Angezeigter Name", e_icon: "Symbol (Gerät aus)", e_show_fan: "Lüfter", e_show_preset: "Voreinstellung (Boost…)",
      e_show_swing: "Schwenken", e_layout: "Darstellung", e_min_temp: "Minimaler Sollwert", e_max_temp: "Maximaler Sollwert",
      e_temperature_sensor: "Temperatursensor (sonst der des Geräts)", e_graph_hours: "Standarddauer des Diagramms",
      e_badges: "Status-Badges (bis zu 4 Entitäten: Fenster, Anwesenheit, Luftfeuchte…)",
      e_vtherm: "Versatile-Thermostat-Funktionen (Fenster, Anwesenheit, Lastabwurf, Timer…)", e_vtherm_info: "Infos unter den Bedienelementen",
      e_vtherm_inhibition_bypass: "Schalter für den Bypass der Aussetzung (Inhibition-Plugin)", e_vtherm_auto_start_stop: "Auto-Start/Stopp-Schalter (automatisch, wenn leer)",
      e_layout_full: "Vollständig (mit Drehregler)", e_layout_compact: "Kompakt (breit, ohne Drehregler)",
      e_theme: "Design", e_theme_auto: "Automatisch (wie Home Assistant)", e_theme_dark: "Dunkel", e_theme_light: "Hell", e_hidden_presets: "Ausgeblendete Voreinstellungen",
      e_info_heat: "Heizrate (%)", e_info_power: "Mittlere Leistung (W)", e_info_ext: "Außentemperatur", e_info_bar: "Heizbalken",
      g_temp: "Temperatur", g_sensor: " · Sensor", g_loading: "Wird geladen…", g_error: "Verlauf nicht verfügbar: {0}", g_nodata: "Keine Temperaturdaten in diesem Zeitraum.",
      g_current: "Aktuell", g_min: "Min", g_max: "Max", g_avg: "Mittel", g_heat: "Heizen", g_cool: "Kühlen", g_setpoint: "Sollwert {0}°",
      g_hours: "{0} h", g_days: "{0} Tage", g_hour_axis: "{0}:00",
      card_desc: "Kompakte, je nach Betrieb animierte Klima-/Heizungskarte (aus, heizen, kühlen), auch zu zweit nebeneinander auf dem Handy gut lesbar.",
    },
    en: {
      room_temp: "Temperature",
      ass_mode_t: "Mode on automatic stop: {0}. Tap to change",
      ass_mode_title: "Mode when auto-start/stop stops",
      e_vtherm_auto_start_stop_mode: "Auto-start/stop \"stop mode\" select (automatic if empty)",
      e_main_value: "Big value in the centre of the dial",
      e_main_target: "Setpoint (reading below)",
      e_main_current: "Measured temperature (setpoint below)",
      setpoint_t: "Setpoint",
      e_language: "Language", e_lang_auto: "Automatic (profile)",
      dec: ".",
      mode_off: "Off", mode_heat: "Heat", mode_cool: "Cool", mode_heat_cool: "Auto", mode_auto: "Auto", mode_dry: "Dry", mode_fan_only: "Fan",
      act_heating: "Heating", act_cooling: "Cooling", act_drying: "Drying", act_fan: "Fan", act_idle: "Idle", act_off: "Off", act_preheating: "Preheating", act_defrosting: "Defrosting",
      fan_auto: "Auto", fan_quiet: "Quiet", fan_low: "Low", fan_medium: "Medium", fan_high: "High", fan_off: "Off",
      preset_none: "Normal", preset_boost: "Boost", preset_away: "Away", preset_eco: "Eco", preset_comfort: "Comfort", preset_sleep: "Sleep", preset_home: "Home",
      preset_activity: "Activity", preset_frost: "Frost protection", preset_power: "Load shedding", preset_safety: "Safety", preset_security: "Safety",
      swing_off: "Fixed", swing_stop: "Fixed", swing_on: "Swing", swing_swing: "Swing", swing_windnice: "Comfort", swing_vertical: "Vertical", swing_horizontal: "Horiz.", swing_both: "Both",
      rs_window: "window open", rs_ass: "auto-start/stop", rs_sleep: "sleep mode", rs_safety: "safety", rs_central: "central mode", rs_inhibition: "inhibited",
      rs_fan_ass: "fan only (auto-start/stop)", rs_dry_ass: "drying (auto-start/stop)",
      msg_safety_detected: "Safety mode: the temperature sensor stopped responding",
      msg_overpowering_detected: "Load shedding: maximum power reached",
      msg_hvac_off_manual: "Turned off manually",
      msg_hvac_off_auto_start_stop: "Turned off by auto-start/stop",
      msg_hvac_off_window_detection: "Turned off by open window detection",
      msg_hvac_off_sleep_mode: "Turned off by sleep mode",
      msg_hvac_off_safety_detection: "Turned off by safety mode",
      msg_hvac_off_central_mode: "Turned off by central mode",
      msg_hvac_off_inhibition: "Thermostat inhibited: device control suspended",
      msg_hvac_fan_only_auto_start_stop: "Fan only by auto-start/stop",
      msg_hvac_dry_auto_start_stop: "Drying by auto-start/stop",
      msg_target_temp_window_eco: "Setpoint lowered: window open (eco)",
      msg_target_temp_window_frost: "Setpoint lowered: window open (frost protection)",
      msg_target_temp_power: "Setpoint lowered: load shedding",
      msg_target_temp_central_mode: "Setpoint set by central mode",
      msg_target_temp_activity_detected: "Setpoint: activity detected",
      msg_target_temp_activity_not_detected: "Setpoint: no activity in the room",
      msg_target_temp_absence_detected: "Setpoint: absence detected",
      msg_target_temp_timed_preset: "Setpoint: timed preset running",
      msg_not_initialized: "Thermostat is initializing",
      msg_underlying_unavailable: "A controlled device is unavailable",
      err_entity: "Choose a climate entity in the editor.",
      history: "Temperature history", setpoint: "Setpoint", lower: "Lower", raise: "Raise", close: "Close", unavailable: "Entity unavailable",
      fan: "Fan", preset: "Preset", timed: "Timed preset", timer: "Timer", swing_v: "Vertical swing", swing_h: "Horizontal swing",
      why: "Why this state?",
      st_safety: "Safety · no sensor data", st_heat_fail: "Heating failure", st_cool_fail: "Cooling failure", st_inhibited: "Stopped · inhibited",
      st_overpower: "Load shedding active", st_win_off: "Stopped · window open", st_win: "Window open", st_stopped: "Stopped · {0}", st_timed: "{0} · {1} left",
      p_safety: "Safety", p_safety_t: "Temperature sensor not responding: safety heating",
      p_overpower: "Load shedding", p_overpower_t: "Maximum power reached: heating reduced",
      p_fail: "Failure", p_heat_fail_t: "Heating failure detected: the temperature is not rising", p_cool_fail_t: "Cooling failure detected",
      p_inh_bypass: "Inhibition bypassed", p_inh_bypass_t: "Inhibition bypass active", p_inh_bypass_tap: "Inhibition bypass active — tap to turn it off",
      p_inh: "Inhibited", p_inh_t: "Device control suspended", p_inh_tap: "Device control suspended — tap to bypass the inhibition",
      p_win_bypass: "Window ignored", p_win_bypass_tap: "Open window detection is ignored — tap to restore it",
      p_win_open: "Window open", p_win_open_tap: "Opening detected: heating reduced or off — tap to ignore it",
      p_win_closed_tap: "Windows closed — tap to ignore open window detection",
      p_ass_stop: "Auto stop", p_ass_stopped_t: "Stopped by auto-start/stop", p_ass_on_t: "Auto-start/stop on", p_ass_off_t: "Auto-start/stop off",
      p_tap_off: "{0} — tap to turn it off", p_tap_on: "{0} — tap to turn it on",
      p_present_t: "Presence detected", p_away: "Away", p_away_t: "Nobody home: away setpoint applied",
      p_motion: "Motion", p_motion_t: "Motion detected in the room", p_no_motion_t: "No motion",
      p_locked: "Locked", p_locked_t: "Thermostat locked",
      pw_heat: "Heating {0} %", pw_ext: "Outside {0}°",
      w_timed: "Timed preset running", w_remaining: "{0}, {1} left", w_inh_bypass: "Inhibition bypass on", w_win_bypass: "Open window detection ignored (bypass)",
      w_heat_fail: "Heating failure detected", w_heat_fail_sub: "The temperature is not rising despite heating", w_cool_fail: "Cooling failure detected",
      w_locked: "Thermostat locked", w_recalc: "Controlled device is updating", w_none: "No alerts",
      lk_lock: "Lock", lk_unlock: "Unlock", lk_locked: "Controls locked: tap the padlock to unlock", lk_vt: "Locked by Versatile Thermostat: tap to unlock", lk_vt_open: "Unlocked: tap to lock", lk_local_open: "Unlocked for a few seconds: tap to lock", lk_code: "Lock code", lk_bad: "Code rejected", lk_title: "Lock",
      e_lock: "Lock the controls (prevents accidental changes while scrolling)", e_lock_delay: "Unlock duration",
      w_off_sub: "The thermostat is off.", w_ok_sub: "The thermostat is following its setpoint normally.",
      tp_left: "<b>{0}</b> {1} left", tp_then: " · then {0}", tp_cancel: "Cancel", tp_for: "Duration",
      e_entity: "Climate entity", e_name: "Display name", e_icon: "Icon (device off)", e_show_fan: "Fan", e_show_preset: "Preset (boost…)",
      e_show_swing: "Swing", e_layout: "Layout", e_min_temp: "Minimum setpoint", e_max_temp: "Maximum setpoint",
      e_temperature_sensor: "Temperature sensor (otherwise the device's own)", e_graph_hours: "Default graph duration",
      e_badges: "Status badges (up to 4 entities: window, presence, humidity…)",
      e_vtherm: "Versatile Thermostat features (window, presence, load shedding, timer…)", e_vtherm_info: "Information below the controls",
      e_vtherm_inhibition_bypass: "Inhibition bypass switch (inhibition plugin)", e_vtherm_auto_start_stop: "Auto-start/stop switch (automatic if empty)",
      e_layout_full: "Full (with dial)", e_layout_compact: "Compact (wide, without dial)",
      e_theme: "Theme", e_theme_auto: "Automatic (follows Home Assistant)", e_theme_dark: "Dark", e_theme_light: "Light", e_hidden_presets: "Hidden presets",
      e_info_heat: "Heating rate (%)", e_info_power: "Average power (W)", e_info_ext: "Outdoor temperature", e_info_bar: "Heating bar",
      g_temp: "Temperature", g_sensor: " · sensor", g_loading: "Loading…", g_error: "History unavailable: {0}", g_nodata: "No temperature data for this period.",
      g_current: "Current", g_min: "Min", g_max: "Max", g_avg: "Average", g_heat: "Heating", g_cool: "Cooling", g_setpoint: "setpoint {0}°",
      g_hours: "{0} h", g_days: "{0} d", g_hour_axis: "{0}:00",
      card_desc: "Compact climate/heating card that animates with what the device is doing (off, heating, cooling), readable two side by side on mobile.",
    },
    es: {
      room_temp: "Temperatura",
      ass_mode_t: "Modo en la parada automática: {0}. Tocar para cambiar",
      ass_mode_title: "Modo cuando el auto-start/stop para",
      e_vtherm_auto_start_stop_mode: "Lista «modo en la parada» del auto-start/stop (automático si está vacío)",
      e_main_value: "Valor grande en el centro de la rueda",
      e_main_target: "Consigna (medida debajo)",
      e_main_current: "Temperatura medida (consigna debajo)",
      setpoint_t: "Consigna",
      dec: ",",
      mode_off: "Apagado",
      mode_heat: "Calor",
      mode_cool: "Frío",
      mode_heat_cool: "Auto",
      mode_auto: "Auto",
      mode_dry: "Deshum.",
      mode_fan_only: "Ventil.",
      act_heating: "Calentando",
      act_cooling: "Enfriando",
      act_drying: "Deshumidificando",
      act_fan: "Ventilando",
      act_idle: "En espera",
      act_off: "Apagado",
      act_preheating: "Precalentando",
      act_defrosting: "Descongelando",
      fan_auto: "Auto",
      fan_quiet: "Silencio",
      fan_low: "Baja",
      fan_medium: "Media",
      fan_high: "Alta",
      fan_off: "Parada",
      preset_none: "Normal",
      preset_boost: "Boost",
      preset_away: "Ausente",
      preset_eco: "Eco",
      preset_comfort: "Confort",
      preset_sleep: "Noche",
      preset_home: "Casa",
      preset_activity: "Actividad",
      preset_frost: "Antiheladas",
      preset_power: "Deslastre",
      preset_safety: "Seguridad",
      preset_security: "Seguridad",
      swing_off: "Fijo",
      swing_stop: "Fijo",
      swing_on: "Oscila",
      swing_swing: "Oscila",
      swing_windnice: "Confort",
      swing_vertical: "Vertical",
      swing_horizontal: "Horiz.",
      swing_both: "Ambos",
      rs_window: "ventana abierta",
      rs_ass: "auto-start/stop",
      rs_sleep: "modo reposo",
      rs_safety: "seguridad",
      rs_central: "modo central",
      rs_inhibition: "inhibido",
      rs_fan_ass: "ventilación (auto-start/stop)",
      rs_dry_ass: "deshumidificación (auto-start/stop)",
      msg_safety_detected: "Modo seguridad: la sonda de temperatura ya no responde",
      msg_overpowering_detected: "Deslastre: potencia máxima alcanzada",
      msg_hvac_off_manual: "Apagado manualmente",
      msg_hvac_off_auto_start_stop: "Apagado por el auto-start/stop",
      msg_hvac_off_window_detection: "Apagado por la detección de apertura",
      msg_hvac_off_sleep_mode: "Apagado por el modo reposo",
      msg_hvac_off_safety_detection: "Apagado por el modo seguridad",
      msg_hvac_off_central_mode: "Apagado por el modo central",
      msg_hvac_off_inhibition: "Termostato inhibido: control de los aparatos suspendido",
      msg_hvac_fan_only_auto_start_stop: "Solo ventilación por el auto-start/stop",
      msg_hvac_dry_auto_start_stop: "Deshumidificación por el auto-start/stop",
      msg_target_temp_window_eco: "Consigna reducida: ventana abierta (eco)",
      msg_target_temp_window_frost: "Consigna reducida: ventana abierta (antiheladas)",
      msg_target_temp_power: "Consigna reducida: deslastre",
      msg_target_temp_central_mode: "Consigna impuesta por el modo central",
      msg_target_temp_activity_detected: "Consigna: actividad detectada",
      msg_target_temp_activity_not_detected: "Consigna: sin actividad en la estancia",
      msg_target_temp_absence_detected: "Consigna: ausencia detectada",
      msg_target_temp_timed_preset: "Consigna: preajuste temporal en curso",
      msg_not_initialized: "El termostato se está inicializando",
      msg_underlying_unavailable: "Un aparato controlado no está disponible",
      err_entity: "Elige una entidad climate en el editor.",
      history: "Historial de temperatura",
      setpoint: "Consigna",
      lower: "Bajar",
      close: "Cerrar",
      unavailable: "Entidad no disponible",
      fan: "Ventilación",
      preset: "Preajuste",
      timed: "Preajuste temporal",
      timer: "Temporizador",
      swing_v: "Oscilación vertical",
      swing_h: "Oscilación horizontal",
      why: "¿Por qué este estado?",
      st_safety: "Seguridad · sonda muda",
      st_heat_fail: "Fallo de calefacción",
      st_cool_fail: "Fallo de refrigeración",
      st_inhibited: "Parado · inhibido",
      st_overpower: "Deslastre en curso",
      st_win_off: "Parado · ventana abierta",
      st_win: "Ventana abierta",
      st_stopped: "Parado · {0}",
      st_timed: "{0} · quedan {1}",
      p_safety: "Seguridad",
      p_safety_t: "Sonda de temperatura muda: calefacción de seguridad",
      p_overpower: "Deslastre",
      p_overpower_t: "Potencia máxima alcanzada: calefacción reducida",
      p_fail: "Fallo",
      p_heat_fail_t: "Fallo de calefacción detectado: la temperatura no sube",
      p_cool_fail_t: "Fallo de refrigeración detectado",
      p_inh_bypass: "Inhibición ignorada",
      p_inh_bypass_t: "Bypass de la inhibición activo",
      p_inh_bypass_tap: "Bypass de la inhibición activo — toca para desactivarlo",
      p_inh: "Inhibido",
      p_inh_t: "Control de los aparatos suspendido",
      p_inh_tap: "Control de los aparatos suspendido — toca para ignorar la inhibición",
      p_win_bypass: "Ventana ignorada",
      p_win_bypass_tap: "Se ignora la detección de apertura — toca para restablecerla",
      p_win_open: "Ventana abierta",
      p_win_open_tap: "Apertura detectada: calefacción reducida o apagada — toca para ignorarla",
      p_win_closed_tap: "Ventanas cerradas — toca para ignorar la detección de apertura",
      p_ass_stop: "Parada auto",
      p_ass_stopped_t: "Parado por el auto-start/stop",
      p_ass_on_t: "Auto-start/stop activo",
      p_ass_off_t: "Auto-start/stop desactivado",
      p_tap_off: "{0} — toca para desactivarlo",
      p_tap_on: "{0} — toca para activarlo",
      p_present_t: "Presencia detectada",
      p_away: "Ausente",
      p_away_t: "Nadie en casa: consigna de ausencia",
      p_motion: "Movimiento",
      p_motion_t: "Movimiento detectado en la estancia",
      p_no_motion_t: "Sin movimiento",
      p_locked: "Bloqueado",
      p_locked_t: "Termostato bloqueado",
      pw_heat: "Calor {0} %",
      pw_ext: "Ext. {0}°",
      w_timed: "Preajuste temporal en curso",
      w_remaining: "{0}, quedan {1}",
      w_inh_bypass: "Bypass de la inhibición activado",
      w_win_bypass: "Detección de apertura ignorada (bypass)",
      w_heat_fail: "Fallo de calefacción detectado",
      w_heat_fail_sub: "La temperatura no sube pese a la calefacción",
      w_cool_fail: "Fallo de refrigeración detectado",
      w_locked: "Termostato bloqueado",
      w_recalc: "Aparato controlado actualizándose",
      w_none: "Sin alertas",
      lk_lock: "Bloquear",
      lk_unlock: "Desbloquear",
      lk_locked: "Controles bloqueados: toca el candado para desbloquear",
      lk_vt: "Bloqueado por Versatile Thermostat: toca para desbloquear",
      lk_vt_open: "Desbloqueado: toca para bloquear",
      lk_local_open: "Desbloqueado unos segundos: toca para bloquear",
      lk_code: "Código de bloqueo",
      lk_bad: "Código rechazado",
      lk_title: "Bloqueo",
      e_lock: "Bloquear los controles (evita errores al desplazarse)",
      e_lock_delay: "Duración del desbloqueo",
      w_off_sub: "El termostato está apagado.",
      w_ok_sub: "El termostato sigue su consigna con normalidad.",
      tp_left: "<b>{0}</b> quedan {1}",
      tp_then: " · luego {0}",
      tp_cancel: "Cancelar",
      tp_for: "Durante",
      e_entity: "Entidad climate",
      e_name: "Nombre mostrado",
      e_icon: "Icono (aparato apagado)",
      e_show_fan: "Ventilación",
      e_show_preset: "Preajuste (boost…)",
      e_show_swing: "Oscilación",
      e_layout: "Presentación",
      e_min_temp: "Consigna mínima",
      e_max_temp: "Consigna máxima",
      e_temperature_sensor: "Sonda de temperatura (si no, la del aparato)",
      e_graph_hours: "Duración del gráfico por defecto",
      e_badges: "Indicadores de estado (hasta 4 entidades: ventana, presencia, humedad…)",
      e_vtherm: "Funciones de Versatile Thermostat (ventana, presencia, deslastre, temporizador…)",
      e_vtherm_info: "Información bajo los controles",
      e_vtherm_inhibition_bypass: "Interruptor de bypass de la inhibición (plugin de inhibición)",
      e_vtherm_auto_start_stop: "Interruptor auto-start/stop (automático si está vacío)",
      e_layout_full: "Completa (con la rueda)",
      e_layout_compact: "Compacta (a lo ancho, sin la rueda)",
      e_theme: "Tema", e_theme_auto: "Automático (como Home Assistant)", e_theme_dark: "Oscuro", e_theme_light: "Claro", e_hidden_presets: "Preajustes ocultos",
      e_info_heat: "Tasa de calefacción (%)",
      e_info_power: "Potencia media (W)",
      e_info_ext: "Temperatura exterior",
      e_info_bar: "Barra de calefacción",
      g_temp: "Temperatura",
      g_sensor: " · sonda",
      g_loading: "Cargando…",
      g_error: "Historial no disponible: {0}",
      g_nodata: "Sin datos de temperatura en este período.",
      g_current: "Actual",
      g_min: "Mín",
      g_max: "Máx",
      g_avg: "Media",
      g_heat: "Calor",
      g_cool: "Frío",
      g_setpoint: "consigna {0}°",
      g_hours: "{0} h",
      g_days: "{0} d",
      g_hour_axis: "{0}h",
      card_desc: "Tarjeta de clima/calefacción compacta y animada según el uso (apagado, calor, frío), legible de dos en dos en el móvil.",
      raise: "Subir",
      e_language: "Idioma",
      e_lang_auto: "Automático (perfil)",
    },
    it: {
      room_temp: "Temperatura",
      ass_mode_t: "Modalità all'arresto automatico: {0}. Tocca per cambiare",
      ass_mode_title: "Modalità quando l'auto-start/stop si ferma",
      e_vtherm_auto_start_stop_mode: "Elenco «modalità all'arresto» dell'auto-start/stop (automatico se vuoto)",
      e_main_value: "Valore grande al centro della ghiera",
      e_main_target: "Setpoint (misura sotto)",
      e_main_current: "Temperatura misurata (setpoint sotto)",
      setpoint_t: "Setpoint",
      dec: ",",
      mode_off: "Spento",
      mode_heat: "Caldo",
      mode_cool: "Freddo",
      mode_heat_cool: "Auto",
      mode_auto: "Auto",
      mode_dry: "Deumid.",
      mode_fan_only: "Ventil.",
      act_heating: "Riscalda",
      act_cooling: "Raffredda",
      act_drying: "Deumidifica",
      act_fan: "Ventila",
      act_idle: "In attesa",
      act_off: "Spento",
      act_preheating: "Preriscalda",
      act_defrosting: "Sbrinamento",
      fan_auto: "Auto",
      fan_quiet: "Silenzioso",
      fan_low: "Bassa",
      fan_medium: "Media",
      fan_high: "Alta",
      fan_off: "Ferma",
      preset_none: "Normale",
      preset_boost: "Boost",
      preset_away: "Assente",
      preset_eco: "Eco",
      preset_comfort: "Comfort",
      preset_sleep: "Notte",
      preset_home: "Casa",
      preset_activity: "Attività",
      preset_frost: "Antigelo",
      preset_power: "Distacco carichi",
      preset_safety: "Sicurezza",
      preset_security: "Sicurezza",
      swing_off: "Fisso",
      swing_stop: "Fisso",
      swing_on: "Oscilla",
      swing_swing: "Oscilla",
      swing_windnice: "Comfort",
      swing_vertical: "Verticale",
      swing_horizontal: "Orizz.",
      swing_both: "Entrambi",
      rs_window: "finestra aperta",
      rs_ass: "auto-start/stop",
      rs_sleep: "modalità notte",
      rs_safety: "sicurezza",
      rs_central: "modalità centrale",
      rs_inhibition: "inibito",
      rs_fan_ass: "ventilazione (auto-start/stop)",
      rs_dry_ass: "deumidificazione (auto-start/stop)",
      msg_safety_detected: "Modalità sicurezza: la sonda di temperatura non risponde più",
      msg_overpowering_detected: "Distacco carichi: potenza massima raggiunta",
      msg_hvac_off_manual: "Spento manualmente",
      msg_hvac_off_auto_start_stop: "Spento dall'auto-start/stop",
      msg_hvac_off_window_detection: "Spento dal rilevamento apertura",
      msg_hvac_off_sleep_mode: "Spento dalla modalità notte",
      msg_hvac_off_safety_detection: "Spento dalla modalità sicurezza",
      msg_hvac_off_central_mode: "Spento dalla modalità centrale",
      msg_hvac_off_inhibition: "Termostato inibito: comando dei dispositivi sospeso",
      msg_hvac_fan_only_auto_start_stop: "Solo ventilazione dall'auto-start/stop",
      msg_hvac_dry_auto_start_stop: "Deumidificazione dall'auto-start/stop",
      msg_target_temp_window_eco: "Setpoint ridotto: finestra aperta (eco)",
      msg_target_temp_window_frost: "Setpoint ridotto: finestra aperta (antigelo)",
      msg_target_temp_power: "Setpoint ridotto: distacco carichi",
      msg_target_temp_central_mode: "Setpoint imposto dalla modalità centrale",
      msg_target_temp_activity_detected: "Setpoint: attività rilevata",
      msg_target_temp_activity_not_detected: "Setpoint: nessuna attività nella stanza",
      msg_target_temp_absence_detected: "Setpoint: assenza rilevata",
      msg_target_temp_timed_preset: "Setpoint: preset temporaneo in corso",
      msg_not_initialized: "Termostato in fase di inizializzazione",
      msg_underlying_unavailable: "Un dispositivo comandato non è disponibile",
      err_entity: "Scegli un'entità climate nell'editor.",
      history: "Storico della temperatura",
      setpoint: "Setpoint",
      lower: "Abbassa",
      close: "Chiudi",
      unavailable: "Entità non disponibile",
      fan: "Ventilazione",
      preset: "Preset",
      timed: "Preset temporaneo",
      timer: "Timer",
      swing_v: "Oscillazione verticale",
      swing_h: "Oscillazione orizzontale",
      why: "Perché questo stato?",
      st_safety: "Sicurezza · sonda muta",
      st_heat_fail: "Guasto riscaldamento",
      st_cool_fail: "Guasto raffreddamento",
      st_inhibited: "Fermo · inibito",
      st_overpower: "Distacco carichi in corso",
      st_win_off: "Fermo · finestra aperta",
      st_win: "Finestra aperta",
      st_stopped: "Fermo · {0}",
      st_timed: "{0} · ancora {1}",
      p_safety: "Sicurezza",
      p_safety_t: "Sonda di temperatura muta: riscaldamento di sicurezza",
      p_overpower: "Distacco carichi",
      p_overpower_t: "Potenza massima raggiunta: riscaldamento ridotto",
      p_fail: "Guasto",
      p_heat_fail_t: "Guasto del riscaldamento rilevato: la temperatura non sale",
      p_cool_fail_t: "Guasto del raffreddamento rilevato",
      p_inh_bypass: "Inibizione ignorata",
      p_inh_bypass_t: "Bypass dell'inibizione attivo",
      p_inh_bypass_tap: "Bypass dell'inibizione attivo — tocca per disattivarlo",
      p_inh: "Inibito",
      p_inh_t: "Comando dei dispositivi sospeso",
      p_inh_tap: "Comando dei dispositivi sospeso — tocca per ignorare l'inibizione",
      p_win_bypass: "Finestra ignorata",
      p_win_bypass_tap: "Il rilevamento apertura è ignorato — tocca per ripristinarlo",
      p_win_open: "Finestra aperta",
      p_win_open_tap: "Apertura rilevata: riscaldamento ridotto o spento — tocca per ignorarla",
      p_win_closed_tap: "Finestre chiuse — tocca per ignorare il rilevamento apertura",
      p_ass_stop: "Arresto auto",
      p_ass_stopped_t: "Fermato dall'auto-start/stop",
      p_ass_on_t: "Auto-start/stop attivo",
      p_ass_off_t: "Auto-start/stop disattivato",
      p_tap_off: "{0} — tocca per disattivarlo",
      p_tap_on: "{0} — tocca per attivarlo",
      p_present_t: "Presenza rilevata",
      p_away: "Assente",
      p_away_t: "Nessuno in casa: setpoint di assenza",
      p_motion: "Movimento",
      p_motion_t: "Movimento rilevato nella stanza",
      p_no_motion_t: "Nessun movimento",
      p_locked: "Bloccato",
      p_locked_t: "Termostato bloccato",
      pw_heat: "Caldo {0} %",
      pw_ext: "Est. {0}°",
      w_timed: "Preset temporaneo in corso",
      w_remaining: "{0}, ancora {1}",
      w_inh_bypass: "Bypass dell'inibizione attivato",
      w_win_bypass: "Rilevamento apertura ignorato (bypass)",
      w_heat_fail: "Guasto del riscaldamento rilevato",
      w_heat_fail_sub: "La temperatura non sale nonostante il riscaldamento",
      w_cool_fail: "Guasto del raffreddamento rilevato",
      w_locked: "Termostato bloccato",
      w_recalc: "Dispositivo comandato in aggiornamento",
      w_none: "Nessun avviso",
      lk_lock: "Blocca",
      lk_unlock: "Sblocca",
      lk_locked: "Comandi bloccati: tocca il lucchetto per sbloccare",
      lk_vt: "Bloccato da Versatile Thermostat: tocca per sbloccare",
      lk_vt_open: "Sbloccato: tocca per bloccare",
      lk_local_open: "Sbloccato per qualche secondo: tocca per bloccare",
      lk_code: "Codice di blocco",
      lk_bad: "Codice rifiutato",
      lk_title: "Blocco",
      e_lock: "Blocca i comandi (evita errori scorrendo)",
      e_lock_delay: "Durata dello sblocco",
      w_off_sub: "Il termostato è spento.",
      w_ok_sub: "Il termostato segue normalmente il setpoint.",
      tp_left: "<b>{0}</b> ancora {1}",
      tp_then: " · poi {0}",
      tp_cancel: "Annulla",
      tp_for: "Per",
      e_entity: "Entità climate",
      e_name: "Nome visualizzato",
      e_icon: "Icona (dispositivo spento)",
      e_show_fan: "Ventilazione",
      e_show_preset: "Preset (boost…)",
      e_show_swing: "Oscillazione",
      e_layout: "Presentazione",
      e_min_temp: "Setpoint minimo",
      e_max_temp: "Setpoint massimo",
      e_temperature_sensor: "Sonda di temperatura (altrimenti quella del dispositivo)",
      e_graph_hours: "Durata predefinita del grafico",
      e_badges: "Indicatori di stato (fino a 4 entità: finestra, presenza, umidità…)",
      e_vtherm: "Funzioni Versatile Thermostat (finestra, presenza, distacco carichi, timer…)",
      e_vtherm_info: "Informazioni sotto i comandi",
      e_vtherm_inhibition_bypass: "Interruttore di bypass dell'inibizione (plugin di inibizione)",
      e_vtherm_auto_start_stop: "Interruttore auto-start/stop (automatico se vuoto)",
      e_layout_full: "Completa (con la ghiera)",
      e_layout_compact: "Compatta (in larghezza, senza ghiera)",
      e_theme: "Tema", e_theme_auto: "Automatico (come Home Assistant)", e_theme_dark: "Scuro", e_theme_light: "Chiaro", e_hidden_presets: "Preset nascosti",
      e_info_heat: "Tasso di riscaldamento (%)",
      e_info_power: "Potenza media (W)",
      e_info_ext: "Temperatura esterna",
      e_info_bar: "Barra di riscaldamento",
      g_temp: "Temperatura",
      g_sensor: " · sonda",
      g_loading: "Caricamento…",
      g_error: "Storico non disponibile: {0}",
      g_nodata: "Nessun dato di temperatura in questo periodo.",
      g_current: "Attuale",
      g_min: "Min",
      g_max: "Max",
      g_avg: "Media",
      g_heat: "Caldo",
      g_cool: "Freddo",
      g_setpoint: "setpoint {0}°",
      g_hours: "{0} h",
      g_days: "{0} g",
      g_hour_axis: "{0}:00",
      card_desc: "Scheda clima/riscaldamento compatta e animata in base all'uso (spento, caldo, freddo), leggibile due affiancate su mobile.",
      raise: "Alza",
      e_language: "Lingua",
      e_lang_auto: "Automatica (profilo)",
    },
    nl: {
      room_temp: "Temperatuur",
      ass_mode_t: "Modus bij automatische stop: {0}. Tik om te wijzigen",
      ass_mode_title: "Modus wanneer auto-start/stop stopt",
      e_vtherm_auto_start_stop_mode: "Keuzelijst „stopmodus” van auto-start/stop (automatisch indien leeg)",
      e_main_value: "Grote waarde in het midden van de draaiknop",
      e_main_target: "Instelwaarde (meting eronder)",
      e_main_current: "Gemeten temperatuur (instelwaarde eronder)",
      setpoint_t: "Instelwaarde",
      dec: ",",
      mode_off: "Uit",
      mode_heat: "Warmte",
      mode_cool: "Koelen",
      mode_heat_cool: "Auto",
      mode_auto: "Auto",
      mode_dry: "Drogen",
      mode_fan_only: "Ventil.",
      act_heating: "Verwarmt",
      act_cooling: "Koelt",
      act_drying: "Droogt",
      act_fan: "Ventileert",
      act_idle: "Inactief",
      act_off: "Uit",
      act_preheating: "Voorverwarmen",
      act_defrosting: "Ontdooien",
      fan_auto: "Auto",
      fan_quiet: "Stil",
      fan_low: "Laag",
      fan_medium: "Middel",
      fan_high: "Hoog",
      fan_off: "Uit",
      preset_none: "Normaal",
      preset_boost: "Boost",
      preset_away: "Afwezig",
      preset_eco: "Eco",
      preset_comfort: "Comfort",
      preset_sleep: "Nacht",
      preset_home: "Thuis",
      preset_activity: "Activiteit",
      preset_frost: "Vorstbeveiliging",
      preset_power: "Lastafschakeling",
      preset_safety: "Veiligheid",
      preset_security: "Veiligheid",
      swing_off: "Vast",
      swing_stop: "Vast",
      swing_on: "Zwenkt",
      swing_swing: "Zwenkt",
      swing_windnice: "Comfort",
      swing_vertical: "Verticaal",
      swing_horizontal: "Horiz.",
      swing_both: "Beide",
      rs_window: "raam open",
      rs_ass: "auto-start/stop",
      rs_sleep: "slaapstand",
      rs_safety: "veiligheid",
      rs_central: "centrale modus",
      rs_inhibition: "geblokkeerd",
      rs_fan_ass: "ventilatie (auto-start/stop)",
      rs_dry_ass: "drogen (auto-start/stop)",
      msg_safety_detected: "Veiligheidsmodus: de temperatuursensor reageert niet meer",
      msg_overpowering_detected: "Lastafschakeling: maximaal vermogen bereikt",
      msg_hvac_off_manual: "Handmatig uitgeschakeld",
      msg_hvac_off_auto_start_stop: "Uitgeschakeld door auto-start/stop",
      msg_hvac_off_window_detection: "Uitgeschakeld door raamdetectie",
      msg_hvac_off_sleep_mode: "Uitgeschakeld door slaapstand",
      msg_hvac_off_safety_detection: "Uitgeschakeld door veiligheidsmodus",
      msg_hvac_off_central_mode: "Uitgeschakeld door centrale modus",
      msg_hvac_off_inhibition: "Thermostaat geblokkeerd: aansturing van apparaten opgeschort",
      msg_hvac_fan_only_auto_start_stop: "Alleen ventilatie door auto-start/stop",
      msg_hvac_dry_auto_start_stop: "Drogen door auto-start/stop",
      msg_target_temp_window_eco: "Setpoint verlaagd: raam open (eco)",
      msg_target_temp_window_frost: "Setpoint verlaagd: raam open (vorstbeveiliging)",
      msg_target_temp_power: "Setpoint verlaagd: lastafschakeling",
      msg_target_temp_central_mode: "Setpoint opgelegd door centrale modus",
      msg_target_temp_activity_detected: "Setpoint: activiteit gedetecteerd",
      msg_target_temp_activity_not_detected: "Setpoint: geen activiteit in de kamer",
      msg_target_temp_absence_detected: "Setpoint: afwezigheid gedetecteerd",
      msg_target_temp_timed_preset: "Setpoint: tijdelijke voorinstelling actief",
      msg_not_initialized: "Thermostaat wordt geïnitialiseerd",
      msg_underlying_unavailable: "Een aangestuurd apparaat is niet beschikbaar",
      err_entity: "Kies een climate-entiteit in de editor.",
      history: "Temperatuurgeschiedenis",
      setpoint: "Setpoint",
      lower: "Lager",
      close: "Sluiten",
      unavailable: "Entiteit niet beschikbaar",
      fan: "Ventilatie",
      preset: "Voorinstelling",
      timed: "Tijdelijke voorinstelling",
      timer: "Timer",
      swing_v: "Verticaal zwenken",
      swing_h: "Horizontaal zwenken",
      why: "Waarom deze status?",
      st_safety: "Veiligheid · sensor stil",
      st_heat_fail: "Verwarmingsstoring",
      st_cool_fail: "Koelstoring",
      st_inhibited: "Gestopt · geblokkeerd",
      st_overpower: "Lastafschakeling actief",
      st_win_off: "Gestopt · raam open",
      st_win: "Raam open",
      st_stopped: "Gestopt · {0}",
      st_timed: "{0} · nog {1}",
      p_safety: "Veiligheid",
      p_safety_t: "Temperatuursensor stil: veiligheidsverwarming",
      p_overpower: "Lastafschakeling",
      p_overpower_t: "Maximaal vermogen bereikt: verwarming verminderd",
      p_fail: "Storing",
      p_heat_fail_t: "Verwarmingsstoring gedetecteerd: de temperatuur stijgt niet",
      p_cool_fail_t: "Koelstoring gedetecteerd",
      p_inh_bypass: "Blokkering genegeerd",
      p_inh_bypass_t: "Bypass van de blokkering actief",
      p_inh_bypass_tap: "Bypass van de blokkering actief — tik om uit te schakelen",
      p_inh: "Geblokkeerd",
      p_inh_t: "Aansturing van apparaten opgeschort",
      p_inh_tap: "Aansturing van apparaten opgeschort — tik om de blokkering te negeren",
      p_win_bypass: "Raam genegeerd",
      p_win_bypass_tap: "Raamdetectie wordt genegeerd — tik om te herstellen",
      p_win_open: "Raam open",
      p_win_open_tap: "Opening gedetecteerd: verwarming verlaagd of uit — tik om te negeren",
      p_win_closed_tap: "Ramen dicht — tik om raamdetectie te negeren",
      p_ass_stop: "Auto-stop",
      p_ass_stopped_t: "Gestopt door auto-start/stop",
      p_ass_on_t: "Auto-start/stop aan",
      p_ass_off_t: "Auto-start/stop uit",
      p_tap_off: "{0} — tik om uit te schakelen",
      p_tap_on: "{0} — tik om in te schakelen",
      p_present_t: "Aanwezigheid gedetecteerd",
      p_away: "Afwezig",
      p_away_t: "Niemand thuis: afwezigheidssetpoint",
      p_motion: "Beweging",
      p_motion_t: "Beweging gedetecteerd in de kamer",
      p_no_motion_t: "Geen beweging",
      p_locked: "Vergrendeld",
      p_locked_t: "Thermostaat vergrendeld",
      pw_heat: "Warmte {0} %",
      pw_ext: "Buiten {0}°",
      w_timed: "Tijdelijke voorinstelling actief",
      w_remaining: "{0}, nog {1}",
      w_inh_bypass: "Bypass van de blokkering ingeschakeld",
      w_win_bypass: "Raamdetectie genegeerd (bypass)",
      w_heat_fail: "Verwarmingsstoring gedetecteerd",
      w_heat_fail_sub: "De temperatuur stijgt niet ondanks verwarming",
      w_cool_fail: "Koelstoring gedetecteerd",
      w_locked: "Thermostaat vergrendeld",
      w_recalc: "Aangestuurd apparaat wordt bijgewerkt",
      w_none: "Geen meldingen",
      lk_lock: "Vergrendelen",
      lk_unlock: "Ontgrendelen",
      lk_locked: "Bediening vergrendeld: tik op het slotje om te ontgrendelen",
      lk_vt: "Vergrendeld door Versatile Thermostat: tik om te ontgrendelen",
      lk_vt_open: "Ontgrendeld: tik om te vergrendelen",
      lk_local_open: "Enkele seconden ontgrendeld: tik om te vergrendelen",
      lk_code: "Vergrendelcode",
      lk_bad: "Code geweigerd",
      lk_title: "Vergrendeling",
      e_lock: "Bediening vergrendelen (voorkomt vergissingen bij scrollen)",
      e_lock_delay: "Duur van ontgrendeling",
      w_off_sub: "De thermostaat staat uit.",
      w_ok_sub: "De thermostaat volgt normaal zijn setpoint.",
      tp_left: "<b>{0}</b> nog {1}",
      tp_then: " · daarna {0}",
      tp_cancel: "Annuleren",
      tp_for: "Gedurende",
      e_entity: "Climate-entiteit",
      e_name: "Weergavenaam",
      e_icon: "Pictogram (apparaat uit)",
      e_show_fan: "Ventilatie",
      e_show_preset: "Voorinstelling (boost…)",
      e_show_swing: "Zwenken",
      e_layout: "Weergave",
      e_min_temp: "Minimaal setpoint",
      e_max_temp: "Maximaal setpoint",
      e_temperature_sensor: "Temperatuursensor (anders die van het apparaat)",
      e_graph_hours: "Standaardduur van de grafiek",
      e_badges: "Statusbadges (tot 4 entiteiten: raam, aanwezigheid, vochtigheid…)",
      e_vtherm: "Versatile Thermostat-functies (raam, aanwezigheid, lastafschakeling, timer…)",
      e_vtherm_info: "Informatie onder de bediening",
      e_vtherm_inhibition_bypass: "Schakelaar voor bypass van de blokkering (blokkeringsplug-in)",
      e_vtherm_auto_start_stop: "Auto-start/stop-schakelaar (automatisch indien leeg)",
      e_layout_full: "Volledig (met draaiknop)",
      e_layout_compact: "Compact (breed, zonder draaiknop)",
      e_theme: "Thema", e_theme_auto: "Automatisch (zoals Home Assistant)", e_theme_dark: "Donker", e_theme_light: "Licht", e_hidden_presets: "Verborgen voorinstellingen",
      e_info_heat: "Verwarmingsgraad (%)",
      e_info_power: "Gemiddeld vermogen (W)",
      e_info_ext: "Buitentemperatuur",
      e_info_bar: "Verwarmingsbalk",
      g_temp: "Temperatuur",
      g_sensor: " · sensor",
      g_loading: "Laden…",
      g_error: "Geschiedenis niet beschikbaar: {0}",
      g_nodata: "Geen temperatuurgegevens voor deze periode.",
      g_current: "Huidig",
      g_min: "Min",
      g_max: "Max",
      g_avg: "Gemiddeld",
      g_heat: "Warmte",
      g_cool: "Koelen",
      g_setpoint: "setpoint {0}°",
      g_hours: "{0} u",
      g_days: "{0} d",
      g_hour_axis: "{0}:00",
      card_desc: "Compacte, geanimeerde klimaat-/verwarmingskaart die meebeweegt met het apparaat (uit, verwarmen, koelen), twee naast elkaar leesbaar op mobiel.",
      raise: "Hoger",
      e_language: "Taal",
      e_lang_auto: "Automatisch (profiel)",
    },
    pt: {
      room_temp: "Temperatura",
      ass_mode_t: "Modo na paragem automática: {0}. Tocar para mudar",
      ass_mode_title: "Modo quando o auto-start/stop para",
      e_vtherm_auto_start_stop_mode: "Lista «modo na paragem» do auto-start/stop (automático se vazio)",
      e_main_value: "Valor grande no centro da roda",
      e_main_target: "Temperatura definida (medida por baixo)",
      e_main_current: "Temperatura medida (definida por baixo)",
      setpoint_t: "Temperatura definida",
      dec: ",",
      mode_off: "Desligado",
      mode_heat: "Calor",
      mode_cool: "Frio",
      mode_heat_cool: "Auto",
      mode_auto: "Auto",
      mode_dry: "Desum.",
      mode_fan_only: "Ventil.",
      act_heating: "Aquece",
      act_cooling: "Arrefece",
      act_drying: "Desumidifica",
      act_fan: "Ventila",
      act_idle: "Em espera",
      act_off: "Desligado",
      act_preheating: "Pré-aquece",
      act_defrosting: "Descongela",
      fan_auto: "Auto",
      fan_quiet: "Silêncio",
      fan_low: "Baixa",
      fan_medium: "Média",
      fan_high: "Alta",
      fan_off: "Parada",
      preset_none: "Normal",
      preset_boost: "Boost",
      preset_away: "Ausente",
      preset_eco: "Eco",
      preset_comfort: "Conforto",
      preset_sleep: "Noite",
      preset_home: "Casa",
      preset_activity: "Atividade",
      preset_frost: "Anticongelamento",
      preset_power: "Corte de carga",
      preset_safety: "Segurança",
      preset_security: "Segurança",
      swing_off: "Fixo",
      swing_stop: "Fixo",
      swing_on: "Oscila",
      swing_swing: "Oscila",
      swing_windnice: "Conforto",
      swing_vertical: "Vertical",
      swing_horizontal: "Horiz.",
      swing_both: "Ambos",
      rs_window: "janela aberta",
      rs_ass: "auto-start/stop",
      rs_sleep: "modo noite",
      rs_safety: "segurança",
      rs_central: "modo central",
      rs_inhibition: "inibido",
      rs_fan_ass: "ventilação (auto-start/stop)",
      rs_dry_ass: "desumidificação (auto-start/stop)",
      msg_safety_detected: "Modo segurança: a sonda de temperatura deixou de responder",
      msg_overpowering_detected: "Corte de carga: potência máxima atingida",
      msg_hvac_off_manual: "Desligado manualmente",
      msg_hvac_off_auto_start_stop: "Desligado pelo auto-start/stop",
      msg_hvac_off_window_detection: "Desligado pela deteção de abertura",
      msg_hvac_off_sleep_mode: "Desligado pelo modo noite",
      msg_hvac_off_safety_detection: "Desligado pelo modo segurança",
      msg_hvac_off_central_mode: "Desligado pelo modo central",
      msg_hvac_off_inhibition: "Termóstato inibido: comando dos aparelhos suspenso",
      msg_hvac_fan_only_auto_start_stop: "Só ventilação pelo auto-start/stop",
      msg_hvac_dry_auto_start_stop: "Desumidificação pelo auto-start/stop",
      msg_target_temp_window_eco: "Temperatura alvo baixada: janela aberta (eco)",
      msg_target_temp_window_frost: "Temperatura alvo baixada: janela aberta (anticongelamento)",
      msg_target_temp_power: "Temperatura alvo baixada: corte de carga",
      msg_target_temp_central_mode: "Temperatura alvo imposta pelo modo central",
      msg_target_temp_activity_detected: "Temperatura alvo: atividade detetada",
      msg_target_temp_activity_not_detected: "Temperatura alvo: sem atividade na divisão",
      msg_target_temp_absence_detected: "Temperatura alvo: ausência detetada",
      msg_target_temp_timed_preset: "Temperatura alvo: predefinição temporária em curso",
      msg_not_initialized: "Termóstato a inicializar",
      msg_underlying_unavailable: "Um aparelho controlado está indisponível",
      err_entity: "Escolha uma entidade climate no editor.",
      history: "Histórico da temperatura",
      setpoint: "Temperatura alvo",
      lower: "Baixar",
      close: "Fechar",
      unavailable: "Entidade indisponível",
      fan: "Ventilação",
      preset: "Predefinição",
      timed: "Predefinição temporária",
      timer: "Temporizador",
      swing_v: "Oscilação vertical",
      swing_h: "Oscilação horizontal",
      why: "Porquê este estado?",
      st_safety: "Segurança · sonda muda",
      st_heat_fail: "Falha de aquecimento",
      st_cool_fail: "Falha de arrefecimento",
      st_inhibited: "Parado · inibido",
      st_overpower: "Corte de carga em curso",
      st_win_off: "Parado · janela aberta",
      st_win: "Janela aberta",
      st_stopped: "Parado · {0}",
      st_timed: "{0} · faltam {1}",
      p_safety: "Segurança",
      p_safety_t: "Sonda de temperatura muda: aquecimento de segurança",
      p_overpower: "Corte de carga",
      p_overpower_t: "Potência máxima atingida: aquecimento reduzido",
      p_fail: "Falha",
      p_heat_fail_t: "Falha de aquecimento detetada: a temperatura não sobe",
      p_cool_fail_t: "Falha de arrefecimento detetada",
      p_inh_bypass: "Inibição ignorada",
      p_inh_bypass_t: "Bypass da inibição ativo",
      p_inh_bypass_tap: "Bypass da inibição ativo — toque para o desativar",
      p_inh: "Inibido",
      p_inh_t: "Comando dos aparelhos suspenso",
      p_inh_tap: "Comando dos aparelhos suspenso — toque para ignorar a inibição",
      p_win_bypass: "Janela ignorada",
      p_win_bypass_tap: "A deteção de abertura está ignorada — toque para a repor",
      p_win_open: "Janela aberta",
      p_win_open_tap: "Abertura detetada: aquecimento reduzido ou desligado — toque para a ignorar",
      p_win_closed_tap: "Janelas fechadas — toque para ignorar a deteção de abertura",
      p_ass_stop: "Paragem auto",
      p_ass_stopped_t: "Parado pelo auto-start/stop",
      p_ass_on_t: "Auto-start/stop ativo",
      p_ass_off_t: "Auto-start/stop desativado",
      p_tap_off: "{0} — toque para desativar",
      p_tap_on: "{0} — toque para ativar",
      p_present_t: "Presença detetada",
      p_away: "Ausente",
      p_away_t: "Ninguém em casa: temperatura de ausência",
      p_motion: "Movimento",
      p_motion_t: "Movimento detetado na divisão",
      p_no_motion_t: "Sem movimento",
      p_locked: "Bloqueado",
      p_locked_t: "Termóstato bloqueado",
      pw_heat: "Calor {0} %",
      pw_ext: "Ext. {0}°",
      w_timed: "Predefinição temporária em curso",
      w_remaining: "{0}, faltam {1}",
      w_inh_bypass: "Bypass da inibição ativado",
      w_win_bypass: "Deteção de abertura ignorada (bypass)",
      w_heat_fail: "Falha de aquecimento detetada",
      w_heat_fail_sub: "A temperatura não sobe apesar do aquecimento",
      w_cool_fail: "Falha de arrefecimento detetada",
      w_locked: "Termóstato bloqueado",
      w_recalc: "Aparelho controlado em atualização",
      w_none: "Sem alertas",
      lk_lock: "Bloquear",
      lk_unlock: "Desbloquear",
      lk_locked: "Comandos bloqueados: toque no cadeado para desbloquear",
      lk_vt: "Bloqueado pelo Versatile Thermostat: toque para desbloquear",
      lk_vt_open: "Desbloqueado: toque para bloquear",
      lk_local_open: "Desbloqueado por alguns segundos: toque para bloquear",
      lk_code: "Código de bloqueio",
      lk_bad: "Código recusado",
      lk_title: "Bloqueio",
      e_lock: "Bloquear os comandos (evita erros ao deslizar)",
      e_lock_delay: "Duração do desbloqueio",
      w_off_sub: "O termóstato está desligado.",
      w_ok_sub: "O termóstato segue normalmente a temperatura alvo.",
      tp_left: "<b>{0}</b> faltam {1}",
      tp_then: " · depois {0}",
      tp_cancel: "Cancelar",
      tp_for: "Durante",
      e_entity: "Entidade climate",
      e_name: "Nome apresentado",
      e_icon: "Ícone (aparelho desligado)",
      e_show_fan: "Ventilação",
      e_show_preset: "Predefinição (boost…)",
      e_show_swing: "Oscilação",
      e_layout: "Apresentação",
      e_min_temp: "Temperatura alvo mínima",
      e_max_temp: "Temperatura alvo máxima",
      e_temperature_sensor: "Sonda de temperatura (senão a do aparelho)",
      e_graph_hours: "Duração padrão do gráfico",
      e_badges: "Indicadores de estado (até 4 entidades: janela, presença, humidade…)",
      e_vtherm: "Funções do Versatile Thermostat (janela, presença, corte de carga, temporizador…)",
      e_vtherm_info: "Informações sob os comandos",
      e_vtherm_inhibition_bypass: "Interruptor de bypass da inibição (plugin de inibição)",
      e_vtherm_auto_start_stop: "Interruptor auto-start/stop (automático se vazio)",
      e_layout_full: "Completa (com a roda)",
      e_layout_compact: "Compacta (em largura, sem a roda)",
      e_theme: "Tema", e_theme_auto: "Automático (como o Home Assistant)", e_theme_dark: "Escuro", e_theme_light: "Claro", e_hidden_presets: "Predefinições ocultas",
      e_info_heat: "Taxa de aquecimento (%)",
      e_info_power: "Potência média (W)",
      e_info_ext: "Temperatura exterior",
      e_info_bar: "Barra de aquecimento",
      g_temp: "Temperatura",
      g_sensor: " · sonda",
      g_loading: "A carregar…",
      g_error: "Histórico indisponível: {0}",
      g_nodata: "Sem dados de temperatura neste período.",
      g_current: "Atual",
      g_min: "Mín",
      g_max: "Máx",
      g_avg: "Média",
      g_heat: "Calor",
      g_cool: "Frio",
      g_setpoint: "alvo {0}°",
      g_hours: "{0} h",
      g_days: "{0} d",
      g_hour_axis: "{0}h",
      card_desc: "Cartão de clima/aquecimento compacto e animado conforme o uso (desligado, calor, frio), legível dois lado a lado no telemóvel.",
      raise: "Subir",
      e_language: "Idioma",
      e_lang_auto: "Automático (perfil)",
    },
    pl: {
      room_temp: "Temperatura",
      ass_mode_t: "Tryb przy automatycznym zatrzymaniu: {0}. Dotknij, aby zmienić",
      ass_mode_title: "Tryb, gdy auto-start/stop zatrzymuje",
      e_vtherm_auto_start_stop_mode: "Lista „tryb po zatrzymaniu” auto-start/stop (automatycznie, jeśli puste)",
      e_main_value: "Duża wartość na środku pokrętła",
      e_main_target: "Temperatura zadana (pomiar poniżej)",
      e_main_current: "Zmierzona temperatura (zadana poniżej)",
      setpoint_t: "Temperatura zadana",
      dec: ",",
      mode_off: "Wył.",
      mode_heat: "Grzanie",
      mode_cool: "Chłodz.",
      mode_heat_cool: "Auto",
      mode_auto: "Auto",
      mode_dry: "Osusz.",
      mode_fan_only: "Wentyl.",
      act_heating: "Grzeje",
      act_cooling: "Chłodzi",
      act_drying: "Osusza",
      act_fan: "Wentyluje",
      act_idle: "Bezczynny",
      act_off: "Wył.",
      act_preheating: "Podgrzewa",
      act_defrosting: "Odszrania",
      fan_auto: "Auto",
      fan_quiet: "Cichy",
      fan_low: "Niski",
      fan_medium: "Średni",
      fan_high: "Wysoki",
      fan_off: "Wył.",
      preset_none: "Normalny",
      preset_boost: "Boost",
      preset_away: "Nieobecność",
      preset_eco: "Eko",
      preset_comfort: "Komfort",
      preset_sleep: "Noc",
      preset_home: "Dom",
      preset_activity: "Aktywność",
      preset_frost: "Ochrona przed mrozem",
      preset_power: "Odciążenie",
      preset_safety: "Bezpieczeństwo",
      preset_security: "Bezpieczeństwo",
      swing_off: "Stały",
      swing_stop: "Stały",
      swing_on: "Waha",
      swing_swing: "Waha",
      swing_windnice: "Komfort",
      swing_vertical: "Pionowo",
      swing_horizontal: "Poziomo",
      swing_both: "Oba",
      rs_window: "okno otwarte",
      rs_ass: "auto-start/stop",
      rs_sleep: "tryb nocny",
      rs_safety: "bezpieczeństwo",
      rs_central: "tryb centralny",
      rs_inhibition: "zablokowany",
      rs_fan_ass: "wentylacja (auto-start/stop)",
      rs_dry_ass: "osuszanie (auto-start/stop)",
      msg_safety_detected: "Tryb bezpieczeństwa: czujnik temperatury przestał odpowiadać",
      msg_overpowering_detected: "Odciążenie: osiągnięto maksymalną moc",
      msg_hvac_off_manual: "Wyłączony ręcznie",
      msg_hvac_off_auto_start_stop: "Wyłączony przez auto-start/stop",
      msg_hvac_off_window_detection: "Wyłączony przez wykrycie otwarcia",
      msg_hvac_off_sleep_mode: "Wyłączony przez tryb nocny",
      msg_hvac_off_safety_detection: "Wyłączony przez tryb bezpieczeństwa",
      msg_hvac_off_central_mode: "Wyłączony przez tryb centralny",
      msg_hvac_off_inhibition: "Termostat zablokowany: sterowanie urządzeniami wstrzymane",
      msg_hvac_fan_only_auto_start_stop: "Tylko wentylacja przez auto-start/stop",
      msg_hvac_dry_auto_start_stop: "Osuszanie przez auto-start/stop",
      msg_target_temp_window_eco: "Obniżona nastawa: okno otwarte (eko)",
      msg_target_temp_window_frost: "Obniżona nastawa: okno otwarte (ochrona przed mrozem)",
      msg_target_temp_power: "Obniżona nastawa: odciążenie",
      msg_target_temp_central_mode: "Nastawa narzucona przez tryb centralny",
      msg_target_temp_activity_detected: "Nastawa: wykryto aktywność",
      msg_target_temp_activity_not_detected: "Nastawa: brak aktywności w pomieszczeniu",
      msg_target_temp_absence_detected: "Nastawa: wykryto nieobecność",
      msg_target_temp_timed_preset: "Nastawa: trwa tymczasowe ustawienie",
      msg_not_initialized: "Termostat się inicjalizuje",
      msg_underlying_unavailable: "Sterowane urządzenie jest niedostępne",
      err_entity: "Wybierz encję climate w edytorze.",
      history: "Historia temperatury",
      setpoint: "Nastawa",
      lower: "Obniż",
      close: "Zamknij",
      unavailable: "Encja niedostępna",
      fan: "Wentylacja",
      preset: "Ustawienie",
      timed: "Ustawienie tymczasowe",
      timer: "Minutnik",
      swing_v: "Wahanie pionowe",
      swing_h: "Wahanie poziome",
      why: "Dlaczego ten stan?",
      st_safety: "Bezpieczeństwo · czujnik milczy",
      st_heat_fail: "Awaria grzania",
      st_cool_fail: "Awaria chłodzenia",
      st_inhibited: "Zatrzymany · zablokowany",
      st_overpower: "Trwa odciążenie",
      st_win_off: "Zatrzymany · okno otwarte",
      st_win: "Okno otwarte",
      st_stopped: "Zatrzymany · {0}",
      st_timed: "{0} · jeszcze {1}",
      p_safety: "Bezpieczeństwo",
      p_safety_t: "Czujnik temperatury milczy: grzanie awaryjne",
      p_overpower: "Odciążenie",
      p_overpower_t: "Osiągnięto maksymalną moc: grzanie ograniczone",
      p_fail: "Awaria",
      p_heat_fail_t: "Wykryto awarię grzania: temperatura nie rośnie",
      p_cool_fail_t: "Wykryto awarię chłodzenia",
      p_inh_bypass: "Blokada pominięta",
      p_inh_bypass_t: "Obejście blokady aktywne",
      p_inh_bypass_tap: "Obejście blokady aktywne — dotknij, aby wyłączyć",
      p_inh: "Zablokowany",
      p_inh_t: "Sterowanie urządzeniami wstrzymane",
      p_inh_tap: "Sterowanie urządzeniami wstrzymane — dotknij, aby pominąć blokadę",
      p_win_bypass: "Okno pominięte",
      p_win_bypass_tap: "Wykrywanie otwarcia jest pomijane — dotknij, aby przywrócić",
      p_win_open: "Okno otwarte",
      p_win_open_tap: "Wykryto otwarcie: grzanie ograniczone lub wyłączone — dotknij, aby pominąć",
      p_win_closed_tap: "Okna zamknięte — dotknij, aby pominąć wykrywanie otwarcia",
      p_ass_stop: "Auto-stop",
      p_ass_stopped_t: "Zatrzymany przez auto-start/stop",
      p_ass_on_t: "Auto-start/stop włączony",
      p_ass_off_t: "Auto-start/stop wyłączony",
      p_tap_off: "{0} — dotknij, aby wyłączyć",
      p_tap_on: "{0} — dotknij, aby włączyć",
      p_present_t: "Wykryto obecność",
      p_away: "Nieobecność",
      p_away_t: "Nikogo w domu: nastawa nieobecności",
      p_motion: "Ruch",
      p_motion_t: "Wykryto ruch w pomieszczeniu",
      p_no_motion_t: "Brak ruchu",
      p_locked: "Zablokowany",
      p_locked_t: "Termostat zablokowany",
      pw_heat: "Grzanie {0} %",
      pw_ext: "Zewn. {0}°",
      w_timed: "Trwa ustawienie tymczasowe",
      w_remaining: "{0}, jeszcze {1}",
      w_inh_bypass: "Obejście blokady włączone",
      w_win_bypass: "Wykrywanie otwarcia pominięte (obejście)",
      w_heat_fail: "Wykryto awarię grzania",
      w_heat_fail_sub: "Temperatura nie rośnie mimo grzania",
      w_cool_fail: "Wykryto awarię chłodzenia",
      w_locked: "Termostat zablokowany",
      w_recalc: "Sterowane urządzenie się aktualizuje",
      w_none: "Brak alertów",
      lk_lock: "Zablokuj",
      lk_unlock: "Odblokuj",
      lk_locked: "Sterowanie zablokowane: dotknij kłódki, aby odblokować",
      lk_vt: "Zablokowany przez Versatile Thermostat: dotknij, aby odblokować",
      lk_vt_open: "Odblokowany: dotknij, aby zablokować",
      lk_local_open: "Odblokowany na kilka sekund: dotknij, aby zablokować",
      lk_code: "Kod blokady",
      lk_bad: "Kod odrzucony",
      lk_title: "Blokada",
      e_lock: "Zablokuj sterowanie (chroni przed pomyłkami przy przewijaniu)",
      e_lock_delay: "Czas odblokowania",
      w_off_sub: "Termostat jest wyłączony.",
      w_ok_sub: "Termostat normalnie utrzymuje nastawę.",
      tp_left: "<b>{0}</b> jeszcze {1}",
      tp_then: " · potem {0}",
      tp_cancel: "Anuluj",
      tp_for: "Przez",
      e_entity: "Encja climate",
      e_name: "Wyświetlana nazwa",
      e_icon: "Ikona (urządzenie wyłączone)",
      e_show_fan: "Wentylacja",
      e_show_preset: "Ustawienie (boost…)",
      e_show_swing: "Wahanie",
      e_layout: "Układ",
      e_min_temp: "Minimalna nastawa",
      e_max_temp: "Maksymalna nastawa",
      e_temperature_sensor: "Czujnik temperatury (w przeciwnym razie urządzenia)",
      e_graph_hours: "Domyślny zakres wykresu",
      e_badges: "Plakietki stanu (do 4 encji: okno, obecność, wilgotność…)",
      e_vtherm: "Funkcje Versatile Thermostat (okno, obecność, odciążenie, minutnik…)",
      e_vtherm_info: "Informacje pod sterowaniem",
      e_vtherm_inhibition_bypass: "Przełącznik obejścia blokady (wtyczka blokady)",
      e_vtherm_auto_start_stop: "Przełącznik auto-start/stop (automatycznie, jeśli puste)",
      e_layout_full: "Pełny (z pokrętłem)",
      e_layout_compact: "Kompaktowy (szeroki, bez pokrętła)",
      e_theme: "Motyw", e_theme_auto: "Automatyczny (jak Home Assistant)", e_theme_dark: "Ciemny", e_theme_light: "Jasny", e_hidden_presets: "Ukryte ustawienia",
      e_info_heat: "Stopień grzania (%)",
      e_info_power: "Średnia moc (W)",
      e_info_ext: "Temperatura zewnętrzna",
      e_info_bar: "Pasek grzania",
      g_temp: "Temperatura",
      g_sensor: " · czujnik",
      g_loading: "Ładowanie…",
      g_error: "Historia niedostępna: {0}",
      g_nodata: "Brak danych temperatury w tym okresie.",
      g_current: "Obecna",
      g_min: "Min",
      g_max: "Maks",
      g_avg: "Średnia",
      g_heat: "Grzanie",
      g_cool: "Chłodz.",
      g_setpoint: "nastawa {0}°",
      g_hours: "{0} h",
      g_days: "{0} d",
      g_hour_axis: "{0}:00",
      card_desc: "Kompaktowa, animowana karta klimatyzacji/ogrzewania zależna od pracy urządzenia (wył., grzanie, chłodzenie), czytelna po dwie obok siebie na telefonie.",
      raise: "Podnieś",
      e_language: "Język",
      e_lang_auto: "Automatycznie (profil)",
    },
  };
  let LANG = "fr", LOCALE = "fr-FR";
  const pickLang = (l) => { const k = String(l || "").toLowerCase().split(/[-_]/)[0]; return I18N[k] ? k : null; };
  // langue de l'utilisateur Home Assistant (sinon celle de la page), français par défaut
  const LOCALES = { fr: "fr-FR", en: "en-GB", de: "de-DE", es: "es-ES", it: "it-IT", nl: "nl-NL", pt: "pt-PT", pl: "pl-PL" };
  const LANG_NAMES = { fr: "Français", en: "English", de: "Deutsch", es: "Español", it: "Italiano", nl: "Nederlands", pt: "Português", pl: "Polski" };
  const setLang = (hass, c) => {
    const forced = c && c.language && pickLang(c.language);
    const l = (hass && ((hass.locale && hass.locale.language) || hass.language)) || (typeof document !== "undefined" && document.documentElement && document.documentElement.lang) || (typeof navigator !== "undefined" && navigator.language) || "";
    const k = forced || pickLang(l) || "en";
    LANG = k;
    LOCALE = !forced && String(l).toLowerCase().startsWith(k) ? l : LOCALES[k];
  };
  setLang(null);
  const tr = (k, ...args) => {
    const s = (I18N[LANG] && I18N[LANG][k]) ?? I18N.en[k] ?? I18N.fr[k] ?? k;
    return args.length ? s.replace(/\{(\d)\}/g, (_, i) => args[i]) : s;
  };
  const has = (k) => I18N.fr[k] !== undefined;
  const dec = (s) => String(s).replace(".", tr("dec"));

  const MODE_META = {
    off: { icon: "mdi:power", rgb: "150,160,178" },
    heat: { icon: "mdi:fire", rgb: "255,128,48" },
    cool: { icon: "mdi:snowflake", rgb: "64,190,255" },
    heat_cool: { icon: "mdi:sun-snowflake-variant", rgb: "185,139,255" },
    auto: { icon: "mdi:thermostat-auto", rgb: "185,139,255" },
    dry: { icon: "mdi:water-percent", rgb: "45,217,196" },
    fan_only: { icon: "mdi:fan", rgb: "45,212,160" },
  };
  const modeLabel = (m) => tr("mode_" + m);
  const PRIMARY_MODES = ["off", "heat", "cool", "fan_only"];

  // Dégradés de la roue [début, fin]
  const ARC_GRAD = {
    off: ["#6b7385", "#9aa3b5"],
    heat: ["#ffc46b", "#ff5a1f"],
    cool: ["#a8ecff", "#2f86ff"],
    heat_cool: ["#e3d2ff", "#9b6bff"],
    auto: ["#e3d2ff", "#9b6bff"],
    dry: ["#b9fff1", "#16b8a6"],
    fan_only: ["#bff7e2", "#14b884"],
  };

  const FAN_META = {
    auto: { icon: "mdi:fan-auto", speed: 1.4 },
    quiet: { icon: "mdi:weather-night", speed: 3 },
    "1": { icon: "mdi:fan-speed-1", speed: 2.4 },
    "2": { icon: "mdi:fan-speed-2", speed: 1.8 },
    "3": { icon: "mdi:fan-speed-3", speed: 1.3 },
    "4": { icon: "mdi:fan", speed: 0.9 },
    "5": { icon: "mdi:fan", speed: 0.6 },
    low: { icon: "mdi:fan-speed-1", speed: 2.4 },
    medium: { icon: "mdi:fan-speed-2", speed: 1.5 },
    high: { icon: "mdi:fan-speed-3", speed: 0.8 },
    off: { icon: "mdi:fan-off", speed: 0 },
  };
  const PRESET_META = {
    none: { icon: "mdi:tune-variant" },
    boost: { icon: "mdi:rocket-launch" },
    away: { icon: "mdi:home-export-outline" },
    eco: { icon: "mdi:leaf" },
    comfort: { icon: "mdi:sofa" },
    sleep: { icon: "mdi:sleep" },
    home: { icon: "mdi:home" },
    activity: { icon: "mdi:run" },
    frost: { icon: "mdi:snowflake-thermometer" },
    power: { icon: "mdi:flash-alert" },
    safety: { icon: "mdi:shield-alert" },
    security: { icon: "mdi:shield-alert" },
  };
  // Versatile Thermostat : raisons d'arrêt / de mode (valeurs anglaises et françaises selon les versions) → clé de texte
  const VT_REASON = {
    window: "window", fenetre: "window", "fenêtre": "window", window_detection: "window",
    "auto-start/stop": "ass", auto_start_stop: "ass",
    sleep: "sleep", sommeil: "sleep", sleep_mode: "sleep", safety: "safety", safety_detection: "safety",
    central_mode: "central", "central mode": "central", inhibition: "inhibition",
    fan_only_auto_start_stop: "fan_ass", dry_auto_start_stop: "dry_ass",
  };
  // messages de Versatile Thermostat (specific_states.messages) : [icône, gravité] (texte : msg_<clé>)
  const VT_MSG = {
    safety_detected: ["mdi:shield-alert", "bad"],
    overpowering_detected: ["mdi:flash-alert", "bad"],
    hvac_off_manual: ["mdi:power", "info"],
    hvac_off_auto_start_stop: ["mdi:power-cycle", "warn"],
    hvac_off_window_detection: ["mdi:window-open-variant", "warn"],
    hvac_off_sleep_mode: ["mdi:sleep", "info"],
    hvac_off_safety_detection: ["mdi:shield-alert", "bad"],
    hvac_off_central_mode: ["mdi:home-switch-outline", "info"],
    hvac_off_inhibition: ["mdi:pause-circle-outline", "warn"],
    hvac_fan_only_auto_start_stop: ["mdi:fan", "warn"],
    hvac_dry_auto_start_stop: ["mdi:water-percent", "warn"],
    target_temp_window_eco: ["mdi:window-open-variant", "warn"],
    target_temp_window_frost: ["mdi:window-open-variant", "warn"],
    target_temp_power: ["mdi:flash-alert", "bad"],
    target_temp_central_mode: ["mdi:home-switch-outline", "info"],
    target_temp_activity_detected: ["mdi:motion-sensor", "info"],
    target_temp_activity_not_detected: ["mdi:motion-sensor-off", "info"],
    target_temp_absence_detected: ["mdi:home-export-outline", "info"],
    target_temp_timed_preset: ["mdi:timer-sand", "info"],
    not_initialized: ["mdi:progress-clock", "warn"],
    underlying_unavailable: ["mdi:lan-disconnect", "bad"],
  };
  const VT_ASS_REASONS = ["hvac_off_auto_start_stop", "hvac_fan_only_auto_start_stop", "hvac_dry_auto_start_stop"];
  const VT_DURATIONS = [[30, "30 min"], [60, "1 h"], [120, "2 h"], [240, "4 h"]];
  const durTxt = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? " " + String(m % 60).padStart(2, "0") : ""}` : `${Math.max(0, Math.round(m))} min`);
  const SWING_META = {
    off: { icon: "mdi:arrow-oscillating-off" },
    stop: { icon: "mdi:arrow-oscillating-off" },
    on: { icon: "mdi:arrow-oscillating" },
    swing: { icon: "mdi:arrow-oscillating" },
    windnice: { icon: "mdi:weather-windy" },
    vertical: { icon: "mdi:arrow-up-down" },
    horizontal: { icon: "mdi:arrow-left-right" },
    both: { icon: "mdi:arrow-all" },
  };
  // attribut → [préfixe des textes, table d'icônes]
  const ATTR_META = {
    fan_mode: ["fan", FAN_META],
    preset_mode: ["preset", PRESET_META],
    swing_mode: ["swing", SWING_META],
    swing_horizontal_mode: ["swing", SWING_META],
  };
  const metaKey = (meta, v) => (v != null && Object.prototype.hasOwnProperty.call(meta, String(v)) ? String(v) : null);
  const metaOf = (meta, v) => { const k = metaKey(meta, v); return k == null ? null : meta[k]; };
  const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1).replace(/_/g, " ") : "");
  // valeur d'attribut affichée : texte de la carte pour les valeurs connues, sinon traduction
  // de Home Assistant (et de l'intégration) si elle existe, sinon valeur brute
  const attrLabel = (hass, so, attr, v) => {
    if (v == null || v === "") return "";
    const raw = String(v);
    const am = ATTR_META[attr], k = am && metaKey(am[1], raw);
    if (k != null && has(`${am[0]}_${k}`)) return tr(`${am[0]}_${k}`);
    if (hass && so && typeof hass.formatEntityAttributeValue === "function") {
      try {
        const f = hass.formatEntityAttributeValue(so, attr, raw);
        if (f != null && f !== "" && String(f) !== raw) return String(f);
      } catch (e) { /* ancienne version de Home Assistant */ }
    }
    return cap(raw);
  };

  const START = 135;
  const SWEEP = 270;
  const C = 100;
  const R = 82;
  const OPTIMISTIC_TTL = 20000;
  const N_PARTICLES = 14;

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const polar = (a, r = R) => {
    const rad = (a * Math.PI) / 180;
    return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
  };
  const arc = (a0, a1, r = R) => {
    if (a1 - a0 < 0.01) a1 = a0 + 0.01;
    const s = polar(a0, r), e = polar(a1, r);
    return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
  };
  const fmt = (t, step) => {
    if (t == null || isNaN(t)) return "–";
    const d = step && step < 1 ? 1 : 0;
    return dec(Number(t).toFixed(d));
  };

  class HolmClimateCard extends HTMLElement {
    static getConfigElement() {
      return document.createElement("holm-climate-card-editor");
    }
    static getStubConfig(hass) {
      const e = hass ? Object.keys(hass.states).find((k) => k.startsWith("climate.")) : "";
      return { type: "custom:holm-climate-card", entity: e || "", show_fan: true, show_preset: true, show_swing: false };
    }
    setConfig(config) {
      if (!config || !config.entity) throw new Error(tr("err_entity"));
      this._config = { show_fan: true, show_swing: true, show_preset: true, layout: "full", graph_hours: 24, ...config };
      const rows = config.grid_options && config.grid_options.rows;
      this.toggleAttribute("fixed-rows", rows != null && rows !== "auto" && !isNaN(Number(rows)));
      this._opt = {};
      this._drag = null;
      this._sheet = null;
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      this._built = false;
      if (this._hass) this.hass = this._hass;
    }
    get _compact() { return this._config && this._config.layout === "compact"; }
    // thème de la carte (#12) : option `theme` (auto | dark | light) ; auto suit le mode sombre de Home Assistant
    _themeName() {
      const t = this._config && this._config.theme;
      if (t === "light" || t === "dark") return t;
      return this._hass && this._hass.themes && this._hass.themes.darkMode === false ? "light" : "dark";
    }
    getCardSize() {
      return this._compact ? 2 : 5;
    }
    getGridOptions() {
      return this._compact ? { columns: 12, min_columns: 6, rows: "auto" } : { columns: 6, min_columns: 6, rows: "auto" };
    }

    set hass(hass) {
      if (!hass || !hass.states) return;   // certaines cartes conteneurs (expander-card…) transmettent d'abord un hass vide (#9)
      this._hass = hass;
      if (!this._config) return;
      setLang(hass, this._config);
      if (this._lang !== LANG) { this._lang = LANG; this._built = false; }   // textes fixes du DOM : reconstruire
      this._so = hass.states[this._config.entity];
      this._ss = this._config.temperature_sensor ? hass.states[this._config.temperature_sensor] : null;
      this._prune();
      if (!this._built) this._build();
      if (!this._drag) this._render();
    }

    // ---------- optimistic state ----------
    _prune() {
      const so = this._so;
      if (!so) return;
      const now = Date.now();
      for (const k of Object.keys(this._opt)) {
        const cur = k === "state" ? so.state : so.attributes[k];
        if (cur === this._opt[k].v || now - this._opt[k].ts > OPTIMISTIC_TTL) delete this._opt[k];
      }
    }
    _set(k, v) {
      this._opt[k] = { v, ts: Date.now() };
    }
    _val(k) {
      if (this._opt[k]) return this._opt[k].v;
      if (!this._so) return undefined;
      return k === "state" ? this._so.state : this._so.attributes[k];
    }
    _call(service, data) {
      if (this._hass) this._hass.callService("climate", service, { entity_id: this._config.entity, ...data });
    }

    // ---------- DOM ----------
    _build() {
      const root = this.shadowRoot;
      root.innerHTML = "";
      const style = document.createElement("style");
      style.textContent = HolmClimateCard.css();
      root.appendChild(style);

      const particles = Array.from({ length: N_PARTICLES }, (_, i) => {
        const x = ((i * 37) % 100) + (i % 3) * 2;
        const d = 3.2 + ((i * 13) % 10) / 4;
        const delay = -((i * 7) % 23) / 4;
        const s = 3 + ((i * 5) % 4);
        const drift = ((i % 5) - 2) * 6;
        const y = ((i * 29) % 86) + 6;
        return `<i style="left:${x}%;--y:${y}%;--d:${d}s;--dl:${delay}s;--s:${s}px;--dx:${drift}px"></i>`;
      }).join("");

      const ticks = Array.from({ length: 28 }, (_, i) => {
        const a = START + (i / 27) * SWEEP;
        const p0 = polar(a, R - 15), p1 = polar(a, R - (i % 3 === 0 ? 20 : 18));
        return `<line x1="${p0.x.toFixed(1)}" y1="${p0.y.toFixed(1)}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}"/>`;
      }).join("");

      const card = document.createElement("ha-card");
      card.innerHTML = `
        <div class="amb"><div class="glow"></div><div class="fx">${particles}</div></div>
        <div class="wrap">
          <div class="head" id="head">
            <div class="badge"><ha-icon id="bicon"></ha-icon></div>
            <div class="ttl">
              <div class="name" id="name"></div>
              <div class="status" id="statusbox"><span class="dot"></span><span id="status"></span><ha-icon class="why" id="why" icon="mdi:information-outline"></ha-icon></div>
            </div>
            <button class="lockb" id="lockb"><ha-icon id="locki" icon="mdi:lock"></ha-icon><span id="lockt"></span></button>
            <button class="hcur curbtn" id="hcur" title="${tr("history")}"><ha-icon icon="mdi:home-thermometer-outline"></ha-icon><span id="hcurt"></span></button>
          </div>
          <div class="vb" id="vb"></div>
          <div class="main">
            <div class="dialbox">
              <svg viewBox="0 0 200 200" id="dial">
                <defs>
                  <linearGradient id="g" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" id="g0"/><stop offset="1" id="g1"/>
                  </linearGradient>
                </defs>
                <path class="track" d="${arc(START, START + SWEEP)}"/>
                <g class="ticks">${ticks}</g>
                <path class="val" id="val" stroke="url(#g)"/>
                <circle class="cur" id="cur" r="3.2"/>
                <circle class="knob" id="knob" r="10"/>
                <path class="hit" d="${arc(START, START + SWEEP)}"/>
              </svg>
              <div class="center">
                <div class="lbl" id="lbl">${tr("setpoint")}</div>
                <div class="target"><span id="tgt"></span><span class="dec" id="dec"></span><sup>°</sup></div>
                <button class="curtxt curbtn" id="curb" title="${tr("history")}"><ha-icon icon="mdi:home-thermometer-outline"></ha-icon><span id="curt"></span></button>
              </div>
              <button class="step minus" id="minus" aria-label="${tr("lower")}"><ha-icon icon="mdi:minus"></ha-icon></button>
              <button class="step plus" id="plus" aria-label="${tr("raise")}"><ha-icon icon="mdi:plus"></ha-icon></button>
            </div>
            <div class="side">
              <div class="ctl">
                <div class="modes" id="modes"></div>
                <div class="cstep" id="cstep">
                  <button class="cbtn" id="cminus" aria-label="${tr("lower")}"><ha-icon icon="mdi:minus"></ha-icon></button>
                  <div class="ctgt"><span id="ctgt"></span><sup>°</sup></div>
                  <button class="cbtn" id="cplus" aria-label="${tr("raise")}"><ha-icon icon="mdi:plus"></ha-icon></button>
                </div>
              </div>
              <div class="chips" id="chips"></div>
              <div class="vp" id="vp"></div>
            </div>
          </div>
        </div>
        <div class="sheet" id="sheet">
          <div class="sheet-in">
            <div class="sheet-h"><span id="sheet-t"></span><button id="sheet-x" aria-label="${tr("close")}"><ha-icon icon="mdi:close"></ha-icon></button></div>
            <div class="opts" id="opts"></div>
          </div>
        </div>
        <div class="na" id="na">${tr("unavailable")}</div>`;
      root.appendChild(card);
      this._card = card;
      const $ = (id) => root.getElementById(id);
      this.$ = $;

      $("statusbox").addEventListener("click", (e) => {
        if (!this._vtOn()) return;   // sans VTherm : la ligne d'état ouvre la fiche comme le reste de l'entête
        e.stopPropagation();
        this._sheet = "why";
        this._renderSheet();
      });
      $("head").addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: this._config.entity }, bubbles: true, composed: true }));
      });
      $("lockb").addEventListener("click", (e) => { e.stopPropagation(); this._toggleLock(); });
      const openGraph = (e) => { e.stopPropagation(); this._openGraph(); };
      $("hcur").addEventListener("click", openGraph);
      $("curb").addEventListener("click", openGraph);
      $("cminus").addEventListener("click", (e) => { e.stopPropagation(); this._nudge(-1); });
      $("cplus").addEventListener("click", (e) => { e.stopPropagation(); this._nudge(1); });
      $("minus").addEventListener("click", (e) => { e.stopPropagation(); this._nudge(-1); });
      $("plus").addEventListener("click", (e) => { e.stopPropagation(); this._nudge(1); });
      $("sheet").addEventListener("click", (e) => { if (e.target.id === "sheet") this._closeSheet(); });
      $("sheet-x").addEventListener("click", () => this._closeSheet());
      $("vb").addEventListener("click", (e) => {
        const b = e.target.closest("[data-act],[data-ent]");
        if (!b) return;
        e.stopPropagation();
        if (b.dataset.act && this._guard()) return;
        if (b.dataset.act === "bypass-on" || b.dataset.act === "bypass-off") {
          const on = b.dataset.act === "bypass-on";
          this._vtOpt = { bypass: on, ts: Date.now() };
          this._vtCall("set_window_bypass", { window_bypass: on });
          this._render();
        } else if (b.dataset.act === "inh-on" || b.dataset.act === "inh-off") {
          const sw = this._inhSwitch();
          if (sw) this._hass.callService("switch", b.dataset.act === "inh-on" ? "turn_on" : "turn_off", { entity_id: sw });
        } else if (b.dataset.act === "ass-on" || b.dataset.act === "ass-off") {
          const sw = this._assSwitch(), on = b.dataset.act === "ass-on";
          if (sw) { this._assOpt = { on, ts: Date.now() }; this._hass.callService("switch", on ? "turn_on" : "turn_off", { entity_id: sw }); this._render(); }
        } else if (b.dataset.act === "ass-mode") {
          this._sheet = "assmode"; this._renderSheet();
        } else if (b.dataset.ent) {
          this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: b.dataset.ent }, bubbles: true, composed: true }));
        }
      });

      const dial = $("dial");
      const onMove = (e) => {
        if (!this._drag) return;
        e.preventDefault();
        const t = this._tempFromPointer(e.clientX, e.clientY);
        if (t != null) { this._drag.t = t; this._paintDial(t); }
      };
      const onUp = () => {
        if (!this._drag) return;
        const t = this._drag.t;
        this._drag = null;
        this._card.classList.remove("dragging");
        if (t != null && t !== this._target()) this._commitTemp(t, 0);
        this._render();
      };
      dial.addEventListener("pointerdown", (e) => {
        if (!e.target.classList.contains("hit") && e.target.id !== "knob") return;
        if (this._guard()) return;
        if (this._fanOnly()) {
          e.preventDefault();
          const r = dial.getBoundingClientRect(), sc = 200 / r.width;
          let a = (Math.atan2((e.clientY - r.top) * sc - C, (e.clientX - r.left) * sc - C) * 180) / Math.PI;
          if (a < 0) a += 360;
          let raw = a - START; if (raw < 0) raw += 360; if (raw > SWEEP) raw = raw - SWEEP < 360 - raw ? SWEEP : 0;
          const list = this._so.attributes.fan_modes, n = list[Math.round((raw / SWEEP) * (list.length - 1))];
          if (n && n !== this._val("fan_mode")) { this._set("fan_mode", n); this._call("set_fan_mode", { fan_mode: n }); this._render(); }
          return;
        }
        if (this._target() == null) return;
        e.preventDefault();
        this._drag = { t: this._target() };
        this._card.classList.add("dragging");
        if (this._card.classList.contains("swapped")) { const c = this._curTemp(); this.$("curt").textContent = c != null ? `${fmt(c, 0.1)}°` : "–"; this._swapCenter(this._drag.t, c); }
        dial.setPointerCapture && dial.setPointerCapture(e.pointerId);
        onMove(e);
      });
      dial.addEventListener("pointermove", onMove);
      dial.addEventListener("pointerup", onUp);
      dial.addEventListener("pointercancel", onUp);
      this._built = true;
    }

    // ---------- Versatile Thermostat ----------
    static isVTherm(a) {
      return !!a && (a.is_window_configured !== undefined || a.is_presence_configured !== undefined ||
        (a.specific_states && typeof a.specific_states === "object") || a.timed_preset_manager !== undefined);
    }
    // ---------- verrouillage (#7) : verrou de Versatile Thermostat et/ou verrou local de la carte ----------
    _lockInfo() {
      const a = (this._so && this._so.attributes) || {};
      const lm = a.lock_manager && typeof a.lock_manager === "object" ? a.lock_manager : null;
      const sp = a.specific_states && typeof a.specific_states === "object" ? a.specific_states : {};
      const vtCfg = a.is_lock_configured === true || !!lm;
      let vtLocked = vtCfg && (lm ? lm.is_locked === true : (sp.is_locked === true || a.is_locked === true));
      if (this._lkOpt && Date.now() - this._lkOpt.ts < OPTIMISTIC_TTL && this._lkOpt.locked !== vtLocked) vtLocked = this._lkOpt.locked;
      else this._lkOpt = null;
      const vtUsers = !lm || lm.lock_users !== false;   // le verrou ne bloque l'interface que si « utilisateurs » est coché
      const local = !!this._config.lock;
      const localLocked = local && !(this._unlockUntil && Date.now() < this._unlockUntil);
      return { vtCfg, vtLocked, vtUsers, code: !!(lm && lm.lock_code), relock: lm ? Number(lm.auto_relock_sec) || 0 : 0, local, localLocked,
        blocked: (vtLocked && vtUsers) || localLocked, shown: vtCfg || local };
    }
    _guard() {
      if (!this._so || !this._lockInfo().blocked) return false;
      const b = this.$("lockb");
      b.classList.remove("nudge"); void b.offsetWidth; b.classList.add("nudge");
      return true;
    }
    _toggleLock() {
      const li = this._lockInfo();
      if (li.vtLocked) {   // verrou VTherm actif : déverrouiller (avec code si VTherm en demande un)
        if (li.code) { this._lkErr = false; this._sheet = "lock"; this._lkAction = "unlock"; return this._renderSheet(); }
        return this._vtLock(false);
      }
      if (li.localLocked) {   // verrou local : déverrouiller quelques secondes
        const sec = Math.max(5, Number(this._config.lock_delay) || 30);
        this._unlockUntil = Date.now() + sec * 1000;
        clearTimeout(this._relockT);
        this._relockT = setTimeout(() => { this._unlockUntil = 0; this._render(); }, sec * 1000 + 50);
        return this._render();
      }
      if (li.local) { this._unlockUntil = 0; clearTimeout(this._relockT); return this._render(); }
      if (li.vtCfg) {   // VTherm déverrouillé : reverrouiller
        if (li.code) { this._lkErr = false; this._sheet = "lock"; this._lkAction = "lock"; return this._renderSheet(); }
        return this._vtLock(true);
      }
    }
    _vtLock(locked, code) {
      if (!this._hass) return Promise.resolve(false);
      const data = { entity_id: this._config.entity };
      if (code) data.code = String(code);
      this._lkOpt = { locked, ts: Date.now() };
      this._render();
      return Promise.resolve(this._hass.callService("versatile_thermostat", locked ? "lock" : "unlock", data))
        .then(() => true)
        .catch(() => { this._lkOpt = null; this._render(); return false; });
    }
    _renderLockSheet(box) {
      const $ = this.$;
      $("sheet-t").textContent = tr("lk_title");
      box.dataset.n = 1;
      box.innerHTML = `<div class="lkf"><input id="lkc" type="password" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="${tr("lk_code")}">
        <button class="opt on" id="lkgo"><ha-icon icon="${this._lkAction === "lock" ? "mdi:lock" : "mdi:lock-open-variant"}"></ha-icon><span>${tr(this._lkAction === "lock" ? "lk_lock" : "lk_unlock")}</span></button>
        ${this._lkErr ? `<div class="lkerr">${tr("lk_bad")}</div>` : ""}</div>`;
      const inp = box.querySelector("#lkc");
      const go = () => {
        const code = inp.value.trim();
        if (!code) return inp.focus();
        this._vtLock(this._lkAction === "lock", code).then((ok) => {
          if (ok) { this._closeSheet(); return; }
          this._lkErr = true;
          if (this._sheet === "lock") this._renderLockSheet(box);
        });
      };
      box.querySelector("#lkgo").addEventListener("click", go);
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
      this._card.classList.add("sheet-open");
      setTimeout(() => inp.focus(), 50);
    }
    _renderLock() {
      const li = this._lockInfo(), b = this.$("lockb");
      b.style.display = li.shown ? "" : "none";
      this._card.classList.toggle("locked", li.blocked);
      if (!li.shown) return;
      const open = !li.vtLocked && !li.localLocked;
      b.classList.toggle("open", open);
      this.$("locki").setAttribute("icon", open ? "mdi:lock-open-variant" : "mdi:lock");
      const secs = li.local && open && this._unlockUntil ? Math.max(0, Math.ceil((this._unlockUntil - Date.now()) / 1000)) : 0;
      this.$("lockt").textContent = secs ? secs + " s" : "";
      if (secs) { clearTimeout(this._lkTick); this._lkTick = setTimeout(() => this._renderLock(), 1000); }
      b.title = li.vtLocked ? tr("lk_vt") : li.localLocked ? tr("lk_locked") : li.local ? tr("lk_local_open") : tr("lk_vt_open");
      b.setAttribute("aria-label", b.title);
    }
    _vtOn() { return !!(this._config.vtherm && this._so && HolmClimateCard.isVTherm(this._so.attributes)); }
    _vtCall(service, data) {
      if (this._hass) this._hass.callService("versatile_thermostat", service, { entity_id: this._config.entity, ...data });
    }
    // lecture tolérante : attributs regroupés par section (VTherm 7+) ou à plat (anciennes versions)
    _vt() {
      const a = this._so.attributes, sec = (n) => (a[n] && typeof a[n] === "object" ? a[n] : {});
      const pick = (o, k) => (o[k] !== undefined ? o[k] : a[k]);
      const isOn = (v) => v === true || v === "on" || v === "home";
      const sp = sec("specific_states"), wm = sec("window_manager"), pm = sec("presence_manager"), mm = sec("motion_manager");
      const pw = sec("power_manager"), sm = sec("safety_manager"), tp = sec("timed_preset_manager"), sw = sec("vtherm_over_switch");
      const winCfg = !!(a.is_window_configured || a.is_window_auto_configured);
      let bypass = isOn(pick(wm, "is_window_bypass")) || isOn(a.window_bypass_state);
      if (this._vtOpt && Date.now() - this._vtOpt.ts < OPTIMISTIC_TTL && this._vtOpt.bypass !== bypass) bypass = this._vtOpt.bypass;
      else this._vtOpt = null;
      let onPct = pick(sw, "on_percent");
      if (onPct == null) onPct = a.power_percent != null ? Number(a.power_percent) / 100 : null;
      onPct = onPct == null || isNaN(Number(onPct)) ? null : Number(onPct) <= 1 ? Number(onPct) * 100 : Number(onPct);
      const remaining = tp.remaining_time_min != null ? Number(tp.remaining_time_min)
        : tp.end_time ? (new Date(tp.end_time).getTime() - Date.now()) / 60000 : null;
      const ext = pick(sp, "ext_current_temperature");
      return {
        winCfg, winOpen: winCfg && (isOn(pick(wm, "window_state")) || isOn(pick(wm, "window_auto_state"))), bypass,
        presCfg: !!a.is_presence_configured, present: isOn(pick(pm, "presence_state")),
        motCfg: !!a.is_motion_configured, motion: isOn(pick(mm, "motion_state")),
        powCfg: !!a.is_power_configured, overpower: isOn(pick(pw, "overpowering_state")) || a.preset_mode === "power",
        safety: isOn(pick(sm, "safety_state")) || isOn(a.security_state) || ["safety", "security"].includes(a.preset_mode),
        locked: this._lockInfo().vtLocked,
        timed: tp.is_active === true || tp.is_active === "on" ? { preset: tp.preset, remaining, original: tp.original_preset } : null,
        offReason: pick(sp, "hvac_off_reason"), modeReason: pick(sp, "hvac_mode_reason"),
        inhibited: !!(sp.inhibition && sp.inhibition.inhibited === true), inhBypass: this._inhSwitch() ? this._hass.states[this._inhSwitch()]?.state === "on" : false,
        assCfg: a.is_auto_start_stop_configured === true, assOn: pick(sec("auto_start_stop_manager"), "auto_start_stop_enable") === true,
        assStopped: VT_ASS_REASONS.includes(String(pick(sp, "hvac_off_reason") || "")) || VT_ASS_REASONS.includes(String(pick(sp, "hvac_mode_reason") || "")),
        heatFail: isOn(sec("heating_failure_detection_manager").heating_failure_state), coolFail: isOn(sec("heating_failure_detection_manager").cooling_failure_state),
        onPct, meanPower: pick(pw, "mean_cycle_power"), ext: ext == null || isNaN(Number(ext)) ? null : Number(ext),
      };
    }
    // interrupteur « Enable auto start/stop » du même appareil (ou celui de la configuration)
    _assSwitch() {
      if (this._config.vtherm_auto_start_stop) return this._config.vtherm_auto_start_stop;
      const h = this._hass, reg = h && h.entities, me = reg && reg[this._config.entity];
      if (!me || !me.device_id) return null;
      const r = Object.values(reg).find((e) => e.device_id === me.device_id && e.entity_id.startsWith("switch.") && /auto_start_stop/.test(e.entity_id));
      return r ? r.entity_id : null;
    }
    // liste « mode à l'arrêt » de l'auto-start/stop (#13) : off, fan_only… choisi par l'utilisateur dans VTherm
    _assModeSel() {
      if (this._config.vtherm_auto_start_stop_mode) return this._config.vtherm_auto_start_stop_mode;
      const h = this._hass, reg = h && h.entities, me = reg && reg[this._config.entity];
      if (!me || !me.device_id) return null;
      const r = Object.values(reg).find((e) => e.device_id === me.device_id && e.entity_id.startsWith("select.") && /auto_start_stop/.test(e.entity_id));
      return r ? r.entity_id : null;
    }
    _assModeLbl(o) {
      const k = String(o || "").toLowerCase().replace(/^hvac_/, "");
      if (MODE_META[k]) return modeLabel(k);
      const st = this._hass && this._hass.states[this._assModeSel()];
      try { if (st && this._hass.formatEntityState) return this._hass.formatEntityState(st, o); } catch (e) { /* ancienne version de HA */ }
      return String(o);
    }
    _assModeIcon(o) { const k = String(o || "").toLowerCase().replace(/^hvac_/, ""); return (MODE_META[k] && MODE_META[k].icon) || "mdi:power"; }
    // interrupteur de bypass de l'inhibition (fourni par le plugin d'inhibition, à choisir dans l'éditeur)
    _inhSwitch() { return this._config.vtherm_inhibition_bypass || null; }
    // raison normalisée : clé connue (window, ass…) ou valeur brute
    _reasonKey(r) {
      if (!r) return null;
      const k = String(r).trim().toLowerCase().replace(/^hvac_(off_)?/, "");
      if (k === "manual" || k === "manuel" || k === "none" || k === "") return null;
      return VT_REASON[k] || k;
    }
    _reasonTxt(k) {
      if (!k) return null;
      return has("rs_" + k) ? tr("rs_" + k) : k.replace(/_/g, " ");
    }
    _lbl(attr, v) { return attrLabel(this._hass, this._so, attr, v); }

    // ---------- helpers ----------
    _range() {
      const a = this._so ? this._so.attributes : {};
      let min = Number(a.min_temp ?? 7), max = Number(a.max_temp ?? 35);
      const step = Number(a.target_temp_step || (this._hass?.config?.unit_system?.temperature === "°F" ? 1 : 0.5));
      // consignes mini / maxi de la carte, dans les limites de l'appareil
      const cMin = parseFloat(this._config.min_temp), cMax = parseFloat(this._config.max_temp);
      const lo = isNaN(cMin) ? min : Math.max(min, cMin), hi = isNaN(cMax) ? max : Math.min(max, cMax);
      if (lo < hi) { min = lo; max = hi; }
      return { min, max, step };
    }
    _target() {
      const t = this._val("temperature");
      return t == null ? null : Number(t);
    }
    _frac(t) {
      const { min, max } = this._range();
      return max === min ? 0 : clamp((t - min) / (max - min), 0, 1);
    }
    _tempFromPointer(cx, cy) {
      const svg = this.$("dial");
      const r = svg.getBoundingClientRect();
      const sc = 200 / r.width;
      const dx = (cx - r.left) * sc - C, dy = (cy - r.top) * sc - C;
      let a = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (a < 0) a += 360;
      let raw = a - START;
      if (raw < 0) raw += 360;
      if (raw > SWEEP) raw = raw - SWEEP < 360 - raw ? SWEEP : 0;
      const { min, max, step } = this._range();
      return clamp(Math.round((min + (raw / SWEEP) * (max - min)) / step) * step, min, max);
    }
    _fanOnly() {
      return this._val("state") === "fan_only" && this._target() == null && this._so && (this._so.attributes.fan_modes || []).length > 0;
    }
    _nudge(dir) {
      if (this._guard()) return;
      if (this._fanOnly()) {
        const list = this._so.attributes.fan_modes, i = list.indexOf(this._val("fan_mode"));
        const n = list[clamp((i < 0 ? 0 : i) + dir, 0, list.length - 1)];
        if (n && n !== this._val("fan_mode")) { this._set("fan_mode", n); this._call("set_fan_mode", { fan_mode: n }); this._render(); }
        return;
      }
      const cur = this._pendingT ?? this._target();
      if (cur == null) return;
      const { min, max, step } = this._range();
      const t = clamp(Math.round((clamp(cur, min, max) + (cur < min || cur > max ? 0 : dir * step)) / step) * step, min, max);
      this._commitTemp(t, 700);
    }
    _commitTemp(t, delay) {
      this._pendingT = t;
      if (this._config.main_value === "current") {   // consigne en grand le temps du réglage (#14)
        this._adjUntil = Date.now() + 2500;
        clearTimeout(this._adjTimer); this._adjTimer = setTimeout(() => this._so && this._render(), 2600);
      }
      this._set("temperature", t);
      this._render();
      clearTimeout(this._tTimer);
      this._tTimer = setTimeout(() => {
        this._pendingT = null;
        this._call("set_temperature", { temperature: t });
      }, delay);
    }

    // ---------- render ----------
    _render() {
      const $ = this.$;
      const so = this._so;
      const card = this._card;
      card.dataset.theme = this._themeName();
      if (!so || so.state === "unavailable") {
        card.classList.add("unavail");
        $("name").textContent = this._config.name || (so && so.attributes.friendly_name) || this._config.entity;
        return;
      }
      card.classList.remove("unavail");
      this._renderLock();
      const a = so.attributes;
      const mode = this._val("state");
      const meta = MODE_META[mode] || MODE_META.off;
      const action = this._opt.state ? (mode === "off" ? "off" : "pending") : a.hvac_action || (mode === "off" ? "off" : null);
      const active = ["heating", "cooling", "drying", "fan", "preheating"].includes(action) || (action == null && mode !== "off") || action === "pending";

      card.dataset.mode = mode;
      card.dataset.layout = this._compact ? "compact" : "full";
      card.dataset.fx = mode === "heat" || mode === "cool" ? mode : mode === "fan_only" ? "fan" : mode === "off" ? "none" : "soft";
      card.classList.toggle("active", active && mode !== "off");
      card.style.setProperty("--m", meta.rgb);
      const g = ARC_GRAD[mode] || ARC_GRAD.off;
      $("g0").setAttribute("stop-color", g[0]);
      $("g1").setAttribute("stop-color", g[1]);

      $("name").textContent = this._config.name || a.friendly_name || this._config.entity;
      const hm = a.hvac_modes || [];
      const bicon = mode === "off" ? (this._config.icon || (hm.includes("heat") && !hm.includes("cool") ? "mdi:radiator-off" : "mdi:power")) : meta.icon;
      $("bicon").setAttribute("icon", bicon);
      const fm = metaOf(FAN_META, this._val("fan_mode"));
      card.style.setProperty("--spin", `${fm && fm.speed ? fm.speed : 1.6}s`);

      let status;
      if (mode === "off") status = modeLabel("off");
      else if (action === "pending") status = modeLabel(mode in MODE_META ? mode : "off") + "…";
      else if (action === "off") status = tr("act_idle");   // mode actif mais rien en cours (VTherm envoie « off ») : « En veille » (#11)
      else status = action && has("act_" + action) ? tr("act_" + action) : modeLabel(mode in MODE_META ? mode : "off");
      const vt = this._vtOn() ? this._vt() : null;
      if (vt) {
        const whyKey = this._reasonKey(vt.offReason) || this._reasonKey(vt.modeReason);
        if (vt.safety) status = tr("st_safety");
        else if (vt.heatFail || vt.coolFail) status = vt.heatFail ? tr("st_heat_fail") : tr("st_cool_fail");
        else if (vt.inhibited && !vt.inhBypass) status = tr("st_inhibited");
        else if (vt.overpower) status = tr("st_overpower");
        else if (vt.winOpen && !vt.bypass) status = mode === "off" || whyKey === "window" ? tr("st_win_off") : tr("st_win");
        else if (mode === "off" && whyKey) status = tr("st_stopped", this._reasonTxt(whyKey));
        else if (vt.timed && vt.timed.preset) status = tr("st_timed", this._lbl("preset_mode", vt.timed.preset), durTxt(vt.timed.remaining ?? 0));
        card.dataset.vt = vt.safety || vt.overpower || vt.heatFail || vt.coolFail ? "alert" : (vt.winOpen && !vt.bypass) || (vt.inhibited && !vt.inhBypass) ? "warn" : "";
      } else card.dataset.vt = "";
      $("status").textContent = status;
      if (vt) card.dataset.why = this._whyList(vt).length ? "msg" : "on"; else delete card.dataset.why;
      this._renderBadges(vt);
      this._renderPower(vt);
      // décompte du preset temporisé entre deux mises à jour
      if (vt && vt.timed) { if (!this._tick) this._tick = setInterval(() => this._so && this._render(), 30000); }
      else if (this._tick) { clearInterval(this._tick); this._tick = null; }

      const t = this._drag ? this._drag.t : this._target();
      this._paintDial(t);
      const cur = this._curTemp();
      $("curt").textContent = cur != null ? `${fmt(cur, 0.1)}°` : "–";
      $("hcurt").textContent = cur != null ? `${fmt(cur, 0.1)}°` : "–";
      this._swapCenter(t, cur);
      if (cur != null) {
        const p = polar(START + this._frac(Number(cur)) * SWEEP);
        $("cur").setAttribute("cx", p.x.toFixed(1));
        $("cur").setAttribute("cy", p.y.toFixed(1));
        $("cur").style.display = "";
      } else $("cur").style.display = "none";

      this._renderModes(mode, a.hvac_modes || []);
      this._renderChips(a);
      if (this._sheet && this._sheet !== "lock") this._renderSheet();
    }

    disconnectedCallback() { if (this._tick) { clearInterval(this._tick); this._tick = null; } }

    _renderBadges(vt) {
      const box = this.$("vb");
      const out = [];
      const pill = (cls, icon, label, title, extra = "") =>
        `<span class="pill ${cls}" title="${esc(title || label || "")}"><ha-icon icon="${esc(icon)}"></ha-icon>${label ? `<span>${esc(label)}</span>` : ""}${extra}</span>`;
      if (vt) {
        if (vt.safety) out.push(pill("bad", "mdi:shield-alert", tr("p_safety"), tr("p_safety_t")));
        if (vt.overpower) out.push(pill("bad", "mdi:flash-alert", tr("p_overpower"), tr("p_overpower_t")));
        if (vt.heatFail) out.push(pill("bad", "mdi:radiator-disabled", tr("p_fail"), tr("p_heat_fail_t")));
        if (vt.coolFail) out.push(pill("bad", "mdi:snowflake-alert", tr("p_fail"), tr("p_cool_fail_t")));
        // pastilles actives : un toucher sur l'icône agit sur Versatile Thermostat
        const act = (cls, icon, label, title, a) => `<button class="pill ${cls}" data-act="${a}" title="${esc(title)}"><ha-icon icon="${esc(icon)}"></ha-icon>${label ? `<span>${esc(label)}</span>` : ""}</button>`;
        const inhSw = this._inhSwitch();
        if (vt.inhibited || vt.inhBypass) {
          if (vt.inhBypass) out.push(inhSw ? act("info", "mdi:debug-step-over", tr("p_inh_bypass"), tr("p_inh_bypass_tap"), "inh-off") : pill("info", "mdi:debug-step-over", tr("p_inh_bypass"), tr("p_inh_bypass_t")));
          else out.push(inhSw ? act("warn", "mdi:pause-circle-outline", tr("p_inh"), tr("p_inh_tap"), "inh-on") : pill("warn", "mdi:pause-circle-outline", tr("p_inh"), tr("p_inh_t")));
        }
        if (vt.winCfg) {
          if (vt.bypass) out.push(act("info", "mdi:window-open-variant", tr("p_win_bypass"), tr("p_win_bypass_tap"), "bypass-off"));
          else if (vt.winOpen) out.push(act("warn", "mdi:window-open-variant", tr("p_win_open"), tr("p_win_open_tap"), "bypass-on"));
          else out.push(act("dim", "mdi:window-closed-variant", "", tr("p_win_closed_tap"), "bypass-on"));
        }
        if (vt.assCfg) {
          const sw = this._assSwitch(), on = this._assOpt && Date.now() - this._assOpt.ts < OPTIMISTIC_TTL ? this._assOpt.on : vt.assOn;
          const cls = vt.assStopped ? "warn" : on ? "info" : "dim", label = vt.assStopped ? tr("p_ass_stop") : "";
          const title = vt.assStopped ? tr("p_ass_stopped_t") : on ? tr("p_ass_on_t") : tr("p_ass_off_t");
          out.push(sw ? act(cls, on ? "mdi:power-cycle" : "mdi:sync-off", label, tr(on ? "p_tap_off" : "p_tap_on", title), on ? "ass-off" : "ass-on")
            : pill(cls, on ? "mdi:power-cycle" : "mdi:sync-off", label, title));
          // mode utilisé à l'arrêt automatique (#13) : visible quand la fonction est active
          const ms = this._assModeSel(), mst = ms && this._hass.states[ms];
          if (on && mst && Array.isArray(mst.attributes.options) && mst.attributes.options.length) {
            const v = this._assModeOpt && Date.now() - this._assModeOpt.ts < OPTIMISTIC_TTL ? this._assModeOpt.v : mst.state;
            out.push(act(vt.assStopped ? "warn" : "dim", this._assModeIcon(v), "→ " + this._assModeLbl(v), tr("ass_mode_t", this._assModeLbl(v)), "ass-mode"));
          }
        }
        if (vt.presCfg) out.push(vt.present ? pill("ok", "mdi:home-account", "", tr("p_present_t")) : pill("warn", "mdi:home-export-outline", tr("p_away"), tr("p_away_t")));
        if (vt.motCfg) out.push(vt.motion ? pill("ok", "mdi:motion-sensor", tr("p_motion"), tr("p_motion_t")) : pill("dim", "mdi:motion-sensor-off", "", tr("p_no_motion_t")));
      }
      for (const id of (this._config.badges || []).slice(0, 4)) {
        const st = this._hass && this._hass.states[id];
        if (!st) continue;
        const a = st.attributes, dom = id.split(".")[0];
        const on = ["on", "open", "home", "detected", "true"].includes(st.state);
        const icon = a.icon || (dom === "binary_sensor" ? ({ window: "mdi:window-open-variant", door: "mdi:door-open", opening: "mdi:window-open-variant", motion: "mdi:motion-sensor",
          occupancy: "mdi:home-account", presence: "mdi:home-account", battery: "mdi:battery-alert", problem: "mdi:alert-circle" }[a.device_class] || "mdi:checkbox-blank-circle-outline")
          : dom === "sensor" ? ({ humidity: "mdi:water-percent", temperature: "mdi:thermometer", power: "mdi:flash", co2: "mdi:molecule-co2", battery: "mdi:battery" }[a.device_class] || "mdi:eye")
          : dom === "person" || dom === "device_tracker" ? "mdi:account" : "mdi:information-outline");
        const name = a.friendly_name || id;
        const numeric = st.state !== "" && !isNaN(Number(st.state));
        const label = numeric ? `${dec(Number(st.state))}${a.unit_of_measurement ? " " + a.unit_of_measurement : ""}` : on ? name : "";
        out.push(`<button class="pill ${numeric ? "info" : on ? "warn" : "dim"}" data-ent="${esc(id)}" title="${esc(name)}"><ha-icon icon="${esc(icon)}"></ha-icon>${label ? `<span>${esc(label)}</span>` : ""}</button>`);
      }
      const html = out.join("");
      if (box._html !== html) { box._html = html; box.innerHTML = html; }
      box.style.display = out.length ? "" : "none";
    }
    _renderPower(vt) {
      const box = this.$("vp");
      // informations affichées sous les commandes (option vtherm_info : heat, power, ext, bar)
      const show = Array.isArray(this._config.vtherm_info) ? this._config.vtherm_info : ["heat", "power", "ext", "bar"];
      const running = this._so && this._so.state !== "off";   // éteint : pas de chauffe à afficher
      const pct = vt && running && vt.onPct != null && show.includes("heat") ? clamp(vt.onPct, 0, 100) : null;
      const w = vt && running && show.includes("power") && vt.meanPower != null && !isNaN(Number(vt.meanPower)) ? Math.round(Number(vt.meanPower)) : null;
      const ext = vt && show.includes("ext") ? vt.ext : null;
      const bar = vt && vt.onPct != null && show.includes("bar") && this._so.state !== "off";
      if (!vt || (pct == null && w == null && ext == null && !bar)) { box.style.display = "none"; return; }
      box.style.display = "";
      const heatTxt = pct != null ? `${tr("pw_heat", Math.round(pct))}${w != null ? ` · ${w} W` : ""}` : w != null ? `${w} W` : "";
      const parts = [];
      if (heatTxt) parts.push(`<span><ha-icon icon="mdi:radiator"></ha-icon>${heatTxt}</span>`);
      if (ext != null) parts.push(`<span><ha-icon icon="mdi:home-export-outline"></ha-icon>${tr("pw_ext", fmt(ext, 0.1))}</span>`);
      box.innerHTML = `${parts.length ? `<div class="vpt">${parts.join("")}</div>` : ""}${bar ? `<div class="vpb"><i style="width:${clamp(vt.onPct, 0, 100)}%"></i></div>` : ""}`;
    }

    _curTemp() {
      const ss = this._ss;
      if (this._config.temperature_sensor) {
        const v = ss ? parseFloat(ss.state) : NaN;
        if (!isNaN(v)) return v;
      }
      const c = this._so && this._so.attributes.current_temperature;
      return c == null || isNaN(Number(c)) ? null : Number(c);
    }
    // option main_value: current (#14) : la température mesurée en grand au centre, la consigne en dessous.
    // Pendant un réglage (glisser, + / −), la consigne repasse en grand quelques secondes.
    _swapCenter(t, cur) {
      const $ = this.$, curb = $("curb"), ic = curb && curb.querySelector("ha-icon");
      const want = this._config.main_value === "current" && !this._fanOnly() && t != null && cur != null && !this._drag && !(this._adjUntil > Date.now());
      this._card.classList.toggle("swapped", want);
      if (ic) ic.setAttribute("icon", want ? "mdi:target" : "mdi:home-thermometer-outline");
      if (curb) curb.title = want ? tr("setpoint_t") : tr("history");
      if (!want) return;
      const [ip, dp] = fmt(cur, 0.1).split(I18N[LANG].dec);
      $("tgt").textContent = ip;
      $("dec").textContent = dp != null ? I18N[LANG].dec + dp : "";
      $("lbl").textContent = this._val("state") === "off" ? modeLabel("off") : tr("room_temp");
      const { step } = this._range();
      $("curt").textContent = `${fmt(t, step)}°`;
    }
    _paintDial(t) {
      const $ = this.$;
      const mode = this._val("state");
      const { step: st } = this._range();
      const fanOnly = this._fanOnly();
      const fanTxt = fanOnly ? this._lbl("fan_mode", this._val("fan_mode")) : "";
      $("ctgt").textContent = t == null ? (fanOnly ? fanTxt : "–") : fmt(t, st);
      this._card.classList.toggle("fanonly", fanOnly);
      if (t == null && fanOnly) {
        const list = this._so.attributes.fan_modes, i = Math.max(0, list.indexOf(this._val("fan_mode")));
        $("tgt").textContent = fanTxt;
        $("dec").textContent = "";
        $("lbl").textContent = tr("fan");
        const at = START + (list.length > 1 ? i / (list.length - 1) : 1) * SWEEP;
        $("val").setAttribute("d", arc(START, at));
        const p = polar(at);
        $("knob").style.display = "";
        $("knob").setAttribute("cx", p.x.toFixed(2));
        $("knob").setAttribute("cy", p.y.toFixed(2));
        return;
      }
      if (t == null) {
        $("tgt").textContent = "–";
        $("dec").textContent = "";
        $("val").setAttribute("d", "");
        $("knob").style.display = "none";
        return;
      }
      $("knob").style.display = "";
      const { step } = this._range();
      const [ip, dp] = fmt(t, step).split(I18N[LANG].dec);
      $("tgt").textContent = ip;
      $("dec").textContent = dp != null ? I18N[LANG].dec + dp : "";
      const at = START + this._frac(t) * SWEEP;
      // Chauffage : remplissage min → consigne ; clim : consigne → max
      const d = mode === "cool" ? arc(at, START + SWEEP) : arc(START, at);
      $("val").setAttribute("d", d);
      const p = polar(at);
      $("knob").setAttribute("cx", p.x.toFixed(2));
      $("knob").setAttribute("cy", p.y.toFixed(2));
      $("lbl").textContent = mode === "off" ? modeLabel("off") : tr("setpoint");
    }

    _renderModes(mode, modes) {
      const box = this.$("modes");
      const list = PRIMARY_MODES.filter((m) => m === "off" || modes.includes(m));
      if (!list.includes(mode) && MODE_META[mode]) list.push(mode);
      const key = list.join(",") + "|" + mode;
      if (box._key === key) return;
      box._key = key;
      box.innerHTML = "";
      box.dataset.n = list.length;
      list.forEach((m) => {
        const mm = MODE_META[m];
        const b = document.createElement("button");
        b.className = "mode" + (m === mode ? " on" : "");
        b.style.setProperty("--c", mm.rgb);
        // libellé court de la carte ; nom complet (traduction Home Assistant) en info-bulle
        let full = modeLabel(m);
        if (this._hass && typeof this._hass.formatEntityState === "function") {
          try { const f = this._hass.formatEntityState(this._so, m); if (f && f !== m) full = f; } catch (e) { /* ancienne version de Home Assistant */ }
        }
        b.title = full;
        b.innerHTML = `<ha-icon icon="${esc(mm.icon)}"></ha-icon><span>${esc(modeLabel(m))}</span>`;
        b.addEventListener("click", () => {
          if (m === this._val("state") || this._guard()) return;
          this._set("state", m);
          this._call("set_hvac_mode", { hvac_mode: m });
          this._render();
        });
        box.appendChild(b);
      });
    }

    _chipDefs(a) {
      const defs = [];
      const cfg = this._config;
      if (cfg.show_fan && a.fan_modes && a.fan_modes.length) {
        const v = this._val("fan_mode");
        const m = metaOf(FAN_META, v) || { icon: "mdi:fan" };
        defs.push({ key: "fan", title: tr("fan"), icon: m.icon, label: this._lbl("fan_mode", v), spin: true, value: v, options: a.fan_modes, meta: FAN_META, attr: "fan_mode", service: "set_fan_mode" });
      }
      if (cfg.show_preset && a.preset_modes && a.preset_modes.length) {
        const v = this._val("preset_mode") || "none";
        const m = metaOf(PRESET_META, v) || { icon: "mdi:star-outline" };
        // préréglages masqués (#10) : plus proposés, mais celui en cours reste affiché s'il est actif
        const hidden = Array.isArray(cfg.hidden_presets) ? cfg.hidden_presets : [];
        const opts = a.preset_modes.filter((p) => !hidden.includes(p) || p === v);
        defs.push({ key: "preset", title: tr("preset"), icon: m.icon, label: this._lbl("preset_mode", v), hot: v !== "none", value: v, options: opts, meta: PRESET_META, attr: "preset_mode", service: "set_preset_mode" });
      }
      if (this._vtOn() && a.preset_modes && a.preset_modes.length) {
        const vt = this._vt();
        const tm = vt.timed;
        defs.push({ key: "timed", title: tr("timed"), icon: "mdi:timer-outline", label: tm ? durTxt(tm.remaining ?? 0) : tr("timer"), hot: !!tm, value: tm ? Math.round(tm.remaining ?? 0) : "", options: [], custom: "timed" });
      }
      if (cfg.show_swing && a.swing_modes && a.swing_modes.length) {
        const v = this._val("swing_mode");
        defs.push({ key: "swing", title: tr("swing_v"), icon: "mdi:arrow-up-down", label: this._lbl("swing_mode", v), hot: v && v !== "stop" && v !== "off", value: v, options: a.swing_modes, meta: SWING_META, attr: "swing_mode", service: "set_swing_mode" });
      }
      if (cfg.show_swing && a.swing_horizontal_modes && a.swing_horizontal_modes.length) {
        const v = this._val("swing_horizontal_mode");
        defs.push({ key: "swingh", title: tr("swing_h"), icon: "mdi:arrow-left-right", label: this._lbl("swing_horizontal_mode", v), hot: v && v !== "stop" && v !== "off", value: v, options: a.swing_horizontal_modes, meta: SWING_META, attr: "swing_horizontal_mode", service: "set_swing_horizontal_mode" });
      }
      return defs;
    }

    _renderChips(a) {
      const box = this.$("chips");
      const defs = this._chipDefs(a);
      this._defs = defs;
      box.style.display = defs.length ? "" : "none";
      box.dataset.n = defs.length;
      const key = defs.map((d) => d.key + ":" + d.value + ":" + d.icon + ":" + d.label).join("|");
      if (box._key === key) return;
      box._key = key;
      box.innerHTML = "";
      defs.forEach((d) => {
        const b = document.createElement("button");
        b.className = "chip" + (d.hot ? " hot" : "") + (d.spin ? " fan" : "");
        b.title = d.title;
        b.innerHTML = `<ha-icon icon="${esc(d.icon)}"></ha-icon><span>${esc(d.label)}</span>`;
        b.addEventListener("click", () => { if (this._guard()) return; this._sheet = d.key; this._renderSheet(); });
        box.appendChild(b);
      });
    }

    _renderSheet() {
      const $ = this.$;
      if (this._sheet === "lock") return this._renderLockSheet($("opts"));
      if (this._sheet === "why") {
        if (!this._vtOn()) return this._closeSheet();
        $("sheet-t").textContent = tr("why");
        return this._renderWhySheet($("opts"));
      }
      if (this._sheet === "assmode") return this._renderAssModeSheet($("opts"));
      const d = (this._defs || []).find((x) => x.key === this._sheet);
      if (!d) return this._closeSheet();
      $("sheet-t").textContent = d.title;
      const box = $("opts");
      if (d.custom === "timed") return this._renderTimedSheet(box);
      box.innerHTML = "";
      box.dataset.n = d.options.length;
      d.options.forEach((o) => {
        const m = metaOf(d.meta, o) || { icon: d.icon };
        const b = document.createElement("button");
        b.className = "opt" + (o === d.value ? " on" : "");
        b.innerHTML = `<ha-icon icon="${esc(m.icon)}"></ha-icon><span>${esc(this._lbl(d.attr, o))}</span>`;
        b.addEventListener("click", () => {
          this._set(d.attr, o);
          this._call(d.service, { [d.attr]: o });
          this._closeSheet();
          this._render();
        });
        box.appendChild(b);
      });
      this._card.classList.add("sheet-open");
    }
    // volet « mode quand l'auto-start/stop arrête » (#13) : les choix de la liste VTherm
    _renderAssModeSheet(box) {
      const sel = this._assModeSel(), st = sel && this._hass.states[sel];
      if (!st || !Array.isArray(st.attributes.options)) return this._closeSheet();
      this.$("sheet-t").textContent = tr("ass_mode_title");
      const cur = this._assModeOpt && Date.now() - this._assModeOpt.ts < OPTIMISTIC_TTL ? this._assModeOpt.v : st.state;
      const key = st.attributes.options.join("|") + "#" + cur;
      if (box._ass === key && this._card.classList.contains("sheet-open")) return;
      box._ass = key;
      box.innerHTML = "";
      box.dataset.n = st.attributes.options.length;
      st.attributes.options.forEach((o) => {
        const b = document.createElement("button");
        b.className = "opt" + (o === cur ? " on" : "");
        b.innerHTML = `<ha-icon icon="${esc(this._assModeIcon(o))}"></ha-icon><span>${esc(this._assModeLbl(o))}</span>`;
        b.addEventListener("click", () => {
          this._assModeOpt = { v: o, ts: Date.now() };
          this._hass.callService("select", "select_option", { entity_id: sel, option: o });
          this._closeSheet();
          this._render();
        });
        box.appendChild(b);
      });
      this._card.classList.add("sheet-open");
    }
    // « Pourquoi cet état ? » : messages de VTherm traduits + états déduits (bypass, défauts, verrou…)
    _whyList(vt) {
      const a = this._so.attributes, sp = a.specific_states && typeof a.specific_states === "object" ? a.specific_states : {};
      const name = (id) => (this._hass && this._hass.states[id] && this._hass.states[id].attributes.friendly_name) || id;
      const out = [], seen = new Set();
      const add = (k, icon, sev, txt, sub) => { if (seen.has(k)) return; seen.add(k); out.push({ icon, sev, txt, sub }); };
      const msgs = Array.isArray(sp.messages) ? sp.messages.map(String) : [];
      if (vt.safety) msgs.unshift("safety_detected");
      if (vt.overpower) msgs.unshift("overpowering_detected");
      if (vt.offReason) msgs.push(String(vt.offReason));
      if (vt.modeReason && VT_MSG[String(vt.modeReason)]) msgs.push(String(vt.modeReason));
      if (vt.inhibited) msgs.push("hvac_off_inhibition");
      for (const k of msgs) {
        if (k === "hvac_off_manual" && this._so.state === "off" && msgs.length > 1) continue;
        const m = VT_MSG[k];
        let sub = "";
        if (k === "not_initialized" && Array.isArray(sp.not_initialized_entities) && sp.not_initialized_entities.length) sub = sp.not_initialized_entities.map(name).join(", ");
        if (k === "underlying_unavailable" && Array.isArray(sp.unavailable_underlying_entities)) sub = sp.unavailable_underlying_entities.map(name).join(", ");
        if (k === "target_temp_timed_preset" && vt.timed) sub = tr("w_remaining", this._lbl("preset_mode", vt.timed.preset), durTxt(vt.timed.remaining ?? 0));
        if (m) add(k, m[0], m[1], tr("msg_" + k), sub);
        else add(k, "mdi:information-outline", "info", cap(k.replace(/^hvac_(off_)?/, "")), "");
      }
      if (vt.timed && !seen.has("target_temp_timed_preset")) add("timed", "mdi:timer-sand", "info", tr("w_timed"), tr("w_remaining", this._lbl("preset_mode", vt.timed.preset), durTxt(vt.timed.remaining ?? 0)));
      if (vt.inhBypass) add("inh_bypass", "mdi:debug-step-over", "info", tr("w_inh_bypass"), "");
      if (vt.bypass) add("win_bypass", "mdi:window-open-variant", "info", tr("w_win_bypass"), "");
      if (vt.heatFail) add("heat_fail", "mdi:radiator-disabled", "bad", tr("w_heat_fail"), tr("w_heat_fail_sub"));
      if (vt.coolFail) add("cool_fail", "mdi:snowflake-alert", "bad", tr("w_cool_fail"), "");
      if (vt.locked) add("locked", "mdi:lock", "info", tr("w_locked"), "");
      if (sp.is_recalculate_scheduled === true) add("recalc", "mdi:progress-clock", "info", tr("w_recalc"), "");
      return out;
    }
    _renderWhySheet(box) {
      const vt = this._vt(), list = this._whyList(vt);
      box.dataset.n = "why";
      box.innerHTML = list.length ? list.map((m) => `<div class="why-r ${esc(m.sev)}"><ha-icon icon="${esc(m.icon)}"></ha-icon><div><b>${esc(m.txt)}</b>${m.sub ? `<small>${esc(m.sub)}</small>` : ""}</div></div>`).join("")
        : `<div class="why-r ok"><ha-icon icon="mdi:check-circle-outline"></ha-icon><div><b>${this._so.state === "off" ? modeLabel("off") : tr("w_none")}</b><small>${this._so.state === "off" ? tr("w_off_sub") : tr("w_ok_sub")}</small></div></div>`;
      this._card.classList.add("sheet-open");
    }
    _renderTimedSheet(box) {
      const a = this._so.attributes, vt = this._vt();
      const hidden = Array.isArray(this._config.hidden_presets) ? this._config.hidden_presets : [];
      const presets = (a.preset_modes || []).filter((p) => !["none", "power", "safety", "security"].includes(p) && !hidden.includes(p));
      if (!presets.includes(this._tpPreset)) this._tpPreset = presets.includes("boost") ? "boost" : presets.includes("comfort") ? "comfort" : presets[0];
      const lab = (p) => esc(this._lbl("preset_mode", p)), ic = (p) => esc((metaOf(PRESET_META, p) || { icon: "mdi:star-outline" }).icon);
      box.dataset.n = "timed";
      box.innerHTML = `
        ${vt.timed ? `<div class="tpa"><ha-icon icon="mdi:timer-sand"></ha-icon><span>${tr("tp_left", lab(vt.timed.preset), durTxt(vt.timed.remaining ?? 0))}${vt.timed.original ? tr("tp_then", lab(vt.timed.original)) : ""}</span><button class="tpc" data-cancel>${tr("tp_cancel")}</button></div>` : ""}
        <div class="tpl">${tr("preset")}</div>
        <div class="tpr">${presets.map((p) => `<button class="opt${p === this._tpPreset ? " on" : ""}" data-p="${esc(p)}"><ha-icon icon="${ic(p)}"></ha-icon><span>${lab(p)}</span></button>`).join("")}</div>
        <div class="tpl">${tr("tp_for")}</div>
        <div class="tpr">${VT_DURATIONS.map(([m, l]) => `<button class="opt dur" data-m="${m}"><ha-icon icon="mdi:timer-outline"></ha-icon><span>${l}</span></button>`).join("")}</div>`;
      box.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { this._tpPreset = b.dataset.p; this._renderTimedSheet(box); }));
      box.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => {
        this._vtCall("set_timed_preset", { preset: this._tpPreset, duration_minutes: Number(b.dataset.m) });
        this._set("preset_mode", this._tpPreset);
        this._closeSheet();
        this._render();
      }));
      const c = box.querySelector("[data-cancel]");
      if (c) c.addEventListener("click", () => { this._vtCall("cancel_timed_preset", {}); this._closeSheet(); this._render(); });
      this._card.classList.add("sheet-open");
    }
    _openGraph() {
      let dlg = document.querySelector("holm-climate-graph");
      if (!dlg) { dlg = document.createElement("holm-climate-graph"); document.body.appendChild(dlg); }
      dlg.open(this._hass, { lang: LANG, light: this._themeName() === "light",
        entity: this._config.entity,
        sensor: this._config.temperature_sensor || null,
        name: this._config.name || (this._so && this._so.attributes.friendly_name) || this._config.entity,
        hours: Number(this._config.graph_hours) || 24,
      });
    }
    _closeSheet() {
      this._sheet = null;
      this._card.classList.remove("sheet-open");
    }

    static css() {
      return `
      /* hauteur imposée seulement si la carte a une hauteur fixe (grid_options.rows chiffré) :
         en « auto », forcer 100 % provoquait des recalculs en boucle et un rebond du défilement sur iOS */
      :host { display: block; }
      :host([fixed-rows]) { height: 100%; }
      ha-card {
        display: block;
        --m: 150,160,178;
        /* thème sombre par défaut ; ha-card[data-theme="light"] (plus bas) pour le thème clair */
        --tx: #e6f2f5;
        --tx2: rgba(220,235,240,.62);
        --ov: 255,255,255;   /* teinte des voiles et bordures neutres (inversée en thème clair) */
        position: relative; overflow: hidden; box-sizing: border-box;
        container-type: inline-size;
        border-radius: var(--ha-card-border-radius, 20px);
        background: linear-gradient(160deg, rgba(20,28,38,.92), rgba(10,15,22,.96));
        border: 1px solid rgba(var(--m), .18);
        box-shadow: 0 8px 26px rgba(0,0,0,.35), inset 0 1px 0 rgba(var(--ov),.04);
        color: var(--tx);
        transition: border-color .6s, box-shadow .6s;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }
      :host([fixed-rows]) ha-card { height: 100%; }
      ha-card.active { box-shadow: 0 10px 30px rgba(0,0,0,.35), 0 0 22px -6px rgba(var(--m), .45), inset 0 1px 0 rgba(var(--ov),.05); }
      button { font: inherit; color: inherit; border: 0; background: none; cursor: pointer; padding: 0; -webkit-tap-highlight-color: transparent; }

      /* ---------- ambiance ---------- */
      .amb { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
      .glow { position: absolute; inset: 0; opacity: .35; transition: opacity .8s, background .8s; }
      ha-card[data-mode="heat"] .glow { background: radial-gradient(130% 75% at 50% 110%, rgba(255,110,30,.6), rgba(255,80,20,.16) 55%, transparent 78%); }
      ha-card[data-mode="cool"] .glow { background: radial-gradient(120% 70% at 50% -10%, rgba(80,190,255,.5), rgba(60,140,255,.12) 55%, transparent 75%); }
      ha-card[data-mode="fan_only"] .glow { background: radial-gradient(120% 80% at 0% 50%, rgba(45,212,160,.42), rgba(45,212,160,.1) 55%, transparent 78%); }
      ha-card[data-fx="soft"] .glow { background: radial-gradient(110% 70% at 50% 50%, rgba(var(--m),.35), transparent 70%); }
      ha-card[data-mode="off"] .glow { opacity: .9; background: radial-gradient(120% 80% at 85% 0%, rgba(148,163,184,.22), rgba(100,116,139,.07) 50%, transparent 75%), radial-gradient(90% 60% at 0% 100%, rgba(71,85,105,.25), transparent 70%); animation: breathe 9s ease-in-out infinite; }
      ha-card.active .glow { opacity: .85; animation: breathe 5s ease-in-out infinite; }
      @keyframes breathe { 50% { opacity: .6; } }

      .fx { position: absolute; inset: 0; opacity: 0; transition: opacity 1s; }
      ha-card.active[data-fx="heat"] .fx, ha-card.active[data-fx="cool"] .fx, ha-card.active[data-fx="fan"] .fx, ha-card[data-fx="none"] .fx { opacity: 1; }
      ha-card[data-fx="none"] .fx i {
        top: var(--y); width: calc(var(--s) * .8); height: calc(var(--s) * .8);
        background: radial-gradient(circle, rgba(203,213,225,.55), transparent 70%);
        animation: dust calc(var(--d) * 4) ease-in-out var(--dl) infinite;
      }
      ha-card[data-fx="none"] .fx i:nth-child(2n) { display: none; }
      @keyframes dust {
        0%, 100% { transform: translate(0, 0); opacity: 0; }
        20% { opacity: .5; }
        50% { transform: translate(var(--dx), -18px); opacity: .35; }
        80% { opacity: .45; }
      }
      ha-card.active[data-fx="fan"] .fx i {
        left: -60px; top: var(--y); width: calc(var(--s) * 9); height: 2px; border-radius: 2px;
        background: linear-gradient(90deg, transparent, rgba(170,255,225,.75), transparent);
        animation: breeze calc(var(--d) * var(--spin-k, .7)) linear var(--dl) infinite;
      }
      @keyframes breeze {
        0% { transform: translateX(0) translateY(0); opacity: 0; }
        15% { opacity: .85; }
        50% { transform: translateX(60cqw) translateY(calc(var(--dx) * .5)); }
        100% { transform: translateX(125cqw) translateY(0); opacity: 0; }
      }
      .fx i { position: absolute; width: var(--s); height: var(--s); border-radius: 50%; opacity: 0; }
      ha-card.active[data-fx="heat"] .fx i {
        bottom: -8px; background: radial-gradient(circle, #ffe0a0, #ff7a2a 60%, transparent 70%);
        box-shadow: 0 0 6px 1px rgba(255,120,40,.7);
        animation: rise var(--d) ease-in var(--dl) infinite;
      }
      ha-card.active[data-fx="cool"] .fx i {
        top: -8px; background: radial-gradient(circle, #fff, #bfe9ff 55%, transparent 72%);
        box-shadow: 0 0 5px rgba(170,225,255,.8);
        animation: fall calc(var(--d) * 1.5) linear var(--dl) infinite;
      }
      @keyframes rise {
        0% { transform: translate(0,0) scale(1); opacity: 0; }
        12% { opacity: .9; }
        100% { transform: translate(var(--dx), -260px) scale(.3); opacity: 0; }
      }
      @keyframes fall {
        0% { transform: translate(0,0) rotate(0); opacity: 0; }
        12% { opacity: .85; }
        50% { transform: translate(var(--dx), 160px); }
        100% { transform: translate(calc(var(--dx) * -1), 320px); opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) { .fx, .glow { animation: none !important; } .fx { display: none; } }

      /* ---------- layout ---------- */
      .wrap { position: relative; padding: 12px 12px 12px; display: flex; flex-direction: column; gap: 6px; height: 100%; box-sizing: border-box; }
      .head { display: flex; align-items: center; gap: 9px; min-width: 0; cursor: pointer; }
      .lockb { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 3px; height: 30px; min-width: 30px; padding: 0 7px; margin-left: auto; border: 0; border-radius: 10px; cursor: pointer;
        color: rgb(255,196,92); background: rgba(255,196,92,.14); box-shadow: inset 0 0 0 1px rgba(255,196,92,.3); font: 600 12px inherit; font-variant-numeric: tabular-nums; }
      .lockb.open { color: var(--tx2); background: rgba(var(--ov),.06); box-shadow: inset 0 0 0 1px rgba(var(--ov),.08); }
      .lockb ha-icon { --mdc-icon-size: 17px; }
      ha-card[data-layout] .lockb:not([style*="none"]) + .hcur { margin-left: 0; }
      .lockb.nudge { animation: lknudge .45s ease; }
      @keyframes lknudge { 20%,60% { transform: translateX(-3px) scale(1.08); } 40%,80% { transform: translateX(3px) scale(1.08); } }
      ha-card.locked .modes, ha-card.locked .chips, ha-card.locked .step, ha-card.locked .cstep, ha-card.locked #knob { opacity: .45; filter: saturate(.5); }
      ha-card.locked .dialbox > svg { touch-action: pan-y; }
      .lkf { display: flex; flex-direction: column; gap: 10px; grid-column: 1 / -1; }
      .lkf input { height: 42px; padding: 0 14px; border-radius: 12px; border: 1px solid rgba(var(--ov),.14); background: rgba(var(--ov),.06); color: inherit; font: 600 18px inherit; letter-spacing: .3em; text-align: center; outline: none; }
      .lkf input::placeholder { letter-spacing: normal; font-size: 14px; font-weight: 500; }
      .lkf input:focus { border-color: rgba(var(--m), .7); }
      .lkerr { color: rgb(255,110,110); font-size: 12px; text-align: center; }
      .badge {
        flex: 0 0 34px; width: 34px; height: 34px; border-radius: 11px; display: grid; place-items: center;
        background: rgba(var(--m), .16); color: rgb(var(--m));
        box-shadow: inset 0 0 0 1px rgba(var(--m), .25);
        transition: background .5s, color .5s;
      }
      .badge ha-icon { --mdc-icon-size: 20px; }
      ha-card.active[data-mode="heat"] .badge ha-icon { animation: flick 1.6s ease-in-out infinite; }
      ha-card.active[data-mode="cool"] .badge ha-icon { animation: spin 6s linear infinite; }
      ha-card.active[data-mode="fan_only"] .badge ha-icon { animation: spin var(--spin) linear infinite; }
      @keyframes flick { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(255,140,40,.6)); } 50% { transform: scale(1.1) translateY(-1px); filter: drop-shadow(0 0 6px rgba(255,140,40,.9)); } }
      @keyframes spin { to { transform: rotate(360deg); } }
      .ttl { min-width: 0; flex: 1; }
      .name { font-size: 14px; font-weight: 700; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .status { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--tx2); margin-top: 2px; white-space: nowrap; overflow: hidden; }
      #status { overflow: hidden; text-overflow: ellipsis; }
      .why { display: none; --mdc-icon-size: 14px; flex: 0 0 auto; opacity: .75; }
      ha-card[data-why] .why { display: inline-flex; }
      ha-card[data-why] .status { cursor: pointer; }
      ha-card[data-why="msg"] .why { opacity: 1; color: rgb(120,190,255); }
      ha-card[data-why="msg"][data-vt="warn"] .why { color: rgb(245,190,90); }
      ha-card[data-why="msg"][data-vt="alert"] .why { color: rgb(255,140,135); }
      .dot { flex: 0 0 6px; width: 6px; height: 6px; border-radius: 50%; background: rgba(var(--m), .7); }
      ha-card.active .dot { background: rgb(var(--m)); box-shadow: 0 0 6px rgb(var(--m)); animation: pulse 1.8s ease-in-out infinite; }
      @keyframes pulse { 50% { opacity: .35; } }

      .main { display: flex; flex-direction: column; gap: 10px; flex: 1; }

      /* ---------- dial ---------- */
      /* roue carrée de taille explicite (pas d'aspect-ratio : source de recalculs sur iOS) */
      .dialbox { position: relative; width: min(100%, 210px); height: min(calc(100cqi - 24px), 210px); margin: 0 auto; }
      .dialbox > svg { position: absolute; left: 0; top: 0; width: 100%; height: auto; overflow: visible; touch-action: none; }
      .track { fill: none; stroke: rgba(var(--ov),.08); stroke-width: 12; stroke-linecap: round; }
      .ticks line { stroke: rgba(var(--ov),.14); stroke-width: 1.4; stroke-linecap: round; }
      .val { fill: none; stroke-width: 12; stroke-linecap: round; filter: drop-shadow(0 0 5px rgba(var(--m), .55)); transition: d .25s; }
      ha-card[data-mode="off"] .val { filter: none; opacity: .45; }
      .cur { fill: #fff; stroke: rgba(0,0,0,.45); stroke-width: 1.5; }
      .knob { fill: #fff; stroke: rgb(var(--m)); stroke-width: 4; filter: drop-shadow(0 1px 4px rgba(0,0,0,.5)); cursor: grab; }
      ha-card[data-mode="off"] .knob { stroke: #8b93a5; }
      ha-card.dragging .knob { r: 12; }
      .hit { fill: none; stroke: transparent; stroke-width: 34; cursor: pointer; pointer-events: stroke; }

      .center { position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-52%); text-align: center; pointer-events: none; }
      .lbl { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--tx2); }
      .target { font-size: 40px; font-weight: 700; line-height: 1.05; letter-spacing: -.03em; font-variant-numeric: tabular-nums; transition: color .4s; white-space: nowrap; }
      .target .dec { font-size: .45em; font-weight: 600; letter-spacing: 0; }
      .target sup { font-size: .42em; font-weight: 500; vertical-align: top; position: relative; top: .3em; margin-left: 1px; color: var(--tx2); }
      ha-card[data-mode="off"] .target { color: rgba(230,240,245,.5); }
      ha-card.dragging .target { color: rgb(var(--m)); }
      ha-card.fanonly .target { font-size: 30px; color: rgb(var(--m)); }
      ha-card.fanonly .ctgt { font-size: 17px; color: rgb(var(--m)); min-width: 64px; }
      ha-card.fanonly .target sup, ha-card.fanonly .ctgt sup, ha-card.fanonly .cur { display: none; }
      .curtxt { display: inline-flex; align-items: center; gap: 2px; font-size: 12px; color: var(--tx2); margin-top: 2px; pointer-events: auto; padding: 2px 7px; border-radius: 9px; }
      .curbtn { cursor: pointer; transition: background .2s, color .2s; }
      .curbtn:hover { background: rgba(var(--ov),.08); color: var(--tx); }
      .curtxt ha-icon { --mdc-icon-size: 14px; }

      .step {
        position: absolute; top: 88%; width: 34px; height: 34px; margin: -17px 0 0 -17px; border-radius: 50%;
        display: grid; place-items: center;
        background: rgba(var(--ov),.07); box-shadow: inset 0 0 0 1px rgba(var(--ov),.1);
        transition: background .2s, transform .1s;
      }
      .step:active { transform: scale(.9); background: rgba(var(--m), .3); }
      .step ha-icon { --mdc-icon-size: 18px; }
      .minus { left: 37%; } .plus { left: 63%; }

      /* ---------- vue compacte ---------- */
      .hcur, .cstep { display: none; }
      .ctl { display: flex; flex-direction: column; gap: 8px; }
      ha-card[data-layout="compact"] .dialbox { display: none; }
      /* ligne 1 : nom · température · consigne — ligne 2 : modes · options */
      ha-card[data-layout="compact"] .wrap { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px 10px; padding: 10px 12px; }
      ha-card[data-layout="compact"] .main, ha-card[data-layout="compact"] .side, ha-card[data-layout="compact"] .ctl { display: contents; }
      ha-card[data-layout="compact"] .head { grid-column: 1; grid-row: 1; min-width: 0; }
      ha-card[data-layout="compact"] .cstep { grid-column: 2; grid-row: 1; }
      ha-card[data-layout="compact"] .modes { grid-column: 1; grid-row: 2; min-width: 0; }
      ha-card[data-layout="compact"] .chips { grid-column: 2; grid-row: 2; display: flex; gap: 5px; }
      ha-card[data-layout="compact"] .side:has(.chips[data-n="0"]) .modes { grid-column: 1 / -1; }
      ha-card[data-layout="compact"] .cstep, ha-card[data-layout="compact"] .chips { justify-self: end; }
      /* 3 options ou plus : sur leur propre ligne, pleine largeur */
      ha-card[data-layout="compact"] .chips:is([data-n="3"], [data-n="4"]) { grid-column: 1 / -1; grid-row: 3; justify-self: stretch; }
      ha-card[data-layout="compact"] .chips:is([data-n="3"], [data-n="4"]) .chip { flex: 1 1 0; min-width: 0; }
      ha-card[data-layout="compact"] .side:has(.chips:is([data-n="3"], [data-n="4"])) .modes { grid-column: 1 / -1; }
      ha-card[data-layout="compact"] .hcur { display: inline-flex; align-items: center; gap: 3px; flex: 0 0 auto; height: 30px; padding: 0 8px; margin-left: auto; border-radius: 10px; font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; background: rgba(var(--ov),.06); box-shadow: inset 0 0 0 1px rgba(var(--ov),.07); }
      ha-card[data-layout="compact"] .hcur ha-icon { --mdc-icon-size: 16px; color: var(--tx2); }
      ha-card[data-layout="compact"] .cstep { display: flex; align-items: center; gap: 2px; padding: 3px; border-radius: 13px; background: rgba(0,0,0,.28); box-shadow: inset 0 0 0 1px rgba(var(--ov),.06); }
      ha-card[data-layout="compact"] .mode { height: 34px; }
      ha-card[data-layout="compact"] .mode span { display: none; }
      ha-card[data-layout="compact"] .chip { height: 34px; padding: 0 9px; flex: 0 1 auto; }
      .cbtn { width: 30px; height: 30px; border-radius: 10px; display: grid; place-items: center; background: rgba(var(--ov),.06); transition: background .2s, transform .1s; }
      .cbtn:active { transform: scale(.92); background: rgba(var(--m), .3); }
      .cbtn ha-icon { --mdc-icon-size: 17px; }
      .ctgt { min-width: 50px; text-align: center; font-size: 19px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
      .ctgt sup { font-size: .5em; color: var(--tx2); font-weight: 500; }
      ha-card[data-mode="off"] .ctgt { color: rgba(230,240,245,.5); }
      /* très étroit : options sous les modes */
      @container (max-width: 360px) {
        ha-card[data-layout="compact"] .chips { grid-column: 1 / -1; grid-row: 3; justify-self: stretch; }
        ha-card[data-layout="compact"] .chip { flex: 1 1 0; min-width: 0; }
        ha-card[data-layout="compact"] .modes { grid-column: 1 / -1; }
        ha-card[data-layout="compact"] .hcur { display: none; }
        ha-card[data-layout="compact"] .status { overflow: visible; }
        ha-card[data-layout="compact"] .chips[data-n="4"] .chip span { display: none; }
        ha-card[data-layout="compact"] .chips[data-n="4"] .chip ha-icon { --mdc-icon-size: 20px; }
      }
      @container (min-width: 520px) {
        ha-card[data-layout="compact"] .mode span { display: inline; }
      }
      /* large : tout sur une ligne */
      @container (min-width: 760px) {
        ha-card[data-layout="compact"] .wrap { grid-template-columns: minmax(170px, 1fr) minmax(0, auto) auto auto; }
        ha-card[data-layout="compact"] .head { grid-column: 1; grid-row: 1; }
        ha-card[data-layout="compact"] .modes { grid-column: 2; grid-row: 1; }
        ha-card[data-layout="compact"] .cstep { grid-column: 3; grid-row: 1; }
        ha-card[data-layout="compact"] .chips { grid-column: 4; grid-row: 1; }
        ha-card[data-layout="compact"] .side:has(.chips[data-n="0"]) .modes { grid-column: 2; }
        ha-card[data-layout="compact"] .side:has(.chips:is([data-n="3"], [data-n="4"])) .modes { grid-column: 2; }
        ha-card[data-layout="compact"] .chips:is([data-n="3"], [data-n="4"]) { grid-column: 2 / -1; grid-row: 2; justify-self: end; }
        ha-card[data-layout="compact"] .chips:is([data-n="3"], [data-n="4"]) .chip { flex: 0 1 auto; }
        ha-card[data-layout="compact"] .mode { height: 38px; padding: 0 10px; }
        ha-card[data-layout="compact"] .chip { height: 38px; }
      }
      @container (min-width: 760px) and (max-width: 1000px) {
        ha-card[data-layout="compact"] .modes[data-n="4"] .mode span { display: none; }
      }

      /* ---------- modes ---------- */
      .side { display: flex; flex-direction: column; gap: 8px; }
      .modes { display: flex; gap: 4px; padding: 3px; border-radius: 14px; background: rgba(0,0,0,.28); box-shadow: inset 0 0 0 1px rgba(var(--ov),.06); }
      .mode {
        flex: 1 1 0; min-width: 0; height: 36px; border-radius: 11px; display: flex; align-items: center; justify-content: center; gap: 6px;
        color: var(--tx2); transition: background .3s, color .3s, box-shadow .3s;
      }
      .mode ha-icon { --mdc-icon-size: 20px; flex: 0 0 auto; }
      .mode span { display: none; font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .mode.on { color: #fff; background: linear-gradient(180deg, rgba(var(--c), .95), rgba(var(--c), .7)); box-shadow: 0 3px 12px -2px rgba(var(--c), .6); }
      .mode:not(.on):hover { background: rgba(var(--ov),.06); color: rgb(var(--c)); }

      /* ---------- chips ---------- */
      .chips { display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 5px; }
      .chips[data-n="3"], .chips[data-n="4"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .chips[data-n="3"] .chip:last-child { grid-column: span 2; }
      .chip {
        min-width: 0; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 0 6px;
        background: rgba(var(--ov),.06); box-shadow: inset 0 0 0 1px rgba(var(--ov),.07);
        font-size: 12px; font-weight: 600; color: var(--tx);
      }
      .chip ha-icon { --mdc-icon-size: 16px; flex: 0 0 auto; color: var(--tx2); }
      .chip span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .chip.hot { background: rgba(var(--m), .18); box-shadow: inset 0 0 0 1px rgba(var(--m), .35); }
      .chip.hot ha-icon { color: rgb(var(--m)); }
      ha-card.active .chip.fan ha-icon { color: rgb(var(--m)); animation: spin var(--spin) linear infinite; }
      ha-card[data-mode="off"] .chip { opacity: .7; }

      /* ---------- sheet ---------- */
      .sheet { position: absolute; inset: 0; z-index: 5; display: flex; align-items: flex-end; background: rgba(4,8,12,.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); opacity: 0; pointer-events: none; transition: opacity .2s; }
      ha-card.sheet-open .sheet { opacity: 1; pointer-events: auto; }
      .sheet-in { width: 100%; max-height: 100%; display: flex; flex-direction: column; box-sizing: border-box; padding: 10px; background: rgba(18,26,36,.97); border-top: 1px solid rgba(var(--m), .3); border-radius: 18px 18px 0 0; transform: translateY(20px); transition: transform .22s; }
      /* le volet ne dépasse jamais la carte : l'entête reste visible, le contenu défile */
      .sheet-in > .opts { min-height: 0; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; scrollbar-width: thin; }
      .sheet-h { flex: 0 0 auto; }
      .why-r { grid-column: 1 / -1; display: flex; align-items: flex-start; gap: 9px; padding: 8px 10px; border-radius: 12px; font-size: 12.5px; background: rgba(var(--ov),.05); }
      .why-r ha-icon { --mdc-icon-size: 18px; flex: 0 0 auto; color: var(--tx2); margin-top: 1px; }
      .why-r b { display: block; font-weight: 600; line-height: 1.3; }
      .why-r small { display: block; margin-top: 2px; font-size: 11px; color: var(--tx2); white-space: normal; }
      .why-r.info ha-icon { color: rgb(120,190,255); }
      .why-r.ok ha-icon { color: rgb(62,201,122); }
      .why-r.warn { background: rgba(245,166,35,.12); } .why-r.warn ha-icon { color: rgb(245,180,70); }
      .why-r.bad { background: rgba(239,83,80,.14); } .why-r.bad ha-icon { color: rgb(255,120,115); }
      ha-card.sheet-open .sheet-in { transform: none; }
      .sheet-h { display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: var(--tx2); text-transform: uppercase; letter-spacing: .06em; margin: 0 2px 8px; }
      .sheet-h button { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; background: rgba(var(--ov),.07); }
      .sheet-h ha-icon { --mdc-icon-size: 16px; }
      .opts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; }
      .opt { height: 34px; border-radius: 10px; display: flex; align-items: center; gap: 6px; padding: 0 8px; background: rgba(var(--ov),.05); font-size: 12.5px; font-weight: 600; min-width: 0; }
      .opt span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .opt ha-icon { --mdc-icon-size: 17px; color: var(--tx2); flex: 0 0 auto; }
      .opt.on { background: rgba(var(--m), .25); box-shadow: inset 0 0 0 1px rgba(var(--m), .55); }
      .opt.on ha-icon { color: rgb(var(--m)); }

      /* ---------- Versatile Thermostat et pastilles ---------- */
      .vb { display: flex; flex-wrap: wrap; gap: 5px; margin: 2px 0 6px; }
      .pill { display: inline-flex; align-items: center; gap: 4px; height: 24px; padding: 0 9px; border-radius: 12px; font-size: 11.5px; font-weight: 600; white-space: nowrap; background: rgba(var(--ov),.06); box-shadow: inset 0 0 0 1px rgba(var(--ov),.07); color: var(--tx); max-width: 100%; box-sizing: border-box; }
      .pill > span { overflow: hidden; text-overflow: ellipsis; }
      .pill ha-icon { --mdc-icon-size: 14px; flex: 0 0 auto; }
      .pill.dim { padding: 0 6px; color: var(--tx2); }
      .pill.ok ha-icon { color: rgb(62,201,122); }
      .pill.info { background: rgba(90,170,255,.12); box-shadow: inset 0 0 0 1px rgba(90,170,255,.3); }
      .pill.info ha-icon { color: rgb(120,190,255); }
      .pill.warn { background: rgba(245,166,35,.15); box-shadow: inset 0 0 0 1px rgba(245,166,35,.4); }
      .pill.warn ha-icon { color: rgb(245,180,70); }
      .pill.bad { background: rgba(239,83,80,.18); box-shadow: inset 0 0 0 1px rgba(239,83,80,.5); animation: pbad 2.4s ease-in-out infinite; }
      .pill.bad ha-icon { color: rgb(255,120,115); }
      @keyframes pbad { 50% { box-shadow: inset 0 0 0 1px rgba(239,83,80,.85), 0 0 10px -2px rgba(239,83,80,.6); } }
      .pill button { margin-left: 3px; height: 18px; padding: 0 7px; border-radius: 9px; font-size: 10.5px; font-weight: 700; background: rgba(var(--ov),.14); }
      .pill button:hover { background: rgba(var(--ov),.24); }
      button.pill { cursor: pointer; font: inherit; font-size: 11.5px; font-weight: 600; border: 0; }
      button.pill:hover { background: rgba(var(--ov),.1); }
      .vp { display: flex; flex-direction: column; gap: 5px; padding: 2px 2px 0; }
      .vpt { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 8px; font-size: 11.5px; color: var(--tx2); font-variant-numeric: tabular-nums; }
      .vpt span { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
      .vpt ha-icon { --mdc-icon-size: 14px; }
      .vpb { height: 4px; border-radius: 2px; background: rgba(var(--ov),.08); overflow: hidden; }
      .vpb i { display: block; height: 100%; border-radius: 2px; background: linear-gradient(90deg, rgba(255,140,60,.7), rgb(255,110,30)); transition: width .6s; }
      .tpa, .tpl, .tpr { grid-column: 1 / -1; }
      .tpa { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; padding: 8px 10px; border-radius: 12px; font-size: 12.5px; background: rgba(var(--m), .16); box-shadow: inset 0 0 0 1px rgba(var(--m), .35); }
      .tpa > span { flex: 1 1 auto; min-width: 0; }
      .tpa ha-icon { --mdc-icon-size: 18px; color: rgb(var(--m)); }
      .tpc { height: 26px; padding: 0 10px; border-radius: 13px; font-size: 11.5px; font-weight: 700; background: rgba(var(--ov),.12); }
      .tpl { margin: 4px 2px 0; font-size: 10.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--tx2); }
      .tpr { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 5px; }
      ha-card[data-vt="alert"] { border-color: rgba(239,83,80,.55); }
      ha-card[data-vt="warn"] { border-color: rgba(245,166,35,.45); }
      ha-card[data-vt="alert"] .status { color: rgb(255,140,135); }
      ha-card[data-vt="warn"] .status { color: rgb(245,190,90); }
      ha-card[data-layout="compact"] .vb { grid-column: 1 / -1; margin: 0; }
      ha-card[data-layout="compact"] .vp { display: none; }

      .na { display: none; position: absolute; inset: 0; place-items: center; background: rgba(8,12,18,.8); color: var(--tx2); font-size: 13px; }
      ha-card.unavail .na { display: grid; }

      /* ---------- narrow (2 cartes côte à côte sur mobile) ---------- */
      @container (max-width: 200px) {
        .wrap { padding: 10px 9px 10px; }
        .badge { flex-basis: 30px; width: 30px; height: 30px; border-radius: 10px; }
        .badge ha-icon { --mdc-icon-size: 18px; }
        .name { font-size: 13px; }
        .status { font-size: 11px; }
        .target { font-size: 34px; }
        .step { width: 30px; height: 30px; margin: -15px 0 0 -15px; }
        .minus { left: 36%; } .plus { left: 64%; }
        .lbl { font-size: 9px; }
        .mode { height: 34px; }
        .chip { font-size: 11px; padding: 0 4px; }
        .opts { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; }
        .opt { height: 30px; font-size: 11.5px; padding: 0 6px; gap: 4px; }
        .opt ha-icon { --mdc-icon-size: 15px; }
        .dialbox { height: min(calc(100cqi - 18px), 210px); }
        .sheet-in { padding: 8px; }
        .sheet-h { margin-bottom: 6px; }
        .tpa { padding: 6px 8px; font-size: 11.5px; }
        .tpa > ha-icon { display: none; }
        .tpl { margin-top: 2px; font-size: 10px; }
        .tpr { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; }
        .opt.dur ha-icon { display: none; }
        .opt.dur { justify-content: center; }
        .why-r { padding: 6px 8px; font-size: 11.5px; gap: 7px; }
      }
      /* ---------- medium : libellés des modes ---------- */
      @container (min-width: 300px) {
        .mode span { display: inline; }
        .modes[data-n="4"] .mode span { display: none; }
        .opts { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      }
      @container (min-width: 600px) { .modes[data-n="4"] .mode span { display: inline; } }
      /* ---------- large : roue à gauche, commandes à droite ---------- */
      @container (min-width: 420px) {
        /* pastilles à droite du titre : on gagne une ligne */
        ha-card:not([data-layout="compact"]) .wrap { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; column-gap: 10px; }
        ha-card:not([data-layout="compact"]) .head { grid-column: 1; grid-row: 1; }
        ha-card:not([data-layout="compact"]) .vb { grid-column: 2; grid-row: 1; margin: 0; justify-content: flex-end; max-width: 62cqi; }
        ha-card:not([data-layout="compact"]) .main { grid-column: 1 / -1; }
        .main { flex-direction: row; align-items: center; gap: 16px; }
        .dialbox { flex: 0 0 200px; width: 200px; height: 200px; margin: 0; }
        .side { flex: 1; min-width: 0; gap: 10px; }
        .mode { height: 42px; }
        .chip { height: 38px; font-size: 13px; }
        .chips[data-n] { grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); }
        .chips[data-n="3"] .chip:last-child { grid-column: auto; }
        .chips[data-n="4"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .opts { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      }
      /* ---------- thème clair (#12) ---------- */
      ha-card[data-theme="light"] {
        --tx: #16202a; --tx2: rgba(22,32,42,.6); --ov: 15,23,42;
        background: linear-gradient(160deg, rgba(255,255,255,.97), rgba(240,244,248,.98));
        box-shadow: 0 6px 20px rgba(15,23,42,.10), inset 0 1px 0 rgba(255,255,255,.9);
      }
      ha-card[data-theme="light"].active { box-shadow: 0 8px 24px rgba(15,23,42,.12), 0 0 22px -6px rgba(var(--m), .45), inset 0 1px 0 rgba(255,255,255,.9); }
      ha-card[data-theme="light"] .glow { opacity: .28; }
      ha-card[data-theme="light"].active .glow { opacity: .55; }
      ha-card[data-theme="light"][data-mode="off"] .glow { opacity: .6; }
      ha-card[data-theme="light"][data-fx="none"] .fx i { background: radial-gradient(circle, rgba(100,116,139,.45), transparent 70%); }
      ha-card[data-theme="light"].active[data-fx="cool"] .fx i { background: radial-gradient(circle, #9fd8ff, #5fb6f0 55%, transparent 72%); }
      ha-card[data-theme="light"].active[data-fx="fan"] .fx i { background: linear-gradient(90deg, transparent, rgba(20,170,130,.6), transparent); }
      ha-card[data-theme="light"] .cur { stroke: rgba(15,23,42,.35); }
      ha-card[data-theme="light"][data-mode="off"] .target, ha-card[data-theme="light"][data-mode="off"] .ctgt { color: rgba(22,32,42,.42); }
      ha-card[data-theme="light"] .modes, ha-card[data-theme="light"][data-layout="compact"] .cstep { background: rgba(15,23,42,.06); }
      ha-card[data-theme="light"] .sheet { background: rgba(226,232,240,.55); }
      ha-card[data-theme="light"] .sheet-in { background: rgba(255,255,255,.98); box-shadow: 0 -8px 24px rgba(15,23,42,.12); }
      ha-card[data-theme="light"] .na { background: rgba(255,255,255,.8); }
      `;
    }
  }

  class HolmClimateCardEditor extends HTMLElement {
    setConfig(config) {
      this._config = config || {};
      if (this._form && !this._self) this._form.data = this._config;
    }
    set hass(hass) {
      this._hass = hass;
      setLang(hass, this._config);
      if (this._lang !== LANG && this._form) { this._form.remove(); this._form = null; this._isVt = null; }   // libellés figés à la création
      this._lang = LANG;
      this._render();
    }
    connectedCallback() {
      this._render();
    }
    _render() {
      if (!this._hass || !this._config) return;
      if (!this._form) {
        const f = document.createElement("ha-form");
        f.schema = [
          { name: "entity", required: true, selector: { entity: { domain: "climate" } } },
          {
            type: "grid", name: "", schema: [
              { name: "name", selector: { text: {} } },
              { name: "icon", selector: { icon: {} } },
            ],
          },
          { name: "layout", selector: { select: { mode: "dropdown", options: [{ value: "full", label: tr("e_layout_full") }, { value: "compact", label: tr("e_layout_compact") }] } } },
          { name: "main_value", selector: { select: { mode: "dropdown", options: [{ value: "target", label: tr("e_main_target") }, { value: "current", label: tr("e_main_current") }] } } },
          { name: "language", selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("e_lang_auto") }, ...Object.entries(LANG_NAMES).map(([value, label]) => ({ value, label }))] } } },
          { name: "theme", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: tr("e_theme_auto") }, { value: "dark", label: tr("e_theme_dark") }, { value: "light", label: tr("e_theme_light") }] } } },
          {
            type: "grid", name: "", schema: [
              { name: "min_temp", selector: { number: { min: 5, max: 35, step: 0.5, mode: "box", unit_of_measurement: "°C" } } },
              { name: "max_temp", selector: { number: { min: 5, max: 35, step: 0.5, mode: "box", unit_of_measurement: "°C" } } },
            ],
          },
          { name: "temperature_sensor", selector: { entity: { domain: "sensor", device_class: "temperature" } } },
          { name: "graph_hours", selector: { number: { min: 1, max: 168, step: 1, mode: "box", unit_of_measurement: "h" } } },
          {
            type: "grid", name: "", schema: [
              { name: "show_fan", selector: { boolean: {} } },
              { name: "show_preset", selector: { boolean: {} } },
              { name: "show_swing", selector: { boolean: {} } },
            ],
          },
          { name: "badges", selector: { entity: { multiple: true } } },
          {
            type: "grid", name: "", schema: [
              { name: "lock", selector: { boolean: {} } },
              { name: "lock_delay", selector: { number: { min: 5, max: 600, step: 5, mode: "box", unit_of_measurement: "s" } } },
            ],
          },
        ];
        this._base = f.schema;
        f.computeLabel = (s) => (has("e_" + s.name) ? tr("e_" + s.name) : s.name);
        f.addEventListener("value-changed", (ev) => {
          ev.stopPropagation();
          const v = { ...ev.detail.value };
          for (const k of ["min_temp", "max_temp", "temperature_sensor", "name", "icon"]) if (v[k] === "" || v[k] == null) delete v[k];
          if (v.layout === "full") delete v.layout;
          if (!v.language) delete v.language;
          if (!v.theme || v.theme === "auto") delete v.theme;
          if (!Array.isArray(v.hidden_presets) || !v.hidden_presets.length) delete v.hidden_presets;
          if (Number(v.graph_hours) === 24) delete v.graph_hours;
          if (!v.lock) { delete v.lock; delete v.lock_delay; } else if (v.lock_delay == null || v.lock_delay === "" || Number(v.lock_delay) === 30) delete v.lock_delay;
          if (!v.vtherm) { delete v.vtherm; delete v.vtherm_info; delete v.vtherm_inhibition_bypass; delete v.vtherm_auto_start_stop; delete v.vtherm_auto_start_stop_mode; }
          if (Array.isArray(v.vtherm_info) && ["heat", "power", "ext", "bar"].every((k) => v.vtherm_info.includes(k)) && v.vtherm_info.length === 4) delete v.vtherm_info;
          for (const k of ["vtherm_inhibition_bypass", "vtherm_auto_start_stop", "vtherm_auto_start_stop_mode"]) if (!v[k]) delete v[k];
          if (v.main_value !== "current") delete v.main_value;
          if (!Array.isArray(v.badges) || !v.badges.length) delete v.badges;
          this._config = v;
          this._self = true;
          this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
          setTimeout(() => (this._self = false), 0);
        });
        this._form = f;
        this.appendChild(f);
      }
      const so = this._config.entity && this._hass.states[this._config.entity];
      const isVt = !!(so && HolmClimateCard.isVTherm(so.attributes)) || !!this._config.vtherm;
      const vtOn = isVt && !!this._config.vtherm;
      const presetList = (so && so.attributes.preset_modes) || [];
      const key = `${isVt}|${vtOn}|${presetList.join(",")}`;
      if (this._isVt !== key) {
        this._isVt = key;
        const vtExtra = [
          { name: "vtherm_info", selector: { select: { multiple: true, mode: "list", options: [
            { value: "heat", label: tr("e_info_heat") }, { value: "power", label: tr("e_info_power") },
            { value: "ext", label: tr("e_info_ext") }, { value: "bar", label: tr("e_info_bar") }] } } },
          { name: "vtherm_inhibition_bypass", selector: { entity: { domain: "switch" } } },
          { name: "vtherm_auto_start_stop", selector: { entity: { domain: "switch" } } },
          { name: "vtherm_auto_start_stop_mode", selector: { entity: { domain: "select" } } },
        ];
        // préréglages masqués (#10) : choix parmi ceux du thermostat
        const presetField = presetList.length ? [{ name: "hidden_presets", selector: { select: { multiple: true, mode: "list", options: presetList.map((p) => ({ value: p, label: has("preset_" + p) ? tr("preset_" + p) : p })) } } }] : [];
        const base = [...this._base, ...presetField];
        this._form.schema = isVt ? [...base, { name: "vtherm", selector: { boolean: {} } }, ...(vtOn ? vtExtra : [])] : base;
      }
      this._form.hass = this._hass;
      this._form.data = { show_fan: true, show_preset: true, show_swing: true, layout: "full", main_value: "target", theme: "auto", graph_hours: 24, lock_delay: 30, vtherm_info: ["heat", "power", "ext", "bar"], ...this._config };
    }
  }


  // ======================================================================
  // Fenêtre « historique de la température » (ouverte au toucher sur la température)
  class HolmClimateGraph extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._onKey = (e) => { if (e.key === "Escape") this.close(); };
      this._onResize = () => this._draw();
    }
    open(hass, o) {
      this._hass = hass;
      setLang(hass, o.lang ? { language: o.lang } : null);
      this._o = o;
      this._hours = o.hours;
      this._data = null;
      this._build();
      document.addEventListener("keydown", this._onKey);
      window.addEventListener("resize", this._onResize);
      requestAnimationFrame(() => this.shadowRoot.querySelector(".bg").classList.add("on"));
      this._load();
    }
    close() {
      document.removeEventListener("keydown", this._onKey);
      window.removeEventListener("resize", this._onResize);
      const bg = this.shadowRoot.querySelector(".bg");
      if (bg) bg.classList.remove("on");
      setTimeout(() => { this.shadowRoot.innerHTML = ""; }, 220);
    }
    _build() {
      const R = [[6, tr("g_hours", 6)], [24, tr("g_hours", 24)], [48, tr("g_hours", 48)], [168, tr("g_days", 7)]];
      if (!R.some(([h]) => h === this._hours)) R.push([this._hours, this._hours % 24 === 0 ? tr("g_days", this._hours / 24) : tr("g_hours", this._hours)]);
      R.sort((a, b) => a[0] - b[0]);
      this.shadowRoot.innerHTML = `<style>${HolmClimateGraph.css()}</style>
        <div class="bg${this._o.light ? " light" : ""}"><div class="dlg" role="dialog" aria-label="${tr("history")}">
          <div class="hd"><div class="tt"><b>${this._esc(this._o.name)}</b><small>${tr("g_temp")}${this._o.sensor ? tr("g_sensor") : ""}</small></div>
            <div class="rg">${R.map(([h, l]) => `<button data-h="${h}" class="${h === this._hours ? "on" : ""}">${l}</button>`).join("")}</div>
            <button class="x" aria-label="${tr("close")}"><ha-icon icon="mdi:close"></ha-icon></button></div>
          <div class="stats" id="stats"></div>
          <div class="ch" id="ch"><div class="ld">${tr("g_loading")}</div></div>
          <div class="lg"><span><i class="lt"></i>${tr("g_temp")}</span><span><i class="lc"></i>${tr("setpoint")}</span><span><i class="lh"></i>${tr("g_heat")}</span><span><i class="lk"></i>${tr("g_cool")}</span></div>
        </div></div>`;
      const r = this.shadowRoot;
      r.querySelector(".bg").addEventListener("click", (e) => { if (e.target.classList.contains("bg")) this.close(); });
      r.querySelector(".x").addEventListener("click", () => this.close());
      r.querySelectorAll(".rg button").forEach((b) => b.addEventListener("click", () => {
        this._hours = Number(b.dataset.h);
        r.querySelectorAll(".rg button").forEach((x) => x.classList.toggle("on", x === b));
        this._load();
      }));
    }
    _esc(v) { return esc(v); }
    async _load() {
      const seq = (this._seq = (this._seq || 0) + 1);
      const end = new Date(), start = new Date(end - this._hours * 3600e3);
      const ch = this.shadowRoot.getElementById("ch");
      if (ch && !this._data) ch.innerHTML = `<div class="ld">${tr("g_loading")}</div>`;
      try {
        const base = { type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), significant_changes_only: false };
        const [cl, se] = await Promise.all([
          this._hass.callWS({ ...base, entity_ids: [this._o.entity], minimal_response: false, no_attributes: false }),
          this._o.sensor ? this._hass.callWS({ ...base, entity_ids: [this._o.sensor], minimal_response: true, no_attributes: true }) : null,
        ]);
        if (seq !== this._seq) return;
        const t = (x) => (x.lu != null ? x.lu : x.lc) * 1000;
        const rows = (cl && cl[this._o.entity]) || [];
        let attrs = {};
        const clim = rows.map((x) => { if (x.a) attrs = { ...attrs, ...x.a }; return { t: t(x), s: x.s, a: attrs }; });
        const temp = this._o.sensor
          ? ((se && se[this._o.sensor]) || []).map((x) => ({ t: t(x), v: parseFloat(x.s) })).filter((p) => !isNaN(p.v))
          : clim.map((x) => ({ t: x.t, v: Number(x.a.current_temperature) })).filter((p) => !isNaN(p.v) && p.v !== 0);
        const target = clim.map((x) => ({ t: x.t, v: x.s === "off" || x.s === "unavailable" || x.a.temperature == null ? null : Number(x.a.temperature) }));
        const bands = [];
        clim.forEach((x, i) => {
          const act = x.a.hvac_action || (x.s === "heat" ? "heating" : x.s === "cool" ? "cooling" : null);
          const k = act === "heating" || act === "preheating" ? "heat" : act === "cooling" ? "cool" : null;
          const t1 = i + 1 < clim.length ? clim[i + 1].t : +end;
          if (k) { const last = bands[bands.length - 1]; if (last && last.k === k && last.t1 >= x.t) last.t1 = t1; else bands.push({ k, t0: x.t, t1 }); }
        });
        this._data = { t0: +start, t1: +end, temp, target, bands };
        this._draw();
      } catch (e) {
        if (ch) ch.innerHTML = `<div class="ld">${tr("g_error", this._esc(e && e.message ? e.message : e))}</div>`;
      }
    }
    _draw() {
      const d = this._data, ch = this.shadowRoot.getElementById("ch");
      if (!d || !ch) return;
      const W = Math.max(280, ch.clientWidth || 600), H = Math.round(Math.min(340, Math.max(200, W * 0.45)));
      const P = { l: 34, r: 12, t: 10, b: 24 };
      const vals = [...d.temp.map((p) => p.v), ...d.target.filter((p) => p.v != null).map((p) => p.v)];
      const st = this.shadowRoot.getElementById("stats");
      if (!d.temp.length) { ch.innerHTML = `<div class="ld">${tr("g_nodata")}</div>`; st.innerHTML = ""; return; }
      let lo = Math.floor(Math.min(...vals) - 0.5), hi = Math.ceil(Math.max(...vals) + 0.5);
      if (hi - lo < 3) { const m = (hi + lo) / 2; lo = Math.floor(m - 1.5); hi = Math.ceil(m + 1.5); }
      const x = (t) => P.l + ((t - d.t0) / (d.t1 - d.t0)) * (W - P.l - P.r);
      const y = (v) => P.t + (1 - (v - lo) / (hi - lo)) * (H - P.t - P.b);
      const fr = (v) => dec(Number(v).toFixed(1));
      // axes
      const ys = []; const yStep = hi - lo > 12 ? 4 : hi - lo > 6 ? 2 : 1;
      for (let v = Math.ceil(lo / yStep) * yStep; v <= hi; v += yStep) ys.push(v);
      const hStep = this._hours <= 6 ? 1 : this._hours <= 24 ? 3 : this._hours <= 48 ? 6 : 24;
      const xs = []; const f = new Date(d.t0); f.setMinutes(0, 0, 0);
      for (let t = +f; t <= d.t1; t += 3600e3) { const dt = new Date(t); if (t >= d.t0 && (hStep === 24 ? dt.getHours() === 0 : dt.getHours() % hStep === 0)) xs.push(t); }
      const lbl = (t) => { const dt = new Date(t); return hStep === 24 ? dt.toLocaleDateString(LOCALE, { weekday: "short", day: "numeric" }) : tr("g_hour_axis", dt.getHours()); };
      // courbes
      const pts = d.temp.map((p) => [x(Math.max(p.t, d.t0)), y(p.v)]);
      pts.push([x(d.t1), pts[pts.length - 1][1]]);
      const line = "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");
      const area = line + ` L${x(d.t1).toFixed(1)} ${H - P.b} L${pts[0][0].toFixed(1)} ${H - P.b} Z`;
      let tg = "", prev = null;
      d.target.forEach((p, i) => {
        const t0 = Math.max(p.t, d.t0), t1 = i + 1 < d.target.length ? d.target[i + 1].t : d.t1;
        if (p.v == null || t1 <= d.t0) { prev = null; return; }
        tg += (prev == null ? `M${x(t0).toFixed(1)} ${y(p.v).toFixed(1)}` : ` L${x(t0).toFixed(1)} ${y(p.v).toFixed(1)}`) + ` L${x(t1).toFixed(1)} ${y(p.v).toFixed(1)}`;
        prev = p.v;
      });
      const bands = d.bands.map((b) => { const a = x(Math.max(b.t0, d.t0)), z = x(Math.min(b.t1, d.t1)); return z > a ? `<rect class="b${b.k}" x="${a.toFixed(1)}" y="${P.t}" width="${(z - a).toFixed(1)}" height="${H - P.t - P.b}"/>` : ""; }).join("");
      ch.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a4a" stop-opacity=".35"/><stop offset="1" stop-color="#ff9a4a" stop-opacity="0"/></linearGradient></defs>
        ${bands}
        ${ys.map((v) => `<line class="gl" x1="${P.l}" x2="${W - P.r}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="yl" x="${P.l - 6}" y="${(y(v) + 3.5).toFixed(1)}">${v}°</text>`).join("")}
        ${xs.map((t) => `<text class="xl" x="${x(t).toFixed(1)}" y="${H - 6}">${lbl(t)}</text>`).join("")}
        <path class="ar" d="${area}"/>
        ${tg ? `<path class="tg" d="${tg}"/>` : ""}
        <path class="ln" d="${line}"/>
        <g class="hv" style="display:none"><line class="hl" y1="${P.t}" y2="${H - P.b}"/><circle r="4"/></g>
      </svg><div class="tip" style="display:none"></div>`;
      const tv = d.temp.map((p) => p.v);
      const avg = tv.reduce((a, b) => a + b, 0) / tv.length;
      const heatMin = d.bands.filter((b) => b.k === "heat").reduce((a, b) => a + (Math.min(b.t1, d.t1) - Math.max(b.t0, d.t0)), 0) / 60000;
      const coolMin = d.bands.filter((b) => b.k === "cool").reduce((a, b) => a + (Math.min(b.t1, d.t1) - Math.max(b.t0, d.t0)), 0) / 60000;
      const dur = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, "0")}` : `${Math.round(m)} min`);
      st.innerHTML = `<div><small>${tr("g_current")}</small><b>${fr(tv[tv.length - 1])}°</b></div><div><small>${tr("g_min")}</small><b>${fr(Math.min(...tv))}°</b></div><div><small>${tr("g_max")}</small><b>${fr(Math.max(...tv))}°</b></div><div><small>${tr("g_avg")}</small><b>${fr(avg)}°</b></div>${heatMin > 0.5 ? `<div><small>${tr("g_heat")}</small><b>${dur(heatMin)}</b></div>` : ""}${coolMin > 0.5 ? `<div><small>${tr("g_cool")}</small><b>${dur(coolMin)}</b></div>` : ""}`;
      // survol
      const svg = ch.querySelector("svg"), hv = ch.querySelector(".hv"), tip = ch.querySelector(".tip");
      const at = (arr, t) => { let r = null; for (const p of arr) { if (p.t <= t) r = p; else break; } return r; };
      const show = (ev) => {
        const rc = svg.getBoundingClientRect();
        const px = ((ev.clientX - rc.left) / rc.width) * W;
        if (px < P.l || px > W - P.r) { hv.style.display = "none"; tip.style.display = "none"; return; }
        const t = d.t0 + ((px - P.l) / (W - P.l - P.r)) * (d.t1 - d.t0);
        const p = at(d.temp, t) || d.temp[0], c = at(d.target, t);
        hv.style.display = ""; hv.querySelector("line").setAttribute("x1", px); hv.querySelector("line").setAttribute("x2", px);
        hv.querySelector("circle").setAttribute("cx", px); hv.querySelector("circle").setAttribute("cy", y(p.v));
        tip.style.display = "";
        tip.innerHTML = `<small>${new Date(t).toLocaleString(LOCALE, { weekday: "short", hour: "2-digit", minute: "2-digit" })}</small><b>${fr(p.v)}°</b>${c && c.v != null ? `<span>${tr("g_setpoint", fr(c.v))}</span>` : ""}`;
        const tx = (px / W) * rc.width;
        tip.style.left = `${Math.min(Math.max(tx, 60), rc.width - 60)}px`;
      };
      svg.addEventListener("pointermove", show);
      svg.addEventListener("pointerdown", show);
      svg.addEventListener("pointerleave", () => { hv.style.display = "none"; tip.style.display = "none"; });
    }
    static css() {
      return `
      .bg { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box;
        background: rgba(4,8,12,.6); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); opacity: 0; transition: opacity .2s;
        font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, system-ui, sans-serif)); }
      .bg.on { opacity: 1; }
      .dlg { width: 100%; max-width: 760px; max-height: 100%; overflow: auto; box-sizing: border-box; padding: 16px; border-radius: 22px; color: #e6f2f5;
        background: linear-gradient(160deg, rgba(22,30,40,.98), rgba(10,15,22,.99)); border: 1px solid rgba(255,255,255,.08); box-shadow: 0 20px 60px rgba(0,0,0,.5);
        transform: translateY(12px) scale(.98); transition: transform .22s; }
      .bg.on .dlg { transform: none; }
      button { font: inherit; color: inherit; border: 0; background: none; cursor: pointer; padding: 0; }
      .hd { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
      .tt { flex: 1; min-width: 140px; display: flex; flex-direction: column; } .tt b { font-size: 16px; } .tt small { font-size: 12px; color: rgba(220,235,240,.62); }
      .rg { display: flex; gap: 3px; padding: 3px; border-radius: 12px; background: rgba(0,0,0,.3); }
      .rg button { height: 30px; padding: 0 10px; border-radius: 9px; font-size: 12.5px; font-weight: 700; color: rgba(220,235,240,.7); }
      .rg button.on { color: #fff; background: rgba(255,128,48,.85); }
      .x { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.07); }
      .x ha-icon { --mdc-icon-size: 18px; }
      .stats { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 8px; }
      .stats div { flex: 1 1 80px; padding: 7px 10px; border-radius: 12px; background: rgba(255,255,255,.05); display: flex; flex-direction: column; }
      .stats small { font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; color: rgba(220,235,240,.6); }
      .stats b { font-size: 17px; font-variant-numeric: tabular-nums; }
      .ch { position: relative; min-height: 200px; }
      .ch svg { display: block; width: 100%; height: auto; touch-action: pan-y; }
      .ld { display: grid; place-items: center; min-height: 200px; font-size: 13px; color: rgba(220,235,240,.62); text-align: center; }
      .gl { stroke: rgba(255,255,255,.07); } .yl, .xl { fill: rgba(220,235,240,.55); font-size: 10.5px; } .yl { text-anchor: end; } .xl { text-anchor: middle; }
      .ar { fill: url(#ga); } .ln { fill: none; stroke: #ff9a4a; stroke-width: 2.2; stroke-linejoin: round; }
      .tg { fill: none; stroke: rgba(255,255,255,.75); stroke-width: 1.5; stroke-dasharray: 5 4; }
      .bheat { fill: rgba(255,110,30,.13); } .bcool { fill: rgba(64,170,255,.14); }
      .hl { stroke: rgba(255,255,255,.35); stroke-dasharray: 3 3; } .hv circle { fill: #fff; stroke: #ff9a4a; stroke-width: 2; }
      .tip { position: absolute; top: 4px; transform: translateX(-50%); padding: 6px 9px; border-radius: 10px; background: rgba(15,22,30,.95); box-shadow: 0 6px 18px rgba(0,0,0,.4);
        display: flex; flex-direction: column; align-items: center; pointer-events: none; font-size: 12px; white-space: nowrap; }
      .tip small { color: rgba(220,235,240,.6); font-size: 11px; } .tip b { font-size: 15px; } .tip span { color: rgba(220,235,240,.75); font-size: 11px; }
      .lg { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 8px; font-size: 11.5px; color: rgba(220,235,240,.65); }
      .lg span { display: flex; align-items: center; gap: 5px; } .lg i { width: 14px; height: 3px; border-radius: 2px; display: inline-block; }
      .lt { background: #ff9a4a; } .lc { background: repeating-linear-gradient(90deg, #fff 0 4px, transparent 4px 7px); } .lh { height: 9px !important; background: rgba(255,110,30,.35); } .lk { height: 9px !important; background: rgba(64,170,255,.4); }
      /* thème clair (#12) */
      .bg.light { background: rgba(226,232,240,.6); }
      .bg.light .dlg { color: #16202a; background: linear-gradient(160deg, rgba(255,255,255,.99), rgba(241,245,249,.99)); border-color: rgba(15,23,42,.08); box-shadow: 0 20px 60px rgba(15,23,42,.18); }
      .bg.light .tt small, .bg.light .stats small, .bg.light .ld, .bg.light .tip small, .bg.light .lg { color: rgba(22,32,42,.6); }
      .bg.light .rg { background: rgba(15,23,42,.06); } .bg.light .rg button { color: rgba(22,32,42,.7); } .bg.light .rg button.on { color: #fff; }
      .bg.light .x, .bg.light .stats div { background: rgba(15,23,42,.05); }
      .bg.light .gl { stroke: rgba(15,23,42,.08); } .bg.light .yl, .bg.light .xl { fill: rgba(22,32,42,.55); }
      .bg.light .tg { stroke: rgba(15,23,42,.6); } .bg.light .hl { stroke: rgba(15,23,42,.3); }
      .bg.light .tip { background: rgba(255,255,255,.97); box-shadow: 0 6px 18px rgba(15,23,42,.15); } .bg.light .tip span { color: rgba(22,32,42,.7); }
      .bg.light .lc { background: repeating-linear-gradient(90deg, #475569 0 4px, transparent 4px 7px); }
      @media (max-width: 480px) { .bg { padding: 8px; align-items: flex-end; } .dlg { border-radius: 22px 22px 14px 14px; padding: 12px; } }`;
    }
  }
  if (!customElements.get("holm-climate-graph")) customElements.define("holm-climate-graph", HolmClimateGraph);

  if (!customElements.get("holm-climate-card")) {
    customElements.define("holm-climate-card", HolmClimateCard);
    if (!customElements.get("climate-holm-card")) customElements.define("climate-holm-card", class extends HolmClimateCard {});
  }
  if (!customElements.get("holm-climate-card-editor")) customElements.define("holm-climate-card-editor", HolmClimateCardEditor);

  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === "holm-climate-card")) {
    window.customCards.push({
      type: "holm-climate-card",
      name: "HOLM Climate",
      description: tr("card_desc"),
      preview: true,
    });
  }
  console.info(`%c HOLM-CLIMATE %c ${VERSION} `, "background:#ff8030;color:#111;border-radius:3px 0 0 3px", "background:#123;color:#fff;border-radius:0 3px 3px 0");
})();
