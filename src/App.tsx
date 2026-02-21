import { useState, useMemo } from "react";
import type { BillItem, CustomerDetails, BusinessDetails, BillData } from "./types/bill";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useBillCalculations } from "./hooks/useBillCalculations";
import { DEFAULT_BUSINESS_DETAILS, STORAGE_KEY_BUSINESS_DETAILS } from "./constants/defaults";
import { BusinessDetailsForm } from "./components/BusinessDetailsForm";
import { CustomerDetailsForm, emptyCustomerDetails } from "./components/CustomerDetailsForm";
import { InvoiceHeader, getTodayDateString } from "./components/InvoiceHeader";
import { BillTable, createEmptyItem } from "./components/BillTable";
import { ReverseGstCalculator } from "./components/ReverseGstCalculator";
import { BillSummary } from "./components/BillSummary";
import { GeneratePDFButton } from "./components/GeneratePDFButton";
import type { FieldErrors } from "./lib/pdfGenerator";
import "./App.css";

import SinghaRoyEnterpriseLogo from "./assets/singhaRoyEnterpriseLogo.svg?react";

function App() {
    // Business details (persisted to localStorage)
    const [businessDetails] = useLocalStorage<BusinessDetails>(STORAGE_KEY_BUSINESS_DETAILS, DEFAULT_BUSINESS_DETAILS);

    // Invoice metadata
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [dateString, setDateString] = useState(getTodayDateString());

    // Customer details
    const [customerDetails, setCustomerDetails] = useState<CustomerDetails>(emptyCustomerDetails);

    // Bill items
    const [items, setItems] = useState<BillItem[]>([createEmptyItem()]);

    // Validation errors
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    // Calculate all derived values
    const { calculatedItems, totals } = useBillCalculations(items);

    // Assemble bill data for PDF generation
    const billData: BillData = useMemo(
        () => ({
            invoiceNumber,
            date: new Date(dateString),
            businessDetails,
            customerDetails,
            items: calculatedItems,
            totals,
        }),
        [invoiceNumber, dateString, businessDetails, customerDetails, calculatedItems, totals],
    );

    const handleInvoiceNumberChange = (value: string) => {
        setInvoiceNumber(value);
        if (fieldErrors.invoiceNumber) {
            setFieldErrors((prev) => {
                const { invoiceNumber: _removed, ...rest } = prev;
                void _removed;
                return rest;
            });
        }
    };

    const handleCustomerDetailsChange = (details: CustomerDetails) => {
        setCustomerDetails(details);
        // Clear relevant customer errors
        setFieldErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.customerName;
            delete newErrors.customerAddress1;
            delete newErrors.customerCity;
            delete newErrors.customerState;
            return newErrors;
        });
    };

    const handleItemsChange = (newItems: BillItem[]) => {
        setItems(newItems);
        if (fieldErrors.billItems) {
            setFieldErrors((prev) => {
                const { billItems: _removed, ...rest } = prev;
                void _removed;
                return rest;
            });
        }
    };

    return (
        <div className="min-h-screen scroll-smooth bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="container mx-auto max-w-6xl px-4 py-10">
                {/* Page Header */}
                <header className="mb-10 text-center">
                    <SinghaRoyEnterpriseLogo className="mx-auto mb-4 h-20 w-20 drop-shadow-md" />
                    <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900">Bill Generator</h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-emerald-50 to-teal-50 px-4 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200/60">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        GST-Compliant Invoices
                    </span>
                </header>
                <hr className="mb-8 border-slate-200/60" />

                {/* ① Business Details */}
                <BusinessDetailsForm />

                {/* ② Invoice Details */}
                <InvoiceHeader
                    invoiceNumber={invoiceNumber}
                    date={dateString}
                    onInvoiceNumberChange={handleInvoiceNumberChange}
                    onDateChange={setDateString}
                    errors={fieldErrors}
                />

                {/* ③ Customer Details */}
                <CustomerDetailsForm
                    customerDetails={customerDetails}
                    onChange={handleCustomerDetailsChange}
                    errors={fieldErrors}
                />

                {/* Reverse GST Calculator (helper tool) */}
                <ReverseGstCalculator />

                {/* ④ Bill Items */}
                <BillTable
                    items={items}
                    calculatedItems={calculatedItems}
                    grandTotal={totals.grandTotal}
                    onItemsChange={handleItemsChange}
                    hasError={!!fieldErrors.billItems}
                />

                {/* ⑤ Summary & Export */}
                <BillSummary totals={totals} />

                {/* Generate PDF Button */}
                <GeneratePDFButton billData={billData} onValidationErrors={setFieldErrors} />
            </div>
        </div>
    );
}

export default App;
