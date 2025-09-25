import Papa from 'papaparse';

export type DatasetType =
  | 'certificates' // Fitness Certificates
  | 'maintenance' // Job-Card Status (Work Orders)
  | 'branding' // Branding Priorities
  | 'mileage' // Mileage Balancing
  | 'cleaning' // Cleaning & Detailing Slots
  | 'stabling'; // Stabling Geometry (Physical Positioning)

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum';

export interface CSVField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  enumValues?: string[];
  tooltip?: string;
  validator?: (value: any) => string | null; // return error message or null if valid
}

// Normalize external CSV headers/values to internal schema keys/values
// so that users can upload domain CSVs with friendly headers.
function getHeaderAliases(dataset: DatasetType): Record<string, string> {
  // keys are as they appear in users' CSVs (trimmed), values are internal keys
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
        'Component Wear Estimate': 'component_wear_estimate', // will be split
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

function coerceBoolean(v: any): boolean | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const s = String(v).trim().toLowerCase();
  if (['true', 'yes', 'y', '1'].includes(s)) return true;
  if (['false', 'no', 'n', '0'].includes(s)) return false;
  return undefined;
}

function coerceNumber(v: any): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(String(v).replace(/[,\s]/g, ''));
  return isNaN(n) ? undefined : n;
}

function extractDateFromStatus(v: string | undefined): { status?: string; date?: string } {
  if (!v) return {};
  const s = String(v);
  // e.g., "valid (2025-11-17)" or "expired"
  const m = s.match(/^(valid|expired)\s*(?:\(([^)]+)\))?$/i);
  if (m) {
    const status = m[1].toLowerCase();
    const date = m[2];
    return { status, date };
  }
  // fallback: if contains a date-like substring
  const m2 = s.match(/(\d{4}-\d{2}-\d{2})/);
  return { status: s.toLowerCase(), date: m2?.[1] };
}

