import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { articles } from '../lib/articles';
import { expertises } from '../lib/expertises';
import { serviceMedia } from '../lib/editorial-media';
import { activeDepartments } from '../lib/network';

mkdirSync('public/images/editorial', { recursive: true });
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
const line = (x1: number, y1: number, x2: number, y2: number, color: string, width = 3) =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
const circle = (x: number, y: number, r: number, color: string) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const rect = (x: number, y: number, w: number, h: number, fill: string, stroke = 'none') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
const label = (x: number, y: number, text: string, fill: string, size = 16) =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial,sans-serif" font-size="${size}">${escape(text)}</text>`;
const drop = (x: number, y: number, scale = 1) =>
  `<path d="M0 -16C-5 -7 -12 0 -12 7a12 12 0 0 0 24 0C12 0 5 -7 0 -16Z" transform="translate(${x} ${y}) scale(${scale})" fill="#56a6de"/>`;

function art(expertise: string, subject: string, seed: number, ink: string, pale: string) {
  const blue = '#0071af',
    light = '#56a6de',
    gray = '#9eafb9';
  const base = seed % 2 ? 26 : -12;
  let drawing = '';
  if (expertise === 'toiture') {
    const gutter = /gout|zinguer|raccord/.test(subject),
      window = /fenetre/.test(subject),
      compare = /devis|renov|reparer-ou/.test(subject),
      season = /saison|entretien/.test(subject),
      storm = /intemper/.test(subject),
      tile = /tuile/.test(subject);
    if (compare) {
      drawing =
        rect(475, 220, 235, 335, pale, ink) +
        rect(755, 180, 245, 375, pale, ink) +
        label(500, 260, 'ÉTAT OBSERVÉ', ink, 17) +
        label(780, 225, 'PÉRIMÈTRE', ink, 17);
      for (let i = 0; i < 5; i++)
        drawing +=
          rect(500, 295 + i * 43, 150 - (i % 2) * 35, 5, gray) +
          rect(780, 270 + i * 45, 165 - (i % 3) * 25, 5, i === 2 ? blue : gray);
      drawing +=
        line(670, 600, 825, 600, blue, 4) +
        line(810, 585, 825, 600, blue) +
        line(810, 615, 825, 600, blue);
    } else {
      drawing = `<path d="M455 ${445 + base}L748 ${212 + base}L1080 ${445 + base}L748 ${530 + base}Z" fill="${pale}" stroke="${ink}" stroke-width="4"/><path d="M455 ${445 + base}V555L748 650L1080 555V${445 + base}" fill="none" stroke="${ink}" stroke-width="4"/>`;
      for (let i = 1; i < 5; i++)
        drawing += line(
          455 + i * 59,
          445 - i * 46 + base,
          748 + i * 66,
          530 - i * 17 + base,
          gray,
          2,
        );
      for (let i = 1; i < 4; i++)
        drawing += line(
          455 + i * 73,
          445 + i * 21 + base,
          748 + i * 83,
          212 + i * 58 + base,
          gray,
          2,
        );
      if (window)
        drawing +=
          `<path d="M680 365L780 294L875 353L775 405Z" fill="${light}" stroke="${ink}" stroke-width="5"/><path d="M671 357L780 278L890 351" stroke="${blue}" fill="none" stroke-width="5"/>` +
          label(625, 650, 'OUVERTURE / JONCTIONS', ink, 17);
      else if (gutter)
        drawing +=
          `<path d="M455 ${457 + base}L748 ${544 + base}L1080 ${457 + base}V590" fill="none" stroke="${blue}" stroke-width="13"/>` +
          drop(1080, 620, 0.9) +
          line(950, 592, 1040, 592, light, 4) +
          label(650, 685, 'COLLECTER · CONDUIRE · ÉVACUER', ink, 16);
      else if (season) {
        for (let i = 0; i < 4; i++)
          drawing += circle(510 + i * 150, 655, 13, [blue, light, gray, ink][i]);
        drawing +=
          line(510, 655, 960, 655, gray, 2) +
          label(520, 704, 'OBSERVER / CONSIGNER / ENTRETENIR', ink, 15);
      } else if (tile)
        drawing +=
          `<path d="M700 350L750 315L810 360L760 397Z" fill="${blue}"/><path d="M750 319L744 341L764 352L754 383" fill="none" stroke="white" stroke-width="4"/>` +
          circle(754, 352, 85, 'none') +
          `<circle cx="754" cy="352" r="85" fill="none" stroke="${light}" stroke-width="3" stroke-dasharray="6 8"/>`;
      else {
        drawing +=
          line(815, 220, 815, 320, light, 3) +
          drop(815, 348) +
          drop(790, 440, 0.75) +
          `<path d="M795 472L770 500L780 535L760 570" fill="none" stroke="${blue}" stroke-width="5"/>`;
      }
      if (storm)
        for (let i = 0; i < 4; i++)
          drawing += `<path d="M${500 + i * 100} 170q70 -30 110 0" fill="none" stroke="${light}" stroke-width="4"/>`;
    }
  } else if (expertise === 'nuisibles') {
    const bed = /punaise/.test(subject),
      roach = /blatte|cafard/.test(subject),
      wasp = /guepe|frelon|nid/.test(subject),
      map = /acces|professionnel|suivi|intervention/.test(subject);
    if (map) {
      drawing =
        rect(480, 215, 555, 380, pale, ink) +
        line(700, 215, 700, 480, ink, 4) +
        line(700, 410, 1035, 410, ink, 4) +
        line(480, 470, 635, 470, ink, 4);
      const positions = [
        [570, 300],
        [850, 320],
        [870, 510],
      ];
      positions.forEach(([x, y], i) => {
        drawing +=
          `<circle cx="${x}" cy="${y}" r="${28 + i * 5}" fill="none" stroke="${blue}" stroke-width="3" stroke-dasharray="5 7"/>` +
          circle(x, y, 6, blue) +
          label(x + 42, y + 5, `0${i + 1}`, ink);
      });
      drawing += label(510, 665, 'ZONES · ACCÈS · OBSERVATIONS', ink, 17);
    } else {
      drawing = `<circle cx="765" cy="395" r="205" fill="${pale}"/><circle cx="765" cy="395" r="225" fill="none" stroke="${gray}" stroke-width="2" stroke-dasharray="3 10"/>`;
      if (bed || roach || wasp) {
        const ry = roach ? 100 : wasp ? 78 : 65,
          rx = roach ? 48 : wasp ? 45 : 67;
        drawing +=
          `<ellipse cx="770" cy="400" rx="${rx}" ry="${ry}" fill="${blue}"/>` +
          circle(770, 310, 28, ink);
        for (let i = 0; i < 3; i++) {
          const y = 350 + i * 50;
          drawing += line(735, y, 665, y - 25, ink, 5) + line(805, y, 875, y - 25, ink, 5);
        }
        drawing += line(755, 290, 725, 255, ink, 4) + line(785, 290, 815, 255, ink, 4);
        if (wasp)
          drawing +=
            `<ellipse cx="700" cy="360" rx="70" ry="34" transform="rotate(32 700 360)" fill="${light}" fill-opacity=".7"/><ellipse cx="840" cy="360" rx="70" ry="34" transform="rotate(-32 840 360)" fill="${light}" fill-opacity=".7"/>` +
            line(735, 390, 805, 390, pale, 10) +
            line(735, 425, 805, 425, pale, 10);
        else if (bed)
          for (let i = 0; i < 4; i++)
            drawing += line(715, 365 + i * 22, 825, 365 + i * 22, light, 2);
        drawing += label(600, 680, 'IDENTIFIER AVANT DE DÉCIDER', ink, 17);
      } else {
        drawing +=
          `<path d="M620 440C580 395 640 340 735 350C810 300 880 345 900 385L940 420L895 440L680 465Z" fill="${blue}"/><path d="M625 435C540 475 525 380 565 345" fill="none" stroke="${blue}" stroke-width="10" stroke-linecap="round"/>` +
          circle(840, 338, 36, blue) +
          circle(840, 338, 22, light) +
          circle(900, 392, 5, pale) +
          line(700, 455, 680, 490, ink, 6) +
          line(850, 451, 865, 482, ink, 6) +
          label(610, 680, 'INDICES / PÉRIMÈTRE / SUIVI', ink, 17);
      }
    }
  } else if (expertise === 'peinture-facades') {
    const crack = /fissur/.test(subject),
      humid = /humid/.test(subject),
      color = /finitions|interieure|devis/.test(subject);
    drawing =
      rect(470, 190, 360, 390, pale, ink) +
      rect(830, 190, 175, 390, blue) +
      line(470, 580, 1005, 580, ink, 4);
    if (crack)
      drawing +=
        `<path d="M660 230L638 290L675 340L625 415L646 475L620 540" fill="none" stroke="${ink}" stroke-width="5"/>` +
        line(690, 345, 960, 310, light) +
        label(760, 290, 'RELEVER', ink);
    else if (humid) {
      for (let i = 0; i < 5; i++)
        drawing += `<path d="M${490 + i * 48} 565q-20 -${60 + (i % 3) * 30} 8 -125q25 50 10 125" fill="${light}" fill-opacity=".7"/>`;
      drawing += label(490, 650, 'CAUSE / SUPPORT / FINITION', ink, 17);
    } else if (color) {
      [ink, blue, light, '#9eafb9'].forEach((c, i) => {
        drawing += rect(505 + i * 75, 280 + i * 18, 100, 170, c, pale);
      });
      drawing += label(495, 650, 'USAGES · LUMIÈRE · MATIÈRE', ink, 17);
    } else
      drawing +=
        `<path d="M1005 310h60v140h-70v95" fill="none" stroke="${ink}" stroke-width="10"/>` +
        rect(910, 235, 155, 75, light, ink) +
        rect(977, 525, 35, 85, ink) +
        label(510, 650, 'PRÉPARER AVANT DE RECOUVRIR', ink, 17);
    drawing +=
      line(470, 145, 1005, 145, gray, 2) +
      line(470, 135, 470, 155, gray) +
      line(1005, 135, 1005, 155, gray);
  } else if (expertise === 'nettoyage') {
    const delicate = /delicat|surface/.test(subject),
      offices = /bureaux|locaux|charges/.test(subject),
      works = /travaux/.test(subject);
    drawing = `<path d="M470 355L755 215L1070 380L780 590Z" fill="${pale}" stroke="${ink}" stroke-width="4"/>`;
    for (let i = 1; i < 5; i++)
      drawing +=
        line(470 + i * 57, 355 - i * 28, 780 + i * 58, 590 - i * 42, gray, 2) +
        line(470 + i * 62, 355 + i * 47, 755 + i * 63, 215 + i * 33, gray, 2);
    if (delicate)
      drawing +=
        `<circle cx="775" cy="400" r="90" fill="${blue}"/><path d="M735 400l26 28 60 -62" fill="none" stroke="white" stroke-width="8"/>` +
        label(570, 670, 'IDENTIFIER LE REVÊTEMENT', ink, 17);
    else if (offices)
      drawing +=
        rect(575, 245, 245, 115, blue, ink) +
        line(590, 360, 590, 455, ink, 8) +
        line(805, 360, 805, 420, ink, 8) +
        rect(860, 340, 90, 110, light, ink) +
        label(540, 670, 'ZONES · TÂCHES · FRÉQUENCES', ink, 17);
    else if (works)
      drawing +=
        rect(550, 290, 100, 110, gray, ink) +
        rect(650, 265, 110, 120, light, ink) +
        `<path d="M850 220L775 475L920 515" fill="none" stroke="${blue}" stroke-width="12"/>` +
        label(565, 670, 'RÉSIDUS / SUPPORTS / ACCÈS', ink, 17);
    else
      drawing +=
        `<path d="M910 205L760 485" fill="none" stroke="${blue}" stroke-width="13"/>` +
        `<path d="M675 470L785 505L850 460L745 430Z" fill="${blue}" stroke="${ink}" stroke-width="3"/>` +
        label(560, 670, 'PRÉCISER LE PÉRIMÈTRE', ink, 17);
    drawing += line(1040, 550, 1060, 570, light, 4) + line(1060, 550, 1040, 570, light, 4);
  } else if (expertise === 'climatisation-mobile') {
    const compare = /achat/.test(subject),
      volume = /puissance/.test(subject);
    drawing =
      rect(460, 190, 570, 400, pale, ink) +
      rect(870, 220, 115, 175, '#beddeb', ink) +
      line(925, 220, 925, 395, ink, 3) +
      rect(620, 350, 155, 215, blue, ink);
    for (let i = 0; i < 4; i++) drawing += line(640, 385 + i * 18, 755, 385 + i * 18, light, 5);
    drawing +=
      circle(650, 575, 11, ink) +
      circle(745, 575, 11, ink) +
      `<path d="M775 490C875 490 835 330 925 330H1065" fill="none" stroke="${gray}" stroke-width="27"/><path d="M790 490C865 485 840 330 925 330H1065" fill="none" stroke="${ink}" stroke-width="2" stroke-dasharray="3 9"/>`;
    for (let i = 0; i < 3; i++)
      drawing += `<path d="M610 ${410 + i * 35}q-90 -${30 + i * 15} -135 0" fill="none" stroke="${light}" stroke-width="4"/>`;
    if (compare) drawing += label(500, 665, 'DURÉE / CONDITIONS / RETOUR', ink, 17);
    else if (volume)
      drawing +=
        line(490, 640, 1025, 640, blue, 3) +
        label(570, 685, 'VOLUME · EXPOSITION · USAGES', ink, 17);
    else drawing += label(505, 665, 'INSTALLATION / ÉVACUATION', ink, 17);
  } else if (expertise === 'network') {
    drawing = circle(765, 205, 58, blue) + label(726, 211, 'RÉSEAU', 'white', 17);
    activeDepartments().forEach((d, i) => {
      const x = 530 + i * 210;
      drawing +=
        line(765, 263, x, 400, gray, 3) +
        rect(x - 75, 400, 150, 145, pale, ink) +
        label(x - 30, 460, d.code, blue, 40) +
        label(x - 51, 510, 'TERRITOIRE', ink, 14);
    });
    drawing += label(505, 655, 'DÉPARTEMENT → COMMUNE → MÉTIER', ink, 16);
  } else {
    const documents = /attestation|justificatif|reglement|frequence/.test(subject);
    if (documents) {
      drawing = rect(570, 170, 370, 440, pale, ink) + label(610, 225, 'INSTALLATION', ink, 19);
      for (let i = 0; i < 5; i++) drawing += rect(610, 270 + i * 47, 220 - (i % 2) * 45, 5, gray);
      drawing +=
        `<circle cx="895" cy="565" r="70" fill="${blue}"/><path d="M860 565l25 25 48 -58" fill="none" stroke="white" stroke-width="8"/>` +
        label(590, 685, 'IDENTIFIER · CONSERVER · VÉRIFIER', ink, 16);
    } else {
      drawing =
        `<path d="M470 560L705 370L1055 560" fill="none" stroke="${ink}" stroke-width="5"/>` +
        rect(705, 180, 170, 420, pale, ink) +
        rect(750, 180, 80, 420, blue) +
        rect(685, 155, 210, 35, gray, ink) +
        line(790, 125, 790, 400, ink, 7);
      for (let i = 0; i < 7; i++) drawing += line(745, 325 + i * 12, 835, 325 + i * 12, ink, 3);
      [0, 1, 2, 3, 4].forEach((i) => {
        drawing += circle(760 + (i % 2) * 50, 460 + i * 22, 4, gray);
      });
      drawing += label(560, 685, 'CONDUIT / ACCÈS / DOCUMENTS', ink, 17);
    }
  }
  // Each owner gets a distinct composition as well as distinct subject matter.
  return `<g transform="translate(${(seed % 3) * 9 - 9} ${(seed % 2) * 8})">${drawing}</g>`;
}

