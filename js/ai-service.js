export async function callAIApi(store, systemPrompt, userPrompt) {
  const config = store.getAIConfig()
  if (!config.apiKey) {
    return null
  }

  try {
    const baseUrl = config.baseUrl.replace(/\/+$/, '')
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1024
      })
    })

    if (!response.ok) {
      const err = await response.text().catch(() => '')
      console.warn('AI API error:', response.status, err)
      return null
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || null
  } catch (e) {
    console.warn('AI API call failed:', e.message)
    return null
  }
}
