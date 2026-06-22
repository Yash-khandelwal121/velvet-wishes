function initGiftNote() {
  const settings = window.GiftNoteSettings || {};
  const container = document.getElementById("giftnote-pro-container");
  
  if (!container) return;

  const fontColor = settings.fontColor || "#000000";
  const textColor = settings.textColor || "#333333";
  const buttonColor = settings.buttonColor || "#000000";
  const accentColor = settings.accentColor || "#f4f4f4";
  const titleText = settings.cardTitle || "Add a Gift Message";
  let activeCards = ["design_1"];
  try {
    activeCards = typeof settings.activeCards === 'string'
      ? JSON.parse(settings.activeCards)
      : (settings.activeCards || ["design_1"]);
  } catch (e) {
    console.error("Failed to parse activeCards", e);
  }

  let html = `
    <div class="gnp-main-container" style="--gnp-font-color: ${fontColor}; --gnp-text-color: ${textColor}; --gnp-btn-color: ${buttonColor}; --gnp-accent-color: ${accentColor};">
      <h2 class="gnp-title">${titleText}</h2>
      <div class="gnp-cards-grid">
  `;

  activeCards.slice(0, settings.maxCards || 3).forEach(cardId => {
    let cardClass = "";
    let designName = "";
    
    if (cardId === "design_1") { cardClass = "gnp-design-simple"; designName = "Simple Note"; }
    else if (cardId === "design_2") { cardClass = "gnp-design-modern"; designName = "Modern Luxury"; }
    else if (cardId === "design_3") { cardClass = "gnp-design-floral"; designName = "Floral Premium"; }
    else if (cardId === "design_4") { cardClass = "gnp-design-animated"; designName = "Interactive"; }
    else if (cardId === "design_5") { cardClass = "gnp-design-festival"; designName = "Festival"; }
    else if (cardId === "design_6") { cardClass = "gnp-design-ultra"; designName = "Ultra Luxury"; }
    else if (cardId === "design_7") { cardClass = "gnp-design-3d"; designName = "3D Experience"; }

    html += `
      <div class="gnp-card ${cardClass}" onclick="selectGiftNote('${cardId}')" id="gnp-card-${cardId}">
        <div class="gnp-card-header">
          <span class="gnp-design-name">${designName}</span>
          <span class="gnp-radio"></span>
        </div>
        <div class="gnp-card-body">
           <textarea class="gnp-message-input" placeholder="Type your message here..." onclick="event.stopPropagation()"></textarea>
        </div>
      </div>
    `;
  });

  html += `
      </div>
      <button type="button" class="gnp-save-btn" onclick="saveGiftNote()">Save Gift Note</button>
    </div>
  `;

  container.innerHTML = html;

  // Track view
  fetch('/apps/giftnote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shop: Shopify.shop, action: 'view' })
  }).catch(e => console.error(e));
}

if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", initGiftNote);
} else {
  initGiftNote();
}

document.addEventListener('shopify:section:load', initGiftNote);
document.addEventListener('shopify:block:select', initGiftNote);
document.addEventListener('shopify:block:deselect', initGiftNote);

let selectedDesignId = null;

window.selectGiftNote = function(cardId) {
  selectedDesignId = cardId;
  document.querySelectorAll('.gnp-card').forEach(el => el.classList.remove('gnp-selected'));
  document.getElementById('gnp-card-' + cardId).classList.add('gnp-selected');
  
  // Track select
  fetch('/apps/giftnote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shop: Shopify.shop, action: 'select' })
  }).catch(e => console.error(e));
};

window.saveGiftNote = function() {
  if (!selectedDesignId) {
    alert("Please select a gift card design.");
    return;
  }
  const cardEl = document.getElementById('gnp-card-' + selectedDesignId);
  const message = cardEl.querySelector('.gnp-message-input').value;

  const data = {
    attributes: {
      'Gift Note Design': selectedDesignId,
      'Gift Message': message
    }
  };

  fetch(window.Shopify.routes.root + 'cart/update.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    alert("Gift note added to cart!");
    
    // Track submit
    fetch('/apps/giftnote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop: Shopify.shop, action: 'submit' })
    }).catch(e => console.error(e));
  })
  .catch((error) => {
    console.error('Error:', error);
  });
};
