// ==========================================================================
// BREATHLY / RESET — Google Gemini AI Coach Controller
// Calls Google Gemini REST API using secure server-side environment variables.
// ==========================================================================

/**
 * Handle conversational AI coaching requests via Google Gemini
 */
exports.chatWithGemini = async (req, res) => {
  try {
    const { message, context } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required.'
      });
    }

    // Retrieve API key from request body or environment variables
    const apiKey =
      (req.body && req.body.apiKey) ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn('[Gemini Coach] GEMINI_API_KEY not configured on server or request.');
      return res.json({
        success: false,
        error: 'No Gemini API key configured.',
        isOffline: true
      });
    }

    // Prepare contextual user summary for the prompt
    let contextSummary = 'No specific habit telemetry provided.';
    if (context && typeof context === 'object') {
      const parts = [];
      if (context.userName) parts.push(`User Name: ${context.userName}`);
      if (context.statusTitle) parts.push(`Current Well-Being Status: ${context.statusTitle}`);
      if (context.workload) parts.push(`Daily Workload: ${context.workload}`);
      if (context.sleepQuality) parts.push(`Sleep Quality: ${context.sleepQuality}`);
      if (context.stressRating) parts.push(`Pressure/Stress Rating: ${context.stressRating}/10`);
      if (context.topDistraction) parts.push(`Top Interruption: ${context.topDistraction}`);
      if (context.habitsCount !== undefined) {
        parts.push(`Habits: ${context.completedHabits || 0}/${context.habitsCount} completed today`);
      }
      if (context.isHighStressState) parts.push('Stress State: Elevated/High Cognitive Load');
      if (parts.length > 0) {
        contextSummary = parts.join(' | ');
      }
    }

    // Construct System Instruction for Compassionate, User-Centered Stress Relief Chatbot
    const systemPrompt = `You are a warm, deeply empathetic, non-judgmental, and understanding companion and conversational AI designed to support people dealing with stress, exhaustion, anxiety, burnout, emotional heaviness, or daily life questions.

Core Guidelines:
1. USER'S POINT OF VIEW FIRST: Always answer from the user's perspective. Validate their feelings, thoughts, questions, and physical or emotional state with genuine care. Never dismiss, patronize, judge, or invalidate what they are thinking or experiencing.
2. DO NOT ALTER OR ARGUE WITH THEIR THOUGHTS: Do not try to correct them, toxic-positively spin their words, force unwanted advice, or lecture them. Meet them right where they are emotionally. If they feel like resting, eating, crying, venting, or taking a break, support their human need completely.
3. ANSWER ANY TOPIC NATURALLY & DIRECTLY: You are a versatile, open-ended conversational companion. Whatever the user asks—whether about food and nutrition ("what can i eat"), relationships, work stress, tiredness, hobbies, movies, venting, or everyday curiosity—answer their exact question directly and helpfully.
   - Example (Food / Appetite): If asked "what can i eat", recommend gentle, comforting, stress-relieving, low-effort options (e.g. warm soups or broth, banana with peanut butter, oatmeal with honey, dark chocolate, a handful of nuts, calming herbal tea like chamomile, or simple hydration) that don't overwhelm someone with high prep work.
4. TONE & LENGTH: Keep responses warm, soothing, grounded, and concise (2-4 gentle sentences or short paragraphs). Speak like a caring, attentive friend.
5. NO FORCED APP PROMOTIONS: Do NOT force app features (like Pomodoro timers, habit tracking, or breathing exercises) unless the user specifically and explicitly asks for them. Keep the conversation natural, authentic, and comforting.`;

    const requestPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nUser Question/Message: "${message.trim()}"` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        topP: 0.9
      }
    };

    // Attempt model call across active Gemini models
    const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];
    let geminiResponse = null;
    let selectedModel = modelsToTry[0];
    let lastError = null;

    for (const model of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        });

        if (response.ok) {
          geminiResponse = await response.json();
          selectedModel = model;
          break;
        } else {
          const errBody = await response.text();
          lastError = `${model} returned status ${response.status}: ${errBody.substring(0, 150)}`;
          console.warn(`[Gemini Coach] ${lastError}`);
        }
      } catch (networkErr) {
        lastError = `Network error calling ${model}: ${networkErr.message}`;
        console.warn(`[Gemini Coach] ${lastError}`);
      }
    }

    if (!geminiResponse || !geminiResponse.candidates || !geminiResponse.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error(lastError || 'No valid response received from Gemini API');
    }

    const replyText = geminiResponse.candidates[0].content.parts[0].text.trim();

    // Determine if an action button should accompany the reply (ONLY if user explicitly requested it)
    let actionType = null;
    const lowerUserMsg = message.toLowerCase();
    if (lowerUserMsg.includes('bubble rhythm') || lowerUserMsg.includes('play bubble') || lowerUserMsg.includes('bubble game')) {
      actionType = 'play-bubble-rhythm';
    } else if (lowerUserMsg.includes('pomodoro') || lowerUserMsg.includes('start timer') || lowerUserMsg.includes('focus timer') || lowerUserMsg.includes('study sprint')) {
      actionType = 'start-focus-sprint';
    } else if (lowerUserMsg.includes('box breathing') || lowerUserMsg.includes('breathing exercise') || lowerUserMsg.includes('4-7-8')) {
      actionType = 'quick-reset';
    }

    return res.json({
      success: true,
      reply: replyText,
      actionType,
      model: selectedModel
    });

  } catch (error) {
    console.error('[Gemini Coach Error]:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error communicating with Gemini AI'
    });
  }
};
