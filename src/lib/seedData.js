function toLocalDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekDate(dayOffset) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const target = new Date(monday);
  target.setDate(monday.getDate() + dayOffset);
  return toLocalDateStr(target);
}

function getStatus(dayOffset, slotIndex) {
  const today = toLocalDateStr(new Date());
  const dateStr = getWeekDate(dayOffset);
  if (dateStr < today) return 'Afsluttet';
  if (dateStr === today) {
    if (slotIndex < 2) return 'Afsluttet';
    if (slotIndex === 2) return 'I gang';
    return 'Afventer';
  }
  return 'Afventer';
}

const LOKATION = 'Silkeborgvej 2, Aarhus C';

// Task types: [type, tidsestimat (min)]
const TASK_TYPES = [
  ['Forrude udskiftning', 90],   // 0
  ['Stenslag reparation', 30],   // 1
  ['Siderude udskiftning', 60],  // 2
  ['Bagrude udskiftning', 75],   // 3
  ['Spejl udskiftning', 45],     // 4
];

// Each rep has their own start times and task-type rotation per day
// REP_SCHEDULES[repIndex][dayIndex] = array of 5 task-type indices
const REP_SCHEDULES = [
  // Anders (rep-1) – starts 08:00 each day, tasks rotate by day
  {
    times: ['08:00', '09:30', '11:00', '13:00', '14:30'],
    days: [
      [0, 1, 2, 3, 4],
      [1, 2, 3, 4, 0],
      [2, 3, 4, 0, 1],
      [3, 4, 0, 1, 2],
      [4, 0, 1, 2, 3],
    ],
  },
  // Maria (rep-2) – starts 30 min earlier, different task rotation
  {
    times: ['07:30', '09:00', '10:30', '12:00', '14:00'],
    days: [
      [2, 0, 4, 1, 3],
      [0, 4, 1, 3, 2],
      [4, 1, 3, 2, 0],
      [1, 3, 2, 0, 4],
      [3, 2, 0, 4, 1],
    ],
  },
  // Peter (rep-3) – starts 30 min later, yet another rotation
  {
    times: ['08:30', '10:00', '11:30', '13:30', '15:30'],
    days: [
      [3, 1, 0, 4, 2],
      [4, 2, 1, 0, 3],
      [0, 3, 2, 1, 4],
      [1, 4, 3, 2, 0],
      [2, 0, 4, 3, 1],
    ],
  },
];

