// Configuration object
const config = {
    mapSettings: {
        baseFillColor: "#FEB24C",
        strokeColor: "white",
        strokeWidth: 0.5,
        scaleFactor: 15,
    },
    visualization: {
        methods: [
            "gradient",
            "colorScale",
            "barChart",
            "pieChart",
            "numbers",
            "icons",
        ],
        currentMethods: new Set(["gradient"]),
        maxPrice: 2.5,
        gradientDensityRange: { min: 50, max: 1 },
        barChartSettings: { width: 10, maxHeight: 50 },
        pieChartSettings: { radius: 20 },
        iconSettings: { maxSize: 30 },
    },
    labelSettings: {
        showCountryNames: true,
        showFuelPrices: true,
        showCentroids: false,
        fontSize: { countryName: 12, fuelPrice: 10 },
        repulsionStrength: 25,
        repulsionFalloff: 2,
        borderForce: 5,
        maxRepulsionDistance: 75,
        overlapDistance: 30,
    },
    optimizationSettings: {
        iterations: 50,
        repulsionStrengthRange: { min: 10, max: 60 },
        repulsionFalloffRange: { min: 1, max: 4 },
        borderForceRange: { min: 1, max: 11 },
    },
};

// DOM elements
const svg = document.getElementById("map");
const svgNS = "http://www.w3.org/2000/svg";
const log = document.getElementById("log");

// Control panel elements
const devModeToggle = document.getElementById("devModeToggle");
const resetMapButton = document.getElementById("resetMap");
const countryNamesToggle = document.getElementById("countryNamesToggle");
const fuelPricesToggle = document.getElementById("fuelPricesToggle");
const centroidsToggle = document.getElementById("centroidsToggle");
const repulsionStrengthSlider = document.getElementById("repulsionStrength");
const repulsionFalloffSlider = document.getElementById("repulsionFalloff");
const borderForceSlider = document.getElementById("borderForce");

// Visualization toggles
const visualizationToggles = config.visualization.methods.reduce(
    (acc, method) => {
        acc[method] = document.getElementById(`${method}Toggle`);
        return acc;
    },
    {}
);

// State variables
let devMode = false;

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
    "Democratic Republic of the Congo": { petrol: 1.11, diesel: 1.1 },
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
    devModeToggle.classList.toggle("active");
}

function resetMap() {
    location.reload();
}

function toggleVisualization(method) {
    if (config.visualization.currentMethods.has(method)) {
        config.visualization.currentMethods.delete(method);
    } else {
        config.visualization.currentMethods.add(method);
    }
    updateVisualization();
}

function updateVisualization() {
    config.visualization.methods.forEach((method) => {
        const elements = svg.querySelectorAll(`.visualization.${method}`);
        elements.forEach((el) => {
            el.style.display = config.visualization.currentMethods.has(method)
                ? "inline"
                : "none";
        });
        visualizationToggles[method].classList.toggle(
            "active",
            config.visualization.currentMethods.has(method)
        );
    });
}

function toggleLoadingAnimation(show) {
    const loadingAnimation = document.getElementById("loading-animation");
    loadingAnimation.style.display = show ? "flex" : "none";
}

function toggleCountryNames() {
    config.labelSettings.showCountryNames =
        !config.labelSettings.showCountryNames;
    countryNamesToggle.classList.toggle(
        "active",
        config.labelSettings.showCountryNames
    );
    updateLabels();
}

function toggleFuelPrices() {
    config.labelSettings.showFuelPrices = !config.labelSettings.showFuelPrices;
    fuelPricesToggle.classList.toggle(
        "active",
        config.labelSettings.showFuelPrices
    );
    updateLabels();
}

function toggleCentroids() {
    config.labelSettings.showCentroids = !config.labelSettings.showCentroids;
    centroidsToggle.classList.toggle("active");
    updateLabels();
}

function updateRepulsionStrength(event) {
    config.labelSettings.repulsionStrength = parseFloat(event.target.value);
    updateLabels();
}

