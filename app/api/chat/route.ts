import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const broadcastId = searchParams.get('broadcastId')

    if (!broadcastId) {
      return NextResponse.json({ error: 'Broadcast ID required' }, { status: 400 })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { broadcastId },
      orderBy: { timestamp: 'asc' },
      take: 100,
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { broadcastId, message, messageType = 'user', replyTo, userAvatar } = body

    if (!broadcastId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user from session (simplified - you should use proper auth)
    const userId = 'current-user-id' // TODO: Get from session
    const username = 'Host' // TODO: Get from session

    const chatMessage = await prisma.chatMessage.create({
      data: {
        broadcastId,
        userId,
        username,
        userAvatar,
        content: message,
        messageType,
        replyTo,
        timestamp: new Date(),
        likes: 0,
        isPinned: false,
        isHighlighted: messageType === 'announcement',
        isModerated: false,
      },
    })

    return NextResponse.json(chatMessage)
  } catch (error) {
    console.error('Error creating chat message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