// Customer data: [navn, kontakt, email, adresse]
const CUSTOMERS = [
  // 15 customers for rep-1 (Mon–Fri slot 0)
  ['Lars Pedersen', '+45 21 34 56 78', 'lars.pedersen@gmail.com', 'Frederiks Allé 34, 8000 Aarhus C'],
  ['Sofie Andersen', '+45 31 45 67 89', 'sofie.andersen@hotmail.com', 'Åboulevarden 12, 8000 Aarhus C'],
  ['Mikkel Sørensen', '+45 41 56 78 90', 'mikkel.s@email.dk', 'Jægergårdsgade 7, 8200 Aarhus N'],
  ['Hanne Møller', '+45 51 67 89 01', 'hanne.moller@work.dk', 'Nørre Allé 22, 8000 Aarhus C'],
  ['Thomas Christensen', '+45 61 78 90 12', 'thomas.c@firma.dk', 'Brammersgade 8, 8200 Aarhus N'],
  // rep-1 Tue–Fri slot 1
  ['Birgitte Hansen', '+45 71 89 01 23', 'birgitte.h@privat.dk', 'Skt. Pauls Kirkeplads 4, 8000 Aarhus C'],
  ['Jesper Rasmussen', '+45 81 90 12 34', 'jesper.r@email.dk', 'Mejlgade 15, 8000 Aarhus C'],
  ['Camilla Nielsen', '+45 91 01 23 45', 'camilla.nielsen@gmail.com', 'Studsgade 31, 8000 Aarhus C'],
  ['Rasmus Lund', '+45 20 11 22 33', 'rasmus.lund@work.dk', 'Randersvej 55, 8200 Aarhus N'],
  ['Mette Jacobsen', '+45 29 33 44 55', 'mette.j@privat.dk', 'Langelandsgade 12, 8000 Aarhus C'],
  // rep-1 slot 2
  ['Nikolaj Berg', '+45 30 44 55 66', 'nikolaj.berg@firma.dk', 'Høeghsmindevej 3, 8200 Aarhus N'],
  ['Anne-Marie Petersen', '+45 40 55 66 77', 'am.petersen@hotmail.dk', 'Christiansgade 9, 8000 Aarhus C'],
  ['Klaus Vestergaard', '+45 50 66 77 88', 'k.vestergaard@gmail.com', 'Frederiksgade 44, 8000 Aarhus C'],
  ['Dorte Skovgaard', '+45 60 77 88 99', 'dorte.s@email.dk', 'Strandvejen 18, 8000 Aarhus C'],
  ['Simon Dalgaard', '+45 70 88 99 00', 'simon.d@firma.dk', 'Grenåvej 67, 8200 Aarhus N'],
  // rep-2
  ['Inge Christoffersen', '+45 22 33 44 55', 'inge.c@gmail.com', 'Åbyhøjvej 10, 8230 Åbyhøj'],
  ['Brian Magnusson', '+45 32 43 54 65', 'brian.m@hotmail.com', 'Edwin Rahrs Vej 25, 8220 Brabrand'],
  ['Katrine Holm', '+45 42 53 64 75', 'katrine.h@work.dk', 'Silkeborgvej 140, 8230 Åbyhøj'],
  ['Poul Nørgaard', '+45 52 63 74 85', 'poul.n@privat.dk', 'Hasle Torv 3, 8210 Aarhus V'],
  ['Lisbeth Krog', '+45 62 73 84 95', 'lisbeth.k@email.dk', 'Ringgadebroen 2, 8000 Aarhus C'],
  ['Martin Elgaard', '+45 72 83 94 05', 'martin.e@firma.dk', 'Marselisborg Allé 8, 8000 Aarhus C'],
  ['Susanne Ibsen', '+45 82 93 04 15', 'susanne.i@gmail.com', 'Viby Ringvej 14, 8260 Viby J'],
  ['Henrik Dahl', '+45 92 03 14 25', 'henrik.d@work.dk', 'Brendstrupgårdsvej 21, 8200 Aarhus N'],
  ['Annette Fog', '+45 21 02 13 24', 'annette.f@hotmail.com', 'Toftevej 5, 8260 Viby J'],
  ['René Kjær', '+45 31 12 23 34', 'rene.k@privat.dk', 'Kystvejen 17, 8000 Aarhus C'],
  // rep-3
  ['Charlotte Bundgaard', '+45 41 22 33 44', 'charlotte.b@email.dk', 'Thorvaldsensgade 6, 8000 Aarhus C'],
  ['Flemming Overgaard', '+45 51 32 43 54', 'flemming.o@firma.dk', 'Nørrebrogade 78, 8000 Aarhus C'],
  ['Vibeke Storgaard', '+45 61 42 53 64', 'vibeke.s@gmail.com', 'Paludan-Müllers Vej 11, 8200 Aarhus N'],
  ['Ole Markussen', '+45 71 52 63 74', 'ole.m@hotmail.com', 'Gjellerupvej 45, 8230 Åbyhøj'],
  ['Gitte Lindberg', '+45 81 62 73 84', 'gitte.l@work.dk', 'Tilst Centervej 3, 8381 Tilst'],
  ['Søren Wulff', '+45 91 72 83 94', 'soren.w@privat.dk', 'Jens Baggesens Vej 30, 8200 Aarhus N'],
  ['Marianne Buus', '+45 22 82 93 04', 'marianne.b@email.dk', 'Valdemarsgade 22, 8000 Aarhus C'],
  ['Anders Krarup', '+45 32 92 03 14', 'anders.k@firma.dk', 'Skolebakken 9, 8000 Aarhus C'],
  ['Pia Thomsen', '+45 42 02 13 24', 'pia.t@gmail.com', 'Helsingforsgade 10, 8200 Aarhus N'],
  ['Jens Bonde', '+45 52 12 23 34', 'jens.b@hotmail.com', 'Marselis Boulevard 5, 8000 Aarhus C'],
  ['Tove Elkjær', '+45 62 22 33 44', 'tove.e@work.dk', 'Viborgvej 88, 8210 Aarhus V'],
  ['Michael Hvidberg', '+45 72 32 43 54', 'michael.h@privat.dk', 'Grenaavej 102, 8200 Aarhus N'],
  ['Bodil Munk', '+45 82 42 53 64', 'bodil.m@email.dk', 'Åparken 7, 8000 Aarhus C'],
  ['Niels Sloth', '+45 92 52 63 74', 'niels.s@firma.dk', 'Ceres Allé 3, 8000 Aarhus C'],
  ['Bente Ravn', '+45 23 62 73 84', 'bente.r@gmail.com', 'Rosenvangs Allé 15, 8270 Højbjerg'],
  ['Torben Ejlersen', '+45 33 72 83 94', 'torben.e@hotmail.com', 'Peter Sabroes Gade 4, 8000 Aarhus C'],
  ['Laila Frost', '+45 43 82 93 04', 'laila.f@work.dk', 'Søren Frichs Vej 55, 8230 Åbyhøj'],
  ['Preben Winther', '+45 53 92 03 14', 'preben.w@privat.dk', 'Oddervej 34, 8270 Højbjerg'],
  ['Connie Stamp', '+45 63 02 13 24', 'connie.s@email.dk', 'Østerågade 12, 8000 Aarhus C'],
  ['Kurt Grøn', '+45 73 12 23 34', 'kurt.g@firma.dk', 'Banegårdspladsen 1, 8000 Aarhus C'],
  ['Lene Fuglsang', '+45 83 22 33 44', 'lene.f@gmail.com', 'Ryesgade 67, 8000 Aarhus C'],
  ['Peder Bloch', '+45 93 32 43 54', 'peder.b@hotmail.com', 'Skanderborgvej 22, 8260 Viby J'],
  ['Eva Stahl', '+45 24 42 53 64', 'eva.s@work.dk', 'Hasle Bakke 8, 8210 Aarhus V'],
  ['Claus Husted', '+45 34 52 63 74', 'claus.h@privat.dk', 'Tordenskjoldsgade 16, 8000 Aarhus C'],
  ['Dorthe Kyed', '+45 44 62 73 84', 'dorthe.k@email.dk', 'Årstidevej 4, 8230 Åbyhøj'],
  ['Allan Skou', '+45 54 72 83 94', 'allan.s@firma.dk', 'Godthåbsgade 33, 8200 Aarhus N'],
  ['Kirsten Dall', '+45 64 82 93 04', 'kirsten.d@gmail.com', 'Skovvangsvej 41, 8200 Aarhus N'],
  ['Viggo Mørkeberg', '+45 74 92 03 14', 'viggo.m@hotmail.com', 'Ingerslevs Boulevard 20, 8000 Aarhus C'],
  ['Ulla Haaning', '+45 84 02 13 24', 'ulla.h@work.dk', 'Hjaltesvej 7, 8200 Aarhus N'],
  ['Frank Lindqvist', '+45 94 12 23 34', 'frank.l@privat.dk', 'Søndre Ringgade 40, 8000 Aarhus C'],
  ['Grethe Falch', '+45 25 22 33 44', 'grethe.f@email.dk', 'Carl Blochs Gade 18, 8000 Aarhus C'],
  ['John Elmholt', '+45 35 32 43 54', 'john.e@firma.dk', 'Thors Bakke 2, 8260 Viby J'],
  ['Bitten Krag', '+45 45 42 53 64', 'bitten.k@gmail.com', 'Vilhelm Bergsøes Vej 9, 8200 Aarhus N'],
  ['Eigil Søndergaard', '+45 55 52 63 74', 'eigil.s@hotmail.com', 'Bispehavevej 14, 8210 Aarhus V'],
  ['Marian Vang', '+45 65 62 73 84', 'marian.v@work.dk', 'Ryhavevej 27, 8210 Aarhus V'],
  ['Bent Leth', '+45 75 72 83 94', 'bent.l@privat.dk', 'Tulipanvej 5, 8260 Viby J'],
  ['Solveig Gamst', '+45 85 82 93 04', 'solveig.g@email.dk', 'Marselisvej 30, 8000 Aarhus C'],
  ['Karsten Borre', '+45 95 92 03 14', 'karsten.b@firma.dk', 'Viborg Landevej 10, 8800 Viborg'],
  ['Helle Toft', '+45 26 02 13 24', 'helle.t@gmail.com', 'Mølleparkvej 6, 8000 Aarhus C'],
  ['Ivan Mørk', '+45 36 12 23 34', 'ivan.m@hotmail.com', 'Katrinebjergvej 32, 8200 Aarhus N'],
  ['Ruth Busk', '+45 46 22 33 44', 'ruth.b@work.dk', 'Trøjborgvej 17, 8200 Aarhus N'],
  ['Finn Ostergaard', '+45 56 32 43 54', 'finn.o@privat.dk', 'Sønder Allé 11, 8000 Aarhus C'],
  ['Ingrid Holst', '+45 66 42 53 64', 'ingrid.h@email.dk', 'Nordhavnsgade 4, 8000 Aarhus C'],
  ['Esben Krabbe', '+45 76 52 63 74', 'esben.k@firma.dk', 'Ringgaden 50, 8000 Aarhus C'],
  ['Maj-Britt Lunde', '+45 86 62 73 84', 'maj.l@gmail.com', 'Kalmargade 8, 8000 Aarhus C'],
  ['Gunnar Thrane', '+45 96 72 83 94', 'gunnar.t@hotmail.com', 'Østbanetorvet 3, 8000 Aarhus C'],
];

