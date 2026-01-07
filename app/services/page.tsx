"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Loading from "@/components/Loading";

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  if (loading) {
    return <Loading />;
  }

  const categories = [
    "all",
    ...Array.from(new Set(services.map((s) => s.category))),
  ];
  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Our Services</h1>
        <p className="mt-4 text-lg text-gray-600">
          Professional nail care services tailored to your needs
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === category
                ? "bg-pink-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No services available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                  {service.category}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {service.name}
              </h3>
              {service.description && (
                <p className="text-gray-600 mb-4">{service.description}</p>
              )}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-2xl font-bold text-pink-600">
                    ${service.price}
                  </p>
                  <p className="text-sm text-gray-500">
                    {service.duration} min
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
