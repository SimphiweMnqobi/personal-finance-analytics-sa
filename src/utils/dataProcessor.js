import { categorizeTransaction } from './categoryMapper';

export const processCSVData = (csvData) => {
  return csvData.map(row => {
    // Handle different South African bank CSV formats
    const date = row.Date || row.date || row['Transaction Date'] || row['Post Date'];
    const description = row.Description || row.description || row.Reference || row.Memo;
    let amount = parseFloat(row.Amount || row.amount || row.Debit || row.Credit || 0);
    
    // Handle separate debit/credit columns (common in SA banks)
    if (row.Debit && row.Credit) {
      amount = parseFloat(row.Credit || 0) - parseFloat(row.Debit || 0);
    }
    
    const type = amount > 0 ? 'credit' : 'debit';
    
    return {
      date: new Date(date).toISOString().split('T')[0],
      description: description || 'Unknown Transaction',
      amount: amount,
      type: type,
      category: categorizeTransaction(description || '')
    };
  }).filter(transaction => 
    transaction.date !== 'Invalid Date' && 
    !isNaN(transaction.amount) &&
    Math.abs(transaction.amount) > 0.01 // Filter out tiny amounts
  );
};

export const analyzeData = (transactions) => {
  if (!transactions || transactions.length === 0) return null;
  
  const monthlyData = {};
  const categoryData = {};
  const dailySpending = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dayKey = transaction.date;
    
    // Monthly aggregation
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { 
        income: 0, 
        expenses: 0, 
        month: date.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' }) 
      };
    }
    
    if (transaction.amount > 0) {
      monthlyData[monthKey].income += transaction.amount;
    } else {
      monthlyData[monthKey].expenses += Math.abs(transaction.amount);
    }
    
    // Category aggregation (expenses only)
    if (transaction.amount < 0) {
      if (!categoryData[transaction.category]) {
        categoryData[transaction.category] = { 
          category: transaction.category, 
          amount: 0, 
          transactions: 0 
        };
      }
      categoryData[transaction.category].amount += Math.abs(transaction.amount);
      categoryData[transaction.category].transactions += 1;
    }
    
    // Daily spending (last 30 days, expenses only)
    if (transaction.amount < 0) {
      if (!dailySpending[dayKey]) {
        dailySpending[dayKey] = { day: dayKey, spending: 0 };
      }
      dailySpending[dayKey].spending += Math.abs(transaction.amount);
    }
  });
  
  // Calculate savings and savings rate
  const monthlyArray = Object.values(monthlyData).map(month => ({
    ...month,
    savings: month.income - month.expenses,
    savingsRate: month.income > 0 ? ((month.income - month.expenses) / month.income * 100) : 0
  }));
  
  // Get last 30 days of spending
  const dailyArray = Object.values(dailySpending)
    .sort((a, b) => new Date(a.day) - new Date(b.day))
    .slice(-30);
  
  return {
    monthlyData: monthlyArray,
    categoryData: Object.values(categoryData),
    dailySpending: dailyArray,
    totalTransactions: transactions.length
  };
};