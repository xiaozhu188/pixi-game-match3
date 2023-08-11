import { Container } from "pixi.js";

export class ResultScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ["result", "common"];

    constructor() {
        super();

        console.log("ResultScreen");
    }
}
