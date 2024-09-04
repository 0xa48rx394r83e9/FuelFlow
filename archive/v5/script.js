const svg = document.getElementById("map");
const svgNS = "http://www.w3.org/2000/svg";
const log = document.getElementById("log");
const devModeButton = document.getElementById("devModeButton");
const resetButton = document.getElementById("resetButton");
const gradientButton = document.getElementById("gradientButton");

let devMode = false;
let showGradients = true;
let scaleFactor = 15;
const visualizationMethods = [
    "gradient",
    "colorScale",
    "barChart",
    "pieChart",
    "numbers",
    "icons",
];
let currentVisualization = "gradient";

// Fuel prices data
const fuelPrices = {
    Algeria: { petrol: 0.31, diesel: 0.2 },
    Angola: { petrol: 0.31, diesel: 0.21 },
    Benin: { petrol: 1.03, diesel: 1.06 },
    Botswana: { petrol: 1.07, diesel: 1.07 },
    "Burkina Faso": { petrol: 1.29, diesel: 1.02 },
    Burundi: { petrol: 1.26, diesel: 1.24 },
    Cameroon: { petrol: 1.28, diesel: 1.26 },
    "Cape Verde": { petrol: 1.3, diesel: 1.12 },
    "Central African Republic": { petrol: 1.68, diesel: 2.06 },
    "Democratic Republic of the Congo": {
        petrol: 1.11,
        diesel: 1.1,
    },
    Egypt: { petrol: 0.28, diesel: 0.21 },
    Ethiopia: { petrol: 0.94, diesel: 0.95 },
    Gabon: { petrol: 0.91, diesel: 0.88 },
    Ghana: { petrol: 0.91, diesel: 0.88 },
    Guinea: { petrol: 1.27, diesel: 1.27 },
    "Ivory Coast": { petrol: 1.33, diesel: 1.08 },
    Kenya: { petrol: 1.32, diesel: 1.2 },
    Lesotho: { petrol: 1.06, diesel: 1.07 },
    Liberia: { petrol: 0.83, diesel: 0.94 },
    Madagascar: { petrol: 1.18, diesel: 0.98 },
    Malawi: { petrol: 1.33, diesel: 1.44 },
    Mali: { petrol: 1.29, diesel: 1.21 },
    Mauritius: { petrol: 1.3, diesel: 1.26 },
    Morocco: { petrol: 1.36, diesel: 1.17 },
    Mozambique: { petrol: 1.23, diesel: 1.3 },
    Namibia: { petrol: 1.09, diesel: 1.06 },
    Nigeria: { petrol: 0.43, diesel: 0.84 },
    Rwanda: { petrol: 1.15, diesel: 1.15 },
    Senegal: { petrol: 1.5, diesel: 1.14 },
    Seychelles: { petrol: 1.47, diesel: 1.41 },
    "South Africa": { petrol: 1.13, diesel: 1.14 },
    Sudan: { petrol: 0.64, diesel: 0.6 },
    Swaziland: { petrol: 1.07, diesel: 1.1 },
    Tanzania: { petrol: 1.08, diesel: 1.05 },
    Togo: { petrol: 1.06, diesel: 1.29 },
    Tunisia: { petrol: 0.74, diesel: 0.65 },
    Zambia: { petrol: 1.18, diesel: 1.06 },
    Zimbabwe: { petrol: 1.45, diesel: 1.48 },
};

