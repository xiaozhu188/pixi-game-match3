import { Container, Sprite, Texture } from "pixi.js";

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

        // this.area.on('pointerdown', this.onPointerDown);
        // this.area.on('pointermove', this.onPointerMove);
        // this.area.on('pointerup', this.onPointerUp);
        // this.area.on('pointerupoutside', this.onPointerUp);
        // this.area.on('pointercancel', this.onPointerUp);
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
}