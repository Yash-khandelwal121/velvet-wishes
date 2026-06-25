import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, payload, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  
  // Payload contains shop info. We must redact any PII within 48 hours.
  // Shopify requires responding with 200 OK.
  
  // Typically we might delete store settings or session info here, 
  // but shop/redact is strictly for GDPR/privacy compliance 
  // and mostly applies if you store PII for the shop owner.
  
  return new Response("OK", { status: 200 });
};