// African countries data
const africanCountries = {
    Algeria: ["Algeria"],
    Angola: ["Angola"],
    Benin: ["Benin"],
    Botswana: ["Botswana"],
    "Burkina Faso": ["Burkina Faso"],
    Burundi: ["Burundi"],
    Cameroon: ["Cameroon"],
    "Cape Verde": ["Cape Verde", "Cabo Verde"],
    "Central African Republic": ["Central African Republic"],
    Chad: ["Chad"],
    Comoros: ["Comoros"],
    Congo: [
        "Congo",
        "Republic of the Congo",
        "Congo Republic",
        "Republic of Congo",
    ],
    "Democratic Republic of the Congo": [
        "Democratic Republic of the Congo",
        "DR Congo",
        "DRC",
    ],
    Djibouti: ["Djibouti"],
    Egypt: ["Egypt"],
    "Equatorial Guinea": ["Equatorial Guinea"],
    Eritrea: ["Eritrea"],
    Ethiopia: ["Ethiopia"],
    Gabon: ["Gabon"],
    Gambia: ["Gambia"],
    Ghana: ["Ghana"],
    Guinea: ["Guinea"],
    "Guinea-Bissau": ["Guinea-Bissau", "Guinea Bissau"],
    "Ivory Coast": ["Ivory Coast", "Côte d'Ivoire", "Cote d'Ivoire"],
    Kenya: ["Kenya"],
    Lesotho: ["Lesotho"],
    Liberia: ["Liberia"],
    Libya: ["Libya"],
    Madagascar: ["Madagascar"],
    Malawi: ["Malawi"],
    Mali: ["Mali"],
    Mauritania: ["Mauritania"],
    Mauritius: ["Mauritius"],
    Morocco: ["Morocco"],
    Mozambique: ["Mozambique"],
    Namibia: ["Namibia"],
    Niger: ["Niger"],
    Nigeria: ["Nigeria"],
    Rwanda: ["Rwanda"],
    "Sao Tome and Principe": ["Sao Tome and Principe", "São Tomé and Príncipe"],
    Senegal: ["Senegal"],
    Seychelles: ["Seychelles"],
    "Sierra Leone": ["Sierra Leone"],
    Somalia: ["Somalia"],
    "South Africa": ["South Africa"],
    "South Sudan": ["South Sudan"],
    Sudan: ["Sudan"],
    Swaziland: ["Swaziland", "eSwatini", "Eswatini"],
    Tanzania: ["Tanzania", "United Republic of Tanzania"],
    Togo: ["Togo"],
    Tunisia: ["Tunisia"],
    Uganda: ["Uganda"],
    Zambia: ["Zambia"],
    Zimbabwe: ["Zimbabwe"],
    "Western Sahara": ["Western Sahara"],
    Somaliland: ["Somaliland"],
};

// Utility functions
function addToLog(message) {
    log.textContent += message + "\n";
    log.scrollTop = log.scrollHeight;
}

function toggleDevMode() {
    devMode = !devMode;
    log.style.display = devMode ? "block" : "none";
    devModeButton.style.backgroundColor = devMode ? "#ffcc00" : "#f0f0f0";
}

function resetMap() {
    location.reload();
}

function toggleGradients() {
    showGradients = !showGradients;
    gradientButton.style.backgroundColor = showGradients
        ? "#ffcc00"
        : "#f0f0f0";
    document.querySelectorAll(".gradient-overlay").forEach((el) => {
        el.style.display = showGradients ? "inline" : "none";
    });
}

function projectCoordinates(coords) {
    const x = (coords[0] + 20) * scaleFactor;
    const y = (30 - coords[1]) * scaleFactor;
    return [x, y];
}

function getColorForPrice(price, max = 2.5) {
    const hue = ((1 - price / max) * 120).toString(10);
    return [`hsl(${hue}, 100%, 50%)`, `hsl(${hue}, 100%, 25%)`];
}

function drawCountry(geometry) {
    if (geometry.type === "Polygon") {
        return drawPolygon(geometry.coordinates);
    }
    if (geometry.type === "MultiPolygon") {
        return geometry.coordinates.map(drawPolygon).join(" ");
    }
    return "";
}

function drawPolygon(rings) {
    return rings
        .map((ring) => {
            return (
                ring
                    .map((coord, index) => {
                        const [x, y] = projectCoordinates(coord);
                        return `${index === 0 ? "M" : "L"}${x} ${y}`;
                    })
                    .join(" ") + "Z"
            );
        })
        .join(" ");
}

