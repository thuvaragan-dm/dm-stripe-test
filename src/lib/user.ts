import { prisma } from './prisma'

export const HARDCODED_USER = {
  id: 'user_123',
  email: 'demo@example.com',
  name: 'Demo User',
}

export async function getOrCreateHardcodedUser() {
  let user = await prisma.user.findUnique({ where: { id: HARDCODED_USER.id } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: HARDCODED_USER.id,
        email: HARDCODED_USER.email,
        name: HARDCODED_USER.name,
      },
    })
  }
  return user
}


