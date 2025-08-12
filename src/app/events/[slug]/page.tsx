import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatMoney } from "@/lib/money";

export default async function EventDetail({
  params,
}: { params: { slug: string } }) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: { organizer: { select: { name: true } } },
  });

  if (!event) return notFound();

  const price = event.price
    ? formatMoney(event.price, event.currency)
    : "Free";

  return (
    <div className="mx-auto max-w-4xl px-4 pb-12">
      {event.coverImage && (
        <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-100">
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      <h1 className="mb-2 text-3xl font-bold">{event.title}</h1>
      <p className="mb-1 text-gray-700">
        {new Date(event.startDate).toDateString()} • {event.location}
      </p>
      <p className="mb-4 text-gray-700">Price: {price}</p>
      <p className="whitespace-pre-wrap text-gray-800">{event.description}</p>
    </div>
  );
}
