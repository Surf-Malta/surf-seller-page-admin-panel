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
  Building,
  User,
  Package,
  Globe,
  CreditCard,
  Crown,
  UserPlus,
} from "lucide-react";

interface SellerData {
  id: string;
  // Step 1 - Business Information
  businessName: string;
  vatType: "individual" | "business";
  vatNumber?: string;
  hearAboutSurf: string;
  referredBy?: string; // NEW FIELD

  // Step 2 - Contact & Pickup Address
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  pincode: string;
  country: string;

  // Step 3 - Shipping Preferences
  shippingMethod: "own" | "integrated";
  shippingType?: "fixed_rate" | "free_delivery";
  deliveryTime?: "1-2_days" | "2-3_days" | "3-4_days";

  // Step 4 - Pricing Plan Selection
  pricingPlan?: "starter" | "growth" | "enterprise";

  // Step 5 - Visibility & Ads
  showAdsOnWebsite: boolean;

  // System fields
  status: "pending" | "active" | "suspended";
  createdAt: string;
  updatedAt: string;

  // Additional fields from your data
  emailVerified?: boolean;
  vatVerified?: boolean;
  vatCompanyInfo?: any;
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
      await set(
        ref(realtimeDb, `sellers/${sellerId}/updatedAt`),
        new Date().toISOString()
      );
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
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      seller.firstName?.toLowerCase().includes(searchLower) ||
      seller.lastName?.toLowerCase().includes(searchLower) ||
      seller.businessName?.toLowerCase().includes(searchLower) ||
      seller.email?.toLowerCase().includes(searchLower) ||
      seller.referredBy?.toLowerCase().includes(searchLower);

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

  const getVatTypeIcon = (vatType: string) => {
    return vatType === "business" ? (
      <Building className="w-4 h-4" />
    ) : (
      <User className="w-4 h-4" />
    );
  };

  const getShippingMethodLabel = (method: string) => {
    switch (method) {
      case "own":
        return "Own Shipping";
      case "integrated":
        return "Integrated Partner";
      default:
        return method;
    }
  };

  const getShippingTypeLabel = (type?: string) => {
    switch (type) {
      case "fixed_rate":
        return "Fixed Rate";
      case "free_delivery":
        return "Free Delivery";
      default:
        return "Not specified";
    }
  };

  const getDeliveryTimeLabel = (time?: string) => {
    switch (time) {
      case "1-2_days":
        return "1-2 days";
      case "2-3_days":
        return "2-3 days";
      case "3-4_days":
        return "3-4 days";
      default:
        return "Not specified";
    }
  };

  const getPricingPlanLabel = (plan?: string) => {
    switch (plan) {
      case "starter":
        return "Starter Plan";
      case "growth":
        return "Growth Plan";
      case "enterprise":
        return "Enterprise Plan";
      default:
        return "Not specified";
    }
  };

