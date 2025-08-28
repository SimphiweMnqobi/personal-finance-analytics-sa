import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload, TrendingUp, PieChart as PieChartIcon, Lightbulb, Calendar, DollarSign, Target, AlertTriangle } from 'lucide-react';
import Papa from 'papaparse';

// Currency formatter for South African Rand
const formatZAR = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
};

// Sample data generator for South African context
const generateSampleData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const categories = [
    'Groceries', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 
    'Healthcare', 'Insurance', 'Restaurants'
  ];
  
  const saBusinesses = {
    'Groceries': ['Checkers', 'Pick n Pay', 'Woolworths', 'Spar', 'Shoprite'],
    'Transport': ['Shell', 'BP', 'Engen', 'Sasol', 'Uber', 'Bolt'],
    'Shopping': ['Mr Price', 'Edgars', 'Truworths', 'Game', 'Makro'],
    'Entertainment': ['Ster Kinekor', 'Nu Metro', 'DStv', 'Showmax', 'Netflix'],
    'Utilities': ['Eskom', 'City Power', 'Vodacom', 'MTN', 'Cell C'],
    'Healthcare': ['Clicks', 'Dis-Chem', 'Netcare', 'Life Healthcare'],
    'Insurance': ['Discovery', 'Old Mutual', 'Santam', 'Momentum'],
    'Restaurants': ['Nandos', 'KFC', 'McDonalds', 'Steers', 'Wimpy']
  };

  // Generate monthly data
  const monthlyData = months.map((month, index) => {
    const income = 25000 + Math.random() * 10000; // R25k - R35k
    const expenses = 18000 + Math.random() * 8000; // R18k - R26k
    const savings = income - expenses;
    const savingsRate = (savings / income) * 100;
    
    return {
      month,
      income: Math.round(income),
      expenses: Math.round(expenses),
      savings: Math.round(savings),
      savingsRate: Math.round(savingsRate * 10) / 10
    };
  });

  // Generate category data
  const categoryData = categories.map(category => {
    const spent = 1000 + Math.random() * 3000;
    const budget = spent * (1 + Math.random() * 0.3);
    const transactions = Math.floor(5 + Math.random() * 20);
    
    return {
      category,
      spent: Math.round(spent),
      budget: Math.round(budget),
      transactions,
      percentage: 0 // Will be calculated later
    };
  });

  // Calculate percentages
  const totalSpent = categoryData.reduce((sum, cat) => sum + cat.spent, 0);
  categoryData.forEach(cat => {
    cat.percentage = Math.round((cat.spent / totalSpent) * 1000) / 10;
  });

  // Generate daily spending data
  const dailyData = [];
  for (let i = 1; i <= 30; i++) {
    const amount = 50 + Math.random() * 500;
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    dailyData.push({
      day: i,
      amount: Math.round(amount),
      category
    });
  }

  // Generate transaction data
  const transactions = [];
  categories.forEach(category => {
    const businesses = saBusinesses[category] || ['Generic Business'];
    const transactionCount = Math.floor(5 + Math.random() * 15);
    
    for (let i = 0; i < transactionCount; i++) {
      const business = businesses[Math.floor(Math.random() * businesses.length)];
      const amount = -(50 + Math.random() * 500); // Negative for expenses
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));
      
      transactions.push({
        date: date.toISOString().split('T')[0],
        description: business,
        amount,
        category
      });
    }
  });

  // Add some income transactions
  for (let i = 0; i < 3; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    date.setDate(25); // Payday
    
    transactions.push({
      date: date.toISOString().split('T')[0],
      description: 'Salary',
      amount: 28000 + Math.random() * 5000,
      category: 'Income'
    });
  }

  return {
    monthlyData,
    categoryData,
    dailyData,
    transactions: transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
  };
};

