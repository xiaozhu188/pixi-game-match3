import { Container, FederatedPointerEvent, Sprite, Texture } from "pixi.js";
import { Match3Position } from "./Match3Utility";
import { pauseTweens, registerCustomEase, resolveAndKillTweens, resumeTweens } from "../utils/animation";
import gsap from "gsap"

/** Default piece options */
const defaultMatch3PieceOptions = {
    /** Sprite name of piece, must match one of the textures available */
    name: '',
    /** Attributed piece type in the grid */
    type: 0,
    /** Piece size - width & height - in pixel */
    size: 50,
    /** Set if the piece should be highlighted, like special types */
    highlight: false,
    /** Enable or disable its interactivity */
    interactive: false,
};

/** Piece configuration parameters */
export type Match3PieceOptions = typeof defaultMatch3PieceOptions;

/** Custom ease curve for y animation of falling pieces */
const easeSingleBounce = registerCustomEase(
    'M0,0,C0.14,0,0.27,0.191,0.352,0.33,0.43,0.462,0.53,0.963,0.538,1,0.546,0.985,0.672,0.83,0.778,0.83,0.888,0.83,0.993,0.983,1,1',
);

export class Match3Piece extends Container {
    /** The row index of the piece */
    public row = 0;
    /** The column index of the piece */
    public column = 0;
    /** The piece type in the grid */
    public type = 0;
    /** piece的sprite名称比如piece-dragon,具体查看blocks的定义 The name of the piece - must match one of the available textures */
    public name = '';
    /** The actual image of the piece */
    public readonly image: Sprite;
    /** The interactive area of the piece */
    private readonly area: Sprite;
    /** True if piece is being touched */
    private pressing = false;
    /** True if piece is being dragged */
    private dragging = false;
    /** The initial x position of the press */
    private pressX = 0;
    /** The initial y position of the press */
    private pressY = 0;
    /** Callback that fires when the player drags the piece for a move */
    public onMove?: (from: Match3Position, to: Match3Position) => void;
    /** Callback that fires when the player tap the piece */
    public onTap?: (position: Match3Position) => void;

