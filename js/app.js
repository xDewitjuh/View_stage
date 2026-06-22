let dashboardData = {};

let selectedSite = "";
let selectedMonth = new Date();

const siteSelect = document.getElementById("site-select");
const currentMonth = document.getElementById("currentMonth");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

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

    console.log(data);
}

loadData();