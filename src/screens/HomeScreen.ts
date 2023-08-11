import { Container, NineSlicePlane, Texture } from 'pixi.js';
import gsap from 'gsap';
import { navigation } from '../utils/navigation';
import { bgm } from '../utils/audio';
import { sleep } from '../utils/sleep';
import { GameScreen } from './GameScreen';
import { LargeButton } from '../ui/LargeButton';
import { registerCustomEase } from '../utils/animation';
import { Logo } from '../ui/Logo';
import { Dragon } from '../ui/Dragon';
import { RippleButton } from '../ui/RippleButton';

/** Custom ease curve for y animation of the base to reveal the screen */
const easeSoftBackOut = registerCustomEase(
    'M0,0,C0,0,0.05,0.228,0.09,0.373,0.12,0.484,0.139,0.547,0.18,0.654,0.211,0.737,0.235,0.785,0.275,0.864,0.291,0.896,0.303,0.915,0.325,0.944,0.344,0.97,0.356,0.989,0.38,1.009,0.413,1.039,0.428,1.073,0.604,1.074,0.72,1.074,0.822,1.035,0.91,1.011,0.943,1.002,1,1,1,1',
);

/** The first screen that shows up after loading */
export class HomeScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['home', 'common'];
    /** The game logo */
    private logo: Logo;
    /** Animated dragon */
    private dragon: Dragon;
    /** Button that leads to gameplay */
    private playButton: LargeButton;
    /** Button that opens the info panel */
    private infoButton: RippleButton;
    /** Button that opens the settings panel */
    private settingsButton: RippleButton;
    /** The footer base, also used for transition in */
    private base: NineSlicePlane;

    constructor() {
        super();

        this.logo = new Logo();
        this.addChild(this.logo);

        this.dragon = new Dragon();
        this.dragon.playIdle();
        this.addChild(this.dragon);

        this.base = new NineSlicePlane(Texture.from('rounded-rectangle'), 32, 32, 32, 32);
        this.base.tint = 0x2c136c;
        this.addChild(this.base);

        this.infoButton = new RippleButton({
            image: 'icon-info',
            ripple: 'icon-info-stroke',
        });
        this.infoButton.onPress.connect(() => window.open("https://juejin.cn/post/7264471246662172727", "_blank"));
        this.addChild(this.infoButton);

        this.settingsButton = new RippleButton({
            image: 'icon-settings',
            ripple: 'icon-settings-stroke',
        });
        this.settingsButton.onPress.connect(() => { 
            // TODO: open settings panel
         });
        this.addChild(this.settingsButton);

        this.playButton = new LargeButton({ text: "开始游戏" });
        this.playButton.onPress.connect(() => navigation.showScreen(GameScreen));
        this.addChild(this.playButton);
    }

    /** Resize the screen, fired whenever window size changes  */
    public resize(width: number, height: number) {
        this.dragon.x = width * 0.5;
        this.dragon.y = height * 0.5;
        this.playButton.x = width * 0.5;
        this.playButton.y = height - 130;
        this.base.width = width;
        this.base.y = height - 140;
        this.logo.x = width * 0.5;
        this.logo.y = height * 0.2;
        // this.githubButton.x = width - 50;
        // this.githubButton.y = height - 40;
        this.infoButton.x = 30;
        this.infoButton.y = 30;
        this.settingsButton.x = width - 30;
        this.settingsButton.y = 30;
    }

    /** Show screen with animations */
    public async show() {
        bgm.play('common/bgm-main.mp3', { volume: 0.7 });

        // Reset visual state, hide things that will show up later
        this.playButton.hide(false);
        this.infoButton.hide(false);
        this.settingsButton.hide(false);
        this.dragon.show(false);
        this.logo.show(false);

        // Play reveal animation
        this.playRevealAnimation();

        // Show remaining components in sequence
        await sleep(500);
        await this.playButton.show();
        this.interactiveChildren = true;
        this.infoButton.show();
        await this.settingsButton.show();
    }

    /** Hide screen with animations */
    public async hide() {
        this.playButton.hide();
        this.infoButton.hide();
        await sleep(100);
        gsap.to(this.base.pivot, { y: -200, duration: 0.3, ease: 'back.in' });
        await sleep(100);
        this.logo.hide();
        await sleep(100);
        await this.dragon.hide();
    }

    /** Animation for revealing the screen behind the purple sprite */
    private async playRevealAnimation() {
        const duration = 1;
        const ease = easeSoftBackOut;

        gsap.killTweensOf(this.base);
        gsap.killTweensOf(this.base.pivot);

        // Make the flat colour base cover the entire screen, matching the visual state
        // left from loading screen
        this.base.height = navigation.height * 1.25;
        this.base.pivot.y = navigation.height;

        // Animate it to uncover the screen and rest at the bottom
        gsap.to(this.base, {
            height: 200,
            duration,
            ease,
        });
        await gsap.to(this.base.pivot, {
            y: 0,
            duration,
            ease,
        });
    }
}
