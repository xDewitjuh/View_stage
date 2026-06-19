let zincText = "";

async function loadData() {
    const response = await fetch("./data/Dewi-Stage-Data.zinc");
    zincText = await response.text();

    populateSites();
    updateDashboard();
}

loadData();

let selectedSite;
let selectedMonth;

const siteSelect = document.getElementById("site-select");
const currentMonth = document.getElementById("currentMonth");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

siteSelect.addEventListener("change", () => {
    selectedSite = siteSelect.value;
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

function updateDashboard() {
    if (!zincText) return;

    console.log("Selected site:", selectedSite);

}