import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory store of feature rows by dataset
const store = {
  certificates: [],
  maintenance: [],
  branding: [],
  mileage: [],
  cleaning: [],
  stabling: [],
};

function getHeaderAliases(dataset) {
  switch (dataset) {
    case 'branding':
      return {
        'Trainset ID': 'train_id',
        'Advertiser Contract ID': 'advertiser_contract_id',
        'Wrap Exposure Hours Remaining': 'exposure_hours_remaining',
        'Branding Priority Score': 'branding_priority_score',
        'Next Scheduling Deadline': 'branding_deadline',
        'Penalty Risk Flag': 'penalty_risk_flag',
      };
    case 'cleaning':
      return {
        'Trainset ID': 'train_id',
        'Cleaning Required': 'cleaning_required',
        'Detailing Required': 'detailing_required',
        'Available Cleaning Slot': 'available_slot_time',
        'Bay Occupancy Status': 'bay_occupancy_status',
        'Cleaning Manpower Available': 'manpower_available',
      };
    case 'maintenance':
      return {
        'Trainset ID': 'train_id',
        'Open Work Orders': 'open_work_orders',
        'Closed Work Orders (last 24h)': 'closed_work_orders_24h',
        'Priority Level': 'priority_level',
        'Maintenance Type': 'maintenance_type',
        'Estimated Completion Date': 'estimated_completion',
      };
    case 'mileage':
      return {
        'Trainset ID': 'train_id',
        'Total KM since last maintenance': 'total_km_since_maint',
        'Mileage Deviation from Avg': 'mileage_diff_from_avg',
        'Component Wear Estimate': 'component_wear_estimate',
        'Recommended Mileage Allocation': 'recommended_allocation_km',
      };
    case 'stabling':
      return {
        'Trainset ID': 'train_id',
        'Stabling Bay Number': 'stabling_bay',
        'Accessibility Score': 'accessibility_score',
        'Shunting Required': 'shunting_required',
        'Estimated Shunting Time': 'shunting_time_min',
        'Distance from Inspection/Cleaning Bay': 'distance_from_bays_m',
      };
    case 'certificates':
      return {
        'Trainset ID': 'train_id',
        'Rolling-Stock fitness status': 'rolling_stock_status',
        'Signalling fitness status': 'signalling_status',
        'Telecom fitness status': 'telecom_status',
        'Overall fitness clearance': 'overall_fitness_clearance',
      };
    default:
      return {};
  }
}

function coerceBoolean(v) {
  if (v === undefined || v === null || v === '') return undefined;
  const s = String(v).trim().toLowerCase();
  if (['true', 'yes', 'y', '1'].includes(s)) return true;
  if (['false', 'no', 'n', '0'].includes(s)) return false;
  return undefined;
}

function coerceNumber(v) {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(String(v).replace(/[\,\s]/g, ''));
  return isNaN(n) ? undefined : n;
}

function extractDateFromStatus(v) {
  if (!v) return {};
  const s = String(v);
  const m = s.match(/^(valid|expired)\s*(?:\(([^)]+)\))?$/i);
  if (m) {
    return { status: m[1].toLowerCase(), date: m[2] };
  }
  const m2 = s.match(/(\d{4}-\d{2}-\d{2})/);
  return { status: s.toLowerCase(), date: m2?.[1] };
}

function parseWearString(s) {
  if (!s) return {};
  const out = {};
  const parts = String(s).split(',').map((p) => p.trim());
  for (const p of parts) {
    const m = p.match(/(bogie|brake|hvac)\s*:\s*(\d+(?:\.\d+)?)%/i);
    if (m) {
      const key = m[1].toLowerCase();
      const val = Number(m[2]);
      if (key === 'bogie') out['wear_bogie'] = val;
      if (key === 'brake') out['wear_brake_pad'] = val;
      if (key === 'hvac') out['wear_hvac'] = val;
    }
  }
  return out;
}

