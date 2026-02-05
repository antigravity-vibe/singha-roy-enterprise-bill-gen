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
        <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            size="lg"
            className="w-full py-6 text-lg font-semibold"
        >
            {isGenerating ? "Generating PDF..." : "Generate Invoice PDF"}
        </Button>
    );
}
