// Educational Options Screening Tool
// This script demonstrates how to identify stocks suitable for learning options strategies

console.log("Options Education: Stock Screening for Learning")
console.log("==============================================")
console.log("Note: This is for educational purposes only, not financial advice\n")

// Define educational criteria for different strategy types
const EDUCATIONAL_CRITERIA = {
  beginnerFriendly: {
    name: "Beginner-Friendly Options Learning",
    minVolume: 1000000, // 1M+ daily volume
    minOptionVolume: 1000, // 1000+ option contracts daily
    maxPrice: 200, // Under $200 per share (affordable for 100-share lots)
    sectors: ["Technology", "Healthcare", "Consumer", "Financial"],
    examples: ["AAPL", "MSFT", "SPY", "QQQ", "XLF", "XLK"],
  },

  coveredCalls: {
    name: "Covered Call Learning Candidates",
    minDividendYield: 2, // 2%+ dividend yield preferred
    volatility: { min: 15, max: 35 }, // Moderate volatility
    priceRange: { min: 30, max: 150 }, // Reasonable for 100-share purchases
    sectors: ["Utilities", "Consumer Staples", "REITs", "Telecom"],
    examples: ["T", "VZ", "KO", "PG", "O", "XLU", "XLP"],
  },

  cashSecuredPuts: {
    name: "Cash-Secured Put Learning Candidates",
    qualityStocks: true, // Focus on quality companies
    supportLevels: true, // Stocks with clear technical support
    volatility: { min: 20, max: 40 }, // Higher vol = higher premiums
    examples: ["NVDA", "AMD", "TSLA", "AMZN", "GOOGL"],
  },

  protectivePuts: {
    name: "Protective Put Learning Candidates",
    ownedStocks: true, // Stocks you already own
    liquidOptions: true, // Need liquid put options
    examples: ["SPY", "QQQ", "IWM", "VTI"], // ETFs are great for this
  },
}

// Sample educational data (in real implementation, this would come from market data APIs)
const EDUCATIONAL_EXAMPLES = [
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF",
    price: 445.5,
    volume: 45000000,
    optionVolume: 850000,
    impliedVol: 18.5,
    sector: "ETF",
    dividend: 1.8,
    suitableFor: ["All strategies", "Great for learning"],
    whyGood: "Highly liquid, diversified, predictable",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc",
    price: 185.25,
    volume: 35000000,
    optionVolume: 450000,
    impliedVol: 22.3,
    sector: "Technology",
    dividend: 0.5,
    suitableFor: ["Covered calls", "Protective puts"],
    whyGood: "Liquid options, stable company, moderate volatility",
  },
  {
    symbol: "T",
    name: "AT&T Inc",
    price: 18.45,
    volume: 25000000,
    optionVolume: 125000,
    impliedVol: 28.7,
    sector: "Telecom",
    dividend: 7.2,
    suitableFor: ["Covered calls", "Income strategies"],
    whyGood: "High dividend, affordable shares, decent premiums",
  },
  {
    symbol: "XLU",
    name: "Utilities Select Sector SPDR",
    price: 63.8,
    volume: 8500000,
    optionVolume: 45000,
    impliedVol: 16.2,
    sector: "Utilities",
    dividend: 3.1,
    suitableFor: ["Conservative strategies", "Covered calls"],
    whyGood: "Low volatility, steady dividends, defensive",
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    price: 378.9,
    volume: 28000000,
    optionVolume: 320000,
    impliedVol: 21.8,
    sector: "Technology ETF",
    dividend: 0.8,
    suitableFor: ["All strategies", "Growth exposure"],
    whyGood: "Tech exposure, very liquid, active options market",
  },
]

