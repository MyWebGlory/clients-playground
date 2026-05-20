import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire('/Users/gabriel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');
const pptxgen = require('pptxgenjs');
const sharp = require('sharp');

const repo = '/Users/gabriel/Documents/3 - Perso/Finances/Dev/clients-playground';
const downloads = '/Users/gabriel/Downloads';
const scratch = path.join(repo, 'outputs/amplify-reexport-scratch');
fs.mkdirSync(scratch, { recursive: true });

const heroSource = path.join(repo, 'public/clients/rxvp/projects/amplify-collateral/assets/top-woman.png');
const heroCropped = path.join(scratch, 'top-woman-hero-crop.png');
await sharp(heroSource).resize(1632, 500, { fit: 'cover', position: 'top' }).png().toFile(heroCropped);
const logoPath = path.join(repo, 'public/clients/rxvp/assets/images/rxvp-logo.png');

const projectPptx = path.join(repo, 'public/clients/rxvp/projects/amplify-collateral/RxVP-Amplify-Program.pptx');
const downloadsPptx = path.join(downloads, 'RxVP-Amplify-Program.pptx');

const pptx = new pptxgen();
pptx.author = 'RxVP';
pptx.company = 'RxVP';
pptx.subject = 'AMPLIFY public speaking and executive presence coaching';
pptx.title = 'RxVP AMPLIFY Program';
pptx.lang = 'en-US';
pptx.defineLayout({ name: 'LETTER_PORTRAIT', width: 8.5, height: 11 });
pptx.layout = 'LETTER_PORTRAIT';
// NOTE: To match the HTML exactly, the same fonts must be installed on the machine
// opening the PPTX (or PowerPoint will substitute and metrics will shift).
// The source document uses Google Fonts: Cormorant Garamond + Montserrat.
pptx.theme = { headFontFace: 'Cormorant Garamond', bodyFontFace: 'Montserrat', lang: 'en-US' };

const C = { ink:'241F27', purple:'4A075C', deepPurple:'3B0648', night:'190B20', gold:'C9A532', goldLight:'E6CF72', paper:'FBF8ED', lavender:'F7F0F8', rule:'DED2E2', muted:'5F5863', soft:'756D79', white:'FFFFFF' };
const S = pptx.ShapeType;

function rect(slide, x, y, w, h, color, line = { color, transparency: 100 }) { slide.addShape(S.rect, { x, y, w, h, fill: { color }, line }); }
function line(slide, x, y, w, color = C.rule, pt = 0.75) { slide.addShape(S.line, { x, y, w, h: 0, line: { color, pt } }); }
function text(slide, value, x, y, w, h, opts = {}) {
  slide.addText(value, { x, y, w, h, margin: opts.margin ?? 0.01, fit: opts.fit ?? 'shrink', fontFace: opts.fontFace ?? 'Montserrat', fontSize: opts.fontSize ?? 10, color: opts.color ?? C.ink, bold: opts.bold ?? false, align: opts.align ?? 'left', valign: opts.valign ?? 'top', breakLine: false, paraSpaceAfterPt: opts.paraSpaceAfterPt ?? 0, paraSpaceBeforePt: opts.paraSpaceBeforePt ?? 0 });
}
function label(slide, value, x, y, w, h, fontSize = 9) { text(slide, value.toUpperCase(), x, y, w, h, { color: C.purple, fontSize, bold: true, fit: 'shrink' }); }
function bulletList(slide, items, x, y, w, h, opts = {}) { text(slide, items.map(i => `• ${i}`).join('\n'), x, y, w, h, { fontSize: opts.fontSize ?? 9.2, bold: opts.bold ?? true, color: opts.color ?? C.ink, margin: 0.02, fit: 'shrink' }); }
function footer(slide) { line(slide, 0.56, 10.42, 7.38, C.rule, 0.75); text(slide, 'RxVP', 0.56, 10.53, 1.4, 0.14, { fontSize: 7.3, bold: true, color: C.soft }); text(slide, 'PUBLIC SPEAKING AND EXECUTIVE PRESENCE COACHING', 3.42, 10.53, 4.52, 0.14, { fontSize: 7.3, bold: true, color: C.soft, align: 'right' }); }

