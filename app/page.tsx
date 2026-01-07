import Link from 'next/link';
import Button from '@/components/Button';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to Our Nail Salon
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Experience premium nail care services with expert technicians in a relaxing atmosphere
            </p>
            <Link href="/booking">
              <Button className="text-lg px-8 py-3">
                Book Appointment Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">💅</div>
              <h3 className="text-xl font-semibold mb-2">Expert Technicians</h3>
              <p className="text-gray-600">
                Certified professionals with years of experience
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">Premium Products</h3>
              <p className="text-gray-600">
                High-quality, safe products for beautiful results
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Book your appointment online anytime, anywhere
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Manicure', 'Pedicure', 'Gel Nails', 'Nail Art'].map((service) => (
              <div key={service} className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold mb-2">{service}</h3>
                <p className="text-gray-600 mb-4">Professional {service.toLowerCase()} services</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/services">
              <Button variant="secondary">View All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Book your appointment today and treat yourself</p>
          <Link href="/register">
            <Button className="text-lg px-8 py-3">
              Create Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
