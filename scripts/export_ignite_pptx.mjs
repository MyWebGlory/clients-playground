import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire('/Users/gabriel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');
const pptxgen = require('pptxgenjs');
const sharp = require('sharp');

const repo = '/Users/gabriel/Documents/3 - Perso/Finances/Dev/clients-playground';
const downloads = '/Users/gabriel/Downloads';
const scratch = path.join(repo, 'outputs/ignite-reexport-scratch');
fs.mkdirSync(scratch, { recursive: true });

const heroSource = path.join(repo, 'public/clients/rxvp/projects/ignite-collateral/assets/top-woman.png');
const heroCropped = path.join(scratch, 'top-woman-hero-crop.png');
await sharp(heroSource).resize(1632, 500, { fit: 'cover', position: 'top' }).png().toFile(heroCropped);
const logoPath = path.join(repo, 'public/clients/rxvp/assets/images/rxvp-logo.png');
const deepaPath = path.join(repo, 'public/clients/rxvp/projects/ignite-collateral/assets/deepa-desai.png');
const bonniePath = path.join(repo, 'public/clients/rxvp/projects/ignite-collateral/assets/bonnie-lappin.png');

const downloadsPptx = path.join(downloads, 'RxVP-ignite-Program.pptx');

const pptx = new pptxgen();
pptx.author = 'RxVP';
pptx.company = 'RxVP';
pptx.subject = 'IGNITE public speaking and executive presence coaching';
pptx.title = 'RxVP IGNITE Program';
pptx.lang = 'en-US';
pptx.defineLayout({ name: 'LETTER_PORTRAIT', width: 8.5, height: 11 });
pptx.layout = 'LETTER_PORTRAIT';
// Requested: one font family across the entire document.
pptx.theme = { headFontFace: 'Montserrat', bodyFontFace: 'Montserrat', lang: 'en-US' };

const C = { ink:'241F27', purple:'4A075C', deepPurple:'3B0648', night:'190B20', gold:'C9A532', goldLight:'E6CF72', paper:'FBF8ED', lavender:'F7F0F8', rule:'DED2E2', muted:'5F5863', soft:'756D79', white:'FFFFFF' };
const S = pptx.ShapeType;

function line(slide, x, y, w, color = C.rule, pt = 0.75) { slide.addShape(S.line, { x, y, w, h: 0, line: { color, pt } }); }
function text(slide, value, x, y, w, h, opts = {}) {
  slide.addText(value, { x, y, w, h, margin: opts.margin ?? 0.01, fit: opts.fit ?? 'shrink', fontFace: 'Montserrat', fontSize: opts.fontSize ?? 10, color: opts.color ?? C.ink, bold: opts.bold ?? false, align: opts.align ?? 'left', valign: opts.valign ?? 'top', breakLine: false, paraSpaceAfterPt: opts.paraSpaceAfterPt ?? 0, paraSpaceBeforePt: opts.paraSpaceBeforePt ?? 0 });
}
function label(slide, value, x, y, w, h, fontSize = 9) { text(slide, value.toUpperCase(), x, y, w, h, { color: C.purple, fontSize, bold: true, fit: 'shrink' }); }
function bulletList(slide, items, x, y, w, h, opts = {}) { text(slide, items.map(i => `• ${i}`).join('\n'), x, y, w, h, { fontSize: opts.fontSize ?? 9.2, bold: opts.bold ?? true, color: opts.color ?? C.ink, margin: 0.02, fit: 'shrink' }); }
function footer(slide) { line(slide, 0.56, 10.42, 7.38, C.rule, 0.75); text(slide, 'RxVP', 0.56, 10.53, 1.4, 0.14, { fontSize: 7.3, bold: true, color: C.soft }); text(slide, 'PUBLIC SPEAKING AND EXECUTIVE PRESENCE COACHING', 3.42, 10.53, 4.52, 0.14, { fontSize: 7.3, bold: true, color: C.soft, align: 'right' }); }

