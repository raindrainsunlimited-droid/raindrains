// Password hashing (scrypt) and cookie sessions.
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'
import { get, run } from './db.js'

const COOKIE = 'rd_session'
const SESSION_DAYS = 30

export function hashPassword(pw) {
  const salt = randomBytes(16)
  const hash = scryptSync(pw, salt, 64)
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

export function verifyPassword(pw, stored) {
  const [, saltHex, hashHex] = String(stored).split('$')
  if (!saltHex || !hashHex) return false
  const hash = scryptSync(pw, Buffer.from(saltHex, 'hex'), 64)
  const expected = Buffer.from(hashHex, 'hex')
  return expected.length === hash.length && timingSafeEqual(hash, expected)
}

export const token = (bytes = 24) => randomBytes(bytes).toString('hex')

export function createSession(res, user_id, secure) {
  const t = token(32)
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5)
  run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)', t, user_id, expires.toISOString())
  res.cookie(COOKIE, t, { httpOnly: true, sameSite: 'lax', secure, expires, path: '/' })
}

export function destroySession(req, res) {
  const t = readCookie(req)
  if (t) run('DELETE FROM sessions WHERE token = ?', t)
  res.clearCookie(COOKIE, { path: '/' })
}

function readCookie(req) {
  const raw = req.headers.cookie || ''
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === COOKIE) return decodeURIComponent(v.join('='))
  }
  return null
}

export function currentUser(req) {
  const t = readCookie(req)
  if (!t) return null
  const row = get(`SELECT u.id, u.name, u.email, u.phone, u.role, u.color, s.expires_at
                   FROM sessions s JOIN users u ON u.id = s.user_id
                   WHERE s.token = ? AND u.active = 1`, t)
  if (!row) return null
  if (row.expires_at < new Date().toISOString()) { run('DELETE FROM sessions WHERE token = ?', t); return null }
  delete row.expires_at
  return row
}

export function requireAuth(req, res, next) {
  const u = currentUser(req)
  if (!u) return res.status(401).json({ error: 'Not signed in' })
  req.user = u
  next()
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'You do not have permission to do that' })