// Car data: [mærke, model, nummerplade, årstal, stelnummer]
const CARS = [
  ['VW', 'Golf', 'AB 12 345', 2019, 'WVWZZZ1KZAM012345'],
  ['Toyota', 'Yaris', 'CD 23 456', 2021, 'NMTK33BX10R023456'],
  ['Ford', 'Focus', 'EF 34 567', 2018, 'WF04XXGCC4KA34567'],
  ['Peugeot', '308', 'GH 45 678', 2020, 'VF3LBHZUUJL045678'],
  ['BMW', 'X5', 'IJ 56 789', 2022, '5UXCR6C59KLL56789'],
  ['Audi', 'A4', 'KL 67 890', 2020, 'WAUZZZ8K7JA067890'],
  ['Skoda', 'Octavia', 'MN 78 901', 2019, 'TMBHE61Z1K7078901'],
  ['Mercedes', 'C-klasse', 'OP 89 012', 2023, 'WDD2050231R089012'],
  ['Volvo', 'V60', 'QR 90 123', 2021, 'YV1FW8GK0M2090123'],
  ['Hyundai', 'i30', 'ST 01 234', 2020, 'KMHD35LH0LU101234'],
  ['Honda', 'Civic', 'UV 12 345', 2018, 'SHHFK9760KU012345'],
  ['Seat', 'Leon', 'WX 23 456', 2019, 'VSSZZZ5FZJR023456'],
  ['VW', 'Passat', 'YZ 34 567', 2021, 'WVWZZZ3CZMA034567'],
  ['Peugeot', '3008', 'AA 45 678', 2022, 'VF3MCYHZUKL045678'],
  ['BMW', '320d', 'BB 56 789', 2020, 'WBA5A71040G156789'],
  ['Renault', 'Clio', 'CC 67 890', 2021, 'VF15RJF0567890123'],
  ['Nissan', 'Qashqai', 'DD 78 901', 2022, 'SJNFAAJ11U1078901'],
  ['Toyota', 'Corolla', 'EE 89 012', 2023, 'SB1AS76LX0E089012'],
  ['Opel', 'Astra', 'FF 90 123', 2019, 'W0LPE6EA5K8090123'],
  ['Mazda', 'CX-5', 'GG 01 234', 2020, 'JMZKF1W5801234567'],
  ['Kia', 'Sportage', 'HH 12 345', 2021, 'U5YPH813AML012345'],
  ['Citroën', 'C3', 'II 23 456', 2018, 'VF7SXBHZMHJ023456'],
  ['VW', 'Tiguan', 'JJ 34 567', 2022, 'WVGZZZ5NZKW034567'],
  ['Fiat', '500', 'KK 45 678', 2021, 'ZFA3120000J045678'],
  ['BMW', '520d', 'LL 56 789', 2023, 'WBA5G71020G056789'],
  ['Toyota', 'RAV4', 'MM 67 890', 2022, 'JTMRFREV0JD067890'],
  ['Skoda', 'Superb', 'NN 78 901', 2020, 'TMBAJ9NE7L0178901'],
  ['Ford', 'Fiesta', 'OO 89 012', 2019, 'WF05XXGAJJ9K89012'],
  ['Hyundai', 'Tucson', 'PP 90 123', 2021, 'KM8J3CA49MU090123'],
  ['Volvo', 'XC60', 'QQ 01 234', 2022, 'YV4902LK9N2301234'],
  ['Audi', 'Q5', 'RR 12 345', 2021, 'WAUZZZ8R7JA312345'],
  ['Mercedes', 'E-klasse', 'SS 23 456', 2020, 'WDB2130001A023456'],
  ['Renault', 'Megane', 'TT 34 567', 2019, 'VF1BA00B463034567'],
  ['Peugeot', '2008', 'UU 45 678', 2021, 'VF3CCYHYPML045678'],
  ['Opel', 'Crossland', 'VV 56 789', 2022, 'W0V7H9EA8N4056789'],
  ['VW', 'Polo', 'XX 67 890', 2020, 'WVWZZZ6RZLY067890'],
  ['Ford', 'Kuga', 'YY 78 901', 2021, 'WF0AXXWPMANW78901'],
  ['Kia', 'Ceed', 'ZZ 89 012', 2019, 'U5YHM813ALK089012'],
  ['Toyota', 'C-HR', 'AB 90 123', 2022, 'NMTKG3FV40R090123'],
  ['BMW', 'X3', 'CD 01 234', 2021, 'WBA5R71040G701234'],
  ['Seat', 'Arona', 'EF 12 345', 2020, 'VSSZZZ2PZKR012345'],
  ['Honda', 'HR-V', 'GH 23 456', 2021, 'SHHRU3860MU023456'],
  ['Citroën', 'C5', 'IJ 34 567', 2022, 'VF7RWRHZMRJ034567'],
  ['Nissan', 'Juke', 'KL 45 678', 2021, 'SJNFAAF16U1045678'],
  ['Mazda', '3', 'MN 56 789', 2022, 'JMZBPFL1WN1156789'],
  ['Skoda', 'Kamiq', 'OP 67 890', 2021, 'TMBBR9NE5M0167890'],
  ['Audi', 'A3', 'QR 78 901', 2020, 'WAUZZZ8V5LA278901'],
  ['Volvo', 'V90', 'ST 89 012', 2022, 'YV1PWABN7N1289012'],
  ['Mercedes', 'GLA', 'UV 90 123', 2021, 'WDC1569041J490123'],
  ['Ford', 'Explorer', 'WX 01 234', 2022, '1FMSK8JH0NGB01234'],
  ['Hyundai', 'ix35', 'YZ 12 345', 2020, 'KMHJE81BDLU012345'],
  ['VW', 'T-Roc', 'AA 23 456', 2021, 'WVGZZZ1TZMW023456'],
  ['Peugeot', '508', 'BB 34 567', 2022, 'VF3FBYHZUKL034567'],
  ['BMW', 'X1', 'CC 45 678', 2021, 'WBAXR11040G045678'],
  ['Toyota', 'Prius', 'DD 56 789', 2023, 'JTDKB3FU70R056789'],
  ['Renault', 'Kadjar', 'EE 67 890', 2020, 'VF1REJJ0563067890'],
  ['Opel', 'Mokka', 'FF 78 901', 2022, 'W0V7R9EA4N4078901'],
  ['Seat', 'Ibiza', 'GG 89 012', 2019, 'VSSZZZ6JZKR089012'],
  ['Kia', 'Stonic', 'HH 90 123', 2021, 'U5YHF813BML090123'],
  ['Honda', 'Jazz', 'II 01 234', 2020, 'SHHMK2740LU001234'],
  ['Mazda', 'CX-3', 'JJ 12 345', 2021, 'JMZKF1V5801912345'],
  ['Skoda', 'Fabia', 'KK 23 456', 2020, 'TMBEB6NE9L0123456'],
  ['Ford', 'Puma', 'LL 34 567', 2021, 'WF0JXXGAJJLW34567'],
  ['Toyota', 'Aygo', 'MM 45 678', 2022, 'JTDBT923200M45678'],
  ['VW', 'Arteon', 'NN 56 789', 2021, 'WVWZZZ3HZMK056789'],
  ['Nissan', 'Leaf', 'OO 67 890', 2022, '1N4AZ1CP2NC067890'],
  ['Hyundai', 'Kona', 'PP 78 901', 2021, 'KMHK5815CNU078901'],
  ['Audi', 'Q3', 'QQ 89 012', 2022, 'WAUZZZ8U5MA289012'],
  ['Mercedes', 'A-klasse', 'RR 90 123', 2021, 'WDD1770691J490123'],
  ['Citroën', 'C4', 'SS 01 234', 2022, 'VF7NCRHNRMJ001234'],
  ['Peugeot', '5008', 'TT 12 345', 2021, 'VF3MRHYXUKL112345'],
  ['Renault', 'Zoe', 'UU 23 456', 2022, 'VF1AG000163023456'],
  ['BMW', 'i3', 'VV 34 567', 2021, 'WBY1Z41080V134567'],
  ['Volvo', 'S60', 'XX 45 678', 2022, 'YV1PS79R9N2045678'],
  ['Seat', 'Tarraco', 'YY 56 789', 2021, 'VSSZZZ5NZKM056789'],
];