function addPageOne() {
  const slide = pptx.addSlide(); slide.background = { color: C.white };
  slide.addImage({ path: heroCropped, x: 0, y: 0, w: 8.5, h: 2.61 });
  text(slide, "THE FIRST AND ONLY SPEAKER'S BUREAU IN LIFE SCIENCES", 2.18, 0.18, 5.78, 0.13, { fontSize: 10.5, bold: true, color: 'F3DC78', align: 'center' });
  text(slide, 'PROUDLY PRESENTS', 0.52, 0.76, 2.85, 0.18, { fontSize: 8.5, bold: true, color: C.goldLight });
  text(slide, 'IGNITE', 0.52, 0.98, 3.35, 0.56, { fontSize: 48, bold: true, color: C.white });
  text(slide, 'High-impact\npublic speaking for life sciences\nleaders', 0.52, 1.70, 3.42, 0.64, { fontSize: 14.5, bold: true, color: C.white });
  text(slide, 'Igniting next-in-line talent to excel as\nenterprise leaders', 0.5, 2.86, 4.35, 0.60, { fontSize: 17.5, bold: true, color: C.purple });
  text(slide, 'Ignite is a hands-on leadership accelerator that trains high -potential talent to communicate with clarity, confidence, and influence in the moments that matter most. Through immersive coaching, real-world speaking opportunities, and high-stakes practice, participants evolve into compelling enterprise voices—ready to lead, influence, and represent their organizations on any stage.', 0.5, 3.52, 4.36, 1.22, { fontSize: 9.7, bold: true, color: C.muted });
  label(slide, 'Core advantages', 5.33, 2.88, 2.45, 0.22, 10.8); bulletList(slide, ['Speaking practice on 3 different panel events', 'Practitioner speaking coaches who know the life sciences stage'], 5.33, 3.17, 2.42, 0.76, { fontSize: 11.2 });
  line(slide, 0.5, 4.55, 3.64); line(slide, 4.39, 4.55, 3.61);
  text(slide, 'Real-World Speaking Opportunities', 0.5, 4.69, 3.45, 0.31, { fontSize: 11.1, bold: true, color: C.purple });
  text(slide, 'RxVP panels\nRxVP fireside chats\nStrategic stakeholder engagements\nIndustry conferences\nRxVP/ERG collaborations', 0.5, 5.14, 3.58, 0.74, { fontSize: 9.2, bold: true, color: C.ink });
  text(slide, 'Each participant receives three high-value speaking opportunities over six months. Experiences may be virtual or in person and designed for internal or external audiences.', 0.5, 5.93, 3.54, 0.54, { fontSize: 9.25, bold: true, color: C.muted });
  text(slide, 'Practitioner-Led Coaching', 4.39, 4.69, 3.45, 0.31, { fontSize: 11.1, bold: true, color: C.purple }); text(slide, 'RxVP Speaker coaches are active public speakers.', 4.39, 5.08, 3.48, 0.30, { fontSize: 9.25, bold: true, color: C.muted }); bulletList(slide, ['The Art of the Narrative: Crafting and telling your strategic story with impact','The Art of the Stage: How to engage both virtual and in-person audiences','The Art of the Pivot: Reading the panel flow and seamlessly adjusting','The Art of the Hot Seat: Navigating difficult live questions and delivering interesting answers on the spot.'], 4.42, 5.45, 3.38, 1.46, { fontSize: 8.1 });
  label(slide, 'Program Objectives', 0.66, 6.84, 3.6, 0.2, 9.8);
  bulletList(slide, ['Communicate with executive-level confidence and credibility in internal meetings','Strengthen leadership presence in high-visibility forums','Deliver clear, concise, and compelling messages under pressure'], 0.66, 7.14, 3.55, 2.9, { fontSize: 9.2 });
  bulletList(slide, ['Engage diverse audiences with authenticity and authority','Represent your company with thought leadership impact','Navigate panel discussions and live Q&A with agility and confidence'], 4.25, 7.14, 3.69, 2.9, { fontSize: 9.2 });
}

