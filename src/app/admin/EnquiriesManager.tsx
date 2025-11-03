"use client";

import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import {
  Mail,
  Phone,
  User,
  MessageSquare,
  Calendar,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Eye,
  X,
  Clock,
  Tag,
  RefreshCw,
} from "lucide-react";

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  reason: string;
  message: string;
  status: "pending" | "read";
  timestamp: string;
}

export default function EnquiriesManager() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!realtimeDb) {
      setLoading(false);
      return;
    }

    const inquiriesRef = ref(realtimeDb, "contact_inquiries");
    const unsubscribe = onValue(inquiriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const inquiriesList: ContactInquiry[] = Object.keys(data).map(
          (key) => ({
            id: key,
            ...data[key],
          })
        );

        // Sort by timestamp (newest first)
        inquiriesList.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setInquiries(inquiriesList);
      } else {
        setInquiries([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (inquiryId: string) => {
    if (!realtimeDb) return;

    setUpdating(inquiryId);
    try {
      await set(
        ref(realtimeDb, `contact_inquiries/${inquiryId}/status`),
        "read"
      );
    } catch (error) {
      console.error("Error marking inquiry as read:", error);
    } finally {
      setUpdating(null);
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      inquiry.name?.toLowerCase().includes(searchLower) ||
      inquiry.email?.toLowerCase().includes(searchLower) ||
      inquiry.phone?.includes(searchLower) ||
      inquiry.message?.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "all" || inquiry.status === statusFilter;
    const matchesReason =
      reasonFilter === "all" || inquiry.reason === reasonFilter;

    return matchesSearch && matchesStatus && matchesReason;
  });

  const getReasonLabel = (reason: string) => {
    const labels: { [key: string]: string } = {
      general_inquiry: "General Inquiry",
      technical_support: "Technical Support",
      billing: "Billing",
      partnership: "Partnership",
      feedback: "Feedback",
      other: "Other",
    };
    return labels[reason] || reason;
  };

  const getReasonColor = (reason: string) => {
    const colors: { [key: string]: string } = {
      general_inquiry: "bg-blue-100 text-blue-800",
      technical_support: "bg-red-100 text-red-800",
      billing: "bg-green-100 text-green-800",
      partnership: "bg-purple-100 text-purple-800",
      feedback: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[reason] || "bg-gray-100 text-gray-800";
  };

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === "pending").length,
    read: inquiries.filter((i) => i.status === "read").length,
    today: inquiries.filter(
      (i) => new Date(i.timestamp).toDateString() === new Date().toDateString()
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading inquiries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Contact Inquiries
          </h1>
          <p className="text-gray-600 mt-2">
            Manage customer inquiries and messages
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Inquiries
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Read</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.read}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.today}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="read">Read</option>
              </select>

              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Reasons</option>
                <option value="general_inquiry">General Inquiry</option>
                <option value="technical_support">Technical Support</option>
                <option value="billing">Billing</option>
                <option value="partnership">Partnership</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredInquiries.length} of {inquiries.length} inquiries
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {inquiries.length === 0
                ? "No Inquiries Yet"
                : "No Matching Inquiries"}
            </h3>
            <p className="text-gray-600">
              {inquiries.length === 0
                ? "Contact inquiries will appear here when customers reach out."
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  inquiry.status === "read" ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {inquiry.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3 className="font-medium text-gray-900">
                            {inquiry.name}
                          </h3>
                          {inquiry.status === "pending" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <Clock className="w-3 h-3 mr-1" />
                              New
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(
                              inquiry.reason
                            )}`}
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {getReasonLabel(inquiry.reason)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1 flex-wrap">
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {inquiry.email}
                          </span>
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {inquiry.phone}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(inquiry.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mt-2 line-clamp-2">
                      {inquiry.message}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setShowDetails(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>

                    {inquiry.status === "pending" && (
                      <button
                        onClick={() => markAsRead(inquiry.id)}
                        disabled={updating === inquiry.id}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {updating === inquiry.id
                          ? "Marking..."
                          : "Mark as Read"}
                      </button>
                    )}

                    {inquiry.status === "read" && (
                      <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-800 bg-green-100 rounded-lg">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inquiry Details Modal */}
      {showDetails && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedInquiry.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedInquiry.name}
                    </h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(
                          selectedInquiry.reason
                        )}`}
                      >
                        {getReasonLabel(selectedInquiry.reason)}
                      </span>
                      {selectedInquiry.status === "pending" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-blue-700">
                      Full Name
                    </label>
                    <p className="text-blue-900">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-700">
                      Email Address
                    </label>
                    <p className="text-blue-900 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <a
                        href={`mailto:${selectedInquiry.email}`}
                        className="hover:underline"
                      >
                        {selectedInquiry.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-700">
                      Phone Number
                    </label>
                    <p className="text-blue-900 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="hover:underline"
                      >
                        {selectedInquiry.phone}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Message
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedInquiry.message}
                </p>
              </div>

              {/* Timestamp */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-purple-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Submission Details
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-purple-700">
                      Submitted On
                    </label>
                    <p className="text-purple-900">
                      {new Date(selectedInquiry.timestamp).toLocaleString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-purple-700">
                      Inquiry ID
                    </label>
                    <p className="text-purple-900 font-mono text-sm">
                      {selectedInquiry.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              {selectedInquiry.status === "pending" && (
                <button
                  onClick={() => {
                    markAsRead(selectedInquiry.id);
                    setShowDetails(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
