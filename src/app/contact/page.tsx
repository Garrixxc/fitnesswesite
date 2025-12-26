export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[rgb(var(--brand-surface))] px-6 py-12 text-white">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
                <p className="mt-4 text-lg text-white/70">
                    Have questions about an event or need support with your registration?
                </p>

                <div className="mt-10 grid gap-8 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <h3 className="text-xl font-semibold">Support</h3>
                        <p className="mt-2 text-white/60">
                            For registration issues, refunds, or technical support.
                        </p>
                        <a href="mailto:support@fitnesshub.in" className="mt-4 inline-block text-primary hover:text-primary-foreground">
                            support@fitnesshub.in
                        </a>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <h3 className="text-xl font-semibold">Organizers</h3>
                        <p className="mt-2 text-white/60">
                            Want to list your event on FitnessHub? Reach out to our partnerships team.
                        </p>
                        <a href="mailto:partners@fitnesshub.in" className="mt-4 inline-block text-primary hover:text-primary-foreground">
                            partners@fitnesshub.in
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
