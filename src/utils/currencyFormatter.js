// South African Rand formatter
export const formatZAR = (amount, showSymbol = true) => {
  const formatter = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  if (showSymbol) {
    return formatter.format(amount);
  } else {
    return formatter.format(amount).replace('R', '').trim();
  }
};

// Format large numbers with K/M suffix
export const formatCompactZAR = (amount) => {
  if (amount >= 1000000) {
    return `R${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `R${(amount / 1000).toFixed(1)}K`;
  } else {
    return formatZAR(amount);
  }
};

// Percentage formatter
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};