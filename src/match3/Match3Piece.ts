import { Container, FederatedPointerEvent, Sprite, Texture } from "pixi.js";
import { Match3Position } from "./Match3Utility";
import { resolveAndKillTweens } from "../utils/animation";
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
    private readonly image: Sprite;
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

        // this.image.alpha = 1;
        this.image.texture = Texture.from(opts.name);
        this.image.width = opts.size - 8;
        this.image.height = opts.size - 8; //this.image.width;

        this.area.width = opts.size;
        this.area.height = opts.size;
        this.area.interactive = opts.interactive;
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
        // TODO 特殊元素点击处理
        // if (this.pressing && !this.dragging && !this.isLocked()) {
        //     const position = { row: this.row, column: this.column };
        //     this.onTap?.(position);
        // }
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

    /** CHeck if piece is locked */
    public isLocked() {
        return !this.interactiveChildren;
    }
    /** Shortcut to get the grid position of the piece */
    public getGridPosition() {
        return { row: this.row, column: this.column };
    }
    /** Slide animation */
    public async animateSwap(x: number, y: number) {
        // 位置交换动画过程中不允许交互
        this.lock();
        // resolveAndKillTweens(this);
        const duration = 0.2;
        await gsap.to(this, { x, y, duration, ease: 'quad.out' });
        this.unlock();
    }
}