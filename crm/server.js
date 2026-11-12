// Rain Drains CRM server.
import express from 'express'
import { join } from 'node:path'
import { api } from './lib/api.js'
import { pub } from './lib/public.js'

const app = express()
app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  next()
})

app.get('/healthz', (req, res) => res.json({ ok: true }))
app.use(pub)
app.use('/api', express.json({ limit: '5mb' }), api)
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

const PUBLIC = join(import.meta.dirname, 'public')
app.get(['/p/estimate/:token', '/p/invoice/:token'], (req, res) => res.sendFile(join(PUBLIC, 'portal.html')))
app.use(express.static(PUBLIC, { index: 'index.html', maxAge: '5m' }))

app.use((err, req, res, next) => {
  console.error(err)
  if (res.headersSent) return next(err)
  const status = err.status || err.statusCode || 500
  res.status(status).json({ error: status === 500 ? 'Something went wrong on our end' : err.message })
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Rain Drains CRM running at http://localhost:${port}`))
