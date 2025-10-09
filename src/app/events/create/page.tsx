import EventCreateForm from "./partials/event-form";

export const metadata = { title: "Create Event" };

export default function CreateEventPage() {
  return (
    <main className="min-h-screen bg-[rgb(var(--brand-surface))]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-extrabold text-white">Create Event</h1>
        <p className="mt-1 text-white/70 text-sm">Fill the details and publish. Price is in ₹.</p>
        <div className="mt-6">
          <EventCreateForm />
        </div>
      </div>
    </main>
  );
}
