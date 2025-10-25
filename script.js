const DEFAULT_STATE = {
  actualRent: 2169.17,
  projectionMonths: 12,
  persons: [
    {
      name: 'Person 1',
      payPeriod: 'Semimonthly',
      paycheckCount: 5,
      paychecks: [2342.97, 2342.97, 2342.97, 2342.97, 2342.97],
      bills: [130.0, 228.0, 45.0, 16.0, 6.37, 21.26, 10.0],
      groceries: 400,
      gas: 120,
      savingsRate: 20,
      wantsRate: 20,
      startingDebt: 1765.01,
      startingSavings: 515.62,
    },
    {
      name: 'Person 2',
      payPeriod: 'Weekly',
      paycheckCount: 12,
      paychecks: [
        421.98, 473.98, 599.3, 826.44, 624.78, 873.6, 451.88, 682.76, 475.8,
        730.08, 835.24, 759.2,
      ],
      bills: [59.44, 150.0, 20.0, 16.0],
      groceries: 400,
      gas: 120,
      savingsRate: 20,
      wantsRate: 20,
      startingDebt: 5000,
      startingSavings: 11057.34,
    },
  ],
};

const charts = {};

document.addEventListener('DOMContentLoaded', () => {
  buildPersonSections(DEFAULT_STATE.persons);
  bindGlobalInputs();
  updateAll();
});

function buildPersonSections(persons) {
  const peopleContainer = document.getElementById('people');
  peopleContainer.innerHTML = '';

  persons.forEach((person, index) => {
    const section = document.createElement('section');
    section.className = 'person-card';
    section.dataset.index = index;

    section.innerHTML = `
      <h2>
        <span>${person.name}</span>
        <small class="hint">Provide income, bill, and goal details.</small>
      </h2>
      <div class="person-grid">
        <div class="field">
          <span>Pay Period</span>
          <select class="pay-period">
            <option value="Semimonthly">Semimonthly</option>
            <option value="Weekly">Weekly</option>
            <option value="Biweekly">Biweekly</option>
          </select>
        </div>
        <div class="field">
          <span>Number of Paychecks</span>
          <select class="paycheck-count"></select>
        </div>
        <div class="field">
          <span>Paycheck Amounts</span>
          <div class="paycheck-list"></div>
        </div>
        <div class="field">
          <span>Monthly Bills</span>
          <textarea class="bills" placeholder="One amount per line"></textarea>
        </div>
        <div class="field">
          <span>Groceries (monthly)</span>
          <input type="number" class="groceries" min="0" step="0.01" />
        </div>
        <div class="field">
          <span>Gas &amp; Transportation (monthly)</span>
          <input type="number" class="gas" min="0" step="0.01" />
        </div>
        <div class="field slider-wrapper">
          <label for="savings-${index}">
            Savings Goal
            <span class="slider-value" id="savings-value-${index}"></span>
          </label>
          <input
            type="range"
            id="savings-${index}"
            class="savings-rate"
            min="0"
            max="60"
            step="1"
            data-display="savings-value-${index}"
          />
        </div>
        <div class="field slider-wrapper">
          <label for="wants-${index}">
            Wants / Leisure
            <span class="slider-value" id="wants-value-${index}"></span>
          </label>
          <input
            type="range"
            id="wants-${index}"
            class="wants-rate"
            min="0"
            max="60"
            step="1"
            data-display="wants-value-${index}"
          />
        </div>
        <div class="field">
          <span>Starting Debt Balance</span>
          <input type="number" class="starting-debt" min="0" step="0.01" />
        </div>
        <div class="field">
          <span>Starting Savings Balance</span>
          <input type="number" class="starting-savings" min="0" step="0.01" />
        </div>
      </div>
    `;

    peopleContainer.appendChild(section);

    const payPeriodSelect = section.querySelector('.pay-period');
    payPeriodSelect.value = person.payPeriod;

    const paycheckCountSelect = section.querySelector('.paycheck-count');
    for (let i = 1; i <= 12; i += 1) {
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = i;
      paycheckCountSelect.appendChild(option);
    }
    paycheckCountSelect.value = person.paycheckCount;

    renderPaycheckInputs(section, person.paycheckCount, person.paychecks);

    const billsTextarea = section.querySelector('.bills');
    billsTextarea.value = person.bills.map((bill) => bill.toFixed(2)).join('\n');

    section.querySelector('.groceries').value = person.groceries;
    section.querySelector('.gas').value = person.gas;
    section.querySelector('.starting-debt').value = person.startingDebt;
    section.querySelector('.starting-savings').value = person.startingSavings;

    const savingsSlider = section.querySelector('.savings-rate');
    const wantsSlider = section.querySelector('.wants-rate');

    savingsSlider.value = person.savingsRate;
    wantsSlider.value = person.wantsRate;

    bindSlider(savingsSlider);
    bindSlider(wantsSlider);

    section.querySelectorAll('input, select, textarea').forEach((el) => {
      if (el.classList.contains('paycheck-count')) {
        el.addEventListener('change', () => {
          const values = getPaychecks(section);
          renderPaycheckInputs(section, Number(el.value), values);
          updateAll();
        });
      } else {
        const eventName = el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(eventName, updateAll);
      }
    });
  });
}