  const getPricingPlanColor = (plan?: string) => {
    switch (plan) {
      case "starter":
        return "bg-blue-100 text-blue-800";
      case "growth":
        return "bg-green-100 text-green-800";
      case "enterprise":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPricingPlanIcon = (plan?: string) => {
    switch (plan) {
      case "starter":
        return <CreditCard className="w-4 h-4" />;
      case "growth":
        return <Crown className="w-4 h-4" />;
      case "enterprise":
        return <Crown className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getHearAboutLabel = (source: string) => {
    const labels = {
      google_search: "Google Search",
      social_media: "Social Media",
      referral: "Referral",
      online_ad: "Online Advertisement",
      local_news: "Local News/Media",
      business_network: "Business Network",
      black_friday_campaign: "Black Friday Campaign",
      other: "Other",
    };
    return labels[source as keyof typeof labels] || source;
  };

  const exportData = () => {
    const csvContent = [
      // Header
      "ID,Business Name,Contact Name,Email,Phone,VAT Type,VAT Number,City,Country,Shipping Method,Pricing Plan,Status,Ads Enabled,Hear About,Referred By,Created At",
      // Data rows
      ...filteredSellers.map(
        (seller) =>
          `${seller.id},"${seller.businessName || "No Business Name"}","${
            seller.firstName || ""
          } ${seller.lastName || ""}","${seller.email || ""}","${
            seller.phoneNumber || ""
          }","${seller.vatType || "individual"}","${seller.vatNumber || ""}","${
            seller.city || ""
          }","${seller.country || ""}","${getShippingMethodLabel(
            seller.shippingMethod || "integrated"
          )}","${getPricingPlanLabel(seller.pricingPlan)}","${
            seller.status || "pending"
          }","${seller.showAdsOnWebsite ? "Yes" : "No"}","${getHearAboutLabel(
            seller.hearAboutSurf || ""
          )}","${seller.referredBy || "N/A"}","${seller.createdAt || ""}"`
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
    withAds: sellers.filter((s) => s.showAdsOnWebsite).length,
    businesses: sellers.filter((s) => s.vatType === "business").length,
    starter: sellers.filter((s) => s.pricingPlan === "starter").length,
    growth: sellers.filter((s) => s.pricingPlan === "growth").length,
    enterprise: sellers.filter((s) => s.pricingPlan === "enterprise").length,
    referrals: sellers.filter(
      (s) => s.hearAboutSurf === "referral" && s.referredBy
    ).length,
    blackFriday: sellers.filter(
      (s) => s.hearAboutSurf === "black_friday_campaign"
    ).length,
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

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Referrals</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.referrals}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <Globe className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Black Friday</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.blackFriday}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plan Stats */}
      {(stats.starter > 0 || stats.growth > 0 || stats.enterprise > 0) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pricing Plans Distribution
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">Starter</span>
              </div>
              <span className="text-2xl font-bold text-blue-700">
                {stats.starter}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Crown className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-900">Growth</span>
              </div>
              <span className="text-2xl font-bold text-green-700">
                {stats.growth}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Crown className="w-5 h-5 text-purple-600 mr-2" />
                <span className="font-medium text-purple-900">Enterprise</span>
              </div>
              <span className="text-2xl font-bold text-purple-700">
                {stats.enterprise}
              </span>
            </div>
          </div>
        </div>
      )}

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
                    Business & Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VAT Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan & Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                          {seller.businessName?.charAt(0) ||
                            seller.firstName?.charAt(0) ||
                            "?"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {seller.businessName ||
                              `${seller.firstName} ${seller.lastName}` ||
                              "No Name"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {seller.firstName} {seller.lastName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {seller.email || "No Email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        {getVatTypeIcon(seller.vatType || "individual")}
                        <span className="ml-1 capitalize">
                          {seller.vatType || "individual"}
                        </span>
                      </div>
                      {seller.vatNumber && (
                        <div className="text-xs text-gray-500 mt-1">
                          VAT: {seller.vatNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {seller.city || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {seller.country || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {seller.pricingPlan && (
                        <div className="mb-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPricingPlanColor(
                              seller.pricingPlan
                            )}`}
                          >
                            {getPricingPlanIcon(seller.pricingPlan)}
                            <span className="ml-1">
                              {getPricingPlanLabel(seller.pricingPlan)}
                            </span>
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-gray-600">
                        {getHearAboutLabel(seller.hearAboutSurf || "")}
                      </div>
                      {seller.hearAboutSurf === "referral" &&
                        seller.referredBy && (
                          <div className="flex items-center text-xs text-purple-600 mt-1">
                            <UserPlus className="w-3 h-3 mr-1" />
                            {seller.referredBy}
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            seller.status
                          )}`}
                        >
                          {getStatusIcon(seller.status)}
                          <span className="ml-1 capitalize">
                            {seller.status}
                          </span>
                        </span>
                        {seller.showAdsOnWebsite && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                            <Globe className="w-3 h-3 mr-1" />
                            Ads On
                          </span>
                        )}
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

      {/* Enhanced Seller Details Modal */}
      {showDetails && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedSeller.businessName?.charAt(0) ||
                      selectedSeller.firstName?.charAt(0) ||
                      "?"}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedSeller.businessName ||
                        `${selectedSeller.firstName} ${selectedSeller.lastName}` ||
                        "No Name"}
                    </h2>
                    <p className="text-gray-600">
                      {selectedSeller.firstName} {selectedSeller.lastName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Business Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Business Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-blue-700">
                        Business Name
                      </label>
                      <p className="text-blue-900">
                        {selectedSeller.businessName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">
                        VAT Type
                      </label>
                      <div className="flex items-center">
                        {getVatTypeIcon(selectedSeller.vatType || "individual")}
                        <span className="ml-2 capitalize text-blue-900">
                          {selectedSeller.vatType || "individual"}
                        </span>
                      </div>
                    </div>
                    {selectedSeller.vatNumber && (
                      <div>
                        <label className="text-sm font-medium text-blue-700">
                          VAT Number
                        </label>
                        <p className="text-blue-900 font-mono">
                          {selectedSeller.vatNumber}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-blue-700">
                        How they heard about us
                      </label>
                      <p className="text-blue-900">
                        {getHearAboutLabel(selectedSeller.hearAboutSurf || "")}
                      </p>
                    </div>
                    {/* REFERRAL INFORMATION SECTION */}
                    {selectedSeller.hearAboutSurf === "referral" &&
                      selectedSeller.referredBy && (
                        <div className="bg-purple-100 border-2 border-purple-300 p-4 rounded-lg mt-3">
                          <label className="text-sm font-medium text-purple-700 flex items-center">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Referred By
                          </label>
                          <p className="text-purple-900 font-semibold text-lg mt-1">
                            {selectedSeller.referredBy}
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            💡 This seller came through a referral
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-green-700">
                        Full Name
                      </label>
                      <p className="text-green-900">
                        {selectedSeller.firstName || ""}{" "}
                        {selectedSeller.lastName || ""}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-700">
                        Email
                      </label>
                      <p className="text-green-900 flex items-center">
                        {selectedSeller.email || "Not provided"}
                        {selectedSeller.emailVerified && (
                          <CheckCircle
                            className="w-4 h-4 ml-2 text-green-600"
                            title="Email Verified"
                          />
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-700">
                        Phone
                      </label>
                      <p className="text-green-900 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {selectedSeller.phoneNumber || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address & Shipping */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Pickup Address
                  </h3>
                  <div className="space-y-2">
                    <p className="text-purple-900">
                      {selectedSeller.address || "Not provided"}
                    </p>
                    <p className="text-purple-900">
                      {selectedSeller.city || "N/A"},{" "}
                      {selectedSeller.pincode || "N/A"}
                    </p>
                    <p className="text-purple-900 font-medium">
                      {selectedSeller.country || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-orange-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Shipping Preferences
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-orange-700">
                        Shipping Method
                      </label>
                      <p className="text-orange-900">
                        {getShippingMethodLabel(
                          selectedSeller.shippingMethod || "integrated"
                        )}
                      </p>
                    </div>
                    {selectedSeller.shippingMethod === "integrated" && (
                      <>
                        {selectedSeller.shippingType && (
                          <div>
                            <label className="text-sm font-medium text-orange-700">
                              Shipping Type
                            </label>
                            <p className="text-orange-900">
                              {getShippingTypeLabel(
                                selectedSeller.shippingType
                              )}
                            </p>
                          </div>
                        )}
                        {selectedSeller.deliveryTime && (
                          <div>
                            <label className="text-sm font-medium text-orange-700">
                              Delivery Time
                            </label>
                            <p className="text-orange-900">
                              {getDeliveryTimeLabel(
                                selectedSeller.deliveryTime
                              )}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing Plan & Marketing */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pricing Plan Section */}
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-yellow-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pricing Plan
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-yellow-700">
                        Selected Plan
                      </label>
                      {selectedSeller.pricingPlan ? (
                        <div className="flex items-center mt-1">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPricingPlanColor(
                              selectedSeller.pricingPlan
                            )}`}
                          >
                            {getPricingPlanIcon(selectedSeller.pricingPlan)}
                            <span className="ml-1">
                              {getPricingPlanLabel(selectedSeller.pricingPlan)}
                            </span>
                          </span>
                        </div>
                      ) : (
                        <p className="text-yellow-900 mt-1">Not specified</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-indigo-900 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Marketing Preferences
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-indigo-700">
                        Website Advertising
                      </label>
                      <div className="flex items-center mt-1">
                        {selectedSeller.showAdsOnWebsite ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Verification Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Account Status
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Current Status
                      </label>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selectedSeller.status
                        )}`}
                      >
                        {getStatusIcon(selectedSeller.status)}
                        <span className="ml-1 capitalize">
                          {selectedSeller.status}
                        </span>
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Registration Date
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(selectedSeller.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {selectedSeller.updatedAt &&
                      selectedSeller.updatedAt !== selectedSeller.createdAt && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Last Updated
                          </label>
                          <p className="text-gray-900">
                            {new Date(
                              selectedSeller.updatedAt
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-emerald-900 mb-4">
                    Verification Status
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-emerald-700">
                        Email Verification
                      </label>
                      <div className="flex items-center mt-1">
                        {selectedSeller.emailVerified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Not Verified
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedSeller.vatNumber && (
                      <div>
                        <label className="text-sm font-medium text-emerald-700">
                          VAT Verification
                        </label>
                        <div className="flex items-center mt-1">
                          {selectedSeller.vatVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-slate-900 mb-4">
                  System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Seller ID
                    </label>
                    <p className="text-slate-900 font-mono text-sm">
                      {selectedSeller.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Database Path
                    </label>
                    <p className="text-slate-900 font-mono text-sm">
                      sellers/{selectedSeller.id}
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
