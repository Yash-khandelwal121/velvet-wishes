import { boundary } from "@shopify/shopify-app-react-router/server";
import { useState, useEffect } from "react";
import { useLoaderData, useNavigate, useSubmit, Link } from "react-router";
import { authenticate } from "../shopify.server";
import { syncSubscription } from "../utils/billing.server";
import prisma from "../db.server";
import { updateStoreMetafield } from "../utils/metafields.server";
import previewStyles from "../styles/giftnote-preview.css?url";

export const links = () => [
  { rel: "stylesheet", href: previewStyles },
];

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
  { id: "design_1", class: "gnp-theme-classic", name: "1. Classic Note", desc: "Simple, elegant and perfect for any occasion.", price: "Free", title: "CLASSIC NOTE" },
  { id: "design_2", class: "gnp-theme-floral", name: "2. Floral Wishes", desc: "Beautiful floral design for heartfelt moments.", price: "$50", title: "FLORAL WISHES" },
  { id: "design_3", class: "gnp-theme-blackgold", name: "3. Luxury Black Gold", desc: "Premium black & gold style for a luxury touch.", price: "$50", title: "LUXURY GIFT" },
  { id: "design_4", class: "gnp-theme-celebration", name: "4. Celebration Card", desc: "Bright, joyful and perfect for celebrations.", price: "$70", title: "CELEBRATION" },
  { id: "design_5", class: "gnp-theme-romantic", name: "5. Romantic Elegance", desc: "Elegant design for your loved ones.", price: "$70", title: "ROMANCE" },
  { id: "design_6", class: "gnp-theme-royal", name: "6. Royal Luxury", desc: "Royal, elegant and truly premium experience.", price: "$100", title: "ROYAL GIFT NOTE" },
  { id: "design_7", class: "gnp-theme-3d", name: "7. 3D Magic Gift", desc: "3D animated gift box with magical vibes.", price: "$100", title: "MAGIC GIFT" }
];

