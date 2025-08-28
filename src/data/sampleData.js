import { categoryKeywords } from '../utils/categoryMapper';

export const generateSampleData = () => {
  const categories = Object.keys(categoryKeywords);
  const transactions = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);
  
  // Generate monthly salary (average South African salary ranges)
  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    date.setDate(25); // Salary day
    
    transactions.push({
      date: date.toISOString().split('T')[0],
      description: 'Salary Deposit',
      amount: (25000 + Math.random() * 10000).toFixed(2), // R25k-R35k range
      type: 'credit',
      category: 'Income'
    });
  }
  
  // Generate expense transactions with South African context
  const expenseDescriptions = {
    'Food & Groceries': ['Checkers Purchase', 'Pick n Pay', 'Woolworths Food', 'Nandos', 'KFC'],
    'Transportation': ['Shell Petrol', 'Uber Trip', 'Gautrain', 'Parking'],
    'Shopping': ['Mr Price', 'Takealot Order', 'Edgars', 'Game Store'],
    'Entertainment': ['Ster Kinekor', 'Netflix', 'DStv Subscription'],
    'Utilities & Services': ['Eskom Bill', 'Vodacom', 'City Rates', 'Discovery Insurance'],
    'Healthcare': ['Clicks Pharmacy', 'Dr Consultation', 'Medical Aid'],
    'Banking & Finance': ['FNB Service Fee', 'ATM Withdrawal'],
    'Education': ['School Fees', 'University Tuition']
  };
  
  // Generate 300 expense transactions
  for (let i = 0; i < 300; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * 365));
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const descriptions = expenseDescriptions[category] || ['General Purchase'];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    // Realistic South African spending amounts by category
    let amount;
    switch (category) {
      case 'Food & Groceries':
        amount = -(Math.random() * 800 + 200); // R200-R1000
        break;
      case 'Transportation':
        amount = -(Math.random() * 600 + 100); // R100-R700
        break;
      case 'Utilities & Services':
        amount = -(Math.random() * 1500 + 500); // R500-R2000
        break;
      case 'Healthcare':
        amount = -(Math.random() * 1000 + 200); // R200-R1200
        break;
      default:
        amount = -(Math.random() * 500 + 50); // R50-R550
    }
    
    transactions.push({
      date: date.toISOString().split('T')[0],
      description: description,
      amount: amount.toFixed(2),
      type: 'debit',
      category: category
    });
  }
  
  return transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
};