// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
// const SHEET_ID = '1fon6vpSCS2A98JUc0JS1DZMIFho46aBBTi4Ok8gbv5o'
const SHEET_ID = '1rf9n4bDueonTfF79v_u-X3maufpomoFIsYXmuVHdpHw'

const APPOINTMENT_SHEET = 'salonAppointment'
const STAFF_SHEET       = 'staff'
const ATTENDANCE_SHEET  = 'attendance'
const PAYMENT_SHEET     = 'payments'
const PRODUCT_SHEET = 'products'
const REPORT_SHEET = 'report'
const EXPENSE_SHEET = 'expenses'
const SERVICES_SHEET = 'services'
const PLANS_SHEET = 'plans'
const MEMBERSHIP_SHEET = 'membership'
const MEMBERSHIP_USAGE_SHEET = 'membershipUsage'

function normalizeSheetDate(value) {
  if (!value) return ''

  // HANDLE DATE OBJECT FROM SHEETS
  if (value instanceof Date) {
    const day = value.getDate()
    const month = value.getMonth() + 1
    const year = value.getFullYear()

    return `${String(day).padStart(2,'0')}-${String(month).padStart(2,'0')}-${year}`
  }

  // HANDLE STRING (FORCE SAME FORMAT)
  if (typeof value === 'string') {
    const s = value.trim()

    // already in correct format
    if (s.includes('-')) {
      const [d, m, y] = s.split('-')
      return `${d.padStart(2,'0')}-${m.padStart(2,'0')}-${y}`
    }

    if (s.includes('/')) {
      const [d, m, y] = s.split('/')
      return `${d.padStart(2,'0')}-${m.padStart(2,'0')}-${y}`
    }
  }

  return ''
}

// Today as "DD-MM-YYYY" in script timezone
function todayKey() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy')
}

// Normalise month column: Google Sheets auto-parses "2026-05" as a Date object
function normalizeMonth(value) {
  if (!value) return ''
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM')
  }
  return String(value).trim()
}

// ─────────────────────────────────────────────
// MAIN ROUTER
// ─────────────────────────────────────────────
function doGet(e) {
  try {
    const action = e.parameter.action

    if (action === 'add')       return json(addAppointment(e.parameter))
    if (action === 'delete')    return json(deleteAppointment(e.parameter))
    if (action === 'fetch') {
      const rawDate    = e.parameter.date || 'MISSING'
      const normDate   = normalizeSheetDate(rawDate)
      const sheet      = getSheet(APPOINTMENT_SHEET)
      const rows       = sheet.getDataRange().getValues()
      const totalRows  = rows.length - 1
      // Check first 3 data rows
      const sample = rows.slice(1, 4).map(r => ({
        raw:  String(r[0]),
        type: (r[0] instanceof Date) ? 'Date' : typeof r[0],
        norm: normalizeSheetDate(r[0]),
        match: normalizeSheetDate(r[0]) === normDate
      }))
      const data = fetchForDate(rawDate)
      return json({ success: true, data, debug: { rawDate, normDate, totalRows, sample } })
    }
    if (action === 'stats')     return json(handleStats())
    if (action === 'dashboard') return json({ success: true, stats: handleStats(), today: fetchForDate(e.parameter.date) })

    // DEBUG — call ?action=debug_fetch&date=02/05/2026 to inspect raw sheet values
    if (action === 'debug_fetch') return json(debugFetch(e.parameter.date))

    if (action === 'staffGet')       return json(staffGet())
    if (action === 'staffSave')      return json(staffSave(e))
    if (action === 'staffDelete')    return json(staffDelete(e))
    if (action === 'attendanceSave') return json(attendanceSave(e))
    if (action === 'attendanceGet')  return json(attendanceGet(e))
    if (action === 'paymentSave')    return json(paymentSave(e))
    if (action === 'paymentGet')     return json(paymentGet(e))

    if (action === 'productGet')     return json(productGet())
    if (action === 'productSave')    return json(productSave(e))
    if (action === 'productDelete')  return json(productDelete(e))
    if (action === 'reportSave') return json(reportSave(e))
    if (action === 'reportGet')  return json(reportGet(e))
    if (action === 'reportUpdate') return json(reportUpdate(e))
    // expenses
    if (action === 'expenseSave')   return json(expenseSave(e))
    if (action === 'expenseGet')    return json(expenseGet(e))
    if (action === 'expenseDelete') return json(expenseDelete(e))
    if (action === 'campaignGet') return json(campaignGet(e))
    // Service
    if (action === 'serviceGet')    return json(serviceGet())
    if (action === 'serviceSave')   return json(serviceSave(e))
    if (action === 'serviceDelete') return json(serviceDelete(e))

    // Membership
    if (action === 'membershipPlansGet')   return json(membershipPlansGet(e))
    if (action === 'membershipPlanSave')   return json(membershipPlanSave(e))
    if (action === 'membershipPlanDelete') return json(membershipPlanDelete(e))
    if (action === 'membershipSave')       return json(membershipSave(e))
    if (action === 'membershipGet')        return json(membershipGet(e))
    if (action === 'membershipListGet')    return json(membershipListGet(e))
    if (action === 'membershipUsageGet')   return json(membershipUsageGet(e))
    if (action === 'membershipUsageSave')  return json(membershipUsageSave(e))

    return json({ success: false, error: 'Invalid action' })
  } catch (err) {
    return json({ success: false, error: err.message })
  }
}

