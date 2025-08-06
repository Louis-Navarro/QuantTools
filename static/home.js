// Initialize chart
const ctx = document.getElementById("profitChart").getContext("2d");
let profitChart = null;

// Form submission handler
document.getElementById("optionForm").addEventListener("submit", function (e) {
  e.preventDefault();
  calculateOptions();
});

function calculateOptions() {
  // Get form values
  const currentPrice = parseFloat(
    document.getElementById("currentPrice").value
  );
  const strike_price = parseFloat(document.getElementById("strikePrice").value);
  const volatility =
    parseFloat(document.getElementById("volatility").value) / 100;
  const riskFreeRate =
    parseFloat(document.getElementById("riskFreeRate").value) / 100;
  const dividendYield =
    parseFloat(document.getElementById("dividendYield").value) / 100;
  const expiryDate = new Date(document.getElementById("expiryDate").value)
    .toISOString()
    .slice(0, 10);

  window.location.href = `/?strike_price=${strike_price}&current_price=${currentPrice}&volatility=${volatility}&interest_rate=${riskFreeRate}&expire_date=${expiryDate}&dividend_yield=${dividendYield}`;
}

function updateProfitChart() {
  const prices = [];
  const callProfits = [];
  const putProfits = [];

  // Generate profit data points
  for (
    let price = strike_price * 0.8;
    price <= strike_price * 1.2;
    price += strike_price * 0.02
  ) {
    prices.push(price);

    // Simplified profit calculation (actual implementation would use Black-Scholes)
    const callProfit = Math.max(price - strike_price, 0) - call_price; // Premium paid
    const putProfit = Math.max(strike_price - price, 0) - put_price; // Premium paid

    callProfits.push(callProfit);
    putProfits.push(putProfit);
  }

  if (profitChart) {
    profitChart.destroy();
  }

  profitChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: prices.map((p) => p.toFixed(0)),
      datasets: [
        {
          label: "Call Option P&L",
          data: callProfits,
          borderColor: "#667eea",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          borderWidth: 3,
          fill: false,
          tension: 0.1,
        },
        {
          label: "Put Option P&L",
          data: putProfits,
          borderColor: "#764ba2",
          backgroundColor: "rgba(118, 75, 162, 0.1)",
          borderWidth: 3,
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Profit & Loss at Expiry",
          font: {
            size: 16,
            weight: "normal",
          },
        },
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Stock Price at Expiry ($)",
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        y: {
          title: {
            display: true,
            text: "Profit/Loss ($)",
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  });
}

function updateVolatilityChart() {
  if (profitChart) {
    profitChart.destroy();
  }

  profitChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: vols.map((p) => (p * 100).toFixed(0.1)),
      datasets: [
        {
          label: "Call Option Price",
          data: vol_call_prices,
          borderColor: "#667eea",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          borderWidth: 3,
          fill: false,
          tension: 0.1,
        },
        {
          label: "Put Option Price",
          data: vol_put_prices,
          borderColor: "#764ba2",
          backgroundColor: "rgba(118, 75, 162, 0.1)",
          borderWidth: 3,
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Volatility Impact on Option Prices",
          font: {
            size: 16,
            weight: "normal",
          },
        },
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Volatility (%)",
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        y: {
          title: {
            display: true,
            text: "Option Price ($)",
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  });
}

function updateTimeChart() {
  if (profitChart) {
    profitChart.destroy();
  }

  profitChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: times.reverse(),
      datasets: [
        {
          label: "Call Option Price",
          data: time_call_prices.reverse(),
          borderColor: "#667eea",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          borderWidth: 3,
          fill: false,
          tension: 0.1,
          pointStyle: false,
        },
        {
          label: "Put Option Price",
          data: time_put_prices.reverse(),
          borderColor: "#764ba2",
          backgroundColor: "rgba(118, 75, 162, 0.1)",
          borderWidth: 3,
          fill: false,
          tension: 0.1,
          pointStyle: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Time Decay Impact on Option Prices",
          font: {
            size: 16,
            weight: "normal",
          },
        },
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time left (Days)",
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        y: {
          title: {
            display: true,
            text: "Option Price ($)",
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  });
}

function showChart(type) {
  // Update active button
  document
    .querySelectorAll(".chart-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  // Different chart types would be implemented here
  // For now, we'll just update the title
  const funcs = {
    pnl: updateProfitChart,
    // greeks: updateGreeksChart,
    volatility: updateVolatilityChart,
    time: updateTimeChart,
  };

  if (funcs[type]) {
    funcs[type]();
  } else {
    console.error("Unknown chart type:", type);
  }
}

setTimeout(() => {
  if (!new URLSearchParams(window.location.search).has("current_price")) {
    return;
  }

  updateProfitChart();
}, 100);
