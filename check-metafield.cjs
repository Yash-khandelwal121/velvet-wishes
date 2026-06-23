const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shop = 'aditya-store-w9qlxcyh.myshopify.com';
  
  const session = await prisma.session.findFirst({
    where: { shop: shop }
  });
  
  if (!session) {
    console.log("No session found for shop");
    return;
  }
  
  console.log("Access Token:", session.accessToken);
  
  const response = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': session.accessToken
    },
    body: JSON.stringify({
      query: `
        query {
          currentAppInstallation {
            metafield(namespace: "giftnote", key: "settings") {
              value
            }
          }
        }
      `
    })
  });
  
  const json = await response.json();
  console.log("Metafield Data:", JSON.stringify(json, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