function addPageOne() {
  const slide = pptx.addSlide(); slide.background = { color: C.white };
  rect(slide, 0, 0, 8.5, 2.61, C.night); slide.addImage({ path: heroCropped, x: 0, y: 0, w: 8.5, h: 2.61 });
  rect(slide, 2.05, 0.12, 6.07, 0.29, C.deepPurple); rect(slide, 2.05, 0.12, 0.03, 0.29, C.gold); rect(slide, 8.09, 0.12, 0.03, 0.29, C.gold);
  text(slide, "THE FIRST AND ONLY SPEAKER'S BUREAU IN LIFE SCIENCES", 2.18, 0.18, 5.78, 0.13, { fontSize: 10.5, bold: true, color: 'F3DC78', align: 'center' });
  text(slide, 'PROUDLY PRESENTS', 0.52, 0.76, 2.85, 0.18, { fontSize: 8.5, bold: true, color: C.goldLight });
  // Match the source HTML typography (points) as closely as PPTX allows.
  text(slide, 'AMPLIFY', 0.52, 0.98, 3.35, 0.56, { fontFace: 'Cormorant Garamond', fontSize: 48, bold: true, color: C.white });
  text(slide, 'Executive presence and high-impact\npublic speaking for life sciences\nleaders', 0.52, 1.58, 3.42, 0.62, { fontFace: 'Cormorant Garamond', fontSize: 14.5, bold: true, color: C.white });
  text(slide, 'Elevating the next generation of\nenterprise leaders at your company.', 0.5, 2.86, 4.35, 0.60, { fontFace: 'Cormorant Garamond', fontSize: 17.5, bold: true, color: C.purple });
  text(slide, 'AMPLIFY is a premium development experience designed to help emerging senior leaders strengthen public speaking and executive presence.', 0.5, 3.52, 4.36, 0.76, { fontSize: 9.7, bold: true, color: C.muted });
  rect(slide, 5.17, 2.86, 0.04, 1.12, C.gold); label(slide, 'Core advantages', 5.38, 2.88, 2.45, 0.22, 10.8); bulletList(slide, ['Speaking practice on 3 different panel events', 'Practitioner speaking coaches who know the life sciences stage'], 5.33, 3.17, 2.42, 0.76, { fontSize: 11.2 });
  line(slide, 0.5, 4.55, 3.64); line(slide, 4.39, 4.55, 3.61);
  text(slide, 'Real-World Speaking Opportunities', 0.5, 4.69, 3.45, 0.31, { fontSize: 11.1, bold: true, color: C.purple });
  rect(slide, 0.5, 5.05, 3.58, 0.73, C.paper); rect(slide, 0.5, 5.05, 0.04, 0.73, C.gold); text(slide, 'RxVP panels\nRxVP fireside chats\nStrategic stakeholder engagements\nIndustry conferences\nRxVP/ERG collaborations', 0.66, 5.16, 3.18, 0.48, { fontSize: 7.9, bold: true, color: C.ink });
  text(slide, 'Each participant receives three high-value speaking opportunities over six months. Experiences may be virtual or in person and designed for internal or external audiences.', 0.5, 5.93, 3.54, 0.54, { fontSize: 9.25, bold: true, color: C.muted });
  text(slide, 'Practitioner-Led Coaching', 4.39, 4.69, 3.45, 0.31, { fontSize: 11.1, bold: true, color: C.purple }); text(slide, 'RxVP speaker coaches are accomplished, active voices in the life sciences industry who bring firsthand credibility, insight, and candid feedback to every session.', 4.39, 5.08, 3.48, 0.58, { fontSize: 9.25, bold: true, color: C.muted }); bulletList(slide, ['Speaker delivery and concise storytelling','Audience engagement and executive presence','Panelist, moderator, and interviewer readiness'], 4.42, 5.77, 3.38, 0.61, { fontSize: 9.1 });
  rect(slide, 0.5, 6.65, 7.5, 3.63, C.paper, { color: 'D7C07A', pt: 0.75 }); label(slide, 'Our Practitioner Coaches', 0.66, 6.8, 3.6, 0.18, 9);
  text(slide, 'Deepa Desai', 0.66, 7.12, 3.35, 0.25, { fontFace: 'Georgia', fontSize: 13.5, bold: true, color: C.purple }); line(slide, 0.66, 7.47, 3.28);
  text(slide, 'Dr. Deepa Desai is a globally recognized healthcare executive, public speaker, leadership strategist, and executive presence advisor with more than 20 years of experience leading transformation across the life sciences sector.\n\nShe serves as Founder and CEO of D Cube Consultancy, Head of Asia Pacific for RxVP, Global Board Director at the Healthcare Businesswomen\'s Association, and has held numerous VP roles in major corporations.\n\nThrough these leadership roles, she helps emerging leaders strengthen executive presence, elevate strategic communication, and speak with confidence, credibility, and influence.\n\nDeepa is a frequent speaker at life sciences conferences and leadership forums across the United States and Europe. She has also expanded the Healthcare Businesswomen’s Association in India to a growing community of 700 members by building panels, summits, and chapters across the country.', 0.66, 7.57, 3.35, 2.35, { fontSize: 7.2, bold: true, color: C.soft });
  text(slide, 'Bonnie Lappin', 4.24, 7.12, 3.35, 0.25, { fontFace: 'Georgia', fontSize: 13.5, bold: true, color: C.purple }); line(slide, 4.24, 7.47, 3.28);
  text(slide, 'Bonnie Lappin co-founded the Ambassador Program for the Healthcare Businesswomen\'s Association in 2013.\n\nDesigned as a global leadership development program for HBA corporate partners, it grew under her leadership from 2013 to 2025 into a signature, often life-changing experience for more than 11,000 participants.\n\nOver those 12 years, Bonnie spoke frequently at life sciences companies across Austria, Belgium, Canada, France, Germany, India, Ireland, Italy, Japan, Malaysia, Singapore, Spain, Switzerland, and the United Kingdom.\n\nShe also led panel development, launch and graduation events, and coached hundreds of panelists and moderators.\n\nToday, Bonnie continues this work through RxVP, a global speakers bureau that curates panels for experienced and emerging speakers.', 4.24, 7.57, 3.35, 2.35, { fontSize: 7.2, bold: true, color: C.soft });
}

