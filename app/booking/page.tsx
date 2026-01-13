"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Loading from "@/components/Loading";

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
}

export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    serviceId: "",
    date: "",
    startTime: "",
    staffId: "",
    notes: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStaff = async () => {
    const selectedService = services.find((s) => s.id === formData.serviceId);
    if (!selectedService || !formData.date || !formData.startTime) {
      setAvailableStaff([]);
      return;
    }

    const endTime = calculateEndTime(
      formData.startTime,
      selectedService.duration
    );

    try {
      const response = await fetch(
        `/api/staff/available?category=${encodeURIComponent(
          selectedService.category
        )}&date=${formData.date}&startTime=${
          formData.startTime
        }&endTime=${endTime}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableStaff(data);
        // Reset staffId if current selection is no longer available
        if (
          formData.staffId &&
          !data.some((s: Staff) => s.id === formData.staffId)
        ) {
          setFormData((prev) => ({ ...prev, staffId: "" }));
        }
      }
    } catch (error) {
      console.error("Error fetching available staff:", error);
      setAvailableStaff([]);
    }
  };

  useEffect(() => {
    if (formData.serviceId && formData.date && formData.startTime) {
      fetchAvailableStaff();
    } else {
      setAvailableStaff([]);
    }
  }, [formData.serviceId, formData.date, formData.startTime]);

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const selectedService = services.find((s) => s.id === formData.serviceId);
    if (!selectedService) {
      setError("Please select a service");
      setSubmitting(false);
      return;
    }

    const endTime = calculateEndTime(
      formData.startTime,
      selectedService.duration
    );

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          date: formData.date,
          startTime: formData.startTime,
          endTime,
          staffId: formData.staffId || null,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to book appointment");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <Loading />;
  }

  if (!session) {
    return null;
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Book Appointment
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Schedule your nail service
        </p>
      </div>

      {success ? (
        <Card>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              Appointment Booked!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to your dashboard...
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Service *
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) =>
                  setFormData({ ...formData, serviceId: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
              >
                <option value="">Choose a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price} ({service.duration} min)
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Date *"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              min={today}
            />

            <Input
              label="Time *"
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              required
            />

            {availableStaff.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Staff Member (Optional)
                </label>
                <select
                  value={formData.staffId}
                  onChange={(e) =>
                    setFormData({ ...formData, staffId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                >
                  <option value="">Any available staff</option>
                  {availableStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {availableStaff.length} staff member(s) available for this
                  time slot
                </p>
              </div>
            )}

            {formData.serviceId &&
              formData.date &&
              formData.startTime &&
              availableStaff.length === 0 && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
                  No staff available for this time slot. Please choose a
                  different time.
                </div>
              )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                placeholder="Any special requests or preferences..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Booking..." : "Book Appointment"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
