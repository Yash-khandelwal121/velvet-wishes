import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, payload, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  
  // Payload contains customer info and data request details.
  // Shopify requires responding with 200 OK.
  
  return new Response("OK", { status: 200 });
};
