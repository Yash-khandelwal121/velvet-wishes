import { useLoaderData, useSubmit } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { MONTHLY_PLAN_50, MONTHLY_PLAN_70, MONTHLY_PLAN_100 } from "../billing";
import { syncSubscription } from "../utils/billing.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  let subscription = await syncSubscription(request, session.shop);
  return { subscription };
};

export const action = async ({ request }) => {
  const { billing, session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const plan = formData.get("plan");

  const cleanShop = session.shop.replace(".myshopify.com", "");
  const returnUrl = `https://admin.shopify.com/store/${cleanShop}/apps/${process.env.SHOPIFY_API_KEY}/app?planApproved=true`;

  let planName = "";
  if (plan === "PREMIUM_A") planName = MONTHLY_PLAN_50;
  if (plan === "PREMIUM_B") planName = MONTHLY_PLAN_70;
  if (plan === "PREMIUM_C") planName = MONTHLY_PLAN_100;

  if (planName) {
    try {
      await billing.require({
        plans: [planName],
        onFailure: async () => {
          await billing.request({
            plan: planName,
            isTest: true,
            returnUrl,
          });
        },
      });
    } catch (error) {
      if (error instanceof Response) {
        throw error;
      }
      // Check if it's the public distribution billing block error
      const isPublicDistError = error.errorData?.some(
        err => err.message && err.message.includes("public distribution")
      ) || (error.message && error.message.includes("public distribution"));

      if (isPublicDistError) {
        let dbPlan = "FREE";
        if (plan === "PREMIUM_A") dbPlan = "PREMIUM_A";
        if (plan === "PREMIUM_B") dbPlan = "PREMIUM_B";
        if (plan === "PREMIUM_C") dbPlan = "PREMIUM_C";

        await prisma.subscription.upsert({
          where: { shop: session.shop },
          update: { plan: dbPlan, status: "ACTIVE_DEV" },
          create: { shop: session.shop, plan: dbPlan, status: "ACTIVE_DEV" },
        });

        return null; // Reload pricing page to show updated plan state
      }

      throw new Error(
        JSON.stringify({
          message: error.message,
          errorData: error.errorData || [],
        }, null, 2)
      );
    }
  }

  if (plan === "FREE") {
    // Retrieve the existing subscription details
    const existing = await prisma.subscription.findUnique({
      where: { shop: session.shop },
    });

    if (existing?.billingId && existing.status !== "ACTIVE_DEV") {
      try {
        const response = await admin.graphql(
          `
          mutation appSubscriptionCancel($id: ID!, $prorate: Boolean!) {
            appSubscriptionCancel(id: $id, prorate: $prorate) {
              appSubscription {
                id
                status
              }
              userErrors {
                field
                message
              }
            }
          }
          `,
          {
            variables: {
              id: existing.billingId,
              prorate: true,
            },
          }
        );
        const result = await response.json();
        const userErrors = result.data?.appSubscriptionCancel?.userErrors;
        if (userErrors && userErrors.length > 0) {
          console.error("Failed to cancel subscription on Shopify:", userErrors);
        } else {
          console.log(`Successfully cancelled Shopify subscription ${existing.billingId} for shop ${session.shop}`);
        }
      } catch (e) {
        console.error("Error cancelling subscription on Shopify:", e);
      }
    }

    await prisma.subscription.upsert({
      where: { shop: session.shop },
      update: { plan: "FREE", status: "ACTIVE", billingId: null },
      create: { shop: session.shop, plan: "FREE", status: "ACTIVE", billingId: null },
    });
  }
  return null;
};

export default function Pricing() {
  const { subscription } = useLoaderData();
  const submit = useSubmit();
  const currentPlan = subscription?.plan || "FREE";

  const handleSelectPlan = (plan) => {
    submit({ plan }, { method: "post" });
  };

  return (
    <div style={{
      backgroundColor: "#111827", /* Dark navy background */
      color: "#ffffff",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      minHeight: "100vh",
      padding: "80px 20px",
      position: "relative",
      overflow: "hidden",
      margin: "-20px" /* Counteract default shopify padding */
    }}>
      {/* Light Beam Effect */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "10%",
        width: "600px",
        height: "1200px",
        background: "linear-gradient(180deg, rgba(162, 107, 255, 0.2) 0%, rgba(162, 107, 255, 0) 100%)",
        transform: "rotate(35deg)",
        transformOrigin: "top right",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 0
      }}></div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        
        {/* Header Label */}
        <div style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "8px",
          background: "rgba(255, 255, 255, 0.05)", 
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "6px 16px", 
          borderRadius: "20px", 
          fontSize: "12px", 
          color: "#b4b4b4",
          marginBottom: "24px" 
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          Pricing
        </div>

        <h1 style={{ fontSize: "40px", fontWeight: "600", margin: "0 0 16px 0", letterSpacing: "-1px", lineHeight: "1.2" }}>Choose Your Plan</h1>
        <p style={{ color: "#a1a1aa", fontSize: "15px", margin: "0 auto 48px auto", maxWidth: "500px", lineHeight: "1.5" }}>
          Select the tier that best matches your customer base and unlock premium card designs.
        </p>

        {/* Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", textAlign: "left" }}>
          
          {/* Plan 1: Free */}
          <div style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column" }}>
            <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "16px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/></svg>
            </div>
            <h3 style={{ fontSize: "20px", margin: "0 0 8px 0", fontWeight: "500" }}>Free</h3>
            <p style={{ color: "#a1a1aa", fontSize: "13px", margin: "0 0 24px 0", lineHeight: "1.5", height: "40px" }}>Start using basic gift messages immediately.</p>
            <div style={{ fontSize: "36px", fontWeight: "600", margin: "0 0 24px 0", letterSpacing: "-1px" }}>Free</div>
            
            <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>Features:</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", flexGrow: 1 }}>
              {[
                "1 Gift Card Design (Free)",
                "Standard Customization",
                "Standard Support"
              ].map((feature, i) => (
                <li key={i} style={{ color: "#a1a1aa", fontSize: "13px", marginBottom: "12px", display: "flex", alignItems: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" style={{ marginRight: "12px" }}><polyline points="20 6 9 17 4 12"/></svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleSelectPlan("FREE")}
              disabled={currentPlan === "FREE"}
              style={{ 
                width: "100%", 
                padding: "12px", 
                background: currentPlan === "FREE" ? "rgba(255,255,255,0.05)" : "transparent", 
                border: "1px solid rgba(255,255,255,0.2)", 
                borderRadius: "12px", 
                color: "#fff", 
                fontSize: "14px", 
                fontWeight: "500", 
                cursor: currentPlan === "FREE" ? "default" : "pointer", 
                transition: "all 0.2s", 
                opacity: currentPlan === "FREE" ? 0.6 : 1 
              }}
            >
              {currentPlan === "FREE" ? "Current Plan" : "Activate Free Plan"}
            </button>
          </div>

          {/* Plan 2: Premium A */}
          <div style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column" }}>
            <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "16px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2"><circle cx="12" cy="8" r="7"/><path d="M5.5 21v-2a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v2"/></svg>
            </div>
            <h3 style={{ fontSize: "20px", margin: "0 0 8px 0", fontWeight: "500" }}>Premium</h3>
            <p style={{ color: "#a1a1aa", fontSize: "13px", margin: "0 0 24px 0", lineHeight: "1.5", height: "40px" }}>Upgrade to premium designs with gold accents.</p>
            <div style={{ margin: "0 0 24px 0", display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: "36px", fontWeight: "600", letterSpacing: "-1px" }}>$50</span>
              <span style={{ fontSize: "13px", color: "#a1a1aa", marginLeft: "4px" }}>/month</span>
            </div>
            
            <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>Features:</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", flexGrow: 1 }}>
              {[
                "2 Gift Card Designs (Premium)",
                "Full Customization Suite",
                "Email Support"
              ].map((feature, i) => (
                <li key={i} style={{ color: "#a1a1aa", fontSize: "13px", marginBottom: "12px", display: "flex", alignItems: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" style={{ marginRight: "12px" }}><polyline points="20 6 9 17 4 12"/></svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleSelectPlan("PREMIUM_A")}
              disabled={currentPlan === "PREMIUM_A"}
              style={{ 
                width: "100%", 
                padding: "12px", 
                background: currentPlan === "PREMIUM_A" ? "rgba(255,255,255,0.05)" : "linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%)", 
                border: currentPlan === "PREMIUM_A" ? "1px solid rgba(255,255,255,0.1)" : "none", 
                borderRadius: "12px", 
                color: "#fff", 
                fontSize: "14px", 
                fontWeight: "600", 
                cursor: currentPlan === "PREMIUM_A" ? "default" : "pointer", 
                transition: "all 0.2s", 
                opacity: currentPlan === "PREMIUM_A" ? 0.6 : 1,
                boxShadow: currentPlan === "PREMIUM_A" ? "none" : "0 4px 14px rgba(139, 92, 246, 0.4)" 
              }}
            >
              {currentPlan === "PREMIUM_A" ? "Current Plan" : "Activate Premium Plan"}
            </button>
          </div>

          {/* Plan 3: Premium B */}
          <div style={{ background: "linear-gradient(180deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.02) 100%)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, #8b5cf6, transparent)" }}></div>
            <span style={{ position: "absolute", top: "12px", right: "16px", background: "rgba(139, 92, 246, 0.2)", color: "#a855f7", fontSize: "11px", padding: "4px 10px", borderRadius: "12px", fontWeight: "600" }}>Most Popular</span>
            <div style={{ width: "32px", height: "32px", background: "#8b5cf6", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "16px", boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3 style={{ fontSize: "20px", margin: "0 0 8px 0", fontWeight: "500" }}>Elite</h3>
            <p style={{ color: "#a1a1aa", fontSize: "13px", margin: "0 0 24px 0", lineHeight: "1.5", height: "40px" }}>Ideal for interactive animated designs with hover reveals.</p>
            <div style={{ margin: "0 0 24px 0", display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: "36px", fontWeight: "600", letterSpacing: "-1px" }}>$70</span>
              <span style={{ fontSize: "13px", color: "#a1a1aa", marginLeft: "4px" }}>/month</span>
            </div>
            
            <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>Features:</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", flexGrow: 1 }}>
              {[
                "4 Gift Card Designs (Elite)",
                "Interactive Customizations",
                "Priority Support",
                "Advanced Insights & Analytics"
              ].map((feature, i) => (
                <li key={i} style={{ color: "#e4e4e7", fontSize: "13px", marginBottom: "12px", display: "flex", alignItems: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" style={{ marginRight: "12px" }}><polyline points="20 6 9 17 4 12"/></svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleSelectPlan("PREMIUM_B")}
              disabled={currentPlan === "PREMIUM_B"}
              style={{ 
                width: "100%", 
                padding: "12px", 
                background: currentPlan === "PREMIUM_B" ? "rgba(255,255,255,0.05)" : "linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%)", 
                border: currentPlan === "PREMIUM_B" ? "1px solid rgba(255,255,255,0.1)" : "none", 
                borderRadius: "12px", 
                color: "#fff", 
                fontSize: "14px", 
                fontWeight: "600", 
                cursor: currentPlan === "PREMIUM_B" ? "default" : "pointer", 
                transition: "all 0.2s", 
                opacity: currentPlan === "PREMIUM_B" ? 0.6 : 1,
                boxShadow: currentPlan === "PREMIUM_B" ? "none" : "0 4px 14px rgba(139, 92, 246, 0.4)" 
              }}
            >
              {currentPlan === "PREMIUM_B" ? "Current Plan" : "Activate Elite Plan"}
            </button>
          </div>

          {/* Plan 4: Premium C */}
          <div style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column" }}>
            <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "16px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <h3 style={{ fontSize: "20px", margin: "0 0 8px 0", fontWeight: "500" }}>Royal</h3>
            <p style={{ color: "#a1a1aa", fontSize: "13px", margin: "0 0 24px 0", lineHeight: "1.5", height: "40px" }}>Unlocks ultra luxury styling with 3D perspective widgets.</p>
            <div style={{ margin: "0 0 24px 0", display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: "36px", fontWeight: "600", letterSpacing: "-1px" }}>$100</span>
              <span style={{ fontSize: "13px", color: "#a1a1aa", marginLeft: "4px" }}>/month</span>
            </div>
            
            <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>Features:</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", flexGrow: 1 }}>
              {[
                "All 7 Gift Card Designs (Royal)",
                "3D Premium Tilt Effects",
                "Priority 24/7 Support",
                "Advanced Branding Controls"
              ].map((feature, i) => (
                <li key={i} style={{ color: "#a1a1aa", fontSize: "13px", marginBottom: "12px", display: "flex", alignItems: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" style={{ marginRight: "12px" }}><polyline points="20 6 9 17 4 12"/></svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleSelectPlan("PREMIUM_C")}
              disabled={currentPlan === "PREMIUM_C"}
              style={{ 
                width: "100%", 
                padding: "12px", 
                background: currentPlan === "PREMIUM_C" ? "rgba(255,255,255,0.05)" : "linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%)", 
                border: currentPlan === "PREMIUM_C" ? "1px solid rgba(255,255,255,0.1)" : "none", 
                borderRadius: "12px", 
                color: "#fff", 
                fontSize: "14px", 
                fontWeight: "600", 
                cursor: currentPlan === "PREMIUM_C" ? "default" : "pointer", 
                transition: "all 0.2s", 
                opacity: currentPlan === "PREMIUM_C" ? 0.6 : 1,
                boxShadow: currentPlan === "PREMIUM_C" ? "none" : "0 4px 14px rgba(139, 92, 246, 0.4)" 
              }}
            >
              {currentPlan === "PREMIUM_C" ? "Current Plan" : "Activate Royal Plan"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
