# Näköhavaintojen itsearviointi – Santasport Rovaniemi

Santasport Urheiluopiston (Rovaniemi) versio KIHU Jyväskylän näköhavaintojen itsearviointiohjelmasta.
Data on täysin erillään KIHUn versiosta:

| | KIHU Jyväskylä | Santasport Rovaniemi |
|---|---|---|
| GitHub-repo | `KIHU` | `santasport` |
| Osoite | tkoljonen-wq.github.io/KIHU/ | tkoljonen-wq.github.io/santasport/ |
| Google Sheet | KIHUn oma | [Santasport-sheet](https://docs.google.com/spreadsheets/d/196cC3K6m3ltBQAdmwTJR8HNWjeL4a-UN3BZY9E1GG6I/edit) |
| Apps Script | KIHUn oma julkaisu | `apps-script/Code.gs`, julkaistaan Santasport-sheetistä |
| Kalibrointi (localStorage) | `naontutkimus_cal_v1` | `santasport_naontutkimus_cal_v1` |

Data-välilehdellä on lisäksi viimeisenä sarake **Toimipiste** (`Santasport Rovaniemi`), jotta rivit voi
tunnistaa myöhemminkin, jos aineistoja yhdistetään.

## Käyttöönotto

1. Avaa Santasport-sheet → **Laajennukset → Apps Script**.
2. Poista editorin oletuskoodi ja liitä tilalle `apps-script/Code.gs`:n sisältö → Tallenna.
3. Valitse funktioksi `setupSheet` ja paina **Suorita**. Hyväksy käyttöoikeuspyyntö
   (Google voi varoittaa vahvistamattomasta sovelluksesta: Lisäasetukset → Siirry projektiin).
   Sheetiin syntyvät välilehdet **Data** ja **Tilastot**.
4. **Ota käyttöön → Uusi käyttöönotto → Tyyppi: Verkkosovellus**
   - Suorita käyttäjänä: **Minä**
   - Käyttöoikeus: **Kaikki**
5. Kopioi saatu `https://script.google.com/macros/s/…/exec` -osoite.
6. Liitä se `index.html`:ään riville `const APPS_SCRIPT_URL = '…'`, commitoi ja pushaa.
7. Kalibroi Santasportin näyttö ohjelman kalibrointinäkymässä (kalibrointi on laitekohtainen,
   eikä KIHUn kalibrointi siirry tähän versioon).

Ennen kuin osoite on asetettu, tulossivulla näkyy "TALLENNUS EI KÄYTÖSSÄ" eikä mitään lähetetä.

## Tietosuoja

Tallennettavat tiedot: päivämäärä, sukupuoli, ikä, visus- ja FD-tulokset, oirekysymykset, suositus
ja toimipiste. Nimeä tai muita suoria tunnisteita ei kerätä. Sheetin jakamisoikeudet kannattaa pitää
vain niillä, jotka tarvitsevat tilastoja.
