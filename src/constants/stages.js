export const STAGES = [
  {
    question: "Quelle surface de forêt l’humanité détruit-elle chaque année ?",
    answer: "10 000 000",
    unit: "hectares",
    glyphs: ['|'],
    voice: '/audio/voice_1.mp3',
    script: [{ text: "Apparemment, nous avions besoin de cet espace pour autre chose.", delay: 500 }],
    fact: "10 000 000 d'hectares par an. L'équivalent d'un pays européen moyen.",
    source: "https://openknowledge.fao.org/...",
    volume: 0.8
  },
  {
    question: "Quelle quantité de plastique finit dans l’océan chaque année ?",
    answer: "11 000 000",
    unit: "tonnes",
    glyphs: ['~'],
    voice: '/audio/voice_2.mp3',
    script: [
      { text: "Une trace indélébile. ", delay: 500 },
      { text: "C'est peut-être tout ce qu'il restera de nous.", delay: 800 }
    ],
    fact: "11 000 000 de tonnes. Aucun mécanisme naturel de disparition.",
    source: "https://www.unep.org/...",
    volume: 0.75
  },
  {
    question: "Quelle quantité d’eau est nécessaire pour produire un steak de 200 g ?",
    answer: "3 000",
    unit: "litres",
    glyphs: ['·'],
    voice: '/audio/voice_3.mp3',
    script: [
      { text: "Un investissement très rentable, ", delay: 500 },
      { text: "n'est-ce pas ?", delay: 1200 }
    ],
    fact: "3 000 litres. Une consommation invisible au moment de l’achat.",
    source: "https://waterfootprint.org/...",
    volume: 0.7
  },
  {
    question: "Quelle part de la biomasse d’insectes volants a disparu en une génération ?",
    answer: "80",
    unit: "%",
    glyphs: ['*'],
    voice: '/audio/voice_4.mp3',
    script: [
      { text: "Il faudra sans doute finir par s'y habituer. ", delay: 500 },
      { text: "Au silence, je veux dire.", delay: 1000 }
    ],
    fact: "80 % de déclin. Un effondrement mesuré sur trente ans.",
    source: "https://www.nature.com/...",
    volume: 0.6
  },
  {
    question: "Quelle masse de déchets électroniques l’humanité produit-elle chaque année ?",
    answer: "62 000 000",
    unit: "tonnes",
    glyphs: ['x'],
    voice: '/audio/voice_5.mp3',
    script: [
      { text: "On empile, on jette, et on recommence. ", delay: 500 },
      { text: "C’est un cycle comme un autre.", delay: 700 }
    ],
    fact: "62 000 000 de tonnes. Une croissance plus rapide que le recyclage.",
    source: "https://ewastemonitor.info/...",
    volume: 0.5
  },
  {
    question: "Combien de personnes meurent chaque année à cause de la pollution de l’air ?",
    answer: "7 000 000",
    unit: "personnes",
    glyphs: ['-'],
    voice: '/audio/voice_6.mp3',
    script: [
      { text: "Une statistique stable. ", delay: 500 },
      { text: "C'est le prix à payer pour continuer de circuler.", delay: 800 }
    ],
    fact: "7 000 000 de morts. Mortalité documentée à l’échelle mondiale.",
    source: "https://www.who.int/...",
    volume: 0.4
  },
  {
    question: "Quelle quantité de CO₂ l’humanité rejette-t-elle chaque année ?",
    answer: "37 000 000 000",
    unit: "tonnes",
    glyphs: ['§'],
    voice: '/audio/voice_7.mp3',
    script: [
      { text: "Le ciel change, mais les indicateurs sont au vert. ", delay: 500 },
      { text: "C'est l'essentiel.", delay: 800 }
    ],
    fact: "37 000 000 000 de tonnes. Accumulation atmosphérique nette.",
    source: "https://www.globalcarbonproject.org/...",
    volume: 0.3
  },
  {
    question: "Quelle masse de glace terrestre disparaît chaque année ?",
    answer: "1 000 000 000 000",
    unit: "tonnes",
    glyphs: ['^'],
    voice: '/audio/voice_8.mp3',
    script: [
      { text: "C'est physique. C'est mathématique. ", delay: 500 },
      { text: "C'est définitif.", delay: 1000 }
    ],
    fact: "1 000 000 000 000 de tonnes. Perte mesurée par satellites.",
    source: "https://essd.copernicus.org/...",
    volume: 0.2
  },
  {
    question: "Combien d’espèces disparaissent définitivement chaque année ?",
    answer: "36 000",
    unit: "espèces",
    glyphs: ['&'],
    voice: '/audio/voice_9.mp3',
    script: [
      { text: "On simplifie l'équation du vivant. ", delay: 500 },
      { text: "C'est beaucoup plus lisible ainsi.", delay: 800 }
    ],
    fact: "36 000 espèces rayées du registre. Taux d'extinction record.",
    source: "https://ipbes.net/...",
    volume: 0.12
  },
  {
    question: "Quel est le déclin moyen des populations de vertébrés depuis 1970 ?",
    answer: "73",
    unit: "%",
    glyphs: ['°'],
    voice: '/audio/voice_10.mp3',
    script: [
      { text: "La pièce est presque vide. ", delay: 500 },
      { text: "On va pouvoir fermer boutique.", delay: 1000 }
    ],
    fact: "73 % de déclin. Population mondiale des vertébrés.",
    source: "https://livingplanet.panda.org/",
    volume: 0.08
  }
];