// ─────────────────────────────────────────────
// COMMON
// ─────────────────────────────────────────────
function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)
}

function getSheet(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name)
}
function getAllRows(sheet) {
  const lastRow = sheet.getLastRow()
  const lastCol = sheet.getLastColumn()
  if (lastRow === 0) return []
  return sheet.getRange(1, 1, lastRow, lastCol).getValues()
}

// ─────────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────────
function addAppointment(data) {
  const sheet = getSheet(APPOINTMENT_SHEET)
  const [time, chairId] = data.slotKey.split('_')

  const formattedDate = normalizeSheetDate(data.date)

  sheet.appendRow([
     "'" + formattedDate,
    time,
    chairId,
    data.chairType,
    data.name,
    data.mobile,
    data.services,
    data.notes || '',
    new Date().toISOString(),
    data.slotKey
  ])

  clearCache(formattedDate)

  return { success: true }
}

function deleteAppointment(data) {
  const sheet      = getSheet(APPOINTMENT_SHEET)
  const rows       = getAllRows(sheet)   // ✅ FIX HERE

  const targetDate = normalizeSheetDate(data.date)
  const targetSlot = data.slotKey

  for (let i = rows.length - 1; i >= 1; i--) {
    if (
      normalizeSheetDate(rows[i][0]) === targetDate &&
      rows[i][9] === targetSlot
    ) {
      sheet.deleteRow(i + 1)
      clearCache(targetDate)
    }
  }

  return { success: true }
}

// DEBUG: shows raw cell values so you can see exactly what Sheets returns
function debugFetch(date) {
  const sheet = getSheet(APPOINTMENT_SHEET)
  const rows  = sheet.getDataRange().getValues()
  const incoming       = date
  const incomingNorm   = normalizeSheetDate(date)
  const todayFormatted = todayKey()
  const preview = rows.slice(1, 6).map(r => ({
    rawCell:       String(r[0]),
    typeofCell:    typeof r[0],
    isDate:        r[0] instanceof Date,
    normalized:    normalizeSheetDate(r[0]),
    slotKey:       r[9],
    matches:       normalizeSheetDate(r[0]) === incomingNorm
  }))
  return {
    success:       true,
    incoming,
    incomingNorm,
    todayFormatted,
    scriptTimezone: Session.getScriptTimeZone(),
    first5Rows:    preview
  }
}

function fetchForDate(date) {
  const targetDate = normalizeSheetDate(date)

  const sheet = getSheet(APPOINTMENT_SHEET)
  const rows = sheet.getDataRange().getValues()

  const result = {}

  for (let i = 1; i < rows.length; i++) {
    const rowDate = normalizeSheetDate(rows[i][0])

    if (rowDate === targetDate) {
      result[rows[i][9]] = {
        name: rows[i][4],
        mobile: rows[i][5],
        services: rows[i][6],
        notes: rows[i][7],
        chairType: rows[i][3],
        createdAt: rows[i][8]
      }
    }
  }

  return result
}
// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────
function handleStats() {
  const cache  = CacheService.getScriptCache()
  const cached = cache.get('stats')
  if (cached) return JSON.parse(cached)
  const result = computeStats()
  cache.put('stats', JSON.stringify(result), 60)
  return result
}

function computeStats() {
  const sheet = getSheet(APPOINTMENT_SHEET)
  const rows  = getAllRows(sheet)

  if (rows.length <= 1) return emptyStats()

  const tz    = Session.getScriptTimeZone()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let todayTotal  = 0
  let next7Days   = 0
  let next13Days  = 0

  const last7Map = {}
  const serviceCount = {}
  const todayBookings = []

  // last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)

    const key = Utilities.formatDate(d, tz, 'dd-MM-yyyy')

    last7Map[key] = {
      label: Utilities.formatDate(d, tz, 'EEE d'),
      count: 0,
      isToday: i === 0
    }
  }

  rows.slice(1).forEach(r => {
    const dStr = normalizeSheetDate(r[0])
    if (!dStr) return

    const [dd, mm, yyyy] = dStr.split('-').map(Number)
    const d = new Date(yyyy, mm - 1, dd)
    d.setHours(0, 0, 0, 0)

    const diff = Math.round((d - today) / 86400000)

    if (diff === 0) {
      todayTotal++
      todayBookings.push({
        name: r[4],
        services: r[6],
        time: r[1]
      })
    }

    if (diff >= 0 && diff <= 7)  next7Days++
    if (diff >= 0 && diff <= 13) next13Days++

    if (last7Map[dStr]) last7Map[dStr].count++

    if (r[6]) {
      r[6].split(',').forEach(s => {
        const key = s.trim()
        if (key) serviceCount[key] = (serviceCount[key] || 0) + 1
      })
    }
  })

  const last7 = Object.values(last7Map)

  const topServices = Object.entries(serviceCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    success: true,
    todayTotal,
    next7Days,
    next13Days,
    totalAll: rows.length - 1,
    last7,
    topServices,
    todayBookings
  }
}

