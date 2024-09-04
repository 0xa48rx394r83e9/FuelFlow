class MapRenderer {
    constructor(svg) {
        this.svg = svg;
        this.svgNS = "http://www.w3.org/2000/svg";
        this.scaleFactor = 15;
    }

    processMapData(data) {
        const africanFeatures = data.features.filter((feature) =>
            Utils.isAfricanCountry(feature.properties.ADMIN)
        );
        const boundingBox = this.calculateBoundingBox(africanFeatures);
        this.centerMap(boundingBox);

        africanFeatures.forEach((feature) => {
            const countryName = feature.properties.ADMIN;
            const standardName = Utils.getStandardCountryName(countryName);
            this.renderCountry(feature, standardName);
        });

        this.renderLabels(africanFeatures);
    }

    renderCountry(feature, standardName) {
        const path = document.createElementNS(this.svgNS, "path");
        path.setAttribute("d", Utils.drawCountry(feature.geometry));
        path.setAttribute("fill", "#FEB24C");
        path.setAttribute("stroke", "white");
        path.setAttribute("stroke-width", "0.5");
        path.setAttribute("id", `country-${standardName.replace(/\s+/g, "-")}`);
        this.svg.appendChild(path);

        if (FUEL_PRICES[standardName]) {
            Visualizations.renderFuelVisualizations(
                this.svg,
                feature,
                standardName,
                this.scaleFactor
            );
        }
    }

    calculateBoundingBox(features) {
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        features.forEach((feature) => {
            const processCoords = (coord) => {
                const [x, y] = Utils.projectCoordinates(
                    coord,
                    this.scaleFactor
                );
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

    centerMap(boundingBox) {
        const { minX, minY, maxX, maxY } = boundingBox;
        const width = maxX - minX;
        const height = maxY - minY;
        const padding = 20;

        const viewBox = `${minX - padding} ${minY - padding} ${
            width + 2 * padding
        } ${height + 2 * padding}`;
        this.svg.setAttribute("viewBox", viewBox);

        const containerAspectRatio =
            this.svg.clientWidth / this.svg.clientHeight;
        const mapAspectRatio = width / height;

        if (mapAspectRatio > containerAspectRatio) {
            this.scaleFactor *= this.svg.clientWidth / width;
        } else {
            this.scaleFactor *= this.svg.clientHeight / height;
        }
    }

    renderLabels(features) {
        features.forEach((feature) => {
            const standardName = Utils.getStandardCountryName(
                feature.properties.ADMIN
            );
            const [cx, cy] = Utils.calculateCentroid(
                feature.geometry,
                this.scaleFactor
            );

            const group = document.createElementNS(this.svgNS, "g");
            group.setAttribute("class", "country-label");

            const countryName = document.createElementNS(this.svgNS, "text");
            countryName.textContent = standardName;
            countryName.setAttribute("x", 0);
            countryName.setAttribute("y", 0);
            countryName.setAttribute("class", "country-name");

            const fuelPricesText = document.createElementNS(this.svgNS, "text");
            fuelPricesText.setAttribute("x", 0);
            fuelPricesText.setAttribute("y", 15);
            fuelPricesText.setAttribute("class", "fuel-prices");

            if (FUEL_PRICES[standardName]) {
                const { petrol, diesel } = FUEL_PRICES[standardName];
                fuelPricesText.textContent = `P: €${petrol.toFixed(
                    2
                )} D: €${diesel.toFixed(2)}`;
            } else {
                fuelPricesText.textContent = "No price data";
            }

            group.appendChild(countryName);
            group.appendChild(fuelPricesText);

            Utils.adjustLabelPosition(
                { x: cx, y: cy, name: standardName },
                features
            );

            group.setAttribute("transform", `translate(${cx}, ${cy})`);
            this.svg.appendChild(group);
        });
    }
}