function parseWearString(s: string | undefined): Partial<RowData> {
  // Input format: "bogie:72%, brake:70%, HVAC:82%"
  if (!s) return {};
  const out: Partial<RowData> = {};
  const parts = String(s)
    .split(',')
    .map((p) => p.trim());
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

export function normalizeRowsForDataset(rows: RowData[], dataset: DatasetType): RowData[] {
  const alias = getHeaderAliases(dataset);
  return rows.map((orig) => {
    const r: RowData = {};
    // 1) map headers
    Object.keys(orig).forEach((k) => {
      const key = alias[k] || k; // keep unknown columns as-is
      r[key] = orig[k];
    });
    // 2) normalize id keys variants
    const id = r['train_id'] ?? r['trainId'] ?? r['Trainset ID'];
    if (id != null && id !== '') r['train_id'] = String(id);

    // 3) dataset-specific value coercions
    if (dataset === 'branding') {
      // penalty_risk_flag: 0/1 -> boolean
      const b = coerceBoolean(r['penalty_risk_flag']);
      if (b !== undefined) r['penalty_risk_flag'] = b;
      // branding_priority_score: allow numeric or categorical
      const raw = r['branding_priority_score'];
      if (raw !== undefined && raw !== '') {
        const num = coerceNumber(raw);
        if (num !== undefined) r['branding_priority_score'] = num;
        else {
          const s = String(raw).toLowerCase();
          // map low/medium/high -> 3/6/9 as an example scale
          const map: Record<string, number> = { low: 3, medium: 6, high: 9 };
          if (s in map) r['branding_priority_score'] = map[s];
        }
      }
      // deadline as date string (already fine)
    }

    if (dataset === 'cleaning') {
      // cleaning_required: accept 0/1 -> no/standard
      const cr = r['cleaning_required'];
      if (cr !== undefined && cr !== '') {
        const b = coerceBoolean(cr);
        if (b !== undefined) r['cleaning_required'] = b ? 'standard' : 'no';
      }
      // detailing_required: 0/1 -> no/full
      const dr = r['detailing_required'];
      if (dr !== undefined && dr !== '') {
        const b = coerceBoolean(dr);
        if (b !== undefined) r['detailing_required'] = b ? 'full' : 'no';
      }
      // bay_occupancy_status: occupied -> busy
      if (typeof r['bay_occupancy_status'] === 'string') {
        const s = String(r['bay_occupancy_status']).toLowerCase();
        if (s === 'occupied') r['bay_occupancy_status'] = 'busy';
        if (s === 'free') r['bay_occupancy_status'] = 'free';
      }
      // manpower numeric
      const mp = coerceNumber(r['manpower_available']);
      if (mp !== undefined) r['manpower_available'] = mp;
    }

    if (dataset === 'maintenance') {
      const ow = coerceNumber(r['open_work_orders']);
      if (ow !== undefined) r['open_work_orders'] = ow;
      const cw = coerceNumber(r['closed_work_orders_24h']);
      if (cw !== undefined) r['closed_work_orders_24h'] = cw;
      // normalize priority and type to lowercase tokens already expected
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
      // split component wear string into fields
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
      // Extract status + valid_until for each domain
      const rs = extractDateFromStatus(r['rolling_stock_status']);
      if (rs.status) r['rolling_stock_status'] = rs.status;
      if (rs.date) r['rolling_stock_valid_until'] = rs.date;

      const sg = extractDateFromStatus(r['signalling_status']);
      if (sg.status) r['signalling_status'] = sg.status;
      if (sg.date) r['signalling_valid_until'] = sg.date;

      const tc = extractDateFromStatus(r['telecom_status']);
      if (tc.status) r['telecom_status'] = tc.status;
      if (tc.date) r['telecom_valid_until'] = tc.date;

      // Overall clearance: map 'cleared'/'not cleared' to internal tokens
      if (typeof r['overall_fitness_clearance'] === 'string') {
        const s = String(r['overall_fitness_clearance']).toLowerCase();
        if (s.includes('cleared')) r['overall_fitness_clearance'] = 'auto';
        if (s.includes('not')) r['overall_fitness_clearance'] = 'manual_override_no';
      }
    }

    return r;
  });
}

export interface CSVSchema {
  dataset: DatasetType;
  fields: CSVField[];
}

export function getDefaultSchemas(): Record<DatasetType, CSVSchema> {
  return {
    // Fitness Certificates
    certificates: {
      dataset: 'certificates',
      fields: [
        { key: 'train_id', label: 'Train ID', type: 'string', required: true },
        {
          key: 'rolling_stock_status',
          label: 'Rolling-Stock Status',
          type: 'enum',
          enumValues: ['valid', 'expired'],
          required: true,
        },
        { key: 'rolling_stock_valid_until', label: 'Rolling-Stock Valid Until', type: 'date' },
        {
          key: 'signalling_status',
          label: 'Signalling Status',
          type: 'enum',
          enumValues: ['valid', 'expired'],
          required: true,
        },
        { key: 'signalling_valid_until', label: 'Signalling Valid Until', type: 'date' },
        {
          key: 'telecom_status',
          label: 'Telecom Status',
          type: 'enum',
          enumValues: ['valid', 'expired'],
          required: true,
        },
        { key: 'telecom_valid_until', label: 'Telecom Valid Until', type: 'date' },
        {
          key: 'overall_fitness_clearance',
          label: 'Overall Fitness Clearance',
          type: 'enum',
          enumValues: ['auto', 'manual_override_yes', 'manual_override_no'],
        },
      ],
    },
    // Job-Card Status (Work Orders)
    maintenance: {
      dataset: 'maintenance',
      fields: [
        { key: 'train_id', label: 'Train ID', type: 'string', required: true },
        {
          key: 'open_work_orders',
          label: 'Open Work Orders',
          type: 'number',
          required: true,
        },
        { key: 'closed_work_orders_24h', label: 'Closed Work Orders (24h)', type: 'number' },
        {
          key: 'priority_level',
          label: 'Priority Level',
          type: 'enum',
          enumValues: ['low', 'medium', 'high', 'urgent'],
        },
        {
          key: 'maintenance_type',
          label: 'Maintenance Type',
          type: 'enum',
          enumValues: ['standard', 'urgent'],
        },
        { key: 'estimated_completion', label: 'Estimated Completion (ISO date)', type: 'date' },
      ],
    },
    // Branding Priorities
    branding: {
      dataset: 'branding',
      fields: [
        { key: 'train_id', label: 'Train ID', type: 'string', required: true },
        { key: 'advertiser_contract_id', label: 'Advertiser Contract ID', type: 'string' },
        { key: 'exposure_hours_remaining', label: 'Wrap Exposure Hours Remaining', type: 'number' },
        {
          key: 'branding_priority_score',
          label: 'Branding Priority Score',
          type: 'number',
          tooltip: 'High=10, Low=1 or normalized score',
        },
        { key: 'branding_deadline', label: 'Branding Deadline (ISO date)', type: 'date' },
        {
          key: 'penalty_risk_flag',
          label: 'Penalty Risk Flag',
          type: 'boolean',
        },
      ],
    },
    // Mileage Balancing
    mileage: {
      dataset: 'mileage',
      fields: [
        { key: 'train_id', label: 'Train ID', type: 'string', required: true },
        { key: 'total_km_since_maint', label: 'Total KM since last maintenance', type: 'number' },
        { key: 'mileage_diff_from_avg', label: 'Mileage Diff from Fleet Avg (km)', type: 'number' },
        { key: 'wear_bogie', label: 'Wear Estimate - Bogie', type: 'number' },
        { key: 'wear_brake_pad', label: 'Wear Estimate - Brake Pad', type: 'number' },
        { key: 'wear_hvac', label: 'Wear Estimate - HVAC', type: 'number' },
        { key: 'recommended_allocation_km', label: 'Recommended Allocation Next Run (km)', type: 'number' },
      ],
    },
    // Cleaning & Detailing Slots
    cleaning: {
      dataset: 'cleaning',
      fields: [
        { key: 'train_id', label: 'Train ID', type: 'string', required: true },
        { key: 'cleaning_required', label: 'Cleaning Required', type: 'enum', enumValues: ['no', 'light', 'standard', 'deep'] },
        { key: 'detailing_required', label: 'Detailing Required', type: 'enum', enumValues: ['no', 'partial', 'full'] },
        { key: 'available_slot_time', label: 'Available Slot Date/Time (ISO)', type: 'date' },
        { key: 'bay_occupancy_status', label: 'Bay Occupancy Status', type: 'enum', enumValues: ['free', 'busy'] },
        { key: 'manpower_available', label: 'Cleaning Manpower Available', type: 'number' },
      ],
    },
    // Stabling Geometry
    stabling: {
      dataset: 'stabling',
      fields: [
        { key: 'train_id', label: 'Train ID', type: 'string', required: true },
        { key: 'stabling_bay', label: 'Stabling Bay Number', type: 'string' },
        { key: 'accessibility_score', label: 'Accessibility Score', type: 'number' },
        { key: 'shunting_required', label: 'Shunting Required', type: 'boolean' },
        { key: 'shunting_time_min', label: 'Estimated Shunting Time (min)', type: 'number' },
        { key: 'distance_from_bays_m', label: 'Distance from Inspection/Cleaning Bays (m)', type: 'number' },
      ],
    },
  };
}

export type RowData = Record<string, any>;

export interface ParseResult {
  rows: RowData[];
  errors: string[];
}

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
      complete: (results: any) => {
        const rows = (results.data as any[]).map((r: any) => {
          const obj: RowData = {};
          Object.keys(r).forEach((k: string) => {
            obj[k.trim()] = r[k];
          });
          return obj;
        });
        resolve({ rows, errors: (results.errors || []).map((e: any) => e.message) });
      },
    });
  });
}