function emptyStats() {
  const tz   = Session.getScriptTimeZone()
  const last7 = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    last7.push({
      label:   Utilities.formatDate(d, tz, 'EEE d'),
      count:   0,
      isToday: i === 0
    })
  }
  return { success: true, todayTotal: 0, next7Days: 0, next13Days: 0,
           uniqueClients: 0, totalAll: 0, last7, topServices: [], todayBookings: [] }
}

// ─────────────────────────────────────────────
// STAFF
// ─────────────────────────────────────────────
function staffGet() {
  const sheet = getSheet(STAFF_SHEET)
  const rows  = sheet.getDataRange().getValues()
  const staff = rows.slice(1).map(r => ({
    id: String(r[0]), name: r[1], role: r[2], mobile: r[3],
    salary: r[4], joinDate: r[5], createdAt: r[6]
  }))
  return { success: true, staff }
}

function staffSave(e) {
  const sheet = getSheet(STAFF_SHEET)
  const rows  = sheet.getDataRange().getValues()
  const id    = e.parameter.id || String(Date.now())
  let found   = false

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i+1,1,1,7).setValues([[
        id, e.parameter.name, e.parameter.role, e.parameter.mobile,
        Number(e.parameter.salary)||0, e.parameter.joinDate, new Date()
      ]])
      found = true; break
    }
  }
  if (!found) sheet.appendRow([
    id, e.parameter.name, e.parameter.role, e.parameter.mobile,
    Number(e.parameter.salary)||0, e.parameter.joinDate, new Date()
  ])
  return { success: true, id }
}

function staffDelete(e) {
  const sheet = getSheet(STAFF_SHEET)
  const rows  = sheet.getDataRange().getValues()
  for (let i = rows.length-1; i >= 1; i--) {
    if (String(rows[i][0]) === String(e.parameter.id)) sheet.deleteRow(i+1)
  }
  return { success: true }
}

// ─────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────
function attendanceSave(e) {
  const lock = LockService.getScriptLock()
  lock.waitLock(30000)   // block concurrent saves so writes can't race each other

  try {
    const sheet   = getSheet(ATTENDANCE_SHEET)
    const staffId = String(e.parameter.staffId)
    const month   = e.parameter.month
    const day     = Number(e.parameter.day)
    const status  = e.parameter.status || ''
    const rows    = sheet.getDataRange().getValues()

    // Find ALL matching rows (guards against duplicates from past races) and
    // update the first one in place instead of delete+append, so no other
    // concurrent call can read a stale/half-written state in between.
    const matches = []
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === staffId && normalizeMonth(rows[i][1]) === month && Number(rows[i][2]) === day) {
        matches.push(i)
      }
    }

    if (status === '') {
      // delete bottom-up so row indices stay valid
      for (let k = matches.length - 1; k >= 0; k--) {
        sheet.deleteRow(matches[k] + 1)
      }
    } else if (matches.length === 0) {
      sheet.appendRow([staffId, month, day, status])
    } else {
      sheet.getRange(matches[0] + 1, 1, 1, 4).setValues([[staffId, month, day, status]])
      // remove any leftover duplicate rows for this staff/month/day, bottom-up
      for (let k = matches.length - 1; k >= 1; k--) {
        sheet.deleteRow(matches[k] + 1)
      }
    }

    return { success: true }
  } finally {
    lock.releaseLock()
  }
}

function attendanceGet(e) {
  const sheet  = getSheet(ATTENDANCE_SHEET)
  const rows   = sheet.getDataRange().getValues()
  const month  = e.parameter.month
  const result = {}

  // Iterate in sheet order; last row for a given staff/day wins, which
  // matches attendanceSave's "most recent write" semantics.
  rows.slice(1).forEach(r => {
    if (normalizeMonth(r[1]) === month) {
      const sid = String(r[0]), day = Number(r[2]), status = r[3]
      if (status) {
        if (!result[sid]) result[sid] = {}
        result[sid][day] = status
      }
    }
  })
  return { success: true, attendance: result }
}

// ─────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────
function paymentSave(e) {
  const sheet   = getSheet(PAYMENT_SHEET)
  const rows    = sheet.getDataRange().getValues()
  const staffId = String(e.parameter.staffId)
  const month   = e.parameter.month
  let updated   = false

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === staffId && normalizeMonth(rows[i][1]) === month) {
      sheet.getRange(i+1,1,1,6).setValues([[
        staffId, month, Number(e.parameter.advance)||0,
        Number(e.parameter.pending)||0, Number(e.parameter.bonus)||0,
        e.parameter.paid === 'true'
      ]])
      updated = true; break
    }
  }
  if (!updated) sheet.appendRow([
    staffId, month, Number(e.parameter.advance)||0,
    Number(e.parameter.pending)||0, Number(e.parameter.bonus)||0,
    e.parameter.paid === 'true'
  ])
  return { success: true }
}

