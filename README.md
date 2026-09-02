# Release Radar – Komm.UNITY Zeitplanung

Release Radar ist eine einzelne, in sich geschlossene HTML/CSS/JS-Anwendung zur Release- und Zeitplanung im Rahmen des Komm.UNITY-Projekts (Komm.ONE). Sie läuft vollständig im Browser, benötigt keinen eigenen Server und wird über GitHub Pages ausgeliefert.

**Live-App:** https://denkolak.github.io/release-radar-kommunity/

## Funktionsüberblick

- **Übersicht & Release-Detailansicht** mit Rückwärts- und Vorwärtsplanung (Ziel-/Veröffentlichungsdatum oder Startdatum als Ausgangspunkt)
- **Ablaufplan (Gantt-Zeitachse)** und **Aufgabentabelle** nebeneinander auf einem Bildschirm, gegenseitig verknüpft: Klick auf einen Balken oder eine Aufgabenzeile springt zur jeweils anderen Ansicht
- **Aufgabenverwaltung**: Aufgaben hinzufügen, löschen, per Auf/Ab-Pfeilen neu ordnen, mit freiem Label versehen (z. B. „Feature-Freeze", „Meilenstein") – Labels erscheinen automatisch als Fahnen im Ablaufplan
- **Release-Reihenfolge** in der Navigation per Drag & Drop änderbar (Desktop/Maus; native HTML5-Drag&Drop, daher ohne Touch-Unterstützung)
- **Feiertage automatisch geladen**: Bundesland frei wählbar, Daten werden über die freie öffentliche API [Nager.Date](https://date.nager.at/) für das laufende und das kommende Jahr bezogen; bei Nichterreichbarkeit automatischer Fallback auf eine lokale Baden-Württemberg-Berechnung
- **Zeitachsen-Hover** mit Datumsanzeige und vertikaler Positionslinie
- **Arbeitstagegenaue Terminberechnung** (Mo–Fr, ohne Wochenenden/Feiertage)
- **Hell-/Dunkel-/Systemdesign**
- **Responsives Layout** für Desktop, Tablet und Smartphone
- **Optionaler Team-Sync** über Supabase (Postgres + Auth + Realtime): mehrere Nutzer sehen und bearbeiten denselben Datenbestand live; Anmeldung per E-Mail/Passwort oder Microsoft/Azure-AD-SSO
- **Microsoft-Teams-Integration**: die App lässt sich als Tab in Teams einbetten, inklusive eigenständigem SSO-Login-Flow über die Teams-JS-SDK

## Projektstruktur

```
index.html          → die ausgelieferte, einsatzbereite Anwendung (Single-File-Build)
work/
  app_template.html → HTML-/CSS-Gerüst mit Platzhaltern
  app.js            → gesamte Anwendungslogik (JavaScript)
releases_data.json  → Ausgangsdaten (Seed) für neue Installationen
```

Die ausgelieferte `index.html` entsteht durch einfaches Zusammenführen der drei Bausteine oben (Platzhalter `__APP_JS__` und `__SEED_JSON__` im Template werden ersetzt). Änderungen sollten in `work/app_template.html` bzw. `work/app.js` vorgenommen und anschließend neu zusammengeführt werden – nicht direkt in `index.html`, da diese sonst beim nächsten Build überschrieben werden.

## Nutzung ohne Team-Sync (Standard)

Ohne weitere Konfiguration läuft die App rein lokal im Browser: Alle Daten werden im `localStorage` des jeweiligen Geräts gespeichert. Einfach `index.html` öffnen bzw. die GitHub-Pages-URL aufrufen – kein Setup nötig.

## Team-Sync aktivieren (optional, Supabase)

Um mehreren Personen einen gemeinsamen, live synchronisierten Datenbestand zu ermöglichen, kann die App an ein Supabase-Projekt angebunden werden.

1. Ein Supabase-Projekt anlegen (Datenbanktabellen, Row-Level-Security und Auth-Anbieter gemäß separater Einrichtungsanleitung einrichten).
2. Im Kopf der `index.html` den Konfigurationsblock befüllen:

   ```html
   <script>
     window.RELEASE_RADAR_CONFIG = {
       enabled: true,
       supabaseUrl: "https://IHR-PROJEKT.supabase.co/",
       supabaseAnonKey: "IHR-ANON-PUBLIC-KEY"
     };
   </script>
   ```

3. Für Microsoft/Azure-AD-SSO zusätzlich den entsprechenden OAuth-Provider in Supabase konfigurieren.

Der „anon key" ist bewusst öffentlich/clientseitig sichtbar – die eigentliche Absicherung erfolgt über Row-Level-Security-Regeln in der Datenbank, nicht über die Geheimhaltung dieses Keys.

Bei `enabled: false` (Standard) ist der komplette Sync-Code inaktiv, es wird nichts nachgeladen und die App verhält sich rein lokal.

## Deployment (GitHub Pages)

Die `index.html` liegt im Repository-Root und wird direkt über GitHub Pages ausgeliefert (Branch- bzw. Actions-Konfiguration siehe Repository-Einstellungen unter *Settings → Pages*). Nach einem Merge auf den veröffentlichten Branch ist die Änderung nach kurzer Zeit unter der Live-URL sichtbar.

## Bekannte Einschränkungen

- Drag & Drop zum Verschieben der Release-Kacheln funktioniert nur mit der Maus (Desktop), nicht per Touch.
- Die Feiertagsdaten für nicht-baden-württembergische Bundesländer hängen von der Erreichbarkeit der externen Nager.Date-API ab; in restriktiven Netzwerken (z. B. Unternehmensproxy) greift automatisch der lokale Fallback für Baden-Württemberg.
- Der Teams-SSO-Login wurde nach der offiziellen Microsoft-Teams-JS-SDK-Dokumentation umgesetzt (`microsoftTeams.authentication.notifySuccess`); bei Auffälligkeiten in einer bestimmten Teams-Version bitte mit Screenshot melden.

## Kontakt

Denislav Kolaksazov, evia solutions GmbH – Komm.UNITY-Projekt (Komm.ONE)
