import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

type Props = {
  id: string;
  slug: string;
  title: string;
  location: string;
  startDate: string | Date;
  coverImage?: string | null;
  price: number | null;
  currency: string;
};

const FALLBACK = "/placeholder.jpg"; // in /public

export default function EventCard({
  slug,
  title,
  location,
  startDate,
  coverImage,
  price,
  currency,
}: Props) {
  const date = new Date(startDate);
  const img = coverImage || FALLBACK;

  return (
    <li className="rounded-xl border bg-white shadow-sm">
      <Link href={`/events/${slug}`} className="block">
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gray-100">
          <Image
            src={img}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            priority={false}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-600">
            {isNaN(date.getTime()) ? "TBA" : date.toDateString()} • {location}
          </p>
          <p className="mt-2 text-sm text-gray-800">
            {price != null ? formatMoney(price, currency) : "Free"}
          </p>
          <span className="mt-3 inline-block text-sm underline">Details →</span>
        </div>
      </Link>
    </li>
  );
}