export function validateRows(rows: RowData[], schema: CSVSchema): {
  rowErrors: Record<number, Record<string, string>>; // rowIndex -> fieldKey -> error
  hasErrors: boolean;
} {
  const rowErrors: Record<number, Record<string, string>> = {};

  rows.forEach((row, idx) => {
    const fieldErrors: Record<string, string> = {};

    for (const f of schema.fields) {
      const value = row[f.key];
      if (f.required && (value === undefined || value === null || value === '')) {
        fieldErrors[f.key] = 'Required';
        continue;
      }
      if (value === undefined || value === null || value === '') continue;
      switch (f.type) {
        case 'number':
          if (isNaN(Number(value))) fieldErrors[f.key] = 'Must be a number';
          break;
        case 'boolean':
          if (!['true', 'false', true, false].includes(value))
            fieldErrors[f.key] = 'Must be true/false';
          break;
        case 'enum':
          if (f.enumValues && !f.enumValues.includes(String(value)))
            fieldErrors[f.key] = `Must be one of: ${f.enumValues.join(', ')}`;
          break;
        default:
          break;
      }
      if (f.validator) {
        const msg = f.validator(value);
        if (msg) fieldErrors[f.key] = msg;
      }
    }

    if (Object.keys(fieldErrors).length > 0) rowErrors[idx] = fieldErrors;
  });

  const hasErrors = Object.keys(rowErrors).length > 0;
  return { rowErrors, hasErrors };
}

