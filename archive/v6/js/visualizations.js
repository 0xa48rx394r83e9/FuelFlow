class Visualizations {
    static renderFuelVisualizations(svg, feature, standardName, scaleFactor) {
        const { petrol, diesel } = FUEL_PRICES[standardName];
        const [cx, cy] = Utils.calculateCentroid(feature.geometry, scaleFactor);

        const visualizations = {
            gradient: () =>
                this.renderGradientOverlays(svg, feature, petrol, diesel),
            colorScale: () =>
                this.renderColorScale(svg, feature, petrol, diesel),
            barChart: () => this.renderBarChart(svg, cx, cy, petrol, diesel),
            pieChart: () => this.renderPieChart(svg, cx, cy, petrol, diesel),
            numbers: () => this.renderNumbers(svg, cx, cy, petrol, diesel),
            icons: () => this.renderIcons(svg, cx, cy, petrol, diesel),
        };

        Object.entries(visualizations).forEach(([method, renderFunc]) => {
            const group = document.createElementNS(svg.namespaceURI, "g");
            group.setAttribute("class", `visualization ${method}`);
            group.style.display =
                method === CURRENT_VISUALIZATION ? "inline" : "none";
            const elements = renderFunc();
            if (Array.isArray(elements)) {
                elements.forEach((el) => group.appendChild(el));
            } else if (elements) {
                group.appendChild(elements);
            }
            svg.appendChild(group);
        });
    }

    static renderGradientOverlays(svg, feature, petrol, diesel) {
        return [
            this.renderFuelOverlay(svg, feature, petrol, "petrol"),
            this.renderFuelOverlay(svg, feature, diesel, "diesel"),
        ];
    }

    static renderFuelOverlay(svg, feature, price, fuelType) {
        const overlay = document.createElementNS(svg.namespaceURI, "path");
        overlay.setAttribute("d", Utils.drawCountry(feature.geometry));
        overlay.setAttribute(
            "fill",
            Utils.createGradientPattern(svg, price, fuelType)
        );
        overlay.setAttribute("fill-opacity", "0.5");
        overlay.classList.add("gradient-overlay", fuelType);
        return overlay;
    }

    static renderColorScale(svg, feature, petrol, diesel) {
        const [petrolColor, petrolStroke] = Utils.getColorForPrice(petrol);
        const [dieselColor, dieselStroke] = Utils.getColorForPrice(diesel);

        const petrolHalf = document.createElementNS(svg.namespaceURI, "path");
        petrolHalf.setAttribute("d", Utils.drawCountry(feature.geometry));
        petrolHalf.setAttribute("fill", petrolColor);
        petrolHalf.setAttribute("stroke", petrolStroke);
        petrolHalf.setAttribute(
            "clip-path",
            "polygon(0 0, 50% 0, 50% 100%, 0 100%)"
        );

        const dieselHalf = document.createElementNS(svg.namespaceURI, "path");
        dieselHalf.setAttribute("d", Utils.drawCountry(feature.geometry));
        dieselHalf.setAttribute("fill", dieselColor);
        dieselHalf.setAttribute("stroke", dieselStroke);
        dieselHalf.setAttribute(
            "clip-path",
            "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)"
        );

        return [petrolHalf, dieselHalf];
    }

    static renderBarChart(svg, cx, cy, petrol, diesel) {
        const barWidth = 10;
        const maxHeight = 50;
        const maxPrice = 2.5;

        const petrolHeight = (petrol / maxPrice) * maxHeight;
        const dieselHeight = (diesel / maxPrice) * maxHeight;

        const petrolBar = document.createElementNS(svg.namespaceURI, "rect");
        petrolBar.setAttribute("x", cx - barWidth - 2);
        petrolBar.setAttribute("y", cy - petrolHeight / 2);
        petrolBar.setAttribute("width", barWidth);
        petrolBar.setAttribute("height", petrolHeight);
        petrolBar.setAttribute("fill", "red");

        const dieselBar = document.createElementNS(svg.namespaceURI, "rect");
        dieselBar.setAttribute("x", cx + 2);
        dieselBar.setAttribute("y", cy - dieselHeight / 2);
        dieselBar.setAttribute("width", barWidth);
        dieselBar.setAttribute("height", dieselHeight);
        dieselBar.setAttribute("fill", "blue");

        return [petrolBar, dieselBar];
    }

    static renderPieChart(svg, cx, cy, petrol, diesel) {
        const radius = 20;
        const total = petrol + diesel;
        const petrolAngle = (petrol / total) * 2 * Math.PI;

        const pieChart = document.createElementNS(svg.namespaceURI, "g");

        const petrolSlice = document.createElementNS(svg.namespaceURI, "path");
        petrolSlice.setAttribute(
            "d",
            `M ${cx} ${cy} L ${cx + radius} ${cy} A ${radius} ${radius} 0 ${
                petrolAngle > Math.PI ? 1 : 0
            } 1 ${cx + radius * Math.cos(petrolAngle)} ${
                cy + radius * Math.sin(petrolAngle)
            } Z`
        );
        petrolSlice.setAttribute("fill", "red");

        const dieselSlice = document.createElementNS(svg.namespaceURI, "path");
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

    static renderNumbers(svg, cx, cy, petrol, diesel) {
        const numbers = document.createElementNS(svg.namespaceURI, "text");
        numbers.setAttribute("x", cx);
        numbers.setAttribute("y", cy);
        numbers.setAttribute("text-anchor", "middle");
        numbers.setAttribute("font-size", "10");
        numbers.innerHTML = `P: €${petrol.toFixed(
            2
        )}<tspan x="${cx}" dy="12">D: €${diesel.toFixed(2)}</tspan>`;
        return numbers;
    }

    static renderIcons(svg, cx, cy, petrol, diesel) {
        const maxPrice = 2.5;
        const maxSize = 30;

        const petrolSize = (petrol / maxPrice) * maxSize;
        const dieselSize = (diesel / maxPrice) * maxSize;

        const petrolIcon = document.createElementNS(svg.namespaceURI, "circle");
        petrolIcon.setAttribute("cx", cx - 10);
        petrolIcon.setAttribute("cy", cy);
        petrolIcon.setAttribute("r", petrolSize / 2);
        petrolIcon.setAttribute("fill", "red");

        const dieselIcon = document.createElementNS(svg.namespaceURI, "circle");
        dieselIcon.setAttribute("cx", cx + 10);
        dieselIcon.setAttribute("cy", cy);
        dieselIcon.setAttribute("r", dieselSize / 2);
        dieselIcon.setAttribute("fill", "blue");

        return [petrolIcon, dieselIcon];
    }
}
