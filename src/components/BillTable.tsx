import { useCallback, useEffect } from "react";
import type { BillItem, BillItemCalculated } from "../types/bill";
import { DEFAULT_CGST_PERCENT, DEFAULT_SGST_PERCENT } from "../constants/defaults";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "./ui/table";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "../lib/cn";

interface BillTableProps {
    items: BillItem[];
    calculatedItems: BillItemCalculated[];
    grandTotal: number;
    onItemsChange: (items: BillItem[]) => void;
    hasError?: boolean;
}

/**
 * Generate a unique ID for a new bill item
 */
function generateId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create an empty bill item with default GST percentages
 */
export function createEmptyItem(): BillItem {
    return {
        id: generateId(),
        description: "",
        hsnSac: "",
        quantity: null,
        rate: null,
        cgstPercent: DEFAULT_CGST_PERCENT,
        sgstPercent: DEFAULT_SGST_PERCENT,
    };
}

/**
 * Check if a bill item is empty (no meaningful data entered)
 */
function isItemEmpty(item: BillItem): boolean {
    return (
        !item.description.trim() &&
        !item.hsnSac.trim() &&
        (item.quantity === null || item.quantity === 0) &&
        (item.rate === null || item.rate === 0)
    );
}

/**
 * Check if a bill item has any data (partially or fully filled)
 */
function isItemFilled(item: BillItem): boolean {
    return (
        item.description.trim() !== "" ||
        item.hsnSac.trim() !== "" ||
        (item.quantity !== null && item.quantity > 0) ||
        (item.rate !== null && item.rate > 0)
    );
}

/**
 * Dynamic bill table with auto row management.
 * - Starts with 1 empty row
 * - Auto-adds new empty row when user fills current last row
 * - Auto-removes trailing empty rows (keeps at least 1)
 * - Auto-calculates taxable value, GST amounts, and row totals
 */
export function BillTable({ items, calculatedItems, grandTotal, onItemsChange, hasError = false }: BillTableProps) {
    // Auto-manage rows: add/remove based on content
    useEffect(() => {
        if (items.length === 0) {
            onItemsChange([createEmptyItem()]);
            return;
        }

        // Check if the last row has data - if so, add an empty row
        const lastItem = items[items.length - 1];
        if (isItemFilled(lastItem)) {
            onItemsChange([...items, createEmptyItem()]);
            return;
        }

        // Remove trailing empty rows (keep at least one)
        if (items.length > 1) {
            let lastNonEmptyIndex = items.length - 1;
            while (lastNonEmptyIndex > 0 && isItemEmpty(items[lastNonEmptyIndex])) {
                lastNonEmptyIndex--;
            }
            // Keep one empty row after the last filled row
            const newLength = lastNonEmptyIndex + 2;
            if (newLength < items.length) {
                onItemsChange(items.slice(0, newLength));
            }
        }
    }, [items, onItemsChange]);

    const updateItem = useCallback(
        (index: number, field: keyof BillItem, value: string | number | null) => {
            const newItems = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
            onItemsChange(newItems);
        },
        [items, onItemsChange],
    );

    const handleNumberInput = (index: number, field: keyof BillItem, value: string) => {
        const numValue = value === "" ? null : parseFloat(value);
        updateItem(index, field, isNaN(numValue as number) ? null : numValue);
    };

    const formatNumber = (value: number): string => {
        return value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <Card className={cn("mb-6 overflow-hidden", hasError && "border-red-500")}>
            <CardHeader>
                <CardTitle className={cn("text-lg font-semibold", hasError ? "text-red-600" : "text-slate-800")}>
                    Bill Items
                    {hasError && <span className="ml-2 text-sm font-normal">— At least one item is required</span>}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-[50px] text-center">S.No</TableHead>
                                <TableHead className="min-w-[180px]">Description of Goods</TableHead>
                                <TableHead className="w-[100px]">HSN/SAC</TableHead>
                                <TableHead className="w-[80px] text-right">Qty</TableHead>
                                <TableHead className="w-[100px] text-right">Rate</TableHead>
                                <TableHead className="w-[120px] text-right">Taxable Value</TableHead>
                                <TableHead className="w-[70px] text-right">CGST %</TableHead>
                                <TableHead className="w-[100px] text-right">CGST Amt</TableHead>
                                <TableHead className="w-[70px] text-right">SGST %</TableHead>
                                <TableHead className="w-[100px] text-right">SGST Amt</TableHead>
                                <TableHead className="w-[120px] text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {calculatedItems.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                    <TableCell>
                                        <Input
                                            value={items[index].description}
                                            onChange={(e) => updateItem(index, "description", e.target.value)}
                                            placeholder="Item name"
                                            className="h-8 border-0 shadow-none focus-visible:ring-1"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={items[index].hsnSac}
                                            onChange={(e) => updateItem(index, "hsnSac", e.target.value)}
                                            placeholder="HSN"
                                            className="h-8 border-0 shadow-none focus-visible:ring-1"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={items[index].quantity ?? ""}
                                            onChange={(e) => handleNumberInput(index, "quantity", e.target.value)}
                                            placeholder="0"
                                            className="h-8 border-0 text-right shadow-none focus-visible:ring-1"
                                            min={0}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={items[index].rate ?? ""}
                                            onChange={(e) => handleNumberInput(index, "rate", e.target.value)}
                                            placeholder="0.00"
                                            className="h-8 border-0 text-right shadow-none focus-visible:ring-1"
                                            min={0}
                                            step={0.01}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {item.taxableValue > 0 ? formatNumber(item.taxableValue) : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={items[index].cgstPercent ?? ""}
                                            onChange={(e) => handleNumberInput(index, "cgstPercent", e.target.value)}
                                            placeholder="9"
                                            className="h-8 border-0 text-right shadow-none focus-visible:ring-1"
                                            min={0}
                                            max={100}
                                            step={0.5}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.cgstAmount > 0 ? formatNumber(item.cgstAmount) : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={items[index].sgstPercent ?? ""}
                                            onChange={(e) => handleNumberInput(index, "sgstPercent", e.target.value)}
                                            placeholder="9"
                                            className="h-8 border-0 text-right shadow-none focus-visible:ring-1"
                                            min={0}
                                            max={100}
                                            step={0.5}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.sgstAmount > 0 ? formatNumber(item.sgstAmount) : "—"}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {item.totalAmount > 0 ? formatNumber(item.totalAmount) : "—"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-slate-100">
                                <TableCell colSpan={10} className="text-right font-semibold">
                                    Grand Total:
                                </TableCell>
                                <TableCell className="text-right text-lg font-bold">
                                    ₹ {formatNumber(grandTotal)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
