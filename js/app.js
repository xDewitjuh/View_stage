let dashboardData = {};

let selectedSite = "";
let selectedMonth = new Date();

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

    console.log(data);
}

loadData();