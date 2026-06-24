let dashboardData = {};

let selectedSite = "";
let selectedMonth = new Date();
let selectedPeriod = "month";

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
const datePicker = document.getElementById("datePicker");
const periodSelect = document.getElementById("periodSelect");
const consumptionCard = document.getElementById("consumptionCard");
const usageCard = document.getElementById("usageCard");
const totalCostCard = document.getElementById("totalCostCard");
const rateCard = document.getElementById("rateCard");
const costPersonCard = document.getElementById("costPersonCard");
const totalCarbonCard = document.getElementById("totalCarbonCard");
const carbonPersonCard = document.getElementById("carbonPersonCard");
const treeCard = document.getElementById("treeCard");
const reportTitle = document.getElementById("reportTitle");
const reportPeriod = document.getElementById("reportPeriod");
const reportAddress = document.getElementById("reportAddress");


async function loadData() {
    const response = await fetch("./data/data.json");
    dashboardData = await response.json();

    populateSites();

    datePicker.value =
        new Date().toISOString().split("T")[0];

    periodSelect.value = selectedPeriod;

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

siteSelect.addEventListener("change", () => {
    selectedSite = siteSelect.value;
    updateDashboard();
});

datePicker.addEventListener("change", () => {
    selectedMonth = new Date(datePicker.value);
    updateDashboard();
});

periodSelect.addEventListener("change", () => {
    selectedPeriod = periodSelect.value;

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
        <p class="card-value">${value}</p>
        <span class="${changeClass}">
            ${changeText}
        </span>
        <small>vs. last year</small>
    `;
}

function getWeekData(data) {
    return {
        ...data,
        electricityConsumption:
            Math.round(data.electricityConsumption / 4),

        totalCost:
            Number((data.totalCost / 4).toFixed(2)),

        carbonTotal:
            Math.round(data.carbonTotal / 4),

        treesPlanted:
            Math.round(data.treesPlanted / 4),

        dailyRate:
            Number((data.dailyRate / 4).toFixed(2))
    };
}

function getQuarterData(site, selectedMonth) {

    const currentMonth = selectedMonth.getMonth() + 1;
    const year = selectedMonth.getFullYear();

    const quarterMonths = [
        `${year}-${String(currentMonth - 2).padStart(2, "0")}`,
        `${year}-${String(currentMonth - 1).padStart(2, "0")}`,
        `${year}-${String(currentMonth).padStart(2, "0")}`
    ];

    const quarterData = quarterMonths
        .map(month => dashboardData[site]?.[month])
        .filter(Boolean);

    if (!quarterData.length) {
        return null;
    }

    return {
        ...quarterData[quarterData.length - 1],

        electricityConsumption:
            quarterData.reduce(
                (sum, month) => sum + month.electricityConsumption,
                0
            ),

        totalCost:
            quarterData.reduce(
                (sum, month) => sum + month.totalCost,
                0
            ),

        carbonTotal:
            quarterData.reduce(
                (sum, month) => sum + month.carbonTotal,
                0
            ),

        treesPlanted:
            quarterData.reduce(
                (sum, month) => sum + month.treesPlanted,
                0
            ),

        usageIntensity:
            quarterData.reduce(
                (sum, month) => sum + month.usageIntensity,
                0
            ) / quarterData.length,

        dailyRate:
            quarterData.reduce(
                (sum, month) => sum + month.dailyRate,
                0
            ) / quarterData.length,

        costPerPerson:
            quarterData.reduce(
                (sum, month) => sum + month.costPerPerson,
                0
            ) / quarterData.length,

        carbonPerPerson:
            quarterData.reduce(
                (sum, month) => sum + month.carbonPerPerson,
                0
            ) / quarterData.length
    };
}

function updateDashboard() {
    if (!Object.keys(dashboardData).length) return;

    const monthKey =
        `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}`;

    let data =
        dashboardData[selectedSite]?.[monthKey];

    if (selectedPeriod === "week" && data) {
        data = getWeekData(data);
    }

    if (selectedPeriod === "quarter" && data) {
        data = getQuarterData(
            selectedSite,
            selectedMonth
        );
    }

    if (!data) {
        consumptionCard.innerHTML = "";
        usageCard.innerHTML = "";
        totalCostCard.innerHTML = "";
        rateCard.innerHTML = "";
        costPersonCard.innerHTML = "";
        totalCarbonCard.innerHTML = "";
        carbonPersonCard.innerHTML = "";
        treeCard.innerHTML = "";
        reportPeriod.textContent = "";

        document.getElementById("consumptionReduction").textContent = "";
        document.getElementById("consumptionTarget").textContent = "";

        document.getElementById("costReduction").textContent = "";
        document.getElementById("costTarget").textContent = "";
        document.getElementById("costSummary").textContent = "";

        document.getElementById("carbonReduction").textContent = "";
        document.getElementById("offsetEquivalent").textContent = "";

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

    reportTitle.textContent =
        `${selectedSite} - Energy Report`;

    reportAddress.textContent =
        dashboardData[selectedSite].address;

    const firstDay =
        new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);

    const lastDay =
        new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

    if (selectedPeriod === "month") {

        reportPeriod.textContent =
            `${firstDay.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            })} - ${lastDay.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            })}`;

    } else if (selectedPeriod === "week") {

        const weekStart = new Date(selectedMonth);
        const day = weekStart.getDay();

        const daysFromMonday =
            day === 0 ? 6 : day - 1;

        weekStart.setDate(
            weekStart.getDate() - daysFromMonday
        );

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(
            weekStart.getDate() + 6
        );

        reportPeriod.textContent =
            `${weekStart.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            })} - ${weekEnd.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            })}`;

    } else if (selectedPeriod === "quarter") {

        const quarter =
            Math.ceil((selectedMonth.getMonth() + 1) / 3);

        reportPeriod.textContent =
            `Q${quarter} ${selectedMonth.getFullYear()}`;
    }

    const previousMonthDate = new Date(selectedMonth);
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

    const previousMonthKey =
        `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, "0")}`;

    const previousMonthData =
        dashboardData[selectedSite]?.[previousMonthKey];

    if (previousMonthData) {
        const carbonDifference =
            previousMonthData.carbonTotal -
            data.carbonTotal;

        const carbonDirection =
            carbonDifference > 0
                ? "decreased"
                : "increased";

        const carbonAmount =
            (Math.abs(carbonDifference) / 1000).toFixed(2);

        document.getElementById("carbonReduction").textContent =
            `Carbon emissions ${carbonDirection} by ${carbonAmount} tonnes compared to last month`;

        document.getElementById("offsetEquivalent").textContent =
            `Offset equivalent of ${data.treesPlanted} trees planted over the reporting period`;
    }

    if (previousMonthData) {
        const difference =
            previousMonthData.electricityConsumption -
            data.electricityConsumption;

        const direction =
            difference > 0
                ? "decreased"
                : "increased";

        const amount = Math.abs(difference);

        document.getElementById("consumptionReduction").textContent =
            `Total electricity consumption ${direction} by ${amount.toLocaleString()} kWh compared to last month`;
    }

    const targetText =
        data.usageIntensity < 75
            ? "Building systems operating within expected consumption targets"
            : "Building systems operating above expected consumption targets";

    document.getElementById("consumptionTarget").textContent = targetText;

    if (previousMonthData) {

        const costDifference =
            previousMonthData.totalCost -
            data.totalCost;

        const costDirection =
            costDifference > 0
                ? "reduced"
                : "increased";

        const costAmount =
            Math.abs(costDifference).toFixed(2);

        document.getElementById("costReduction").textContent =
            `Total energy cost ${costDirection} by £${costAmount} compared to last month`;

        const costTargetText =
            data.costPerPerson <= 4
                ? "Cost per person remains within target parameters"
                : "Cost per person exceeds target parameters";

        document.getElementById("costTarget").textContent =
            costTargetText;

        const costSummary =
            costDifference > 0
                ? "Energy costs have continued to trend downward this period."
                : "Energy costs have continued to trend upward this period.";

        document.getElementById("costSummary").textContent =
            costSummary;
    }

    const costLabels = Object.keys(data.systemCostShare);
    const costValues = Object.values(data.systemCostShare);

    updateCard(
        consumptionCard,
        "Electricity Consumption",
        `${data.electricityConsumption.toLocaleString()} <small>kWh</small>`,
        data.electricityChange
    );

    updateCard(
        usageCard,
        "Usage Intensity",
        `${data.usageIntensity} <small>kWh/m²</small>`,
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
        `${data.carbonTotal} <small>kgCO₂e</small>`,
        data.carbonTotalChange
    );

    updateCard(
        carbonPersonCard,
        "Carbon Per Person",
        `${data.carbonPerPerson} <small>kgCO₂e</small>`,
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
}

loadData();