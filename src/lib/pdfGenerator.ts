import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions, Content, TableCell } from "pdfmake/interfaces";
import type { BillData } from "../types/bill";
import { formatAmountInWords } from "./numberToWords";

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.vfs;

/**
 * Field error type for validation
 */
export type FieldErrors = Record<string, string>;

/**
 * Format a date to DD-MM-YYYY format for the PDF
 */
function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

/**
 * Format a number with Indian locale
 */
function formatNumber(value: number): string {
    return value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Generate PDF document definition for pdfmake
 */
function generateDocumentDefinition(billData: BillData): TDocumentDefinitions {
    const { businessDetails, customerDetails, items, totals, invoiceNumber, date } = billData;

    // Filter out empty items for PDF
    const filledItems = items.filter((item) => item.description.trim() || item.hsnSac.trim() || item.taxableValue > 0);

    // Build customer address string
    const customerAddress = [
        customerDetails.address.line1,
        customerDetails.address.line2,
        customerDetails.address.pin
            ? `${customerDetails.address.city} - ${customerDetails.address.pin}`
            : customerDetails.address.city,
        customerDetails.address.state,
    ]
        .filter(Boolean)
        .join("\n");

    // Build business address string
    const businessAddress = [
        businessDetails.address.line1,
        businessDetails.address.line2,
        `${businessDetails.address.city} - ${businessDetails.address.pin}`,
        businessDetails.address.state,
    ]
        .filter(Boolean)
        .join("\n");

    // Table header
    const tableHeader: TableCell[] = [
        { text: "S.No", style: "tableHeader", alignment: "center" },
        { text: "Description of Goods", style: "tableHeader" },
        { text: "HSN/SAC", style: "tableHeader", alignment: "center" },
        { text: "Qty", style: "tableHeader", alignment: "right" },
        { text: "Rate", style: "tableHeader", alignment: "right" },
        { text: "Taxable Value", style: "tableHeader", alignment: "right" },
        { text: "CGST", style: "tableHeader", alignment: "right" },
        { text: "SGST", style: "tableHeader", alignment: "right" },
        { text: "Amount", style: "tableHeader", alignment: "right" },
    ];

    // Table body rows
    const tableBody: TableCell[][] = filledItems.map((item, index) => [
        { text: (index + 1).toString(), alignment: "center" },
        { text: item.description },
        { text: item.hsnSac, alignment: "center" },
        { text: item.quantity?.toString() || "0", alignment: "right" },
        { text: formatNumber(item.rate || 0), alignment: "right" },
        { text: formatNumber(item.taxableValue), alignment: "right" },
        {
            text: `${formatNumber(item.cgstAmount)}\n(${item.cgstPercent}%)`,
            alignment: "right",
            fontSize: 8,
        },
        {
            text: `${formatNumber(item.sgstAmount)}\n(${item.sgstPercent}%)`,
            alignment: "right",
            fontSize: 8,
        },
        { text: formatNumber(item.totalAmount), alignment: "right", bold: true },
    ]);

    // Totals row
    const totalsRow: TableCell[] = [
        { text: "", colSpan: 5, border: [true, true, false, true] },
        {},
        {},
        {},
        {},
        {
            text: formatNumber(totals.totalTaxableValue),
            alignment: "right",
            bold: true,
        },
        { text: formatNumber(totals.totalCgst), alignment: "right", bold: true },
        { text: formatNumber(totals.totalSgst), alignment: "right", bold: true },
        { text: formatNumber(totals.grandTotal), alignment: "right", bold: true },
    ];

    const content: Content = [
        // Header section
        {
            columns: [
                // Left: Logo placeholder and business name
                {
                    width: "*",
                    stack: [
                        {
                            text: businessDetails.name,
                            style: "header",
                            margin: [0, 0, 0, 5],
                        },
                        {
                            text: `${businessDetails.phones.join(", ")}\n${businessDetails.email}\nGST No: ${businessDetails.gstNo}`,
                            style: "subheader",
                        },
                    ],
                },
                // Right: Invoice info
                {
                    width: "auto",
                    stack: [
                        {
                            text: `INVOICE NO: ${invoiceNumber}`,
                            style: "invoiceNumber",
                            alignment: "right",
                        },
                        {
                            text: `Date: ${formatDate(date)}`,
                            style: "invoiceDate",
                            alignment: "right",
                            margin: [0, 5, 0, 0],
                        },
                    ],
                },
            ],
            margin: [0, 0, 0, 20],
        },

        // Customer and Business Details section
        {
            columns: [
                // Order From (Customer)
                {
                    width: "50%",
                    stack: [
                        { text: "Bill To:", style: "sectionTitle", margin: [0, 0, 0, 5] },
                        {
                            text: customerDetails.name,
                            bold: true,
                            margin: [0, 0, 0, 3],
                        },
                        { text: customerAddress, fontSize: 9 },
                        customerDetails.phone
                            ? { text: `Phone: ${customerDetails.phone}`, fontSize: 9, margin: [0, 3, 0, 0] }
                            : {},
                        customerDetails.gstNo
                            ? { text: `GST No: ${customerDetails.gstNo}`, fontSize: 9, margin: [0, 3, 0, 0] }
                            : {},
                    ],
                    margin: [0, 0, 10, 0],
                },
                // From (Business)
                {
                    width: "50%",
                    stack: [
                        { text: "From:", style: "sectionTitle", margin: [0, 0, 0, 5] },
                        {
                            text: businessDetails.name,
                            bold: true,
                            margin: [0, 0, 0, 3],
                        },
                        { text: businessAddress, fontSize: 9 },
                        { text: `Phone: ${businessDetails.phones.join(", ")}`, fontSize: 9, margin: [0, 3, 0, 0] },
                        { text: `Email: ${businessDetails.email}`, fontSize: 9, margin: [0, 3, 0, 0] },
                        { text: `GST No: ${businessDetails.gstNo}`, fontSize: 9, margin: [0, 3, 0, 0] },
                    ],
                },
            ],
            margin: [0, 0, 0, 20],
        },

        // Items table
        {
            table: {
                headerRows: 1,
                widths: [25, "*", 50, 35, 55, 65, 55, 55, 65],
                body: [tableHeader, ...tableBody, totalsRow],
            },
            layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => "#CCCCCC",
                vLineColor: () => "#CCCCCC",
                paddingLeft: () => 4,
                paddingRight: () => 4,
                paddingTop: () => 3,
                paddingBottom: () => 3,
            },
            margin: [0, 0, 0, 20],
        },

        // Amount in words
        {
            text: [
                { text: "Amount Chargeable (in words):\n", bold: true, fontSize: 9 },
                { text: formatAmountInWords(totals.grandTotal), fontSize: 10, italics: true },
            ],
            margin: [0, 0, 0, 40],
        },

        // Footer with signature
        {
            columns: [
                { width: "*", text: "" },
                {
                    width: "auto",
                    stack: [
                        {
                            text: `For - ${businessDetails.name}`,
                            alignment: "right",
                            margin: [0, 0, 0, 40],
                        },
                        {
                            text: "Authorized Signature",
                            alignment: "right",
                        },
                    ],
                },
            ],
        },
    ];

    return {
        content,
        pageSize: "A4",
        pageMargins: [40, 40, 40, 40],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
            },
            subheader: {
                fontSize: 9,
                color: "#666666",
            },
            invoiceNumber: {
                fontSize: 12,
                bold: true,
            },
            invoiceDate: {
                fontSize: 10,
            },
            sectionTitle: {
                fontSize: 10,
                bold: true,
                color: "#333333",
            },
            tableHeader: {
                fontSize: 8,
                bold: true,
                fillColor: "#f0f0f0",
            },
        },
        defaultStyle: {
            fontSize: 9,
        },
    };
}

