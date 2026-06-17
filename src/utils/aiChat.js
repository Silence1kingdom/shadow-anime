const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2'

export async function getAIChatResponse({ message, products, settings, lang, history = [] }) {
  const apiKey = settings.aiApiKey || ''
  const model = settings.aiModel || DEFAULT_MODEL

  if (!apiKey) return null

  const name = settings.siteName || 'Shadow Anime'
  const currency = settings.currency || 'EGP'
  const shipping = settings.shipping || 50
  const threshold = settings.freeShippingThreshold || 1000
  const whatsapp = settings.whatsapp || '+20 104 262 614'
  const email = settings.email || 'vectorblack03@gmail.com'

  const productList = products.slice(0, 30).map(p =>
    `- ${p.name}${p.nameAr ? ' / ' + p.nameAr : ''} (${currency} ${p.price}, Category: ${p.category})`
  ).join('\n')

  const langInstruction = lang === 'ar'
    ? 'تحدث باللغة العربية. كن مفيداً ومختصراً.'
    : 'Respond in English. Be helpful and concise.'

  const systemPrompt = `You are a helpful customer support AI for "${name}", an anime merchandise store. Answer questions about products, orders, shipping, and general inquiries.

Store Info:
- Name: ${name}
- Currency: ${currency}
- Shipping cost: ${currency} ${shipping} (free for orders over ${currency} ${threshold})
- WhatsApp: ${whatsapp}
- Email: ${email}
- Payment: Credit/Debit Card, PayPal, Vodafone Cash, Etisalat Cash, Orange Cash, We Cash
- Shipping: 3-7 business days across Egypt

Available Products:
${productList}

${langInstruction}
Keep responses under 150 words. Use emojis. If the user asks about something specific that matches a product, recommend it with its price. If you don't know something, say so politely.`

  const conversation = history.slice(-6).map(m =>
    `${m.side === 'user' ? 'User' : 'Assistant'}: ${m.text}`
  ).join('\n')

  const prompt = `${systemPrompt}\n\n${conversation}\nUser: ${message}\nAssistant:`

  try {
    const resp = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 300, temperature: 0.7, top_p: 0.9, do_sample: true },
      }),
    })

    if (!resp.ok) {
      if (resp.status === 503) {
        const data = await resp.json()
        if (data.estimated_time) {
          await new Promise(r => setTimeout(r, (data.estimated_time + 1) * 1000))
          return getAIChatResponse({ message, products, settings, lang, history })
        }
      }
      return null
    }

    const data = await resp.json()
    let text = ''
    if (Array.isArray(data)) {
      text = data[0]?.generated_text || ''
    } else if (data.generated_text) {
      text = data.generated_text
    }

    text = text.replace(prompt, '').trim()
    if (!text) return null

    return { text }
  } catch {
    return null
  }
}

export function getDefaultModel() {
  return DEFAULT_MODEL
}
