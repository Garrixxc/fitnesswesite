// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const dynamic = "force-dynamic";
export const { GET, POST } = handlers;
