const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const settings = await prisma.storeSettings.findFirst({ where: { shop: 'aditya-store-w9qlxcyh.myshopify.com' } });
  console.log("DB activeCards:", settings.activeCards);
}
main().catch(console.error).finally(() => prisma.$disconnect());
