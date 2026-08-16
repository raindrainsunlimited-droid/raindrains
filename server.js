import express from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, 'public')

const app = express()

app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }))

app.use((req, res) => {
  res.status(404).type('html').send('<h1>404 — Page not found</h1><p><a href="/">Back to Rain Drains home</a></p>')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Rain Drains site listening on port ${port}`)
})