function renderPaycheckInputs(section, count, values = []) {
  const container = section.querySelector('.paycheck-list');
  const existingValues = Array.isArray(values) ? values.slice(0, count) : [];
  const currentValues = getPaychecks(section);

  container.innerHTML = '';
  for (let i = 0; i < count; i += 1) {
    const wrapper = document.createElement('div');
    wrapper.className = 'paycheck-input';
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.step = '0.01';
    input.className = 'paycheck-amount';
    const label = document.createElement('span');
    label.textContent = `#${i + 1}`;

    const value = existingValues[i] ?? currentValues[i];
    if (Number.isFinite(value)) {
      input.value = value;
    }

    input.addEventListener('input', updateAll);

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    container.appendChild(wrapper);
  }
}

function bindSlider(slider) {
  const display = document.getElementById(slider.dataset.display);
  const setValue = () => {
    display.textContent = `${slider.value}% of income`;
  };
  slider.addEventListener('input', () => {
    setValue();
    updateAll();
  });
  setValue();
}

function bindGlobalInputs() {
  const actualRentInput = document.getElementById('actual-rent');
  const projectionMonthsInput = document.getElementById('projection-months');

  if (DEFAULT_STATE.actualRent) {
    actualRentInput.value = DEFAULT_STATE.actualRent;
  }
  if (DEFAULT_STATE.projectionMonths) {
    projectionMonthsInput.value = DEFAULT_STATE.projectionMonths;
  }

  actualRentInput.addEventListener('input', updateAll);
  projectionMonthsInput.addEventListener('input', updateAll);
}

function updateAll() {
  const actualRent = getNumber(document.getElementById('actual-rent').value);
  const projectionMonths = Math.max(
    1,
    Math.round(getNumber(document.getElementById('projection-months').value) || 12),
  );

  const personSections = Array.from(document.querySelectorAll('.person-card'));
  const persons = personSections.map((section) => collectPersonData(section));

  const calculations = computeBudget(persons, actualRent, projectionMonths);
  renderRentSummary(calculations);
  renderBudgetTables(calculations);
  renderFiftyThirtyTwenty(calculations);
  renderSavingsInsights(calculations);
  renderCharts(calculations);
}

function collectPersonData(section) {
  const payPeriod = section.querySelector('.pay-period').value;
  const paychecks = getPaychecks(section);
  const bills = parseNumberList(section.querySelector('.bills').value);
  const groceries = getNumber(section.querySelector('.groceries').value);
  const gas = getNumber(section.querySelector('.gas').value);
  const savingsRate = getNumber(section.querySelector('.savings-rate').value);
  const wantsRate = getNumber(section.querySelector('.wants-rate').value);
  const startingDebt = getNumber(section.querySelector('.starting-debt').value);
  const startingSavings = getNumber(section.querySelector('.starting-savings').value);

  return {
    name: section.querySelector('h2 span').textContent.trim(),
    payPeriod,
    paychecks,
    bills,
    groceries,
    gas,
    savingsRate: savingsRate / 100,
    wantsRate: wantsRate / 100,
    startingDebt,
    startingSavings,
  };
}

