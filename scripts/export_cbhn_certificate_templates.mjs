import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

const require = createRequire('/Users/gabriel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/')
const pptxgen = require('pptxgenjs')

const repo = '/Users/gabriel/Documents/3 - Perso/Finances/Dev/clients-playground'
const projectDir = path.join(repo, 'public/clients/cbhn/projects/ceu-certificate-templates')
const output = path.join(projectDir, 'CBHN-CEU-Certificate-Templates.pptx')
const downloadsOutput = '/Users/gabriel/Downloads/CBHN-CEU-Certificate-Templates.pptx'

const cbhnLogo = path.join(repo, 'public/clients/cbhn/assets/images/cbhn-logo.png')
const naswLogo = path.join(projectDir, 'assets/nasw-ca-logo.jpg')
const signature = path.join(projectDir, 'assets/rhonda-smith-signature.png')

const pptx = new pptxgen()
pptx.author = 'California Black Health Network'
pptx.company = 'California Black Health Network'
pptx.subject = 'CEU and attendance certificate templates'
pptx.title = 'CBHN CEU Certificate Templates'
pptx.lang = 'en-US'
pptx.defineLayout({ name: 'LETTER_PORTRAIT', width: 8.5, height: 11 })
pptx.layout = 'LETTER_PORTRAIT'
pptx.theme = { headFontFace: 'Playfair Display', bodyFontFace: 'Inter', lang: 'en-US' }

const C = {
  blue: '003687',
  blueDark: '001F4F',
  green: '369662',
  red: 'CC0000',
  orange: 'F14916',
  gold: 'F8D300',
  ink: '201815',
  muted: '5F6368',
  cream: 'FFF8EC',
  white: 'FFFFFF',
  softBlue: 'EFF4FC',
  line: 'D9C68B',
}

const S = pptx.ShapeType

function rect(slide, x, y, w, h, fill, opts = {}) {
  slide.addShape(S.rect, {
    x, y, w, h,
    fill: { color: fill, transparency: opts.transparency ?? 0 },
    line: opts.line ?? { color: fill, transparency: 100 },
  })
}

function text(slide, value, x, y, w, h, opts = {}) {
  slide.addText(value, {
    x, y, w, h,
    margin: opts.margin ?? 0.02,
    breakLine: false,
    fit: opts.fit ?? 'shrink',
    fontFace: opts.fontFace ?? 'Inter',
    fontSize: opts.fontSize ?? 12,
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
    color: opts.color ?? C.ink,
    align: opts.align ?? 'center',
    valign: opts.valign ?? 'mid',
    paraSpaceAfterPt: opts.paraSpaceAfterPt ?? 0,
    paraSpaceBeforePt: opts.paraSpaceBeforePt ?? 0,
    bullet: opts.bullet,
  })
}

function addSharedFrame(slide) {
  slide.background = { color: C.white }
  rect(slide, 0, 0, 8.5, 11, C.cream)
  rect(slide, 0.34, 0.34, 7.82, 10.32, C.white, { line: { color: C.blueDark, pt: 4.5 } })
  rect(slide, 0.51, 0.51, 7.48, 9.98, C.white, { transparency: 100, line: { color: C.line, pt: 0.75 } })
  const stripeY = 0.34
  rect(slide, 0.34, stripeY, 1.82, 0.13, C.green)
  rect(slide, 2.16, stripeY, 1.16, 0.13, C.red)
  rect(slide, 3.32, stripeY, 1.16, 0.13, C.gold)
  rect(slide, 4.48, stripeY, 1.72, 0.13, C.blue)
  rect(slide, 6.2, stripeY, 1.96, 0.13, C.orange)
}

function addAccent(slide) {
  rect(slide, 1.8, 2.78, 1.2, 0.07, C.green)
  rect(slide, 3.0, 2.78, 1.0, 0.07, C.gold)
  rect(slide, 4.0, 2.78, 1.0, 0.07, C.orange)
  rect(slide, 5.0, 2.78, 1.7, 0.07, C.blue)
}

