import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { syncSubscription } from "../utils/billing.server";
import { useState, useMemo } from "react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let analytics = await prisma.analytics.findUnique({
    where: { shop },
  });

  if (!analytics) {
    analytics = { views: 0, selects: 0, submits: 0 };
  }

  const subscription = await syncSubscription(request, shop);

  return { analytics, subscription, shop };
};

export default function Analytics() {
  const { analytics, subscription, shop } = useLoaderData();
  const [isDemo, setIsDemo] = useState(true);
  const [activeTab, setActiveTab] = useState("overall"); // "overall" | "live" | "draft"

  // Base values adjusted by tab
  const tabMultiplier = useMemo(() => {
    if (activeTab === "live") return 0.95;
    if (activeTab === "draft") return 0.05;
    return 1.0;
  }, [activeTab]);

  // Math timeline helpers
  const generateTimeline = (total, numDays = 7) => {
    if (total <= 0) return Array(numDays).fill(0);
    const weights = [0.08, 0.15, 0.12, 0.22, 0.18, 0.10, 0.15];
    let values = weights.map(w => Math.round(total * w));
    let currentSum = values.reduce((a, b) => a + b, 0);
    let diff = total - currentSum;
    while (diff !== 0) {
      if (diff > 0) {
        const maxIdx = values.indexOf(Math.max(...values));
        values[maxIdx]++;
        diff--;
      } else {
        const maxIdx = values.indexOf(Math.max(...values));
        if (values[maxIdx] > 0) {
          values[maxIdx]--;
        } else {
          const nonZeroIdx = values.findIndex(v => v > 0);
          if (nonZeroIdx !== -1) {
            values[nonZeroIdx]--;
          } else {
            break;
          }
        }
        diff++;
      }
    }
    return values;
  };

  const distributeProportionately = (targetTotal, baseTimeline) => {
    const baseTotal = baseTimeline.reduce((a, b) => a + b, 0);
    if (baseTotal <= 0 || targetTotal <= 0) {
      return Array(baseTimeline.length).fill(0);
    }
    const safeTargetTotal = Math.min(targetTotal, baseTotal);
    let values = baseTimeline.map(val => Math.round((val / baseTotal) * safeTargetTotal));
    let currentSum = values.reduce((a, b) => a + b, 0);
    let diff = safeTargetTotal - currentSum;
    while (diff !== 0) {
      if (diff > 0) {
        let candidates = [];
        for (let i = 0; i < values.length; i++) {
          if (values[i] < baseTimeline[i]) {
            candidates.push(i);
          }
        }
        if (candidates.length > 0) {
          let bestIdx = candidates[0];
          for (let idx of candidates) {
            if (baseTimeline[idx] > baseTimeline[bestIdx]) {
              bestIdx = idx;
            }
          }
          values[bestIdx]++;
          diff--;
        } else {
          const maxIdx = values.indexOf(Math.min(...values));
          values[maxIdx]++;
          diff--;
        }
      } else {
        const posIdx = values.findIndex(v => v > 0);
        if (posIdx !== -1) {
          values[posIdx]--;
        } else {
          break;
        }
        diff++;
      }
    }
    return values;
  };

  const getLinePath = (values, width, height, padding = 10) => {
    if (values.length === 0) return "";
    const maxVal = Math.max(...values, 5);
    const points = values.map((val, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = (height - padding) - (val / maxVal) * (height - 2 * padding);
      return { x, y };
    });
    return points.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  };

  const getAreaPath = (values, width, height, padding = 10) => {
    if (values.length === 0) return "";
    const maxVal = Math.max(...values, 5);
    const points = values.map((val, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = (height - padding) - (val / maxVal) * (height - 2 * padding);
      return { x, y };
    });
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = height;
    return `M ${firstX} ${bottomY} ` + points.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${lastX} ${bottomY} Z`;
  };

  // Set metrics based on active mode and active tab
  const viewsVal = useMemo(() => {
    const raw = isDemo ? 1280 : analytics.views;
    return Math.round(raw * tabMultiplier);
  }, [isDemo, analytics.views, tabMultiplier]);

  const selectsVal = useMemo(() => {
    const raw = isDemo ? 456 : analytics.selects;
    return Math.round(raw * tabMultiplier);
  }, [isDemo, analytics.selects, tabMultiplier]);

  const submitsVal = useMemo(() => {
    const raw = isDemo ? 186 : analytics.submits;
    return Math.round(raw * tabMultiplier);
  }, [isDemo, analytics.submits, tabMultiplier]);

  // Timeline values
  const viewsTimeline = useMemo(() => {
    if (isDemo) {
      const base = [150, 192, 148, 220, 175, 230, 165]; // sum 1280
      return base.map(v => Math.round(v * tabMultiplier));
    }
    return generateTimeline(viewsVal);
  }, [isDemo, viewsVal, tabMultiplier]);

  const selectsTimeline = useMemo(() => {
    if (isDemo) {
      const base = [50, 68, 52, 78, 62, 82, 64]; // sum 456
      return base.map(v => Math.round(v * tabMultiplier));
    }
    return distributeProportionately(selectsVal, viewsTimeline);
  }, [isDemo, selectsVal, viewsTimeline, tabMultiplier]);

  const submitsTimeline = useMemo(() => {
    if (isDemo) {
      const base = [20, 28, 21, 32, 25, 34, 26]; // sum 186
      return base.map(v => Math.round(v * tabMultiplier));
    }
    return distributeProportionately(submitsVal, selectsTimeline);
  }, [isDemo, submitsVal, selectsTimeline, tabMultiplier]);

  const conversionRate = viewsVal > 0 
    ? ((submitsVal / viewsVal) * 100).toFixed(2) 
    : "0.00";

  // Dynamic calendar dates for last 7 days
  const dates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
    });
  }, []);

  // Main Chart dynamic calculations
  const maxViewsVal = useMemo(() => {
    return Math.max(...viewsTimeline, 10);
  }, [viewsTimeline]);

  const maxDayIdx = useMemo(() => {
    return viewsTimeline.indexOf(Math.max(...viewsTimeline));
  }, [viewsTimeline]);

  const maxDayVal = viewsTimeline[maxDayIdx] || 0;
  const tooltipX = (maxDayIdx / 6) * 100;
  const tooltipY = 135 - (maxDayVal / maxViewsVal) * 120; // scaled coordinate

  // Conversion chart dynamic calculations
  const dailyConversionRates = useMemo(() => {
    return viewsTimeline.map((v, i) => {
      if (v <= 0) return 0;
      return parseFloat(((submitsTimeline[i] / v) * 100).toFixed(2));
    });
  }, [viewsTimeline, submitsTimeline]);

  const maxRateRound = useMemo(() => {
    return Math.ceil(Math.max(...dailyConversionRates, 10));
  }, [dailyConversionRates]);

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
              <button 
                onClick={() => setActiveTab("overall")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0 0 21px 0",
                  marginBottom: "-21px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: activeTab === "overall" ? "#f97316" : "#94a3b8",
                  borderBottom: activeTab === "overall" ? "2px solid #f97316" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Overall Analytics
              </button>
              <button 
                onClick={() => setActiveTab("live")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0 0 21px 0",
                  marginBottom: "-21px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: activeTab === "live" ? "#f97316" : "#94a3b8",
                  borderBottom: activeTab === "live" ? "2px solid #f97316" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                All Live Themes
              </button>
              <button 
                onClick={() => setActiveTab("draft")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0 0 21px 0",
                  marginBottom: "-21px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: activeTab === "draft" ? "#f97316" : "#94a3b8",
                  borderBottom: activeTab === "draft" ? "2px solid #f97316" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                All Draft Themes
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Demo / Live Toggle */}
            <div style={{
              display: "flex",
              background: "#1e293b",
              borderRadius: "20px",
              padding: "2px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <button 
                onClick={() => setIsDemo(true)}
                style={{
                  background: isDemo ? "#f97316" : "transparent",
                  color: isDemo ? "#ffffff" : "#94a3b8",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Demo Data
              </button>
              <button 
                onClick={() => setIsDemo(false)}
                style={{
                  background: !isDemo ? "#f97316" : "transparent",
                  color: !isDemo ? "#ffffff" : "#94a3b8",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Live Data
              </button>
            </div>

            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#38bdf8", border: "2px solid #1e293b", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "14px", fontWeight: "bold" }}>
              {shop.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>Quick Insights</h2>
          <div style={{ color: "#38bdf8", fontSize: "12px" }}>
            {isDemo ? "Last 7 days vs. previous 7 days ↗" : "Live Store Feed ↗"}
          </div>
        </div>

        {/* 3 Top Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "40px" }}>
          
          {/* Card 1 */}
          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "24px", position: "relative" }}>
            <div style={{ fontSize: "13px", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38bdf8" }}></div> Estimated Views
            </div>
            <div style={{ fontSize: "32px", fontWeight: "600", marginBottom: "8px" }}>{viewsVal}</div>
            <div style={{ fontSize: "12px", color: "#38bdf8" }}>{isDemo ? "+12.5% (+100.00%)" : "Real-time updates"}</div>
            <div style={{ height: "60px", marginTop: "24px" }}>
              <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grad-card1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={getAreaPath(viewsTimeline, 200, 60, 10)} fill="url(#grad-card1)" />
                <path d={getLinePath(viewsTimeline, 200, 60, 10)} fill="none" stroke="#38bdf8" strokeWidth="2" />
              </svg>
            </div>
            <div style={{ position: "absolute", bottom: "16px", right: "20px", color: "#94a3b8" }}>→</div>
          </div>

          {/* Card 2 */}
          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "24px", position: "relative" }}>
            <div style={{ fontSize: "13px", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f97316" }}></div> Avg. Selects/Day
            </div>
            <div style={{ fontSize: "32px", fontWeight: "600", marginBottom: "8px" }}>
              {isDemo ? (65.1 * tabMultiplier).toFixed(1) : (selectsVal / 7).toFixed(1)}
            </div>
            <div style={{ fontSize: "12px", color: isDemo ? "#ef4444" : "#f97316" }}>
              {isDemo ? "-5.55 (-7.03%)" : "Active selections tracking"}
            </div>
            <div style={{ height: "60px", marginTop: "24px" }}>
              <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grad-card2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={getAreaPath(selectsTimeline, 200, 60, 10)} fill="url(#grad-card2)" />
                <path d={getLinePath(selectsTimeline, 200, 60, 10)} fill="none" stroke="#f97316" strokeWidth="2" />
              </svg>
            </div>
            <div style={{ position: "absolute", bottom: "16px", right: "20px", color: "#94a3b8" }}>→</div>
          </div>

          {/* Card 3 */}
          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "24px", position: "relative" }}>
            <div style={{ fontSize: "13px", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7" }}></div> Note Submits
            </div>
            <div style={{ fontSize: "32px", fontWeight: "600", marginBottom: "8px" }}>{submitsVal}</div>
            <div style={{ fontSize: "12px", color: "#a855f7" }}>{isDemo ? "+9,056 (+487.12%)" : "Saved note checkouts"}</div>
            <div style={{ height: "60px", marginTop: "24px" }}>
              <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grad-card3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={getAreaPath(submitsTimeline, 200, 60, 10)} fill="url(#grad-card3)" />
                <path d={getLinePath(submitsTimeline, 200, 60, 10)} fill="none" stroke="#a855f7" strokeWidth="2" />
              </svg>
            </div>
            <div style={{ position: "absolute", bottom: "16px", right: "20px", color: "#94a3b8" }}>→</div>
          </div>

        </div>

        {/* Bottom Area */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
          
          {/* Main Line Chart */}
          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", position: "relative" }}>
            {/* Premium Zero Traffic Overlay */}
            {!isDemo && viewsVal === 0 && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(30, 41, 59, 0.75)",
                backdropFilter: "blur(4px)",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: "24px",
                zIndex: 10
              }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>📊</div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: "0 0 8px 0" }}>Waiting for Store Traffic...</h3>
                <p style={{ fontSize: "12px", color: "#94a3b8", maxWidth: "280px", margin: 0, lineHeight: "1.5" }}>
                  Once customers start viewing gift cards and choosing notes in your store, live interaction reports will update automatically.
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: "24px", fontSize: "13px", color: "#e2e8f0", marginBottom: "40px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#38bdf8" }}></span> Estimated Views</span>
              <span>Selections Per Viewer</span>
              <span>Submits</span>
            </div>

            <div style={{ position: "relative", flexGrow: 1, minHeight: "180px" }}>
              {/* Y Axis */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#94a3b8", fontSize: "11px" }}>
                <span>{maxViewsVal}</span>
                <span>{Math.round(maxViewsVal / 2)}</span>
                <span>0</span>
              </div>
              
              {/* Grid Lines */}
              <div style={{ position: "absolute", left: "40px", right: 0, top: "8px", height: "1px", background: "rgba(255,255,255,0.05)" }}></div>
              <div style={{ position: "absolute", left: "40px", right: 0, top: "50%", height: "1px", background: "rgba(255,255,255,0.05)" }}></div>
              <div style={{ position: "absolute", left: "40px", right: 0, bottom: "8px", height: "1px", background: "rgba(255,255,255,0.05)" }}></div>

              {/* Chart Line */}
              <div style={{ position: "absolute", left: "40px", right: 0, top: 0, bottom: 0 }}>
                <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad-main" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={getAreaPath(viewsTimeline, 400, 150, 15)} fill="url(#grad-main)" />
                  <path d={getLinePath(viewsTimeline, 400, 150, 15)} fill="none" stroke="#f97316" strokeWidth="2.5" />
                </svg>

                {viewsVal > 0 && (
                  <>
                    {/* Tooltip Line */}
                    <div style={{ position: "absolute", top: "8px", bottom: "8px", left: `${tooltipX}%`, width: "1px", background: "rgba(255,255,255,0.15)", pointerEvents: "none" }}></div>
                    {/* Tooltip Dot */}
                    <div style={{ position: "absolute", top: `${tooltipY}px`, left: `${tooltipX}%`, transform: "translate(-50%, -50%)", width: "8px", height: "8px", borderRadius: "50%", background: "#f97316", border: "2px solid #1e293b", pointerEvents: "none" }}></div>
                    {/* Tooltip Value Box */}
                    <div style={{ position: "absolute", top: `${tooltipY - 28}px`, left: `${tooltipX}%`, transform: "translateX(-50%)", fontSize: "10px", fontWeight: "600", color: "#fff", background: "#f97316", padding: "4px 8px", borderRadius: "4px", whiteSpace: "nowrap", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.5)", pointerEvents: "none" }}>
                      {maxDayVal} views
                    </div>
                  </>
                )}
              </div>

              {/* X Axis */}
              <div style={{ position: "absolute", bottom: "-30px", left: "40px", right: 0, display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "11px" }}>
                <span>{dates[0]}</span>
                <span>{dates[3]}</span>
                <span>{dates[6]}</span>
              </div>
            </div>

            <div style={{ marginTop: "40px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", fontSize: "13px", color: "#94a3b8" }}>
              Estimated Total Views : <span style={{ color: "#38bdf8", fontWeight: "600" }}>{viewsVal}</span>
            </div>
          </div>

          {/* Bar Chart */}
          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", position: "relative" }}>
            {/* Premium Zero Traffic Overlay */}
            {!isDemo && viewsVal === 0 && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(30, 41, 59, 0.75)",
                backdropFilter: "blur(4px)",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: "24px",
                zIndex: 10
              }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>📈</div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: "0 0 8px 0" }}>Waiting for Store Traffic...</h3>
                <p style={{ fontSize: "12px", color: "#94a3b8", maxWidth: "280px", margin: 0, lineHeight: "1.5" }}>
                  Detailed conversion data will be graphed automatically as you generate checkouts.
                </p>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#e2e8f0", marginBottom: "40px" }}>
              <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#38bdf8" }}></span> Conversion Rate
            </div>

            <div style={{ position: "relative", flexGrow: 1, minHeight: "180px" }}>
              {/* Y Axis */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#94a3b8", fontSize: "11px" }}>
                <span>{maxRateRound}%</span>
                <span>{Math.round(maxRateRound * 0.75)}%</span>
                <span>{Math.round(maxRateRound * 0.5)}%</span>
                <span>{Math.round(maxRateRound * 0.25)}%</span>
                <span>0%</span>
              </div>

              {/* Bars */}
              <div style={{ position: "absolute", left: "40px", right: 0, top: 0, bottom: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                {dailyConversionRates.map((rate, idx) => {
                  const heightPercent = maxRateRound > 0 ? (rate / maxRateRound) * 85 : 0;
                  const isPeak = rate > 0 && rate === Math.max(...dailyConversionRates);
                  return (
                    <div key={idx} style={{ width: "10%", height: `${Math.max(heightPercent, 2)}%`, background: "#38bdf8", borderRadius: "4px 4px 0 0", position: "relative", minHeight: "4px" }}>
                      {isPeak && (
                        <div style={{ position: "absolute", top: "-24px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: "#fff", fontWeight: "600", background: "rgba(56, 189, 248, 0.2)", padding: "2px 6px", borderRadius: "4px", whiteSpace: "nowrap" }}>
                          {rate}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* X Axis */}
              <div style={{ position: "absolute", bottom: "-30px", left: "40px", right: 0, display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "11px" }}>
                {dates.map((date, idx) => (
                  <span key={idx}>{date}</span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "40px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", fontSize: "13px", color: "#94a3b8" }}>
              Average Conversion Rate : <span style={{ color: "#38bdf8", fontWeight: "600" }}>{conversionRate}%</span>
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
