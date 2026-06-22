let dashboardData = {};

let selectedSite = "";
let selectedMonth = new Date();

let totalsChart = null;
let pieChart = null;
let energyCostChart = null;
let offsetChart = null;

const labels = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun"
];

const siteSelect = document.getElementById("site-select");
const currentMonth = document.getElementById("currentMonth");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const consumptionCard = document.getElementById("consumptionCard");
const usageCard = document.getElementById("usageCard");
const totalCostCard = document.getElementById("totalCostCard");
const rateCard = document.getElementById("rateCard");
const costPersonCard = document.getElementById("costPersonCard");
const totalCarbonCard = document.getElementById("totalCarbonCard");
const carbonPersonCard = document.getElementById("carbonPersonCard");
const treeCard = document.getElementById("treeCard");


async function loadData() {
    const response = await fetch("./data/data.json");
    dashboardData = await response.json();

    populateSites();
    updateMonthDisplay();
    updateDashboard();
}

function populateSites() {
    const sites = Object.keys(dashboardData);

    siteSelect.innerHTML = "";

    sites.forEach(site => {
        const option = document.createElement("option");

        option.value = site;
        option.textContent = site;

        siteSelect.appendChild(option);
    });

    if (sites.length > 0) {
        selectedSite = sites[0];
        siteSelect.value = selectedSite;
    }
}

function updateMonthDisplay() {
    currentMonth.textContent =
        selectedMonth.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric"
        });
}

siteSelect.addEventListener("change", () => {
    selectedSite = siteSelect.value;
    updateDashboard();
});

prevMonth.addEventListener("click", () => {
    selectedMonth.setMonth(selectedMonth.getMonth() - 1);

    updateMonthDisplay();
    updateDashboard();
});

nextMonth.addEventListener("click", () => {
    selectedMonth.setMonth(selectedMonth.getMonth() + 1);

    updateMonthDisplay();
    updateDashboard();
});

function getChangeClass(change) {
    if (change < 0) {
        return "negative";
    }

    if (change < 1) {
        return "neutral";
    }

    return "positive";
}

function updateCard(card, title, value, change) {
    const changeClass = getChangeClass(change);

    const changeText =
        change > 0
            ? `+${change}%`
            : `${change}%`;

    card.innerHTML = `
        <h3>${title}</h3>
        <p>${value}</p>
        <span class="${changeClass}">
            ${changeText}
        </span>
        <small>vs. last year</small>
    `;
}

function updateDashboard() {
    if (!Object.keys(dashboardData).length) return;

    const monthKey =
        `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}`;

    console.log("Selected site:", selectedSite);
    console.log("Selected month:", monthKey);

    const data = dashboardData[selectedSite]?.[monthKey];

    if (!data) {
        consumptionCard.innerHTML = "";
        usageCard.innerHTML = "";
        totalCostCard.innerHTML = "";
        rateCard.innerHTML = "";
        costPersonCard.innerHTML = "";
        totalCarbonCard.innerHTML = "";
        carbonPersonCard.innerHTML = "";
        treeCard.innerHTML = "";

        if (totalsChart) {
            totalsChart.destroy();
            totalsChart = null;
        }

        if (pieChart) {
            pieChart.destroy();
            pieChart = null;
        }

        if (energyCostChart) {
            energyCostChart.destroy();
            energyCostChart = null;
        }

        if (offsetChart) {
            offsetChart.destroy();
            offsetChart = null;
        }

        return;
    }

    const costLabels = Object.keys(data.systemCostShare);
    const costValues = Object.values(data.systemCostShare);

    updateCard(
        consumptionCard,
        "Electricity Consumption",
        `${data.electricityConsumption.toLocaleString()} kWh`,
        data.electricityChange
    );

    updateCard(
        usageCard,
        "Usage Intensity",
        `${data.usageIntensity} kWh/m²`,
        data.usageIntensityChange
    );

    updateCard(
        totalCostCard,
        "Total Cost",
        `£${data.totalCost}`,
        data.totalCostChange
    );

    updateCard(
        rateCard,
        "Daily Rate",
        `£${data.dailyRate}`,
        data.dailyRateChange
    );

    updateCard(
        costPersonCard,
        "Cost Per Person",
        `£${data.costPerPerson}`,
        data.costPerPersonChange
    );

    updateCard(
        totalCarbonCard,
        "Carbon Total",
        `${data.carbonTotal} kgCO₂e`,
        data.carbonTotalChange
    );

    updateCard(
        carbonPersonCard,
        "Carbon Per Person",
        `${data.carbonPerPerson} kgCO₂e`,
        data.carbonPerPersonChange
    );

    treeCard.innerHTML = `
    <h3>Offset Equivalent</h3>

    <div class="trees-value">
        ${data.treesPlanted}
        <span>trees planted</span>
    </div>

    <p class="trees-subtitle">
        Equivalent to ${data.co2Offset} tonnes of CO₂
    </p>
`;

    if (totalsChart) {
        totalsChart.destroy();
    }

    const ctx = document
        .getElementById("totalsChart")
        .getContext("2d");

    totalsChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Current Period",
                    data: data.dailyTotals,
                    borderColor: "#4CAF50",
                    backgroundColor: "#4CAF50",
                    tension: 0,
                    pointRadius: 3
                },
                {
                    label: "Previous Period",
                    data: data.previousDailyTotals,
                    borderColor: "#8e73c7",
                    backgroundColor: "#8e73c7",
                    borderDash: [5, 5]
                }
            ]
        }
    });

    if (pieChart) {
        pieChart.destroy();
    }

    const pieCtx = document
        .getElementById("pieChart")
        .getContext("2d");

    pieChart = new Chart(pieCtx, {
        type: "pie",
        data: {
            labels: costLabels,
            datasets: [
                {
                    data: costValues,
                    backgroundColor: [
                        "#5BC85B", // AHUs 
                        "#E9C95B", // Cooling 
                        "#4A9FE3", // Heating 
                        "#A85AD4", // Lighting 
                        "#E4A13D", // Plug-Load 
                    ],
                    borderColor: "#ffffff",
                    borderWidth: 2,
                }
            ]
        }
    });

    if (energyCostChart) {
        energyCostChart.destroy();
    }

    const energyCostCtx = document
        .getElementById("energyCostChart")
        .getContext("2d");

    energyCostChart = new Chart(energyCostCtx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Current period",
                    data: data.dailyCosts,
                    borderColor: "#4CAF50",
                    backgroundColor: "#4CAF50",
                    tension: 0,
                    pointRadius: 3
                },
                {
                    label: "Previous period",
                    data: data.previousDailyCosts,
                    borderColor: "#8e73c7",
                    backgroundColor: "#8e73c7",
                    borderDash: [5, 5]
                }
            ]
        }
    });

    if (offsetChart) {
        offsetChart.destroy();
    }

    const offsetCtx = document
        .getElementById("offsetChart")
        .getContext("2d");

    offsetChart = new Chart(offsetCtx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Current Period",
                    data: data.offsetBreakdown,
                    backgroundColor: "#5BC85B"
                },
                {
                    label: "Previous Period",
                    data: data.previousOffsetBreakdown,
                    backgroundColor: "#E9C95B"
                }
            ]
        }
    });

    console.log(data);
}

loadData();