import { authenticate } from "../shopify.server";
import { MONTHLY_PLAN_50, MONTHLY_PLAN_70, MONTHLY_PLAN_100 } from "../billing";
import prisma from "../db.server";

/**
 * Checks with Shopify for active subscriptions and updates the local Prisma database.
 * @param {Request} request 
 * @param {string} shop 
 */
export async function syncSubscription(request, shop) {
  const { billing } = await authenticate.admin(request);

  try {
    // Check active payment with Shopify Billing API
    const check = await billing.check({
      plans: [MONTHLY_PLAN_50, MONTHLY_PLAN_70, MONTHLY_PLAN_100],
      isTest: true,
    });

    let activePlan = "FREE";
    let status = "ACTIVE";
    let billingId = null;
    if (check.hasActivePayment && check.appSubscriptions?.length > 0) {
      const activeSub = check.appSubscriptions[0]; // e.g. "Premium Plan A ($50/month)"
      billingId = activeSub.id;
      if (activeSub.name === MONTHLY_PLAN_50) activePlan = "PREMIUM_A";
      else if (activeSub.name === MONTHLY_PLAN_70) activePlan = "PREMIUM_B";
      else if (activeSub.name === MONTHLY_PLAN_100) activePlan = "PREMIUM_C";
    } else {
      // Fallback: If no active payment was returned, check if we have an ACTIVE_DEV sandbox status in local DB.
      // If so, preserve it so developers/merchants can test premium templates locally.
      const existing = await prisma.subscription.findUnique({ where: { shop } });
      if (existing && existing.plan !== "FREE" && existing.status === "ACTIVE_DEV") {
        return existing;
      }
    }

    // Sync to database
    const subscription = await prisma.subscription.upsert({
      where: { shop },
      update: { plan: activePlan, status, billingId },
      create: { shop, plan: activePlan, status, billingId },
    });

    return subscription;
  } catch (error) {
    console.error("Shopify Billing sync failed, returning DB state:", error.message);
    let subscription = await prisma.subscription.findUnique({ where: { shop } });
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: { shop, plan: "FREE", status: "ACTIVE" },
      });
    }
    return subscription;
  }
}
