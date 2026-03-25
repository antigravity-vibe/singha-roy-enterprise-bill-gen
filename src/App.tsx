import { useState, useMemo, useCallback, useEffect } from "react";
import type { BillItem, CustomerDetails, BusinessDetails, BillData } from "./types/bill";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useVersionedFormStorage } from "./hooks/useVersionedFormStorage";
import { useBillCalculations } from "./hooks/useBillCalculations";
import { DEFAULT_BUSINESS_DETAILS, STORAGE_KEY_BUSINESS_DETAILS, STORAGE_KEY_FORM_DATA } from "./constants/defaults";
import { packageJSON } from "./utils/packageJSON";
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
import { Github, Moon, Sun } from "lucide-react";

interface FormData {
    invoiceNumber: string;
    dateString: string;
    customerDetails: CustomerDetails;
    items: BillItem[];
}

const defaultFormData: FormData = {
    invoiceNumber: "",
    dateString: getTodayDateString(),
    customerDetails: emptyCustomerDetails,
    items: [createEmptyItem()],
};

function App() {
    // Theme details (persisted to localStorage)
    const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>("sre-theme-dark", true);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode((prev) => !prev);

    // Business details (persisted to localStorage)
    const [businessDetails] = useLocalStorage<BusinessDetails>(STORAGE_KEY_BUSINESS_DETAILS, DEFAULT_BUSINESS_DETAILS);

    // All form fields (persisted to localStorage with version gating)
    const [formData, setFormData] = useVersionedFormStorage<FormData>(
        STORAGE_KEY_FORM_DATA,
        packageJSON.version,
        defaultFormData,
    );

    // Convenience accessors
    const { invoiceNumber, dateString, customerDetails, items } = formData;

    const setInvoiceNumber = useCallback(
        (value: string) => setFormData((prev) => ({ ...prev, invoiceNumber: value })),
        [setFormData],
    );
    const setDateString = useCallback(
        (value: string) => setFormData((prev) => ({ ...prev, dateString: value })),
        [setFormData],
    );
    const setCustomerDetails = useCallback(
        (value: CustomerDetails) => setFormData((prev) => ({ ...prev, customerDetails: value })),
        [setFormData],
    );
    const setItems = useCallback(
        (value: BillItem[]) => setFormData((prev) => ({ ...prev, items: value })),
        [setFormData],
    );

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
        <div className="min-h-screen scroll-smooth bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-16 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Fixed Page Header */}
            <header className="fixed top-0 right-0 left-0 z-50 flex h-16 w-full items-center justify-between bg-white/90 px-4 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-md transition-colors duration-300 select-none sm:px-6 dark:bg-slate-950/90 dark:ring-slate-100/10">
                <div className="flex items-center gap-3">
                    <SinghaRoyEnterpriseLogo className="h-10 w-10 shrink-0 drop-shadow-sm sm:h-11 sm:w-11" />
                    <h1 className="text-lg font-extrabold tracking-tight text-slate-900 transition-colors duration-300 sm:text-xl lg:text-2xl dark:text-slate-100">
                        SINGHA ROY ENTERPRISE INVOICE GENERATOR
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {packageJSON.repository?.url && (
                        <a
                            href={packageJSON.repository.url.replace(/\.git$/, "")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            title="GitHub Repository"
                        >
                            <Github className="h-5 w-5" />
                        </a>
                    )}
                    <button
                        onClick={toggleTheme}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        title="Toggle Theme"
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                </div>
            </header>

            <div className="container mx-auto max-w-6xl px-4 py-8">
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
