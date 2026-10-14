// Elenco: cada personagem tem rosto, cabelo, figurino e proporções próprios — sempre os mesmos em todas as cenas.
import { makeToon } from './toon.js';

const DG_POLO = { type: 'polo', color: 0xf7f8fa, collar: 0x1b3260, shortSleeve: true, logo: true, logoW: 0.075, logoX: 0.085, logoY: 0.37 };
export const CAST = {
  // Prefeitura
  prefeito: { name: 'Antonio', key: 'prefeito', scale: 1.0, width: 1.12, belly: 1, skin: 0xd8a27c, eyes: 0x4a2e1c, hair: { style: 'bald', color: 0xa7a29c }, brows: 0x8f8a84, mustache: 0x9c9690,
    top: { type: 'suit', color: 0x22304f, tie: 0xa31f2a, pocket: 0xf4f4f4 }, pants: 0x22304f, shoes: 0x16110f, watch: 0xc9a24a, jawW: 1.06 },
  claudia: { name: 'Claudia', key: 'claudia', female: true, scale: 0.95, width: 0.93, skin: 0xc48a62, eyes: 0x3b2416, hair: { style: 'bun', color: 0x2a1a12, tie: 0x8a1f35 }, glasses: 0xb3263c,
    lip: '#8f3444', top: { type: 'blouse', color: 0x1d8a86, necklace: 0xd4af37 }, pants: 0x34384a, shoes: 0x5a1f2a, belt: false },
  rafael: { name: 'Rafael', key: 'rafael', scale: 1.03, width: 0.95, skin: 0x8a5737, eyes: 0x2b1a10, hair: { style: 'curly', color: 0x17110d },
    top: { type: 'shirt', color: 0xa6c8ea, pocketPen: true }, pants: 0xb8a07a, shoes: 0x4a2f1f, lanyard: 0x1f5fa8, badge: 'RAFAEL' },
  marcos: { name: 'Marcos', key: 'marcos', scale: 0.93, width: 1.12, belly: 0.6, skin: 0xe2ae8c, eyes: 0x3a5a7a, hair: { style: 'buzz', color: 0x3a2a20 }, goatee: 0x3a2a20, stubble: 0x3a2a20,
    top: { type: 'polo', color: 0xd9a03a, collar: 0xc48a28, shortSleeve: true }, pants: 0x3b5578, shoes: 0x2a2a2a, lanyard: 0x1f5fa8, badge: 'MARCOS' },
  juliana: { name: 'Juliana', key: 'juliana', female: true, scale: 0.93, width: 0.9, skin: 0xf1c9a9, eyes: 0x4f7a3a, hair: { style: 'ponytail', color: 0x8c3a1c, tie: 0xe0507a },
    lip: '#b4505a', top: { type: 'cardigan', color: 0xe9b63c, inner: 0xffffff }, pants: 0x3d5a8a, shoes: 0xf2f2f2, sole: 0xe0e0e0, belt: false },
  jose: { name: 'Jose', key: 'jose', scale: 0.91, width: 1.0, skin: 0xc4956f, eyes: 0x4a3a2a, hair: { style: 'bald', color: 0xe9e6e1 }, brows: 0xe0ddd8, mustache: 0xeeeae4, hat: { color: 0x6b5a48 },
    top: { type: 'plaid', color: 0x9b4a3a }, pants: 0x5a5048, shoes: 0x3a2a1f },
  paulo: { name: 'Paulo', key: 'paulo', scale: 0.98, width: 1.0, skin: 0xeabfa0, eyes: 0x3a4a5a, hair: { style: 'bald', color: 0x4a443f }, glasses: 0x1a1a1a,
    top: { type: 'vest', color: 0x3f6b4f, sleeve: 0xf4f5f7, shirt: 0xf4f5f7, cuffColor: 0xf4f5f7, tie: 0x24324f }, pants: 0x4a4a52, shoes: 0x241a14 },
  fatima: { name: 'Fatima', key: 'fatima', female: true, scale: 0.9, width: 1.02, skin: 0xb27650, eyes: 0x3a2416, hair: { style: 'bob', color: 0x9a948e }, glasses: 0xc9a24a,
    lip: '#7f3a40', top: { type: 'blouse', color: 0x6b3f8a }, pants: 0x2f2f3a, shoes: 0x2a1a1a, belt: false },
  // Equipe DigitalGov
  ana: { name: 'Ana', key: 'ana', female: true, scale: 0.94, width: 0.9, skin: 0xd8a27e, eyes: 0x2a1a10, hair: { style: 'bob', color: 0x15100e }, lip: '#a0404c',
    top: DG_POLO, pants: 0x2a3550, shoes: 0x1c1c22, belt: false },
  diego: { name: 'Diego', key: 'diego', scale: 1.0, width: 1.0, skin: 0xa86e4a, eyes: 0x2b1a10, hair: { style: 'short', color: 0x1d1611 }, glasses: 0x1a1a1a,
    top: DG_POLO, pants: 0x2a3550, shoes: 0x1c1c22 },
  bruna: { name: 'Bruna', key: 'bruna', female: true, scale: 0.95, width: 0.92, skin: 0x7a4a30, eyes: 0x2a1a10, hair: { style: 'afro', color: 0x1a1210 }, lip: '#6a2a2e',
    top: DG_POLO, pants: 0x2a3550, shoes: 0x1c1c22, belt: false },
  lucas: { name: 'Lucas', key: 'lucas', scale: 1.0, width: 0.98, skin: 0xf0c4a0, eyes: 0x4a6a8a, hair: { style: 'quiff', color: 0x7a5a32 },
    top: DG_POLO, pants: 0x2a3550, shoes: 0x1c1c22 },
  // Protagonista
  heroi: { name: 'DigitalGov', key: 'heroi', scale: 1.0, width: 1.06, skin: 0xc99474, eyes: 0x4a2e1c, hair: { style: 'quiff', color: 0x1f1712 }, jawW: 1.0, eyeS: 0.9, lid: 0.97, browW: 0.009, mouthY: -0.052,
    top: { type: 'blazer', color: 0x1c2a45, shirt: 0xe3edf8, logo: true, logoW: 0.1, logoX: 0.105, logoY: 0.345 }, pants: 0x1c2a45, shoes: 0x2b1a12 },
};
export function make(key, extra = {}) { return makeToon({ ...CAST[key], ...extra }); }
