import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, Check, AlertCircle, Info } from 'lucide-react';
import { Button, Card } from '../../ui/BaseUI';
import { createExpense } from '../../../utils/storage';

export default function CSVImporter({ friends, groupId, onImport }) {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState([]);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    setError('Error parsing CSV. Please check the file format.');
                    return;
                }
                processResults(results.data);
            }
        });
    };

    const processResults = (data) => {
        // Expected columns: date, description, amount, payer_name, category
        const processed = data.map(row => {
            const payer = friends.find(f => f.name.toLowerCase() === row.payer_name?.trim().toLowerCase());
            return {
                ...row,
                amount: parseFloat(row.amount) || 0,
                payerId: payer?.id || '',
                isValid: !!payer && !!row.description && !isNaN(parseFloat(row.amount))
            };
        });
        setPreview(processed);
        setError('');
    };

    const handleConfirm = () => {
        const validExpenses = preview.filter(p => p.isValid).map(p => {
            return createExpense({
                description: p.description,
                amount: p.amount,
                payer: p.payerId,
                splitAmong: friends.map(f => f.id), // Default splitting among everyone
                groupId,
                category: p.category || 'Other',
                date: p.date ? new Date(p.date).toISOString() : new Date().toISOString()
            });
        });

        onImport(validExpenses);
        setPreview([]);
    };

    return (
        <Card className="p-8 border-2 border-dashed border-slate-200 bg-slate-50/30">
            {!preview.length ? (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Upload size={32} className="text-blue-500" />
                    </div>
                    <h4 className="text-xl font-black mb-2">Bulk Import Expenses</h4>
                    <p className="text-sm font-bold text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
                        Upload a CSV with columns: <br />
                        <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-[10px]">date, description, amount, payer_name, category</code>
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()} variant="blue">
                        Choose CSV File
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-black">Pre-import Review</h4>
                        <span className="text-[10px] font-black uppercase text-slate-400">
                            {preview.filter(p => p.isValid).length} / {preview.length} Valid Rows
                        </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                        {preview.map((p, i) => (
                            <div key={i} className={`p-3 rounded-xl flex items-center gap-4 text-xs font-bold border ${p.isValid ? 'bg-white border-slate-100' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                                <FileText size={14} className={p.isValid ? 'text-blue-500' : 'text-rose-500'} />
                                <span className="flex-1 truncate">{p.description}</span>
                                <span className="font-black">₹{p.amount}</span>
                                {!p.isValid && <AlertCircle size={14} title="Payer not found or invalid amount" />}
                            </div>
                        ))}
                    </div>

                    {error && <p className="text-xs font-bold text-rose-500">{error}</p>}

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <Button className="flex-1" variant="blue" onClick={handleConfirm} disabled={!preview.some(p => p.isValid)}>
                            Import {preview.filter(p => p.isValid).length} Expenses
                        </Button>
                        <Button className="flex-1" variant="ghost" onClick={() => setPreview([])}>Cancel</Button>
                    </div>

                    <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-2xl text-[10px] font-bold text-amber-700">
                        <Info size={14} className="flex-shrink-0 mt-0.5" />
                        <span>By default, imported expenses will be split EQUALLY among all current group members.</span>
                    </div>
                </div>
            )}
        </Card>
    );
}
