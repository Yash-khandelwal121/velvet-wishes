function initGiftNote() {
  const settings = window.GiftNoteSettings || {};
  const containers = document.querySelectorAll(".giftnote-pro-wrapper:not(.gnp-initialized)");
  
  if (containers.length > 0) {
    console.log(`[GiftNote Pro] Initializing ${containers.length} widget(s)...`);
  }

  containers.forEach(container => {
    container.classList.add('gnp-initialized');
    
    let activeCards = ["design_1"];
    try {
      activeCards = typeof settings.activeCards === 'string'
        ? JSON.parse(settings.activeCards)
        : (settings.activeCards || ["design_1"]);
    } catch (e) {
      console.error("[GiftNote Pro] Failed to parse activeCards, falling back to default.", e);
    }

    const designs = [
      { id: "design_1", class: "gnp-theme-classic", name: "Classic Note", title: "CLASSIC NOTE", desc: "Simple, elegant and perfect for any occasion.", price: "Free" },
      { id: "design_2", class: "gnp-theme-floral", name: "Floral Wishes", title: "FLORAL WISHES", desc: "Beautiful floral design for heartfelt moments.", price: "$50" },
      { id: "design_3", class: "gnp-theme-blackgold", name: "Luxury Black Gold", title: "LUXURY GIFT", desc: "Premium black & gold style for a luxury touch.", price: "$50" },
      { id: "design_4", class: "gnp-theme-celebration", name: "Celebration Card", title: "CELEBRATION", desc: "Bright, joyful and perfect for celebrations.", price: "$70" },
      { id: "design_5", class: "gnp-theme-romantic", name: "Romantic Elegance", title: "ROMANCE", desc: "Elegant design for your loved ones.", price: "$70" },
      { id: "design_6", class: "gnp-theme-royal", name: "Royal Luxury", title: "ROYAL GIFT NOTE", desc: "Royal, elegant and truly premium experience.", price: "$100" },
      { id: "design_7", class: "gnp-theme-3d", name: "3D Magic Gift", title: "MAGIC GIFT", desc: "3D animated gift box with magical vibes.", price: "$100" }
    ];

    const maxCards = parseInt(settings.maxCards || 7, 10);
    const availableDesigns = designs.filter(d => activeCards.includes(d.id)).slice(0, maxCards);
    if (availableDesigns.length === 0) availableDesigns.push(designs[0]);

    // Default to the first available premium animated design if possible
    let selectedDesign = availableDesigns.find(d => ['design_6', 'design_4', 'design_7'].includes(d.id)) || availableDesigns[0];

    const uid = Math.random().toString(36).substr(2, 9);

    const getCardHTML = (design) => `<div class="gnp-live-card ${design.class}"><div class="gnp-card-content"><div class="gnp-crown-icon">👑</div><div class="gnp-card-title">${design.title}</div><div class="gnp-card-body-text"><p>A gift chosen with care,<br>wrapped with elegance,<br>and delivered with love.</p></div><div class="gnp-card-user-message"><p class="gnp-live-text">Your message will appear here...</p></div><div class="gnp-card-footer">♡ With Love</div></div><div class="gnp-theme-decor-1"></div><div class="gnp-theme-decor-2"></div></div>`;

    const getPreviewHTML = (design) => {
      const cardHtml = getCardHTML(design);
      if (design.id === 'design_4' || design.id === 'design_3') {
        return `<div class="gnp-interactive-wrapper gnp-envelope-wrapper" tabindex="0"><div class="gnp-envelope-back"></div><div class="gnp-card-insert">${cardHtml}</div><div class="gnp-envelope-flap"></div><div class="gnp-envelope-front"></div><div class="gnp-interactive-hint">Tap to open</div></div>`;
      } else if (design.id === 'design_7') {
        return `<div class="gnp-live-card-container" style="margin:0 auto;width:100%;max-width:450px;"><div class="gnp-interactive-wrapper gnp-3d-box-wrapper" tabindex="0"><div class="gnp-box-back"></div><div class="gnp-card-insert">${cardHtml}</div><div class="gnp-box-front"></div><div class="gnp-box-lid"><div class="gnp-lid-top"></div><div class="gnp-lid-bow"></div></div><div class="gnp-sparkles"><div class="gnp-sparkle s1">✨</div><div class="gnp-sparkle s2">✨</div><div class="gnp-sparkle s3">✨</div></div><div class="gnp-interactive-hint">Tap to open</div></div></div>`;
      } else {
        return `<div class="gnp-interactive-wrapper gnp-ribbon-wrapper" tabindex="0"><div class="gnp-card-insert">${cardHtml}</div><div class="gnp-ribbon-left"></div><div class="gnp-ribbon-right"></div><div class="gnp-ribbon-center"><div class="gnp-bow"><div class="gnp-bow-tail left"></div><div class="gnp-bow-tail right"></div><div class="gnp-bow-heart"></div></div></div><div class="gnp-interactive-hint">Tap to untie</div></div>`;
      }
    };

    let html = `<div class="gnp-widget-container"><input type="checkbox" id="gnp-toggle-${uid}" class="gnp-hidden-toggle"/><div class="gnp-opt-in"><label class="gnp-checkbox-label" for="gnp-toggle-${uid}"><span class="gnp-checkbox-custom"></span><span class="gnp-checkbox-text">Include a Premium Gift Note</span></label></div><div class="gnp-main-widget-area gnp-main-area-hidden"><h3 class="gnp-widget-title">Add a Personal Touch</h3><p class="gnp-widget-subtitle">Select a premium gift card.</p><div class="gnp-carousel-container"><div class="gnp-carousel">${availableDesigns.map(d => `<div class="gnp-carousel-item ${d.id===selectedDesign.id?'active':''}" data-gnp-design="${d.id}"><div class="gnp-thumb ${d.class}-thumb"><span style="font-size:8px;font-weight:bold;opacity:0.5;">${d.title.split(' ')[0]}</span></div><div class="gnp-thumb-name">${d.name}</div></div>`).join('')}</div></div><div class="gnp-preview-section">${getPreviewHTML(selectedDesign)}</div><div class="gnp-editor-section"><textarea class="gnp-simple-textarea gnp-message-input" placeholder="Type heartfelt message..."></textarea><div class="gnp-actions"><button type="button" class="gnp-btn-save gnp-btn-save-note">Save Gift Note</button></div></div></div></div>`;

    container.innerHTML = html;

    const messageInput = container.querySelector('.gnp-message-input');
    const saveBtn = container.querySelector('.gnp-btn-save-note');
    const checkbox = container.querySelector('.gnp-hidden-toggle');
    const carouselItems = container.querySelectorAll('.gnp-carousel-item');
    const previewSection = container.querySelector('.gnp-preview-section');

    const updatePreview = () => {
      const text = messageInput ? messageInput.value : '';
      const liveTextEl = container.querySelector('.gnp-live-text');
      if (!liveTextEl) return;
      if (text.trim() === '') {
        liveTextEl.innerHTML = 'Happy Birthday! 🚀<br>Wishing you a day filled with joy,<br>love and beautiful memories.<br>Enjoy every moment!';
      } else {
        liveTextEl.innerText = text;
      }
    };

    const selectDesign = (cardId, itemEl) => {
      const design = designs.find(d => d.id === cardId);
      if (!design) return;
      selectedDesign = design;
      
      carouselItems.forEach(el => el.classList.remove('active'));
      if (itemEl) itemEl.classList.add('active');
      
      previewSection.innerHTML = getPreviewHTML(selectedDesign);
      updatePreview();

      fetch('/apps/giftnote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop: window.Shopify ? window.Shopify.shop : '', action: 'select' })
      }).catch(e => { /* Ignore proxy errors silently in prod */ });
    };

    const saveNote = () => {
      if (!checkbox || !checkbox.checked) {
        if (saveBtn) saveBtn.innerText = "Please Check the Box!";
        setTimeout(() => { if (saveBtn) saveBtn.innerText = "Save Gift Note"; }, 2500);
        return;
      }
      if (!selectedDesign) {
        if (saveBtn) saveBtn.innerText = "Select a Template!";
        setTimeout(() => { if (saveBtn) saveBtn.innerText = "Save Gift Note"; }, 2500);
        return;
      }
      
      const message = messageInput ? messageInput.value : '';
      const data = {
        attributes: {
          'Gift Note Design': selectedDesign.id,
          'Gift Message': message
        }
      };

      if (saveBtn) saveBtn.innerText = "Saving...";

      // Robust fallback for Cart API endpoint
      const cartUrl = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) 
          ? window.Shopify.routes.root + 'cart/update.js' 
          : '/cart/update.js';

      fetch(cartUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then(data => {
        if (saveBtn) saveBtn.innerText = "Message Saved!";
        setTimeout(() => { if (saveBtn) saveBtn.innerText = "Save Gift Note"; }, 3000);
        
        // Dispatch event for other apps or theme cart to update
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: data }));
        
        fetch('/apps/giftnote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop: window.Shopify?.shop || '', action: 'submit' })
        }).catch(e => {});
      })
      .catch((error) => {
        console.error('[GiftNote Pro] Error Saving:', error);
        if (saveBtn) saveBtn.innerText = "Error Saving";
        setTimeout(() => { if (saveBtn) saveBtn.innerText = "Save Gift Note"; }, 3000);
      });
    };

    carouselItems.forEach(el => {
      el.addEventListener('click', function() {
        selectDesign(this.getAttribute('data-gnp-design'), this);
      });
    });

    if (messageInput) {
      messageInput.addEventListener('keyup', updatePreview);
      messageInput.addEventListener('change', updatePreview);
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', saveNote);
    }

    updatePreview();

    fetch('/apps/giftnote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop: window.Shopify ? window.Shopify.shop : '', action: 'view' })
    }).catch(e => {});
  });
}