/**
 * Generate and download a PDF invoice
 */
export function generatePDF(billData: BillData): void {
    const docDefinition = generateDocumentDefinition(billData);
    const fileName = `Invoice_${billData.invoiceNumber || "draft"}.pdf`;

    pdfMake.createPdf(docDefinition).download(fileName);
}

/**
 * Validate bill data before generating PDF
 * Returns a FieldErrors object mapping field names to error messages
 */
export function validateBillData(billData: BillData): FieldErrors {
    const errors: FieldErrors = {};

    if (!billData.invoiceNumber.trim()) {
        errors.invoiceNumber = "Invoice number is required";
    }

    if (!billData.customerDetails.name.trim()) {
        errors.customerName = "Customer name is required";
    }

    if (!billData.customerDetails.address.line1.trim()) {
        errors.customerAddress1 = "Address line 1 is required";
    }

    if (!billData.customerDetails.address.city.trim()) {
        errors.customerCity = "City is required";
    }

    if (!billData.customerDetails.address.state.trim()) {
        errors.customerState = "State is required";
    }

    // Check if there's at least one item with data
    const hasItems = billData.items.some(
        (item) => item.description.trim() || item.hsnSac.trim() || (item.quantity !== null && item.quantity > 0),
    );

    if (!hasItems) {
        errors.billItems = "At least one bill item is required";
    }

    return errors;
}

/**
 * Check if there are any validation errors
 */
export function hasErrors(errors: FieldErrors): boolean {
    return Object.keys(errors).length > 0;
}