// Descriptions and parts per task type
const TASK_DETAILS = {
  'Forrude udskiftning': [
    { beskrivelse: 'Forruden er revnet fra bunden og op langs siden. Skal udskiftes hurtigst muligt.', dele: 'OEM forrude inkl. montagepakke', noter: 'Kunden ønsker at blive kontaktet når bilen er klar.' },
    { beskrivelse: 'Forruden har fået et kraftigt slag fra en lastbil på motorvejen. Akut udskiftning nødvendig.', dele: 'OEM forrude inkl. tætningsgummi', noter: 'Akut sag – kunden har ingen erstatningsbil.' },
    { beskrivelse: 'Stor revne fra stenskade der har spredt sig. Forruden er ikke til at redde.', dele: 'Forrude OEM inkl. kalibreringskit', noter: 'Kunden venter på værkstedet mens arbejdet udføres.' },
    { beskrivelse: 'Forruden er revnet fra øverste hjørne og ned. Revnen er ca. 30 cm.', dele: 'OEM forrude med ADAS-kamera', noter: 'Kunden ønsker besked 30 min før bilen er klar.' },
    { beskrivelse: 'Revne i forruden fra stenskade i kørers synsfelt. Kan ikke repareres.', dele: 'Forrude OEM inkl. montagelim', noter: 'Forsikringssag – sendes til forsikringen direkte.' },
  ],
  'Stenslag reparation': [
    { beskrivelse: 'Lille stenskade i øjenhøjde på forruden. Revnen er ca. 2 cm.', dele: 'Reparationsharpiks kit standard', noter: 'Reparation foretrækkes frem for udskiftning.' },
    { beskrivelse: 'To stenskader på forruden, begge under 2 cm. Reparation bør kunne klares inden for 30 min.', dele: 'Reparationsharpiks kit premium', noter: 'Firmabil – faktura til virksomhed.' },
    { beskrivelse: 'Enkelt stenskade ca. 1 cm i kørerens synsfelt. Skal repareres inden næste syn.', dele: 'Reparationsharpiks kit standard', noter: 'Syn om 3 uger – reparation skal bekræftes skriftligt.' },
    { beskrivelse: 'Stenskade i passagersiden af forruden. Diameter ca. 1,5 cm.', dele: 'Reparationsharpiks kit standard', noter: 'Ingen særlige ønsker.' },
    { beskrivelse: 'Stenskade med tre arme der spreder sig. Skal stoppes med det samme.', dele: 'Reparationsharpiks kit premium', noter: 'Kunden er meget tilfreds med tidligere arbejde.' },
  ],
  'Siderude udskiftning': [
    { beskrivelse: 'Venstre bagsiderude er smadret. Muligvis indbrud. Kunden har anmeldt det til politiet.', dele: 'Bagsiderude venstre OEM', noter: 'Kunden afleverer bilen kl. 08:00.' },
    { beskrivelse: 'Forreste højre siderude er knust. Kunden er forsikret og ønsker original rude.', dele: 'Siderude højre OEM', noter: 'OEM rude kræves af forsikringen.' },
    { beskrivelse: 'Bageste venstre siderude er smadret efter indbrudsforsøg.', dele: 'Bagsiderude venstre OEM', noter: 'Politirapport vedlagt. Forsikringsformular udfyldes på stedet.' },
    { beskrivelse: 'Højre siderude forreste er revnet efter trykskade fra parkering.', dele: 'Siderude højre OEM inkl. gummilist', noter: 'Kunden er til stede og venter.' },
    { beskrivelse: 'Venstre siderude bag er beskadiget. Kunden mistænker hærværk.', dele: 'Bagsiderude venstre OEM', noter: 'Sagen er anmeldt til politiet.' },
  ],
  'Bagrude udskiftning': [
    { beskrivelse: 'Bagruden er slået af vandaler natten til i dag. Kunden er meget frustreret.', dele: 'Bagrude med varmelegeme OEM', noter: 'Forsikringssag – forsikringsnummer noteret.' },
    { beskrivelse: 'Bagruden har en revne på tværs. Opvarmningselement virker ikke mere.', dele: 'Bagrude med varmelegeme OEM', noter: 'Sikre at varmelegemet testes efter montering.' },
    { beskrivelse: 'Bagrude beskadiget ved påkørsel bagfra. Kunden har stødanordning der skal tjekkes.', dele: 'Bagrude OEM inkl. tætning', noter: 'Tjek spoilerkanter før montering.' },
    { beskrivelse: 'Bagrude revnet fra indvendigt pres. Kan skyldes temperaturskift.', dele: 'Bagrude med varmelegeme OEM', noter: 'Ingen forsikringssag.' },
    { beskrivelse: 'Bagruden er knust. Kunden parkerede under et lavt stativ.', dele: 'Bagrude OEM inkl. lim og fugemasse', noter: 'Rengør ramme grundigt inden montering.' },
  ],
  'Spejl udskiftning': [
    { beskrivelse: 'Venstre sidespejl er knækket af. Glas og hus skal udskiftes.', dele: 'Sidespejl venstre komplet OEM', noter: 'Kunden ønsker originalt spejl.' },
    { beskrivelse: 'Højre sidespejl er beskadiget efter parkeringshændelse. Glas knust.', dele: 'Sidespejlsglas højre OEM', noter: 'Kun glasset udskiftes – huset er intakt.' },
    { beskrivelse: 'Venstre spejlhus knust. Elektrisk justering virker ikke.', dele: 'Sidespejl venstre komplet inkl. motor', noter: 'Test el-funktion efter montering.' },
    { beskrivelse: 'Begge sidespejlsglas knust efter hærværk. Husene er intakte.', dele: 'Spejlglas sæt venstre+højre OEM', noter: 'Begge sider monteres samme dag.' },
    { beskrivelse: 'Højre sidespejl hænger løst efter let påkørsel. Foden er brækket.', dele: 'Sidespejl højre komplet OEM', noter: 'Tjek kabeltilslutning inden aflevering.' },
  ],
};

