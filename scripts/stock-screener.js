// Define our screening parameters
const VOLATILITY_THRESHOLD = 20 // Maximum historical volatility (%)
const MA_LENGTH = 50 // Moving average length (days)
const MIN_PERCENT_BELOW_MA = 5 // Minimum percentage below moving average
const MIN_VOLUME = 500000 // Minimum daily trading volume

// For demonstration, we'll use a list of ETFs that often contain low-volatility stocks
const LOW_VOLATILITY_ETFS = [
  "SPLV", // Invesco S&P 500 Low Volatility ETF
  "USMV", // iShares MSCI USA Min Vol Factor ETF
  "XMLV", // Invesco S&P MidCap Low Volatility ETF
  "XLP", // Consumer Staples Select Sector SPDR Fund
  "XLU", // Utilities Select Sector SPDR Fund
  "VNQ", // Vanguard Real Estate ETF
  "FDLO", // Fidelity Low Volatility Factor ETF
]

// Function to calculate historical volatility
function calculateVolatility(prices, days = 20) {
  if (prices.length < days) return null

  // Calculate daily returns
  const returns = []
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
  }

  // Calculate standard deviation of returns
  const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length
  const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length
  const stdDev = Math.sqrt(variance)

  // Annualize the volatility (multiply by sqrt of trading days in a year)
  return stdDev * Math.sqrt(252) * 100
}

// Function to calculate moving average
function calculateMA(prices, length) {
  if (prices.length < length) return null

  const maValues = []
  for (let i = length - 1; i < prices.length; i++) {
    const slice = prices.slice(i - length + 1, i + 1)
    const ma = slice.reduce((sum, price) => sum + price, 0) / length
    maValues.push(ma)
  }

  return maValues
}

// Main screening function
async function screenStocks() {
  console.log("Starting stock screener...")
  console.log(`Looking for stocks with:`)
  console.log(`- Volatility below ${VOLATILITY_THRESHOLD}%`)
  console.log(`- At least ${MIN_PERCENT_BELOW_MA}% below ${MA_LENGTH}-day moving average`)
  console.log(`- Minimum daily volume of ${MIN_VOLUME}`)
  console.log("\nAnalyzing ETFs that typically contain low-volatility stocks:")

  // In a real implementation, you would fetch actual stock data
  // For this example, we'll simulate the results

  const results = []

  for (const symbol of LOW_VOLATILITY_ETFS) {
    console.log(`Analyzing ${symbol}...`)

    // Simulate fetching historical data
    // In reality, you would use an API like:
    // const response = await fetch(`https://api.example.com/historical/${symbol}`);
    // const data = await response.json();

    // Simulate data and calculations
    const volatility = 10 + Math.random() * 15 // Random volatility between 10-25%
    const percentBelowMA = 3 + Math.random() * 8 // Random % below MA between 3-11%
    const volume = 300000 + Math.random() * 10000000 // Random volume
    const price = 50 + Math.random() * 100 // Random price between $50-150

    // Check if it meets our criteria
    if (volatility <= VOLATILITY_THRESHOLD && percentBelowMA >= MIN_PERCENT_BELOW_MA && volume >= MIN_VOLUME) {
      results.push({
        symbol,
        volatility: volatility.toFixed(2),
        percentBelowMA: percentBelowMA.toFixed(2),
        volume: Math.round(volume),
        price: price.toFixed(2),
      })
    }
  }

  console.log("\nScreening Results:")
  console.log("=================")

  if (results.length === 0) {
    console.log("No stocks matched your criteria. Try adjusting your parameters.")
  } else {
    console.table(results)
    console.log(`\nFound ${results.length} potential candidates for mean reversion strategy.`)
    console.log("\nNext steps:")
    console.log("1. Perform fundamental analysis on these candidates")
    console.log("2. Check for upcoming earnings or news that might affect price")
    console.log("3. Determine appropriate position sizing based on your risk tolerance")
    console.log("4. Set clear entry and exit points before trading")
  }
}

// Run the screener
screenStocks()
