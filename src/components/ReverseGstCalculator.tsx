import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

/**
 * Standalone calculator that reverse-calculates the taxable value, CGST amount,
 * and SGST amount from a total bill amount that is inclusive of GST.
 *
 * Formula:
 *   Taxable Value = Total Bill / (1 + (CGST% + SGST%) / 100)
 *   CGST Amount   = Taxable Value × CGST% / 100
 *   SGST Amount   = Taxable Value × SGST% / 100
 */
export function ReverseGstCalculator() {
    const [totalBill, setTotalBill] = useState<string>("");
    const [cgstPercent, setCgstPercent] = useState<string>("9");
    const [sgstPercent, setSgstPercent] = useState<string>("9");

    const results = useMemo(() => {
        const total = parseFloat(totalBill);
        const cgst = parseFloat(cgstPercent);
        const sgst = parseFloat(sgstPercent);

        if (isNaN(total) || isNaN(cgst) || isNaN(sgst) || total <= 0) {
            return null;
        }

        const totalTaxRate = cgst + sgst;
        const taxableValue = total / (1 + totalTaxRate / 100);
        const cgstAmount = taxableValue * (cgst / 100);
        const sgstAmount = taxableValue * (sgst / 100);

        return { taxableValue, cgstAmount, sgstAmount };
    }, [totalBill, cgstPercent, sgstPercent]);

    const formatCurrency = (value: number): string => {
        return value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <Card className="mx-auto mb-6 max-w-md rounded-xl border-dashed border-amber-300 bg-amber-50/40 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-amber-800">🧮 Reverse GST Calculator</CardTitle>
                <p className="text-sm text-amber-600">
                    Enter the total bill (inclusive of GST) to find the taxable value
                </p>
            </CardHeader>
            <CardContent>
                {/* Inputs */}
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="reverseGstTotal">Total Bill (incl. GST)</Label>
                        <Input
                            id="reverseGstTotal"
                            type="number"
                            min="0"
                            step="any"
                            value={totalBill}
                            onChange={(e) => setTotalBill(e.target.value)}
                            placeholder="e.g. 11800"
                            className="font-mono"
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Label htmlFor="reverseGstCgst">CGST %</Label>
                            <Input
                                id="reverseGstCgst"
                                type="number"
                                min="0"
                                step="any"
                                value={cgstPercent}
                                onChange={(e) => setCgstPercent(e.target.value)}
                                placeholder="9"
                                className="font-mono"
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="reverseGstSgst">SGST %</Label>
                            <Input
                                id="reverseGstSgst"
                                type="number"
                                min="0"
                                step="any"
                                value={sgstPercent}
                                onChange={(e) => setSgstPercent(e.target.value)}
                                placeholder="9"
                                className="font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Results */}
                {results && (
                    <div className="mt-4 space-y-0 overflow-hidden rounded-lg border border-amber-200">
                        <div className="flex justify-between bg-gradient-to-r from-amber-100/80 to-amber-50/60 px-4 py-2.5">
                            <span className="text-sm font-medium text-amber-900">Taxable Value</span>
                            <span className="font-mono font-semibold text-amber-900">
                                ₹ {formatCurrency(results.taxableValue)}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-amber-100 bg-white/70 px-4 py-2">
                            <span className="text-sm text-slate-600">CGST ({cgstPercent}%)</span>
                            <span className="font-mono text-sm font-medium text-slate-700">
                                ₹ {formatCurrency(results.cgstAmount)}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-amber-100 bg-white/70 px-4 py-2">
                            <span className="text-sm text-slate-600">SGST ({sgstPercent}%)</span>
                            <span className="font-mono text-sm font-medium text-slate-700">
                                ₹ {formatCurrency(results.sgstAmount)}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
