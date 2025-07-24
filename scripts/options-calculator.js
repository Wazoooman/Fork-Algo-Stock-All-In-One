// Educational Options Calculator
// Learn how different factors affect option pricing and strategy outcomes

console.log("Options Education: Strategy Calculator")
console.log("=====================================")
console.log("Educational tool to understand options pricing and outcomes\n")

// Black-Scholes approximation for educational purposes
function calculateOptionPrice(S, K, T, r, sigma, type = "call") {
  // S = Stock price, K = Strike price, T = Time to expiration (years)
  // r = Risk-free rate, sigma = Volatility, type = 'call' or 'put'

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T))
  const d2 = d1 - sigma * Math.sqrt(T)

  // Simplified normal distribution approximation
  function normalCDF(x) {
    return 0.5 * (1 + Math.sign(x) * Math.sqrt(1 - Math.exp((-2 * x * x) / Math.PI)))
  }

  if (type === "call") {
    return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2)
  } else {
    return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1)
  }
}

// Educational scenarios
function educationalScenarios() {
  console.log("SCENARIO 1: Covered Call Learning Example")
  console.log("----------------------------------------")

  const stockPrice = 100
  const strikePrice = 105
  const timeToExpiration = 30 / 365 // 30 days
  const riskFreeRate = 0.05
  const volatility = 0.25

  const callPrice = calculateOptionPrice(stockPrice, strikePrice, timeToExpiration, riskFreeRate, volatility, "call")

  console.log(`Stock Price: $${stockPrice}`)
  console.log(`Strike Price: $${strikePrice}`)
  console.log(`Time to Expiration: 30 days`)
  console.log(`Estimated Call Premium: $${callPrice.toFixed(2)}`)

  console.log("\nOutcome Analysis:")
  const scenarios = [
    { finalPrice: 95, name: "Stock drops to $95" },
    { finalPrice: 100, name: "Stock stays at $100" },
    { finalPrice: 105, name: "Stock rises to $105" },
    { finalPrice: 110, name: "Stock rises to $110" },
  ]

  scenarios.forEach((scenario) => {
    let profit
    if (scenario.finalPrice <= strikePrice) {
      // Keep premium, stock not called away
      profit = callPrice + (scenario.finalPrice - stockPrice)
    } else {
      // Stock called away at strike price
      profit = callPrice + (strikePrice - stockPrice)
    }

    console.log(`${scenario.name}: Profit = $${profit.toFixed(2)} per share`)
  })

  console.log("\n" + "=".repeat(50))
  console.log("SCENARIO 2: Cash-Secured Put Learning Example")
  console.log("--------------------------------------------")

  const putStrike = 95
  const putPrice = calculateOptionPrice(stockPrice, putStrike, timeToExpiration, riskFreeRate, volatility, "put")

  console.log(`Stock Price: $${stockPrice}`)
  console.log(`Put Strike Price: $${putStrike}`)
  console.log(`Estimated Put Premium: $${putPrice.toFixed(2)}`)
  console.log(`Cash Required: $${putStrike * 100} (for 100 shares)`)

  console.log("\nOutcome Analysis:")
  const putScenarios = [
    { finalPrice: 85, name: "Stock drops to $85" },
    { finalPrice: 95, name: "Stock stays at $95" },
    { finalPrice: 100, name: "Stock rises to $100" },
    { finalPrice: 105, name: "Stock rises to $105" },
  ]

  putScenarios.forEach((scenario) => {
    if (scenario.finalPrice >= putStrike) {
      console.log(`${scenario.name}: Keep premium $${putPrice.toFixed(2)}, not assigned`)
    } else {
      const effectiveCost = putStrike - putPrice
      console.log(`${scenario.name}: Assigned at $${putStrike}, effective cost $${effectiveCost.toFixed(2)}`)
    }
  })

  console.log("\n" + "=".repeat(50))
  console.log("SCENARIO 3: Time Decay Education")
  console.log("--------------------------------")

  console.log("How option values change over time (all else equal):")
  const timePoints = [30, 21, 14, 7, 3, 1]

  timePoints.forEach((days) => {
    const timeInYears = days / 365
    const callValue = calculateOptionPrice(stockPrice, strikePrice, timeInYears, riskFreeRate, volatility, "call")
    console.log(`${days} days to expiration: Call worth $${callValue.toFixed(2)}`)
  })

  console.log("\nKey Learning: Options lose value as expiration approaches (time decay)")
  console.log("This is why selling options can be profitable in sideways markets")
}