function normalizeRowsForDataset(rows, dataset) {
  const alias = getHeaderAliases(dataset);
  return rows.map((orig) => {
    const r = {};
    Object.keys(orig).forEach((k) => {
      const key = alias[k] || k;
      r[key] = orig[k];
    });
    const id = r['train_id'] ?? r['trainId'] ?? r['Trainset ID'];
    if (id != null && id !== '') r['train_id'] = String(id);

    if (dataset === 'branding') {
      const b = coerceBoolean(r['penalty_risk_flag']);
      if (b !== undefined) r['penalty_risk_flag'] = b;
      const raw = r['branding_priority_score'];
      if (raw !== undefined && raw !== '') {
        const num = coerceNumber(raw);
        if (num !== undefined) r['branding_priority_score'] = num;
        else {
          const s = String(raw).toLowerCase();
          const map = { low: 3, medium: 6, high: 9 };
          if (s in map) r['branding_priority_score'] = map[s];
        }
      }
    }

    if (dataset === 'cleaning') {
      const cr = r['cleaning_required'];
      if (cr !== undefined && cr !== '') {
        const b = coerceBoolean(cr);
        if (b !== undefined) r['cleaning_required'] = b ? 'standard' : 'no';
      }
      const dr = r['detailing_required'];
      if (dr !== undefined && dr !== '') {
        const b = coerceBoolean(dr);
        if (b !== undefined) r['detailing_required'] = b ? 'full' : 'no';
      }
      if (typeof r['bay_occupancy_status'] === 'string') {
        const s = String(r['bay_occupancy_status']).toLowerCase();
        if (s === 'occupied') r['bay_occupancy_status'] = 'busy';
        if (s === 'free') r['bay_occupancy_status'] = 'free';
      }
      const mp = coerceNumber(r['manpower_available']);
      if (mp !== undefined) r['manpower_available'] = mp;
    }

    if (dataset === 'maintenance') {
      const ow = coerceNumber(r['open_work_orders']);
      if (ow !== undefined) r['open_work_orders'] = ow;
      const cw = coerceNumber(r['closed_work_orders_24h']);
      if (cw !== undefined) r['closed_work_orders_24h'] = cw;
      if (typeof r['priority_level'] === 'string') r['priority_level'] = String(r['priority_level']).toLowerCase();
      if (typeof r['maintenance_type'] === 'string') r['maintenance_type'] = String(r['maintenance_type']).toLowerCase();
    }

    if (dataset === 'mileage') {
      const t = coerceNumber(r['total_km_since_maint']);
      if (t !== undefined) r['total_km_since_maint'] = t;
      const d = coerceNumber(r['mileage_diff_from_avg']);
      if (d !== undefined) r['mileage_diff_from_avg'] = d;
      const alloc = coerceNumber(r['recommended_allocation_km']);
      if (alloc !== undefined) r['recommended_allocation_km'] = alloc;
      const wear = parseWearString(r['component_wear_estimate']);
      Object.assign(r, wear);
    }

    if (dataset === 'stabling') {
      const acc = coerceNumber(r['accessibility_score']);
      if (acc !== undefined) r['accessibility_score'] = acc;
      const st = coerceNumber(r['shunting_time_min']);
      if (st !== undefined) r['shunting_time_min'] = st;
      const dist = coerceNumber(r['distance_from_bays_m']);
      if (dist !== undefined) r['distance_from_bays_m'] = dist;
      const b = coerceBoolean(r['shunting_required']);
      if (b !== undefined) r['shunting_required'] = b;
    }

    if (dataset === 'certificates') {
      const rs = extractDateFromStatus(r['rolling_stock_status']);
      if (rs.status) r['rolling_stock_status'] = rs.status;
      if (rs.date) r['rolling_stock_valid_until'] = rs.date;
      const sg = extractDateFromStatus(r['signalling_status']);
      if (sg.status) r['signalling_status'] = sg.status;
      if (sg.date) r['signalling_valid_until'] = sg.date;
      const tc = extractDateFromStatus(r['telecom_status']);
      if (tc.status) r['telecom_status'] = tc.status;
      if (tc.date) r['telecom_valid_until'] = tc.date;
      if (typeof r['overall_fitness_clearance'] === 'string') {
        const s = String(r['overall_fitness_clearance']).toLowerCase();
        if (s.includes('cleared')) r['overall_fitness_clearance'] = 'auto';
        if (s.includes('not')) r['overall_fitness_clearance'] = 'manual_override_no';
      }
    }

    return r;
  });
}