function updateRepulsionFalloff(event) {
    config.labelSettings.repulsionFalloff = parseFloat(event.target.value);
    updateLabels();
}

function updateBorderForce(event) {
    config.labelSettings.borderForce = parseFloat(event.target.value);
    updateLabels();
}

function projectCoordinates(coords) {
    const x = (coords[0] + 20) * config.mapSettings.scaleFactor;
    const y = (30 - coords[1]) * config.mapSettings.scaleFactor;
    return [x, y];
}

function getColorForPrice(price, max = config.visualization.maxPrice) {
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

function createGradientPattern(price, type) {
    const { min: minDensity, max: maxDensity } =
        config.visualization.gradientDensityRange;
    const density =
        minDensity +
        (maxDensity - minDensity) * (price / config.visualization.maxPrice);

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
        config.mapSettings.scaleFactor =
            config.mapSettings.scaleFactor * (svg.clientWidth / width);
    } else {
        config.mapSettings.scaleFactor =
            config.mapSettings.scaleFactor * (svg.clientHeight / height);
    }

    addToLog(
        `Map centered. ViewBox: ${viewBox}, Scale Factor: ${config.mapSettings.scaleFactor}`
    );
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

    optimizeSliderValues();
    updateLabels();

    logResults(count, processedCountries, missingCountries, data);
}

function renderCountry(feature, standardName) {
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", drawCountry(feature.geometry));
    path.setAttribute("fill", config.mapSettings.baseFillColor);
    path.setAttribute("stroke", config.mapSettings.strokeColor);
    path.setAttribute("stroke-width", config.mapSettings.strokeWidth);
    path.setAttribute("id", `country-${standardName.replace(/\s+/g, "-")}`);
    svg.appendChild(path);

    if (fuelPrices[standardName]) {
        renderFuelVisualizations(feature, standardName);
    }
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
        group.style.display = config.visualization.currentMethods.has(method)
            ? "inline"
            : "none";
        const elements = renderFunc();
        if (Array.isArray(elements)) {
            elements.forEach((el) => group.appendChild(el));
        } else if (elements) {
            group.appendChild(elements);
        }
        svg.appendChild(group);
    });
}

function renderGradientOverlays(feature, petrol, diesel) {
    return [
        renderFuelOverlay(feature, petrol, "petrol"),
        renderFuelOverlay(feature, diesel, "diesel"),
    ];
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
    const { width: barWidth, maxHeight } =
        config.visualization.barChartSettings;
    const maxPrice = config.visualization.maxPrice;

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
    const { radius } = config.visualization.pieChartSettings;
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
    const { maxSize } = config.visualization.iconSettings;
    const maxPrice = config.visualization.maxPrice;

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

function updateLabels() {
    svg.querySelectorAll(".country-label, .centroid").forEach((el) =>
        el.remove()
    );
    const labelPositions = calculateLabelPositions();
    renderLabels(labelPositions);
}

function calculateLabelPositions() {
    const labelPositions = [];
    const countries = svg.querySelectorAll('path[id^="country-"]');

    countries.forEach((country) => {
        const bbox = country.getBBox();
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;
        const countryName = country.id
            .replace("country-", "")
            .replace(/-/g, " ");

        let labelHeight = 0;
        if (config.labelSettings.showCountryNames)
            labelHeight += config.labelSettings.fontSize.countryName;
        if (config.labelSettings.showFuelPrices && fuelPrices[countryName])
            labelHeight += config.labelSettings.fontSize.fuelPrice;

        labelPositions.push({
            name: countryName,
            x: cx,
            y: cy,
            originalX: cx,
            originalY: cy,
            height: labelHeight,
            country: country,
        });
    });

    for (let i = 0; i < 50; i++) {
        applyGravitation(labelPositions);
    }

    return labelPositions;
}

function applyGravitation(labelPositions) {
    const {
        repulsionStrength,
        repulsionFalloff,
        borderForce,
        maxRepulsionDistance,
    } = config.labelSettings;

    labelPositions.forEach((label, i) => {
        let fx = 0,
            fy = 0;
        labelPositions.forEach((otherLabel, j) => {
            if (i !== j) {
                const dx = label.x - otherLabel.x;
                const dy = label.y - otherLabel.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxRepulsionDistance && distance > 0) {
                    const normalizedDistance = distance / maxRepulsionDistance;
                    const force =
                        repulsionStrength *
                        Math.pow(1 - normalizedDistance, repulsionFalloff);
                    const combinedHeight =
                        (label.height + otherLabel.height) / 2;
                    const heightFactor = combinedHeight / 15;

                    fx += ((force * dx) / distance) * heightFactor;
                    fy += ((force * dy) / distance) * heightFactor;
                }
            }
        });

        let isInside = false;
        try {
            isInside = isPointInPath(label.country, label.x, label.y);
        } catch (error) {
            console.warn(
                `Error checking if point is in path for ${label.name}:`,
                error
            );
            isInside = false;
        }

        const borderForceFactor = isInside ? 1 : 10;
        const dx = label.originalX - label.x;
        const dy = label.originalY - label.y;
        const distanceFromOriginal = Math.sqrt(dx * dx + dy * dy);

        if (distanceFromOriginal > 0) {
            fx +=
                ((borderForce * dx) / distanceFromOriginal) * borderForceFactor;
            fy +=
                ((borderForce * dy) / distanceFromOriginal) * borderForceFactor;
        }

        if (isFinite(fx) && isFinite(fy)) {
            label.x += fx;
            label.y += fy;
        } else {
            console.warn(
                `Non-finite force calculated for ${label.name}. Skipping this iteration.`
            );
        }
    });
}

