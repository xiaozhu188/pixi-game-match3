import { Container } from "pixi.js";
import { Match3Mode, match3GetConfig } from "../match3/Match3Config";
import { getUrlParam, getUrlParamNumber } from "../utils/getUrlParams";
import { app } from "../app";
import { Shelf } from "../ui/Shelf";
import { GameScore } from "../ui/GameScore";
import { Cauldron } from "../ui/Cauldron";
import { GameTimer } from "../ui/GameTimer";
import { GameCountdown } from "../ui/GameCountdown";
import { GameOvertime } from "../ui/GameOvertime";
import { Match3 } from "../match3/Match3";
import gsap from "gsap";
import { GameTimesUp } from "../ui/GameTimesUp";
import { navigation } from "../utils/navigation";
import { ResultScreen } from "./ResultScreen";

export class GameScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['game', 'common'];
    public readonly gameContainer: Container;
    public readonly shelf: Shelf;
    public readonly score: GameScore;
    public readonly cauldron: Cauldron;
    public readonly timer: GameTimer;
    public readonly countdown: GameCountdown;
    public readonly overtime: GameOvertime;
    public readonly timesUp: GameTimesUp;
    public readonly match3: Match3;
    constructor() {
        super();

        this.gameContainer = new Container();
        this.gameContainer.name = "gameContainer";
        this.addChild(this.gameContainer);

        // 棋盘
        this.shelf = new Shelf();
        this.gameContainer.addChild(this.shelf);

        // 分数
        this.score = new GameScore();
        this.addChild(this.score);

        // 锅
        this.cauldron = new Cauldron(true);
        this.addChild(this.cauldron);

        // 倒计时
        this.timer = new GameTimer();
        this.cauldron.addContent(this.timer);

        // Ready?...GO
        this.countdown = new GameCountdown();
        this.addChild(this.countdown);

        // game over
        this.timesUp = new GameTimesUp();
        this.addChild(this.timesUp);

        // game core
        this.match3 = new Match3();
        this.match3.onTimesUp = this.onTimesUp.bind(this);
        this.gameContainer.addChild(this.match3);

        // last 5 seconds
        this.overtime = new GameOvertime(this.match3);
        this.addChild(this.overtime);
    }
    prepare() {
        const match3Config = match3GetConfig({
            rows: getUrlParamNumber('rows') ?? 5,
            columns: getUrlParamNumber('columns') ?? 5,
            tileSize: getUrlParamNumber('tileSize') ?? 50,
            freeMoves: getUrlParam('freeMoves') !== null,
            duration: getUrlParamNumber('duration') ?? 60,
            mode: (getUrlParam('mode') as Match3Mode) ?? 'normal',
        });
        console.log(match3Config);

        this.shelf.setup(match3Config)
        this.match3.setup(match3Config);
        this.score.hide(false); // give 'false' to hide immediately, no use animation. Same below.
        this.cauldron.hide(false);
        gsap.killTweensOf(this.gameContainer.pivot);
        this.gameContainer.pivot.y = -app.screen.height * 0.7;
    }
    resize(width: number, height: number) {
        const div = height * 0.3;
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        this.gameContainer.x = centerX;
        this.gameContainer.y = centerY;

        this.score.x = centerX;
        this.score.y = 20;

        this.cauldron.x = centerX;
        this.cauldron.y = div - 60;

        this.countdown.x = centerX;
        this.countdown.y = centerY;

        this.overtime.x = this.gameContainer.x;
        this.overtime.y = this.gameContainer.y;

        this.timesUp.x = centerX;
        this.timesUp.y = centerY;
    }
    /** Update the screen */
    public update() {
        this.match3.update(app.ticker.deltaMS)
        // while remaining time < 10s, show countdown flash animation
        this.timer.updateTime(this.match3.timer.getTimeRemaining());
        // while remaining time <= 5, show number scale animation
        this.overtime.updateTime(this.match3.timer.getTimeRemaining());
    }
    async show() {
        await gsap.to(this.gameContainer.pivot, { y: 0, duration: 0.5, ease: 'back.out' });
        await this.countdown.show(); // show Ready
        await this.cauldron.show();
        await this.countdown.hide(); // show Go
        this.score.show();
        this.match3.startPlaying(); // 开始倒计时
    }
    async hide() {
        this.overtime.hide();
        await this.timesUp.playRevealAnimation();
        await this.timesUp.playExpandAnimation();
    }
    /** Fires when the game timer ends */
    private onTimesUp() {
        this.match3.stopPlaying();
        // will trigger hide and show this.timesUp
        navigation.showScreen(ResultScreen);
    }
}