"use client";

import { useState, useEffect } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Phone,
  MapPin,
  Calendar,
  Trash2,
} from "lucide-react";

interface SellerData {
  id: string;
  boothIdentity: string;
  boothTitle: string;
  firstName: string;
  lastName: string;
  address: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phoneNumber?: string;
  shippingMethod: "cover_cost" | "flat_rate" | "exact_amount";
  advertiseItems: boolean;
  agreeToTerms: boolean;
  hearAboutUs: string;
  status: "pending" | "active" | "suspended";
  createdAt: string;
}

export default function SellersManager() {
  const [sellers, setSellers] = useState<SellerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSeller, setSelectedSeller] = useState<SellerData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!realtimeDb) {
      setLoading(false);
      return;
    }

    const sellersRef = ref(realtimeDb, "sellers");
    const unsubscribe = onValue(sellersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const sellersList: SellerData[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Sort by creation date (newest first)
        sellersList.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setSellers(sellersList);
      } else {
        setSellers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSellerStatus = async (sellerId: string, newStatus: string) => {
    if (!realtimeDb) return;

    setUpdating(sellerId);
    try {
      await set(ref(realtimeDb, `sellers/${sellerId}/status`), newStatus);
      // Success feedback could be added here
    } catch (error) {
      console.error("Error updating seller status:", error);
    } finally {
      setUpdating(null);
    }
  };

  const deleteSeller = async (sellerId: string) => {
    if (!realtimeDb) return;

    if (
      confirm(
        "Are you sure you want to delete this seller? This action cannot be undone."
      )
    ) {
      try {
        await remove(ref(realtimeDb, `sellers/${sellerId}`));
      } catch (error) {
        console.error("Error deleting seller:", error);
      }
    }
  };

  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      seller.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.boothTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.boothIdentity.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || seller.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "suspended":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getShippingMethodLabel = (method: string) => {
    switch (method) {
      case "cover_cost":
        return "Free Shipping";
      case "flat_rate":
        return "Flat Rate";
      case "exact_amount":
        return "Calculated";
      default:
        return method;
    }
  };

  const exportData = () => {
    const csvContent = [
      // Header
      "ID,Name,Booth Title,Booth Identity,Email,Phone,City,State,Country,Status,Shipping Method,Advertise Items,Created At",
      // Data rows
      ...filteredSellers.map(
        (seller) =>
          `${seller.id},"${seller.firstName} ${seller.lastName}","${
            seller.boothTitle
          }","${seller.boothIdentity}","","${seller.phoneNumber || ""}","${
            seller.city
          }","${seller.state}","${seller.country}","${
            seller.status
          }","${getShippingMethodLabel(seller.shippingMethod)}","${
            seller.advertiseItems ? "Yes" : "No"
          }","${seller.createdAt}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sellers-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: sellers.length,
    active: sellers.filter((s) => s.status === "active").length,
    pending: sellers.filter((s) => s.status === "pending").length,
    suspended: sellers.filter((s) => s.status === "suspended").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading sellers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Seller Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage seller registrations and accounts
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sellers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.total}
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
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
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
            <div className="p-3 rounded-lg bg-red-100">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suspended</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.suspended}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredSellers.length} of {sellers.length} sellers
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredSellers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {sellers.length === 0 ? "No Sellers Yet" : "No Matching Sellers"}
            </h3>
            <p className="text-gray-600">
              {sellers.length === 0
                ? "Seller registrations will appear here when users sign up."
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {seller.firstName.charAt(0)}
                          {seller.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {seller.firstName} {seller.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {seller.phoneNumber && (
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {seller.phoneNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {seller.boothTitle}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{seller.boothIdentity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {seller.city}, {seller.state}
                      </div>
                      <div className="text-sm text-gray-500">
                        {seller.country}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          seller.status
                        )}`}
                      >
                        {getStatusIcon(seller.status)}
                        <span className="ml-1 capitalize">{seller.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSeller(seller);
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {seller.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateSellerStatus(seller.id, "active")
                              }
                              disabled={updating === seller.id}
                              className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded disabled:opacity-50"
                              title="Approve Seller"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateSellerStatus(seller.id, "suspended")
                              }
                              disabled={updating === seller.id}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded disabled:opacity-50"
                              title="Suspend Seller"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {seller.status === "active" && (
                          <button
                            onClick={() =>
                              updateSellerStatus(seller.id, "suspended")
                            }
                            disabled={updating === seller.id}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded disabled:opacity-50"
                            title="Suspend Seller"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {seller.status === "suspended" && (
                          <button
                            onClick={() =>
                              updateSellerStatus(seller.id, "active")
                            }
                            disabled={updating === seller.id}
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded disabled:opacity-50"
                            title="Reactivate Seller"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => deleteSeller(seller.id)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                          title="Delete Seller"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Seller Details Modal */}
      {showDetails && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Seller Details
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Full Name
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedSeller.firstName} {selectedSeller.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Phone Number
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedSeller.phoneNumber || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Address
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedSeller.address}
                        {selectedSeller.addressLine2 && (
                          <>
                            <br />
                            {selectedSeller.addressLine2}
                          </>
                        )}
                        <br />
                        {selectedSeller.city}, {selectedSeller.state}{" "}
                        {selectedSeller.zipCode}
                        <br />
                        {selectedSeller.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Booth Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Booth Title
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedSeller.boothTitle}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Booth Identity
                      </label>
                      <p className="text-sm text-gray-900">
                        @{selectedSeller.boothIdentity}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          selectedSeller.status
                        )}`}
                      >
                        {getStatusIcon(selectedSeller.status)}
                        <span className="ml-1 capitalize">
                          {selectedSeller.status}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Preferences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Business Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Shipping Method
                    </label>
                    <p className="text-sm text-gray-900">
                      {getShippingMethodLabel(selectedSeller.shippingMethod)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Advertising
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedSeller.advertiseItems
                        ? "Opted in to advertising"
                        : "No advertising"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      How they heard about us
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedSeller.hearAboutUs || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Terms Agreement
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedSeller.agreeToTerms
                        ? "✅ Agreed"
                        : "❌ Not agreed"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Registration Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Registration Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Registration Date
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedSeller.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Seller ID
                    </label>
                    <p className="text-sm text-gray-900 font-mono">
                      {selectedSeller.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              {selectedSeller.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      updateSellerStatus(selectedSeller.id, "active");
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve Seller
                  </button>
                  <button
                    onClick={() => {
                      updateSellerStatus(selectedSeller.id, "suspended");
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Suspend Seller
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