function getPaychecks(section) {
  return Array.from(section.querySelectorAll('.paycheck-amount'))
    .map((input) => getNumber(input.value))
    .filter((value) => Number.isFinite(value) && value >= 0);
}

function parseNumberList(value) {
  return value
    .split(/[\n,]+/)
    .map((item) => getNumber(item.trim()))
    .filter((num) => Number.isFinite(num) && num >= 0);
}

function getNumber(value) {
  if (typeof value !== 'string') {
    return Number.isFinite(value) ? value : 0;
  }
  const number = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(number) ? number : 0;
}

function computeBudget(persons, actualRent, projectionMonths) {
  const incomes = persons.map((person) => {
    const avgPaycheck = mean(person.paychecks);
    const monthlyIncome = avgPaycheck ? monthlyFromPay(avgPaycheck, person.payPeriod) : 0;
    const maxRent = monthlyIncome * 0.3;
    return {
      ...person,
      avgPaycheck,
      monthlyIncome,
      maxRent,
      billsTotal: sum(person.bills),
    };
  });

  const totalMaxRent = incomes.reduce((total, person) => total + person.maxRent, 0);
  const fairShares = incomes.map((person) =>
    totalMaxRent > 0 ? (person.maxRent / totalMaxRent) * actualRent : actualRent / incomes.length,
  );

  const halfShare = incomes.length > 0 ? actualRent / incomes.length : 0;

  const budgets = incomes.map((person, index) => {
    const rentShare = fairShares[index];
    const rentShareHalf = halfShare;

    const savings = person.monthlyIncome * person.savingsRate;
    const wants = person.monthlyIncome * person.wantsRate;
    const groceries = person.groceries;
    const gas = person.gas;
    const bills = person.billsTotal;

    const monthlyDebtAllocation = Math.max(
      0,
      person.monthlyIncome - (rentShare + bills + groceries + gas + savings + wants),
    );

    const debtInfo = payoffMonths(person.startingDebt, monthlyDebtAllocation);

    const savingsProjection = buildSavingsProjection({
      months: projectionMonths,
      startingSavings: person.startingSavings,
      monthlySavings: savings,
      debtMonths: debtInfo.months,
      debtContribution: monthlyDebtAllocation,
    });

    return {
      ...person,
      rentShare,
      rentShareHalf,
      savings,
      wants,
      monthlyDebtAllocation,
      groceries,
      gas,
      bills,
      percentages: {
        rent: percentageOf(rentShare, person.monthlyIncome),
        bills: percentageOf(bills, person.monthlyIncome),
        groceries: percentageOf(groceries, person.monthlyIncome),
        gas: percentageOf(gas, person.monthlyIncome),
        savings: percentageOf(savings, person.monthlyIncome),
        wants: percentageOf(wants, person.monthlyIncome),
        debt: percentageOf(monthlyDebtAllocation, person.monthlyIncome),
      },
      debtInfo,
      savingsProjection,
    };
  });

  const affordability = actualRent <= fairShares.reduce((total, _, index) => total + incomes[index].maxRent, 0);

  return {
    actualRent,
    projectionMonths,
    persons: budgets,
    affordability,
    fairShares,
    halfShare,
    totalMaxRent,
  };
}

function buildSavingsProjection({
  months,
  startingSavings,
  monthlySavings,
  debtMonths,
  debtContribution,
}) {
  const monthlySeries = [];
  let balance = startingSavings;
  for (let month = 1; month <= months; month += 1) {
    let deposit = monthlySavings;
    if (Number.isFinite(debtMonths) && debtMonths > 0 && month > debtMonths) {
      deposit += debtContribution;
    }
    balance += deposit;
    monthlySeries.push(Number(balance.toFixed(2)));
  }

  const extraSavings = Number(
    ((Number.isFinite(debtMonths) && debtMonths < months)
      ? (months - debtMonths) * debtContribution
      : 0
    ).toFixed(2),
  );

  return {
    months,
    monthlySeries,
    totalAdded: Number((monthlySavings * months + extraSavings).toFixed(2)),
    finalBalance: Number(balance.toFixed(2)),
    extraSavings,
  };
}

