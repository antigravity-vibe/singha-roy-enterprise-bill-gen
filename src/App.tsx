import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
import { Github, Moon, Sun, Download, Upload, Check, X, Trash2 } from "lucide-react";

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

    // Export/Import feedback state
    const [exportImportStatus, setExportImportStatus] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showStatus = useCallback((type: "success" | "error", message: string) => {
        if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
        setExportImportStatus({ type, message });
        statusTimeoutRef.current = setTimeout(() => setExportImportStatus(null), 2500);
    }, []);

    // Business details (persisted to localStorage)
    const [businessDetails] = useLocalStorage<BusinessDetails>(STORAGE_KEY_BUSINESS_DETAILS, DEFAULT_BUSINESS_DETAILS);

    // All form fields (persisted to localStorage with version gating)
    const [formData, setFormData, clearFormStorage] = useVersionedFormStorage<FormData>(
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

    // Clear form — two-step confirmation (arm → confirm)
    const [clearArmed, setClearArmed] = useState(false);
    const clearArmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleClearForm = useCallback(() => {
        if (!clearArmed) {
            setClearArmed(true);
            clearArmTimeoutRef.current = setTimeout(() => setClearArmed(false), 3000);
            return;
        }
        // Confirmed
        if (clearArmTimeoutRef.current) clearTimeout(clearArmTimeoutRef.current);
        setClearArmed(false);
        clearFormStorage();
        setFieldErrors({});
    }, [clearArmed, clearFormStorage]);

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

    // Export form state as minified JSON to clipboard
    const handleExportState = useCallback(async () => {
        try {
            const json = JSON.stringify(formData);
            await navigator.clipboard.writeText(json);
            showStatus("success", "State copied to clipboard");
        } catch {
            showStatus("error", "Failed to copy");
        }
    }, [formData, showStatus]);

    // Import form state from clipboard JSON
    const handleImportState = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text.trim()) {
                showStatus("error", "Clipboard is empty");
                return;
            }
            const parsed = JSON.parse(text) as FormData;
            // Basic shape validation
            if (
                typeof parsed.invoiceNumber !== "string" ||
                typeof parsed.dateString !== "string" ||
                !parsed.customerDetails ||
                !Array.isArray(parsed.items)
            ) {
                showStatus("error", "Invalid state format");
                return;
            }
            setFormData(parsed);
            setFieldErrors({});
            showStatus("success", "State imported");
        } catch {
            showStatus("error", "Invalid JSON in clipboard");
        }
    }, [setFormData, showStatus]);

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
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Export/Import Status Toast */}
                    {exportImportStatus && (
                        <div
                            className={`animate-in fade-in slide-in-from-top-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition-all ${
                                exportImportStatus.type === "success"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                            }`}
                        >
                            {exportImportStatus.type === "success" ? (
                                <Check className="h-3.5 w-3.5" />
                            ) : (
                                <X className="h-3.5 w-3.5" />
                            )}
                            {exportImportStatus.message}
                        </div>
                    )}

                    {/* Export State */}
                    <button
                        onClick={handleExportState}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        title="Export form state to clipboard (JSON)"
                        id="export-state-btn"
                    >
                        <Download className="h-5 w-5" />
                    </button>

                    {/* Import State */}
                    <button
                        onClick={handleImportState}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        title="Import form state from clipboard (JSON)"
                        id="import-state-btn"
                    >
                        <Upload className="h-5 w-5" />
                    </button>

                    {/* Clear Form */}
                    <button
                        onClick={handleClearForm}
                        className={`flex h-9 items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-all ${
                            clearArmed
                                ? "bg-red-100 text-red-700 ring-1 ring-red-300 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-700 dark:hover:bg-red-900/70"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        }`}
                        title={clearArmed ? "Click again to confirm reset" : "Clear form"}
                        id="clear-form-btn"
                    >
                        <Trash2 className="h-4 w-4" />
                        {clearArmed && <span className="hidden sm:inline">Confirm?</span>}
                    </button>

                    {/* Separator */}
                    <span className="hidden text-xs font-medium text-slate-400 sm:inline dark:text-slate-500">
                        v{packageJSON.version}
                    </span>
                    <div className="mx-0.5 h-5 w-px bg-slate-200 dark:bg-slate-700" />

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
