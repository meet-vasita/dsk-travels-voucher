import { useState } from 'react'
import './App.css'
import logo from './logo.png'

const BOARD_SUBS = {
  'Bed & Breakfast': '',
  'Half Board': '',
  'Full Board': '',
  'All Inclusive': '',
  'Room Only': ''
}

function formatDate(val) {
  if (!val) return '—'
  const d = new Date(val + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateShort(val) {
  if (!val) return '—'
  const d = new Date(val + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function diffNights(ci, co) {
  if (!ci || !co) return null
  const diff = (new Date(co + 'T00:00:00') - new Date(ci + 'T00:00:00')) / 86400000
  return diff > 0 ? diff : null
}

function toInputDate(date) {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function todayInputDate() {
  return toInputDate(new Date())
}

export default function App() {
  const [form, setForm] = useState({
    guestName: '', adults: 2, children: 0, childAge: '',
    hotelName: '', hotelLoc: '',
    bookingDate: todayInputDate(),
    checkIn: '', checkOut: '', nights: '',
    boardBasis: 'Half Board', roomType: '',
    confirmNo: '',
    emergencyNo: '+971 50 841 6669'
  })
  const [inclusions, setInclusions] = useState([''])
  const [errors, setErrors] = useState({})

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleCheckInChange = (val) => {
    const nights = parseInt(form.nights)
    if (val && nights > 0) {
      const d = new Date(val + 'T00:00:00')
      d.setDate(d.getDate() + nights)
      setForm(f => ({ ...f, checkIn: val, checkOut: toInputDate(d) }))
    } else {
      const n = diffNights(val, form.checkOut)
      if (n) setForm(f => ({ ...f, checkIn: val, nights: n }))
      else setForm(f => ({ ...f, checkIn: val }))
    }
  }

  const handleNightsChange = (val) => {
    const nights = parseInt(val)
    if (!form.checkIn) { setErrors(e => ({ ...e, checkIn: 'Please enter check-in date first.' })); return }
    if (isNaN(nights) || nights < 1) { setForm(f => ({ ...f, nights: val, checkOut: '' })); return }
    const d = new Date(form.checkIn + 'T00:00:00')
    d.setDate(d.getDate() + nights)
    setForm(f => ({ ...f, nights: val, checkOut: toInputDate(d) }))
  }

  const handleCheckOutChange = (val) => {
    if (!form.checkIn) { setErrors(e => ({ ...e, checkIn: 'Please enter check-in date first.' })); return }
    const n = diffNights(form.checkIn, val)
    if (!n) { setErrors(e => ({ ...e, checkOut: 'Check-out must be after check-in.' })); setForm(f => ({ ...f, checkOut: val, nights: '' })); return }
    setForm(f => ({ ...f, checkOut: val, nights: n }))
    setErrors(e => ({ ...e, checkOut: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.guestName.trim()) e.guestName = 'Guest name is required.'
    if (!form.adults || form.adults < 1) e.adults = 'At least 1 adult is required.'
    if (form.children < 0) e.children = 'Invalid number of children.'
    if (!form.hotelName.trim()) e.hotelName = 'Hotel name is required.'
    if (!form.hotelLoc.trim()) e.hotelLoc = 'Location is required.'
    if (!form.checkIn) e.checkIn = 'Check-in date is required.'
    if (!form.checkOut) e.checkOut = 'Check-out date is required.'
    else if (form.checkIn && !diffNights(form.checkIn, form.checkOut)) e.checkOut = 'Check-out must be after check-in.'
    if (!form.nights || form.nights < 1) e.nights = 'Please enter a valid number of nights.'
    if (!form.roomType.trim()) e.roomType = 'Room type is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePrint = () => {
    if (!validate()) { alert('Please fill in all required fields before printing.'); return }
    window.print()
  }

  const nights = diffNights(form.checkIn, form.checkOut)
  const occ = `${form.adults} Adult${form.adults !== 1 ? 's' : ''}${form.children > 0 ? `, ${form.children} Child${form.children !== 1 ? 'ren' : ''}` : ''}`
  const activeInclusions = inclusions.filter(i => i.trim())
  const board = form.boardBasis

  return (
    <>
      <div className="topbar">
        <div className="brand">DSK <span>Travels</span> LLC &nbsp;&middot;&nbsp; Voucher Generator</div>
        <button className="print-btn" onClick={handlePrint}>Print Voucher</button>
      </div>

      <div className="wrapper">
        {/* Form Panel */}
        <div className="form-panel">
          <div className="form-section">
            <h3>Guest Information</h3>
            <Field label="Guest Name *" error={errors.guestName}>
              <input value={form.guestName} onChange={e => set('guestName', e.target.value)} placeholder="Kirti Tandon" className={errors.guestName ? 'error' : ''} />
            </Field>
            <Field label="Adults *" error={errors.adults}>
              <input type="number" value={form.adults} min="1" max="20" onChange={e => set('adults', parseInt(e.target.value))} className={errors.adults ? 'error' : ''} />
            </Field>
            <Field label="Children" error={errors.children}>
              <input type="number" value={form.children} min="0" max="20" onChange={e => set('children', parseInt(e.target.value) || 0)} />
            </Field>
            {form.children > 0 && (
              <Field label="Children Age">
                <input value={form.childAge} onChange={e => set('childAge', e.target.value)} placeholder="e.g. Below 12 Years" />
              </Field>
            )}
          </div>

          <div className="form-section">
            <h3>Hotel Details</h3>
            <Field label="Hotel Name *" error={errors.hotelName}>
              <input value={form.hotelName} onChange={e => set('hotelName', e.target.value)} placeholder="e.g. Grand Hyatt Dubai" className={errors.hotelName ? 'error' : ''} />
            </Field>
            <Field label="Location *" error={errors.hotelLoc}>
              <input value={form.hotelLoc} onChange={e => set('hotelLoc', e.target.value)} placeholder="e.g. Dubai, United Arab Emirates" className={errors.hotelLoc ? 'error' : ''} />
            </Field>
            <Field label="Confirmation Number">
              <input value={form.confirmNo} onChange={e => set('confirmNo', e.target.value)} placeholder="e.g. HTL-2026-00123" />
            </Field>
            <Field label="Booking Date">
              <input type="date" value={form.bookingDate} onChange={e => set('bookingDate', e.target.value)} />
            </Field>
            <Field label="Check-In Date *" error={errors.checkIn}>
              <input type="date" value={form.checkIn} onChange={e => handleCheckInChange(e.target.value)} className={errors.checkIn ? 'error' : ''} />
            </Field>
            <Field label="Number of Nights *" error={errors.nights}>
              <div className="date-nights-row">
                <input type="number" value={form.nights} min="1" max="365" placeholder="No. of nights" onChange={e => handleNightsChange(e.target.value)} className={errors.nights ? 'error' : ''} />
                <div className="nights-badge">
                  {nights || '—'}<span>night{nights !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </Field>
            <Field label="Check-Out Date *" error={errors.checkOut}>
              <input type="date" value={form.checkOut} onChange={e => handleCheckOutChange(e.target.value)} className={errors.checkOut ? 'error' : ''} />
            </Field>
            <Field label="Board Basis">
              <select value={form.boardBasis} onChange={e => set('boardBasis', e.target.value)}>
                {Object.keys(BOARD_SUBS).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
          </div>

          <div className="form-section">
            <h3>Room Details</h3>
            <Field label="Room Type *" error={errors.roomType}>
              <input value={form.roomType} onChange={e => set('roomType', e.target.value)} placeholder="e.g. Superior Family Room" className={errors.roomType ? 'error' : ''} />
            </Field>
          </div>

          <div className="form-section">
            <h3>Special Inclusions</h3>
            <div className="inc-rows">
              {inclusions.map((inc, i) => (
                <div className="inc-row" key={i}>
                  <input
                    value={inc}
                    placeholder="If any inclusions type here"
                    onChange={e => { const a = [...inclusions]; a[i] = e.target.value; setInclusions(a) }}
                  />
                  <button className="inc-remove" onClick={() => setInclusions(inclusions.filter((_, j) => j !== i))}>&#215;</button>
                </div>
              ))}
            </div>
            <button className="add-inc-btn" onClick={() => setInclusions([...inclusions, ''])}>+ Add Inclusion</button>
          </div>

          <div className="form-section">
            <h3>Emergency Contact</h3>
            <Field label="Emergency Number">
              <input value={form.emergencyNo} onChange={e => set('emergencyNo', e.target.value)} placeholder="+971 50 841 6669" />
            </Field>
          </div>
        </div>

        {/* Voucher Preview */}
        <div className="preview-area">
          <div className="page" id="voucher">

            {/* Decorative top accent line */}
            <div className="v-accent-top" />

            <div className="v-header">
              <div className="v-company">
                <h1>DSK Travels LLC</h1>
                <p>Travel to live &nbsp;&bull;&nbsp; Live to travel</p>
              </div>
              <div className="v-logo">
                <img src={logo} alt="DSK Travels Logo" />
              </div>
            </div>

            <div className="v-title-bar">
              <div className="v-title-left">
                <div className="v-title-rule" />
                <h2>Hotel Booking Voucher</h2>
              </div>
              <div className="v-confirmed">Confirmed</div>
            </div>

            <div className="v-guest-row">
              <div className="v-field">
                <label>Guest Name</label>
                <span>{form.guestName || '—'}</span>
              </div>
              <div className="v-field">
                <label>Occupancy</label>
                <span>{occ}</span>
              </div>
              {form.children > 0 && (
                <div className="v-field">
                  <label>Children Age</label>
                  <span>{form.childAge || '—'}</span>
                </div>
              )}
              {form.confirmNo && (
                <div className="v-field">
                  <label>Supplier Reference No.</label>
                  <span>{form.confirmNo}</span>
                </div>
              )}
              {form.bookingDate && (
                <div className="v-field">
                  <label>Booking Date</label>
                  <span>{formatDateShort(form.bookingDate)}</span>
                </div>
              )}
            </div>

            <div className="v-content">
              <div className="v-hotel-row">
                <div>
                  <div className="v-hotel-name">{form.hotelName || '—'}</div>
                  <div className="v-hotel-loc">{form.hotelLoc || '—'}</div>
                </div>
              </div>

              <div className="v-divider" />

              <div className="v-info-grid">
                <div className="v-info-cell">
                  <label>Check-In</label>
                  <span className="val">{formatDate(form.checkIn)}</span>
                </div>
                <div className="v-info-cell">
                  <label>Check-Out</label>
                  <span className="val">{formatDate(form.checkOut)}</span>
                </div>
                <div className="v-info-cell">
                  <label>Number of Nights</label>
                  <span className="val">{nights ? `${nights} Night${nights !== 1 ? 's' : ''}` : '—'}</span>
                </div>
                <div className="v-info-cell">
                  <label>Board Basis</label>
                  <span className="val">{board}</span>
                </div>
              </div>

              <div className="v-sec-label">Room Details</div>
              <div className="v-room-card">
                <div className="rname">{form.roomType || '—'}</div>
              </div>

              {activeInclusions.length > 0 && (
                <div>
                  <div className="v-sec-label">Special Inclusions</div>
                  <div className="v-inc-list">
                    {activeInclusions.map((inc, i) => (
                      <div className="v-inc-item" key={i}>
                        <div className="v-inc-dot" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Note Section */}
              <div className="v-sec-label">Important Note</div>
              <div className="v-notes-list">
                <div className="v-note-item">
                  <div className="v-note-dot" />
                  <span>Standard hotel check-in time is 15:00 hrs and check-out time is 12:00 hrs; in case of an early arrival before the check-in time, rooms must be booked from the previous night with the corresponding charges in order to guarantee an early check-in.</span>
                </div>
                <div className="v-note-item">
                  <div className="v-note-dot" />
                  <span>Free early check-in and late check-out is subject to availability and as per the hotel's policy.</span>
                </div>
                <div className="v-note-item">
                  <div className="v-note-dot" />
                  <span>Hotel reserves the rights to cancel the rooms booking automatically after 18:00 hours, if hotel is not informed about the late arrivals. In case of late check-in, kindly inform us in advance.</span>
                </div>
                <div className="v-note-item">
                  <div className="v-note-dot" />
                  <span>In case of no show or early check out, 100% charges will apply — no part/full refund will be honored.</span>
                </div>
                <div className="v-note-item">
                  <div className="v-note-dot" />
                  <span>For any assistance during or after your tour please contact our emergency number: <strong>{form.emergencyNo || '+971 50 841 6669'}</strong></span>
                </div>
              </div>
            </div>

            <div className="v-footer">
              <div className="note">This voucher is issued by DSK Travels LLC and is subject to the hotel's terms and conditions. Please present this voucher upon check-in. For assistance, contact your travel consultant.</div>
              <div className="tagline">...travel to live, live to travel!</div>
            </div>
            <div className="v-bottom-bar" />
          </div>
        </div>
      </div>
    </>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
      {error && <div className="err-msg visible">{error}</div>}
    </div>
  )
}