function calculateCentroid(geometry) {
    let totalX = 0,
        totalY = 0,
        pointCount = 0;
    const processCoords = (coord) => {
        const [x, y] = projectCoordinates(coord);
        totalX += x;
        totalY += y;
        pointCount++;
    };

    if (geometry.type === "Polygon") {
        geometry.coordinates[0].forEach(processCoords);
    } else if (geometry.type === "MultiPolygon") {
        geometry.coordinates.forEach((polygon) => {
            polygon[0].forEach(processCoords);
        });
    }

    return [totalX / pointCount, totalY / pointCount];
}

function createGradientPattern(price, type) {
    const maxPrice = 2.5;
    const minDensity = 20;
    const maxDensity = 5;
    const density = minDensity + (maxDensity - minDensity) * (price / maxPrice);

    const pattern = document.createElementNS(svgNS, "pattern");
    pattern.setAttribute("id", `${type}Pattern-${price.toFixed(2)}`);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("width", density.toString());
    pattern.setAttribute("height", density.toString());

    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", type === "petrol" ? density.toString() : "0");
    line.setAttribute("x2", density.toString());
    line.setAttribute("y2", type === "petrol" ? "0" : density.toString());
    line.setAttribute("stroke", type === "petrol" ? "red" : "blue");
    line.setAttribute("stroke-width", "1");

    pattern.appendChild(line);
    svg.querySelector("defs").appendChild(pattern);
    return `url(#${type}Pattern-${price.toFixed(2)})`;
}

function calculateBoundingBox(features) {
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

    features.forEach((feature) => {
        const processCoords = (coord) => {
            const [x, y] = projectCoordinates(coord);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        };

        if (feature.geometry.type === "Polygon") {
            feature.geometry.coordinates[0].forEach(processCoords);
        } else if (feature.geometry.type === "MultiPolygon") {
            feature.geometry.coordinates.forEach((polygon) => {
                polygon[0].forEach(processCoords);
            });
        }
    });

    return { minX, minY, maxX, maxY };
}

function centerMap(boundingBox) {
    const { minX, minY, maxX, maxY } = boundingBox;
    const width = maxX - minX;
    const height = maxY - minY;
    const padding = 20;

    const viewBox = `${minX - padding} ${minY - padding} ${
        width + 2 * padding
    } ${height + 2 * padding}`;
    svg.setAttribute("viewBox", viewBox);

    const containerAspectRatio = svg.clientWidth / svg.clientHeight;
    const mapAspectRatio = width / height;

    if (mapAspectRatio > containerAspectRatio) {
        scaleFactor = scaleFactor * (svg.clientWidth / width);
    } else {
        scaleFactor = scaleFactor * (svg.clientHeight / height);
    }

    addToLog(`Map centered. ViewBox: ${viewBox}, Scale Factor: ${scaleFactor}`);
}

function isAfricanCountry(countryName) {
    return Object.values(africanCountries).some((aliases) =>
        aliases.some(
            (alias) => alias.toLowerCase() === countryName.toLowerCase()
        )
    );
}

function getStandardCountryName(countryName) {
    for (const [standard, aliases] of Object.entries(africanCountries)) {
        if (
            aliases.some(
                (alias) => alias.toLowerCase() === countryName.toLowerCase()
            )
        ) {
            return standard;
        }
    }
    return countryName;
}

// Main function to process and render the map
function processMapData(data) {
    let count = 0;
    const processedCountries = new Set();
    const missingCountries = new Set(Object.keys(africanCountries));
    const labelPositions = [];

    const africanFeatures = data.features.filter((feature) =>
        isAfricanCountry(feature.properties.ADMIN)
    );
    const boundingBox = calculateBoundingBox(africanFeatures);
    centerMap(boundingBox);

    data.features.forEach((feature, index) => {
        const countryName = feature.properties.ADMIN;
        addToLog(`Processing feature ${index + 1}: ${countryName}`);
        if (countryName && isAfricanCountry(countryName)) {
            const standardName = getStandardCountryName(countryName);
            try {
                renderCountry(feature, standardName);
                const [cx, cy] = calculateCentroid(feature.geometry);
                labelPositions.push({ name: standardName, x: cx, y: cy });
                count++;
                processedCountries.add(standardName);
                missingCountries.delete(standardName);
                addToLog(`Added ${standardName}`);
            } catch (error) {
                addToLog(`Error adding ${standardName}: ${error.message}`);
            }
        } else if (countryName) {
            addToLog(`Skipped ${countryName} (not in Africa)`);
        } else {
            addToLog(`Skipped feature ${index + 1} (no country name)`);
        }
    });

    renderLabels(labelPositions);
    logResults(count, processedCountries, missingCountries, data);
}

