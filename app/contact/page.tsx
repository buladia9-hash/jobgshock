import { Mail, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border shadow-sm p-8 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 mb-4">Contact Support</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Need help with your account or job applications?</h1>
          <p className="text-lg text-gray-600 leading-8 mb-10">
            Reach out and we will help with recruiter access, job postings, applications, resumes, or general platform issues.
          </p>

          <div className="grid gap-5">
            <a href="mailto:adeshinasegun82@gmail.com" className="flex items-center gap-4 rounded-2xl border p-5 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <Mail className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-gray-600">adeshinasegun82@gmail.com</p>
              </div>
            </a>
            <div className="flex items-center gap-4 rounded-2xl border p-5">
              <MapPin className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-semibold text-gray-900">Location</p>
                <p className="text-gray-600">Lagos, Nigeria</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
