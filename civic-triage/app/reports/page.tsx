import { Activity, BarChart3, Clock3, PieChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categoryData = [
    { name: "Water & Sanitation", value: 26 },
    { name: "Electricity", value: 19 },
    { name: "Roads & Potholes", value: 23 },
    { name: "Waste Collection", value: 14 },
    { name: "Drainage & Flooding", value: 18 },
];

const priorityData = [
    { label: "Critical", value: 14, tone: "bg-red-500" },
    { label: "High", value: 27, tone: "bg-amber-500" },
    { label: "Routine", value: 33, tone: "bg-blue-500" },
];

const responseData = [
    { metric: "Average response time", value: "2h 18m" },
    { metric: "Critical SLA", value: "41 min" },
    { metric: "Escalations this week", value: "18" },
    { metric: "Resolved within target", value: "87%" },
];

export default function ReportsPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Reports & Analytics</h1>
                <p className="text-sm text-slate-500">Operational insights for municipal complaint management.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SummaryCard label="Open complaints" value="142" icon={<Activity size={18} className="text-blue-600" />} />
                <SummaryCard label="Critical tickets" value="12" icon={<BarChart3 size={18} className="text-red-500" />} accent="text-red-700" />
                <SummaryCard label="Average SLA" value="2h 18m" icon={<Clock3 size={18} className="text-amber-500" />} accent="text-amber-700" />
                <SummaryCard label="Resolved today" value="45" icon={<PieChart size={18} className="text-emerald-500" />} accent="text-emerald-700" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                        <CardTitle className="text-base font-semibold">Complaints by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                        {categoryData.map((row) => (
                            <div key={row.name}>
                                <div className="mb-1 flex items-center justify-between text-sm">
                                    <span className="text-slate-600">{row.name}</span>
                                    <span className="font-medium text-slate-900">{row.value}%</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${row.value}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                        <CardTitle className="text-base font-semibold">Priority Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                        {priorityData.map((item) => (
                            <div key={item.label} className="flex items-center gap-3">
                                <div className={`h-3 w-3 rounded-full ${item.tone}`} />
                                <div className="flex-1">
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="text-slate-600">{item.label}</span>
                                        <span className="font-medium text-slate-900">{item.value}%</span>
                                    </div>
                                    <div className="h-2.5 rounded-full bg-slate-100">
                                        <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${item.value}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                    <CardTitle className="text-base font-semibold">Response Time Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {responseData.map((item) => (
                            <div key={item.metric} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{item.metric}</div>
                                <div className="mt-3 text-2xl font-bold text-slate-900">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                    <CardTitle className="text-base font-semibold">Performance Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-sm text-slate-600">
                    <div className="flex flex-wrap gap-2">
                        <Badge className="bg-emerald-100 text-emerald-700 border-none">Water response improved by 12%</Badge>
                        <Badge className="bg-blue-100 text-blue-700 border-none">Electrical backlog under control</Badge>
                        <Badge className="bg-amber-100 text-amber-700 border-none">Roads remain top service pressure area</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function SummaryCard({ label, value, icon, accent = "text-slate-900" }: { label: string; value: string; icon: React.ReactNode; accent?: string }) {
    return (
        <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
                    <div className={`mt-2 text-3xl font-bold ${accent}`}>{value}</div>
                </div>
                {icon}
            </CardContent>
        </Card>
    );
}
