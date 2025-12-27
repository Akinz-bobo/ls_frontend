import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Find the current live broadcast
    const liveBroadcast = await prisma.liveBroadcast.findFirst({
      where: { 
        status: "LIVE" 
      },
      include: {
        hostUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        program: {
          select: {
            id: true,
            title: true,
            description: true,
            genre: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (!liveBroadcast) {
      return NextResponse.json({ 
        isLive: false, 
        message: "No live broadcast available" 
      });
    }

    return NextResponse.json({
      isLive: true,
      id: liveBroadcast.id,
      title: liveBroadcast.title,
      description: liveBroadcast.description,
      status: liveBroadcast.status,
      streamUrl: liveBroadcast.streamUrl,
      liveKitUrl: liveBroadcast.liveKitUrl,
      hostUser: liveBroadcast.hostUser,
      program: liveBroadcast.program,
      startTime: liveBroadcast.startTime,
      updatedAt: liveBroadcast.updatedAt
    });
  } catch (error) {
    console.error("Get current broadcast error:", error);
    return NextResponse.json(
      { error: "Failed to fetch current broadcast" },
      { status: 500 }
    );
  }
}