function paymentGet(e) {
  const sheet  = getSheet(PAYMENT_SHEET)
  const rows   = sheet.getDataRange().getValues()
  const month  = e.parameter.month
  const result = {}

  rows.slice(1).forEach(r => {
    if (normalizeMonth(r[1]) === month) {
      result[String(r[0])] = {
        advance: Number(r[2])||0, pending: Number(r[3])||0,
        bonus: Number(r[4])||0,
        paid: r[5] === true || r[5] === 'TRUE' || r[5] === 'true'
      }
    }
  })
  return { success: true, payments: result }
}
//GetProduct
function productGet() {
  const sheet = getSheet(PRODUCT_SHEET)
  if (!sheet) return { success: false, error: 'products sheet not found' }

  const rows = sheet.getDataRange().getValues()
  // Skip header row (row 0)
  const products = rows.slice(1)
    .filter(r => r[0] && r[1])          // must have id and name
    .map(r => ({
      id:       String(r[0]),
      name:     String(r[1]).trim(),
      price:    Number(r[2]) || 0,
      category: r[3] ? String(r[3]).trim() : '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name))  // alphabetical

  return { success: true, products }
}
//Save the product
function productSave(e) {
  const sheet = getSheet(PRODUCT_SHEET)
  if (!sheet) return { success: false, error: 'products sheet not found' }

  const id    = e.parameter.id || String(Date.now())
  const name  = (e.parameter.name  || '').trim()
  const price = Number(e.parameter.price) || 0
  const cat   = (e.parameter.category || '').trim()

  if (!name) return { success: false, error: 'name is required' }

  const rows  = sheet.getDataRange().getValues()
  let updated = false

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 1, 1, 1, 5).setValues([[id, name, price, cat, new Date()]])
      updated = true
      break
    }
  }

  if (!updated) {
    sheet.appendRow([id, name, price, cat, new Date()])
  }

  return { success: true, id }
}
// delete product
function productDelete(e) {
  const sheet = getSheet(PRODUCT_SHEET)
  if (!sheet) return { success: false, error: 'products sheet not found' }

  const id   = String(e.parameter.id || '')
  const rows = sheet.getDataRange().getValues()

  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]) === id) {
      sheet.deleteRow(i + 1)
    }
  }

  return { success: true }
}
// Report Billing
function ensureReportHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Date', 'InvoiceNo', 'Customer', 'Phone',
      'Items', 'StaffList', 'Subtotal', 'Discount', 'DiscountReason',
      'GrandTotal', 'PaymentMethod', 'CreatedAt'
    ])
  }
}

function reportSave(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(REPORT_SHEET)
  if (!sheet) {
    return { success: false, error: 'Sheet "report" not found. Create it in your spreadsheet.' }
  }

  ensureReportHeaders(sheet)

  const date   = normalizeSheetDate(e.parameter.date || '')
  const method = (e.parameter.paymentMethod || 'Cash').trim()

  sheet.appendRow([
    "'" + date,                            // Col A: Date  (apostrophe keeps it as text)
    e.parameter.invoiceNo      || '',      // Col B: InvoiceNo
    e.parameter.customerName   || 'Walk-in', // Col C: Customer
    e.parameter.customerPhone  || '',      // Col D: Phone
    e.parameter.items          || '',      // Col E: Items  e.g. "Hair Trim x1 (Lucky); D-Tan x1 (Priyanka)"
    e.parameter.staffList      || '',      // Col F: StaffList  e.g. "Lucky, Priyanka"
    Number(e.parameter.subtotal)   || 0,   // Col G: Subtotal
    Number(e.parameter.discount)   || 0,   // Col H: Discount
    e.parameter.discountReason || '',      // Col I: DiscountReason
    Number(e.parameter.grandTotal) || 0,   // Col J: GrandTotal
    method,                                // Col K: PaymentMethod  "Cash" or "UPI"
    new Date().toISOString()               // Col L: CreatedAt
  ])

  return { success: true }
}

function reportGet(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(REPORT_SHEET)
  if (!sheet) {
    return { success: false, error: 'Sheet "report" not found.' }
  }

  const rows = sheet.getDataRange().getValues()
  if (rows.length <= 1) return { success: true, rows: [] }   // only header or empty

  const filterDate  = e.parameter.date  ? normalizeSheetDate(e.parameter.date)  : null
  const filterMonth = e.parameter.month || null   // "YYYY-MM"

  const result = rows.slice(1)   // skip header row
    .filter(r => {
      const rowDate = normalizeSheetDate(r[0])
      if (!rowDate) return false
      // Day filter
      if (filterDate && rowDate !== filterDate) return false
      // Month filter  e.g. "2026-05"
      if (filterMonth) {
        const [dd, mm, yyyy] = rowDate.split('-')
        if (`${yyyy}-${mm}` !== filterMonth) return false
      }
      return true
    })
    .map(r => ({
      date:           normalizeSheetDate(r[0]),
      invoiceNo:      String(r[1] || ''),
      customerName:   String(r[2] || ''),
      customerPhone:  String(r[3] || ''),
      items:          String(r[4] || ''),
      staffList:      String(r[5] || ''),
      subtotal:       Number(r[6])  || 0,
      discount:       Number(r[7])  || 0,
      discountReason: String(r[8] || ''),
      grandTotal:     Number(r[9])  || 0,
      paymentMethod:  String(r[10] || 'Cash'),
      createdAt:      String(r[11] || ''),
    }))

  return { success: true, rows: result }
}

