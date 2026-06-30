console.log("Quick Translator Pro: Grammarly Mode Active");

let currentActiveElement = null;

function showFloatingIcon(element) {
  if (!element) return;
  removeFloatingIcon();
  const rect = element.getBoundingClientRect();
  if (rect.width < 50 || rect.height < 20) return;

  currentActiveElement = element;
  const icon = document.createElement("div");
  icon.id = "gemini-translator-icon";
  icon.title = "See English Suggestions";
  
  icon.style.position = "absolute";
  icon.style.left = `${rect.left + window.scrollX + rect.width - 28}px`;
  icon.style.top = `${rect.top + window.scrollY + rect.height - 28}px`;
  icon.style.width = "22px";
  icon.style.height = "22px";
  icon.style.backgroundColor = "#11a683"; 
  icon.style.borderRadius = "50%";
  icon.style.cursor = "pointer";
  icon.style.zIndex = "999998";
  icon.style.display = "flex";
  icon.style.alignItems = "center";
  icon.style.justifyContent = "center";
  icon.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
  icon.innerHTML = `<span style="color: white; font-family: sans-serif; font-size: 11px; font-weight: bold;">G</span>`;

  icon.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({ action: "translateSelection" });
      } else {
        removeFloatingIcon();
      }
    } catch (err) {
      removeFloatingIcon();
    }
  });

  document.body.appendChild(icon);
}

function removeFloatingIcon() {
  const existingIcon = document.getElementById("gemini-translator-icon");
  if (existingIcon) existingIcon.remove();
}

