import type { BillTotals } from "../types/bill";
import { Card, CardContent } from "./ui/card";
import { SectionLabel } from "./SectionLabel";

interface BillSummaryProps {
    totals: BillTotals;
}

/**
 * Summary card showing all bill totals — compact width, centered
 */
export function BillSummary({ totals }: BillSummaryProps) {
    const formatNumber = (value: number): string => {
        return value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <Card className="relative mx-auto mb-10 max-w-md pt-4 transition-shadow duration-200 hover:shadow-md">
            <SectionLabel title="Summary & Export" />
            <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                    <div className="flex items-center justify-between bg-slate-50/50 px-5 py-3">
                        <span className="text-sm text-slate-600">Total Taxable Value</span>
                        <span className="font-medium text-slate-800">₹ {formatNumber(totals.totalTaxableValue)}</span>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3">
                        <span className="text-sm text-slate-600">Total CGST</span>
                        <span className="font-medium text-slate-800">₹ {formatNumber(totals.totalCgst)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50/50 px-5 py-3">
                        <span className="text-sm text-slate-600">Total SGST</span>
                        <span className="font-medium text-slate-800">₹ {formatNumber(totals.totalSgst)}</span>
                    </div>
                    {/* Grand Total — hero row */}
                    <div className="bg-linear-to-r from-slate-800 to-slate-700 px-5 py-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-white/80">Grand Total</span>
                            <span className="text-xl font-bold text-white">₹ {formatNumber(totals.grandTotal)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
