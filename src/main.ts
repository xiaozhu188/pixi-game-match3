import "pixi-spine";
import { app } from "./app";
import { initAssets } from "./utils/assets";
import { navigation } from "./utils/navigation";
import { LoadScreen } from "./screens/LoadScreen";
import { TiledBackground } from "./ui/Background";
import { HomeScreen } from "./screens/HomeScreen";
import { GameScreen } from "./screens/GameScreen";
import { getUrlParam } from "./utils/getUrlParams";
import { ResultScreen } from "./screens/ResultScreen";

function resize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const minWidth = 375;
    const minHeight = 700;

    // Calculate renderer and canvas sizes based on current dimensions
    const scaleX = windowWidth < minWidth ? minWidth / windowWidth : 1;
    const scaleY = windowHeight < minHeight ? minHeight / windowHeight : 1;
    const scale = scaleX > scaleY ? scaleX : scaleY;
    const width = windowWidth * scale;
    const height = windowHeight * scale;

    // Update canvas style dimensions and scroll window up to avoid issues on mobile resize
    app.renderer.view.style.width = `${windowWidth}px`;
    app.renderer.view.style.height = `${windowHeight}px`;
    // Scroll the window to the top to avoid issues on mobile resize
    window.scrollTo(0, 0);

    // Update renderer and navigation screens dimensions
    app.renderer.resize(width, height);
    navigation.resize(width, height);
}

async function init() {
    // add canvas element to body
    document.body.append(app.view);

    // Trigger the first resize and do it on window resize
    resize();
    window.addEventListener("resize", resize);

    // Load assets
    await initAssets();

    // hide loading
    document.body.classList.add("loaded");

    // Add a persisting background shared by all screens
    navigation.setBackground(TiledBackground);

    // Show initial loading screen
    await navigation.showScreen(LoadScreen);

    // Go to one of the screens if a shortcut is present in url params, otherwise go to home screen
    if (getUrlParam('game') !== null) {
        await navigation.showScreen(GameScreen);
    } else if (getUrlParam('result') !== null) {
        await navigation.showScreen(ResultScreen);
    } else {
        await navigation.showScreen(HomeScreen);
    }
}

init();
