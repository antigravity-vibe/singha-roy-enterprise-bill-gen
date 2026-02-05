import type { CustomerDetails, Address } from "../types/bill";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { INDIAN_STATES } from "../constants/defaults";

interface CustomerDetailsFormProps {
    customerDetails: CustomerDetails;
    onChange: (details: CustomerDetails) => void;
}

const emptyAddress: Address = {
    line1: "",
    line2: "",
    city: "",
    pin: "",
    state: "",
};

export const emptyCustomerDetails: CustomerDetails = {
    name: "",
    address: emptyAddress,
    phone: "",
    gstNo: "",
};

/**
 * Form for entering customer details.
 * Name and Address (line1, city, pin, state) are required.
 * Phone and GST Number are optional.
 */
export function CustomerDetailsForm({ customerDetails, onChange }: CustomerDetailsFormProps) {
    const updateField = <K extends keyof CustomerDetails>(field: K, value: CustomerDetails[K]) => {
        onChange({ ...customerDetails, [field]: value });
    };

    const updateAddress = <K extends keyof Address>(field: K, value: Address[K]) => {
        onChange({
            ...customerDetails,
            address: { ...customerDetails.address, [field]: value },
        });
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Label htmlFor="customerName">
                            Customer Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="customerName"
                            value={customerDetails.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            placeholder="Enter customer name"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="customerAddress1">
                            Address Line 1 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="customerAddress1"
                            value={customerDetails.address.line1}
                            onChange={(e) => updateAddress("line1", e.target.value)}
                            placeholder="Street address, building name"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="customerAddress2">Address Line 2</Label>
                        <Input
                            id="customerAddress2"
                            value={customerDetails.address.line2 || ""}
                            onChange={(e) => updateAddress("line2", e.target.value)}
                            placeholder="Area, landmark (optional)"
                        />
                    </div>

                    <div>
                        <Label htmlFor="customerCity">
                            City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="customerCity"
                            value={customerDetails.address.city}
                            onChange={(e) => updateAddress("city", e.target.value)}
                            placeholder="Enter city"
                        />
                    </div>

                    <div>
                        <Label htmlFor="customerPin">
                            PIN Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="customerPin"
                            value={customerDetails.address.pin}
                            onChange={(e) => updateAddress("pin", e.target.value)}
                            placeholder="6-digit PIN"
                            maxLength={6}
                        />
                    </div>

                    <div>
                        <Label htmlFor="customerState">
                            State <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={customerDetails.address.state}
                            onValueChange={(value) => updateAddress("state", value)}
                        >
                            <SelectTrigger id="customerState">
                                <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                                {INDIAN_STATES.map((state) => (
                                    <SelectItem key={state} value={state}>
                                        {state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="customerPhone">Phone (optional)</Label>
                        <Input
                            id="customerPhone"
                            value={customerDetails.phone || ""}
                            onChange={(e) => updateField("phone", e.target.value)}
                            placeholder="10-digit mobile number"
                            maxLength={10}
                        />
                    </div>

                    <div>
                        <Label htmlFor="customerGst">GST Number (optional)</Label>
                        <Input
                            id="customerGst"
                            value={customerDetails.gstNo || ""}
                            onChange={(e) => updateField("gstNo", e.target.value)}
                            placeholder="15-character GSTIN"
                            maxLength={15}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
