import { useLoaderData, useNavigate, useSubmit, Link, useNavigation } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useState } from "react";
import { syncSubscription } from "../utils/billing.server";
import { updateStoreMetafield } from "../utils/metafields.server";
import previewStyles from "../styles/giftnote-preview.css?url";

export const links = () => [
  { rel: "stylesheet", href: previewStyles },
];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let analytics = await prisma.analytics.findUnique({
    where: { shop },
  });

  if (!analytics) {
    analytics = { views: 0, selects: 0, submits: 0 };
  }

  let settings = await prisma.storeSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: { shop },
    });
  }

  const activeCards = JSON.parse(settings.activeCards || '["design_1"]');

  let subscription = await syncSubscription(request, shop);

  return { analytics, subscription, shop, activeCards };
};

export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const cardId = formData.get("cardId");
  const actionType = formData.get("actionType");

  let settings = await prisma.storeSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: { shop: session.shop },
    });
  }

  let activeCards = JSON.parse(settings.activeCards || '["design_1"]');
  let cardOrder = JSON.parse(settings.cardOrder || '["design_1"]');

  if (actionType === "enable") {
    activeCards = [cardId];
    cardOrder = [cardId];
  } else if (actionType === "disable") {
    activeCards = activeCards.filter(id => id !== cardId);
    if (activeCards.length === 0) {
      activeCards = ["design_1"];
    }
  }

  const payload = {
    fontColor: settings.fontColor,
    textColor: settings.textColor,
    buttonColor: settings.buttonColor,
    accentColor: settings.accentColor,
    cardTitle: settings.cardTitle,
    maxCards: settings.maxCards,
    activeCards: JSON.stringify(activeCards),
    cardOrder: JSON.stringify(cardOrder),
  };

  await prisma.storeSettings.update({
    where: { shop: session.shop },
    data: payload,
  });

  await updateStoreMetafield(admin.graphql, payload);

  return { success: true };
};

const ALL_DESIGNS = [
  { id: "design_1", name: "Classic Note", tier: "FREE", description: "Simple, elegant and perfect for any occasion.", color: "#fdfbf7", textColor: "#2c3e50", borderColor: "#e0d8c3" },
  { id: "design_2", name: "Floral Wishes", tier: "PREMIUM_A", description: "Beautiful floral design for heartfelt moments.", color: "#ffebf0", textColor: "#8b0000", borderColor: "#ffb6c1" },
  { id: "design_3", name: "Luxury Black Gold", tier: "PREMIUM_A", description: "Premium black & gold style for a luxury touch.", color: "#111111", textColor: "#d4af37", borderColor: "#333333" },
  { id: "design_4", name: "Celebration Card", tier: "PREMIUM_B", description: "Bright, joyful and perfect for celebrations.", color: "#fffdeb", textColor: "#e63946", borderColor: "#f4a261" },
  { id: "design_5", name: "Romantic Elegance", tier: "PREMIUM_B", description: "Elegant design for your loved ones.", color: "#ffe6ea", textColor: "#b00020", borderColor: "#ffc0cb" },
  { id: "design_6", name: "Royal Luxury", tier: "PREMIUM_C", description: "Royal, elegant and truly premium experience.", color: "#0b132b", textColor: "#f3b755", borderColor: "#1c2541" },
  { id: "design_7", name: "3D Magic Gift", tier: "PREMIUM_C", description: "3D animated gift box with magical vibes.", color: "#1a0b2e", textColor: "#d8b4e2", borderColor: "#312e81" },
];

