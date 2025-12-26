export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[rgb(var(--brand-surface))] px-6 py-12 text-white">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight">About FitnessHub</h1>
                <p className="mt-4 text-lg text-white/70">
                    FitnessHub is India’s premier platform for discovering and registering for endurance sports events.
                    Whether you are a runner, cyclist, swimmer, or triathlete, we are here to power your race season.
                </p>
                <div className="mt-8 space-y-6 text-white/80">
                    <p>
                        Our mission is to make event discovery seamless and registration effortless.
                        We partner with top organizers across the country to bring you the best events,
                        verified and ready for you to conquer.
                    </p>
                    <p>
                        Founded in 2024, we are built by athletes, for athletes.
                    </p>
                </div>
            </div>
        </main>
    );
}
