/**
 * NÄKÖHAVAINTOJEN ITSEARVIOINTI – SANTASPORT ROVANIEMI – Google Apps Script
 * =========================================================================
 * Tämä skripti kuuluu VAIN Santasportin omaan Google Sheetiin:
 * https://docs.google.com/spreadsheets/d/196cC3K6m3ltBQAdmwTJR8HNWjeL4a-UN3BZY9E1GG6I/edit
 * (KIHU Jyväskylän data on eri sheetissä ja eri Apps Script -julkaisussa.)
 *
 * ASENNUS:
 * 1. Avaa Google Sheets → Laajennukset → Apps Script
 * 2. Korvaa koodi tällä → Tallenna
 * 3. Aja "setupSheet" (▶)
 * 4. Julkaise verkkosovelluksena
 *    (Suorita: Minä, Käyttöoikeus: Kaikki)
 * 5. Kopioi /exec-URL → index.html APPS_SCRIPT_URL
 *
 * RAKENNE:
 * - Tämä versio lisää kaksi uutta datakenttää:
 *   1) Pystypalkit: katoaa
 *   2) Vaakapalkit: katoaa
 * - setupSheet muuttaa vanhan Data-välilehden rakenteen lisäämällä uudet sarakkeet
 *   FD-sarakkeiden jälkeen. Vanhoja vastausrivejä ei poisteta.
 */

var SHEET_DATA  = "Data";
var SHEET_STATS = "Tilastot";

var DATA_HEADERS = [
  "Päivämäärä","Sukupuoli","Ikä",
  "Visus OD","Visus OS",
  "FD pysty siirtymä","FD vaaka siirtymä",
  "Pystypalkit: katoaa","Vaakapalkit: katoaa",
  "Päänsärky","Silmien väsyminen",
  "Rivit hyppivät","Suositus","Toimipiste"
];

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var ds = ss.getSheetByName(SHEET_DATA);
  if (!ds) ds = ss.insertSheet(SHEET_DATA);

  migrateDataSheet(ds);

  var hr = ds.getRange(1,1,1,DATA_HEADERS.length);
  hr.setValues([DATA_HEADERS]);
  hr.setFontWeight("bold").setBackground("#9a5ea3").setFontColor("#fff")
    .setHorizontalAlignment("center").setWrap(true);

  var w = [120,140,60,130,130,140,140,170,170,160,150,180,180,170];
  for (var i=0;i<w.length;i++) ds.setColumnWidth(i+1,w[i]);
  ds.setFrozenRows(1);

  var st = ss.getSheetByName(SHEET_STATS);
  if (!st) st = ss.insertSheet(SHEET_STATS);
  st.clear();
  buildStats(st);
  SpreadsheetApp.flush();
}

function migrateDataSheet(ds) {
  var lastCol = Math.max(ds.getLastColumn(), 1);
  var headers = ds.getRange(1, 1, 1, lastCol).getValues()[0].map(function(v) {
    return String(v || "").trim();
  });

  var hasPystyKatoaa = headers.indexOf("Pystypalkit: katoaa") !== -1;
  var hasVaakaKatoaa = headers.indexOf("Vaakapalkit: katoaa") !== -1;

  if (!hasPystyKatoaa && !hasVaakaKatoaa && headers.indexOf("FD vaaka siirtymä") !== -1) {
    ds.insertColumnsAfter(7, 2);
  } else if (!hasPystyKatoaa && headers.indexOf("FD vaaka siirtymä") !== -1) {
    ds.insertColumnAfter(7);
  } else if (!hasVaakaKatoaa && headers.indexOf("Pystypalkit: katoaa") !== -1) {
    ds.insertColumnAfter(8);
  }

  ds.getRange(1, 1, 1, DATA_HEADERS.length).setValues([DATA_HEADERS]);
}

