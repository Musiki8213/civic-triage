"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle, LayoutDashboard, MapPin, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TriageResult {
    priority: string;
    confidence: number;
    explanation: string;
    recommended_action: string;
    source: "live" | "demo";
}

const municipalCategories = [
    "Water & Sanitation",
    "Electricity",
    "Roads & Potholes",
    "Streetlights",
    "Waste Collection",
    "Drainage & Flooding",
    "Public Safety Hazard",
    "Other",
];

const criticalKeywords = [
    "fire",
    "electrical",
    "exposed",
    "flood",
    "water main",
    "collapse",
    "hazard",
    "sewer",
    "gas",
    "danger",
    "traffic signal",
    "broken cable",
    "power outage",
    "flooding",
    "unsafe",
];

function generateDemoTriage(payload: {
    department: string;
    description: string;
    suburb: string;
    ward: string;
    latitude: number;
    longitude: number;
}): TriageResult {
    const haystack = `${payload.department} ${payload.description}`.toLowerCase();
    const isCritical = criticalKeywords.some((keyword) => haystack.includes(keyword));
    const isHigh = payload.department.includes("Electricity") || payload.department.includes("Drainage") || payload.department.includes("Public Safety");

    const priority = isCritical ? "Critical" : isHigh ? "High" : "Routine";
    const confidence = isCritical ? 92 : isHigh ? 81 : 73;

    return {
        priority,
        confidence,
        explanation: isCritical
            ? "The incident description indicates an imminent public safety or infrastructure risk, requiring immediate dispatch review."
            : isHigh
                ? "This complaint shows elevated operational urgency and should be reviewed promptly by the relevant service team."
                : "The report matches routine maintenance patterns and can be assigned through the standard queue.",
        recommended_action: isCritical
            ? "Escalate to the emergency response desk and dispatch the relevant municipal team immediately."
            : isHigh
                ? "Assign to the duty supervisor for rapid inspection and coordinate with the relevant utility team."
                : "Log the case into the normal maintenance schedule and monitor service response time.",
        source: "demo",
    };
}

