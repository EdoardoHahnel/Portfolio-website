let dcfRevenueChart;
let dcfFcfChart;
let dcfBridgeChart;
let lboIrrChart;
let lboEquityChart;

function currentMode() {
  const checked = document.querySelector("input[name='complexityMode']:checked");
  return checked ? checked.value : "basic";
}

function num(id) {
  const el = document.getElementById(id);
  return el ? Number(el.value || 0) : 0;
}

function dcfInputs() {
  return {
    revenueStart: num("dcfRevenueStart"),
    revenueGrowth: num("dcfRevenueGrowth"),
    ebitdaMargin: num("dcfEbitdaMargin"),
    taxRate: num("dcfTaxRate"),
    capexPct: num("dcfCapexPct"),
    nwcPct: num("dcfNwcPct"),
    wacc: num("dcfWacc"),
    terminalGrowth: num("dcfTerminalGrowth"),
    useExitMultiple: document.getElementById("dcfUseExitMultiple")?.checked,
    exitMultiple: num("dcfExitMultiple"),
    netDebt: num("dcfNetDebt"),
    shares: num("dcfShares")
  };
}

function lboInputs() {
  return {
    revenueStart: num("lboRevenueStart"),
    entryMultiple: num("lboEntryMultiple"),
    exitMultiple: num("lboExitMultiple"),
    revenueGrowth: num("lboRevenueGrowth"),
    ebitdaMargin: num("lboEbitdaMargin"),
    debtPct: num("lboDebtPct"),
    interestRate: num("lboInterestRate"),
    amortPct: num("lboAmortPct"),
    feesPct: num("lboFeesPct"),
    holdPeriod: num("lboHoldPeriod"),
    pikRate: num("lboPikRate"),
    revolverLimit: num("lboRevolverLimit")
  };
}

function renderTableBody(tableId, rowsHtml) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const body = table.querySelector("tbody");
  if (body) body.innerHTML = rowsHtml;
}

function runDCF() {
  const mode = currentMode();
  const input = dcfInputs();
  const result = window.FinancialEngine.calculateDCF(input, mode);
  const sens = window.FinancialEngine.calculateDCFSensitivity(input, mode);

  document.getElementById("dcfEv").textContent = window.FinancialEngine.formatCurrency(result.enterpriseValue);
  document.getElementById("dcfEqv").textContent = window.FinancialEngine.formatCurrency(result.equityValue);
  document.getElementById("dcfTv").textContent = window.FinancialEngine.formatCurrency(result.terminalValue);
  document.getElementById("dcfSharePrice").textContent = result.impliedSharePrice !== null
    ? result.impliedSharePrice.toFixed(2)
    : "-";

  renderTableBody(
    "dcfForecastTable",
    result.forecast.map((r) => `
      <tr>
        <td>${r.year}</td>
        <td>${window.FinancialEngine.formatCurrency(r.revenue)}</td>
        <td>${window.FinancialEngine.formatCurrency(r.ebitda)}</td>
        <td>${window.FinancialEngine.formatCurrency(r.fcf)}</td>
        <td>${r.discountFactor.toFixed(3)}</td>
        <td>${window.FinancialEngine.formatCurrency(r.pvFcf)}</td>
      </tr>
    `).join("")
  );

  const dcfSensTable = document.getElementById("dcfSensitivityTable");
  if (dcfSensTable) {
    let html = "<tr><th>g \\ WACC</th>";
    sens.waccs.forEach((w) => { html += `<th>${w.toFixed(1)}%</th>`; });
    html += "</tr>";
    sens.gs.forEach((g, i) => {
      html += `<tr><th>${g.toFixed(1)}%</th>`;
      sens.matrix[i].forEach((ev) => {
        html += `<td>${window.FinancialEngine.formatCurrency(ev)}</td>`;
      });
      html += "</tr>";
    });
    dcfSensTable.querySelector("tbody").innerHTML = html;
  }

  const revLabels = result.forecast.map((r) => `Y${r.year}`);
  const revSeries = result.forecast.map((r) => r.revenue);
  const fcfSeries = result.forecast.map((r) => r.fcf);
  dcfRevenueChart = redrawChart(dcfRevenueChart, "dcfRevenueChart", "line", revLabels, revSeries, "Revenue");
  dcfFcfChart = redrawChart(dcfFcfChart, "dcfFcfChart", "line", revLabels, fcfSeries, "FCF");
  dcfBridgeChart = redrawMultiBar(
    dcfBridgeChart,
    "dcfBridgeChart",
    ["PV FCF", "PV Terminal", "Net Debt", "Equity Value"],
    [result.bridge.pvFcf, result.bridge.pvTerminal, -result.bridge.netDebt, result.equityValue]
  );
}

