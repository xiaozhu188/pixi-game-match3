import { Application, Text } from "pixi.js";
import { isDev } from "./utils/is";

Text.defaultResolution = 2;
Text.defaultAutoResolution = false;

export const app = new Application<HTMLCanvasElement>({
    backgroundColor: 0xffffff,
    backgroundAlpha: 0,
    resolution: window.devicePixelRatio || 1,
})
isDev() && (globalThis.__PIXI_APP__ = app);