function showLoader(element) {
  if (!element) return;
  removeLoader();
  removeFloatingIcon();
  removeSuggestionCard();

  const rect = element.getBoundingClientRect();
  const loader = document.createElement("div");
  loader.id = "gemini-translator-loader";
  loader.style.position = "absolute";
  loader.style.left = `${rect.left + window.scrollX + rect.width - 28}px`;
  loader.style.top = `${rect.top + window.scrollY + rect.height - 28}px`;
  loader.style.width = "18px";
  loader.style.height = "18px";
  loader.style.border = "3px solid #f3f3f3";
  loader.style.borderTop = "3px solid #11a683";
  loader.style.borderRadius = "50%";
  loader.style.zIndex = "999999";
  
  if (!document.getElementById("gemini-loader-style")) {
    const style = document.createElement("style");
    style.id = "gemini-loader-style";
    style.innerHTML = `@keyframes gemini-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
  loader.style.animation = "gemini-spin 0.8s linear infinite";
  document.body.appendChild(loader);
}

function removeLoader() {
  const existingLoader = document.getElementById("gemini-translator-loader");
  if (existingLoader) existingLoader.remove();
}

function createSuggestionCard(suggestions, element) {
  removeSuggestionCard();
  const rect = element.getBoundingClientRect();

  const card = document.createElement("div");
  card.id = "gemini-suggestion-card";
  
  card.style.position = "absolute";
  card.style.left = `${rect.left + window.scrollX}px`;
  card.style.top = `${rect.top + window.scrollY + rect.height + 6}px`;
  card.style.backgroundColor = "#ffffff";
  card.style.border = "1px solid #e2e8f0";
  card.style.borderRadius = "10px";
  card.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.1)";
  card.style.width = "320px";
  card.style.zIndex = "1000000";
  card.style.padding = "12px";
  card.style.fontFamily = "-apple-system, BlinkMacSystemFont, sans-serif";
  card.style.fontSize = "13px";

  const isErrorCard = suggestions.isError ? true : false;

  card.innerHTML = `
    <div style="font-weight: bold; color: #4a5568; margin-bottom: 8px; border-bottom: 1px solid #edf2f7; padding-bottom: 4px; display: flex; justify-content: space-between;">
      <span>${isErrorCard ? 'System Alert' : 'AI Writing Options'}</span>
      <span id="close-gemini-card" style="cursor:pointer; color: #a0aec0;">✕</span>
    </div>
    <div class="gemini-opt" data-error="${isErrorCard}" data-text="${suggestions.formal.replace(/"/g, '&quot;')}" style="padding: 6px; cursor: pointer; border-radius: 6px; margin-bottom: 4px; background: #f7fafc;">
      <span style="font-weight: bold; color: #2b6cb0; font-size:11px; display:block; text-transform: uppercase;">💼 Professional</span>
      <span style="color: #2d3748;">${suggestions.formal}</span>
    </div>
    <div class="gemini-opt" data-error="${isErrorCard}" data-text="${suggestions.casual.replace(/"/g, '&quot;')}" style="padding: 6px; cursor: pointer; border-radius: 6px; margin-bottom: 4px; background: #f7fafc;">
      <span style="font-weight: bold; color: #b7791f; font-size:11px; display:block; text-transform: uppercase;">✨ Casual</span>
      <span style="color: #2d3748;">${suggestions.casual}</span>
    </div>
    <div class="gemini-opt" data-error="${isErrorCard}" data-text="${suggestions.simple.replace(/"/g, '&quot;')}" style="padding: 6px; cursor: pointer; border-radius: 6px; background: #f7fafc;">
      <span style="font-weight: bold; color: #2c5282; font-size:11px; display:block; text-transform: uppercase;">⚡ Simple</span>
      <span style="color: #2d3748;">${suggestions.simple}</span>
    </div>
  `;

  document.body.appendChild(card);
  document.getElementById("close-gemini-card").addEventListener("click", removeSuggestionCard);

  card.querySelectorAll(".gemini-opt").forEach(opt => {
    opt.addEventListener("mouseenter", () => opt.style.background = "#edf2f7");
    opt.addEventListener("mouseleave", () => opt.style.background = "#f7fafc");
    
    opt.addEventListener("mousedown", (e) => {
      e.preventDefault();
      
      if (opt.getAttribute("data-error") === "true") {
         // Agar Error card hai, toh text box par loader dikhao aur click par retry karo
         removeSuggestionCard();
         showLoader(element);
         try {
           chrome.runtime.sendMessage({ action: "translateSelection" });
         } catch(err) { removeLoader(); }
      } else {
         // Agar normal response card hai, toh text swap karo
         const newText = opt.getAttribute("data-text");
         if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
           element.value = newText;
         } else if (element.isContentEditable) {
           element.innerText = newText;
         }
         element.dispatchEvent(new Event('input', { bubbles: true }));
         removeSuggestionCard();
         showFloatingIcon(element);
      }
    });
  });
}

function removeSuggestionCard() {
  const existingCard = document.getElementById("gemini-suggestion-card");
  if (existingCard) existingCard.remove();
}

document.addEventListener("focusin", (e) => {
  let el = e.target;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable) {
    showFloatingIcon(el);
  }
});

document.addEventListener("focusout", (e) => {
  setTimeout(() => {
    if (document.activeElement !== currentActiveElement) {
      const card = document.getElementById("gemini-suggestion-card");
      if (!card || !card.contains(document.activeElement)) {
         removeFloatingIcon();
      }
    }
  }, 250);
});

if (chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let activeElement = document.activeElement;

    if (request.action === "getText") {
      if (!activeElement) return sendResponse({ text: null });
      let text = activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" ? activeElement.value : activeElement.innerText;
      
      if (text && text.trim() !== "") {
        showLoader(activeElement);
        sendResponse({ text: text });
      } else {
        sendResponse({ text: null });
      }
    }

    if (request.action === "showSuggestions") {
      removeLoader();
      if (activeElement) {
        createSuggestionCard(request.data, activeElement);
      }
      sendResponse({ success: true });
    }

    if (request.action === "hideLoader") {
      removeLoader();
      if (activeElement) showFloatingIcon(activeElement);
      sendResponse({ success: true });
    }
    return true;
  });
}