// Risk management calculator
function riskManagementEducation() {
  console.log("\n" + "=".repeat(50))
  console.log("RISK MANAGEMENT EDUCATION")
  console.log("=========================")

  const portfolioValue = 10000
  const riskPerTrade = 0.02 // 2% risk per trade
  const maxRisk = portfolioValue * riskPerTrade

  console.log(`Portfolio Value: $${portfolioValue}`)
  console.log(`Risk per Trade: ${riskPerTrade * 100}%`)
  console.log(`Maximum Risk per Trade: $${maxRisk}`)

  console.log("\nPosition Sizing Examples:")

  // Covered call example
  const stockPrice2 = 50
  const sharesAffordable = Math.floor(maxRisk / stockPrice2)
  console.log(`\nCovered Call on $${stockPrice2} stock:`)
  console.log(`Max shares to risk 2%: ${sharesAffordable} shares`)
  console.log(`But covered calls need 100-share lots`)
  console.log(`Consider: Start with paper trading or use ETFs`)

  // Cash-secured put example
  const putStrike2 = 45
  const cashRequired = putStrike2 * 100
  console.log(`\nCash-Secured Put at $${putStrike2} strike:`)
  console.log(`Cash required: $${cashRequired}`)
  console.log(`This exceeds 2% rule for $10k portfolio`)
  console.log(`Consider: Paper trading first, or smaller account allocation`)

  console.log("\nKey Principles:")
  console.log("• Never risk more than you can afford to lose")
  console.log("• Start small and scale up as you learn")
  console.log("• Paper trade extensively before using real money")
  console.log("• Understand max loss before entering any trade")
}

// Greeks education (simplified)
function greeksEducation() {
  console.log("\n" + "=".repeat(50))
  console.log("THE GREEKS - SIMPLIFIED EDUCATION")
  console.log("=================================")

  console.log("Delta: How much option price changes per $1 stock move")
  console.log("• Call delta: 0 to 1 (0.5 = option moves $0.50 per $1 stock move)")
  console.log("• Put delta: -1 to 0 (-0.5 = put gains $0.50 when stock drops $1)")
  console.log("• At-the-money options ≈ 0.5 delta")

  console.log("\nTheta: Time decay per day")
  console.log("• How much option loses value each day")
  console.log("• Accelerates as expiration approaches")
  console.log("• Good for option sellers, bad for option buyers")

  console.log("\nVega: Sensitivity to volatility changes")
  console.log("• Higher volatility = higher option prices")
  console.log("• Important around earnings announcements")
  console.log("• Affects all options, but more impact on longer-dated ones")

  console.log("\nGamma: How fast delta changes")
  console.log("• Higher for at-the-money options")
  console.log("• Important for risk management")
  console.log("• Can cause rapid profit/loss changes")

  console.log("\nPractical Application:")
  console.log("• Check delta to understand directional risk")
  console.log("• Monitor theta if you're buying options")
  console.log("• Be aware of vega around earnings")
  console.log("• Start simple - don't overcomplicate with Greeks initially")
}

// Run all educational modules
educationalScenarios()
riskManagementEducation()
greeksEducation()

console.log("\n" + "=".repeat(60))
console.log("EDUCATIONAL DISCLAIMER")
console.log("=".repeat(60))
console.log("This calculator is for educational purposes only.")
console.log("Real options pricing involves many more factors.")
console.log("Always paper trade extensively before risking real money.")
console.log("Consider consulting with a qualified financial advisor.")
console.log("Past performance does not guarantee future results.")
