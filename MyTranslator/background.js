import './config.js';

const MODEL_QUEUE = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemma-4-31b-it"
];

async function callGeminiForSuggestions(text) {
    if (!text || text.trim() === "") return null;

    // Global context se key read karein
    const apiKey = self.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found in config.js file.");
    }

    const promptText = `Analyze the text and return 3 English variations: formal, casual, simple.
Text: "${text}"
Return ONLY raw JSON object string with keys "formal", "casual", and "simple". No codeblocks, no markdown, no backticks, no markdown fence.`;

    let lastError = null;

    for (const modelName of MODEL_QUEUE) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                lastError = new Error(errorData.error?.message || `Status ${response.status}`);
                continue; 
            }

            const data = await response.json();
            let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) continue;

            rawText = rawText.trim();
            if (rawText.includes("```")) {
                rawText = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
            }
            
            const startIdx = rawText.indexOf("{");
            const endIdx = rawText.lastIndexOf("}");
            if (startIdx !== -1 && endIdx !== -1) {
                rawText = rawText.substring(startIdx, endIdx + 1);
            }

            return JSON.parse(rawText);

        } catch (err) {
            lastError = err;
        }
    }
    throw lastError || new Error("Pipeline Error");
}

function safelySendMessage(tabId, message) {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) resolve(null); 
            else resolve(response);
        });
    });
}

async function processTranslation(tabId) {
    const response = await safelySendMessage(tabId, { action: "getText" });
    if (!response || !response.text) return;

    try {
        const suggestions = await callGeminiForSuggestions(response.text);
        if (suggestions) {
            await safelySendMessage(tabId, { action: "showSuggestions", data: suggestions });
        }
    } catch (apiError) {
        await safelySendMessage(tabId, { action: "hideLoader" });

        const errorMessage = apiError?.message || "Translation failed.";
        const retrySuggestion = {
            formal: errorMessage,
            casual: errorMessage,
            simple: errorMessage,
            isError: true
        };
        await safelySendMessage(tabId, { action: "showSuggestions", data: retrySuggestion });
    }
}

async function translateCurrentTab(tabId) {
    try {
        await processTranslation(tabId);
    } catch (error) {
        try {
            await chrome.scripting.executeScript({ target: { tabId: tabId }, files: ["content.js"] });
            setTimeout(() => { processTranslation(tabId); }, 250);
        } catch (e) {}
    }
}

chrome.commands.onCommand.addListener((command) => {
    if (command === "convert-text") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id && !tabs[0].url.startsWith("chrome://")) {
                translateCurrentTab(tabs[0].id);
            }
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "translateSelection") {
        const tabId = sender.tab?.id;
        if (tabId) translateCurrentTab(tabId);
        sendResponse({ success: true });
        return true; 
    }
    return false;
});