function renderCountry(feature, standardName) {
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", drawCountry(feature.geometry));
    path.setAttribute("fill", "#FEB24C");
    path.setAttribute("stroke", "white");
    path.setAttribute("stroke-width", "0.5");
    path.setAttribute("id", `country-${standardName.replace(/\s+/g, "-")}`);
    svg.appendChild(path);

    if (fuelPrices[standardName]) {
        renderFuelOverlays(feature, standardName);
        renderFuelVisualizations(feature, standardName);
    }
}

function renderGradientOverlays(feature, petrol, diesel) {
    renderFuelOverlay(feature, petrol, "petrol");
    renderFuelOverlay(feature, diesel, "diesel");
}

function renderFuelVisualizations(feature, standardName) {
    const { petrol, diesel } = fuelPrices[standardName];
    const [cx, cy] = calculateCentroid(feature.geometry);

    const visualizations = {
        gradient: () => renderGradientOverlays(feature, petrol, diesel),
        colorScale: () => renderColorScale(feature, petrol, diesel),
        barChart: () => renderBarChart(cx, cy, petrol, diesel),
        pieChart: () => renderPieChart(cx, cy, petrol, diesel),
        numbers: () => renderNumbers(cx, cy, petrol, diesel),
        icons: () => renderIcons(cx, cy, petrol, diesel),
    };

    Object.entries(visualizations).forEach(([method, renderFunc]) => {
        const group = document.createElementNS(svgNS, "g");
        group.setAttribute("class", `visualization ${method}`);
        group.style.display =
            method === currentVisualization ? "inline" : "none";
        const elements = renderFunc();
        if (Array.isArray(elements)) {
            elements.forEach((el) => group.appendChild(el));
        } else if (elements) {
            group.appendChild(elements);
        }
        svg.appendChild(group);
    });
}

function renderFuelOverlay(feature, price, fuelType) {
    const overlay = document.createElementNS(svgNS, "path");
    overlay.setAttribute("d", drawCountry(feature.geometry));
    overlay.setAttribute("fill", createGradientPattern(price, fuelType));
    overlay.setAttribute("fill-opacity", "0.5");
    overlay.classList.add("gradient-overlay", fuelType);
    return overlay;
}

function renderColorScale(feature, petrol, diesel) {
    const [petrolColor, petrolStroke] = getColorForPrice(petrol);
    const [dieselColor, dieselStroke] = getColorForPrice(diesel);

    const petrolHalf = document.createElementNS(svgNS, "path");
    petrolHalf.setAttribute("d", drawCountry(feature.geometry));
    petrolHalf.setAttribute("fill", petrolColor);
    petrolHalf.setAttribute("stroke", petrolStroke);
    petrolHalf.setAttribute(
        "clip-path",
        "polygon(0 0, 50% 0, 50% 100%, 0 100%)"
    );

    const dieselHalf = document.createElementNS(svgNS, "path");
    dieselHalf.setAttribute("d", drawCountry(feature.geometry));
    dieselHalf.setAttribute("fill", dieselColor);
    dieselHalf.setAttribute("stroke", dieselStroke);
    dieselHalf.setAttribute(
        "clip-path",
        "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)"
    );

    return [petrolHalf, dieselHalf];
}