export default function LogComplaintPage() {
    const formRef = useRef<HTMLFormElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<TriageResult | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setWarning(null);
        setSuccessMessage(null);

        const formData = new FormData(event.currentTarget);
        const payload = {
            department: String(formData.get("department") ?? ""),
            description: String(formData.get("description") ?? ""),
            suburb: String(formData.get("suburb") ?? ""),
            ward: String(formData.get("ward") ?? ""),
            latitude: Number(formData.get("latitude") ?? 0),
            longitude: Number(formData.get("longitude") ?? 0),
        };

        try {
            const response = await axios.post("http://localhost:8000/api/triage", payload, {
                timeout: 5000,
            });
            setResult({ ...response.data, source: "live" });
        } catch (error) {
            console.error("Triage failed", error);
            const demoResult = generateDemoTriage(payload);
            setResult(demoResult);

            const isNetworkError =
                axios.isAxiosError(error) &&
                (!error.response || error.code === "ERR_NETWORK" || error.message.includes("Network Error"));

            setWarning(
                isNetworkError
                    ? "The backend service is currently offline. A local demo triage result has been generated so the dispatcher workflow can continue."
                    : "The triage service could not complete this request. A local fallback recommendation has been shown instead."
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePriorityToggle = () => {
        setResult((current) => {
            if (!current) return current;
            return {
                ...current,
                priority: current.priority === "Critical" ? "Routine" : "Critical",
            };
        });
    };

    const handleConfirmPriority = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!result || !formRef.current || isSubmitting) return;

        setIsSubmitting(true);

        const formData = new FormData(formRef.current);
        const suburb = String(formData.get("suburb") ?? "");
        const ward = String(formData.get("ward") ?? "");
        const payload = {
            department: String(formData.get("department") ?? ""),
            description: String(formData.get("description") ?? ""),
            suburb,
            ward,
            latitude: Number(formData.get("latitude") ?? 0),
            longitude: Number(formData.get("longitude") ?? 0),
            priority: result.priority,
            status: "New",
            location: `${suburb}, ${ward}`.trim(),
        };

        try {
            const response = await axios.post("http://localhost:8000/api/complaints", payload);
            const complaintId = response.data?.id ?? "unknown";
            setSuccessMessage(`Complaint ${complaintId} successfully logged to the queue.`);
            setWarning(null);
            setResult(null);

            if (formRef.current) {
                formRef.current.reset();
                const departmentField = formRef.current.querySelector('select[name="department"]') as HTMLSelectElement | null;
                const descriptionField = formRef.current.querySelector('textarea[name="description"]') as HTMLTextAreaElement | null;
                const suburbField = formRef.current.querySelector('input[name="suburb"]') as HTMLInputElement | null;
                const wardField = formRef.current.querySelector('input[name="ward"]') as HTMLInputElement | null;
                const latitudeField = formRef.current.querySelector('input[name="latitude"]') as HTMLInputElement | null;
                const longitudeField = formRef.current.querySelector('input[name="longitude"]') as HTMLInputElement | null;

                if (departmentField) departmentField.value = "";
                if (descriptionField) descriptionField.value = "";
                if (suburbField) suburbField.value = "";
                if (wardField) wardField.value = "";
                if (latitudeField) latitudeField.value = "";
                if (longitudeField) longitudeField.value = "";
            }
        } catch (error) {
            console.error("Failed to save complaint", error);
            setWarning("Unable to save the complaint to the queue right now. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Log New Complaint</h1>
                    <p className="text-sm text-slate-500">Dispatcher intake form for municipal service issues and AI priority triage.</p>
                </div>

                {warning && (
                    <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                        <span>{warning}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                        <CheckCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form ref={formRef} onSubmit={handleSubmit}>
                    <Card className="border-slate-200 shadow-sm mb-6">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <ShieldAlert size={18} className="text-blue-600" /> Complaint Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="department">Municipal Category</Label>
                                <select
                                    id="department"
                                    name="department"
                                    className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white"
                                    required
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select category...</option>
                                    {municipalCategories.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Fault Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Example: Exposed electrical cable near the main intersection causing a power outage."
                                    className="min-h-[120px] resize-none"
                                    required
                                />
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                <Label>Fault Location</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="suburb" className="text-xs text-slate-500">Suburb</Label>
                                        <Input id="suburb" name="suburb" placeholder="e.g. Mowbray" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ward" className="text-xs text-slate-500">Ward</Label>
                                        <Input id="ward" name="ward" placeholder="e.g. Ward 22" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude" className="text-xs text-slate-500">Latitude</Label>
                                        <Input id="latitude" name="latitude" type="number" step="any" placeholder="-33.9249" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude" className="text-xs text-slate-500">Longitude</Label>
                                        <Input id="longitude" name="longitude" type="number" step="any" placeholder="18.4241" required />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" className="cursor-pointer">Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" disabled={loading}>
                            {loading ? "Analyzing..." : "Submit & Run Triage"}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="xl:col-span-1">
                <Card className={`border shadow-sm sticky top-6 ${result?.priority === "Critical" ? "border-red-200" : "border-slate-200"}`}>
                    <CardHeader className={`${result?.priority === "Critical" ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"} border-b py-4`}>
                        <CardTitle className="text-sm font-semibold flex items-center justify-between">
                            AI Triage Assessment
                            {result && (
                                <Badge variant={result.priority === "Critical" ? "destructive" : "secondary"} className="uppercase text-[10px] tracking-wider">
                                    {result.priority}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-6 min-h-[340px]">
                        {!result && !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
                                <LayoutDashboard size={32} className="opacity-20" />
                                <p className="text-sm text-center px-4">Submit a complaint to generate an AI priority recommendation.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="h-full flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                            </div>
                        )}

                        {result && !loading && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
                                    <span>{result.source === "live" ? "Live model" : "Demo fallback"}</span>
                                    <span>{result.confidence}% confidence</span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        {result.priority === "Critical" ? <AlertTriangle size={16} className="text-red-500" /> : <CheckCircle size={16} className="text-emerald-500" />}
                                        <span className="text-sm font-semibold text-slate-700">Priority Outcome</span>
                                    </div>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${result.priority === "Critical" ? "bg-red-500" : result.priority === "High" ? "bg-amber-500" : "bg-blue-500"}`}
                                            style={{ width: `${result.confidence}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Explanation</div>
                                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">
                                        {result.explanation}
                                    </p>
                                </div>

                                <div>
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recommended Action</div>
                                    <div className="flex gap-2 items-start text-sm font-medium text-slate-900">
                                        <MapPin size={16} className="text-blue-600 mt-0.5 shrink-0" />
                                        <span>{result.recommended_action}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 space-y-2">
                                    <Button
                                        type="button"
                                        className={`w-full ${isSubmitting ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"}`}
                                        onClick={handleConfirmPriority}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Saving..." : "Confirm Priority"}
                                    </Button>
                                    <Button type="button" variant="outline" className="w-full cursor-pointer" onClick={handlePriorityToggle}>
                                        Change Priority
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}