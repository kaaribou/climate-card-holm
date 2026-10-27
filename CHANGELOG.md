# Changelog

## 1.5.0
- **Verrou de Versatile Thermostat** ([#7](https://github.com/kaaribou/climate-card-holm/issues/7)) : lu dans `lock_manager` (VTherm récent). Verrouillé pour les utilisateurs, la roue, les boutons, les modes, les préréglages et les pastilles actives sont grisés et bloqués ; le cadenas de l'entête appelle `versatile_thermostat.unlock` / `lock`, avec saisie du **code** quand VTherm en demande un (« Code refusé » si erroné).
- **Verrou anti-erreur** (`lock: true`, `lock_delay`) pour n'importe quel thermostat : commandes bloquées jusqu'à un toucher sur le cadenas, puis débloquées quelques secondes avec décompte. Verrouillée, la roue laisse défiler la page sur mobile.
- **Traductions** ([#8](https://github.com/kaaribou/climate-card-holm/pull/8), merci à [@hco](https://github.com/hco)) : carte, éditeur et graphique en français, allemand et anglais selon la langue de Home Assistant ; séparateur décimal et dates selon la langue ; valeurs inconnues de la carte traduites par Home Assistant. Le français reste la langue par défaut.
- **Correctif** ([#9](https://github.com/kaaribou/climate-card-holm/issues/9)) : la carte ne plante plus quand une carte conteneur (expander-card, Streamline…) lui transmet d'abord un `hass` vide.

## 1.4.0
- **Pourquoi cet état ?** (Versatile Thermostat, [#4](https://github.com/kaaribou/climate-card-holm/issues/4)) : un toucher sur la ligne d'état (icône ⓘ, colorée quand il y a un message) ouvre la liste des messages du VTherm traduits — raison de l'arrêt, consigne appliquée, délestage, sécurité, appareil piloté indisponible (avec son nom), initialisation, bypass, défauts, verrou.
- **Volets toujours entiers** ([#5](https://github.com/kaaribou/climate-card-holm/issues/5)) : le volet Minuteur (et les autres) ne dépasse plus de la carte ; l'entête et le bouton de fermeture restent visibles, le contenu défile si besoin. Volets plus compacts en demi-largeur (boutons moins hauts, durées sur 2 colonnes).
- **Rebond du défilement sur iPhone** ([#5](https://github.com/kaaribou/climate-card-holm/issues/5)) : la carte ne force plus sa hauteur à 100 % quand Home Assistant la dimensionne en « auto » (seulement avec une hauteur fixe `grid_options.rows`), et la roue a une taille explicite au lieu d'un rapport largeur / hauteur.

## 1.3.0
Retours d'utilisateurs Versatile Thermostat ([#4](https://github.com/kaaribou/climate-card-holm/issues/4)) :
- **Raisons d'arrêt traduites** (`hvac_off_inhibition`, `hvac_off_auto_start_stop`, `hvac_off_window_detection`…) ; l'arrêt manuel affiche simplement « Éteint ».
- **Icône à l'arrêt** : plus de ventilateur « A/C » — bouton marche/arrêt, ou radiateur éteint pour un appareil qui ne fait que chauffer (l'option `icon` reste prioritaire).
- **Pastilles actives au toucher** : bypass de la détection de fenêtre, bypass de l'**inhibition** (interrupteur du plugin à indiquer) et activation de l'**auto-start/stop** (interrupteur trouvé automatiquement).
- **Inhibition** et **auto-start/stop** signalés (« Inhibé », « Arrêt auto ») ; **défaut de chauffe / de refroidissement** en rouge.
- **Informations au choix** sous les commandes (`vtherm_info` : taux de chauffe, puissance, température extérieure, barre) ; le texte passe à la ligne au lieu d'être coupé en demi-largeur, et rien n'est affiché à l'arrêt hors température extérieure.
- **Plus compacte en pleine largeur** : les pastilles se placent à droite du nom.

## 1.2.0
- **Option Versatile Thermostat** (`vtherm: true`, proposée dans l'éditeur pour les entités VTherm) ([#4](https://github.com/kaaribou/climate-card-holm/issues/4)) :
  - pastilles fenêtre (avec **Ignorer** / **Rétablir**), présence, mouvement, délestage, sécurité et verrou ;
  - raison de l'arrêt sous le nom, bordure orange ou rouge en cas d'alerte ;
  - puce **Minuteur** : préréglage temporaire (30 min à 4 h) avec décompte et **Annuler** ;
  - taux de chauffe, puissance moyenne et température extérieure ;
  - préréglages Hors-gel, Délestage et Sécurité traduits.
- **Pastilles d'état** (`badges`) pour tout thermostat : jusqu'à 4 entités (fenêtre, présence, humidité…) sous le nom.
- Sans ces options, la carte est inchangée.

## 1.1.0
- **Vue compacte** (`layout: compact`) : sans la roue, moins haute et en largeur — modes Éteint / Chauffe / Clim et consigne − / + sur une ligne, options à côté ; en pleine largeur tout tient sur une seule ligne ([#1](https://github.com/kaaribou/climate-card-holm/issues/1)).
- **Ambiance « éteint »** : brume grise qui respire doucement et fines poussières, pour que la carte reste vivante même à l'arrêt.
- **Consigne minimum / maximum** réglables dans la carte (`min_temp`, `max_temp`), appliquées à la roue et aux boutons ([#2](https://github.com/kaaribou/climate-card-holm/issues/2)).
- **Mode ventilation** en 4ᵉ pastille (si l'appareil le propose) : couleur vert d'eau, filets d'air animés, et la roue comme les boutons − / + règlent la vitesse de ventilation quand il n'y a pas de consigne.
- **Sonde de température au choix** (`temperature_sensor`) et **historique au toucher** : graphique 24 h par défaut (`graph_hours`, boutons 6 h / 24 h / 48 h / 7 j) avec consigne, périodes de chauffe / clim, min / max / moyenne ([#3](https://github.com/kaaribou/climate-card-holm/issues/3)).

## 1.0.0
Première version publique.

- Carte climat compacte, lisible à **deux côte à côte** sur mobile et en pleine largeur (roue à gauche, commandes à droite).
- **Ambiance selon l'usage** : sobre à l'arrêt, lueur chaude et braises qui montent en chauffage, lueur froide et flocons en clim ; animations seulement quand l'appareil chauffe ou refroidit réellement.
- **Roue de consigne 270°** à faire glisser, boutons − / + dans l'ouverture de la roue, température actuelle repérée sur la roue.
- **Modes** Éteint / Chauffage / Clim en pastilles (et le mode en cours s'il est différent).
- **Ventilation, préréglage, oscillation verticale et horizontale** en puces compactes qui ouvrent un volet de choix.
- **Mises à jour immédiates** à l'écran, sans attendre la réponse de l'appareil (pratique avec les clims cloud).
- Texte toujours lisible, quel que soit le thème Home Assistant (clair ou sombre).