function makeOpgave(index, repId, repIndex, dayOffset, slotIndex, customerIndex, carIndex) {
  const schedule = REP_SCHEDULES[repIndex];
  const taskTypeIndex = schedule.days[dayOffset][slotIndex];
  const [taskType, tidsestimat] = TASK_TYPES[taskTypeIndex];
  const starttid = schedule.times[slotIndex];
  const customer = CUSTOMERS[customerIndex % CUSTOMERS.length];
  const car = CARS[carIndex % CARS.length];
  const details = TASK_DETAILS[taskType][slotIndex % 5] ?? TASK_DETAILS[taskType][0];
  const orderNum = String(index + 1).padStart(3, '0');
  const dato = getWeekDate(dayOffset);
  const status = getStatus(dayOffset, slotIndex);

  return {
    id: `opgave-${index + 1}`,
    ordrenummer: `CG-${orderNum}`,
    kundenavn: customer[0],
    kundeKontakt: customer[1],
    kundeEmail: customer[2],
    kundeAdresse: customer[3],
    bil: {
      mærke: car[0],
      model: car[1],
      nummerplade: car[2],
      årstal: car[3],
      stelnummer: car[4],
    },
    opgavetype: taskType,
    beskrivelse: details.beskrivelse,
    lokation: LOKATION,
    dele: details.dele,
    noter: details.noter,
    tidsestimat,
    status,
    reparatørId: repId,
    dato,
    starttid,
  };
}

// Build 75 tasks: 3 reps × 5 days × 5 slots
export const seedOpgaver = [];

let globalIndex = 0;
const REPS = ['rep-1', 'rep-2', 'rep-3'];
const repCustomerBase = { 'rep-1': 0, 'rep-2': 25, 'rep-3': 50 };
const repCarBase = { 'rep-1': 0, 'rep-2': 25, 'rep-3': 50 };

for (let ri = 0; ri < REPS.length; ri++) {
  const repId = REPS[ri];
  for (let day = 0; day < 5; day++) {
    for (let slot = 0; slot < 5; slot++) {
      const customerIndex = repCustomerBase[repId] + day * 5 + slot;
      const carIndex = repCarBase[repId] + day * 5 + slot;
      seedOpgaver.push(makeOpgave(globalIndex, repId, ri, day, slot, customerIndex, carIndex));
      globalIndex++;
    }
  }
}

export const seedPauser = [];
