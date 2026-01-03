import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function main() {
  console.log('=== Инициализация админ-пользователя ===\n')

  const email = await question('Email админа: ')
  const password = await question('Пароль админа: ')
  const name = await question('Имя админа: ')

  if (!email || !password || !name) {
    console.error('Все поля обязательны!')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const admin = await prisma.admin.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        name,
      },
      create: {
        email,
        password: hashedPassword,
        name,
        role: 'SUPER_ADMIN',
      },
    })

    console.log(`\n✅ Админ-пользователь создан/обновлен!`)
    console.log(`ID: ${admin.id}`)
    console.log(`Email: ${admin.email}`)
    console.log(`Роль: ${admin.role}`)
  } catch (error) {
    console.error('Ошибка при создании админа:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

main()
