import { Match3 } from "./Match3";
import { Match3Piece } from "./Match3Piece";
import { Match3Position, match3CloneGrid, match3GetMatches, match3GetPieceType, match3SwapTypeInGrid } from "./Match3Utility";

/**
 * These are the actions player can take: move pieces (swap) or tap if they are special.
 * Action effects happens instantly, and the game will deal with whatever state the grid ends up with.
 */
export class Match3Actions {
    /** The match3 instance */
    public match3: Match3;

    /** Free all moves, meaning that they will always be valid regardles of matching results */
    public freeMoves = false;

    constructor(match3: Match3) {
        this.match3 = match3;
    }

    /**
     * Basic move action that swap two pieces in the grid. Can be disallowed and reverted if
     * the move does not involve special pieces neither create any new matches, unless free moves
     * is enabled.
     * @param from The origin grid position of the move
     * @param to The destination grid position of the move
     */
    public async actionMove(from: Match3Position, to: Match3Position) {
        if (!this.match3.isPlaying()) return;

        // Check if there are pieces on each of the 2 positions, and if they are not locked
        // find out piece in board.pieces
        const pieceA = this.match3.board.getPieceByPosition(from);
        const pieceB = this.match3.board.getPieceByPosition(to);
        if (!pieceA || !pieceB || pieceA.isLocked() || pieceB.isLocked()) return;

        // Check the grid types currently involved in the move
        // find out type in board.grid
        const typeA = this.match3.board.getTypeByPosition(from);
        const typeB = this.match3.board.getTypeByPosition(to);
        if (!typeA || !typeB) return;

        // Execute the pieces swap - might be reverted if invalid
        await this.swapPieces(pieceA, pieceB);
        // start async queue
        // this.match3.process.start();
    }

    /** Attempt to swap two pieces positions in the board, and revert the movement if disallowed */
    private async swapPieces(pieceA: Match3Piece, pieceB: Match3Piece) {
        // find out position in grid
        const positionA = pieceA.getGridPosition();
        const positionB = pieceB.getGridPosition();
        console.log('[Match3] Swap', positionA, positionB);

        // Find out view positions based on grid positions
        const viewPositionA = this.match3.board.getViewPositionByGridPosition(positionA);
        const viewPositionB = this.match3.board.getViewPositionByGridPosition(positionB);

        // Validate move if that creates any matches or if free moves is enabled
        const valid = this.validateMove(positionA, positionB);

        if (valid) {
            // If move is valid, swap types in the grid and update view coordinates
            // 1.update grid
            match3SwapTypeInGrid(this.match3.board.grid, positionA, positionB); 
            // 2.update position of pieces
            pieceA.row = positionB.row;
            pieceA.column = positionB.column;
            pieceB.row = positionA.row;
            pieceB.column = positionA.column;
        }

        // Animate pieces to their new positions
        this.match3.board.bringToFront(pieceA);
        await Promise.all([
            pieceA.animateSwap(viewPositionB.x, viewPositionB.y),
            pieceB.animateSwap(viewPositionA.x, viewPositionA.y),
        ]);

        if (!valid) {
            // Revert pieces to their original position if move is not valid
            const viewPositionA = this.match3.board.getViewPositionByGridPosition(positionA);
            const viewPositionB = this.match3.board.getViewPositionByGridPosition(positionB);
            this.match3.board.bringToFront(pieceB);
            await Promise.all([
                pieceA.animateSwap(viewPositionA.x, viewPositionA.y),
                pieceB.animateSwap(viewPositionB.x, viewPositionB.y),
            ]);
        }
    }
    /** Check if a move from origin to destination is valid
     *  成立条件1: 两个位置中有1个或2个特殊piece
     *  成立条件2: 两个位置交换后有与from或to相关的matches
     */
    private validateMove(from: Match3Position, to: Match3Position) {
        // If free moves is on, all moves are valid
        if (this.freeMoves) return true;

        const typeOfFrom = match3GetPieceType(this.match3.board.grid, from);
        const typeOfTo = match3GetPieceType(this.match3.board.grid, to);

        // Clone current grid so we can manipulate it safely
        const tempGrid = match3CloneGrid(this.match3.board.grid);

        // Swap type in the temporary cloned grid
        match3SwapTypeInGrid(tempGrid, from, to);

        // Get all matches created by this move in the temporary grid
        const newMatches = match3GetMatches(tempGrid, [from, to]);

        // Only validate moves that creates new matches
        return newMatches.length >= 1;
    }
}