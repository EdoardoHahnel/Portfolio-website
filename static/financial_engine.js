(function (global) {
  function pct(value) {
    return Number(value || 0) / 100;
  }

  function toNum(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function yearRange(length) {
    return Array.from({ length }, (_, i) => i + 1);
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });
  }

  function calculateDCF(input, mode) {
    const years = mode === "advanced" ? 10 : 5;
    const revenueStart = toNum(input.revenueStart, 500);
    const growth = pct(input.revenueGrowth);
    const ebitdaMargin = pct(input.ebitdaMargin);
    const taxRate = pct(input.taxRate);
    const capexPct = pct(input.capexPct);
    const nwcPct = pct(input.nwcPct);
    const wacc = Math.max(pct(input.wacc), 0.0001);
    const terminalGrowth = pct(input.terminalGrowth);
    const useExitMultiple = !!input.useExitMultiple;
    const exitMultiple = toNum(input.exitMultiple, 10);
    const netDebt = toNum(input.netDebt, 0);
    const shares = Math.max(toNum(input.shares, 0), 0);

    const forecast = [];
    let prevNwc = revenueStart * nwcPct;
    let revenue = revenueStart;
    let pvFcfTotal = 0;

    yearRange(years).forEach((year) => {
      revenue *= (1 + growth);
      const ebitda = revenue * ebitdaMargin;
      const depreciation = revenue * 0.03;
      const ebit = ebitda - depreciation;
      const tax = Math.max(ebit, 0) * taxRate;
      const capex = revenue * capexPct;
      const nwc = revenue * nwcPct;
      const deltaNwc = nwc - prevNwc;
      const fcf = (ebit - tax) + depreciation - capex - deltaNwc;
      const discountFactor = 1 / ((1 + wacc) ** year);
      const pvFcf = fcf * discountFactor;
      pvFcfTotal += pvFcf;
      prevNwc = nwc;

      forecast.push({ year, revenue, ebitda, fcf, discountFactor, pvFcf });
    });

    const last = forecast[forecast.length - 1];
    const terminalValue = useExitMultiple
      ? last.ebitda * exitMultiple
      : (last.fcf * (1 + terminalGrowth)) / Math.max((wacc - terminalGrowth), 0.001);
    const pvTerminal = terminalValue / ((1 + wacc) ** years);
    const enterpriseValue = pvFcfTotal + pvTerminal;
    const equityValue = enterpriseValue - netDebt;
    const impliedSharePrice = shares > 0 ? equityValue / shares : null;

    return {
      years,
      forecast,
      terminalValue,
      pvTerminal,
      enterpriseValue,
      equityValue,
      impliedSharePrice,
      bridge: {
        pvFcf: pvFcfTotal,
        pvTerminal,
        netDebt
      }
    };
  }

  function calculateDCFSensitivity(input, mode) {
    const waccBase = toNum(input.wacc, 9.5);
    const gBase = toNum(input.terminalGrowth, 2.5);
    const waccs = [waccBase - 1, waccBase - 0.5, waccBase, waccBase + 0.5, waccBase + 1];
    const gs = [gBase - 1, gBase - 0.5, gBase, gBase + 0.5, gBase + 1];

    const matrix = gs.map((g) => {
      return waccs.map((w) => {
        const res = calculateDCF({ ...input, wacc: w, terminalGrowth: g }, mode);
        return res.enterpriseValue;
      });
    });

    return { waccs, gs, matrix };
  }

  function calculateLBO(input, mode) {
    const years = mode === "advanced" ? 10 : Math.min(Math.max(toNum(input.holdPeriod, 5), 3), 10);
    const holdPeriod = years;
    const revenueStart = toNum(input.revenueStart, 600);
    const revGrowth = pct(input.revenueGrowth);
    const ebitdaMargin = pct(input.ebitdaMargin);
    const entryMultiple = toNum(input.entryMultiple, 9);
    const exitMultiple = toNum(input.exitMultiple, 10);
    const debtPct = pct(input.debtPct);
    const interestRate = pct(input.interestRate);
    const amortPct = pct(input.amortPct);
    const feesPct = pct(input.feesPct);
    const pikRate = pct(input.pikRate);
    const revolverLimit = toNum(input.revolverLimit, 150);

    const entryEbitda = revenueStart * ebitdaMargin;
    const entryEV = entryEbitda * entryMultiple;
    const fees = entryEV * feesPct;
    const openingDebtTotal = entryEV * debtPct;
    const equityInvested = entryEV + fees - openingDebtTotal;

    let debtA = mode === "advanced" ? openingDebtTotal * 0.7 : openingDebtTotal;
    let debtB = mode === "advanced" ? openingDebtTotal * 0.3 : 0;
    let revolver = 0;
    let revenue = revenueStart;
    const debtSchedule = [];
    const equityPath = [];

    yearRange(years).forEach((year) => {
      revenue *= (1 + revGrowth);
      const ebitda = revenue * ebitdaMargin;
      const openingDebt = debtA + debtB + revolver;
      const interestA = debtA * interestRate;
      const interestB = debtB * (mode === "advanced" ? pikRate : interestRate);
      const interestRev = revolver * interestRate;
      const totalInterest = interestA + interestB + interestRev;
      const mandatoryAmort = debtA * amortPct;
      const cashAfterCosts = ebitda * 0.72 - totalInterest;
      let cashSweep = Math.max(cashAfterCosts - mandatoryAmort, 0);

      let paydownA = Math.min(debtA, mandatoryAmort + cashSweep);
      debtA -= paydownA;
      cashSweep = Math.max(cashSweep - Math.max(paydownA - mandatoryAmort, 0), 0);

      if (mode === "advanced") {
        debtB += debtB * pikRate;
      }

      if (mode === "advanced") {
        const shortfall = Math.max(-cashAfterCosts, 0);
        revolver = Math.min(revolverLimit, Math.max(revolver - cashSweep, 0) + shortfall);
      }

      const closingDebt = debtA + debtB + revolver;
      const yearEV = ebitda * exitMultiple;
      const yearEquity = Math.max(yearEV - closingDebt, 0);
      equityPath.push({ year, value: yearEquity });

      debtSchedule.push({
        year,
        revenue,
        ebitda,
        openingDebt,
        interest: totalInterest,
        paydown: paydownA,
        closingDebt
      });
    });

    const last = debtSchedule[debtSchedule.length - 1];
    const exitEV = last.ebitda * exitMultiple;
    const exitEquityValue = Math.max(exitEV - last.closingDebt, 0);
    const moic = equityInvested > 0 ? exitEquityValue / equityInvested : 0;
    const irr = moic > 0 ? (Math.pow(moic, 1 / holdPeriod) - 1) : 0;

    return {
      years,
      holdPeriod,
      sourcesUses: {
        enterpriseValue: entryEV,
        fees,
        debt: openingDebtTotal,
        equity: equityInvested
      },
      debtSchedule,
      entryEV,
      exitEquityValue,
      moic,
      irr,
      equityPath
    };
  }

  function calculateLBOSensitivity(input, mode) {
    const entryBase = toNum(input.entryMultiple, 9);
    const exitBase = toNum(input.exitMultiple, 10);
    const entries = [entryBase - 1, entryBase - 0.5, entryBase, entryBase + 0.5, entryBase + 1];
    const exits = [exitBase - 1, exitBase - 0.5, exitBase, exitBase + 0.5, exitBase + 1];

    const matrix = entries.map((entry) => {
      return exits.map((exit) => {
        const res = calculateLBO({ ...input, entryMultiple: entry, exitMultiple: exit }, mode);
        return res.irr * 100;
      });
    });

    return { entries, exits, matrix };
  }

  global.FinancialEngine = {
    calculateDCF,
    calculateDCFSensitivity,
    calculateLBO,
    calculateLBOSensitivity,
    formatCurrency
  };
})(window);
