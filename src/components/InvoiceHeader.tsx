import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "../lib/cn";
import type { FieldErrors } from "../lib/pdfGenerator";
import { SectionLabel } from "./SectionLabel";

interface InvoiceHeaderProps {
    invoiceNumber: string;
    date: string; // ISO date string YYYY-MM-DD
    onInvoiceNumberChange: (value: string) => void;
    onDateChange: (value: string) => void;
    errors?: FieldErrors;
}

/**
 * Header section for invoice number and date.
 * Invoice number is user-entered, date defaults to today but is editable via calendar picker.
 */
export function InvoiceHeader({
    invoiceNumber,
    date,
    onInvoiceNumberChange,
    onDateChange,
    errors = {},
}: InvoiceHeaderProps) {
    // Parse the date string to a Date object for the calendar
    const selectedDate = date ? new Date(date + "T00:00:00") : undefined;

    const handleDateSelect = (newDate: Date | undefined) => {
        if (newDate) {
            // Format to YYYY-MM-DD
            const year = newDate.getFullYear();
            const month = String(newDate.getMonth() + 1).padStart(2, "0");
            const day = String(newDate.getDate()).padStart(2, "0");
            onDateChange(`${year}-${month}-${day}`);
        }
    };

    const hasInvoiceError = !!errors.invoiceNumber;

    return (
        <Card className="relative mb-10 transition-shadow duration-200 hover:shadow-md">
            <SectionLabel title="Invoice Details" />
            <CardContent className="pt-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="min-w-50 flex-1">
                        <Label htmlFor="invoiceNumber" className={hasInvoiceError ? "text-red-600" : ""}>
                            Invoice Number <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-slate-400">
                                #
                            </span>
                            <Input
                                id="invoiceNumber"
                                value={invoiceNumber}
                                onChange={(e) => onInvoiceNumberChange(e.target.value)}
                                placeholder="Enter invoice number"
                                className={cn(
                                    "pl-7 font-mono",
                                    hasInvoiceError && "border-red-500 focus-visible:ring-red-500",
                                )}
                            />
                        </div>
                        {hasInvoiceError && <p className="mt-1 text-sm text-red-600">{errors.invoiceNumber}</p>}
                    </div>
                    <div className="min-w-50 flex-1">
                        <Label htmlFor="invoiceDate">
                            Date <span className="text-red-500">*</span>
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="invoiceDate"
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground",
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    className="rounded-lg border"
                                    captionLayout="dropdown"
                                />
                            </PopoverContent>
                        </Popover>
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
