import { useState, useMemo } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const formatCurrency = (value: number): string => {
    return value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

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
    const [isOpen, setIsOpen] = useState(false);
    const [totalBill, setTotalBill] = useState<string>("");
    const [cgstPercent, setCgstPercent] = useState<string>("9");
    const [sgstPercent, setSgstPercent] = useState<string>("9");
    const [copied, setCopied] = useState(false);

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

    const copyTaxableValue = () => {
        if (results) {
            navigator.clipboard.writeText(results.taxableValue.toFixed(2));
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <div className="mx-auto mb-6 max-w-md">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-amber-300/80 bg-amber-50/50 px-4 py-2.5 text-sm font-medium text-amber-700 transition-all duration-200 hover:border-amber-400 hover:bg-amber-50 hover:shadow-sm"
            >
                <span className="text-base">🧮</span>
                <span>Reverse GST Calculator</span>
                <svg
                    className={`h-4 w-4 text-amber-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {/* Expandable Content */}
            <div
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
                <div className="overflow-hidden">
                    <Card className="rounded-xl border-amber-200/60 bg-white shadow-md shadow-amber-100/50">
                        <CardContent className="pt-5">
                            {/* Total Bill Input with ₹ prefix */}
                            <div className="mb-4">
                                <Label
                                    htmlFor="reverseGstTotal"
                                    className="mb-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase"
                                >
                                    Total Bill (incl. GST)
                                </Label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-slate-400">
                                        ₹
                                    </span>
                                    <Input
                                        id="reverseGstTotal"
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={totalBill}
                                        onChange={(e) => setTotalBill(e.target.value)}
                                        placeholder="e.g. 11800"
                                        className="h-11 rounded-lg border-slate-200 pl-7 font-mono text-lg focus-visible:border-amber-400 focus-visible:ring-amber-400/30"
                                    />
                                </div>
                            </div>

                            {/* CGST & SGST side by side */}
                            <div className="mb-1 flex gap-3">
                                <div className="flex-1">
                                    <Label
                                        htmlFor="reverseGstCgst"
                                        className="mb-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase"
                                    >
                                        CGST %
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="reverseGstCgst"
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={cgstPercent}
                                            onChange={(e) => setCgstPercent(e.target.value)}
                                            placeholder="9"
                                            className="rounded-lg border-slate-200 pr-7 font-mono focus-visible:border-amber-400 focus-visible:ring-amber-400/30"
                                        />
                                        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400">
                                            %
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <Label
                                        htmlFor="reverseGstSgst"
                                        className="mb-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase"
                                    >
                                        SGST %
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="reverseGstSgst"
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={sgstPercent}
                                            onChange={(e) => setSgstPercent(e.target.value)}
                                            placeholder="9"
                                            className="rounded-lg border-slate-200 pr-7 font-mono focus-visible:border-amber-400 focus-visible:ring-amber-400/30"
                                        />
                                        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400">
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Results */}
                            {results && (
                                <div className="mt-4 overflow-hidden rounded-lg border border-amber-200/80">
                                    {/* Taxable Value — hero row */}
                                    <div className="bg-linear-to-r from-amber-500 to-amber-400 px-4 py-3">
                                        <div className="text-[11px] font-medium tracking-wider text-amber-100 uppercase">
                                            Taxable Value
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xl font-bold text-white">
                                                ₹ {formatCurrency(results.taxableValue)}
                                            </span>
                                            <button
                                                onClick={copyTaxableValue}
                                                className="rounded-md bg-white/20 p-1.5 text-white/90 transition-all hover:bg-white/30 active:scale-95"
                                                title="Copy taxable value"
                                            >
                                                {copied ? (
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2.5}
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m4.5 12.75 6 6 9-13.5"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    {/* Tax breakdown */}
                                    <div className="divide-y divide-amber-100 bg-amber-50/30">
                                        <div className="flex items-center justify-between px-4 py-2.5">
                                            <span className="text-xs font-medium text-slate-500">
                                                CGST @ {cgstPercent}%
                                            </span>
                                            <span className="font-mono text-sm font-semibold text-slate-700">
                                                ₹ {formatCurrency(results.cgstAmount)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-2.5">
                                            <span className="text-xs font-medium text-slate-500">
                                                SGST @ {sgstPercent}%
                                            </span>
                                            <span className="font-mono text-sm font-semibold text-slate-700">
                                                ₹ {formatCurrency(results.sgstAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