function renderRentSummary({ persons, actualRent, affordability, fairShares, halfShare }) {
  const tbody = document.getElementById('rent-summary-body');
  tbody.innerHTML = '';

  const categories = [
    {
      label: 'Average Paycheck',
      values: persons.map((person) => toCurrency(person.avgPaycheck)),
    },
    {
      label: 'Monthly Income',
      values: persons.map((person) => toCurrency(person.monthlyIncome)),
    },
    {
      label: 'Max Rent (30%)',
      values: persons.map((person) => toCurrency(person.maxRent)),
    },
    {
      label: 'Fair Rent Share',
      values: persons.map((person) => toCurrency(person.rentShare)),
    },
    {
      label: '% Income to Rent (fair)',
      values: persons.map((person) => toPercent(person.percentages.rent)),
    },
    {
      label: 'Equal Rent Share',
      values: persons.map(() => toCurrency(halfShare)),
    },
    {
      label: '% Income to Rent (equal)',
      values: persons.map((person) => toPercent(percentageOf(halfShare, person.monthlyIncome))),
    },
  ];

  categories.forEach((category) => {
    const row = document.createElement('tr');
    const labelCell = document.createElement('th');
    labelCell.scope = 'row';
    labelCell.textContent = category.label;
    row.appendChild(labelCell);

    category.values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });

  const message = document.getElementById('affordability-message');
  message.textContent = affordability
    ? 'Great! The rent fits comfortably within the 30% guideline based on your incomes.'
    : 'Caution: The rent exceeds the 30% of income guideline. Consider adjustments to stay on track.';
  message.className = `status ${affordability ? 'good' : 'warn'}`;
}

function renderBudgetTables({ persons }) {
  const budgetBody = document.getElementById('budget-breakdown-body');
  const percentageBody = document.getElementById('percentage-breakdown-body');

  budgetBody.innerHTML = '';
  percentageBody.innerHTML = '';

  const categories = [
    {
      label: 'Rent',
      values: persons.map((person) => person.rentShare),
      percents: persons.map((person) => person.percentages.rent),
    },
    {
      label: 'Bills',
      values: persons.map((person) => person.bills),
      percents: persons.map((person) => person.percentages.bills),
    },
    {
      label: 'Groceries',
      values: persons.map((person) => person.groceries),
      percents: persons.map((person) => person.percentages.groceries),
    },
    {
      label: 'Gas / Transportation',
      values: persons.map((person) => person.gas),
      percents: persons.map((person) => person.percentages.gas),
    },
    {
      label: 'Savings',
      values: persons.map((person) => person.savings),
      percents: persons.map((person) => person.percentages.savings),
    },
    {
      label: 'Wants / Leisure',
      values: persons.map((person) => person.wants),
      percents: persons.map((person) => person.percentages.wants),
    },
    {
      label: 'Debt / Extra Goals',
      values: persons.map((person) => person.monthlyDebtAllocation),
      percents: persons.map((person) => person.percentages.debt),
    },
  ];

  categories.forEach(({ label, values, percents }) => {
    const row = document.createElement('tr');
    const labelCell = document.createElement('th');
    labelCell.scope = 'row';
    labelCell.textContent = label;
    row.appendChild(labelCell);

    values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = toCurrency(value);
      row.appendChild(cell);
    });

    budgetBody.appendChild(row);

    const percentRow = document.createElement('tr');
    const percentLabel = document.createElement('th');
    percentLabel.scope = 'row';
    percentLabel.textContent = label;
    percentRow.appendChild(percentLabel);

    percents.forEach((percent) => {
      const cell = document.createElement('td');
      cell.textContent = toPercent(percent);
      percentRow.appendChild(cell);
    });

    percentageBody.appendChild(percentRow);
  });
}