export function toCSV(rows: RowData[], schema: CSVSchema): string {
  const headers = schema.fields.map((f) => f.key);
  return Papa.unparse({ fields: headers, data: rows.map((r) => headers.map((h) => r[h] ?? '')) });
}

export function getColumnsWithMeta(schema: CSVSchema) {
  return schema.fields.map((f) => ({ key: f.key, label: f.label, tooltip: f.tooltip }));
}

// Sample data per dataset for quick demo/testing
export function getSampleRows(dataset: DatasetType): RowData[] {
  switch (dataset) {
    case 'certificates':
      return [
        {
          train_id: 'T001',
          rolling_stock_status: 'valid',
          rolling_stock_valid_until: '2025-12-31',
          signalling_status: 'valid',
          signalling_valid_until: '2025-10-15',
          telecom_status: 'valid',
          telecom_valid_until: '2025-11-30',
          overall_fitness_clearance: 'auto',
        },
        {
          train_id: 'T002',
          rolling_stock_status: 'expired',
          signalling_status: 'valid',
          telecom_status: 'valid',
          overall_fitness_clearance: 'manual_override_no',
        },
      ];
    case 'maintenance':
      return [
        {
          train_id: 'T001',
          open_work_orders: 1,
          closed_work_orders_24h: 3,
          priority_level: 'medium',
          maintenance_type: 'standard',
          estimated_completion: '2025-09-28T10:00:00Z',
        },
        {
          train_id: 'T003',
          open_work_orders: 4,
          priority_level: 'urgent',
          maintenance_type: 'urgent',
        },
      ];
    case 'branding':
      return [
        {
          train_id: 'T001',
          advertiser_contract_id: 'AD-22',
          exposure_hours_remaining: 120,
          branding_priority_score: 8,
          branding_deadline: '2025-10-05',
          penalty_risk_flag: false,
        },
        {
          train_id: 'T004',
          advertiser_contract_id: 'AD-31',
          exposure_hours_remaining: 15,
          branding_priority_score: 9,
          penalty_risk_flag: true,
        },
      ];
    case 'mileage':
      return [
        {
          train_id: 'T001',
          total_km_since_maint: 3200,
          mileage_diff_from_avg: 150,
          wear_bogie: 20,
          wear_brake_pad: 35,
          wear_hvac: 15,
          recommended_allocation_km: 120,
        },
        {
          train_id: 'T002',
          total_km_since_maint: 500,
          mileage_diff_from_avg: -700,
          wear_bogie: 5,
          wear_brake_pad: 10,
          wear_hvac: 8,
          recommended_allocation_km: 200,
        },
      ];
    case 'cleaning':
      return [
        {
          train_id: 'T001',
          cleaning_required: 'standard',
          detailing_required: 'partial',
          available_slot_time: '2025-09-26T06:00:00Z',
          bay_occupancy_status: 'free',
          manpower_available: 6,
        },
        {
          train_id: 'T003',
          cleaning_required: 'deep',
          detailing_required: 'full',
          bay_occupancy_status: 'busy',
          manpower_available: 3,
        },
      ];
    case 'stabling':
      return [
        {
          train_id: 'T001',
          stabling_bay: 'B-12',
          accessibility_score: 8.5,
          shunting_required: false,
          shunting_time_min: 0,
          distance_from_bays_m: 80,
        },
        {
          train_id: 'T004',
          stabling_bay: 'A-02',
          accessibility_score: 6.5,
          shunting_required: true,
          shunting_time_min: 12,
          distance_from_bays_m: 180,
        },
      ];
  }
}

