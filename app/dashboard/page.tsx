"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import Link from "next/link";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  service: {
    name: string;
    price: number;
    duration: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAppointments();
    }
  }, [session]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (response.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  if (status === "loading" || loading) {
    return <Loading />;
  }

  if (!session) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {session.user.name || session.user.email}
        </p>
      </div>

      <div className="mb-6">
        <Link href="/booking">
          <Button>Book New Appointment</Button>
        </Link>
      </div>

      <Card>
        <h2 className="text-2xl font-semibold mb-6">My Appointments</h2>

        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No appointments yet</p>
            <Link
              href="/booking"
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              Book your first appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {appointment.service.name}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {new Date(appointment.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-gray-600">
                      {appointment.startTime} - {appointment.endTime}
                    </p>
                    <p className="text-gray-600 font-semibold mt-1">
                      ${appointment.service.price}
                    </p>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 mt-2">
                        Notes: {appointment.notes}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                    {appointment.status === "PENDING" ||
                    appointment.status === "CONFIRMED" ? (
                      <Button
                        variant="danger"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="text-sm"
                      >
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
