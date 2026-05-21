import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'

const require = createRequire('/Users/gabriel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/')
const { chromium } = require('playwright')

const repo = '/Users/gabriel/Documents/3 - Perso/Finances/Dev/clients-playground'
const publicDir = path.join(repo, 'public')
const outputDir = '/Users/gabriel/Downloads/CBHN-CEU-Certificate-Flattened-PDFs'
const port = 8127

function sanitizeFileName(value) {
  const cleaned = String(value || 'Certificate')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.+$/g, '')
  return `${cleaned || 'Certificate'}.pdf`
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.html') return 'text/html; charset=utf-8'
  if (ext === '.css') return 'text/css; charset=utf-8'
  if (ext === '.js') return 'text/javascript; charset=utf-8'
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.pdf') return 'application/pdf'
  return 'application/octet-stream'
}

function startServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${port}`)
    const decodedPath = decodeURIComponent(url.pathname)
    const filePath = path.normalize(path.join(publicDir, decodedPath))
    if (!filePath.startsWith(publicDir)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404)
        res.end('Not found')
        return
      }
      res.writeHead(200, { 'Content-Type': contentType(filePath) })
      res.end(data)
    })
  })

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server))
  })
}

async function waitForAssets(page) {
  await page.evaluate(() => document.fonts?.ready || Promise.resolve())
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images).map((img) => {
        if (img.complete && img.naturalWidth > 0) return img.decode?.().catch(() => undefined) || Promise.resolve()
        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true })
          img.addEventListener('error', resolve, { once: true })
        })
      }),
    ),
  )
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true })
  for (const file of fs.readdirSync(outputDir)) {
    if (file.endsWith('.pdf')) fs.unlinkSync(path.join(outputDir, file))
  }

  const server = await startServer()
  const browser = await chromium.launch()

  try {
    const page = await browser.newPage({
      viewport: { width: 2200, height: 2600 },
      deviceScaleFactor: 2,
    })
    await page.goto(`http://127.0.0.1:${port}/clients/cbhn/projects/ceu-certificate-templates/index.html`, {
      waitUntil: 'networkidle',
    })
    await waitForAssets(page)
    await page.waitForTimeout(1200)

    const certificates = page.locator('.certificate')
    const count = await certificates.count()

    for (let index = 0; index < count; index += 1) {
      const certificate = certificates.nth(index)
      await certificate.scrollIntoViewIfNeeded()
      const title = await certificate.getAttribute('data-export-title')
      const png = await certificate.screenshot({ type: 'png', animations: 'disabled' })
      const outputPath = path.join(outputDir, sanitizeFileName(title || `Page ${index + 1}`))
      const dataUrl = `data:image/png;base64,${png.toString('base64')}`
      const pdfPage = await browser.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 1 })
      await pdfPage.setContent(
        `<!doctype html><html><head><style>@page{size:8.5in 11in;margin:0}html,body{margin:0;width:8.5in;height:11in}img{display:block;width:8.5in;height:11in}</style></head><body><img src="${dataUrl}" alt=""></body></html>`,
        { waitUntil: 'load' },
      )
      await pdfPage.pdf({
        path: outputPath,
        width: '8.5in',
        height: '11in',
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        printBackground: true,
        preferCSSPageSize: true,
      })
      await pdfPage.close()
      console.log(outputPath)
    }

    console.log(`PDF files: ${count}`)
  } finally {
    await browser.close()
    server.close()
  }
}

await main()
