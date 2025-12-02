import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";
import { sendResetPasswordEmail } from "@/lib/email/resetPasswordEmaIl";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.emailVerified) {
      // Always respond the same to prevent email enumeration
      return NextResponse.json({
        message: "If this email exists, a reset link has been sent.",
      });
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 mins

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: expires,
      },
    });

    await sendResetPasswordEmail(email, token);

    return NextResponse.json({
      message: "If this email exists, a reset link has been sent.",
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