// CSV Processing functions
const processCSVData = (csvData) => {
  const transactions = csvData.map(row => {
    // Handle different CSV formats from SA banks
    const date = row.Date || row.date || row['Transaction Date'] || row['Posting Date'];
    const description = row.Description || row.description || row.Reference || row.Narration;
    let amount = row.Amount || row.amount || row.Debit || row.Credit;
    
    // Handle separate debit/credit columns (common in SA banks)
    if (!amount && (row.Debit || row.Credit)) {
      amount = row.Credit ? parseFloat(row.Credit) : -parseFloat(row.Debit || 0);
    } else {
      amount = parseFloat(amount) || 0;
    }

    // Auto-categorize based on description
    const category = categorizeTransaction(description);

    return {
      date,
      description,
      amount,
      category
    };
  }).filter(t => t.date && t.description && !isNaN(t.amount));

  return analyzeTransactions(transactions);
};

const categorizeTransaction = (description) => {
  const desc = description.toLowerCase();
  
  // South African business categorization
  if (desc.includes('checkers') || desc.includes('pick n pay') || desc.includes('woolworths') || 
      desc.includes('spar') || desc.includes('shoprite')) return 'Groceries';
  if (desc.includes('shell') || desc.includes('bp') || desc.includes('engen') || 
      desc.includes('sasol') || desc.includes('uber') || desc.includes('bolt')) return 'Transport';
  if (desc.includes('mr price') || desc.includes('edgars') || desc.includes('truworths') || 
      desc.includes('game') || desc.includes('makro')) return 'Shopping';
  if (desc.includes('ster kinekor') || desc.includes('nu metro') || desc.includes('dstv') || 
      desc.includes('showmax') || desc.includes('netflix')) return 'Entertainment';
  if (desc.includes('eskom') || desc.includes('city power') || desc.includes('vodacom') || 
      desc.includes('mtn') || desc.includes('cell c')) return 'Utilities';
  if (desc.includes('clicks') || desc.includes('dis-chem') || desc.includes('netcare') || 
      desc.includes('life healthcare')) return 'Healthcare';
  if (desc.includes('discovery') || desc.includes('old mutual') || desc.includes('santam') || 
      desc.includes('momentum')) return 'Insurance';
  if (desc.includes('nandos') || desc.includes('kfc') || desc.includes('mcdonalds') || 
      desc.includes('steers') || desc.includes('wimpy')) return 'Restaurants';
  if (desc.includes('salary') || desc.includes('wage') || desc.includes('income')) return 'Income';
  
  return 'Other';
};

