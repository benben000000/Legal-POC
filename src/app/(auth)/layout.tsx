export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mb-1">
          Philippine Practice Cloud
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Legal Demo
        </h2>
        <p className="text-sm text-slate-500">
          Streamlined practice management for modern law offices
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 sm:rounded-xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
