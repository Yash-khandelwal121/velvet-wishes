function initGiftNote() {
  const e = window.GiftNoteSettings || {},
    i = document.querySelectorAll(
      ".giftnote-pro-wrapper:not(.gnp-initialized)",
    );
  (i.length > 0 &&
    console.log(`[GiftNote Pro] Initializing ${i.length} widget(s)...`),
    i.forEach((i) => {
      i.classList.add("gnp-initialized");
      let t = [
        "design_1",
        "design_2",
        "design_3",
        "design_4",
        "design_5",
        "design_6",
        "design_7",
      ];
      try {
        t =
          "string" == typeof e.activeCards
            ? JSON.parse(e.activeCards)
            : e.activeCards || [
                "design_1",
                "design_2",
                "design_3",
                "design_4",
                "design_5",
                "design_6",
                "design_7",
              ];
      } catch (e) {
        console.error(
          "[GiftNote Pro] Failed to parse activeCards, falling back to default.",
          e,
        );
      }
      const n = [
          {
            id: "design_1",
            class: "gnp-theme-classic",
            name: "Classic Note",
            title: "CLASSIC NOTE",
            desc: "Simple, elegant and perfect for any occasion.",
            price: "Free",
          },
          {
            id: "design_2",
            class: "gnp-theme-floral",
            name: "Floral Wishes",
            title: "FLORAL WISHES",
            desc: "Beautiful floral design for heartfelt moments.",
            price: "$50",
          },
          {
            id: "design_3",
            class: "gnp-theme-blackgold",
            name: "Luxury Black Gold",
            title: "LUXURY GIFT",
            desc: "Premium black & gold style for a luxury touch.",
            price: "$50",
          },
          {
            id: "design_4",
            class: "gnp-theme-celebration",
            name: "Celebration Card",
            title: "CELEBRATION",
            desc: "Bright, joyful and perfect for celebrations.",
            price: "$70",
          },
          {
            id: "design_5",
            class: "gnp-theme-romantic",
            name: "Romantic Elegance",
            title: "ROMANCE",
            desc: "Elegant design for your loved ones.",
            price: "$70",
          },
          {
            id: "design_6",
            class: "gnp-theme-royal",
            name: "Royal Luxury",
            title: "ROYAL GIFT NOTE",
            desc: "Royal, elegant and truly premium experience.",
            price: "$100",
          },
          {
            id: "design_7",
            class: "gnp-theme-3d",
            name: "3D Magic Gift",
            title: "MAGIC GIFT",
            desc: "3D animated gift box with magical vibes.",
            price: "$100",
          },
        ],
        s = (parseInt(e.maxCards || 7, 10), n.filter((e) => t.includes(e.id)));
      0 === s.length && s.push(n[0]);
      let a =
        s.find((e) => ["design_6", "design_4", "design_7"].includes(e.id)) ||
        s[0];
      let format = { bold: false, italic: false, underline: false, align: "center" };
      const o = Math.random().toString(36).substr(2, 9),
        d = (e) => {
          const i = ((e) =>
            `<div class="gnp-live-card ${e.class}"><div class="gnp-card-content"><div class="gnp-crown-icon">👑</div><div class="gnp-card-title">${e.title}</div><div class="gnp-card-body-text"><p>A gift chosen with care,<br>wrapped with elegance,<br>and delivered with love.</p></div><div class="gnp-card-user-message"><p class="gnp-live-text">Your message will appear here...</p></div><div class="gnp-card-footer">♡ With Love</div></div><div class="gnp-theme-decor-1"></div><div class="gnp-theme-decor-2"></div></div>`)(
            e,
          );
          return "design_4" === e.id || "design_3" === e.id
            ? `<div class="gnp-interactive-wrapper gnp-envelope-wrapper" tabindex="0"><div class="gnp-envelope-back"></div><div class="gnp-card-insert">${i}</div><div class="gnp-envelope-flap"></div><div class="gnp-envelope-front"></div><div class="gnp-interactive-hint">Tap to open</div></div>`
            : "design_7" === e.id
              ? `<div class="gnp-live-card-container" style="margin:0 auto;width:100%;max-width:450px;"><div class="gnp-interactive-wrapper gnp-3d-box-wrapper" tabindex="0"><div class="gnp-box-back"></div><div class="gnp-card-insert">${i}</div><div class="gnp-box-front"></div><div class="gnp-box-lid"><div class="gnp-lid-top"></div><div class="gnp-lid-bow"></div></div><div class="gnp-sparkles"><div class="gnp-sparkle s1">✨</div><div class="gnp-sparkle s2">✨</div><div class="gnp-sparkle s3">✨</div></div><div class="gnp-interactive-hint">Tap to open</div></div></div>`
              : `<div class="gnp-interactive-wrapper gnp-ribbon-wrapper" tabindex="0"><div class="gnp-card-insert">${i}</div><div class="gnp-ribbon-left"></div><div class="gnp-ribbon-right"></div><div class="gnp-ribbon-center"><div class="gnp-bow"><div class="gnp-bow-tail left"></div><div class="gnp-bow-tail right"></div><div class="gnp-bow-heart"></div></div></div><div class="gnp-interactive-hint">Tap to untie</div></div>`;
        };
      let r = `<div class="gnp-widget-container"><input type="checkbox" id="gnp-toggle-${o}" class="gnp-hidden-toggle"/><div class="gnp-opt-in"><label class="gnp-checkbox-label" for="gnp-toggle-${o}"><span class="gnp-checkbox-custom"></span><span class="gnp-checkbox-text">Include a Premium Gift Note</span></label></div><div class="gnp-main-widget-area gnp-main-area-hidden"><h3 class="gnp-widget-title">Add a Personal Touch</h3><p class="gnp-widget-subtitle">Select a premium gift card.</p><div class="gnp-carousel-container"><div class="gnp-carousel">${s.map((e) => `<div class="gnp-carousel-item ${e.id === a.id ? "active" : ""}" data-gnp-design="${e.id}"><div class="gnp-thumb ${e.class}-thumb"><span style="font-size:8px;font-weight:bold;opacity:0.5;">${e.title.split(" ")[0]}</span></div><div class="gnp-thumb-name">${e.name}</div></div>`).join("")}</div></div><div class="gnp-preview-section">${d(a)}</div><div class="gnp-editor-section"><textarea class="gnp-simple-textarea gnp-message-input" placeholder="Type heartfelt message..."></textarea><div class="gnp-editor-tools"><button type="button" class="gnp-tool-btn gnp-tool-bold"><b>B</b></button><button type="button" class="gnp-tool-btn gnp-tool-italic"><i>I</i></button><button type="button" class="gnp-tool-btn gnp-tool-underline"><u>U</u></button><button type="button" class="gnp-tool-btn gnp-tool-align" title="Align: center">≡</button></div><div class="gnp-actions"><button type="button" class="gnp-btn-save gnp-btn-save-note">Save Gift Note</button></div></div></div></div>`;
      i.innerHTML = r;
      const c = i.querySelector(".gnp-message-input"),
        l = i.querySelector(".gnp-btn-save-note"),
        p = i.querySelector(".gnp-hidden-toggle"),
        g = i.querySelectorAll(".gnp-carousel-item"),
        v = i.querySelector(".gnp-preview-section"),
        btnBold = i.querySelector(".gnp-tool-bold"),
        btnItalic = i.querySelector(".gnp-tool-italic"),
        btnUnderline = i.querySelector(".gnp-tool-underline"),
        btnAlign = i.querySelector(".gnp-tool-align"),
        h = () => {
          const e = c ? c.value : "",
            t = i.querySelector(".gnp-live-text");
          if (t) {
            "" === e.trim()
              ? (t.innerHTML =
                  "Happy Birthday! 🚀<br>Wishing you a day filled with joy,<br>love and beautiful memories.<br>Enjoy every moment!")
              : (t.innerText = e);
            t.style.fontWeight = format.bold ? "bold" : "normal";
            t.style.fontStyle = format.italic ? "italic" : "normal";
            t.style.textDecoration = format.underline ? "underline" : "none";
            t.style.textAlign = format.align;
          }
        },
        f = () => {
          if (!p || !p.checked)
            return (
              l && (l.innerText = "Please Check the Box!"),
              void setTimeout(() => {
                l && (l.innerText = "Save Gift Note");
              }, 2500)
            );
          if (!a)
            return (
              l && (l.innerText = "Select a Template!"),
              void setTimeout(() => {
                l && (l.innerText = "Save Gift Note");
              }, 2500)
            );
          const e = c ? c.value : "",
            i = { attributes: { "Gift Note Design": a.id, "Gift Message": e, "Gift Note Format": JSON.stringify(format) } };
          l && (l.innerText = "Saving...");
          const t =
            window.Shopify &&
            window.Shopify.routes &&
            window.Shopify.routes.root
              ? window.Shopify.routes.root + "cart/update.js"
              : "/cart/update.js";
          fetch(t, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(i),
          })
            .then((e) => {
              if (!e.ok) throw new Error("Network response was not ok");
              return e.json();
            })
            .then((e) => {
              (l && (l.innerText = "Message Saved!"),
                setTimeout(() => {
                  l && (l.innerText = "Save Gift Note");
                }, 3e3),
                document.dispatchEvent(
                  new CustomEvent("cart:updated", { detail: e }),
                ),
                fetch("/apps/giftnote/analytics", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    shop: window.Shopify?.shop || "",
                    action: "submit",
                  }),
                }).catch((e) => {}));
            })
            .catch((e) => {
              (console.error("[GiftNote Pro] Error Saving:", e),
                l && (l.innerText = "Error Saving"),
                setTimeout(() => {
                  l && (l.innerText = "Save Gift Note");
                }, 3e3));
            });
        };
      (g.forEach((e) => {
        e.addEventListener("click", function () {
          ((e, i) => {
            const t = n.find((i) => i.id === e);
            t &&
              ((a = t),
              g.forEach((e) => e.classList.remove("active")),
              i && i.classList.add("active"),
              (v.innerHTML = d(a)),
              h(),
              fetch("/apps/giftnote/analytics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  shop: window.Shopify ? window.Shopify.shop : "",
                  action: "select",
                }),
              }).catch((e) => {}));
          })(this.getAttribute("data-gnp-design"), this);
        });
      }),
        c && (c.addEventListener("keyup", h), c.addEventListener("change", h)),
        btnBold && btnBold.addEventListener("click", () => {
            format.bold = !format.bold;
            btnBold.style.background = format.bold ? "rgba(0,0,0,0.1)" : "transparent";
            btnBold.style.color = format.bold ? "#000" : "#8b92a5";
            h();
        }),
        btnItalic && btnItalic.addEventListener("click", () => {
            format.italic = !format.italic;
            btnItalic.style.background = format.italic ? "rgba(0,0,0,0.1)" : "transparent";
            btnItalic.style.color = format.italic ? "#000" : "#8b92a5";
            h();
        }),
        btnUnderline && btnUnderline.addEventListener("click", () => {
            format.underline = !format.underline;
            btnUnderline.style.background = format.underline ? "rgba(0,0,0,0.1)" : "transparent";
            btnUnderline.style.color = format.underline ? "#000" : "#8b92a5";
            h();
        }),
        btnAlign && btnAlign.addEventListener("click", () => {
            const aligns = ["left", "center", "right"];
            const icons = ["↤", "≡", "↦"];
            let idx = (aligns.indexOf(format.align) + 1) % 3;
            format.align = aligns[idx];
            btnAlign.innerText = icons[idx];
            btnAlign.title = "Align: " + format.align;
            h();
        }),
        l && l.addEventListener("click", f),
        h(),
        fetch("/apps/giftnote/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shop: window.Shopify ? window.Shopify.shop : "",
            action: "view",
          }),
        }).catch((e) => {}));
    }));
}
(window.gnpGlobalEventsAttached ||
  ((window.gnpGlobalEventsAttached = !0),
  document.addEventListener("click", function (e) {
    const i = e.target.closest(".gnp-interactive-wrapper");
    if (i) {
      i.classList.toggle("is-open");
      const e = i.querySelector(".gnp-interactive-hint");
      e && (e.style.opacity = "0");
    }
  })),
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", initGiftNote)
    : initGiftNote(),
  window.gnpMutationObserver ||
    ((window.gnpMutationObserver = new MutationObserver((e) => {
      let i = !1;
      for (const t of e) {
        if (t.addedNodes.length)
          for (const e of t.addedNodes)
            if (
              1 === e.nodeType &&
              (e.classList?.contains("giftnote-pro-wrapper") ||
                e.querySelector?.(
                  ".giftnote-pro-wrapper:not(.gnp-initialized)",
                ))
            ) {
              i = !0;
              break;
            }
        if (i) break;
      }
      i && setTimeout(initGiftNote, 50);
    })),
    window.gnpMutationObserver.observe(document.body, {
      childList: !0,
      subtree: !0,
    })),
  document.addEventListener("shopify:section:load", () => {
    (document
      .querySelectorAll(".giftnote-pro-wrapper")
      .forEach((e) => e.classList.remove("gnp-initialized")),
      initGiftNote());
  }),
  document.addEventListener("shopify:block:select", initGiftNote),
  document.addEventListener("shopify:block:deselect", initGiftNote));
