document.addEventListener("DOMContentLoaded", () => {
    const svg = document.getElementById("map");
    const log = document.getElementById("log");

    const mapRenderer = new MapRenderer(svg);
    const uiControls = new UIControls(log);
    const dataHandler = new DataHandler();

    uiControls.initializeControls();

    dataHandler
        .fetchMapData()
        .then((data) => {
            mapRenderer.processMapData(data);
        })
        .catch((error) => {
            Utils.addToLog(
                log,
                `Error fetching or processing data: ${error.message}`
            );
        });
});
