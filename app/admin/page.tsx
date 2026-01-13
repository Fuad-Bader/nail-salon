"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Loading from "@/components/Loading";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  user: {
    name?: string;
    email: string;
    phone?: string;
  };
  service: {
    name: string;
    price: number;
    duration: number;
  };
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
}

interface Customer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    appointments: number;
  };
}

interface CustomerDetail extends Customer {
  appointments: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    notes: string | null;
    service: {
      name: string;
      price: number;
    };
  }[];
}

interface Staff {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  specialtyCategory: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    staffAppointments: number;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerDetail | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffFormData, setStaffFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialtyCategory: "",
  });
  const [staffError, setStaffError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "appointments" | "services" | "categories" | "customers" | "staff"
  >("appointments");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    category: "",
    isActive: true,
  });
  const [serviceError, setServiceError] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryFormData, setCategoryFormData] = useState("");
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchAppointments();
      fetchServices();
      fetchCategories();
      fetchCustomers();
      fetchStaff();
    }
  }, [session]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/admin/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchCustomerDetail = async (customerId: string) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCustomer(data);
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  const toggleCustomerStatus = async (
    customerId: string,
    isActive: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        fetchCustomers();
        if (selectedCustomer?.id === customerId) {
          fetchCustomerDetail(customerId);
        }
      }
    } catch (error) {
      console.error("Error updating customer status:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/admin/staff");
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleStaffFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError("");

    try {
      const url = editingStaff
        ? `/api/admin/staff/${editingStaff.id}`
        : "/api/admin/staff";
      const method = editingStaff ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(staffFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        setStaffError(data.error || "Failed to save staff member");
        return;
      }

      setShowStaffForm(false);
      setEditingStaff(null);
      setStaffFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        specialtyCategory: "",
      });
      fetchStaff();
    } catch (error) {
      setStaffError("An error occurred");
    }
  };

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setStaffFormData({
      name: staffMember.name || "",
      email: staffMember.email,
      password: "",
      phone: staffMember.phone || "",
      specialtyCategory: staffMember.specialtyCategory || "",
    });
    setShowStaffForm(true);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/staff/${staffId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete staff member");
        return;
      }

      fetchStaff();
    } catch (error) {
      alert("An error occurred");
    }
  };

  const toggleStaffStatus = async (staffId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/staff/${staffId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        fetchStaff();
      }
    } catch (error) {
      console.error("Error updating staff status:", error);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const handleServiceFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceError("");

    try {
      const url = editingService
        ? `/api/services/${editingService.id}`
        : "/api/services";
      const method = editingService ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...serviceFormData,
          duration: parseInt(serviceFormData.duration),
          price: parseFloat(serviceFormData.price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServiceError(data.error || "Failed to save service");
        return;
      }

      // Reset form and refresh services
      setShowServiceForm(false);
      setEditingService(null);
      setServiceFormData({
        name: "",
        description: "",
        duration: "",
        price: "",
        category: "",
        isActive: true,
      });
      fetchServices();
    } catch (error) {
      setServiceError("An error occurred. Please try again.");
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceFormData({
      name: service.name,
      description: service.description || "",
      duration: service.duration.toString(),
      price: service.price.toString(),
      category: service.category,
      isActive: service.isActive,
    });
    setShowServiceForm(true);
    setActiveTab("services");
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchServices();
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleCancelServiceForm = () => {
    setShowServiceForm(false);
    setEditingService(null);
    setServiceFormData({
      name: "",
      description: "",
      duration: "",
      price: "",
      category: "",
      isActive: true,
    });
    setServiceError("");
  };

  const handleCategoryFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError("");

    if (!categoryFormData.trim()) {
      setCategoryError("Category name is required");
      return;
    }

    try {
      const url = editingCategory
        ? `/api/categories/${encodeURIComponent(editingCategory)}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: categoryFormData.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCategoryError(data.error || "Failed to save category");
        return;
      }

      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryFormData("");
      fetchCategories();
      fetchServices(); // Refresh services to update categories
    } catch (error) {
      setCategoryError("An error occurred. Please try again.");
    }
  };

  const handleEditCategory = (category: string) => {
    setEditingCategory(category);
    setCategoryFormData(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (category: string) => {
    // Check if category is being used by any services
    const servicesUsingCategory = services.filter(
      (s) => s.category === category
    );

    if (servicesUsingCategory.length > 0) {
      alert(
        `Cannot delete category "${category}" because it is being used by ${servicesUsingCategory.length} service(s). Please reassign or delete those services first.`
      );
      return;
    }

    if (
      !confirm(`Are you sure you want to delete the category "${category}"?`)
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/categories/${encodeURIComponent(category)}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleCancelCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryFormData("");
    setCategoryError("");
  };

  if (status === "loading" || loading) {
    return <Loading />;
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "CANCELLED":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "COMPLETED":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) =>
      apt.status !== "CANCELLED" &&
      apt.status !== "COMPLETED" &&
      new Date(apt.date) >= new Date()
  );

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "PENDING").length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    upcoming: upcomingAppointments.length,
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage appointments and services
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Appointments
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            {stats.total}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            {stats.pending}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {stats.confirmed}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {stats.upcoming}
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "appointments"
                ? "border-pink-500 text-pink-600 dark:text-pink-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "services"
                ? "border-pink-500 text-pink-600 dark:text-pink-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "categories"
                ? "border-pink-500 text-pink-600 dark:text-pink-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "customers"
                ? "border-pink-500 text-pink-600 dark:text-pink-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "staff"
                ? "border-pink-500 text-pink-600 dark:text-pink-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            Staff
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "appointments" ? (
        <Card>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            All Appointments
          </h2>

          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No appointments yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {appointment.service.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Customer:{" "}
                            {appointment.user.name || appointment.user.email}
                          </p>
                          {appointment.user.phone && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Phone: {appointment.user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-gray-600 dark:text-gray-400">
                          {new Date(appointment.date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {appointment.startTime} - {appointment.endTime}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 font-semibold">
                          ${appointment.service.price}
                        </p>
                        {appointment.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Notes: {appointment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                      {appointment.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "CONFIRMED"
                              )
                            }
                            className="text-sm"
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "CANCELLED"
                              )
                            }
                            className="text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      {appointment.status === "CONFIRMED" && (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            updateAppointmentStatus(appointment.id, "COMPLETED")
                          }
                          className="text-sm"
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : activeTab === "services" ? (
        <>
          {showServiceForm ? (
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {editingService ? "Edit Service" : "Add New Service"}
                </h2>
                <Button variant="secondary" onClick={handleCancelServiceForm}>
                  Cancel
                </Button>
              </div>

              <form onSubmit={handleServiceFormSubmit}>
                {serviceError && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
                    {serviceError}
                  </div>
                )}

                <Input
                  label="Service Name *"
                  type="text"
                  value={serviceFormData.name}
                  onChange={(e) =>
                    setServiceFormData({
                      ...serviceFormData,
                      name: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g., Classic Manicure"
                />

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={serviceFormData.description}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Service description..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Duration (minutes) *"
                    type="number"
                    value={serviceFormData.duration}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        duration: e.target.value,
                      })
                    }
                    required
                    min="1"
                    placeholder="30"
                  />

                  <Input
                    label="Price ($) *"
                    type="number"
                    step="0.01"
                    value={serviceFormData.price}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        price: e.target.value,
                      })
                    }
                    required
                    min="0"
                    placeholder="25.00"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={serviceFormData.category}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        category: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={serviceFormData.isActive}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceFormData,
                          isActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-pink-600 border-gray-300 dark:border-gray-600 rounded focus:ring-pink-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Active (available for booking)
                    </span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    {editingService ? "Update Service" : "Add Service"}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Services
                </h2>
                <Button onClick={() => setShowServiceForm(true)}>
                  Add New Service
                </Button>
              </div>

              {services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No services available
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="mb-2">
                        <span className="inline-block px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 rounded-full text-sm font-medium">
                          {service.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {service.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700 mb-3">
                        <div>
                          <p className="text-xl font-bold text-pink-600 dark:text-pink-400">
                            ${service.price}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {service.duration} min
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            service.isActive
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEditService(service)}
                          className="flex-1 text-sm"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteService(service.id)}
                          className="flex-1 text-sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </>
      ) : activeTab === "categories" ? (
        <>
          {showCategoryForm ? (
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <Button variant="secondary" onClick={handleCancelCategoryForm}>
                  Cancel
                </Button>
              </div>

              <form onSubmit={handleCategoryFormSubmit}>
                {categoryError && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
                    {categoryError}
                  </div>
                )}

                <Input
                  label="Category Name *"
                  type="text"
                  value={categoryFormData}
                  onChange={(e) => setCategoryFormData(e.target.value)}
                  required
                  placeholder="e.g., Manicure"
                />

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    {editingCategory ? "Update Category" : "Add Category"}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Categories
                </h2>
                <Button onClick={() => setShowCategoryForm(true)}>
                  Add New Category
                </Button>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No categories available
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => {
                    const serviceCount = services.filter(
                      (s) => s.category === category
                    ).length;
                    return (
                      <div
                        key={category}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {category}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {serviceCount} service
                              {serviceCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleEditCategory(category)}
                            className="flex-1 text-sm"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteCategory(category)}
                            className="flex-1 text-sm"
                            disabled={serviceCount > 0}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </>
      ) : activeTab === "customers" ? (
        <>
          <Card>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Customer Management
            </h2>

            {customers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No customers found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Appointments
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {customers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {customer.name || "No name"}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Joined{" "}
                              {new Date(
                                customer.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {customer.email}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {customer.phone || "No phone"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {customer._count.appointments} bookings
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              customer.isActive
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                            }`}
                          >
                            {customer.isActive ? "Active" : "Banned"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => fetchCustomerDetail(customer.id)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant={customer.isActive ? "danger" : "primary"}
                            size="sm"
                            onClick={() =>
                              toggleCustomerStatus(
                                customer.id,
                                !customer.isActive
                              )
                            }
                          >
                            {customer.isActive ? "Ban" : "Unban"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Customer Detail Modal */}
          {selectedCustomer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCustomer.name || "No name"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Customer ID: {selectedCustomer.id}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Contact Information
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          <span className="font-medium">Email:</span>{" "}
                          {selectedCustomer.email}
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          <span className="font-medium">Phone:</span>{" "}
                          {selectedCustomer.phone || "Not provided"}
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          <span className="font-medium">Status:</span>{" "}
                          <span
                            className={
                              selectedCustomer.isActive
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }
                          >
                            {selectedCustomer.isActive ? "Active" : "Banned"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Account Details
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          <span className="font-medium">
                            Total Appointments:
                          </span>{" "}
                          {selectedCustomer.appointments.length}
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          <span className="font-medium">Member Since:</span>{" "}
                          {new Date(
                            selectedCustomer.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Appointment History
                    </h4>
                    {selectedCustomer.appointments.length === 0 ? (
                      <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                        No appointments found
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedCustomer.appointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                  {appointment.service.name}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {new Date(
                                    appointment.date
                                  ).toLocaleDateString()}{" "}
                                  at {appointment.startTime}
                                </p>
                                {appointment.notes && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Notes: {appointment.notes}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    appointment.status === "CONFIRMED"
                                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                      : appointment.status === "PENDING"
                                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                      : appointment.status === "COMPLETED"
                                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                      : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                  }`}
                                >
                                  {appointment.status}
                                </span>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-2">
                                  ${appointment.service.price}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      Close
                    </Button>
                    <Button
                      variant={selectedCustomer.isActive ? "danger" : "primary"}
                      onClick={() => {
                        toggleCustomerStatus(
                          selectedCustomer.id,
                          !selectedCustomer.isActive
                        );
                        setSelectedCustomer(null);
                      }}
                    >
                      {selectedCustomer.isActive
                        ? "Ban Customer"
                        : "Unban Customer"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : activeTab === "staff" ? (
        <>
          {showStaffForm ? (
            <Card>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
              </h2>

              {staffError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
                  {staffError}
                </div>
              )}

              <form onSubmit={handleStaffFormSubmit}>
                <div className="space-y-4">
                  <Input
                    label="Name *"
                    type="text"
                    value={staffFormData.name}
                    onChange={(e) =>
                      setStaffFormData({
                        ...staffFormData,
                        name: e.target.value,
                      })
                    }
                    required
                  />

                  <Input
                    label="Email *"
                    type="email"
                    value={staffFormData.email}
                    onChange={(e) =>
                      setStaffFormData({
                        ...staffFormData,
                        email: e.target.value,
                      })
                    }
                    required
                    disabled={!!editingStaff}
                  />

                  {!editingStaff && (
                    <Input
                      label="Password *"
                      type="password"
                      value={staffFormData.password}
                      onChange={(e) =>
                        setStaffFormData({
                          ...staffFormData,
                          password: e.target.value,
                        })
                      }
                      required={!editingStaff}
                    />
                  )}

                  <Input
                    label="Phone"
                    type="tel"
                    value={staffFormData.phone}
                    onChange={(e) =>
                      setStaffFormData({
                        ...staffFormData,
                        phone: e.target.value,
                      })
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Specialty Category *
                    </label>
                    <select
                      value={staffFormData.specialtyCategory}
                      onChange={(e) =>
                        setStaffFormData({
                          ...staffFormData,
                          specialtyCategory: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowStaffForm(false);
                        setEditingStaff(null);
                        setStaffFormData({
                          name: "",
                          email: "",
                          password: "",
                          phone: "",
                          specialtyCategory: "",
                        });
                        setStaffError("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editingStaff ? "Update" : "Add"} Staff Member
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          ) : (
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Staff Management
                </h2>
                <Button onClick={() => setShowStaffForm(true)}>
                  Add New Staff Member
                </Button>
              </div>

              {staff.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No staff members found
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Specialty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Appointments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {staff.map((member) => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {member.name || "No name"}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Since{" "}
                                {new Date(
                                  member.createdAt
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {member.email}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {member.phone || "No phone"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                              {member.specialtyCategory}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {member._count.staffAppointments}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                member.isActive
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                              }`}
                            >
                              {member.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEditStaff(member)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant={member.isActive ? "danger" : "primary"}
                              size="sm"
                              onClick={() =>
                                toggleStaffStatus(member.id, !member.isActive)
                              }
                            >
                              {member.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteStaff(member.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
