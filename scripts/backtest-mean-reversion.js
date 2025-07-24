// This script demonstrates a simple backtest of a mean reversion strategy
// In a real implementation, you would use more sophisticated backtesting frameworks

// Sample historical data for an example stock (simulated)
function generateSampleData(days = 252) {
  const data = []
  let price = 100
  const volatility = 0.015 // 1.5% daily volatility

  for (let i = 0; i < days; i++) {
    // Random walk with mean reversion tendency
    const randomMove = (Math.random() - 0.5) * volatility * price
    const meanReversionFactor = (100 - price) * 0.05 // Pull toward $100
    price = price + randomMove + meanReversionFactor

    data.push({
      date: new Date(2023, 0, i + 1).toISOString().split("T")[0],
      price: price,
      volume: Math.round(500000 + Math.random() * 1000000),
    })
  }

  return data
}

// Calculate moving average
function calculateMA(data, period) {
  const result = [...data]

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i].ma = null
    } else {
      let sum = 0
      for (let j = 0; j < period; j++) {
        sum += data[i - j].price
      }
      result[i].ma = sum / period
    }
  }

  return result
}

// Calculate strategy signals
function calculateSignals(data, deviationThreshold) {
  const result = [...data]

  for (let i = 0; i < data.length; i++) {
    if (data[i].ma === null) {
      result[i].signal = null
      result[i].deviation = null
    } else {
      result[i].deviation = (data[i].price - data[i].ma) / data[i].ma

      // Buy when price is significantly below MA
      if (result[i].deviation < -deviationThreshold) {
        result[i].signal = "BUY"
      }
      // Sell when price returns to MA
      else if (result[i].deviation >= 0 && i > 0 && result[i - 1].signal === "HOLD") {
        result[i].signal = "SELL"
      }
      // Hold while we're in a position
      else if ((i > 0 && result[i - 1].signal === "BUY") || result[i - 1].signal === "HOLD") {
        result[i].signal = "HOLD"
      } else {
        result[i].signal = null
      }
    }
  }

  return result
}

// Run backtest
function runBacktest(data) {
  let cash = 10000
  let shares = 0
  let trades = 0
  let wins = 0
  let losses = 0
  let buyPrice = 0
  const transactions = []

  for (let i = 0; i < data.length; i++) {
    const day = data[i]

    if (day.signal === "BUY" && shares === 0) {
      // Calculate how many shares we can buy with 90% of our cash
      const availableCash = cash * 0.9
      shares = Math.floor(availableCash / day.price)
      buyPrice = day.price
      cash -= shares * day.price

      transactions.push({
        date: day.date,
        type: "BUY",
        price: day.price,
        shares: shares,
        value: shares * day.price,
        cash: cash,
      })
    } else if (day.signal === "SELL" && shares > 0) {
      // Sell all shares
      const sellValue = shares * day.price
      cash += sellValue

      // Record profit/loss
      const profitLoss = day.price - buyPrice
      if (profitLoss > 0) wins++
      else if (profitLoss < 0) losses++
      trades++

      transactions.push({
        date: day.date,
        type: "SELL",
        price: day.price,
        shares: shares,
        value: sellValue,
        cash: cash,
        profitLoss: profitLoss * shares,
      })

      shares = 0
    }
  }

  // Calculate final portfolio value
  const finalValue = cash + shares * data[data.length - 1].price
  const totalReturn = ((finalValue - 10000) / 10000) * 100

  return {
    initialCapital: 10000,
    finalValue: finalValue,
    totalReturn: totalReturn,
    trades: trades,
    winRate: trades > 0 ? (wins / trades) * 100 : 0,
    transactions: transactions,
  }
}

// Main function
function main() {
  console.log("Running Mean Reversion Strategy Backtest")
  console.log("=======================================")

  // Generate sample data
  const rawData = generateSampleData()

  // Calculate 50-day moving average
  const dataWithMA = calculateMA(rawData, 50)

  // Calculate signals with 5% deviation threshold
  const dataWithSignals = calculateSignals(dataWithMA, 0.05)

  // Run backtest
  const results = runBacktest(dataWithSignals)

  // Print results
  console.log(`Initial Capital: $${results.initialCapital.toFixed(2)}`)
  console.log(`Final Value: $${results.finalValue.toFixed(2)}`)
  console.log(`Total Return: ${results.totalReturn.toFixed(2)}%`)
  console.log(`Number of Trades: ${results.trades}`)
  console.log(`Win Rate: ${results.winRate.toFixed(2)}%`)

  console.log("\nTransaction Summary:")
  console.log("------------------")
  results.transactions.slice(0, 5).forEach((t) => {
    console.log(
      `${t.date} | ${t.type} | Price: $${t.price.toFixed(2)} | Shares: ${t.shares} | Value: $${t.value.toFixed(2)}`,
    )
  })

  if (results.transactions.length > 5) {
    console.log(`... and ${results.transactions.length - 5} more transactions`)
  }

  // Calculate some statistics
  const profitableTrades = results.transactions.filter((t) => t.type === "SELL" && t.profitLoss > 0)
  const unprofitableTrades = results.transactions.filter((t) => t.type === "SELL" && t.profitLoss <= 0)

  const avgProfit =
    profitableTrades.length > 0
      ? profitableTrades.reduce((sum, t) => sum + t.profitLoss, 0) / profitableTrades.length
      : 0

  const avgLoss =
    unprofitableTrades.length > 0
      ? unprofitableTrades.reduce((sum, t) => sum + t.profitLoss, 0) / unprofitableTrades.length
      : 0

  console.log("\nStrategy Statistics:")
  console.log("------------------")
  console.log(`Average Profit per Winning Trade: $${avgProfit.toFixed(2)}`)
  console.log(`Average Loss per Losing Trade: $${avgLoss.toFixed(2)}`)

  if (avgLoss !== 0) {
    const profitFactor = Math.abs(avgProfit / avgLoss)
    console.log(`Profit Factor: ${profitFactor.toFixed(2)}`)
  }
}

// Run the backtest
main()
