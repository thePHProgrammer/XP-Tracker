export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-neutral-100">
          XP Tracker
        </h1>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
