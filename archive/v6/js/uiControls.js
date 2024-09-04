class UIControls {
    constructor(log) {
        this.log = log;
        this.devMode = false;
        this.showGradients = true;
    }

    initializeControls() {
        const devModeButton = document.getElementById("devModeButton");
        const resetButton = document.getElementById("resetButton");
        const gradientButton = document.getElementById("gradientButton");
        const vizButton = document.getElementById("vizButton");

        devModeButton.addEventListener("click", () => this.toggleDevMode());
        resetButton.addEventListener("click", () => this.resetMap());
        gradientButton.addEventListener("click", () => this.toggleGradients());
        vizButton.addEventListener("click", () => this.toggleVisualization());
    }

    toggleDevMode() {
        this.devMode = !this.devMode;
        this.log.style.display = this.devMode ? "block" : "none";
        document.getElementById("devModeButton").style.backgroundColor = this
            .devMode
            ? "#ffcc00"
            : "#f0f0f0";
    }

    resetMap() {
        location.reload();
    }

    toggleGradients() {
        this.showGradients = !this.showGradients;
        document.getElementById("gradientButton").style.backgroundColor = this
            .showGradients
            ? "#ffcc00"
            : "#f0f0f0";
        document.querySelectorAll(".gradient-overlay").forEach((el) => {
            el.style.display = this.showGradients ? "inline" : "none";
        });
    }

    toggleVisualization() {
        const currentIndex = VISUALIZATION_METHODS.indexOf(
            CURRENT_VISUALIZATION
        );
        const nextIndex = (currentIndex + 1) % VISUALIZATION_METHODS.length;
        CURRENT_VISUALIZATION = VISUALIZATION_METHODS[nextIndex];

        VISUALIZATION_METHODS.forEach((method) => {
            const elements = document.querySelectorAll(
                `.visualization.${method}`
            );
            elements.forEach((el) => {
                el.style.display =
                    method === CURRENT_VISUALIZATION ? "inline" : "none";
            });
        });

        document.getElementById("vizButton").textContent =
            CURRENT_VISUALIZATION.charAt(0).toUpperCase();
        Utils.addToLog(
            this.log,
            `Switched to ${CURRENT_VISUALIZATION} visualization`
        );
    }
}
