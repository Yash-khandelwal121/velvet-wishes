import { boundary } from "@shopify/shopify-app-react-router/server";
import { useState } from "react";
import { useLoaderData, useNavigate, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import { syncSubscription } from "../utils/billing.server";
import prisma from "../db.server";
import { updateStoreMetafield } from "../utils/metafields.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let subscription = await syncSubscription(request, shop);

  let settings = await prisma.storeSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: { shop },
    });
  }

  const activeCards = JSON.parse(settings.activeCards || '["design_1"]');

  return { plan: subscription?.plan || "FREE", activeCards, shop };
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
    if (!activeCards.includes(cardId)) {
      activeCards.push(cardId);
    }
    if (!cardOrder.includes(cardId)) {
      cardOrder.push(cardId);
    }
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
  { id: "design_1", name: "Simple & Clean", tier: "FREE", description: "Minimalist, elegant design.", color: "#ffffff", textColor: "#111827", borderColor: "#e5e7eb" },
  { id: "design_2", name: "Modern Luxury", tier: "PREMIUM_A", description: "Sleek dark theme with gold accents.", color: "#111827", textColor: "#d4af37", borderColor: "#374151" },
  { id: "design_3", name: "Floral Premium", tier: "PREMIUM_A", description: "Beautiful floral patterns for special occasions.", color: "#fdf2f8", textColor: "#be185d", borderColor: "#fbcfe8" },
  { id: "design_4", name: "Interactive Animated", tier: "PREMIUM_B", description: "Hover effects and dynamic reveals.", color: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", textColor: "#ffffff", borderColor: "transparent" },
  { id: "design_5", name: "Festival & Celebration", tier: "PREMIUM_B", description: "Vibrant colors for holidays.", color: "#fffbeb", textColor: "#ea580c", borderColor: "#fde68a" },
  { id: "design_6", name: "Ultra Premium Luxury", tier: "PREMIUM_C", description: "Glassmorphism, deep shadows, and elegance.", color: "rgba(255,255,255,0.2)", textColor: "#111827", borderColor: "rgba(255,255,255,0.5)" },
  { id: "design_7", name: "3D Premium Experience", tier: "PREMIUM_C", description: "3D perspective tilt and rich textures.", color: "#1e1b4b", textColor: "#c7d2fe", borderColor: "#312e81" },
];

