import "pixi-spine";
import { app } from "./app";
import { sound } from "@pixi/sound";
import { initAssets } from "./utils/assets";

async function init() {
    // init sound temporarily to remove warnning
    sound.init();

    // add canvas element to body
    document.body.append(app.view);

    // Load assets
    await initAssets();

    // hide loading
    document.body.classList.add("loaded");
}

init();
