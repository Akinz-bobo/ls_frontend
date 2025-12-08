import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, action, reason } = body

    if (!messageId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let updateData: any = {}

    switch (action) {
      case 'delete':
        updateData = { isModerated: true, moderationReason: reason }
        break
      case 'pin':
        const currentMessage = await prisma.chatMessage.findUnique({ where: { id: messageId } })
        updateData = { isPinned: !currentMessage?.isPinned }
        break
      case 'highlight':
        updateData = { isHighlighted: true }
        break
      case 'hide':
        updateData = { isModerated: true }
        break
    }

    const message = await prisma.chatMessage.update({
      where: { id: messageId },
      data: updateData,
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error moderating message:', error)
    return NextResponse.json({ error: 'Failed to moderate message' }, { status: 500 })
  }
}
