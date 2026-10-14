import { MapPin, Navigation, Radar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activeIncidents = [
    { id: "CIV-1024", title: "Burst water main", category: "Water & Sanitation", lat: -33.9249, lng: 18.4241, ward: "Ward 14" },
    { id: "CIV-1109", title: "Power outage", category: "Electricity", lat: -33.9321, lng: 18.4012, ward: "Ward 23" },
    { id: "CIV-1153", title: "Stormwater blockage", category: "Drainage & Flooding", lat: -33.9487, lng: 18.4575, ward: "Ward 4" },
    { id: "CIV-1120", title: "Road hazard", category: "Roads & Potholes", lat: -33.9194, lng: 18.4448, ward: "Ward 7" },
];

export default function MapPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Map View</h1>
                <p className="text-sm text-slate-500">Live incident locations and field deployment hotspots.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Radar size={16} className="text-blue-600" /> Active Municipal Incidents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative h-[540px] bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.18),_transparent_55%),linear-gradient(135deg,_#f8fafc,_#e2e8f0)]">
                            <div className="absolute inset-0 opacity-60">
                                <div className="absolute left-1/4 top-1/3 h-24 w-24 rounded-full border border-sky-300 bg-sky-100/60" />
                                <div className="absolute right-1/3 bottom-1/4 h-28 w-28 rounded-full border border-sky-300 bg-sky-100/60" />
                                <div className="absolute left-2/3 top-1/4 h-20 w-20 rounded-full border border-slate-300 bg-white/40" />
                            </div>

                            {activeIncidents.map((incident, index) => (
                                <div
                                    key={incident.id}
                                    className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                                    style={{
                                        left: `${20 + (index * 18) % 70}%`,
                                        top: `${25 + (index * 17) % 55}%`,
                                    }}
                                >
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 shadow-lg">
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                    </div>
                                    <span className="mt-2 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-medium text-white shadow-sm">
                                        {incident.id}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <MapPin size={16} className="text-red-500" /> Incident List
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 p-4">
                            {activeIncidents.map((incident) => (
                                <div key={incident.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium text-slate-900">{incident.id}</span>
                                        <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-medium text-red-700">Active</span>
                                    </div>
                                    <p className="mt-2 text-sm font-medium text-slate-700">{incident.title}</p>
                                    <p className="mt-1 text-xs text-slate-500">{incident.category}</p>
                                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                        <span>{incident.ward}</span>
                                        <span>{incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Navigation size={16} className="text-emerald-600" /> Dispatch Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 p-4 text-sm text-slate-600">
                            <div className="flex justify-between">
                                <span>Field teams active</span>
                                <strong className="text-slate-900">12</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Average ETA</span>
                                <strong className="text-slate-900">18 min</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Critical incidents</span>
                                <strong className="text-slate-900">2</strong>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