export default function Library() {
  const { plan, activeCards, shop } = useLoaderData();
  const [previewDesign, setPreviewDesign] = useState(null);
  const [device, setDevice] = useState("desktop");
  const [tab, setTab] = useState("all");
  const navigate = useNavigate();
  const submit = useSubmit();

  const displayedDesigns = tab === "active"
    ? ALL_DESIGNS.filter(design => activeCards.includes(design.id))
    : ALL_DESIGNS;

  const isCardUnlocked = (tier) => {
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
              <span 
                onClick={() => setTab("all")} 
                style={{ 
                  color: tab === "all" ? "#f97316" : "#94a3b8", 
                  borderBottom: tab === "all" ? "2px solid #f97316" : "none", 
                  paddingBottom: "21px", 
                  marginBottom: "-21px",
                  cursor: "pointer" 
                }}
              >
                Design Library
              </span>
              <span 
                onClick={() => setTab("active")} 
                style={{ 
                  color: tab === "active" ? "#f97316" : "#94a3b8", 
                  borderBottom: tab === "active" ? "2px solid #f97316" : "none", 
                  paddingBottom: "21px", 
                  marginBottom: "-21px",
                  cursor: "pointer" 
                }}
              >
                Active Designs
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#38bdf8", border: "2px solid #1e293b", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "14px", fontWeight: "bold" }}>{shop.charAt(0).toUpperCase()}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "600", margin: 0 }}>Premium Designs</h2>
          <div style={{ color: "#94a3b8", fontSize: "12px" }}>Click "Preview" on any design to test mobile & desktop views</div>
        </div>
        {/* Designs Grid */}
        {displayedDesigns.length === 0 ? (
          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "64px 24px", textAlign: "center", border: "1px solid rgba(255,255,255,0.05)", marginTop: "24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎨</div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 8px 0" }}>No Active Designs</h3>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 auto 24px auto", maxWidth: "400px", lineHeight: "1.5" }}>
              You haven't activated any gift card templates yet. Click 'Apply' on any template below to enable it.
            </p>
            <button 
              onClick={() => setTab("all")} 
              style={{ background: "#f97316", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              Browse Library
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
            {displayedDesigns.map(design => {
              const unlocked = isCardUnlocked(design.tier);
              const active = activeCards.includes(design.id);
              return (
                <div key={design.id} style={{ background: "#1e293b", borderRadius: "16px", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {!unlocked && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(17, 24, 39, 0.75)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "12px", zIndex: 10 }}>
                    <button onClick={() => navigate("/app/pricing")} style={{ background: "#f97316", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer", width: "160px" }}>🔒 Upgrade to Unlock</button>
                    <button onClick={() => setPreviewDesign(design)} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer", width: "160px" }}>👁️ Preview Template</button>
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
                      <button 
                        style={{ padding: "6px 12px", fontSize: "12px", background: "transparent", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", cursor: "pointer" }} 
                        onClick={() => setPreviewDesign(design)}
                      >
                        Preview
                      </button>
                      
                      {active ? (
                        <button 
                          onClick={() => handleToggleActive(design.id, "disable")}
                          style={{ 
                            padding: "6px 12px", 
                            fontSize: "12px", 
                            background: "rgba(56, 189, 248, 0.15)", 
                            color: "#38bdf8", 
                            border: "1px solid #38bdf8", 
                            borderRadius: "12px", 
                            cursor: "pointer",
                            fontWeight: "600"
                          }}
                        >
                          ✓ Active
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleToggleActive(design.id, "enable")}
                          style={{ 
                            padding: "6px 12px", 
                            fontSize: "12px", 
                            background: "#38bdf8", 
                            color: "#0f172a", 
                            border: "none", 
                            borderRadius: "12px", 
                            cursor: "pointer",
                            fontWeight: "600"
                          }}
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {previewDesign && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setPreviewDesign(null)}>
            <div style={{ background: "#111827", width: "95%", maxWidth: "1000px", height: "90%", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.1)" }} onClick={e => e.stopPropagation()}>
              <div style={{ background: "#1e293b", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#fff" }}>Live Preview: {previewDesign.name}</h2>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ padding: "6px 12px", fontSize: "12px", background: device === "mobile" ? "#38bdf8" : "transparent", color: device === "mobile" ? "#111827" : "#94a3b8", border: device === "mobile" ? "none" : "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer" }} onClick={() => setDevice("mobile")}>📱 Mobile</button>
                  <button style={{ padding: "6px 12px", fontSize: "12px", background: device === "desktop" ? "#38bdf8" : "transparent", color: device === "desktop" ? "#111827" : "#94a3b8", border: device === "desktop" ? "none" : "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer" }} onClick={() => setDevice("desktop")}>💻 Desktop</button>
                  <button style={{ padding: "6px 12px", fontSize: "12px", background: "transparent", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.5)", borderRadius: "8px", cursor: "pointer", marginLeft: "16px" }} onClick={() => setPreviewDesign(null)}>Close</button>
                </div>
              </div>
              
              <div style={{ flexGrow: 1, overflowY: "auto", padding: "64px 20px", display: "flex", justifyContent: "center", alignItems: "flex-start", background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 75%, rgba(255,255,255,0.02)), repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 25%, #111827 25%, #111827 75%, rgba(255,255,255,0.02) 75%, rgba(255,255,255,0.02))", backgroundPosition: "0 0, 10px 10px", backgroundSize: "20px 20px" }}>
                <div style={{ background: previewDesign.color, width: device === "mobile" ? "100%" : "480px", maxWidth: "480px", padding: "40px", borderRadius: "16px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)", border: `1px solid ${previewDesign.borderColor}` }}>
                  <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h3 style={{ margin: "0 0 12px 0", color: previewDesign.textColor, fontSize: "24px", fontWeight: "700" }}>Add a Gift Message</h3>
                    <p style={{ color: previewDesign.textColor, opacity: 0.8, fontSize: "14px" }}>Make it special with a personalized note.</p>
                  </div>
                  <textarea 
                    placeholder="Happy Birthday! Wishing you all the best..." 
                    style={{ width: "100%", height: "120px", padding: "16px", borderRadius: "8px", border: `1px solid ${previewDesign.borderColor}`, background: previewDesign.id === 'design_6' ? 'rgba(255,255,255,0.4)' : '#fff', resize: "none", boxSizing: "border-box", fontSize: "14px", outline: "none", fontFamily: "inherit" }}
                  ></textarea>
                  <button style={{ width: "100%", padding: "14px", background: previewDesign.textColor, color: previewDesign.id === 'design_2' || previewDesign.id === 'design_7' ? '#111827' : '#fff', border: "none", borderRadius: "8px", marginTop: "24px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Save Note</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