// reportUpdate: edit an existing invoice row. The row is matched by InvoiceNo
// plus CreatedAt (invoice numbers only carry a 3-digit random suffix, so
// CreatedAt disambiguates collisions). Date, InvoiceNo and CreatedAt are kept.
function reportUpdate(e) {
  const lock = LockService.getScriptLock()
  try { lock.waitLock(15000) } catch (_) {
    return { success: false, error: 'Server busy — please try again.' }
  }
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(REPORT_SHEET)
    if (!sheet) return { success: false, error: 'Sheet "report" not found.' }

    const invoiceNo = String(e.parameter.invoiceNo || '').trim()
    const createdAt = String(e.parameter.createdAt || '').trim()
    if (!invoiceNo) return { success: false, error: 'invoiceNo is required' }

    const rows = sheet.getDataRange().getValues()
    let rowIndex = -1
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][1]) !== invoiceNo) continue
      if (createdAt && String(rows[i][11] || '') !== createdAt) continue
      rowIndex = i + 1   // 1-based sheet row
      break
    }
    if (rowIndex === -1) return { success: false, error: 'Invoice ' + invoiceNo + ' not found' }

    // Columns C..K: Customer, Phone, Items, StaffList, Subtotal, Discount,
    // DiscountReason, GrandTotal, PaymentMethod
    sheet.getRange(rowIndex, 3, 1, 9).setValues([[
      e.parameter.customerName   || 'Walk-in',
      e.parameter.customerPhone  || '',
      e.parameter.items          || '',
      e.parameter.staffList      || '',
      Number(e.parameter.subtotal)   || 0,
      Number(e.parameter.discount)   || 0,
      e.parameter.discountReason || '',
      Number(e.parameter.grandTotal) || 0,
      (e.parameter.paymentMethod || 'Cash').trim()
    ]])

    return { success: true }
  } finally {
    lock.releaseLock()
  }
}
// expenses
function expenseSave(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(EXPENSE_SHEET)
  if (!sheet) return { success: false, error: 'Sheet "expenses" not found. Create it first.' }
  const id   = e.parameter.id || String(Date.now())
  const date = (e.parameter.date || '').trim()   // keep as-is: "2026-05-30"
  const rows    = sheet.getDataRange().getValues()
  let updated   = false
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 1, 1, 1, 7).setValues([[
        id, date, e.parameter.purpose || '',
        Number(e.parameter.amount) || 0,
        e.parameter.category || '',
        e.parameter.paymentMode || 'Cash',
        new Date().toISOString()
      ]])
      updated = true; break
    }
  }

  if (!updated) {
    sheet.appendRow([
      id, date, e.parameter.purpose || '',
      Number(e.parameter.amount) || 0,
      e.parameter.category || '',
      e.parameter.paymentMode || 'Cash',
      new Date().toISOString()
    ])
  }

  return { success: true, id }
}

function normalizeExpenseDate(value) {
  if (!value) return ''

  // If Google Sheets stored it as Date
  if (value instanceof Date) {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    )
  }

  // If stored as text
  return String(value).trim()
}

function expenseGet(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(EXPENSE_SHEET)

  if (!sheet) {
    return {
      success: false,
      error: 'Sheet "expenses" not found.'
    }
  }

  const rows = sheet.getDataRange().getValues()

  if (rows.length <= 1) {
    return {
      success: true,
      expenses: []
    }
  }

  const filterDate = (e.parameter.date || '').trim()
  const filterMonth = (e.parameter.month || '').trim()

  const expenses = rows
    .slice(1) // Skip header
    .filter(row => {
      const rowDate = normalizeExpenseDate(row[1])

      if (!rowDate) return false

      // Filter by exact date
      if (filterDate && rowDate !== filterDate) {
        return false
      }

      // Filter by month (YYYY-MM)
      if (filterMonth && !rowDate.startsWith(filterMonth)) {
        return false
      }

      return true
    })
    .map(row => ({
      id: String(row[0] || ''),
      date: normalizeExpenseDate(row[1]),
      purpose: String(row[2] || ''),
      amount: Number(row[3]) || 0,
      category: String(row[4] || ''),
      paymentMode: String(row[5] || 'Cash'),
      createdAt: String(row[6] || '')
    }))
    .sort((a, b) => {
      return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
    })

  return {
    success: true,
    expenses
  }
}

function expenseDelete(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(EXPENSE_SHEET)
  if (!sheet) return { success: false, error: 'Sheet "expenses" not found.' }

  const id   = String(e.parameter.id || '')
  const rows = sheet.getDataRange().getValues()
  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]) === id) sheet.deleteRow(i + 1)
  }
  return { success: true }
}