function addDetail(slide, label, value, x, y) {
  rect(slide, x, y, 2.75, 0.63, C.white, { line: { color: 'CDD8E8', pt: 0.75 } })
  text(slide, label.toUpperCase(), x + 0.08, y + 0.08, 2.59, 0.13, { fontSize: 7.3, bold: true, color: C.muted })
  text(slide, value, x + 0.08, y + 0.27, 2.59, 0.21, { fontSize: 14, bold: true, color: C.blueDark })
}

function addFooter(slide, y = 9.72) {
  slide.addShape(S.line, { x: 1.55, y, w: 5.4, h: 0, line: { color: 'CDD8E8', pt: 0.75 } })
  text(slide, 'California Black Health Network', 1.6, y + 0.13, 5.3, 0.16, { fontSize: 9.6, bold: true, color: C.blueDark })
  text(slide, '520 9th Street, Suite 100, Sacramento, CA 95814', 1.6, y + 0.32, 5.3, 0.16, { fontSize: 9.2, color: C.ink })
  text(slide, 'Phone: (916) 333-0613', 1.6, y + 0.51, 5.3, 0.16, { fontSize: 9.2, color: C.ink })
}

function addSignature(slide, y, withImage, role = 'Authorized Signature') {
  slide.addShape(S.line, { x: 2.15, y: y + 0.55, w: 4.2, h: 0, line: { color: '111111', pt: 2.25 } })
  if (withImage) {
    slide.addImage({ path: signature, x: 3.12, y: y + 0.16, w: 2.25, h: 0.33 })
  } else {
    text(slide, 'DROP SIGNATURE HERE', 2.55, y + 0.23, 3.4, 0.16, { fontSize: 8, bold: true, color: '888888' })
  }
  text(slide, 'Rhonda M. Smith', 2.6, y + 0.74, 3.3, 0.18, { fontSize: 12.5, bold: true })
  text(slide, role, 2.6, y + 0.95, 3.3, 0.17, { fontSize: 10.5, color: C.ink })
}

function addCeuSlide({ multiple, withSignature }) {
  const slide = pptx.addSlide()
  addSharedFrame(slide)
  slide.addImage({ path: naswLogo, x: 0.88, y: 0.82, w: 1.42, h: 0.65 })
  slide.addImage({ path: cbhnLogo, x: 3.08, y: 0.94, w: 3.65, h: 0.62 })
  text(slide, 'NASW-CA APPROVED CONTINUING EDUCATION', 1.2, 1.72, 6.1, 0.16, { fontSize: 8.3, bold: true, color: C.blue })
  text(slide, 'Certificate of Continuing Education', 0.96, 1.96, 6.58, 0.54, { fontFace: 'Playfair Display', fontSize: 30.5, bold: true })
  addAccent(slide)
  text(slide, 'This certifies that', 1.0, 3.04, 6.5, 0.24, { fontSize: 15, bold: true })
  rect(slide, 1.23, 3.46, 6.04, 0.56, C.softBlue, { line: { color: 'CDD8E8', pt: 0.75 } })
  text(slide, multiple ? '[Participant Name], [Credentials]' : '[First Name] [Last Name], [Credentials]', 1.34, 3.58, 5.82, 0.25, { fontSize: 20.5, bold: true })
  text(slide, multiple ? 'has successfully completed the following educational sessions at the:' : 'has successfully completed the educational session at the:', 1.02, 4.25, 6.46, 0.24, { fontSize: 13.8 })
  text(slide, multiple ? 'CBHN Virtual Behavioral and Mental Health Conference' : 'Virtual Behavioral and Mental Health Conference', 1.0, 4.58, 6.5, 0.22, { fontSize: 15.2, bold: true, color: C.blueDark })
  text(slide, 'Hidden Crises—Stress, Mental Health & Brain Health in the Black Community', 1.0, 4.86, 6.5, 0.28, { fontSize: 13.3, italic: true, bold: true })
  if (multiple) {
    text(slide, '• Opening Keynote – 1 CEU\n• Toxic Stress – 1 CEU\n• Brain Health – 1 CEU', 2.35, 5.22, 3.8, 0.62, { align: 'left', fontSize: 12.3, bold: true, valign: 'top' })
  }
  addDetail(slide, 'Date', 'May 13, 2026', 1.42, multiple ? 6.0 : 5.45)
  addDetail(slide, 'Location', 'Zoom', 4.34, multiple ? 6.0 : 5.45)
  rect(slide, 1.94, multiple ? 6.86 : 6.3, 4.62, 0.43, C.blueDark)
  text(slide, 'Number of CEUs Issued: [CEUs]', 2.0, multiple ? 6.95 : 6.39, 4.5, 0.16, { fontSize: 15.8, bold: true, color: C.white })
  text(slide, 'This course meets the qualifications for Continuing Education for LCSWs, LMFTs, LPCCs, and LEPs as required by the CA State Board of Behavioral Sciences, provided by NASW-CA.', 0.98, multiple ? 7.55 : 7.05, 6.54, 0.55, { fontSize: 11.4, bold: true, color: C.ink })
  addSignature(slide, 8.38, withSignature)
  addFooter(slide, 9.82)
}

