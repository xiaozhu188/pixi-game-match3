import { Container } from 'pixi.js';
import { Match3Config, match3GetConfig } from './Match3Config';
import { Match3Timer } from './Match3Timer';

/**
 * The main match3 class that sets up game's sub-systems and provide some useful callbacks.
 * All game events are set as plain callbacks for simplicity
 */
export class Match3 extends Container {
    /** Match3 game basic configuration */
    public config: Match3Config;
    /** Counts the gameplay time */
    public timer: Match3Timer;
    /** Fires when game duration expires */
    public onTimesUp?: () => void;

    constructor() {
        super();

        // Game sub-systems
        this.config = match3GetConfig();
        this.timer = new Match3Timer(this); // 计时模块
    }

    /**
     * Sets up a new match3 game with pieces, rows, columns, duration, etc.
     * @param config The config object in which the game will be based on
     */
    public setup(config: Match3Config) {
        this.config = config;
        this.reset();
        this.timer.setup(config.duration * 1000);
    }

    /** Fully reset the game */
    public reset() {
        this.interactiveChildren = false;
        this.timer.reset();
    }

    /** Start the timer and enable interaction */
    public startPlaying() {
        this.interactiveChildren = true;
        this.timer.start();
    }

    /** Stop the timer and disable interaction */
    public stopPlaying() {
        this.interactiveChildren = false;
    }

    /** Check if the game is still playing */
    public isPlaying() {
        return this.interactiveChildren;
    }

    /** Pause the game */
    public pause() {
        this.timer.pause();
    }

    /** Resume the game */
    public resume() {
        this.timer.resume();
    }

    /** Update the timer */
    public update(detlaMs: number) {
        this.timer.update(detlaMs);
    }
}
