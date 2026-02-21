import { useState } from "react";
import type { BusinessDetails } from "../types/bill";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { DEFAULT_BUSINESS_DETAILS, STORAGE_KEY_BUSINESS_DETAILS } from "../constants/defaults";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { SectionLabel } from "./SectionLabel";

interface BusinessDetailsFormProps {
    onDetailsChange?: (details: BusinessDetails) => void;
}

/**
 * Editable business details form with localStorage persistence.
 * Shows a summary card with a button that opens a modal dialog for editing.
 */
export function BusinessDetailsForm({ onDetailsChange }: BusinessDetailsFormProps) {
    const [businessDetails, setBusinessDetails] = useLocalStorage<BusinessDetails>(
        STORAGE_KEY_BUSINESS_DETAILS,
        DEFAULT_BUSINESS_DETAILS,
    );
    const [isOpen, setIsOpen] = useState(false);
    const [editForm, setEditForm] = useState<BusinessDetails>(businessDetails);

    const handleOpen = () => {
        setEditForm(businessDetails);
        setIsOpen(true);
    };

    const handleSave = () => {
        setBusinessDetails(editForm);
        onDetailsChange?.(editForm);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setEditForm(businessDetails);
        setIsOpen(false);
    };

    const handleReset = () => {
        setEditForm(DEFAULT_BUSINESS_DETAILS);
    };

    return (
        <>
            <Card className="relative mb-10 transition-shadow duration-200 hover:shadow-md">
                <SectionLabel title="Business Details" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-800">{businessDetails.name}</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpen}
                        className="gap-1.5 text-slate-500 hover:text-slate-700"
                    >
                        <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                        </svg>
                        Edit
                    </Button>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">📞</span>
                            <span>{businessDetails.phones.join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">📧</span>
                            <span>{businessDetails.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">🔢</span>
                            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700">
                                {businessDetails.gstNo}
                            </span>
                        </div>
                        <div className="flex items-start gap-2 md:col-span-2">
                            <span className="text-slate-400">📍</span>
                            <span>
                                {businessDetails.address.line1}
                                {businessDetails.address.line2 && `, ${businessDetails.address.line2}`}
                                {`, ${businessDetails.address.city} - ${businessDetails.address.pin}, ${businessDetails.address.state}`}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-slate-800">
                            Edit Business Details
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input
                                id="businessName"
                                value={editForm.name}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone1">Phone 1</Label>
                            <Input
                                id="phone1"
                                value={editForm.phones[0] || ""}
                                onChange={(e) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        phones: [e.target.value, prev.phones[1] || ""],
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone2">Phone 2</Label>
                            <Input
                                id="phone2"
                                value={editForm.phones[1] || ""}
                                onChange={(e) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        phones: [prev.phones[0] || "", e.target.value],
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="gstNo">GST Number</Label>
                            <Input
                                id="gstNo"
                                value={editForm.gstNo}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, gstNo: e.target.value }))}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="addressLine1">Address Line 1</Label>
                            <Input
                                id="addressLine1"
                                value={editForm.address.line1}
                                onChange={(e) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        address: { ...prev.address, line1: e.target.value },
                                    }))
                                }
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="addressLine2">Address Line 2</Label>
                            <Input
                                id="addressLine2"
                                value={editForm.address.line2 || ""}
                                onChange={(e) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        address: { ...prev.address, line2: e.target.value },
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={editForm.address.city}
                                onChange={(e) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        address: { ...prev.address, city: e.target.value },
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="pin">PIN Code</Label>
                            <Input
                                id="pin"
                                value={editForm.address.pin}
                                onChange={(e) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        address: { ...prev.address, pin: e.target.value },
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                value={editForm.address.state}
                                onChange={(e) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        address: { ...prev.address, state: e.target.value },
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button variant="ghost" onClick={handleReset}>
                            Reset to Default
                        </Button>
                        <div className="flex-1" />
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