function isPointInPath(path, x, y) {
    if (!isFinite(x) || !isFinite(y)) {
        console.warn(`Non-finite coordinates provided: x=${x}, y=${y}`);
        return false;
    }

    const point = svg.createSVGPoint();
    point.x = x;
    point.y = y;

    try {
        return path.isPointInFill(point);
    } catch (error) {
        console.warn(`Error in isPointInFill:`, error);
        return false;
    }
}

function renderLabels(labelPositions) {
    labelPositions.forEach((label) => {
        const group = document.createElementNS(svgNS, "g");
        group.setAttribute("class", "country-label");
        group.setAttribute("transform", `translate(${label.x}, ${label.y})`);

        let yOffset = 0;

        if (config.labelSettings.showCountryNames) {
            const countryName = document.createElementNS(svgNS, "text");
            countryName.textContent = label.name;
            countryName.setAttribute("x", 0);
            countryName.setAttribute("y", yOffset);
            countryName.setAttribute("class", "country-name");
            countryName.setAttribute(
                "font-size",
                config.labelSettings.fontSize.countryName
            );
            group.appendChild(countryName);
            yOffset += config.labelSettings.fontSize.countryName;
        }

        if (config.labelSettings.showFuelPrices && fuelPrices[label.name]) {
            const { petrol, diesel } = fuelPrices[label.name];
            const fuelPricesText = document.createElementNS(svgNS, "text");
            fuelPricesText.textContent = `P: €${petrol.toFixed(
                2
            )} D: €${diesel.toFixed(2)}`;
            fuelPricesText.setAttribute("x", 0);
            fuelPricesText.setAttribute("y", yOffset);
            fuelPricesText.setAttribute("class", "fuel-prices");
            fuelPricesText.setAttribute(
                "font-size",
                config.labelSettings.fontSize.fuelPrice
            );
            group.appendChild(fuelPricesText);
        }

        svg.appendChild(group);

        if (config.labelSettings.showCentroids) {
            const centroid = document.createElementNS(svgNS, "circle");
            centroid.setAttribute("cx", label.originalX);
            centroid.setAttribute("cy", label.originalY);
            centroid.setAttribute("r", "3");
            centroid.setAttribute("fill", "red");
            centroid.setAttribute("class", "centroid");
            svg.appendChild(centroid);
        }
    });
}

