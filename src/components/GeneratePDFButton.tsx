import { useState } from "react";
import type { BillData } from "../types/bill";
import { generatePDF, validateBillData } from "../lib/pdfGenerator";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface GeneratePDFButtonProps {
    billData: BillData;
}

/**
 * Button that validates bill data and generates PDF invoice
 */
export function GeneratePDFButton({ billData }: GeneratePDFButtonProps) {
    const [errors, setErrors] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePDF = () => {
        // Validate the bill data
        const validationErrors = validateBillData(billData);

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
        setIsGenerating(true);

        try {
            generatePDF(billData);
        } catch (error) {
            console.error("Error generating PDF:", error);
            setErrors(["An error occurred while generating the PDF. Please try again."]);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-4">
            {errors.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                        <p className="font-medium text-red-800 mb-2">Please fix the following errors:</p>
                        <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                size="lg"
                className="w-full py-6 text-lg font-semibold"
            >
                {isGenerating ? "Generating PDF..." : "Generate Invoice PDF"}
            </Button>
        </div>
    );
}