function buildStats(sh) {
  var D = SHEET_DATA;

  var helpers = ["KYLLÄ","EI","NAINEN","MIES","EN HALUA VASTATA",
                 "ALLE 0.4","1.0","1.25","0.63","0.8","0.4","0.5","d.m.yyyy"];
  for (var h=0; h<helpers.length; h++) {
    sh.getRange(h+1, 5).setValue(helpers[h]);
  }
  sh.hideColumns(5);

  var KYLLA = "$E$1";
  var EI_   = "$E$2";
  var NAIN  = "$E$3";
  var MIES  = "$E$4";
  var EHVA  = "$E$5";
  var A04   = "$E$6";
  var V10   = "$E$7";
  var V125  = "$E$8";
  var V063  = "$E$9";
  var V08   = "$E$10";
  var V04   = "$E$11";
  var V05   = "$E$12";
  var DFMT  = "$E$13";

  var r = 1;
  var T = "B3";

  function hdr(row, txt) {
    sh.getRange(row,1,1,4).merge().setValue(txt)
      .setBackground("#9a5ea3").setFontColor("#fff").setFontWeight("bold").setFontSize(12);
  }
  function sub(row, a,b,c,d2) {
    var v=[a,b,c,d2];
    for(var i=0;i<4;i++) sh.getRange(row,i+1).setValue(v[i]).setFontWeight("bold").setBackground("#e8d5ed");
  }
  function lbl(row, txt) { sh.getRange(row,1).setValue(txt).setFontWeight("bold"); }
  function fm(row, col, formula, fmt) {
    var c = sh.getRange(row,col);
    c.setFormula(formula);
    if(fmt) c.setNumberFormat(fmt);
  }
  function tx(row, col, v) { sh.getRange(row,col).setValue(v); }

  hdr(r,"PERUSLASKURI"); r++;
  sub(r,"Mittari","Lukumäärä","Prosentti","Huom."); r++;

  lbl(r,"Tutkimuksessa käyneet (yht.)");
  fm(r,2,"=COUNTA("+D+"!A2:A)","0");
  tx(r,3,"100 %"); tx(r,4,"Kaikki tallennetut rivit"); r++;

  lbl(r,"Suositus: KYLLÄ");
  fm(r,2,"=COUNTIF("+D+"!M2:M;"+KYLLA+")","0");
  fm(r,3,"=IF("+T+">0;B"+r+"/"+T+";0)","0.0%");
  tx(r,4,"Sai suosituksen"); r++;

  lbl(r,"Suositus: EI");
  fm(r,2,"=COUNTIF("+D+"!M2:M;"+EI_+")","0");
  fm(r,3,"=IF("+T+">0;B"+r+"/"+T+";0)","0.0%");
  tx(r,4,"Ei suositusta"); r+=2;

  hdr(r,"SUKUPUOLIJAKAUMA"); r++;
  sub(r,"Sukupuoli","Lukumäärä","Prosentti",""); r++;

  var gRef = [["Nainen",NAIN],["Mies",MIES],["Muu / ei halua vastata",EHVA]];
  for(var g=0;g<gRef.length;g++){
    lbl(r,gRef[g][0]);
    fm(r,2,"=COUNTIF("+D+"!B2:B;"+gRef[g][1]+")","0");
    fm(r,3,"=IF("+T+">0;B"+r+"/"+T+";0)","0.0%");
    r++;
  }
  r++;

  hdr(r,"IKÄJAKAUMA"); r++;
  sub(r,"Ikäryhmä","Lukumäärä","Prosentti","Suositus-%"); r++;

  var ages=[["8–12",8,12],["13–17",13,17],["18–29",18,29],["30–44",30,44],["45–59",45,59],["60+",60,999]];
  for(var a=0;a<ages.length;a++){
    var lo=ages[a][1], hi=ages[a][2];
    lbl(r,ages[a][0]+" v.");
    fm(r,2,"=SUMPRODUCT(("+D+"!C2:C>="+lo+")*("+D+"!C2:C<="+hi+"))","0");
    fm(r,3,"=IF("+T+">0;B"+r+"/"+T+";0)","0.0%");
    fm(r,4,"=IF(B"+r+">0;SUMPRODUCT(("+D+"!C2:C>="+lo+")*("+D+"!C2:C<="+hi+")*("+D+"!M2:M="+KYLLA+"))/B"+r+";0)","0.0%");
    r++;
  }

  lbl(r,"Keski-ikä");
  fm(r,2,"=IF("+T+">0;AVERAGE("+D+"!C2:C);0)","0.0"); r++;
  lbl(r,"Mediaani-ikä");
  fm(r,2,"=IF("+T+">0;MEDIAN("+D+"!C2:C);0)","0.0"); r+=2;

  hdr(r,"VISUS-TULOKSET"); r++;
  sub(r,"Mittari","Oikea (OD)","Vasen (OS)",""); r++;

  lbl(r,"Visus >= 1.0");
  fm(r,2,"=COUNTIF("+D+"!D2:D;"+V10+")+COUNTIF("+D+"!D2:D;"+V125+")","0");
  fm(r,3,"=COUNTIF("+D+"!E2:E;"+V10+")+COUNTIF("+D+"!E2:E;"+V125+")","0"); r++;

  lbl(r,"Visus 0.63–0.8");
  fm(r,2,"=COUNTIF("+D+"!D2:D;"+V063+")+COUNTIF("+D+"!D2:D;"+V08+")","0");
  fm(r,3,"=COUNTIF("+D+"!E2:E;"+V063+")+COUNTIF("+D+"!E2:E;"+V08+")","0"); r++;

  lbl(r,"Visus 0.4–0.5");
  fm(r,2,"=COUNTIF("+D+"!D2:D;"+V04+")+COUNTIF("+D+"!D2:D;"+V05+")","0");
  fm(r,3,"=COUNTIF("+D+"!E2:E;"+V04+")+COUNTIF("+D+"!E2:E;"+V05+")","0"); r++;

  lbl(r,"Visus alle 0.4");
  fm(r,2,"=COUNTIF("+D+"!D2:D;"+A04+")","0");
  fm(r,3,"=COUNTIF("+D+"!E2:E;"+A04+")","0"); r+=2;

  hdr(r,"FD-TULOKSET (PUNA-VIHERPALKIT)"); r++;
  sub(r,"Tulos","Pysty / pystypalkit","Vaaka / vaakapalkit",""); r++;

  lbl(r,"Siirtymä: OK / ei siirtymää");
  fm(r,2,"=COUNTIF("+D+"!F2:F;"+EI_+")","0");
  fm(r,3,"=COUNTIF("+D+"!G2:G;"+EI_+")","0"); r++;

  lbl(r,"Siirtymä havaittu");
  fm(r,2,"=COUNTIF("+D+"!F2:F;"+KYLLA+")","0");
  fm(r,3,"=COUNTIF("+D+"!G2:G;"+KYLLA+")","0"); r++;

  lbl(r,"Siirtymä-%");
  fm(r,2,"=IF("+T+">0;COUNTIF("+D+"!F2:F;"+KYLLA+")/"+T+";0)","0.0%");
  fm(r,3,"=IF("+T+">0;COUNTIF("+D+"!G2:G;"+KYLLA+")/"+T+";0)","0.0%"); r++;

  lbl(r,"Palkki katoaa");
  fm(r,2,"=COUNTIF("+D+"!H2:H;"+KYLLA+")","0");
  fm(r,3,"=COUNTIF("+D+"!I2:I;"+KYLLA+")","0"); r++;

  lbl(r,"Palkki katoaa-%");
  fm(r,2,"=IF("+T+">0;COUNTIF("+D+"!H2:H;"+KYLLA+")/"+T+";0)","0.0%");
  fm(r,3,"=IF("+T+">0;COUNTIF("+D+"!I2:I;"+KYLLA+")/"+T+";0)","0.0%"); r+=2;

  hdr(r,"KYSELYVASTAUKSET"); r++;
  sub(r,"Kysymys","KYLLÄ (kpl)","KYLLÄ (%)","EI (kpl)"); r++;

  var qC=["J","K","L"];
  var qN=["Päänsärky viikoittain","Silmien väsyminen","Rivit hyppivät lukiessa"];
  for(var q=0;q<3;q++){
    lbl(r,qN[q]);
    fm(r,2,"=COUNTIF("+D+"!"+qC[q]+"2:"+qC[q]+";"+KYLLA+")","0");
    fm(r,3,"=IF("+T+">0;B"+r+"/"+T+";0)","0.0%");
    fm(r,4,"=COUNTIF("+D+"!"+qC[q]+"2:"+qC[q]+";"+EI_+")","0");
    r++;
  }
  r++;

  hdr(r,"OIREYHDISTELMÄT"); r++;
  sub(r,"Yhdistelmä","Lukumäärä","Prosentti",""); r++;

  lbl(r,"Kaikki 3 oiretta");
  fm(r,2,"=COUNTIFS("+D+"!J2:J;"+KYLLA+";"+D+"!K2:K;"+KYLLA+";"+D+"!L2:L;"+KYLLA+")","0");
  fm(r,3,"=IF("+T+">0;B"+r+"/"+T+";0)","0.0%"); r++;

  lbl(r,"Ei yhtään oiretta");
  fm(r,2,"=COUNTIFS("+D+"!J2:J;"+EI_+";"+D+"!K2:K;"+EI_+";"+D+"!L2:L;"+EI_+")","0");
  fm(r,3,"=IF("+T+">0;B"+r+"/"+T+";0)","0.0%"); r++;

  lbl(r,"Suositus + oireita");
  fm(r,2,"=COUNTIFS("+D+"!M2:M;"+KYLLA+")-COUNTIFS("+D+"!M2:M;"+KYLLA+";"+D+"!J2:J;"+EI_+";"+D+"!K2:K;"+EI_+";"+D+"!L2:L;"+EI_+")","0");
  fm(r,3,"=IF("+T+">0;B"+r+"/"+T+";0)","0.0%"); r+=2;

  hdr(r,"YHTEENVETO"); r++;

  lbl(r,"Viimeisin pvm");
  fm(r,2,"=IF("+T+">0;INDEX("+D+"!A2:A;COUNTA("+D+"!A2:A));0)"); r++;

  lbl(r,"Tutkimuksia tänään");
  fm(r,2,"=COUNTIF("+D+"!A2:A;TEXT(TODAY();"+DFMT+"))","0"); r++;

  lbl(r,"Suositus-% (kaikki)");
  fm(r,2,"=IF("+T+">0;COUNTIF("+D+"!M2:M;"+KYLLA+")/"+T+";0)","0.0%");

  sh.setColumnWidth(1,380);
  sh.setColumnWidth(2,190);
  sh.setColumnWidth(3,190);
  sh.setColumnWidth(4,170);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_DATA);
    if (!sheet) return ContentService.createTextOutput("error").setMimeType(ContentService.MimeType.TEXT);

    var p = e.parameter;

    sheet.appendRow([
      p.pvm||"", p.sukupuoli||"", p.ika||"",
      p.visus_oikea||"", p.visus_vasen||"",
      p.fd_pysty_siirtyma||"", p.fd_vaaka_siirtyma||"",
      p.fd_pystypalkit_katoaa||"", p.fd_vaakapalkit_katoaa||"",
      p.paansarky||"", p.silmien_vasyminen||"",
      p.rivit_hyppivat||"", p.suositus||"",
      p.toimipiste||"Santasport Rovaniemi"
    ]);

    var lastRow = sheet.getLastRow();
    var ageVal = parseInt(p.ika, 10);
    if (!isNaN(ageVal)) sheet.getRange(lastRow,3).setValue(ageVal);

    return ContentService.createTextOutput("ok").setMimeType(ContentService.MimeType.TEXT);
  } catch(err) {
    return ContentService.createTextOutput("error").setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("ok").setMimeType(ContentService.MimeType.TEXT);
}
