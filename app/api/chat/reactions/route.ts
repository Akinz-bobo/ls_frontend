import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, type } = body

    if (!messageId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userId = 'current-user-id' // TODO: Get from session

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const likedBy = message.likedBy ? JSON.parse(message.likedBy) : []
    const hasLiked = likedBy.includes(userId)

    let updatedLikedBy: string[]
    let updatedLikes: number

    if (hasLiked) {
      updatedLikedBy = likedBy.filter((id: string) => id !== userId)
      updatedLikes = Math.max(0, message.likes - 1)
    } else {
      updatedLikedBy = [...likedBy, userId]
      updatedLikes = message.likes + 1
    }

    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        likes: updatedLikes,
        likedBy: JSON.stringify(updatedLikedBy),
      },
    })

    return NextResponse.json({ message: updatedMessage })
  } catch (error) {
    console.error('Error updating reaction:', error)
    return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 })
  }
}