function renderBarChart(cx, cy, petrol, diesel) {
    const barWidth = 10;
    const maxHeight = 50;
    const maxPrice = 2.5;

    const petrolHeight = (petrol / maxPrice) * maxHeight;
    const dieselHeight = (diesel / maxPrice) * maxHeight;

    const petrolBar = document.createElementNS(svgNS, "rect");
    petrolBar.setAttribute("x", cx - barWidth - 2);
    petrolBar.setAttribute("y", cy - petrolHeight / 2);
    petrolBar.setAttribute("width", barWidth);
    petrolBar.setAttribute("height", petrolHeight);
    petrolBar.setAttribute("fill", "red");

    const dieselBar = document.createElementNS(svgNS, "rect");
    dieselBar.setAttribute("x", cx + 2);
    dieselBar.setAttribute("y", cy - dieselHeight / 2);
    dieselBar.setAttribute("width", barWidth);
    dieselBar.setAttribute("height", dieselHeight);
    dieselBar.setAttribute("fill", "blue");

    return [petrolBar, dieselBar];
}

function renderPieChart(cx, cy, petrol, diesel) {
    const radius = 20;
    const total = petrol + diesel;
    const petrolAngle = (petrol / total) * 2 * Math.PI;

    const pieChart = document.createElementNS(svgNS, "g");

    const petrolSlice = document.createElementNS(svgNS, "path");
    petrolSlice.setAttribute(
        "d",
        `M ${cx} ${cy} L ${cx + radius} ${cy} A ${radius} ${radius} 0 ${
            petrolAngle > Math.PI ? 1 : 0
        } 1 ${cx + radius * Math.cos(petrolAngle)} ${
            cy + radius * Math.sin(petrolAngle)
        } Z`
    );
    petrolSlice.setAttribute("fill", "red");

    const dieselSlice = document.createElementNS(svgNS, "path");
    dieselSlice.setAttribute(
        "d",
        `M ${cx} ${cy} L ${cx + radius * Math.cos(petrolAngle)} ${
            cy + radius * Math.sin(petrolAngle)
        } A ${radius} ${radius} 0 ${petrolAngle <= Math.PI ? 1 : 0} 1 ${
            cx + radius
        } ${cy} Z`
    );
    dieselSlice.setAttribute("fill", "blue");

    pieChart.appendChild(petrolSlice);
    pieChart.appendChild(dieselSlice);
    return pieChart;
}

function renderNumbers(cx, cy, petrol, diesel) {
    const numbers = document.createElementNS(svgNS, "text");
    numbers.setAttribute("x", cx);
    numbers.setAttribute("y", cy);
    numbers.setAttribute("text-anchor", "middle");
    numbers.setAttribute("font-size", "10");
    numbers.innerHTML = `P: €${petrol.toFixed(
        2
    )}<tspan x="${cx}" dy="12">D: €${diesel.toFixed(2)}</tspan>`;
    return numbers;
}

function renderIcons(cx, cy, petrol, diesel) {
    const maxPrice = 2.5;
    const maxSize = 30;

    const petrolSize = (petrol / maxPrice) * maxSize;
    const dieselSize = (diesel / maxPrice) * maxSize;

    const petrolIcon = document.createElementNS(svgNS, "circle");
    petrolIcon.setAttribute("cx", cx - 10);
    petrolIcon.setAttribute("cy", cy);
    petrolIcon.setAttribute("r", petrolSize / 2);
    petrolIcon.setAttribute("fill", "red");

    const dieselIcon = document.createElementNS(svgNS, "circle");
    dieselIcon.setAttribute("cx", cx + 10);
    dieselIcon.setAttribute("cy", cy);
    dieselIcon.setAttribute("r", dieselSize / 2);
    dieselIcon.setAttribute("fill", "blue");

    return [petrolIcon, dieselIcon];
}

function renderFuelOverlays(feature, standardName) {
    const { petrol, diesel } = fuelPrices[standardName];
    const types = [
        { fuel: "petrol", price: petrol },
        { fuel: "diesel", price: diesel },
    ];

    types.forEach(({ fuel, price }) => {
        const overlay = document.createElementNS(svgNS, "path");
        overlay.setAttribute("d", drawCountry(feature.geometry));
        overlay.setAttribute("fill", createGradientPattern(price, fuel));
        overlay.setAttribute("fill-opacity", "0.5");
        overlay.classList.add("gradient-overlay", fuel);
        svg.appendChild(overlay);
    });
}