// Function to analyze suitability for different strategies
function analyzeForStrategy(stock, strategy) {
  const analysis = {
    symbol: stock.symbol,
    strategy: strategy,
    suitability: "Unknown",
    reasons: [],
    considerations: [],
  }

  switch (strategy) {
    case "covered-call":
      if (stock.dividend >= 2) {
        analysis.reasons.push("Good dividend yield for income stacking")
      }
      if (stock.impliedVol >= 15 && stock.impliedVol <= 35) {
        analysis.reasons.push("Moderate volatility provides decent premiums")
      }
      if (stock.price <= 150) {
        analysis.reasons.push("Affordable for 100-share lots")
      }
      if (stock.optionVolume >= 10000) {
        analysis.reasons.push("Liquid options market")
      }

      analysis.suitability = analysis.reasons.length >= 2 ? "Good" : "Fair"
      break

    case "cash-secured-put":
      if (stock.impliedVol >= 20) {
        analysis.reasons.push("Higher volatility = higher put premiums")
      }
      if (stock.sector === "Technology" || stock.sector === "Growth") {
        analysis.reasons.push("Growth stocks often have good put premiums")
      }
      if (stock.optionVolume >= 50000) {
        analysis.reasons.push("Very liquid options for easy entry/exit")
      }

      analysis.considerations.push("Make sure you want to own the stock at strike price")
      analysis.suitability = analysis.reasons.length >= 2 ? "Good" : "Fair"
      break

    case "protective-put":
      if (stock.symbol.includes("ETF") || ["SPY", "QQQ", "IWM"].includes(stock.symbol)) {
        analysis.reasons.push("ETFs provide diversified protection")
      }
      if (stock.optionVolume >= 100000) {
        analysis.reasons.push("Very liquid puts available")
      }

      analysis.considerations.push("Insurance costs money - weigh cost vs protection")
      analysis.suitability = analysis.reasons.length >= 1 ? "Good" : "Fair"
      break
  }

  return analysis
}

// Educational screening function
function educationalScreening() {
  console.log("Educational Analysis of Options-Suitable Stocks")
  console.log("----------------------------------------------\n")

  // Analyze each example for different strategies
  const strategies = ["covered-call", "cash-secured-put", "protective-put"]

  strategies.forEach((strategy) => {
    console.log(`\n${strategy.toUpperCase().replace("-", " ")} LEARNING CANDIDATES:`)
    console.log("=".repeat(50))

    EDUCATIONAL_EXAMPLES.forEach((stock) => {
      const analysis = analyzeForStrategy(stock, strategy)

      console.log(`\n${stock.symbol} - ${stock.name}`)
      console.log(`Price: $${stock.price} | Vol: ${(stock.volume / 1000000).toFixed(1)}M | IV: ${stock.impliedVol}%`)
      console.log(`Suitability: ${analysis.suitability}`)

      if (analysis.reasons.length > 0) {
        console.log("Reasons:")
        analysis.reasons.forEach((reason) => console.log(`  ✓ ${reason}`))
      }

      if (analysis.considerations.length > 0) {
        console.log("Considerations:")
        analysis.considerations.forEach((consideration) => console.log(`  ⚠ ${consideration}`))
      }
    })
  })

  // Educational summary
  console.log("\n\nEDUCATIONAL SUMMARY:")
  console.log("===================")
  console.log("Key Learning Points:")
  console.log("• Start with highly liquid stocks/ETFs (SPY, QQQ, AAPL)")
  console.log("• Paper trade first to understand mechanics")
  console.log("• Focus on one strategy at a time")
  console.log("• Understand max profit/loss before entering")
  console.log("• Consider earnings dates and ex-dividend dates")
  console.log("• Always have an exit plan")

  console.log("\nBeginner-Friendly Progression:")
  console.log("1. Learn with paper trading on SPY/QQQ")
  console.log("2. Try covered calls on dividend stocks you own")
  console.log("3. Practice cash-secured puts on stocks you want to own")
  console.log("4. Add protective puts for portfolio insurance")
  console.log("5. Advanced: Spreads and more complex strategies")

  console.log("\nRemember: This is educational content only!")
  console.log("Always do your own research and consider consulting a financial advisor.")
}

// Run the educational screening
educationalScreening()