// campaign
function campaignGet(e) {
  const days  = parseInt((e && e.parameter && e.parameter.days) || '30', 10)
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(REPORT_SHEET)

  if (!sheet) {
    return { success: false, error: 'Sheet "report" not found.' }
  }

  const rows = sheet.getDataRange().getValues()
  if (rows.length <= 1) return { success: true, customers: [] }

  // Map phone → { name, lastVisit (as Date), lastVisitStr, lastService }
  const phoneMap = {}

  rows.slice(1).forEach(r => {
    const dateStr   = normalizeSheetDate(r[0])   // "DD-MM-YYYY"
    const name      = String(r[2] || '').trim()
    const phone     = String(r[3] || '').trim().replace(/\D/g, '')  // digits only
    const items     = String(r[4] || '').trim()

    if (!phone || phone.length < 10) return   // skip rows with no valid phone
    if (!dateStr) return

    const [dd, mm, yyyy] = dateStr.split('-').map(Number)
    const visitDate = new Date(yyyy, mm - 1, dd)

    if (!phoneMap[phone] || visitDate > phoneMap[phone].visitDate) {
      phoneMap[phone] = {
        name:        name || 'Unknown',
        phone:       phone,
        lastVisit:   dateStr,
        visitDate:   visitDate,          // for comparison only
        lastService: items.split(';')[0].split('(')[0].trim() || '—'
      }
    }
  })

  const tz    = Session.getScriptTimeZone()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const MS_PER_DAY = 86400000

  const customers = Object.values(phoneMap)
    .map(c => ({
      name:        c.name,
      phone:       c.phone,
      lastVisit:   c.lastVisit,
      lastService: c.lastService,
      daysAgo:     Math.floor((today - c.visitDate) / MS_PER_DAY)
    }))
    .filter(c => c.daysAgo === days)          // exactly N days ago, not N+
    .sort((a, b) => b.daysAgo - a.daysAgo)    // longest overdue first

  return { success: true, customers }
}
// Service
// ─────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────
function serviceGet() {
  const sheet = getSheet(SERVICES_SHEET)
  if (!sheet) return { success: false, error: 'services sheet not found' }

  const rows = sheet.getDataRange().getValues()
  const services = rows.slice(1)
    .filter(r => r[0] && r[1])
    .map(r => ({
      id:       String(r[0]),
      name:     String(r[1]).trim(),
      price:    Number(r[2]) || 0,
      category: r[3] ? String(r[3]).trim() : '',
    }))
    .sort((a, b) => {
      const catCmp = a.category.localeCompare(b.category)
      return catCmp !== 0 ? catCmp : a.name.localeCompare(b.name)
    })

  return { success: true, services }
}

function serviceSave(e) {
  const sheet = getSheet(SERVICES_SHEET)
  if (!sheet) return { success: false, error: 'services sheet not found' }

  const id    = e.parameter.id || String(Date.now())
  const name  = (e.parameter.name     || '').trim()
  const price = Number(e.parameter.price) || 0
  const cat   = (e.parameter.category || '').trim()

  if (!name) return { success: false, error: 'name is required' }

  const rows    = sheet.getDataRange().getValues()
  let updated   = false

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 1, 1, 1, 5).setValues([[id, name, price, cat, new Date()]])
      updated = true
      break
    }
  }

  if (!updated) {
    sheet.appendRow([id, name, price, cat, new Date()])
  }

  return { success: true, id }
}

function serviceDelete(e) {
  const sheet = getSheet(SERVICES_SHEET)
  if (!sheet) return { success: false, error: 'services sheet not found' }

  const id   = String(e.parameter.id || '')
  const rows = sheet.getDataRange().getValues()

  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]) === id) {
      sheet.deleteRow(i + 1)
    }
  }

  return { success: true }
}

// ─────────────────────────────────────────────
// MEMBERSHIP
// ─────────────────────────────────────────────

// DD-MM-YYYY string -> Date at midnight (local script timezone)
function parseSheetDate(dateStr) {
  const [dd, mm, yyyy] = String(dateStr).split('-').map(Number)
  return new Date(yyyy, mm - 1, dd)
}

// DD-MM-YYYY string + N months -> DD-MM-YYYY string
function addMonthsToDateStr(dateStr, months) {
  const d = parseSheetDate(dateStr)
  d.setMonth(d.getMonth() + Number(months))
  return normalizeSheetDate(d)
}

function computeMembershipStatus(expiryDateStr, remainingBalance) {
  if (remainingBalance <= 0) return 'Fully Utilized'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (today > parseSheetDate(expiryDateStr)) return 'Expired'
  return 'Active'
}

function getMembershipUsageTotal(membershipId) {
  const sheet = getSheet(MEMBERSHIP_USAGE_SHEET)
  if (!sheet) return 0
  const rows = sheet.getDataRange().getValues()
  let total = 0
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(membershipId)) {
      total += Number(rows[i][4]) || 0
    }
  }
  return total
}

function enrichMembership(row) {
  const benefitAmount = Number(row[7]) || 0
  const totalUsed     = getMembershipUsageTotal(row[0])
  const remainingBalance = Math.max(0, benefitAmount - totalUsed)
  const status = computeMembershipStatus(row[9], remainingBalance)

  return {
    id:             String(row[0]),
    membershipNo:   String(row[1] || ''),
    customerName:   String(row[2] || ''),
    customerPhone:  String(row[3] || ''),
    planId:         String(row[4] || ''),
    planName:       String(row[5] || ''),
    paidAmount:     Number(row[6]) || 0,
    benefitAmount:  benefitAmount,
    startDate:      normalizeSheetDate(row[8]),
    expiryDate:     normalizeSheetDate(row[9]),
    status:         status,
    paymentMethod:  String(row[11] || 'Cash'),
    invoiceNo:      String(row[12] || ''),
    createdAt:      String(row[13] || ''),
    staffName:      String(row[14] || ''),
    totalUsed:      totalUsed,
    remainingBalance: remainingBalance
  }
}

