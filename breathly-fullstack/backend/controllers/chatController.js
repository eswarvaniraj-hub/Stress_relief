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

    // Construct System Instruction for Reset Digital Coach
    const systemPrompt = `You are Reset Coach, an empathetic, intelligent, and scientifically-grounded digital well-being and habit mentor built into the Breathly/Reset platform.
Your mission is to help users with focus, overcoming procrastination, daily habits, stress management, sleep, study techniques, and mindful balance.

User Context:
${contextSummary}

Core Guidelines:
1. Directly and accurately answer the user's specific question or request. Whatever the user asks—be it basic science, definitions, study advice, daily routine, or emotional check-in—address their exact inquiry first.
2. Be warm, empathetic, conversational, and concise (keep responses to 2-4 clear sentences or short paragraphs; never lecture or write walls of text).
3. Ground habit or focus advice in behavioral neuroscience (e.g. lowering friction, micro-steps, 25-minute Pomodoro sprints, 4-7-8 breathing, or non-screen recovery).
4. Do NOT repeat canned scripts or force irrelevant recommendations if the user is asking a direct question.
5. Do NOT provide clinical or medical diagnoses. Keep guidance practical, supportive, and actionable.`;

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
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
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

    // Determine if an action button should accompany the reply
    let actionType = null;
    const lowerReply = (replyText + ' ' + message).toLowerCase();
    if (lowerReply.includes('bubble rhythm') || lowerReply.includes('bubble break') || lowerReply.includes('pop bubble')) {
      actionType = 'play-bubble-rhythm';
    } else if (lowerReply.includes('pomodoro') || lowerReply.includes('focus block') || lowerReply.includes('focus sprint') || lowerReply.includes('25-minute')) {
      actionType = 'start-focus-sprint';
    } else if (lowerReply.includes('minimum mode') || lowerReply.includes('micro-dose') || lowerReply.includes('micro step')) {
      actionType = 'min-mode-all';
    } else if (lowerReply.includes('box breathing') || lowerReply.includes('breathing reset') || lowerReply.includes('4-7-8')) {
      actionType = 'quick-reset';
    } else if (lowerReply.includes('distraction radar') || lowerReply.includes('interruption')) {
      actionType = 'open-radar';
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
