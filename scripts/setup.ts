import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Настройка базы данных ===\n')

  // Создаем дефолтного админа
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vinyl.app'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const adminName = process.env.ADMIN_NAME || 'Admin'

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  try {
    const admin = await prisma.admin.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'SUPER_ADMIN',
      },
    })

    console.log('✅ Дефолтный админ создан:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Пароль: ${adminPassword}`)
    console.log(`   ⚠️  Не забудьте изменить пароль!`)

    // Создаем дефолтные настройки
    const defaultSettings = [
      {
        key: 'PRICE_PER_GENERATION',
        value: '10',
        description: 'Цена одной генерации в Telegram Stars',
      },
      {
        key: 'FREE_GENERATIONS',
        value: '1',
        description: 'Количество бесплатных генераций для новых пользователей',
      },
      {
        key: 'MAX_DURATION',
        value: '30',
        description: 'Максимальная длительность трека в секундах',
      },
    ]

    for (const setting of defaultSettings) {
      await prisma.settings.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      })
    }

    console.log('\n✅ Дефолтные настройки созданы')
  } catch (error) {
    console.error('Ошибка при настройке:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
