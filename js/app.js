let zincText = "";

async function loadData() {
    const response = await fetch("./data/Dewi-Stage-Data.zinc");
    zincText = await response.text();

    populateSites();
    updateMonthDisplay();
    updateDashboard();
}

loadData();

let selectedSite;
let selectedMonth = new Date();

const siteSelect = document.getElementById("site-select");
const currentMonth = document.getElementById("currentMonth");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

siteSelect.addEventListener("change", () => {
    selectedSite = siteSelect.value;
    updateDashboard();
});

prevMonth.addEventListener("click", () => {
    selectedMonth.setMonth(
        selectedMonth.getMonth() - 1
    );

    updateMonthDisplay();
    updateDashboard();
});

nextMonth.addEventListener("click", () => {
    selectedMonth.setMonth(
        selectedMonth.getMonth() + 1
    );

    updateMonthDisplay();
    updateDashboard();
});

function populateSites() {
    const sites = [
        "Infinity HQ",
        "Fantom Factory HQ"
    ];

    sites.forEach(site => {
        const option = document.createElement("option");

        option.value = site;
        option.textContent = site;

        siteSelect.appendChild(option);
    });
}

function updateMonthDisplay() {
    currentMonth.textContent =
        selectedMonth.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric"
        });
}

function updateDashboard() {
    if (!zincText) return;

    console.log("Selected site:", selectedSite);

}