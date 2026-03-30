export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border shadow-sm p-8 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 mb-4">Terms of Service</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms governing use of JobPortal</h1>
          <p className="text-gray-500 mb-8">Effective date: March 30, 2026</p>

          <div className="space-y-8 text-gray-600 leading-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Acceptance of terms</h2>
              <p>
                By accessing or using JobPortal, you agree to use the platform in accordance with these terms and with all applicable
                laws and regulations. If you do not agree with these terms, you should discontinue use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Account responsibilities</h2>
              <p>
                Users are responsible for maintaining accurate account information, protecting account access credentials, and ensuring
                that activity performed through their account is authorized and appropriate. Employers and candidates must provide
                current, truthful, and non-misleading information when using the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Acceptable use</h2>
              <p>
                JobPortal may be used only for legitimate recruitment, hiring, and job search purposes. Users must not submit false
                application materials, publish deceptive or unlawful listings, interfere with platform operations, attempt unauthorized
                access, or use the service in a way that is abusive, harmful, or misleading.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Content and platform administration</h2>
              <p>
                JobPortal may review, restrict, remove, or suspend content or account access where necessary to protect platform
                integrity, investigate misuse, respond to complaints, enforce operational standards, or satisfy legal, compliance, and
                security requirements. We may also improve, modify, or discontinue parts of the service as the platform evolves.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Changes to these terms</h2>
              <p>
                These terms may be updated from time to time. Continued use of the platform after an updated version becomes effective
                constitutes acceptance of the revised terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