function renderFiftyThirtyTwenty({ persons }) {
  const tbody = document.getElementById('fifty-table-body');
  tbody.innerHTML = '';

  const theoretical = [50, 30, 20];
  const categories = [
    {
      label: 'Needs',
      values: persons.map((person) =>
        person.percentages.rent + person.percentages.bills + person.percentages.groceries + person.percentages.gas,
      ),
    },
    {
      label: 'Wants',
      values: persons.map((person) => person.percentages.wants),
    },
    {
      label: 'Savings & Debt',
      values: persons.map((person) => person.percentages.savings + person.percentages.debt),
    },
  ];

  categories.forEach((category, index) => {
    const row = document.createElement('tr');
    const labelCell = document.createElement('th');
    labelCell.scope = 'row';
    labelCell.textContent = category.label;
    row.appendChild(labelCell);

    const theoreticalCell = document.createElement('td');
    theoreticalCell.textContent = `${theoretical[index]}%`;
    row.appendChild(theoreticalCell);

    category.values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = toPercent(value);
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });
}

function renderSavingsInsights({ persons, projectionMonths }) {
  const summaries = [
    document.getElementById('person1-savings-summary'),
    document.getElementById('person2-savings-summary'),
  ];

  persons.forEach((person, index) => {
    const summary = summaries[index];
    summary.innerHTML = '';

    const items = [
      `Monthly savings allocation: ${toCurrency(person.savings)} (${toPercent(person.percentages.savings)})`,
      `Monthly debt / goal allocation: ${toCurrency(person.monthlyDebtAllocation)} (${toPercent(
        person.percentages.debt,
      )})`,
      person.debtInfo.months === Infinity
        ? 'Debt payoff timeline: Not achievable with the current allocation.'
        : `Debt payoff timeline: ${person.debtInfo.months} month${person.debtInfo.months === 1 ? '' : 's'}.`,
      `Projected savings after ${projectionMonths} month${projectionMonths === 1 ? '' : 's'}: ${toCurrency(
        person.savingsProjection.totalAdded,
      )}`,
      `Projected savings balance after ${projectionMonths} month${projectionMonths === 1 ? '' : 's'}: ${toCurrency(
        person.savingsProjection.finalBalance,
      )}`,
    ];

    items.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      summary.appendChild(li);
    });
  });
}

function renderCharts({ persons, projectionMonths }) {
  const palette = [
    '#3f51b5',
    '#22c55e',
    '#f97316',
    '#06b6d4',
    '#a855f7',
    '#facc15',
    '#ef4444',
  ];

  persons.forEach((person, index) => {
    const labels = ['Rent', 'Bills', 'Groceries', 'Gas', 'Savings', 'Wants', 'Debt'];
    const amounts = [
      person.rentShare,
      person.bills,
      person.groceries,
      person.gas,
      person.savings,
      person.wants,
      person.monthlyDebtAllocation,
    ];

    const pieId = index === 0 ? 'person1-budget-chart' : 'person2-budget-chart';
    createOrUpdateChart(pieId, 'pie', {
      labels,
      datasets: [
        {
          label: `${person.name} Budget Breakdown`,
          data: amounts,
          backgroundColor: palette,
        },
      ],
    });

    const ratioId = index === 0 ? 'person1-ratio-chart' : 'person2-ratio-chart';
    const needs =
      person.percentages.rent +
      person.percentages.bills +
      person.percentages.groceries +
      person.percentages.gas;
    const wants = person.percentages.wants;
    const savings = person.percentages.savings + person.percentages.debt;

    createOrUpdateChart(ratioId, 'bar', {
      labels: ['Needs', 'Wants', 'Savings / Debt'],
      datasets: [
        {
          label: '50/30/20',
          data: [50, 30, 20],
          backgroundColor: 'rgba(99, 102, 241, 0.25)',
          borderColor: '#6366f1',
          borderWidth: 1,
        },
        {
          label: person.name,
          data: [needs, wants, savings],
          backgroundColor: '#3f51b5',
        },
      ],
    }, {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`,
          },
        },
      },
    });

    const savingsId = index === 0 ? 'person1-savings-chart' : 'person2-savings-chart';
    const savingsLabels = Array.from({ length: projectionMonths }, (_, i) => `Month ${i + 1}`);
    createOrUpdateChart(
      savingsId,
      'line',
      {
        labels: savingsLabels,
        datasets: [
          {
            label: `${person.name} Savings Balance`,
            data: person.savingsProjection.monthlySeries,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            tension: 0.3,
            fill: true,
          },
        ],
      },
      {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${value}`,
            },
          },
        },
      },
    );

    const debtCard = document.getElementById(index === 0 ? 'person1-debt-chart-card' : 'person2-debt-chart-card');
    const debtMessage = document.getElementById(index === 0 ? 'person1-debt-message' : 'person2-debt-message');
    const debtId = index === 0 ? 'person1-debt-chart' : 'person2-debt-chart';

    if (person.debtInfo.months === Infinity || person.debtInfo.series.length === 0) {
      debtMessage.textContent = 'No payoff schedule because the monthly contribution is zero or negative.';
      debtCard.classList.add('no-chart');
      if (charts[debtId]) {
        charts[debtId].destroy();
        delete charts[debtId];
      }
    } else {
      debtMessage.textContent = '';
      debtCard.classList.remove('no-chart');
      const debtLabels = Array.from({ length: person.debtInfo.series.length }, (_, i) => `Month ${i + 1}`);
      createOrUpdateChart(
        debtId,
        'line',
        {
          labels: debtLabels,
          datasets: [
            {
              label: `${person.name} Debt Balance`,
              data: person.debtInfo.series,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.18)',
              tension: 0.3,
              fill: true,
            },
          ],
        },
        {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `$${value}`,
              },
            },
          },
        },
      );
    }
  });
}

