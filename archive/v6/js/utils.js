class Utils {
    static projectCoordinates(coords, scaleFactor) {
        const x = (coords[0] + 20) * scaleFactor;
        const y = (30 - coords[1]) * scaleFactor;
        return [x, y];
    }

    static getColorForPrice(price, max = 2.5) {
        const hue = ((1 - price / max) * 120).toString(10);
        return [`hsl(${hue}, 100%, 50%)`, `hsl(${hue}, 100%, 25%)`];
    }

    static drawCountry(geometry) {
        if (geometry.type === "Polygon") {
            return this.drawPolygon(geometry.coordinates);
        }
        if (geometry.type === "MultiPolygon") {
            return geometry.coordinates
                .map((poly) => this.drawPolygon(poly))
                .join(" ");
        }
        return "";
    }

    static drawPolygon(rings) {
        return rings
            .map((ring) => {
                return (
                    ring
                        .map((coord, index) => {
                            const [x, y] = this.projectCoordinates(coord, 15);
                            return `${index === 0 ? "M" : "L"}${x} ${y}`;
                        })
                        .join(" ") + "Z"
                );
            })
            .join(" ");
    }

    static calculateCentroid(geometry, scaleFactor) {
        let totalX = 0,
            totalY = 0,
            pointCount = 0;
        const processCoords = (coord) => {
            const [x, y] = this.projectCoordinates(coord, scaleFactor);
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

    static createGradientPattern(svg, price, type) {
        const maxPrice = 2.5;
        const minDensity = 50;
        const maxDensity = 1;
        const density =
            minDensity + (maxDensity - minDensity) * (price / maxPrice);

        const pattern = document.createElementNS(svg.namespaceURI, "pattern");
        pattern.setAttribute("id", `${type}Pattern-${price.toFixed(2)}`);
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        pattern.setAttribute("width", density.toString());
        pattern.setAttribute("height", density.toString());

        const line = document.createElementNS(svg.namespaceURI, "line");
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

    static isAfricanCountry(countryName) {
        return Object.values(AFRICAN_COUNTRIES).some((aliases) =>
            aliases.some(
                (alias) => alias.toLowerCase() === countryName.toLowerCase()
            )
        );
    }

    static getStandardCountryName(countryName) {
        for (const [standard, aliases] of Object.entries(AFRICAN_COUNTRIES)) {
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

    static adjustLabelPosition(label, features) {
        const overlap = this.checkLabelOverlap(label, features);
        if (overlap) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 30;
            label.x += distance * Math.cos(angle);
            label.y += distance * Math.sin(angle);
        }
    }

    static checkLabelOverlap(label, features) {
        return features.some((feature) => {
            if (label.name === feature.properties.ADMIN) return false;
            const [cx, cy] = this.calculateCentroid(feature.geometry, 15);
            const dx = label.x - cx;
            const dy = label.y - cy;
            return Math.sqrt(dx * dx + dy * dy) < 30;
        });
    }

    static addToLog(log, message) {
        log.textContent += message + "\n";
        log.scrollTop = log.scrollHeight;
    }
}