function addAttendanceSlide() {
  const slide = pptx.addSlide()
  addSharedFrame(slide)
  slide.addImage({ path: cbhnLogo, x: 2.18, y: 0.95, w: 4.15, h: 0.7 })
  text(slide, 'CONFERENCE DOCUMENTATION', 1.2, 1.86, 6.1, 0.16, { fontSize: 8.3, bold: true, color: C.blue })
  text(slide, 'Certificate of Attendance', 1.0, 2.12, 6.5, 0.5, { fontFace: 'Playfair Display', fontSize: 31, bold: true })
  addAccent(slide)
  text(slide, 'This certifies that', 1.0, 3.12, 6.5, 0.22, { fontSize: 15, bold: true })
  rect(slide, 1.45, 3.55, 5.6, 0.54, C.softBlue, { line: { color: 'CDD8E8', pt: 0.75 } })
  text(slide, '[Participant Name]', 1.55, 3.67, 5.4, 0.23, { fontSize: 20, bold: true })
  text(slide, 'has participated in the CBHN Virtual Behavioral and Mental Health Conference, held on Wednesday, May 13, 2026, and attended [X] hours of programming.', 1.08, 4.46, 6.34, 0.68, { fontSize: 13.4, bold: true })
  text(slide, 'This certificate is awarded as documentation of attendance. No Continuing Education Units (CEUs) are associated with this certificate.', 1.08, 5.42, 6.34, 0.55, { fontSize: 13.0, bold: true })
  text(slide, 'Participants may submit this certificate to their licensing board for independent review.', 1.08, 6.22, 6.34, 0.32, { fontSize: 12.7 })
  addFooter(slide, 7.42)
  slide.addShape(S.line, { x: 2.55, y: 9.11, w: 3.4, h: 0, line: { color: '111111', pt: 1.75 } })
  text(slide, 'DROP SIGNATURE HERE', 2.75, 8.74, 3.0, 0.16, { fontSize: 8, bold: true, color: '888888' })
  text(slide, 'Executive Director', 2.8, 9.32, 2.9, 0.18, { fontSize: 12, bold: true })
  text(slide, 'Date: May 20, 2026', 2.8, 9.54, 2.9, 0.18, { fontSize: 11, bold: true })
}

addCeuSlide({ multiple: true, withSignature: true })
addCeuSlide({ multiple: false, withSignature: false })
addAttendanceSlide()

await pptx.writeFile({ fileName: output })
fs.copyFileSync(output, downloadsOutput)
console.log(output)
console.log(downloadsOutput)