// Global Event Delegation for Interactive Wrappers
// This ensures that even if the theme clones the DOM nodes (e.g. AJAX carts), the interactions still work!
if (!window.gnpGlobalEventsAttached) {
  window.gnpGlobalEventsAttached = true;
  document.addEventListener('click', function(e) {
    const interactiveWrapper = e.target.closest('.gnp-interactive-wrapper');
    if (interactiveWrapper) {
      interactiveWrapper.classList.toggle('is-open');
      const hint = interactiveWrapper.querySelector('.gnp-interactive-hint');
      if (hint) hint.style.opacity = '0';
    }
  });
}

// Initialize immediately if ready, or wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", initGiftNote);
} else {
  initGiftNote();
}

// Global MutationObserver to detect dynamically added widgets (e.g. AJAX Drawer Carts, Quick Views)
if (!window.gnpMutationObserver) {
  window.gnpMutationObserver = new MutationObserver((mutations) => {
    let shouldInit = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            // Check if the added node is the wrapper or contains the wrapper
            if (node.classList?.contains('giftnote-pro-wrapper') || node.querySelector?.('.giftnote-pro-wrapper:not(.gnp-initialized)')) {
              shouldInit = true;
              break;
            }
          }
        }
      }
      if (shouldInit) break;
    }
    if (shouldInit) {
      // Small debounce to let theme scripts finish cloning/modifying
      setTimeout(initGiftNote, 50);
    }
  });
  window.gnpMutationObserver.observe(document.body, { childList: true, subtree: true });
}

// Shopify Theme Editor specific events
document.addEventListener('shopify:section:load', () => {
  document.querySelectorAll(".giftnote-pro-wrapper").forEach(el => el.classList.remove('gnp-initialized'));
  initGiftNote();
});
document.addEventListener('shopify:block:select', initGiftNote);
document.addEventListener('shopify:block:deselect', initGiftNote);
