import { Container, Graphics } from "pixi.js";
import { Match3 } from "./Match3";
import { Match3Config, match3GetBlocks } from "./Match3Config";
import { Match3Grid, Match3Position, Match3Type, match3CreateGrid, match3ForEach, match3GetPieceType, match3GridToString } from "./Match3Utility";
import { pool } from "../utils/pool";
import { Match3Piece } from "./Match3Piece";

export class Match3Board {
    /** The Match3 instance */
    public match3: Match3;
    /** A container for the pieces sprites */
    public piecesContainer: Container;
    /** Mask all pieces inside board dimensions */
    public piecesMask: Graphics;
    /** Number of rows in the board */
    public rows = 0;
    /** Number of columns in the board */
    public columns = 0;
    /** The size (width & height) of each board slot */
    public tileSize = 0;
    /** List of common types available for the game */
    public commonTypes: Match3Type[] = [];
    /** Map piece types to piece names */
    public typesMap!: Record<number, string>;
    /** The grid state, with only numbers */
    public grid: Match3Grid = [];
    /** All piece sprites currently being used in the grid */
    public pieces: Match3Piece[] = [];

    constructor(match3: Match3) {
        this.match3 = match3;

        this.piecesContainer = new Container();
        this.match3.addChild(this.piecesContainer);

        // this.piecesMask = new Graphics();
        // this.piecesMask.beginFill(0xff0000, 1);
        // this.piecesMask.drawRect(-2, -2, 4, 4);
        // this.match3.addChild(this.piecesMask);
        // this.piecesContainer.mask = this.piecesMask;
    }
    setup(config: Match3Config) {
        this.rows = config.rows;
        this.columns = config.columns;
        this.tileSize = config.tileSize;
        // this.piecesMask.width = this.getWidth();
        // this.piecesMask.height = this.getHeight();
        // this.piecesContainer.visible = true;

        // The list of blocks (including specials) that will be used in the game
        const blocks = match3GetBlocks(config.mode);       

        this.typesMap = {};

        // Organise types and set up special handlers
        // Piece types will be defined according to their positions in the string array of blocks
        for (let i = 0; i < blocks.length; i++) {
            const name = blocks[i];
            const type = i + 1; // leave 0 for empty
            this.commonTypes.push(type);
            this.typesMap[type] = name;
        }

        // Create the initial grid state
        this.grid = match3CreateGrid(this.rows, this.columns, this.commonTypes);

        // Fill up the visual board with piece sprites
        match3ForEach(this.grid, (gridPosition: Match3Position, type: Match3Type) => {
            this.createPiece(gridPosition, type);
        });

        console.log("Initial Grid: \n" + match3GridToString(this.grid));
    }
    /** Get the visual width of the board */
    public getWidth() {
        return this.tileSize * this.columns;
    }

    /** Get the visual height of the board */
    public getHeight() {
        return this.tileSize * this.rows;
    }
    /**
     * Create a new piece in an specific grid position
     * @param position The grid position where the new piece will be attached
     * @param type The type of the new piece
     */
    public createPiece(position: Match3Position, pieceType: Match3Type) {
        const name = this.typesMap[pieceType];
        const piece = pool.get(Match3Piece);
        const viewPosition = this.getViewPositionByGridPosition(position);
        piece.onMove = (from, to) => this.match3.actions.actionMove(from, to);
        // piece.onTap = (position) => this.match3.actions.actionTap(position);
        piece.setup({
            name,
            type: pieceType,
            size: this.match3.config.tileSize,
            interactive: true,
        });
        piece.row = position.row;
        piece.column = position.column;
        piece.x = viewPosition.x;
        piece.y = viewPosition.y;
        this.pieces.push(piece);
        this.piecesContainer.addChild(piece);
        return piece;
    }
    /**
     * Conver grid position (row & column) to view position (x & y)
     * @param position The grid position to be converted
     * @returns The equivalet x & y position in the board
     */
    public getViewPositionByGridPosition(position: Match3Position) {
        const offsetX = ((this.columns - 1) * this.tileSize) / 2;
        const offsetY = ((this.rows - 1) * this.tileSize) / 2;
        const x = position.column * this.tileSize - offsetX;
        const y = position.row * this.tileSize - offsetY;
        return { x, y };
    }
    /**
     * Find a piece sprite by grid position
     * @param position The grid position to look for
     * @returns
     */
    public getPieceByPosition(position: Match3Position) {
        for (const piece of this.pieces) {
            if (piece.row === position.row && piece.column === position.column) {
                return piece;
            }
        }
        return null;
    }
    /**
     * Find out the piece type in a grid position
     * @param position
     * @returns The type of the piece
     */
    public getTypeByPosition(position: Match3Position) {
        return match3GetPieceType(this.grid, position);
    }
    /** Bring a piece in front of all others */
    public bringToFront(piece: Match3Piece) {
        this.piecesContainer.addChild(piece);
    }
}