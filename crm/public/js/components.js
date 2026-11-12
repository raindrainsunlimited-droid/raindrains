// Reusable UI pieces: activity timeline + note box, file/photo gallery, communication buttons.
import { html, raw, esc, POST, DEL, api, ago, fmtDateTime, toast, fail, confirmBox, telHref, smsHref, mapHref } from './core.js'
import { icon } from './icons.js'

const KIND_ICON = { note: 'edit', call: 'phone', email: 'mail', text: 'sms', event: 'clock' }

export function timeline(activity = [], { entity_type, entity_id, customer_id } = {}) {
  return html`
  <div class="card">
    <div class="card-head"><h3>Activity & notes</h3></div>
    <div class="card-body">
      ${entity_type ? html`<form class="note-box" data-note-form data-entity-type="${entity_type}" data-entity-id="${entity_id}" data-customer-id="${customer_id ?? ''}">
        <textarea name="text" placeholder="Add a note, or log a call/text…" rows="1"></textarea>
        <select name="kind" class="inp" style="width:auto"><option value="note">Note</option><option value="call">Call</option><option value="text">Text</option><option value="email">Email</option></select>
        <button class="btn btn-primary">Add</button>
      </form>` : ''}
      ${activity.length ? html`<ul class="timeline">${activity.map((a) => html`
        <li><span class="ti ${a.kind}">${raw(icon(KIND_ICON[a.kind] || 'clock', 14))}</span>
          <div class="body">${a.text}<small title="${fmtDateTime(a.created_at)}">${a.user_name || (a.kind === 'event' ? 'System' : '')} · ${ago(a.created_at)}</small></div>
          ${a.kind !== 'event' ? html`<button class="icon-btn" data-del-note="${a.id}" title="Delete note">${raw(icon('trash', 14))}</button>` : ''}
        </li>`)}</ul>` : html`<p class="muted">No activity yet.</p>`}
    </div>
  </div>`
}

export function bindTimeline(root, reload) {
  root.querySelectorAll('[data-note-form]').forEach((f) => f.addEventListener('submit', async (e) => {
    e.preventDefault()
    const text = f.text.value.trim()
    if (!text) return
    try {
      await POST('/activity', { entity_type: f.dataset.entityType, entity_id: f.dataset.entityId, customer_id: f.dataset.customerId || null, kind: f.kind.value, text })
      toast('Added'); reload()
    } catch (err) { fail(err) }
  }))
  root.querySelectorAll('[data-del-note]').forEach((b) => b.addEventListener('click', async () => {
    if (!(await confirmBox('Delete this note?', { ok: 'Delete', danger: true }))) return
    await DEL('/activity/' + b.dataset.delNote).catch(fail); reload()
  }))
}

const isImage = (f) => /\.(jpe?g|png|gif|webp)$/i.test(f.filename)

export function gallery(files = [], { entity_type, entity_id, title = 'Photos & files' } = {}) {
  return html`
  <div class="card">
    <div class="card-head"><h3>${raw(icon('camera'))} ${title}</h3><small class="muted">${files.length}</small></div>
    <div class="card-body">
      ${files.length ? html`<div class="photos" style="margin-bottom:12px">${files.map((f) => isImage(f)
        ? html`<div class="photo"><a href="/api/files/${f.id}" target="_blank" rel="noopener"><img src="/api/files/${f.id}" alt="${f.original_name}" loading="lazy"></a>${entity_type ? html`<button class="del" data-del-file="${f.id}" title="Delete">✕</button>` : ''}</div>`
        : html`<div class="photo file"><a href="/api/files/${f.id}?download=1">${raw(icon('download'))}<br>${f.original_name}</a>${entity_type ? html`<button class="del" data-del-file="${f.id}">✕</button>` : ''}</div>`)}</div>` : ''}
      ${entity_type ? html`<label class="upload-drop" data-drop>
        <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" hidden data-upload="${entity_type}:${entity_id}">
        ${raw(icon('upload'))} Tap to add photos (or drop files here)
      </label>` : ''}
    </div>
  </div>`
}

/** Downscale big phone photos before upload to save space and bandwidth. */
async function shrink(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 900_000) return file
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height))
    const c = Object.assign(document.createElement('canvas'), { width: Math.round(bmp.width * scale), height: Math.round(bmp.height * scale) })
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85))
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch { return file }
}

export function bindGallery(root, reload) {
  const upload = async (input, files) => {
    const [entity_type, entity_id] = input.dataset.upload.split(':')
    toast(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}…`)
    try {
      for (const f0 of files) {
        const f = await shrink(f0)
        await api(`/files?entity_type=${entity_type}&entity_id=${entity_id}`, { method: 'POST', raw: true, body: f, headers: { 'Content-Type': f.type || 'application/octet-stream', 'X-Filename': encodeURIComponent(f.name) } })
      }
      toast('Uploaded'); reload()
    } catch (e) { fail(e) }
  }
  root.querySelectorAll('[data-upload]').forEach((input) => {
    input.addEventListener('change', () => input.files.length && upload(input, [...input.files]))
    const drop = input.closest('[data-drop]')
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.style.borderColor = 'var(--blue)' })
    drop.addEventListener('dragleave', () => (drop.style.borderColor = ''))
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.style.borderColor = ''; if (e.dataTransfer.files.length) upload(input, [...e.dataTransfer.files]) })
  })
  root.querySelectorAll('[data-del-file]').forEach((b) => b.addEventListener('click', async (e) => {
    e.preventDefault()
    if (!(await confirmBox('Delete this file?', { ok: 'Delete', danger: true }))) return
    await DEL('/files/' + b.dataset.delFile).catch(fail); reload()
  }))
}

export function contactButtons({ phone, email, address }) {
  return html`<div class="contact-row">
    ${phone ? html`<a class="btn btn-sm" href="${telHref(phone)}">${raw(icon('phone', 15))} Call</a><a class="btn btn-sm" href="${smsHref(phone)}">${raw(icon('sms', 15))} Text</a>` : ''}
    ${email ? html`<a class="btn btn-sm" href="mailto:${email}">${raw(icon('mail', 15))} Email</a>` : ''}
    ${address ? html`<a class="btn btn-sm" href="${mapHref(address)}" target="_blank" rel="noopener">${raw(icon('map', 15))} Directions</a>` : ''}
  </div>`
}

export const emptyState = (title, sub = '', action = '') => html`<div class="empty"><h3>${title}</h3><p>${sub}</p>${action ? html`<div style="margin-top:14px">${raw(action)}</div>` : ''}</div>`
export { esc }
