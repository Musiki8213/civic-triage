"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilePlus, AlertTriangle, Clock, Users, CheckCircle2, AlertCircle } from "lucide-react";

interface ComplaintRecord {
  id: string;
  description: string;
  category: string;
  location: string;
  ward: string;
  priority: string;
  status: string;
  created_at?: string;
}

export default function OverviewDashboard() {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/complaints");
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
      await axios.put(`http://localhost:8000/api/complaints/${encodeURIComponent(complaintId)}/status`, { status: nextStatus });
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

  const handleReviewComplaint = async (complaintId: string) => {
    await updateComplaintStatus(complaintId, "Assigned");
  };

  const openComplaints = useMemo(
    () => complaints.filter((complaint) => complaint.status === "New" || complaint.status === "Assigned"),
    [complaints]
  );

  const criticalComplaints = useMemo(
    () => complaints.filter((complaint) => complaint.priority === "Critical" && (complaint.status === "New" || complaint.status === "Assigned")),
    [complaints]
  );

  const totalOpen = openComplaints.length;
  const criticalCount = criticalComplaints.length;
  const awaitingReview = complaints.filter((complaint) => complaint.status === "New").length;
  const assignedCount = complaints.filter((complaint) => complaint.status === "Assigned").length;
  const resolvedToday = complaints.filter((complaint) => complaint.status === "Resolved").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Overview Dashboard</h1>
          <p className="text-sm text-slate-500">System status and operational summary for today.</p>
        </div>
        <Link href="/log-complaint">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <FilePlus size={16} />
            Log New Complaint
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Link href="/queue" className="block cursor-pointer hover:shadow-md transition-shadow">
          <SummaryCard title="Total Open" value={String(totalOpen)} icon={<Clock size={18} className="text-slate-500" />} />
        </Link>
        <Link href="/queue" className="block cursor-pointer hover:shadow-md transition-shadow">
          <SummaryCard title="Critical Priority" value={String(criticalCount)} icon={<AlertTriangle size={18} className="text-red-500" />} border="border-red-200" bg="bg-red-50" text="text-red-700" />
        </Link>
        <Link href="/queue" className="block cursor-pointer hover:shadow-md transition-shadow">
          <SummaryCard title="Awaiting Review" value={String(awaitingReview)} icon={<AlertCircle size={18} className="text-amber-500" />} />
        </Link>
        <Link href="/queue" className="block cursor-pointer hover:shadow-md transition-shadow">
          <SummaryCard title="Assigned" value={String(assignedCount)} icon={<Users size={18} className="text-blue-500" />} />
        </Link>
        <Link href="/queue" className="block cursor-pointer hover:shadow-md transition-shadow">
          <SummaryCard title="Resolved Today" value={String(resolvedToday)} icon={<CheckCircle2 size={18} className="text-emerald-500" />} />
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" /> Needs Immediate Review
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[120px] items-center justify-center text-sm text-slate-500">Loading complaints...</div>
          ) : criticalComplaints.filter((complaint) => complaint.status === "New").length === 0 ? (
            <div className="flex min-h-[120px] items-center justify-center text-sm text-slate-500">No complaints awaiting review.</div>
          ) : (
            <div className="w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-slate-100 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Time Logged</th>
                    <th className="px-4 py-3 font-medium">AI Priority</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criticalComplaints.filter((complaint) => complaint.status === "New").map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{complaint.id}</td>
                      <td className="px-4 py-3">{complaint.description}</td>
                      <td className="px-4 py-3 text-slate-500">{complaint.ward}, {complaint.location}</td>
                      <td className="px-4 py-3 text-slate-500">{complaint.created_at ? new Date(complaint.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : "Just now"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-none">{complaint.priority}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => handleReviewComplaint(complaint.id)}>
                          Review
                        </Button>
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

function SummaryCard({ title, value, icon, border = "border-slate-200", bg = "bg-white", text = "text-slate-900" }: { title: string, value: string, icon: React.ReactNode, border?: string, bg?: string, text?: string }) {
  return (
    <Card className={`${border} ${bg} shadow-sm`}>
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
          {icon}
        </div>
        <div className={`text-3xl font-bold ${text}`}>{value}</div>
      </CardContent>
    </Card>
  );
}