    constructor() {
        super();

        this.image = new Sprite();
        this.image.anchor.set(0.5);
        this.addChild(this.image);

        this.area = Sprite.from(Texture.WHITE);
        this.area.name = "interactiveArea"
        this.area.anchor.set(0.5);
        this.area.alpha = 0;
        this.addChild(this.area);

        this.area.on('pointerdown', this.onPointerDown);
        this.area.on('pointermove', this.onPointerMove);
        this.area.on('pointerup', this.onPointerUp);
        this.area.on('pointerupoutside', this.onPointerUp);
        this.area.on('pointercancel', this.onPointerUp);
    }
    /**
     * Set up the visuals. Pieces can be resused and set up with different params freely.
     * @param options The setup options
     */
    public setup(options: Partial<Match3PieceOptions> = {}) {
        const opts = { ...defaultMatch3PieceOptions, ...options };

        this.type = opts.type;
        this.name = opts.name;

        // 从实例池里取出复用的可能是执行飞入大锅临时创建的Piece实例,
        // 由于这些piece会执行animatePop动画,而animatePop动画会将visible设置为false以及将image的alpha设置为0
        // 因此这里需要先将visible设置为true,再将image的alpha设置为1
        // 否则会导致这些piece是透明的
        // 比如重力下降后，填充的pieces是从池里取出的,而这些pieces可能就是执行animatePop动画后回收的
        // 如果piece是直接实例化的而不是从池里取出的,可以忽略这里,因此重新实例化的piece的visible为true且image的alpha位1
        // 最好在回收前将状态重置一下避免出现这种情况
        this.visible = true;
        this.alpha = 1;
        this.scale.set(1);

        this.image.alpha = 1;
        this.image.texture = Texture.from(opts.name);
        this.image.width = opts.size - 8;
        this.image.height = opts.size - 8; //this.image.width;

        this.area.width = opts.size;
        this.area.height = opts.size;
        this.area.eventMode = opts.interactive ? "static" : "none";
        this.area.cursor = 'pointer';
    }
    /** Interaction mouse/touch down handler */
    private onPointerDown = (e: FederatedPointerEvent) => {
        if (this.isLocked()) return;
        this.pressing = true;
        this.dragging = false;
        this.pressX = e.globalX;
        this.pressY = e.globalY;
    };
    /** Interaction mouse/touch move handler */
    private onPointerMove = (e: FederatedPointerEvent) => {
        if (!this.pressing || this.isLocked()) return;

        const moveX = e.globalX - this.pressX;
        const moveY = e.globalY - this.pressY;
        const distanceX = Math.abs(moveX);
        const distanceY = Math.abs(moveY);
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance > 10) {
            this.dragging = true;
            const from = { row: this.row, column: this.column };
            const to = { row: this.row, column: this.column };

            if (distanceX > distanceY) {
                if (moveX < 0) {
                    // Move left
                    to.column -= 1;
                    this.onMove?.(from, to); // this.match3.actions.actionMove
                } else {
                    // Move right
                    to.column += 1;
                    this.onMove?.(from, to);
                }
            } else {
                if (moveY < 0) {
                    // Move up
                    to.row -= 1;
                    this.onMove?.(from, to);
                } else {
                    // Move down
                    to.row += 1;
                    this.onMove?.(from, to);
                }
            }
            this.onPointerUp();
        }
    };
    /** Interaction mouse/touch up handler */
    private onPointerUp = () => {
        if (this.pressing && !this.dragging && !this.isLocked()) {
            const position = { row: this.row, column: this.column };
            this.onTap?.(position);
        }
        this.dragging = false;
        this.pressing = false;
    };
    /** Lock piece interactivity, preventing mouse/touch events */
    public lock() {
        this.interactiveChildren = false;
        this.dragging = false;
        this.pressing = false;
    }

    /** Unlock piece interactivity, preventing mouse/touch events */
    public unlock() {
        this.interactiveChildren = true;
    }

    /** Check if piece is locked */
    public isLocked() {
        return !this.interactiveChildren;
    }
    /** Shortcut to get the grid position of the piece */
    public getGridPosition() {
        return { row: this.row, column: this.column };
    }
    /** piece交换动画 */
    public async animateSwap(x: number, y: number) {
        // 位置交换动画过程中不允许交互
        this.lock();
        resolveAndKillTweens(this);
        const duration = 0.2;
        await gsap.to(this, { x, y, duration, ease: 'quad.out' });
        this.unlock();
    }
    /** Pop out animation */
    public async animatePop() {
        this.lock();
        resolveAndKillTweens(this.image);
        const duration = 0.1;
        await gsap.to(this.image, { alpha: 0, duration, ease: 'sine.out' });
        this.visible = false;
    }
    /** Fall to position animation */
    public async animateFall(x: number, y: number) {
        this.lock();
        resolveAndKillTweens(this.position);
        const duration = 0.5;
        await gsap.to(this.position, { x, y, duration, ease: easeSingleBounce });
        this.unlock();
    }
    /** Spawn animation */
    public async animateSpawn() {
        this.lock();
        resolveAndKillTweens(this.scale);
        this.scale.set(3);
        this.visible = true;
        const duration = 0.4;
        gsap.to(this.scale, { x: 1, y: 1, duration, ease: 'back.out' });
        this.unlock();
    }
    /** Pause all current tweens */
    public pause() {
        pauseTweens(this);
        pauseTweens(this.position);
        pauseTweens(this.scale);
        pauseTweens(this.image);
    }
    /** Resume pending tweens */
    public resume() {
        resumeTweens(this);
        resumeTweens(this.position);
        resumeTweens(this.scale);
        resumeTweens(this.image);
    }
}