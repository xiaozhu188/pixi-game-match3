import { Container } from 'pixi.js';
import { Label } from './Label';
import gsap from 'gsap';
import { sfx } from '../utils/audio';
import { Match3 } from '../match3/Match3';

/**
 * Shows up when the game is 5 seconds to finish, with a countdown 5 to 1,
 * then shows a "Finished" message while the grid takes its time to complete processing
 */
export class GameOvertime extends Container {
    /** Label for the seconds left */
    private labelNum: Label;
    match3: Match3;

    constructor(match3: Match3) {
        super();

        this.match3 = match3;

        this.labelNum = new Label('', { fontSize: 230, fill: 0xffffff });
        this.addChild(this.labelNum);

        this.alpha = 0.4;
        this.visible = false;
    }

    /** Play a number animation */
    private async playNumber(num: number) {
        this.labelNum.visible = true;
        const str = String(num);
        if (this.labelNum.text === str) return;

        sfx.play('common/sfx-countdown.wav', { speed: 2, volume: 0.5 });
        this.labelNum.text = str;

        gsap.killTweensOf(this.labelNum);
        gsap.killTweensOf(this.labelNum.scale);

        this.labelNum.scale.set(0);
        gsap.to(this.labelNum, { alpha: 1, duration: 0.4, ease: 'linear' });
        gsap.to(this.labelNum.scale, { x: 1, y: 1, duration: 0.4, ease: 'back.out' });

        gsap.to(this.labelNum, { alpha: 0, duration: 0.2, ease: 'linear', delay: 0.8 });
        gsap.to(this.labelNum.scale, { x: 3, y: 3, duration: 0.2, ease: 'linear', delay: 0.8 });
    }

    /** Update the display according to the remaining time passed - will be ignored until 5 secs left */
    public updateTime(remainingTimeMs: number) {
        // console.log(remainingTimeMs);
        if(!this.match3.isPlaying()) return;
        if (remainingTimeMs > 6000) {
            this.visible = false;
            return;
        }

        if (!this.visible && remainingTimeMs > 0) this.show();

        const secs = Math.floor(remainingTimeMs / 1000);
        if (secs >= 0) {
            this.playNumber(secs);
        }
    }

    /** Show the component  */
    public async show() {
        this.alpha = 0;
        this.visible = true;
        gsap.to(this, { alpha: 0.5, duration: 0.3, ease: 'linear' });
    }

    /** Hide the component  */
    public async hide() {
        await gsap.to(this, { alpha: 0, duration: 0.4, ease: 'linear' });
        this.visible = false;
    }
}
