export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border shadow-sm p-8 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 mb-4">Privacy Policy</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">How we handle your information.</h1>
          <div className="space-y-6 text-gray-600 leading-8">
            <p>We collect the information needed to create accounts, manage applications, and support communication between recruiters and job seekers.</p>
            <p>Profile details, job postings, uploaded resumes, and application activity are stored only to operate the platform and improve the hiring experience.</p>
            <p>We do not sell your personal information. Access to account data is limited to platform functionality, support, and security needs.</p>
            <p>If you need help with your data or want an account-related issue reviewed, contact support through the contact page.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
