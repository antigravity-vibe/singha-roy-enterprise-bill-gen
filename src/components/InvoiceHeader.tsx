import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface InvoiceHeaderProps {
    invoiceNumber: string;
    date: string; // ISO date string YYYY-MM-DD
    onInvoiceNumberChange: (value: string) => void;
    onDateChange: (value: string) => void;
}

/**
 * Header section for invoice number and date.
 * Invoice number is user-entered, date defaults to today but is editable.
 */
export function InvoiceHeader({ invoiceNumber, date, onInvoiceNumberChange, onDateChange }: InvoiceHeaderProps) {
    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <Label htmlFor="invoiceNumber">
                            Invoice Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="invoiceNumber"
                            value={invoiceNumber}
                            onChange={(e) => onInvoiceNumberChange(e.target.value)}
                            placeholder="Enter invoice number"
                            className="font-mono"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <Label htmlFor="invoiceDate">
                            Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="invoiceDate"
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Get today's date in YYYY-MM-DD format for the date input
 */
export function getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split("T")[0];
}
