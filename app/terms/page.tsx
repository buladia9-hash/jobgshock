export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border shadow-sm p-8 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 mb-4">Terms of Service</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Platform use guidelines.</h1>
          <div className="space-y-6 text-gray-600 leading-8">
            <p>By using JobPortal, you agree to provide accurate account information and use the platform for legitimate hiring and job search activity.</p>
            <p>Recruiters are responsible for the accuracy of posted roles, and job seekers are responsible for the truthfulness of submitted applications and resumes.</p>
            <p>We may restrict access to accounts that abuse the platform, post misleading content, or interfere with normal use of the service.</p>
            <p>These terms may be updated as the platform evolves. Continued use of the service means you accept the current version.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
