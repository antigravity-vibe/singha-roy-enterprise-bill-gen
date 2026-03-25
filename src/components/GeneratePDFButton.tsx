import { useState } from "react";
import type { BillData } from "../types/bill";
import { generatePDF, validateBillData, hasErrors, type FieldErrors, type DocumentType } from "../lib/pdfGenerator";
import { Button } from "./ui/button";

interface GeneratePDFButtonProps {
    billData: BillData;
    onValidationErrors: (errors: FieldErrors) => void;
}

const DownloadIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

/**
 * Buttons that validate bill data and generate PDF invoice or return note
 */
export function GeneratePDFButton({ billData, onValidationErrors }: GeneratePDFButtonProps) {
    const [generatingType, setGeneratingType] = useState<DocumentType | null>(null);

    const handleGenerate = (documentType: DocumentType) => {
        const validationErrors = validateBillData(billData);

        if (hasErrors(validationErrors)) {
            onValidationErrors(validationErrors);
            return;
        }

        onValidationErrors({});
        setGeneratingType(documentType);

        try {
            generatePDF(billData, documentType);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setGeneratingType(null);
        }
    };

    const isGenerating = generatingType !== null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
                onClick={() => handleGenerate("invoice")}
                disabled={isGenerating}
                size="lg"
                className="cursor-pointer gap-2 rounded-xl bg-linear-to-r from-slate-800 to-slate-900 py-7 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.01] hover:from-slate-700 hover:to-slate-800 hover:shadow-xl active:scale-[0.99] dark:from-slate-200 dark:to-slate-300 dark:text-slate-900 dark:hover:from-white dark:hover:to-slate-200"
            >
                {generatingType === "invoice" ? (
                    <>
                        <SpinnerIcon />
                        Generating…
                    </>
                ) : (
                    <>
                        <DownloadIcon />
                        Invoice
                    </>
                )}
            </Button>
            <Button
                onClick={() => handleGenerate("credit-note")}
                disabled={isGenerating}
                size="lg"
                className="cursor-pointer gap-2 rounded-xl bg-linear-to-r from-slate-500 to-slate-600 py-7 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.01] hover:from-slate-400 hover:to-slate-500 hover:shadow-xl active:scale-[0.99] dark:from-slate-700 dark:to-slate-800 dark:text-slate-100 dark:hover:from-slate-600 dark:hover:to-slate-700"
            >
                {generatingType === "credit-note" ? (
                    <>
                        <SpinnerIcon />
                        Generating…
                    </>
                ) : (
                    <>
                        <DownloadIcon />
                        Credit Note
                    </>
                )}
            </Button>
        </div>
    );
}