export default function Index() {
  const { analytics, subscription, shop, activeCards } = useLoaderData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isUpdating = navigation.state !== "idle";

  const isCardUnlocked = (tier) => {
    const plan = (subscription?.plan || "FREE").toUpperCase();
    if (plan === "PREMIUM_C") return true;
    if (plan === "PREMIUM_B" && ["FREE", "PREMIUM_A", "PREMIUM_B"].includes(tier)) return true;
    if (plan === "PREMIUM_A" && ["FREE", "PREMIUM_A"].includes(tier)) return true;
    if (plan === "FREE" && tier === "FREE") return true;
    return false;
  };

  const handleToggleActive = (cardId, actionType) => {
    submit({ cardId, actionType }, { method: "post" });
  };

  return (
    <div style={{
      backgroundColor: "#111827", /* Dark navy background */
      color: "#ffffff",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      minHeight: "100vh",
      margin: "-20px", /* Counteract Shopify padding */
      padding: "0",
      boxSizing: "border-box"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
      }}>
        
        {/* Top Navbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <div style={{ display: "flex", gap: "24px", fontSize: "13px", fontWeight: "500", color: "#94a3b8" }}>
              <span style={{ color: "#f97316", borderBottom: "2px solid #f97316", paddingBottom: "21px", marginBottom: "-21px" }}>Overview</span>
              <Link to="/app/pricing" style={{ background: "#f97316", color: "#fff", border: "none", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer", textDecoration: "none", display: "inline-block" }}>Manage Plan</Link>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <svg onClick={() => window.shopify && window.shopify.toast.show('No new notifications')} style={{ cursor: "pointer" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#38bdf8", border: "2px solid #1e293b", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "14px", fontWeight: "bold" }}>{shop.charAt(0).toUpperCase()}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "600", margin: 0 }}>Welcome back, {shop.split(".")[0]}</h2>
          <div style={{ color: "#38bdf8", fontSize: "13px", background: "rgba(56, 189, 248, 0.1)", padding: "8px 16px", borderRadius: "20px" }}>
            Current Plan: <strong style={{color: "#fff"}}>{subscription?.plan || "Free"}</strong>
          </div>
        </div>

        {/* 3 Top Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "40px" }}>
          
          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "24px", position: "relative" }}>
            <div style={{ fontSize: "13px", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38bdf8" }}></div> Estimated Views
            </div>
            <div style={{ fontSize: "36px", fontWeight: "600", marginBottom: "8px" }}>{analytics.views}</div>
            <div style={{ fontSize: "13px", color: "#38bdf8" }}>Looking good!</div>
          </div>

          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "24px", position: "relative" }}>
            <div style={{ fontSize: "13px", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f97316" }}></div> Selections
            </div>
            <div style={{ fontSize: "36px", fontWeight: "600", marginBottom: "8px" }}>{analytics.selects}</div>
            <div style={{ fontSize: "13px", color: "#f97316" }}>Customers are interacting</div>
          </div>

          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "24px", position: "relative" }}>
            <div style={{ fontSize: "13px", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7" }}></div> Submits
            </div>
            <div style={{ fontSize: "36px", fontWeight: "600", marginBottom: "8px" }}>{analytics.submits}</div>
            <div style={{ fontSize: "13px", color: "#a855f7" }}>Awesome!</div>
          </div>

        </div>

        {/* Design Library Overview Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", marginTop: "48px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>Design Templates</h2>
          <Link to="/app/library" style={{ background: "transparent", color: "#38bdf8", border: "1px solid #38bdf8", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer", textDecoration: "none", display: "inline-block" }}>View Full Library →</Link>
        </div>

        {/* Designs Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          {ALL_DESIGNS.map(design => {
            const unlocked = isCardUnlocked(design.tier);
            const active = activeCards.includes(design.id);
            return (
              <div key={design.id} style={{ background: "#1e293b", borderRadius: "16px", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.05)" }}>
                {!unlocked && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(17, 24, 39, 0.75)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "12px", zIndex: 10 }}>
                  <Link to="/app/pricing" style={{ background: "#f97316", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer", width: "160px", textDecoration: "none", display: "inline-block", textAlign: "center", boxSizing: "border-box" }}>🔒 Upgrade to Unlock</Link>
                  <Link to="/app/library" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer", width: "160px", textDecoration: "none", display: "inline-block", textAlign: "center", boxSizing: "border-box", marginTop: "12px" }}>👁️ Open Editor</Link>
                </div>}
                
                {/* Preview Box */}
                <div style={{ background: design.color, height: "140px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "flex-end", borderBottom: `1px solid ${design.borderColor}` }}>
                  <h3 style={{ margin: "0 0 4px 0", color: design.textColor, fontSize: "18px", fontWeight: "700" }}>{design.name}</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: design.textColor, opacity: 0.8 }}>{design.description}</p>
                </div>

                {/* Action Area */}
                <div style={{ padding: "16px", background: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "6px", color: "#94a3b8", fontWeight: "600" }}>{design.tier.replace("_", " ")}</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link 
                      style={{ padding: "6px 12px", fontSize: "12px", background: "transparent", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", cursor: "pointer", textDecoration: "none", display: "inline-block" }} 
                      to="/app/library"
                    >
                      Open Editor
                    </Link>
                    
                    {unlocked && (() => {
                      const isThisCardUpdating = isUpdating && navigation.formData?.get("cardId") === design.id;
                      return active ? (
                        <button 
                          onClick={() => handleToggleActive(design.id, "disable")}
                          disabled={isUpdating}
                          style={{ 
                            padding: "6px 12px", 
                            fontSize: "12px", 
                            background: "rgba(56, 189, 248, 0.15)", 
                            color: "#38bdf8", 
                            border: "1px solid #38bdf8", 
                            borderRadius: "12px", 
                            cursor: isUpdating ? "wait" : "pointer",
                            fontWeight: "600",
                            opacity: isUpdating ? 0.7 : 1
                          }}
                        >
                          {isThisCardUpdating ? "..." : "✓ Active"}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleToggleActive(design.id, "enable")}
                          disabled={isUpdating}
                          style={{ 
                            padding: "6px 12px", 
                            fontSize: "12px", 
                            background: "#38bdf8", 
                            color: "#0f172a", 
                            border: "none", 
                            borderRadius: "12px", 
                            cursor: isUpdating ? "wait" : "pointer",
                            fontWeight: "600",
                            opacity: isUpdating ? 0.7 : 1
                          }}
                        >
                          {isThisCardUpdating ? "..." : "Apply"}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>



      </div>
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