function runLBO() {
  const mode = currentMode();
  const input = lboInputs();
  const result = window.FinancialEngine.calculateLBO(input, mode);
  const sens = window.FinancialEngine.calculateLBOSensitivity(input, mode);

  document.getElementById("lboEntryEv").textContent = window.FinancialEngine.formatCurrency(result.entryEV);
  document.getElementById("lboExitEq").textContent = window.FinancialEngine.formatCurrency(result.exitEquityValue);
  document.getElementById("lboMoic").textContent = `${result.moic.toFixed(2)}x`;
  document.getElementById("lboIrr").textContent = `${(result.irr * 100).toFixed(1)}%`;

  renderTableBody(
    "lboDebtTable",
    result.debtSchedule.map((r) => `
      <tr>
        <td>${r.year}</td>
        <td>${window.FinancialEngine.formatCurrency(r.revenue)}</td>
        <td>${window.FinancialEngine.formatCurrency(r.ebitda)}</td>
        <td>${window.FinancialEngine.formatCurrency(r.openingDebt)}</td>
        <td>${window.FinancialEngine.formatCurrency(r.interest)}</td>
        <td>${window.FinancialEngine.formatCurrency(r.paydown)}</td>
        <td>${window.FinancialEngine.formatCurrency(r.closingDebt)}</td>
      </tr>
    `).join("")
  );

  renderTableBody(
    "lboSourcesUsesTable",
    `
      <tr><th>Sources & Uses</th><th>Value</th></tr>
      <tr><td>Enterprise Value</td><td>${window.FinancialEngine.formatCurrency(result.sourcesUses.enterpriseValue)}</td></tr>
      <tr><td>Transaction Fees</td><td>${window.FinancialEngine.formatCurrency(result.sourcesUses.fees)}</td></tr>
      <tr><td>Debt</td><td>${window.FinancialEngine.formatCurrency(result.sourcesUses.debt)}</td></tr>
      <tr><td>Equity</td><td>${window.FinancialEngine.formatCurrency(result.sourcesUses.equity)}</td></tr>
    `
  );

  const lboSensTable = document.getElementById("lboSensitivityTable");
  if (lboSensTable) {
    let html = "<tr><th>Entry \\ Exit</th>";
    sens.exits.forEach((ex) => { html += `<th>${ex.toFixed(1)}x</th>`; });
    html += "</tr>";
    sens.entries.forEach((en, i) => {
      html += `<tr><th>${en.toFixed(1)}x</th>`;
      sens.matrix[i].forEach((irr) => { html += `<td>${irr.toFixed(1)}%</td>`; });
      html += "</tr>";
    });
    lboSensTable.querySelector("tbody").innerHTML = html;
  }

  const irrSeries = sens.exits.map((ex) => {
    const r = window.FinancialEngine.calculateLBO({ ...input, exitMultiple: ex }, mode);
    return r.irr * 100;
  });
  lboIrrChart = redrawChart(lboIrrChart, "lboIrrChart", "line", sens.exits.map((ex) => `${ex.toFixed(1)}x`), irrSeries, "IRR %");

  lboEquityChart = redrawChart(
    lboEquityChart,
    "lboEquityChart",
    "line",
    result.equityPath.map((p) => `Y${p.year}`),
    result.equityPath.map((p) => p.value),
    "Equity Value"
  );
}

function redrawChart(chartInstance, canvasId, type, labels, data, label) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return chartInstance;
  if (chartInstance) chartInstance.destroy();
  return new Chart(ctx, {
    type,
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: "#3f7de8",
        backgroundColor: "rgba(63,125,232,0.2)",
        tension: 0.35,
        fill: type === "line"
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

function redrawMultiBar(chartInstance, canvasId, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return chartInstance;
  if (chartInstance) chartInstance.destroy();
  return new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ data, backgroundColor: ["#6366F1", "#8B5CF6", "#EF4444", "#10B981"] }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

function setModeUI(mode) {
  const advanced = mode === "advanced";
  document.getElementById("dcfExitMultipleWrap")?.classList.toggle("hidden", !document.getElementById("dcfUseExitMultiple")?.checked);
  document.getElementById("lboPikWrap")?.classList.toggle("hidden", !advanced);
  document.getElementById("lboRevolverWrap")?.classList.toggle("hidden", !advanced);
  const hold = document.getElementById("lboHoldPeriod");
  if (hold) hold.value = advanced ? 10 : 5;
}

function switchModel(target) {
  const isDcf = target === "dcf";
  document.getElementById("dcfSection")?.classList.toggle("is-active", isDcf);
  document.getElementById("lboSection")?.classList.toggle("is-active", !isDcf);
  document.getElementById("modelTabDcf")?.classList.toggle("btn-primary", isDcf);
  document.getElementById("modelTabDcf")?.classList.toggle("btn-secondary", !isDcf);
  document.getElementById("modelTabLbo")?.classList.toggle("btn-primary", !isDcf);
  document.getElementById("modelTabLbo")?.classList.toggle("btn-secondary", isDcf);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("runDcfBtn")?.addEventListener("click", runDCF);
  document.getElementById("runLboBtn")?.addEventListener("click", runLBO);
  document.getElementById("modelTabDcf")?.addEventListener("click", () => switchModel("dcf"));
  document.getElementById("modelTabLbo")?.addEventListener("click", () => switchModel("lbo"));
  document.getElementById("dcfUseExitMultiple")?.addEventListener("change", () => {
    document.getElementById("dcfExitMultipleWrap")?.classList.toggle("hidden", !document.getElementById("dcfUseExitMultiple").checked);
  });
  document.querySelectorAll("input[name='complexityMode']").forEach((el) => {
    el.addEventListener("change", () => setModeUI(currentMode()));
  });

  setModeUI("basic");
  switchModel("dcf");
  runDCF();
  runLBO();
});
