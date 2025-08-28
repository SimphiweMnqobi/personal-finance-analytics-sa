// South African specific categories and keywords
export const categoryKeywords = {
  'Food & Groceries': [
    'checkers', 'shoprite', 'pick n pay', 'woolworths', 'spar', 'food lover',
    'restaurant', 'cafe', 'mcdonalds', 'kfc', 'nandos', 'steers', 'wimpy',
    'grocery', 'supermarket', 'food', 'dining', 'takeaway'
  ],
  'Transportation': [
    'shell', 'bp', 'caltex', 'engen', 'sasol', 'total', 'petrol', 'fuel',
    'uber', 'bolt', 'taxi', 'parking', 'gautrain', 'metrobus',
    'car payment', 'vehicle', 'aa', 'automobile'
  ],
  'Shopping': [
    'edgars', 'truworths', 'mr price', 'foschini', 'woolworths',
    'game', 'makro', 'builders warehouse', 'pep', 'ackermans',
    'takealot', 'amazon', 'clothing', 'mall', 'shopping centre'
  ],
  'Entertainment': [
    'ster kinekor', 'nu metro', 'netflix', 'dstv', 'showmax',
    'multichoice', 'cinema', 'movie', 'bar', 'club', 'entertainment'
  ],
  'Utilities & Services': [
    'eskom', 'city power', 'municipality', 'rates', 'electricity',
    'water', 'telkom', 'vodacom', 'mtn', 'cell c', 'rain',
    'internet', 'fibre', 'dstv', 'insurance', 'discovery'
  ],
  'Healthcare': [
    'clicks', 'dis-chem', 'pharmacy', 'doctor', 'hospital', 'medical',
    'dental', 'discovery health', 'momentum', 'medscheme', 'health'
  ],
  'Banking & Finance': [
    'fnb', 'standard bank', 'absa', 'nedbank', 'capitec',
    'bank charges', 'atm', 'service fee', 'interest', 'loan'
  ],
  'Education': [
    'school fees', 'university', 'wits', 'uct', 'stellenbosch',
    'tuition', 'books', 'education', 'course', 'training'
  ]
};

export const categorizeTransaction = (description) => {
  const desc = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
};