export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-blue-400">
            AI-Powered Road Intelligence
          </p>

          <h1 className="text-6xl font-bold tracking-tight">
            RoadScan
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Detect road defects, assess their severity, map their location,
            and prioritize repairs through one intelligent platform.
          </p>

          <div className="mt-10 flex gap-4">
            <button className="rounded-lg bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500">
              Inspect Road
            </button>

            <button className="rounded-lg border border-slate-700 px-6 py-3 font-medium text-slate-300 transition hover:bg-slate-900">
              View Dashboard
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}