// Opportunistically writes the freshly computed status back to column K (idempotent, no lock needed)
function syncMembershipStatusCell(sheet, rowIndex, status) {
  sheet.getRange(rowIndex, 11).setValue(status)
}

// ── PLANS ──
function membershipPlansGet(e) {
  const sheet = getSheet(PLANS_SHEET)
  if (!sheet) return { success: false, error: 'plans sheet not found' }

  const includeInactive = e && e.parameter && e.parameter.all === 'true'
  const rows = sheet.getDataRange().getValues()

  const plans = rows.slice(1)
    .filter(r => r[0] && r[1])
    .map(r => ({
      id:             String(r[0]),
      name:           String(r[1]).trim(),
      paidAmount:     Number(r[2]) || 0,
      benefitAmount:  Number(r[3]) || 0,
      validityMonths: Number(r[4]) || 0,
      active:         r[5] === true || r[5] === 'TRUE' || r[5] === 'true' || r[5] === '',
      createdAt:      String(r[6] || '')
    }))
    .filter(p => includeInactive || p.active)
    .sort((a, b) => a.paidAmount - b.paidAmount)

  return { success: true, plans }
}

function membershipPlanSave(e) {
  const sheet = getSheet(PLANS_SHEET)
  if (!sheet) return { success: false, error: 'plans sheet not found' }

  const id             = e.parameter.id || String(Date.now())
  const name           = (e.parameter.name || '').trim()
  const paidAmount     = Number(e.parameter.paidAmount) || 0
  const benefitAmount  = Number(e.parameter.benefitAmount) || 0
  const validityMonths = Number(e.parameter.validityMonths) || 0
  const active         = e.parameter.active !== 'false'

  if (!name) return { success: false, error: 'name is required' }

  const rows  = sheet.getDataRange().getValues()
  let updated = false

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 1, 1, 1, 7).setValues([[
        id, name, paidAmount, benefitAmount, validityMonths, active, rows[i][6] || new Date()
      ]])
      updated = true
      break
    }
  }

  if (!updated) {
    sheet.appendRow([id, name, paidAmount, benefitAmount, validityMonths, active, new Date()])
  }

  return { success: true, id }
}

function membershipPlanDelete(e) {
  const sheet = getSheet(PLANS_SHEET)
  if (!sheet) return { success: false, error: 'plans sheet not found' }

  const id   = String(e.parameter.id || '')
  const rows = sheet.getDataRange().getValues()

  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]) === id) {
      sheet.deleteRow(i + 1)
    }
  }

  return { success: true }
}

