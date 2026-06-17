const sizeChart = [
  { size: 'S', chestMin: 91, chestMax: 96, heightMin: 155, heightMax: 168, weightMin: 45, weightMax: 62 },
  { size: 'M', chestMin: 97, chestMax: 102, heightMin: 163, heightMax: 178, weightMin: 58, weightMax: 75 },
  { size: 'L', chestMin: 103, chestMax: 108, heightMin: 170, heightMax: 185, weightMin: 68, weightMax: 85 },
  { size: 'XL', chestMin: 109, chestMax: 114, heightMin: 175, heightMax: 190, weightMin: 78, weightMax: 98 },
  { size: '2XL', chestMin: 115, chestMax: 120, heightMin: 180, heightMax: 198, weightMin: 88, weightMax: 110 },
  { size: '3XL', chestMin: 121, chestMax: 130, heightMin: 185, heightMax: 210, weightMin: 100, weightMax: 130 },
]

const skinToneColors = {
  fair: { labelAr: 'فاتحة', labelEn: 'Fair', colors: ['Black', 'Navy', 'Dark Green', 'Burgundy', 'Purple', 'Gray'] },
  medium: { labelAr: 'متوسطة', labelEn: 'Medium', colors: ['White', 'Gray', 'Olive', 'Teal', 'Coral', 'Cream'] },
  olive: { labelAr: 'زيتونية', labelEn: 'Olive', colors: ['Cream', 'Brown', 'Olive Green', 'Beige', 'Burgundy', 'Navy'] },
  dark: { labelAr: 'غامقة', labelEn: 'Dark', colors: ['White', 'Yellow', 'Red', 'Orange', 'Gold', 'Royal Blue'] },
}

const bodyTypeCategories = {
  slim: { labelAr: 'نحيف', labelEn: 'Slim', categories: ['T-Shirts', 'Hoodies'] },
  athletic: { labelAr: 'رياضي', labelEn: 'Athletic', categories: ['T-Shirts', 'Hoodies'] },
  average: { labelAr: 'متوسط', labelEn: 'Average', categories: ['T-Shirts', 'Hoodies', 'Accessories'] },
  plus: { labelAr: 'ممتلئ', labelEn: 'Plus Size', categories: ['Hoodies', 'Accessories'] },
}

export function estimateSize(height, weight) {
  if (!height || !weight) return null
  const h = Number(height)
  const w = Number(weight)
  let best = sizeChart[2]
  let minDiff = Infinity
  for (const s of sizeChart) {
    const hMid = (s.heightMin + s.heightMax) / 2
    const wMid = (s.weightMin + s.weightMax) / 2
    const diff = Math.abs(h - hMid) * 0.4 + Math.abs(w - wMid) * 0.6
    if (diff < minDiff) { minDiff = diff; best = s }
  }
  const maxH = sizeChart.reduce((m, s) => Math.max(m, s.heightMax), 0)
  const maxW = sizeChart.reduce((m, s) => Math.max(m, s.weightMax), 0)
  if (h > sizeChart[sizeChart.length - 1].heightMax || w > sizeChart[sizeChart.length - 1].weightMax) {
    return { ...sizeChart[sizeChart.length - 1], note: true }
  }
  return best
}

export function estimateBodyType(height, weight) {
  if (!height || !weight) return 'average'
  const h = Number(height) / 100
  const w = Number(weight)
  const bmi = w / (h * h)
  if (bmi < 18.5) return 'slim'
  if (bmi < 25) return 'athletic'
  if (bmi < 30) return 'average'
  return 'plus'
}

export function getSkinToneColors(skinTone) {
  return skinToneColors[skinTone] || skinToneColors.medium
}

export function getBodyTypeCategories(bodyType) {
  return bodyTypeCategories[bodyType] || bodyTypeCategories.average
}

export function recommendProducts(products, { height, weight, skinTone, bodyType, stylePreference, category }) {
  const bt = bodyType || estimateBodyType(height, weight)
  const size = estimateSize(height, weight)
  const tone = getSkinToneColors(skinTone || 'medium')

  let filtered = [...products]

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category)
  } else {
    const cats = getBodyTypeCategories(bt)
    filtered = filtered.filter(p => cats.categories.includes(p.category))
  }

  if (stylePreference) {
    const pref = stylePreference.toLowerCase()
    filtered = filtered.filter(p =>
      (p.name || '').toLowerCase().includes(pref) ||
      (p.nameAr || '').toLowerCase().includes(pref) ||
      (p.description || '').toLowerCase().includes(pref)
    )
  }

  if (filtered.length < 3) {
    filtered = products.filter(p => {
      const cats = getBodyTypeCategories(bt)
      return cats.categories.includes(p.category)
    })
  }

  const scored = filtered.map(p => {
    let score = 0
    if (size && p.sizes && p.sizes.includes(size.size)) score += 30
    else if (!p.sizes) score += 15
    if (p.sale) score += 10
    const nameLower = (p.name || '').toLowerCase() + ' ' + (p.nameAr || '').toLowerCase()
    if (tone.colors.some(c => nameLower.includes(c.toLowerCase()))) score += 20
    return { ...p, score, recommendedSize: size?.size || null }
  })

  scored.sort((a, b) => b.score - a.score)
  return {
    recommendations: scored.slice(0, 6),
    size: size?.size || null,
    bodyType: bt,
    skinToneInfo: tone,
    sizeNote: size?.note,
  }
}

const sizeGuideText = `📏 **Size Guide:**
S: Chest 91-96 cm
M: Chest 97-102 cm
L: Chest 103-108 cm
XL: Chest 109-114 cm
2XL: Chest 115-120 cm
3XL: Chest 121-126 cm`

const skinTones = ['fair', 'medium', 'olive', 'dark']

export { skinTones, sizeGuideText, sizeChart }
