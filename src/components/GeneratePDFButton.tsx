import { useState } from "react";
import type { BillData } from "../types/bill";
import { generatePDF, validateBillData, hasErrors, type FieldErrors } from "../lib/pdfGenerator";
import { Button } from "./ui/button";

interface GeneratePDFButtonProps {
    billData: BillData;
    onValidationErrors: (errors: FieldErrors) => void;
}

/**
 * Button that validates bill data and generates PDF invoice
 */
export function GeneratePDFButton({ billData, onValidationErrors }: GeneratePDFButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePDF = () => {
        // Validate the bill data
        const validationErrors = validateBillData(billData);

        if (hasErrors(validationErrors)) {
            onValidationErrors(validationErrors);
            return;
        }

        onValidationErrors({});
        setIsGenerating(true);

        try {
            generatePDF(billData);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="text-center">
            <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                size="lg"
                className="cursor-pointer gap-2 rounded-xl bg-linear-to-r from-slate-800 to-slate-900 py-7 text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-[1.01] hover:from-slate-700 hover:to-slate-800 hover:shadow-xl active:scale-[0.99]"
            >
                {isGenerating ? (
                    <>
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        Generating PDF…
                    </>
                ) : (
                    <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                        </svg>
                        Generate Invoice PDF
                    </>
                )}
            </Button>
        </div>
    );
}