function getMasterHeaders() {
  const seen = new Set(['train_id']);
  const headers = ['train_id'];
  const datasets = Object.keys(store);
  for (const ds of datasets) {
    const rows = store[ds] || [];
    for (const r of rows) {
      for (const k of Object.keys(r)) {
        if (!seen.has(k)) {
          seen.add(k);
          headers.push(k);
        }
      }
    }
  }
  return headers;
}

function buildMasterCSV() {
  const masterMap = new Map();
  const datasets = Object.keys(store);
  for (const ds of datasets) {
    for (const r of store[ds]) {
      const id = String(r.train_id || r.trainId || r['Trainset ID'] || '');
      if (!id) continue;
      if (!masterMap.has(id)) masterMap.set(id, { train_id: id });
      const target = masterMap.get(id);
      Object.keys(r).forEach((k) => {
        if (k === 'train_id' || k === 'trainId' || k === 'Trainset ID') return;
        if (r[k] !== undefined && r[k] !== '') target[k] = r[k];
      });
    }
  }
  const rows = Array.from(masterMap.values());
  const headers = getMasterHeaders();
  const lines = [headers.join(',')];
  for (const row of rows) {
    const line = headers
      .map((h) => {
        const v = row[h] ?? '';
        const s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      })
      .join(',');
    lines.push(line);
  }
  return lines.join('\n');
}

app.post('/api/ml/feature', (req, res) => {
  const { dataset, rows } = req.body || {};
  if (!dataset || !Array.isArray(rows)) {
    return res.status(400).json({ status: 'error', message: 'dataset and rows required' });
  }
  if (!(dataset in store)) store[dataset] = [];
  store[dataset] = rows;
  res.json({ status: 'ok', saved: rows.length });
});

app.get('/api/ml/master.csv', (req, res) => {
  const csv = buildMasterCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

app.post('/api/ml/ingest', (req, res) => {
  const { dataset, rows } = req.body || {};
  if (!dataset || !Array.isArray(rows)) {
    return res.status(400).json({ status: 'error', message: 'dataset and rows required' });
  }
  if (!(dataset in store)) store[dataset] = [];
  store[dataset] = rows;
  res.json({ status: 'ok', ingested: rows.length });
});

app.post('/api/ml/load-local', async (req, res) => {
  try {
    const base = 'd:/csv files';
    const files = [
      { path: path.join(base, 'branding_priorities.csv'), dataset: 'branding' },
      { path: path.join(base, 'cleaning_slots.csv'), dataset: 'cleaning' },
      { path: path.join(base, 'fitness_certificates.csv'), dataset: 'certificates' },
      { path: path.join(base, 'jobcard_status.csv'), dataset: 'maintenance' },
      { path: path.join(base, 'mileage_balancing.csv'), dataset: 'mileage' },
      { path: path.join(base, 'stabling_geometry.csv'), dataset: 'stabling' },
    ];
    const loaded = {};

    for (const f of files) {
      if (!fs.existsSync(f.path)) { loaded[f.dataset] = 0; continue; }
      const content = fs.readFileSync(f.path, 'utf8');
      const parsed = Papa.parse(content, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim() });
      const rows = (parsed.data || []).map((r) => {
        const obj = {};
        Object.keys(r).forEach((k) => { obj[k.trim()] = r[k]; });
        return obj;
      });
      const normalized = normalizeRowsForDataset(rows, f.dataset);
      store[f.dataset] = normalized;
      loaded[f.dataset] = normalized.length;
    }

    const masterCount = Object.values(store).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
    res.json({ status: 'ok', loaded, total_feature_rows: masterCount });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e?.message || 'Failed to load local CSVs' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`ML backend listening on http://localhost:${PORT}`);
});