export function getTemplateCSV(schema: CSVSchema): string {
  const headers = schema.fields.map((f) => f.key).join(',');
  return headers + '\n';
}

// ----- Master CSV helpers -----
export function getMasterHeaders(schemas: Record<DatasetType, CSVSchema>): string[] {
  const seen = new Set<string>();
  const headers: string[] = [];
  // ensure train_id first
  headers.push('train_id');
  seen.add('train_id');
  (Object.keys(schemas) as DatasetType[]).forEach((ds) => {
    for (const f of schemas[ds].fields) {
      if (!seen.has(f.key)) {
        seen.add(f.key);
        headers.push(f.key);
      }
    }
  });
  return headers;
}

export function mergeFeatureRowsToMaster(
  featureRows: Partial<Record<DatasetType, RowData[]>>,
  schemas: Record<DatasetType, CSVSchema>
): RowData[] {
  const masterMap = new Map<string, RowData>();

  const datasets = Object.keys(schemas) as DatasetType[];
  for (const ds of datasets) {
    const rows = featureRows[ds] || [];
    for (const r of rows) {
      const id = String(r.train_id || r.trainId || r["Trainset ID"] || '');
      if (!id) continue;
      if (!masterMap.has(id)) masterMap.set(id, { train_id: id });
      const target = masterMap.get(id)!;
      // copy all fields from this feature row into master
      Object.keys(r).forEach((k) => {
        if (k === 'train_id' || k === 'trainId' || k === 'Trainset ID') return;
        if (r[k] !== undefined && r[k] !== '') target[k] = r[k];
      });
    }
  }
  return Array.from(masterMap.values());
}

export function splitMasterToFeatures(
  masterRows: RowData[],
  schemas: Record<DatasetType, CSVSchema>
): Record<DatasetType, RowData[]> {
  const out: Record<DatasetType, RowData[]> = {
    certificates: [],
    maintenance: [],
    branding: [],
    mileage: [],
    cleaning: [],
    stabling: [],
  };
  const datasets = Object.keys(schemas) as DatasetType[];
  for (const mr of masterRows) {
    for (const ds of datasets) {
      const keys = schemas[ds].fields.map((f) => f.key);
      const row: RowData = { train_id: mr.train_id };
      let hasAny = false;
      for (const k of keys) {
        if (k === 'train_id') continue;
        if (mr[k] !== undefined && mr[k] !== '') {
          row[k] = mr[k];
          hasAny = true;
        }
      }
      if (hasAny) out[ds].push(row);
    }
  }
  return out;
}