function addPageTwo() {
  const slide = pptx.addSlide(); slide.background = { color: C.white };
  slide.addImage({ path: logoPath, x: 0.56, y: 0.27, w: 1.08, h: 0.62 });
  text(slide, 'DETAILED PROGRAM INFORMATION', 5.55, 0.34, 2.4, 0.18, { fontSize: 8.4, bold: true, color: C.purple, align: 'right' });
  text(slide, 'Participants leave the program better prepared to communicate with executive-level confidence, represent the organization with thought leadership impact, and navigate high-visibility forums with agility.', 0.56, 1.34, 6.95, 0.78, { fontSize: 19.2, bold: true, color: C.purple });

  label(slide, 'Our Practitioner Coaches', 0.56, 2.42, 3.6, 0.18, 9.8);

  slide.addImage({ path: deepaPath, x: 0.56, y: 2.78, w: 1.12, h: 1.12 });
  text(slide, 'Dr Deepa Desai', 1.82, 2.98, 2.25, 0.25, { fontSize: 14.5, bold: true, color: C.purple });
  line(slide, 0.56, 4.03, 3.51);
  text(slide, "Dr. Deepa Desai is a globally recognized healthcare executive, public speaker, leadership strategist, and executive presence advisor with more than 20 years of experience leading transformation across the life sciences sector.\n\nShe serves as Founder and CEO of D Cube Consultancy, Head of Asia Pacific for RxVP, Global Board Director at the Healthcare Businesswomen's Association, and has held numerous VP roles in major corporations.\n\nThrough these leadership roles, she helps emerging leaders strengthen executive presence, elevate strategic communication, and speak with confidence, credibility, and influence.\n\nDeepa is a frequent speaker at life sciences conferences and leadership forums across the United States and Europe. She has also expanded the Healthcare Businesswomen’s Association in India to a growing community of 700 members by building panels, summits, and chapters across the country.", 0.56, 4.13, 3.51, 3.83, { fontSize: 8.2, bold: true, color: C.soft });

  slide.addImage({ path: bonniePath, x: 4.25, y: 2.78, w: 1.12, h: 1.12 });
  text(slide, 'Bonnie Lappin', 5.51, 2.98, 2.25, 0.25, { fontSize: 14.5, bold: true, color: C.purple });
  line(slide, 4.25, 4.03, 3.51);
  text(slide, "Bonnie Lappin co-founded the Ambassador Program for the Healthcare Businesswomen's Association in 2013.\n\nDesigned as a global leadership development program for HBA corporate partners, it grew under her leadership from 2013 to 2025 into a signature, often life-changing experience for more than 11,000 participants.\n\nOver those 12 years, Bonnie spoke frequently at life sciences companies across Austria, Belgium, Canada, France, Germany, India, Ireland, Italy, Japan, Malaysia, Singapore, Spain, Switzerland, and the United Kingdom.\n\nShe also led panel development, launch and graduation events, and coached hundreds of panelists and moderators.\n\nToday, Bonnie continues this work through RxVP, a global speakers bureau that curates panels for experienced and emerging speakers.", 4.25, 4.13, 3.51, 3.83, { fontSize: 8.2, bold: true, color: C.soft });

  line(slide, 0.56, 8.24, 7.38);
  label(slide, 'Program design can be customized based on:', 0.56, 8.46, 6.5, 0.18, 9.8);
  bulletList(slide, ['Cohort size','Audience composition and geography','Strategic panel themes'], 0.56, 8.74, 3.5, 0.70, { fontSize: 9.0 });
  bulletList(slide, ['Number and cadence of speaking opportunities','Defined success metrics and developmental outcomes'], 4.25, 8.74, 3.6, 0.70, { fontSize: 9.0 });
  footer(slide);
}

addPageOne();
addPageTwo();
await pptx.writeFile({ fileName: downloadsPptx });
fs.rmSync(scratch, { recursive: true, force: true });
console.log(downloadsPptx);
