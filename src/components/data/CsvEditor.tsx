import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../utils';
import toast from 'react-hot-toast';
import {
  CSVSchema,
  DatasetType,
  RowData,
  parseCSV,
  validateRows,
  normalizeRowsForDataset,
} from '../../utils/csv';
import { api } from '../../services/api';
import { Download, FilePlus2, Trash2, UploadCloud, AlertTriangle } from 'lucide-react';

interface CsvEditorProps {
  dataset: DatasetType;
  schema: CSVSchema;
  presetRows?: RowData[]; // optional externally provided rows (e.g., sample data)
  onRowsChange?: (rows: RowData[]) => void; // notify parent on changes
}

export function CsvEditor({ dataset, schema, presetRows, onRowsChange }: CsvEditorProps) {
  const [rows, setRows] = useState<RowData[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<number, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [highRiskIds, setHighRiskIds] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<{ key: string; label: string; tooltip?: string }[]>(
    schema.fields.map((f) => ({ key: f.key, label: f.label, tooltip: f.tooltip }))
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update columns if schema prop changes (e.g., switching tabs)
  useMemo(() => {
    setColumns(schema.fields.map((f) => ({ key: f.key, label: f.label, tooltip: f.tooltip })));
  }, [schema]);

  // If parent supplies presetRows, load them and rebuild columns
  useEffect(() => {
    if (presetRows && presetRows.length >= 0) {
      setRows(presetRows);
      const headers = presetRows.length > 0 ? Object.keys(presetRows[0]) : schema.fields.map((f) => f.key);
      const schemaMap = new Map(schema.fields.map((f) => [f.key, f] as const));
      const cols = headers.map((h) => {
        const f = schemaMap.get(h);
        return { key: h, label: f?.label ?? h, tooltip: f?.tooltip };
      });
      setColumns(cols);
      validate(presetRows);
      setHighRiskIds(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetRows, dataset]);

  // Notify parent when rows change
  useEffect(() => {
    if (onRowsChange) onRowsChange(rows);
  }, [rows, onRowsChange]);

  const validate = (data: RowData[]) => {
    const v = validateRows(data, schema);
    setRowErrors(v.rowErrors);
    return v;
  };

  const onUpload = async (file: File) => {
    const id = toast.loading('Parsing CSV...');
    try {
      const { rows: parsed, errors } = await parseCSV(file);
      // Normalize rows to internal keys/values for this dataset
      const normalized = normalizeRowsForDataset(parsed, dataset);
      if (errors.length) {
        errors.forEach((e) => toast.error(e));
      }
      setRows(normalized);
      // Build columns from uploaded CSV headers to show ALL columns
      const headers = normalized.length > 0 ? Object.keys(normalized[0]) : [];
      if (headers.length > 0) {
        const schemaMap = new Map(schema.fields.map((f) => [f.key, f] as const));
        const cols = headers.map((h) => {
          const f = schemaMap.get(h);
          return { key: h, label: f?.label ?? h, tooltip: f?.tooltip };
        });
        setColumns(cols);
      }
      validate(normalized);
      setHighRiskIds(new Set());
      toast.success(`Loaded ${normalized.length} rows`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to parse CSV');
    } finally {
      toast.dismiss(id);
    }
  };

  const onCellChange = (rIdx: number, key: string, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[rIdx] = { ...next[rIdx], [key]: value };
      return next;
    });
    // re-validate this row
    const { rowErrors: all } = validateRows([rows[rIdx] ?? {}, { ...rows[rIdx], [key]: value }], schema);
    setRowErrors((prev) => ({ ...prev, [rIdx]: all[1] ?? {} }));
  };

  const addRow = () => {
    setRows((prev) => {
      const empty: RowData = {};
      columns.forEach((c) => (empty[c.key] = ''));
      return [...prev, empty];
    });
  };

  const deleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
    setRowErrors((prev) => {
      const clone = { ...prev };
      delete clone[index];
      return clone;
    });
  };

  const onDownload = () => {
    // Export using the current columns as headers so we keep all uploaded fields
    const headers = columns.map((c) => c.key);
    const csv = [headers.join(',')]
      .concat(
        rows.map((r) =>
          headers
            .map((h) => {
              const v = r[h] ?? '';
              // Escape quotes and wrap if needed
              const s = String(v).replace(/"/g, '""');
              return /[",\n]/.test(s) ? `"${s}"` : s;
            })
            .join(',')
        )
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'synthetic_trainset_data.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const onSubmit = async () => {
    const { hasErrors } = validate(rows);
    if (hasErrors) {
      toast.error('Fix validation errors before submitting');
      return;
    }
    setLoading(true);
    try {
      const res = await api.mlIngest({ dataset, rows });
      toast.success(res?.message || `Submitted ${rows.length} rows`);
      if ((res as any)?.high_risk_ids?.length) {
        setHighRiskIds(new Set((res as any).high_risk_ids));
        toast(() => (
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-warning-500 mt-0.5" />
            <div>
              <p className="font-semibold">High-risk rows flagged</p>
              <p className="text-sm opacity-80">Highlighted in the table for review.</p>
            </div>
          </div>
        ));
      }
    } catch (e: any) {
      toast.error(e?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const triggerFilePick = () => fileInputRef.current?.click();

  const hasData = rows.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
          }}
        />
        <Button variant="outline" onClick={triggerFilePick}>
          <UploadCloud className="mr-2 h-4 w-4" /> Upload CSV
        </Button>
        <Button variant="secondary" onClick={addRow}>
          <FilePlus2 className="mr-2 h-4 w-4" /> Add Row
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={onDownload} disabled={!hasData}>
            <Download className="mr-2 h-4 w-4" /> Download CSV
          </Button>
          <Button variant="primary" onClick={onSubmit} loading={loading} disabled={!hasData}>
            Submit to ML
          </Button>
        </div>
      </div>

      <div className="overflow-auto rounded-md border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 p-2 text-left text-gray-600">#</th>
              {columns.map((col) => (
                <th key={col.key} className="p-2 text-left text-gray-600" title={col.tooltip || ''}>
                  {col.label}
                </th>
              ))}
              <th className="p-2 text-right text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="p-6 text-center text-gray-500">
                  No data. Upload a CSV or add rows.
                </td>
              </tr>
            )}
            {rows.map((row, rIdx) => {
              const isHighRisk = highRiskIds.size > 0 && highRiskIds.has(String(row['train_id']));
              return (
                <tr key={rIdx} className={cn(isHighRisk && 'bg-warning-50')}> 
                  <td className="sticky left-0 z-10 bg-white p-2 text-gray-500">{rIdx + 1}</td>
                  {columns.map((col) => {
                    const error = rowErrors[rIdx]?.[col.key];
                    return (
                      <td key={col.key} className="p-1">
                        <Input
                          value={row[col.key] ?? ''}
                          onChange={(e) => onCellChange(rIdx, col.key, e.target.value)}
                          className={cn(
                            'h-9 w-full',
                            error && 'border-danger-500 focus-visible:ring-danger-500'
                          )}
                          placeholder={col.label}
                          title={col.tooltip || ''}
                        />
                        {error && (
                          <div className="mt-1 text-xs text-danger-600">{error}</div>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-2 text-right">
                    <Button variant="danger" size="sm" onClick={() => deleteRow(rIdx)}>
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