function addPageTwo() {
  const slide = pptx.addSlide(); slide.background = { color: C.white };
  rect(slide, 0, 0, 8.5, 1.16, C.deepPurple); slide.addImage({ path: logoPath, x: 0.56, y: 0.27, w: 1.08, h: 0.62 });
  text(slide, 'DETAILED PROGRAM INFORMATION', 5.55, 0.34, 2.4, 0.18, { fontSize: 8.4, bold: true, color: C.goldLight, align: 'right' });
  // Source HTML: 19.2pt display serif; keep the same size.
  text(slide, 'Participants leave the program better prepared to communicate with executive-level confidence, represent the organization with thought leadership impact, and navigate high-visibility forums with agility.', 0.56, 1.48, 6.95, 0.78, { fontFace: 'Cormorant Garamond', fontSize: 19.2, bold: true, color: C.purple });

  label(slide, 'Program Objectives', 0.56, 2.82, 3.25, 0.2, 9.8);
  bulletList(slide, ['Communicate with executive-level confidence and credibility in internal meetings','Strengthen leadership presence in high-visibility forums','Deliver clear, concise, and compelling messages under pressure','Engage diverse audiences with authenticity and authority','Represent your company with thought leadership impact','Navigate panel discussions and live Q&A with agility and confidence'], 0.56, 3.16, 3.55, 2.20, { fontSize: 8.9 });

  label(slide, 'Signature Development Areas', 4.44, 2.82, 3.3, 0.2, 9.8);
  text(slide, 'Executive Presence Mastery', 4.44, 3.16, 3.35, 0.18, { fontSize: 9.8, bold: true, color: C.purple });
  text(slide, 'Participants strengthen the core qualities that help leaders command attention, build trust, and inspire confidence.', 4.44, 3.42, 3.35, 0.44, { fontSize: 8.9, bold: true, color: C.muted });
  text(slide, 'Strategic Public Speaking Excellence', 4.44, 4.10, 3.35, 0.18, { fontSize: 9.8, bold: true, color: C.purple });
  text(slide, 'Focused coaching helps participants turn ideas into compelling messages that resonate and move audiences to action.', 4.44, 4.36, 3.35, 0.44, { fontSize: 8.9, bold: true, color: C.muted });
  text(slide, 'Panel and Fireside Chat Readiness', 4.44, 5.04, 3.35, 0.18, { fontSize: 9.8, bold: true, color: C.purple });
  text(slide, 'Participants gain practical tools to show up with poise, insight, and agility in high-visibility speaking moments.', 4.44, 5.30, 3.35, 0.44, { fontSize: 8.9, bold: true, color: C.muted });

  line(slide, 0.56, 6.10, 7.38);
  label(slide, 'Delivery Skills', 0.56, 6.32, 3.25, 0.18, 9.8);
  bulletList(slide, ['Speaker delivery','Concise storytelling','Audience engagement'], 0.56, 6.62, 3.5, 1.05, { fontSize: 9.1 });
  bulletList(slide, ['Appropriate self-effacing humor','Engagement with panelists, moderators, and interviewers','Enhanced executive presence'], 4.25, 6.62, 3.69, 1.05, { fontSize: 9.1 });

  rect(slide, 0.56, 7.95, 7.38, 1.55, C.lavender); rect(slide, 0.56, 7.95, 0.04, 1.55, C.gold);
  label(slide, 'Program design can be customized based on:', 0.8, 8.14, 6.5, 0.18, 9.8);
  bulletList(slide, ['Cohort size','Audience composition and geography','Strategic panel themes'], 0.8, 8.44, 3.5, 0.96, { fontSize: 9.0 });
  bulletList(slide, ['Number and cadence of speaking opportunities','Defined success metrics and developmental outcomes'], 4.25, 8.44, 3.6, 0.96, { fontSize: 9.0 });
  footer(slide);
}

addPageOne();
addPageTwo();
await pptx.writeFile({ fileName: downloadsPptx });
fs.copyFileSync(downloadsPptx, projectPptx);
fs.rmSync(scratch, { recursive: true, force: true });
console.log(downloadsPptx);
console.log(projectPptx);
