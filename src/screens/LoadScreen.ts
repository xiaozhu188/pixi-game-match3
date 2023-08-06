import { Container, Text } from "pixi.js";
import gsap from "gsap";
import { sleep } from "../utils/sleep";

/** Screen shown while loading assets */
export class LoadScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ["preload"];
    /** LThe loading message display */
    private message: Text;

    constructor() {
        super();

        this.message = new Text("正在加载...", {
            fill: 0x333333,
            align: "center",
        });
        this.message.anchor.set(0.5);
        this.addChild(this.message);
    }

    /** Resize the screen, fired whenever window size changes  */
    public resize(width: number, height: number) {
        this.message.x = width * 0.5;
        this.message.y = height * 0.5;
    }

    /** Show screen with animations */
    public async show() {
        gsap.killTweensOf(this.message);
        this.message.alpha = 1;
    }

    /** Hide screen with animations */
    public async hide() {
        // Change then hide the loading message
        this.message.text = "加载完毕,游戏即将开始~";
        await sleep(300);
        gsap.killTweensOf(this.message);
        gsap.to(this.message, {
            alpha: 0,
            duration: 0.3,
            ease: "linear",
        });
    }
}