function createOrUpdateChart(id, type, data, options = {}) {
  const ctx = document.getElementById(id);
  if (!ctx) return;

  if (charts[id]) {
    charts[id].data = data;
    charts[id].options = { ...charts[id].options, ...options };
    charts[id].update();
  } else {
    charts[id] = new Chart(ctx, {
      type,
      data,
      options: {
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label(context) {
                if (type === 'pie') {
                  const value = context.parsed;
                  return `${context.label}: ${toCurrency(value)}`;
                }
                if (type === 'bar') {
                  const value = context.parsed.y ?? context.parsed;
                  return `${context.dataset.label}: ${value.toFixed(1)}%`;
                }
                if (type === 'line') {
                  const value = context.parsed.y ?? context.parsed;
                  return `${context.dataset.label}: ${toCurrency(value)}`;
                }
                return context.formattedValue;
              },
            },
          },
        },
        ...options,
      },
    });
  }
}

function payoffMonths(startingDebt, monthlyPayment) {
  if (!Number.isFinite(startingDebt) || startingDebt <= 0) {
    return { months: 0, series: [] };
  }
  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) {
    return { months: Infinity, series: [] };
  }

  const months = Math.ceil(startingDebt / monthlyPayment);
  const series = [];
  for (let i = 0; i < months; i += 1) {
    const value = Math.max(0, startingDebt - monthlyPayment * i);
    series.push(Number(value.toFixed(2)));
  }
  series[series.length - 1] = 0;

  return { months, series };
}

function monthlyFromPay(avgPaycheck, period) {
  const normalized = period.trim().toLowerCase();
  switch (normalized) {
    case 'semimonthly':
    case 'semi-monthly':
    case 'semi monthly':
      return avgPaycheck * 2;
    case 'weekly':
      return avgPaycheck * (52 / 12);
    case 'biweekly':
      return avgPaycheck * (26 / 12);
    default:
      return avgPaycheck * 2;
  }
}

function mean(values) {
  if (!values || values.length === 0) return 0;
  const total = values.reduce((sumValue, value) => sumValue + value, 0);
  return total / values.length;
}

function sum(values) {
  if (!values || values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0);
}

function percentageOf(part, whole) {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole === 0) return 0;
  return (part / whole) * 100;
}

function toCurrency(value) {
  if (!Number.isFinite(value)) return '$0.00';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function toPercent(value) {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(1)}%`;
}
