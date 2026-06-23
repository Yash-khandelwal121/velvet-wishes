import { useLoaderData, useSubmit, useNavigation, useNavigate, Link } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { updateStoreMetafield } from "../utils/metafields.server";
import { useState } from "react";
import { syncSubscription } from "../utils/billing.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let settings = await prisma.storeSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: { shop },
    });
  }

  let subscription = await syncSubscription(request, shop);

  return { settings, plan: subscription?.plan || "FREE", shop };
};

export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const payload = {
    fontColor: formData.get("fontColor"),
    textColor: formData.get("textColor"),
    buttonColor: formData.get("buttonColor"),
    accentColor: formData.get("accentColor"),
    cardTitle: formData.get("cardTitle"),
    maxCards: parseInt(formData.get("maxCards") || "3", 10),
    activeCards: formData.get("activeCards"),
    cardOrder: formData.get("cardOrder"),
  };

  await prisma.storeSettings.update({
    where: { shop: session.shop },
    data: payload,
  });

  await updateStoreMetafield(admin.graphql, payload);

  return { success: true };
};

const ALL_DESIGNS = [
  { id: "design_1", name: "Simple & Clean", tier: "FREE" },
  { id: "design_2", name: "Modern Luxury", tier: "PREMIUM_A" },
  { id: "design_3", name: "Floral Premium", tier: "PREMIUM_A" },
  { id: "design_4", name: "Interactive Animated", tier: "PREMIUM_B" },
  { id: "design_5", name: "Festival & Celebration", tier: "PREMIUM_B" },
  { id: "design_6", name: "Ultra Premium Luxury", tier: "PREMIUM_C" },
  { id: "design_7", name: "3D Premium Experience", tier: "PREMIUM_C" },
];

export default function Settings() {
  const { settings, plan, shop } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSaving = navigation.state === "submitting";

  const [formState, setFormState] = useState({
    fontColor: settings.fontColor,
    textColor: settings.textColor,
    buttonColor: settings.buttonColor,
    accentColor: settings.accentColor,
    cardTitle: settings.cardTitle,
    maxCards: settings.maxCards,
    activeCards: JSON.parse(settings.activeCards || '["design_1"]'),
    cardOrder: JSON.parse(settings.cardOrder || '["design_1"]')
  });

  const handleChange = (key, value) => setFormState(prev => ({ ...prev, [key]: value }));

  const handleToggleCard = (cardId) => {
    setFormState(prev => {
      const isActive = prev.activeCards.includes(cardId);
      let newActive = isActive ? prev.activeCards.filter(id => id !== cardId) : [...prev.activeCards, cardId];
      let newOrder = prev.cardOrder;
      if (!isActive && !newOrder.includes(cardId)) newOrder = [...newOrder, cardId];
      return { ...prev, activeCards: newActive, cardOrder: newOrder };
    });
  };

  const handleSave = () => {
    const formData = new FormData();
    Object.keys(formState).forEach(key => {
      formData.append(key, typeof formState[key] === "object" ? JSON.stringify(formState[key]) : formState[key]);
    });
    submit(formData, { method: "post" });
  };

  const isCardUnlocked = (tier) => {
    if (plan === "PREMIUM_C") return true;
    if (plan === "PREMIUM_B" && ["FREE", "PREMIUM_A", "PREMIUM_B"].includes(tier)) return true;
    if (plan === "PREMIUM_A" && ["FREE", "PREMIUM_A"].includes(tier)) return true;
    if (plan === "FREE" && tier === "FREE") return true;
    return false;
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
              <span style={{ color: "#f97316", borderBottom: "2px solid #f97316", paddingBottom: "21px", marginBottom: "-21px" }}>Settings</span>
              <button onClick={handleSave} disabled={isSaving} style={{ background: "#f97316", color: "#fff", border: "none", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer", opacity: isSaving ? 0.5 : 1 }}>{isSaving ? "Saving..." : "Save Settings"}</button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#38bdf8", border: "2px solid #1e293b", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "14px", fontWeight: "bold" }}>{shop.charAt(0).toUpperCase()}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 24px 0" }}>Brand Colors</h2>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>Heading Font Color</span>
              <input type="color" value={formState.fontColor} onChange={e => handleChange("fontColor", e.target.value)} style={{ width: "40px", height: "30px", padding: 0, border: "none", background: "none", cursor: "pointer" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>Text Color</span>
              <input type="color" value={formState.textColor} onChange={e => handleChange("textColor", e.target.value)} style={{ width: "40px", height: "30px", padding: 0, border: "none", background: "none", cursor: "pointer" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>Button Color</span>
              <input type="color" value={formState.buttonColor} onChange={e => handleChange("buttonColor", e.target.value)} style={{ width: "40px", height: "30px", padding: 0, border: "none", background: "none", cursor: "pointer" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>Accent Color</span>
              <input type="color" value={formState.accentColor} onChange={e => handleChange("accentColor", e.target.value)} style={{ width: "40px", height: "30px", padding: 0, border: "none", background: "none", cursor: "pointer" }} />
            </div>
          </div>

          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 24px 0" }}>Widget Config</h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "14px", color: "#94a3b8", marginBottom: "8px" }}>Card Title Text</label>
              <input type="text" value={formState.cardTitle} onChange={e => handleChange("cardTitle", e.target.value)} style={{ width: "100%", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 12px", color: "#fff", outline: "none", fontSize: "14px" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "#94a3b8", marginBottom: "8px" }}>Max Cards to Show on Storefront</label>
              <input type="number" min="1" max="7" value={formState.maxCards} onChange={e => handleChange("maxCards", e.target.value)} style={{ width: "100%", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 12px", color: "#fff", outline: "none", fontSize: "14px" }} />
            </div>
          </div>
        </div>

        <div style={{ background: "#1e293b", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 24px 0" }}>Available Card Designs</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {ALL_DESIGNS.map(design => {
              const unlocked = isCardUnlocked(design.tier);
              const active = formState.activeCards.includes(design.id);
              return (
                <div key={design.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f172a", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", opacity: unlocked ? 1 : 0.5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontWeight: "500", fontSize: "15px" }}>{design.name}</div>
                    <div style={{ fontSize: "10px", background: "rgba(255,255,255,0.1)", color: "#94a3b8", padding: "2px 6px", borderRadius: "4px" }}>{design.tier.replace("_", " ")}</div>
                  </div>
                  {unlocked ? (
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "13px", color: active ? "#38bdf8" : "#94a3b8" }}>
                      <input type="checkbox" checked={active} onChange={() => handleToggleCard(design.id)} style={{ marginRight: "8px", accentColor: "#38bdf8" }} />
                      {active ? "Enabled" : "Disabled"}
                    </label>
                  ) : (
                    <Link to="/app/pricing" style={{ fontSize: "12px", color: "#f97316", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline", display: "inline-block" }}>Upgrade to unlock</Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