// ── MEMBERSHIP ──
function membershipSave(e) {
  const lock = LockService.getScriptLock()
  lock.waitLock(30000)

  try {
    const sheet = getSheet(MEMBERSHIP_SHEET)
    if (!sheet) return { success: false, error: 'membership sheet not found' }

    const plansSheet = getSheet(PLANS_SHEET)
    if (!plansSheet) return { success: false, error: 'plans sheet not found' }

    const planId = String(e.parameter.planId || '')
    const planRows = plansSheet.getDataRange().getValues()
    let plan = null
    for (let i = 1; i < planRows.length; i++) {
      if (String(planRows[i][0]) === planId) {
        plan = {
          name: String(planRows[i][1]).trim(),
          benefitAmount: Number(planRows[i][3]) || 0,
          validityMonths: Number(planRows[i][4]) || 0
        }
        break
      }
    }
    if (!plan) return { success: false, error: 'Selected plan not found' }

    const customerName  = (e.parameter.customerName || '').trim()
    const customerPhone = (e.parameter.customerPhone || '').trim()
    if (!customerName)  return { success: false, error: 'Customer name is required' }
    if (!customerPhone) return { success: false, error: 'Customer phone is required' }

    const paidAmount    = Number(e.parameter.paidAmount) || 0
    const paymentMethod = (e.parameter.paymentMethod || 'Cash').trim()
    const invoiceNo     = e.parameter.invoiceNo || ''
    const staffName     = (e.parameter.staffName || '').trim()
    const startDate     = normalizeSheetDate(e.parameter.startDate || todayKey())
    const expiryDate    = addMonthsToDateStr(startDate, plan.validityMonths)

    // Generate a collision-checked membership number under the same lock
    const rows = sheet.getDataRange().getValues()
    const existingNos = new Set(rows.slice(1).map(r => String(r[1])))
    const pad = n => String(n).padStart(2, '0')
    const now = new Date()
    const datePart = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`
    let membershipNo
    do {
      membershipNo = `MEM-${datePart}-${Math.floor(Math.random() * 900 + 100)}`
    } while (existingNos.has(membershipNo))

    const id = String(Date.now())
    const status = computeMembershipStatus(expiryDate, plan.benefitAmount)

    sheet.appendRow([
      id, membershipNo, customerName, customerPhone,
      planId, plan.name, paidAmount, plan.benefitAmount,
      "'" + startDate, "'" + expiryDate, status,
      paymentMethod, invoiceNo, new Date().toISOString(),
      staffName                                  // Col O: Staff
    ])

    return {
      success: true, id, membershipNo, expiryDate,
      benefitAmount: plan.benefitAmount, status
    }
  } finally {
    lock.releaseLock()
  }
}

function membershipGet(e) {
  const sheet = getSheet(MEMBERSHIP_SHEET)
  if (!sheet) return { success: false, error: 'membership sheet not found' }

  const id    = e.parameter.id ? String(e.parameter.id) : null
  const phone = e.parameter.phone ? String(e.parameter.phone).trim() : null

  const rows = sheet.getDataRange().getValues()
  const memberships = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (id && String(row[0]) === id) {
      memberships.push(enrichMembership(row))
    } else if (phone && String(row[3]).trim() === phone) {
      memberships.push(enrichMembership(row))
    }
  }

  return { success: true, memberships }
}

function membershipListGet(e) {
  const sheet = getSheet(MEMBERSHIP_SHEET)
  if (!sheet) return { success: false, error: 'membership sheet not found' }

  const search = (e && e.parameter && e.parameter.search || '').trim().toLowerCase()
  const rows = sheet.getDataRange().getValues()

  let memberships = rows.slice(1).map(enrichMembership)

  if (search) {
    memberships = memberships.filter(m =>
      m.customerName.toLowerCase().includes(search) ||
      m.customerPhone.includes(search) ||
      m.membershipNo.toLowerCase().includes(search)
    )
  }

  memberships.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

  return { success: true, memberships }
}

function membershipUsageGet(e) {
  const sheet = getSheet(MEMBERSHIP_USAGE_SHEET)
  if (!sheet) return { success: false, error: 'membershipUsage sheet not found' }

  const membershipId = String(e.parameter.membershipId || '')
  const rows = sheet.getDataRange().getValues()

  const usage = rows.slice(1)
    .filter(r => String(r[1]) === membershipId)
    .map(r => ({
      id:                    String(r[0]),
      membershipId:          String(r[1]),
      date:                  normalizeSheetDate(r[2]),
      serviceDescription:    String(r[3] || ''),
      amount:                Number(r[4]) || 0,
      remainingBalanceAfter: Number(r[5]) || 0,
      staffName:             String(r[6] || ''),
      createdAt:             String(r[7] || '')
    }))
    .sort((a, b) => parseSheetDate(a.date) - parseSheetDate(b.date))

  return { success: true, usage }
}

function membershipUsageSave(e) {
  const lock = LockService.getScriptLock()
  lock.waitLock(30000)

  try {
    const sheet = getSheet(MEMBERSHIP_SHEET)
    if (!sheet) return { success: false, error: 'membership sheet not found' }
    const usageSheet = getSheet(MEMBERSHIP_USAGE_SHEET)
    if (!usageSheet) return { success: false, error: 'membershipUsage sheet not found' }

    const membershipId = String(e.parameter.membershipId || '')
    const rows = sheet.getDataRange().getValues()

    let rowIndex = -1
    let membershipRow = null
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === membershipId) {
        rowIndex = i + 1
        membershipRow = rows[i]
        break
      }
    }
    if (!membershipRow) return { success: false, error: 'Membership not found' }

    const benefitAmount = Number(membershipRow[7]) || 0
    const expiryDate    = normalizeSheetDate(membershipRow[9])
    const totalUsed     = getMembershipUsageTotal(membershipId)
    const remainingBalance = Math.max(0, benefitAmount - totalUsed)
    const status = computeMembershipStatus(expiryDate, remainingBalance)

    if (status === 'Expired')        return { success: false, error: 'Membership has expired' }
    if (status === 'Fully Utilized') return { success: false, error: 'Membership balance is fully utilized' }

    const requested = Number(e.parameter.amount) || 0
    if (requested <= 0) return { success: false, error: 'Service amount must be greater than zero' }

    const amountDeducted = Math.min(requested, remainingBalance)
    const clamped = amountDeducted < requested
    const newRemaining = remainingBalance - amountDeducted

    const date = normalizeSheetDate(e.parameter.date || todayKey())
    const serviceDescription = (e.parameter.serviceDescription || '').trim()
    const staffName = (e.parameter.staffName || '').trim()

    usageSheet.appendRow([
      String(Date.now()), membershipId, "'" + date, serviceDescription,
      amountDeducted, newRemaining, staffName, new Date().toISOString()
    ])

    const newStatus = computeMembershipStatus(expiryDate, newRemaining)
    syncMembershipStatusCell(sheet, rowIndex, newStatus)

    return {
      success: true,
      amountDeducted,
      remainingBalance: newRemaining,
      clamped
    }
  } finally {
    lock.releaseLock()
  }
}

// ─────────────────────────────────────────────
// CACHE CLEAR
// ─────────────────────────────────────────────
function clearCache(date) {
  const cache      = CacheService.getScriptCache()
  const normalized = normalizeSheetDate(date)
  const safeDate   = normalized.replace(/\//g, '_')
  cache.remove('stats')
  if (date) cache.remove('appt2_' + safeDate)      // must match prefix in fetchForDate
}