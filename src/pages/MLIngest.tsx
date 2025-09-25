import { useMemo, useState } from 'react';
import { CsvEditor } from '../components/data/CsvEditor';
import {
  DatasetType,
  CSVSchema,
  getDefaultSchemas,
  getSampleRows,
  getTemplateCSV,
  RowData,
  mergeFeatureRowsToMaster,
  getMasterHeaders,
} from '../utils/csv';
import { Card } from '../components/ui/Card';
import { Info } from 'lucide-react';
import { cn } from '../utils';

export function MLIngest() {
  const schemas = useMemo(() => getDefaultSchemas(), []);
  const [dataset, setDataset] = useState<DatasetType>('certificates');
  const [presetRows, setPresetRows] = useState<RowData[] | undefined>(undefined);
  const [featureRows, setFeatureRows] = useState<Partial<Record<DatasetType, RowData[]>>>({});
  const [masterRows, setMasterRows] = useState<RowData[]>([]);
  // no importing now; backend will aggregate master automatically

  // Normalize default dataset to an available one after schema update
  const normalizedDataset: DatasetType = (['certificates','maintenance','branding','mileage','cleaning','stabling'] as DatasetType[]).includes(dataset)
    ? dataset
    : 'certificates';

  const schema: CSVSchema = schemas[normalizedDataset];

  const tabs: { key: DatasetType; label: string; desc: string }[] = [
    { key: 'certificates', label: 'Fitness Certificates', desc: 'Rolling-Stock, Signalling, Telecom fitness' },
    { key: 'maintenance', label: 'Job-Card Status', desc: 'Open/closed work orders, priority, type' },
    { key: 'branding', label: 'Branding Priorities', desc: 'Contracts, exposure hours, priority, penalty risk' },
    { key: 'mileage', label: 'Mileage Balancing', desc: 'KM since maintenance, diff from avg, wear, recommendation' },
    { key: 'cleaning', label: 'Cleaning & Detailing', desc: 'Cleaning/detailing needs, slot availability, manpower' },
    { key: 'stabling', label: 'Stabling Geometry', desc: 'Bay, accessibility, shunting, distances' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Master CSV Controls */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-medium">Master CSV</div>
          <div className="text-sm text-gray-600">Backend aggregates each feature upload by train_id</div>
          <div className="ml-auto flex items-center gap-2">
            {/* Export Master CSV */}
            <button
              className="rounded-md px-3 py-2 text-sm border bg-white hover:bg-gray-50"
              onClick={async () => {
                const downloadCsv = (csv: string) => {
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'synthetic_trainset_data.csv';
                  link.click();
                  URL.revokeObjectURL(url);
                };
                const buildClientMaster = (): string => {
                  const headers = getMasterHeaders(schemas);
                  const csv = [headers.join(',')]
                    .concat(
                      masterRows.map((r) =>
                        headers
                          .map((h) => {
                            const v = r[h] ?? '';
                            const s = String(v).replace(/"/g, '""');
                            return /[",\n]/.test(s) ? `"${s}"` : s;
                          })
                          .join(',')
                      )
                    )
                    .join('\n');
                  return csv;
                };
                try {
                  // Prefer backend-generated master CSV
                  const text = await (await import('../services/api')).api.mlGetMasterCSV();
                  // If backend returned only headers/no data rows, fallback to client-side
                  const nonEmptyLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
                  if (nonEmptyLines.length <= 1) {
                    const clientCsv = buildClientMaster();
                    downloadCsv(clientCsv);
                  } else {
                    downloadCsv(text);
                  }
                } catch {
                  // Fallback: client-side merge and export
                  const clientCsv = buildClientMaster();
                  downloadCsv(clientCsv);
                }
              }}
            >
              Export Master CSV
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Current master rows (client-side): <span className="font-medium text-gray-900">{masterRows.length}</span>
        </div>
      </Card>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">ML Data Ingest</h1>
          <p className="text-gray-600">Upload, validate, edit, and submit CSVs to power predictions.</p>
        </div>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setDataset(t.key); setPresetRows(undefined); }}
              className={cn(
                'rounded-md px-3 py-2 text-sm border transition-colors',
                normalizedDataset === t.key
                  ? 'bg-primary-600 text-white border-primary-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              )}
              title={t.desc}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-primary-600 mt-0.5" />
          <div>
            <p className="font-medium">Expected columns for {normalizedDataset}</p>
            <ul className="mt-1 grid gap-1 sm:grid-cols-2 md:grid-cols-3">
              {schema.fields.map((f) => (
                <li key={f.key} className="text-sm text-gray-700">
                  <span className="font-mono text-gray-900">{f.key}</span>
                  {f.required && <span className="ml-1 text-danger-600">*</span>} — {f.label}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-md px-3 py-2 text-sm border bg-white hover:bg-gray-50"
                onClick={() => setPresetRows(getSampleRows(normalizedDataset))}
              >
                Load Sample Data
              </button>
              <button
                className="rounded-md px-3 py-2 text-sm border bg-white hover:bg-gray-50"
                onClick={() => {
                  const csv = getTemplateCSV(schema);
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${normalizedDataset}-template.csv`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download Template CSV
              </button>
            </div>
          </div>
        </div>

        <CsvEditor
          dataset={normalizedDataset}
          schema={schema}
          presetRows={presetRows ?? featureRows[normalizedDataset]}
          onRowsChange={async (rows) => {
            setFeatureRows((prev) => ({ ...prev, [normalizedDataset]: rows }));
            // Recompute master on every change
            const merged = mergeFeatureRowsToMaster(
              { ...featureRows, [normalizedDataset]: rows },
              schemas
            );
            setMasterRows(merged);
            // Save feature rows on backend for server-side master aggregation
            try {
              const { api } = await import('../services/api');
              await api.mlSaveFeature({ dataset: normalizedDataset, rows });
            } catch (e) {
              // Backend optional; ignore errors silently here
            }
          }}
        />
      </Card>
    </div>
  );
}
