class DataHandler {
    constructor() {
        this.geoJSONUrl =
            "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
    }

    async fetchMapData() {
        try {
            const response = await fetch(this.geoJSONUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error(`Error fetching map data: ${error.message}`);
        }
    }
}
