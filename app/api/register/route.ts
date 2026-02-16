import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please provide valid registration details." },
        { status: 400 }
      );
    }

    const exists = await db.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (exists) {
      return NextResponse.json(
        { message: "This email is already registered." },
        { status: 409 }
      );
    }

    const password = await hash(parsed.data.password, 10);

    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password,
        subscription: {
          create: {
            tier: "Free Member",
            active: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Unexpected error while creating account." },
      { status: 500 }
    );
  }
}
