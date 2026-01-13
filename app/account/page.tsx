"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Loading from "@/components/Loading";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
}

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "history"
  >("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setPhone(session.user.phone || "");
    }
  }, [session]);

  useEffect(() => {
    if (activeTab === "history" && session?.user?.id) {
      fetchAppointments();
    }
  }, [activeTab, session]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(
        `/api/appointments?userId=${session?.user?.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        // Update the session with new data
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.name,
            email: data.email,
            phone: data.phone,
          },
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to update profile",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to change password",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Appointment cancelled successfully",
        });
        fetchAppointments();
      } else {
        const data = await response.json();
        setMessage({
          type: "error",
          text: data.error || "Failed to cancel appointment",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    }
  };

  if (status === "loading") {
    return <Loading />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        My Account
      </h1>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "profile"
              ? "border-b-2 border-pink-500 text-pink-600 dark:text-pink-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "password"
              ? "border-b-2 border-pink-500 text-pink-600 dark:text-pink-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Password
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "history"
              ? "border-b-2 border-pink-500 text-pink-600 dark:text-pink-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Appointment History
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
              : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Profile Information
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Change Password
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </Card>
      )}

      {/* Appointment History Tab */}
      {activeTab === "history" && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Appointment History
          </h2>
          {appointments.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No appointments found.
            </p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {appointment.service.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(appointment.date).toLocaleDateString()} at{" "}
                        {appointment.startTime}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === "CONFIRMED"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                          : appointment.status === "PENDING"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                          : appointment.status === "COMPLETED"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <p>Duration: {appointment.service.duration} minutes</p>
                    <p>Price: ${appointment.service.price}</p>
                    {appointment.notes && <p>Notes: {appointment.notes}</p>}
                  </div>
                  {(appointment.status === "PENDING" ||
                    appointment.status === "CONFIRMED") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Cancel Appointment
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
