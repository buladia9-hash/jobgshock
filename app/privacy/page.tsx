export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border shadow-sm p-8 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 mb-4">Privacy Policy</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy and information handling</h1>
          <p className="text-gray-500 mb-8">Effective date: March 30, 2026</p>

          <div className="space-y-8 text-gray-600 leading-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Information we collect</h2>
              <p>
                JobPortal collects the information reasonably required to create and manage user accounts, publish job listings,
                review applications, support communication between employers and candidates, and provide operational assistance.
                This may include profile information, resumes, company details, job posting data, and service activity records.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">How information is used</h2>
              <p>
                Information is used to operate the platform, facilitate recruitment activity, improve service performance, maintain
                account security, respond to support requests, and fulfill reasonable administrative, legal, and compliance obligations
                connected to the JobPortal service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Disclosure and access</h2>
              <p>
                We do not sell personal information. Data is shared only where necessary to deliver platform functionality, enable
                legitimate recruiter and candidate interactions, support approved infrastructure services, or comply with applicable
                legal, security, or regulatory requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Storage, retention, and security</h2>
              <p>
                Information is retained for as long as reasonably necessary to support active accounts, preserve hiring records,
                investigate platform issues, maintain security, and satisfy relevant legal obligations. We apply reasonable technical
                and organizational safeguards designed to reduce unauthorized access, misuse, or disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Privacy inquiries</h2>
              <p>
                Questions regarding privacy, account records, or data handling may be directed through the JobPortal contact page or by
                email to support. We review legitimate requests in line with operational, security, and legal requirements.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
