import { Bell, ShieldCheck, SlidersHorizontal, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const settingsGroups = [
    {
        title: "Dispatcher Preferences",
        icon: <Users size={16} className="text-blue-600" />,
        items: [
            { label: "Auto-assign high-risk complaints", checked: true },
            { label: "Send escalation alerts by SMS", checked: true },
            { label: "Notify field teams on status changes", checked: false },
        ],
    },
    {
        title: "System Configuration",
        icon: <SlidersHorizontal size={16} className="text-emerald-600" />,
        items: [
            { label: "Prioritize electrical and flood incidents", checked: true },
            { label: "Enable AI triage explanations", checked: true },
            { label: "Display backlog health alerts", checked: true },
        ],
    },
    {
        title: "Notifications",
        icon: <Bell size={16} className="text-amber-600" />,
        items: [
            { label: "Daily dispatch summary email", checked: true },
            { label: "Critical response reminders", checked: true },
            { label: "Training and policy updates", checked: false },
        ],
    },
];

export default function SettingsPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Settings</h1>
                <p className="text-sm text-slate-500">Manage dispatcher preferences and municipal operations configuration.</p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-600" /> Control Center
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        {settingsGroups.map((group) => (
                            <div key={group.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                    {group.icon}
                                    {group.title}
                                </div>

                                <div className="space-y-3">
                                    {group.items.map((item) => (
                                        <label key={item.label} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm text-slate-600 shadow-sm border border-slate-200">
                                            <span>{item.label}</span>
                                            <input type="checkbox" defaultChecked={item.checked} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Sparkles size={16} className="text-violet-600" /> AI Triage Defaults
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-sm text-slate-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Default triage threshold</div>
                            <div className="mt-2 text-2xl font-bold text-slate-900">High</div>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Escalation window</div>
                            <div className="mt-2 text-2xl font-bold text-slate-900">30 min</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