const assets: { path: string; owner: string; title: string; kind: string; sha256: string }[] = [];
function save(owner: string, file: string, title: string, expertise: string, index: number) {
  const dark = index % 4 === 0,
    background = dark ? '#08162a' : '#edf2f5',
    ink = dark ? '#edf2f5' : '#142c3b',
    pale = dark ? '#193449' : '#ffffff';
  const category = expertises.find((e) => e.id === expertise)?.name ?? 'Le réseau';
  const words = title.replace(/\s*[:?].*$/, '').split(' '),
    lines: string[] = [];
  for (const word of words) {
    if (!lines.length || lines.at(-1)!.length + word.length > 23) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760" role="img" aria-labelledby="title description"><title id="title">${escape(title)}</title><desc id="description">Schéma éditorial illustratif, création originale. ${escape(category)}. Aucune réalisation ni entreprise représentée.</desc><rect width="1200" height="760" fill="${background}"/><path d="M50 100H1150M50 710H1150" stroke="${dark ? '#345069' : '#cbd8e0'}"/><path d="M420 140V660" stroke="${dark ? '#345069' : '#cbd8e0'}"/>${label(55, 70, category.toUpperCase(), dark ? '#9fcce8' : '#006b99', 17)}${label(1110, 70, String(index + 1).padStart(2, '0'), ink, 16)}${lines
    .slice(0, 6)
    .map(
      (text, i) =>
        `<text x="55" y="${245 + i * 47}" fill="${ink}" font-family="Georgia,serif" font-size="35">${escape(text)}</text>`,
    )
    .join(
      '',
    )}${label(55, 640, 'OBSERVER.', ink, 15)}${label(55, 667, 'COMPRENDRE. PRÉPARER.', ink, 15)}${art(expertise, owner, index, ink, pale)}${label(55, 740, 'SOLUTION HABITATION · SCHÉMA ILLUSTRATIF', dark ? '#9fcce8' : '#536875', 12)}</svg>`;
  writeFileSync(`public${file}`, svg);
  assets.push({
    path: file,
    owner,
    title,
    kind: 'original-svg-diagram',
    sha256: createHash('sha256').update(svg).digest('hex'),
  });
}
for (const article of articles)
  save(`article:${article.slug}`, article.image, article.title, article.expertise, assets.length);
for (const e of expertises)
  for (const s of e.services)
    save(
      `service:${e.id}/${s.slug}`,
      serviceMedia(e.id, s.slug, s.name).src,
      s.name,
      e.id,
      assets.length,
    );
save(
  'network:overview',
  '/images/editorial/reseau-territorial.svg',
  'Des territoires et des savoir-faire',
  'network',
  assets.length,
);
save(
  'expertise:climatisation-mobile',
  '/images/editorial/expertise-climatisation-mobile.svg',
  'Un confort adapté au lieu',
  'climatisation-mobile',
  assets.length,
);
writeFileSync(
  'data/media-inventory.json',
  JSON.stringify(
    {
      version: 1,
      license:
        'Créations SVG originales du projet ; illustrations conceptuelles, jamais présentées comme réalisations.',
      assets,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `${assets.length} illustrations distinctes enregistrées dans data/media-inventory.json.`,
);
