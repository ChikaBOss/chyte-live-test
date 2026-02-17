export default function VendorPendingPage() {
    return (
      <section className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="bg-white p-8 rounded shadow max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Application Submitted ✅</h1>
          <p className="text-dark/80">
            Your vendor account is awaiting admin approval. You’ll be able to log in once approved.
          </p>
        </div>
      </section>
    );
  }