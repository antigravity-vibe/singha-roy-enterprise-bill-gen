import type { BillTotals } from "../types/bill";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface BillSummaryProps {
    totals: BillTotals;
}

/**
 * Summary card showing all bill totals
 */
export function BillSummary({ totals }: BillSummaryProps) {
    const formatNumber = (value: number): string => {
        return value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Bill Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between border-b py-2">
                        <span className="text-slate-600">Total Taxable Value:</span>
                        <span className="font-medium">₹ {formatNumber(totals.totalTaxableValue)}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span className="text-slate-600">Total CGST:</span>
                        <span className="font-medium">₹ {formatNumber(totals.totalCgst)}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span className="text-slate-600">Total SGST:</span>
                        <span className="font-medium">₹ {formatNumber(totals.totalSgst)}</span>
                    </div>
                    <div className="-mx-3 flex justify-between rounded bg-slate-50 px-3 py-3">
                        <span className="text-lg font-semibold text-slate-800">Grand Total:</span>
                        <span className="text-lg font-bold text-slate-900">₹ {formatNumber(totals.grandTotal)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
