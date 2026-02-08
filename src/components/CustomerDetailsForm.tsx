import type { CustomerDetails, Address } from "../types/bill";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { INDIAN_STATES } from "../constants/defaults";
import { cn } from "../lib/cn";
import type { FieldErrors } from "../lib/pdfGenerator";

interface CustomerDetailsFormProps {
    customerDetails: CustomerDetails;
    onChange: (details: CustomerDetails) => void;
    errors?: FieldErrors;
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
 * Name and Address (line1, city, state) are required.
 * PIN Code, Phone and GST Number are optional.
 */
export function CustomerDetailsForm({ customerDetails, onChange, errors = {} }: CustomerDetailsFormProps) {
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <Label htmlFor="customerName" className={errors.customerName ? "text-red-600" : ""}>
                            Customer Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="customerName"
                            value={customerDetails.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            placeholder="Enter customer name"
                            className={cn(errors.customerName && "border-red-500 focus-visible:ring-red-500")}
                        />
                        {errors.customerName && <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="customerAddress1" className={errors.customerAddress1 ? "text-red-600" : ""}>
                            Address Line 1 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="customerAddress1"
                            value={customerDetails.address.line1}
                            onChange={(e) => updateAddress("line1", e.target.value)}
                            placeholder="Street address, building name"
                            className={cn(errors.customerAddress1 && "border-red-500 focus-visible:ring-red-500")}
                        />
                        {errors.customerAddress1 && (
                            <p className="mt-1 text-sm text-red-600">{errors.customerAddress1}</p>
                        )}
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
                        <Label htmlFor="customerCity" className={errors.customerCity ? "text-red-600" : ""}>
                            City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="customerCity"
                            value={customerDetails.address.city}
                            onChange={(e) => updateAddress("city", e.target.value)}
                            placeholder="Enter city"
                            className={cn(errors.customerCity && "border-red-500 focus-visible:ring-red-500")}
                        />
                        {errors.customerCity && <p className="mt-1 text-sm text-red-600">{errors.customerCity}</p>}
                    </div>

                    <div>
                        <Label htmlFor="customerPin">PIN Code (optional)</Label>
                        <Input
                            id="customerPin"
                            value={customerDetails.address.pin}
                            onChange={(e) => updateAddress("pin", e.target.value)}
                            placeholder="6-digit PIN"
                            maxLength={6}
                            className={cn(errors.customerPin && "border-red-500 focus-visible:ring-red-500")}
                        />
                        {errors.customerPin && <p className="mt-1 text-sm text-red-600">{errors.customerPin}</p>}
                    </div>

                    <div>
                        <Label htmlFor="customerState" className={errors.customerState ? "text-red-600" : ""}>
                            State <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={customerDetails.address.state}
                            onValueChange={(value) => updateAddress("state", value)}
                        >
                            <SelectTrigger
                                id="customerState"
                                className={cn(errors.customerState && "border-red-500 focus:ring-red-500")}
                            >
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
                        {errors.customerState && <p className="mt-1 text-sm text-red-600">{errors.customerState}</p>}
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
