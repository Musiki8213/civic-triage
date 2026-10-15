"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowUpDown, BellRing, Eye, Filter, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Base URL for the backend API, configured via NEXT_PUBLIC_API_URL.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ComplaintRecord {
    id: string;
    description: string;
    category: string;
    location: string;
    ward: string;
    priority: "Critical" | "Routine" | "High" | string;
    status: string;
    created_at?: string;
}

const categoryFilters = [
    "All",
    "Critical",
    "High",
    "Routine",
    "Water & Sanitation",
    "Electricity",
    "Roads & Potholes",
    "Streetlights",
    "Waste Collection",
    "Drainage & Flooding",
];

export default function ComplaintQueuePage() {
    const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [sortKey, setSortKey] = useState<keyof ComplaintRecord>("created_at" as keyof ComplaintRecord);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const formatTime = (value?: string) =>
        value
            ? new Date(value).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })
            : "--:--";

    const fetchComplaints = async () => {
        try {
            // OLD: const response = await axios.get("http://localhost:8000/api/complaints");
            const response = await axios.get(`${API_URL}/api/complaints`);
            setComplaints(response.data ?? []);
        } catch (error) {
            console.error("Failed to fetch complaints", error);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const updateComplaintStatus = async (complaintId: string, nextStatus: "Assigned" | "Resolved") => {
        try {
            // OLD: await axios.put(`http://localhost:8000/api/complaints/${encodeURIComponent(complaintId)}/status`, { status: nextStatus });
            await axios.put(`${API_URL}/api/complaints/${encodeURIComponent(complaintId)}/status`, { status: nextStatus });
            setComplaints((current) =>
                current.map((complaint) =>
                    complaint.id === complaintId ? { ...complaint, status: nextStatus } : complaint
                )
            );
            await fetchComplaints();
        } catch (error) {
            console.error("Failed to update complaint status", error);
        }
    };

    const visibleComplaints = useMemo(() => {
        const filtered = complaints.filter((complaint) => {
            if (activeFilter === "All") return true;
            if (activeFilter === "Critical" || activeFilter === "High" || activeFilter === "Routine") {
                return complaint.priority === activeFilter;
            }
            return complaint.category === activeFilter;
        });

        return [...filtered].sort((a, b) => {
            const left = (a as any)[sortKey];
            const right = (b as any)[sortKey];

            if (sortKey === "created_at") {
                const aDate = new Date(left ?? 0).getTime();
                const bDate = new Date(right ?? 0).getTime();
                return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
            }

            const comparison = String(left ?? "").localeCompare(String(right ?? ""));
            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [activeFilter, complaints, sortDirection, sortKey]);

    const handleSort = (key: keyof ComplaintRecord) => {
        if (sortKey === key) {
            setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
            return;
        }

        setSortKey(key);
        setSortDirection("asc");
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Complaint Queue</h1>
                    <p className="text-sm text-slate-500">Monitor active service requests and priority workflow.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <SlidersHorizontal size={14} /> Filters
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <BellRing size={14} /> Notify Team
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Filter size={16} className="text-slate-600" /> Filter Queue
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                        {categoryFilters.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${activeFilter === filter
                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex min-h-[180px] items-center justify-center text-sm text-slate-500">Loading complaints...</div>
                    ) : visibleComplaints.length === 0 ? (
                        <div className="flex min-h-[180px] items-center justify-center text-sm text-slate-500">No complaints logged yet.</div>
                    ) : (
                        <div className="overflow-auto">
                            <table className="w-full text-left text-sm text-slate-700">
                                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                    <tr>
                                        {[
                                            { label: "ID", key: "id" },
                                            { label: "Description", key: "description" },
                                            { label: "Category", key: "category" },
                                            { label: "Location", key: "location" },
                                            { label: "Ward", key: "ward" },
                                            { label: "Time Logged", key: "created_at" },
                                            { label: "AI Priority", key: "priority" },
                                            { label: "Status", key: "status" },
                                            { label: "Actions", key: "actions" },
                                        ].map((column) => (
                                            <th key={column.key} className="px-4 py-3 font-medium">
                                                {column.key === "actions" ? (
                                                    <span>{column.label}</span>
                                                ) : (
                                                    <button type="button" onClick={() => handleSort(column.key as keyof ComplaintRecord)} className="inline-flex items-center gap-1">
                                                        {column.label}
                                                        <ArrowUpDown size={12} className="text-slate-400" />
                                                    </button>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {visibleComplaints.map((complaint) => (
                                        <tr key={complaint.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{complaint.id}</td>
                                            <td className="px-4 py-3 max-w-md">{complaint.description}</td>
                                            <td className="px-4 py-3">{complaint.category}</td>
                                            <td className="px-4 py-3">{complaint.location}</td>
                                            <td className="px-4 py-3">{complaint.ward}</td>
                                            <td className="px-4 py-3 text-slate-500">{formatTime(complaint.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    className={
                                                        complaint.priority === "Critical"
                                                            ? "bg-red-100 text-red-700 border-none"
                                                            : complaint.priority === "High"
                                                                ? "bg-amber-100 text-amber-700 border-none"
                                                                : "bg-blue-100 text-blue-700 border-none"
                                                    }
                                                >
                                                    {complaint.priority}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{complaint.status}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {complaint.status === "New" ? (
                                                        <Button variant="outline" size="sm" className="h-8 px-2 cursor-pointer" onClick={() => updateComplaintStatus(complaint.id, "Assigned")}>
                                                            <Eye size={12} className="mr-1" /> Review
                                                        </Button>
                                                    ) : complaint.status === "Assigned" ? (
                                                        <Button variant="outline" size="sm" className="h-8 px-2 cursor-pointer" onClick={() => updateComplaintStatus(complaint.id, "Resolved")}>
                                                            <Eye size={12} className="mr-1" /> Resolve
                                                        </Button>
                                                    ) : (
                                                        <span className="text-gray-400">Closed</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