const analyzeTransactions = (transactions) => {
  // Group by month
  const monthlyData = {};
  const categoryData = {};
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = date.toLocaleString('en-ZA', { month: 'short' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0 };
    }
    
    if (t.amount > 0) {
      monthlyData[monthKey].income += t.amount;
    } else {
      monthlyData[monthKey].expenses += Math.abs(t.amount);
    }
    
    // Category analysis
    if (t.category !== 'Income') {
      if (!categoryData[t.category]) {
        categoryData[t.category] = { category: t.category, spent: 0, transactions: 0 };
      }
      categoryData[t.category].spent += Math.abs(t.amount);
      categoryData[t.category].transactions += 1;
    }
  });
  
  // Convert to arrays and add calculated fields
  const monthlyArray = Object.values(monthlyData).map(m => ({
    ...m,
    savings: m.income - m.expenses,
    savingsRate: m.income > 0 ? ((m.income - m.expenses) / m.income) * 100 : 0
  }));
  
  const totalCategorySpending = Object.values(categoryData).reduce((sum, cat) => sum + cat.spent, 0);
  const categoryArray = Object.values(categoryData).map(cat => ({
    ...cat,
    percentage: totalCategorySpending > 0 ? (cat.spent / totalCategorySpending) * 100 : 0,
    budget: cat.spent * 1.1 // Assume 10% over budget for demo
  }));
  
  // Generate daily data from recent transactions
  const dailyData = transactions
    .filter(t => {
      const date = new Date(t.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date >= thirtyDaysAgo && t.amount < 0;
    })
    .map(t => ({
      day: new Date(t.date).getDate(),
      amount: Math.abs(t.amount),
      category: t.category
    }));
  
  return {
    monthlyData: monthlyArray,
    categoryData: categoryArray,
    dailyData,
    transactions
  };
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [data, setData] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    // Load sample data on first render
    const sampleData = generateSampleData();
    setData(sampleData);
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      setUploadError('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setCsvFile(file);

    Papa.parse(file, {
      complete: (results) => {
        try {
          const processedData = processCSVData(results.data);
          setData(processedData);
          setActiveTab('overview');
          setIsUploading(false);
        } catch (error) {
          setUploadError('Error processing CSV file. Please check the format.');
          setIsUploading(false);
        }
      },
      header: true,
      skipEmptyLines: true,
      error: () => {
        setUploadError('Failed to parse CSV file');
        setIsUploading(false);
      }
    });
  };

  const loadSampleData = () => {
    const sampleData = generateSampleData();
    setData(sampleData);
    setActiveTab('overview');
    setCsvFile(null);
    setUploadError('');
  };

  const downloadTemplate = () => {
    const template = `Date,Description,Amount,Category
2024-01-15,Pick n Pay Groceries,-450.00,Groceries
2024-01-15,Shell Petrol,-850.00,Transport
2024-01-15,Salary,28000.00,Income
2024-01-16,DStv Payment,-799.00,Entertainment
2024-01-16,Eskom Electricity,-1200.00,Utilities`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'personal_finance_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!data) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  const UploadTab = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Financial Data</h2>
        
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">Upload your bank CSV file</p>
              <p className="text-sm text-gray-500">
                Supports exports from FNB, Standard Bank, ABSA, Nedbank, Capitec
              </p>
            </div>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
            >
              {isUploading ? 'Processing...' : 'Choose CSV File'}
            </label>
            
            {uploadError && (
              <p className="mt-2 text-red-600 text-sm">{uploadError}</p>
            )}
            
            {csvFile && !isUploading && !uploadError && (
              <p className="mt-2 text-green-600 text-sm">✓ {csvFile.name} uploaded successfully</p>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">Don't have a CSV file? Try our demo data:</p>
            <button
              onClick={loadSampleData}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Load Sample Data (ZAR)
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-2">Need help formatting your data?</p>
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Download CSV Template
            </button>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">CSV Format Requirements:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Columns: Date, Description, Amount (or Debit/Credit)</li>
            <li>• Date format: YYYY-MM-DD or DD/MM/YYYY</li>
            <li>• Negative amounts for expenses, positive for income</li>
            <li>• UTF-8 encoding recommended</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const OverviewTab = () => {
    const currentMonth = data.monthlyData[data.monthlyData.length - 1] || {};
    const avgSavingsRate = data.monthlyData.reduce((sum, m) => sum + m.savingsRate, 0) / data.monthlyData.length;
    const totalSaved = data.monthlyData.reduce((sum, m) => sum + m.savings, 0);

    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">{formatZAR(currentMonth.income || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatZAR(currentMonth.expenses || 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold text-blue-600">{formatPercentage(avgSavingsRate)}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Saved</p>
                <p className="text-2xl font-bold text-purple-600">{formatZAR(totalSaved)}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Monthly Trends Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Monthly Financial Overview</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R${(value/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatZAR(value)} />
              <Legend />
              <Bar dataKey="income" fill="#10B981" name="Income" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              <Bar dataKey="savings" fill="#3B82F6" name="Savings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const TrendsTab = () => (
    <div className="space-y-6">
      {/* Savings Rate Trend */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Savings Rate Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
            <Line 
              type="monotone" 
              dataKey="savingsRate" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ r: 6 }}
              name="Savings Rate"
            />
            <Line 
              type="monotone" 
              dataKey={() => 20} 
              stroke="#10B981" 
              strokeDasharray="5 5"
              name="Target (20%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Spending Pattern */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Daily Spending Pattern (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis tickFormatter={(value) => `R${value}`} />
            <Tooltip formatter={(value) => formatZAR(value)} />
            <Bar dataKey="amount" fill="#8884D8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Income vs Expenses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Monthly Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `R${(value/1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => formatZAR(value)} />
            <Legend />
            <Bar dataKey="income" fill="#10B981" name="Income" />
            <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const CategoriesTab = () => (
    <div className="space-y-6">
      {/* Category Pie Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Spending by Category</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="spent"
              >
                {data.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatZAR(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Details Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Category Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Spent</th>
                <th className="px-4 py-2 text-right">Budget</th>
                <th className="px-4 py-2 text-right">Transactions</th>
                <th className="px-4 py-2 text-right">Avg per Transaction</th>
                <th className="px-4 py-2 text-right">% of Total</th>
                <th className="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.categoryData.map((category, index) => {
                const avgTransaction = category.spent / category.transactions;
                const isOverBudget = category.spent > category.budget;
                
                return (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2 font-medium">{category.category}</td>
                    <td className="px-4 py-2 text-right">{formatZAR(category.spent)}</td>
                    <td className="px-4 py-2 text-right">{formatZAR(category.budget)}</td>
                    <td className="px-4 py-2 text-right">{category.transactions}</td>
                    <td className="px-4 py-2 text-right">{formatZAR(avgTransaction)}</td>
                    <td className="px-4 py-2 text-right">{formatPercentage(category.percentage)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        isOverBudget 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isOverBudget ? 'Over Budget' : 'On Track'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const InsightsTab = () => {
    const avgIncome = data.monthlyData.reduce((sum, m) => sum + m.income, 0) / data.monthlyData.length;
    const avgExpenses = data.monthlyData.reduce((sum, m) => sum + m.expenses, 0) / data.monthlyData.length;
    const avgSavingsRate = data.monthlyData.reduce((sum, m) => sum + m.savingsRate, 0) / data.monthlyData.length;
    const bestMonth = data.monthlyData.reduce((best, current) => 
      current.savingsRate > best.savingsRate ? current : best
    );
    const worstMonth = data.monthlyData.reduce((worst, current) => 
      current.savingsRate < worst.savingsRate ? current : worst
    );
    const topSpendingCategory = data.categoryData.reduce((top, current) => 
      current.spent > top.spent ? current : top
    );

    return (
      <div className="space-y-6">
        {/* Key Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-semibold mb-3 text-gray-800">📊 Key Metrics</h4>
            <ul className="space-y-2 text-sm">
              <li><strong>Average Income:</strong> {formatZAR(avgIncome)}</li>
              <li><strong>Average Expenses:</strong> {formatZAR(avgExpenses)}</li>
              <li><strong>Average Savings Rate:</strong> {formatPercentage(avgSavingsRate)}</li>
              <li><strong>Best Month:</strong> {bestMonth.month} ({formatPercentage(bestMonth.savingsRate)})</li>
              <li><strong>Worst Month:</strong> {worstMonth.month} ({formatPercentage(worstMonth.savingsRate)})</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-semibold mb-3 text-gray-800">✅ Positive Trends</h4>
            <ul className="space-y-2 text-sm text-green-700">
              {avgSavingsRate > 15 && <li>• Excellent savings rate above 15%</li>}
              {avgSavingsRate > 10 && avgSavingsRate <= 15 && <li>• Good savings rate above 10%</li>}
              <li>• Consistent income tracking</li>
              <li>• Detailed expense categorization</li>
              {data.categoryData.filter(c => c.spent < c.budget).length > 0 && 
                <li>• {data.categoryData.filter(c => c.spent < c.budget).length} categories under budget</li>
              }
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-semibold mb-3 text-gray-800">⚠️ Areas for Improvement</h4>
            <ul className="space-y-2 text-sm text-yellow-700">
              {avgSavingsRate < 10 && <li>• Savings rate below 10% (SA average)</li>}
              {topSpendingCategory.percentage > 30 && 
                <li>• {topSpendingCategory.category} takes up {formatPercentage(topSpendingCategory.percentage)} of budget</li>
              }
              {data.categoryData.filter(c => c.spent > c.budget).length > 0 && 
                <li>• {data.categoryData.filter(c => c.spent > c.budget).length} categories over budget</li>
              }
              <li>• Consider emergency fund building</li>
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Lightbulb className="mr-2 text-yellow-500" />
            Data-Driven Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">💰 Savings Opportunities</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>
                    If you reduce {topSpendingCategory.category} by 10%, you could save an additional 
                    <strong> {formatZAR(topSpendingCategory.spent * 0.1)}</strong> per month
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>
                    Target 20% savings rate to save <strong>{formatZAR(avgIncome * 0.2 - (avgIncome - avgExpenses))}</strong> more monthly
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>
                    Review subscription services and unused memberships for potential savings
                  </span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">📈 Investment Advice (SA Context)</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>
                    Max out TFSA: Save up to <strong>R36,000</strong> tax-free annually
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>
                    Consider unit trusts or ETFs for long-term growth (target 8-12% returns)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>
                    Build emergency fund: 3-6 months expenses = <strong>{formatZAR(avgExpenses * 4)}</strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* South African Financial Context */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">🇿🇦 South African Financial Context</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">How You Compare (SA Averages)</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <strong>Your Savings Rate:</strong> {formatPercentage(avgSavingsRate)}
                  <br />
                  <span className="text-gray-600">SA Average: -0.1% (negative savings rate)</span>
                  {avgSavingsRate > 0 ? 
                    <span className="text-green-600 ml-2">✓ Above average</span> : 
                    <span className="text-red-600 ml-2">⚠ Below average</span>
                  }
                </li>
                <li>
                  <strong>Recommended Savings:</strong> 15-20% of income
                  <br />
                  <span className="text-gray-600">Your target: {formatZAR(avgIncome * 0.15)} - {formatZAR(avgIncome * 0.2)}</span>
                </li>
                <li>
                  <strong>Inflation Context:</strong> Plan for 5-7% annual inflation
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Tax-Optimized Saving (2024)</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>TFSA Limit:</strong> R36,000 per year</li>
                <li><strong>Retirement Annuity:</strong> 27.5% of taxable income (max R350k)</li>
                <li><strong>Medical Aid Credits:</strong> Available tax benefits</li>
                <li><strong>Section 12J:</strong> Venture capital tax incentives</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Warnings and Alerts */}
        {(avgSavingsRate < 5 || data.categoryData.some(c => c.spent > c.budget * 1.2)) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <AlertTriangle className="text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-red-800">Financial Alerts</h3>
            </div>
            <ul className="space-y-2 text-sm text-red-700">
              {avgSavingsRate < 5 && (
                <li>• Critical: Savings rate below 5% - consider urgent budget review</li>
              )}
              {data.categoryData.filter(c => c.spent > c.budget * 1.2).map(cat => (
                <li key={cat.category}>
                  • {cat.category} spending is {formatPercentage((cat.spent/cat.budget - 1) * 100)} over budget
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Methodology */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Analytics Methodology</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Data Processing:</strong> Transactions categorized using merchant name matching and keyword analysis</p>
            <p><strong>Savings Rate:</strong> Calculated as (Income - Expenses) / Income × 100</p>
            <p><strong>Trend Analysis:</strong> Monthly aggregation with moving averages</p>
            <p><strong>Category Analysis:</strong> Spending distribution and budget variance calculations</p>
            <p><strong>Benchmarking:</strong> Compared against South African household savings statistics</p>
            <p><strong>Recommendations:</strong> Based on spending patterns, SA financial best practices, and tax optimization</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  🇿🇦 Personal Finance Analytics
                </h1>
                <p className="text-gray-600">South African Financial Dashboard</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {csvFile ? `Data from: ${csvFile.name}` : 'Using sample data'}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-4 overflow-x-auto">
              <TabButton 
                id="upload" 
                icon={Upload} 
                label="Data Upload" 
                isActive={activeTab === 'upload'}
                onClick={setActiveTab}
              />
              <TabButton 
                id="overview" 
                icon={TrendingUp} 
                label="Overview" 
                isActive={activeTab === 'overview'}
                onClick={setActiveTab}
              />
              <TabButton 
                id="trends" 
                icon={TrendingUp} 
                label="Trends" 
                isActive={activeTab === 'trends'}
                onClick={setActiveTab}
              />
              <TabButton 
                id="categories" 
                icon={PieChartIcon} 
                label="Categories" 
                isActive={activeTab === 'categories'}
                onClick={setActiveTab}
              />
              <TabButton 
                id="insights" 
                icon={Lightbulb} 
                label="Insights" 
                isActive={activeTab === 'insights'}
                onClick={setActiveTab}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && <UploadTab />}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'trends' && <TrendsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'insights' && <InsightsTab />}
      </div>
    </div>
  );
}

export default App;