function optimizeSliderValues() {
    const {
        iterations,
        repulsionStrengthRange,
        repulsionFalloffRange,
        borderForceRange,
    } = config.optimizationSettings;
    let bestScore = -Infinity;
    let bestValues = {
        repulsionStrength: config.labelSettings.repulsionStrength,
        repulsionFalloff: config.labelSettings.repulsionFalloff,
        borderForce: config.labelSettings.borderForce,
    };

    for (let i = 0; i < iterations; i++) {
        const testRepulsionStrength =
            Math.random() *
                (repulsionStrengthRange.max - repulsionStrengthRange.min) +
            repulsionStrengthRange.min;
        const testRepulsionFalloff =
            Math.random() *
                (repulsionFalloffRange.max - repulsionFalloffRange.min) +
            repulsionFalloffRange.min;
        const testBorderForce =
            Math.random() * (borderForceRange.max - borderForceRange.min) +
            borderForceRange.min;

        config.labelSettings.repulsionStrength = testRepulsionStrength;
        config.labelSettings.repulsionFalloff = testRepulsionFalloff;
        config.labelSettings.borderForce = testBorderForce;

        const labelPositions = calculateLabelPositions();
        const score = evaluateLabelPositioning(labelPositions);

        if (score > bestScore) {
            bestScore = score;
            bestValues = {
                repulsionStrength: testRepulsionStrength,
                repulsionFalloff: testRepulsionFalloff,
                borderForce: testBorderForce,
            };
        }
    }

    Object.assign(config.labelSettings, bestValues);
    console.log("Optimized values:", bestValues);
}

function evaluateLabelPositioning(labelPositions) {
    let overlaps = 0;
    let outsideBorders = 0;

    labelPositions.forEach((label, i) => {
        const isInside = isPointInPath(label.country, label.x, label.y);
        if (!isInside) outsideBorders++;

        labelPositions.forEach((otherLabel, j) => {
            if (i !== j) {
                const dx = label.x - otherLabel.x;
                const dy = label.y - otherLabel.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < (label.height + otherLabel.height) / 2) {
                    overlaps++;
                }
            }
        });
    });

    const overlapScore =
        1 - overlaps / (labelPositions.length * labelPositions.length);
    const borderScore = 1 - outsideBorders / labelPositions.length;

    return 0.6 * overlapScore + 0.4 * borderScore;
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

function initializeUI() {
    updateVisualization();

    // Initialize toggle states
    countryNamesToggle.classList.toggle(
        "active",
        config.labelSettings.showCountryNames
    );
    fuelPricesToggle.classList.toggle(
        "active",
        config.labelSettings.showFuelPrices
    );
    centroidsToggle.classList.toggle(
        "active",
        config.labelSettings.showCentroids
    );

    // Initialize slider values
    repulsionStrengthSlider.value = config.labelSettings.repulsionStrength;
    repulsionFalloffSlider.value = config.labelSettings.repulsionFalloff;
    borderForceSlider.value = config.labelSettings.borderForce;
}

// Event listeners
devModeToggle.addEventListener("click", toggleDevMode);
resetMapButton.addEventListener("click", resetMap);
countryNamesToggle.addEventListener("click", toggleCountryNames);
fuelPricesToggle.addEventListener("click", toggleFuelPrices);
centroidsToggle.addEventListener("click", toggleCentroids);
repulsionStrengthSlider.addEventListener("input", updateRepulsionStrength);
repulsionFalloffSlider.addEventListener("input", updateRepulsionFalloff);
borderForceSlider.addEventListener("input", updateBorderForce);

Object.entries(visualizationToggles).forEach(([method, toggle]) => {
    toggle.addEventListener("click", () => toggleVisualization(method));
});

// Initialize UI
updateVisualization();

// Fetch and process data
addToLog("Script started. Attempting to fetch GeoJSON data...");
toggleLoadingAnimation(true);

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
        toggleLoadingAnimation(false);
        initializeUI(); // Call this after processing data
    })
    .catch((error) => {
        addToLog(`Error fetching or processing data: ${error.message}`);
        toggleLoadingAnimation(false);
    });
