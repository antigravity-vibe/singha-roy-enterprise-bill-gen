import { useState, useMemo } from "react";
import type { BillItem, CustomerDetails, BusinessDetails, BillData } from "./types/bill";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useBillCalculations } from "./hooks/useBillCalculations";
import { DEFAULT_BUSINESS_DETAILS, STORAGE_KEY_BUSINESS_DETAILS } from "./constants/defaults";
import { BusinessDetailsForm } from "./components/BusinessDetailsForm";
import { CustomerDetailsForm, emptyCustomerDetails } from "./components/CustomerDetailsForm";
import { InvoiceHeader, getTodayDateString } from "./components/InvoiceHeader";
import { BillTable, createEmptyItem } from "./components/BillTable";
import { BillSummary } from "./components/BillSummary";
import { GeneratePDFButton } from "./components/GeneratePDFButton";
import "./App.css";

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto py-8 px-4 max-w-6xl">
                {/* Page Header */}
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Bill Generator</h1>
                    <p className="text-slate-600">Create GST-compliant invoices for SINGHA ROY ENTERPRISE</p>
                </header>

                {/* Business Details (collapsible) */}
                <BusinessDetailsForm />

                {/* Invoice Header */}
                <InvoiceHeader
                    invoiceNumber={invoiceNumber}
                    date={dateString}
                    onInvoiceNumberChange={setInvoiceNumber}
                    onDateChange={setDateString}
                />

                {/* Customer Details */}
                <CustomerDetailsForm customerDetails={customerDetails} onChange={setCustomerDetails} />

                {/* Bill Items Table */}
                <BillTable
                    items={items}
                    calculatedItems={calculatedItems}
                    grandTotal={totals.grandTotal}
                    onItemsChange={setItems}
                />

                {/* Bill Summary */}
                <BillSummary totals={totals} />

                {/* Generate PDF Button */}
                <GeneratePDFButton billData={billData} />
            </div>
        </div>
    );
}

export default App;
