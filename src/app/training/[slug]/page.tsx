import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function TrainingDetail({ params }: { params: { slug: string } }) {
  const plan = await prisma.trainingPlan.findUnique({
    where: { slug: params.slug },
    include: { workouts: { orderBy: [{ week: "asc" }, { dayOfWeek: "asc" }] } },
  });

  if (!plan) return notFound();

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{plan.title}</h1>
        <p className="text-sm text-gray-600">
          {plan.sport} • {plan.level} • {plan.weeks} weeks
        </p>
        <p className="mt-3">{plan.description}</p>
      </div>

      <div className="space-y-3">
        {plan.workouts.map((w) => (
          <div key={w.id} className="rounded-lg border p-3 bg-white">
            <div className="text-sm text-gray-500">Week {w.week}, Day {w.dayOfWeek + 1}</div>
            <div className="font-medium">{w.title}</div>
            <div className="text-sm text-gray-700">{w.details}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
