import { useState } from "react";
import type { BusinessDetails } from "../types/bill";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { DEFAULT_BUSINESS_DETAILS, STORAGE_KEY_BUSINESS_DETAILS } from "../constants/defaults";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

interface BusinessDetailsFormProps {
    onDetailsChange?: (details: BusinessDetails) => void;
}

/**
 * Editable business details form with localStorage persistence.
 * Collapsible UI - shows a summary card that can be expanded to edit.
 */
export function BusinessDetailsForm({ onDetailsChange }: BusinessDetailsFormProps) {
    const [businessDetails, setBusinessDetails] = useLocalStorage<BusinessDetails>(
        STORAGE_KEY_BUSINESS_DETAILS,
        DEFAULT_BUSINESS_DETAILS,
    );
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<BusinessDetails>(businessDetails);

    const handleSave = () => {
        setBusinessDetails(editForm);
        onDetailsChange?.(editForm);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditForm(businessDetails);
        setIsEditing(false);
    };

    const handleReset = () => {
        setEditForm(DEFAULT_BUSINESS_DETAILS);
    };

    if (!isEditing) {
        return (
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-800">{businessDetails.name}</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        Edit Business Details
                    </Button>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <span className="font-medium">Phone:</span> {businessDetails.phones.join(", ")}
                        </div>
                        <div>
                            <span className="font-medium">Email:</span> {businessDetails.email}
                        </div>
                        <div>
                            <span className="font-medium">GST No:</span> {businessDetails.gstNo}
                        </div>
                        <div className="md:col-span-2">
                            <span className="font-medium">Address:</span> {businessDetails.address.line1}
                            {businessDetails.address.line2 && `, ${businessDetails.address.line2}`}
                            {`, ${businessDetails.address.city} - ${businessDetails.address.pin}, ${businessDetails.address.state}`}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Edit Business Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="flex gap-2 mt-4">
                    <Button onClick={handleSave}>Save</Button>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button variant="ghost" onClick={handleReset} className="ml-auto">
                        Reset to Default
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
