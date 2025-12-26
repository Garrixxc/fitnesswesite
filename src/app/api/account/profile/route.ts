import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            name,
            phone,
            city,
            state,
            country,
            gender,
            tshirtSize,
            bloodGroup,
            dob,
            emergencyName,
            emergencyPhone,
            medicalNotes,
        } = body;

        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name,
                phone,
                city,
                state,
                country,
                gender,
                tshirtSize,
                bloodGroup,
                dob: dob ? new Date(dob) : null,
                emergencyName,
                emergencyPhone,
                medicalNotes,
            },
        });

        revalidatePath("/profile");
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