export default function Library() {
  const { plan, activeCards, shop } = useLoaderData();
  const [selectedDesign, setSelectedDesign] = useState(ALL_DESIGNS[5]); // Default to Royal Luxury
  const [message, setMessage] = useState('');
  
  // Formatting state
  const [format, setFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: 'center'
  });

  const navigate = useNavigate();
  const submit = useSubmit();

  const handleToggleActive = (cardId, actionType) => {
    submit({ cardId, actionType }, { method: "post" });
  };

  return (
    <div style={{ background: "#0f111a", minHeight: "100vh", margin: "-20px", padding: "40px", boxSizing: "border-box" }}>
      <div className="gnp-hf-dashboard" style={{ margin: "0 auto", maxWidth: "1200px" }}>
        
        {/* Header */}
        <div className="gnp-hf-header">
          <div className="gnp-hf-header-left">
            <div className="gnp-hf-icon">🎁</div>
            <div>
              <h2 className="gnp-hf-title">GiftNote Pro</h2>
              <p className="gnp-hf-subtitle">Add a personal touch to every gift.</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link to="/app" style={{ background: "transparent", color: "#8b92a5", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: "20px", fontSize: "12px", cursor: "pointer", textDecoration: "none", display: "inline-block" }}>← Dashboard</Link>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px 16px", borderRadius: "20px", fontSize: "12px", color: "#f3b755" }}>
              Plan: {plan}
            </div>
          </div>
        </div>
        
        <div className="gnp-hf-layout">
          
          {/* LEFT COLUMN: Templates */}
          <div className="gnp-hf-sidebar">
            <div className="gnp-hf-section-title">1. Choose a Template</div>
            <div className="gnp-hf-section-subtitle">Select a template that fits your occasion and style.</div>
            
            <div className="gnp-hf-templates-list">
              {ALL_DESIGNS.map(d => {
                const isActive = activeCards.includes(d.id);
                return (
                  <div 
                    key={d.id}
                    className={`gnp-hf-template-item ${d.id === selectedDesign.id ? 'active' : ''}`}
                    onClick={() => setSelectedDesign(d)}
                  >
                    <div className={`gnp-hf-template-thumb ${d.class}-thumb`}></div>
                    <div className="gnp-hf-template-info">
                      <div className="gnp-hf-template-name-row">
                        <span className="gnp-hf-t-name">{d.name}</span>
                        <span className={`gnp-hf-t-price ${d.price === 'Free' ? 'free' : ''}`}>{d.price}</span>
                      </div>
                      <div className="gnp-hf-t-desc">{d.desc}</div>
                      
                      {/* Admin Controls */}
                      <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                        {isActive ? (
                          <span 
                            onClick={(e) => { e.stopPropagation(); handleToggleActive(d.id, "disable"); }}
                            style={{ fontSize: "10px", color: "#4ade80", background: "rgba(74, 222, 128, 0.1)", padding: "2px 8px", borderRadius: "4px", cursor: "pointer" }}
                          >
                            ✓ Active Storefront
                          </span>
                        ) : (
                          <span 
                            onClick={(e) => { e.stopPropagation(); handleToggleActive(d.id, "enable"); }}
                            style={{ fontSize: "10px", color: "#8b92a5", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px", cursor: "pointer" }}
                          >
                            + Enable on Storefront
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Preview & Input */}
          <div className="gnp-hf-main-content">
            <div className="gnp-hf-section-title">2. Add Your Gift Message</div>
            <div className="gnp-hf-section-subtitle">Type your message and see the preview in real time.</div>

            <div className="gnp-hf-preview-area">
              <div className="gnp-hf-live-card-container">
                <div className={`gnp-hf-live-card ${selectedDesign.class}`}>
                  
                  {/* Common Elements */}
                  <div className="gnp-card-content">
                    <div className="gnp-crown-icon">👑</div>
                    <div className="gnp-card-title">{selectedDesign.title}</div>
                    <div className="gnp-card-body-text">
                      <p>A gift chosen with care,<br/>wrapped with elegance,<br/>and delivered with love.</p>
                    </div>
                    <div className="gnp-card-user-message">
                      <p className="gnp-live-text" style={{ 
                        fontWeight: format.bold ? 'bold' : 'normal',
                        fontStyle: format.italic ? 'italic' : 'normal',
                        textDecoration: format.underline ? 'underline' : 'none',
                        textAlign: format.align
                      }}>
                        {message.trim() === '' ? (
                          <span className="gnp-placeholder-text" style={{opacity: 0.5}}>Happy Birthday! 🚀<br/>Wishing you a day filled with joy,<br/>love and beautiful memories.<br/>Enjoy every moment!</span>
                        ) : (
                          message
                        )}
                      </p>
                    </div>
                    <div className="gnp-card-footer">♡ With Love</div>
                  </div>

                  {/* Theme Specific Decorators */}
                  <div className="gnp-theme-decor-1"></div>
                  <div className="gnp-theme-decor-2"></div>
                  
                </div>
              </div>
            </div>

            <div className="gnp-hf-status-row">
              <span className="gnp-hf-indicator"></span> Live message preview
            </div>

            <div className="gnp-hf-editor-box">
              <textarea 
                className="gnp-hf-textarea" 
                placeholder="Happy Birthday! Wishing you a day filled with joy..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <div className="gnp-hf-editor-footer">
                <div className="gnp-hf-editor-tools">
                  <button type="button" 
                    onClick={() => setFormat({...format, bold: !format.bold})}
                    style={{ color: format.bold ? '#fff' : '#8b92a5', background: format.bold ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: '4px' }}
                  ><b>B</b></button>
                  <button type="button" 
                    onClick={() => setFormat({...format, italic: !format.italic})}
                    style={{ color: format.italic ? '#fff' : '#8b92a5', background: format.italic ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: '4px' }}
                  ><i>I</i></button>
                  <button type="button" 
                    onClick={() => setFormat({...format, underline: !format.underline})}
                    style={{ color: format.underline ? '#fff' : '#8b92a5', background: format.underline ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: '4px' }}
                  ><u>U</u></button>
                  <button type="button" 
                    onClick={() => {
                      const alignments = ['left', 'center', 'right'];
                      const nextAlign = alignments[(alignments.indexOf(format.align) + 1) % 3];
                      setFormat({...format, align: nextAlign});
                    }}
                    title={`Align: ${format.align}`}
                  >
                    {format.align === 'left' ? '↤' : format.align === 'right' ? '↦' : '≡'}
                  </button>
                </div>
                <div style={{color: "#8b92a5", fontSize: "11px"}}>{message.length} / 500</div>
              </div>
            </div>
            
            <div className="gnp-hf-actions">
              <button 
                type="button" 
                className="gnp-hf-btn-cancel"
                onClick={() => setMessage('')}
              >
                Clear
              </button>
              <button 
                type="button" 
                className="gnp-hf-btn-save" 
                onClick={() => {
                  if (window.shopify) window.shopify.toast.show('Demo Note Saved!');
                  else alert('Demo Note Saved! (This is just a preview)');
                }}
              >
                Save Message
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
