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

function updateDashboard() {
    if (!Object.keys(dashboardData).length) return;

    const monthKey =
        `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}`;

    console.log("Selected site:", selectedSite);
    console.log("Selected month:", monthKey);

    const data = dashboardData[selectedSite]?.[monthKey];
    if (!data) return;

    const costLabels = Object.keys(data.systemCostShare);
    const costValues = Object.values(data.systemCostShare);

    consumptionCard.innerHTML = `
    <h3>Electricity Consumption</h3>
    <p>${data.electricityConsumption.toLocaleString()} kWh</p>`;

    usageCard.innerHTML = `
    <h3>Usage Intensity</h3>
    <p>${data.usageIntensity}</p>`;

    totalCostCard.innerHTML = `
    <h3>Total Cost</h3>
    <p>£${data.totalCost}</p>`;

    rateCard.innerHTML = `
    <h3>Daily Rate</h3>
    <p>£${data.dailyRate}</p>`;

    costPersonCard.innerHTML = `
    <h3>Cost Per Person</h3>
    <p>£${data.costPerPerson}</p>`;

    totalCarbonCard.innerHTML = `
    <h3>Carbon Total</h3>
    <p>${data.carbonTotal}</p>`;

    carbonPersonCard.innerHTML = `
    <h3>Carbon Per Person</h3>
    <p>${data.carbonPerPerson}</p>`;

    treeCard.innerHTML = `
    <h3>Trees Planted</h3>
    <p>${data.treesPlanted}</p>`;

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
                    data: data.dailyTotals
                },
                {
                    label: "Previous Period",
                    data: data.previousDailyTotals
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
                    data: costValues
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
                    data: data.dailyCosts
                },
                {
                    label: "Previous period",
                    data: data.previousDailyCosts
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
                    data: data.offsetBreakdown
                },
                {
                    label: "Previous Period",
                    data: data.previousOffsetBreakdown
                }
            ]
        }
    });

    console.log(data);
}

loadData();