function toggleVisualization() {
    const currentIndex = visualizationMethods.indexOf(currentVisualization);
    const nextIndex = (currentIndex + 1) % visualizationMethods.length;
    currentVisualization = visualizationMethods[nextIndex];

    visualizationMethods.forEach((method) => {
        const elements = document.querySelectorAll(`.visualization.${method}`);
        elements.forEach((el) => {
            el.style.display =
                method === currentVisualization ? "inline" : "none";
        });
    });

    // Update button text to show current visualization method
    vizButton.textContent = currentVisualization.charAt(0).toUpperCase();

    // Log the change for debugging
    console.log(`Switched to ${currentVisualization} visualization`);
}

function renderLabels(labelPositions) {
    labelPositions.forEach((label) => {
        const group = document.createElementNS(svgNS, "g");
        group.setAttribute("class", "country-label");

        const countryName = document.createElementNS(svgNS, "text");
        countryName.textContent = label.name;
        countryName.setAttribute("x", 0);
        countryName.setAttribute("y", 0);
        countryName.setAttribute("class", "country-name");

        const fuelPricesText = document.createElementNS(svgNS, "text");
        fuelPricesText.setAttribute("x", 0);
        fuelPricesText.setAttribute("y", 15);
        fuelPricesText.setAttribute("class", "fuel-prices");

        if (fuelPrices[label.name]) {
            const { petrol, diesel } = fuelPrices[label.name];
            fuelPricesText.textContent = `P: €${petrol.toFixed(
                2
            )} D: €${diesel.toFixed(2)}`;
        } else {
            fuelPricesText.textContent = "No price data";
        }

        group.appendChild(countryName);
        group.appendChild(fuelPricesText);

        adjustLabelPosition(label, labelPositions);

        group.setAttribute("transform", `translate(${label.x}, ${label.y})`);
        svg.appendChild(group);
    });
}

function checkLabelOverlap(label, labelPositions) {
    return labelPositions.some((otherLabel) => {
        if (label.name === otherLabel.name) return false;
        const dx = label.x - otherLabel.x;
        const dy = label.y - otherLabel.y;
        return Math.sqrt(dx * dx + dy * dy) < 30; // Increased overlap sensitivity
    });
}

function adjustLabelPosition(label, labelPositions) {
    const overlap = checkLabelOverlap(label, labelPositions);
    if (overlap) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 30; // Reduced distance for adjustment
        label.x += distance * Math.cos(angle);
        label.y += distance * Math.sin(angle);
    }
}

function logResults(count, processedCountries, missingCountries, data) {
    addToLog(`Processed ${count} African countries`);
    addToLog(`Countries added: ${Array.from(processedCountries).join(", ")}`);
    addToLog(`Countries missing: ${Array.from(missingCountries).join(", ")}`);

    if (missingCountries.size > 0) {
        addToLog("Missing countries details:");
        data.features.forEach((feature) => {
            const countryName = feature.properties.ADMIN;
            if (missingCountries.has(getStandardCountryName(countryName))) {
                addToLog(
                    `${countryName}: ${JSON.stringify(feature.properties)}`
                );
            }
        });
    }

    if (count === 0) {
        addToLog(
            "No African countries found. Check the isAfricanCountry function."
        );
    }
}

// Event listeners
devModeButton.addEventListener("click", toggleDevMode);
resetButton.addEventListener("click", resetMap);
gradientButton.addEventListener("click", toggleGradients);

document.addEventListener("DOMContentLoaded", () => {
    const vizButton = document.getElementById("vizButton");
    if (vizButton) {
        vizButton.addEventListener("click", toggleVisualization);
    } else {
        console.error("Visualization toggle button not found");
    }
});

// Fetch and process data
addToLog("Script started. Attempting to fetch GeoJSON data...");

fetch(
    "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
)
    .then((response) => {
        addToLog(`Fetch response received. Status: ${response.status}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        addToLog(
            `Data fetched successfully. Processing ${data.features.length} features...`
        );
        processMapData(data);
    })
    .catch((error) => {
        addToLog(`Error fetching or processing data: ${error.message}`);
    });
