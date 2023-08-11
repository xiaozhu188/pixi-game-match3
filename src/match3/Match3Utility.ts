/** Piece type on each position in the grid */
export type Match3Type = number;

/** Two-dimensional array represeinting the game board */
export type Match3Grid = Match3Type[][];

/** Pair of row & column representing grid coordinates */
export type Match3Position = { row: number; column: number };

/**
 * Create a 2D grid matrix filled up with given types
 * Example:
 * [
 *  [1, 1, 2, 3]
 *  [3, 1, 1, 3]
 *  [1, 2, 3, 2]
 *  [2, 3, 1, 3]
 * ]
 * @param rows Number of rows
 * @param columns Number of columns
 * @param types List of types avaliable to fill up slots
 * @returns A 2D array filled up with types
 */
export function match3CreateGrid(rows = 6, columns = 6, types: Match3Type[]) {
    const grid: Match3Grid = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let type = match3GetRandomType(types);

            // List of rejected types for this position, to prevent them to be picked again
            const excludeList: Match3Type[] = [];

            // 初始创建的grid不能出现3个相同球相连的情况
            // 如果当前位置的type与向上的2个type或与向左的2个type一致，需要重新创建一个type
            // 遍历是从上到下，从左往右，因此不考虑右边和下边的情况
            // If the new type match previous types, randomise it again, excluding rejected type
            // to avoid building the grid with pre-made matches
            while (matchPreviousTypes(grid, { row: r, column: c }, type)) {
                excludeList.push(type);
                type = match3GetRandomType(types, excludeList);
            }

            // Create the new row if not exists
            if (!grid[r]) grid[r] = [];

            // Set type for the grid position
            grid[r][c] = type;
        }
    }

    return grid as Match3Grid;
}

/**
 * Get a random type from the type list
 * @param types List of types available to return
 * @param exclude List of types to be excluded from the result
 * @returns A random type picked from the given list
 */
export function match3GetRandomType(types: Match3Type[], exclude?: Match3Type[]) {
    let list = [...types];

    if (exclude) {
        // If exclude list is provided, exclude them from the available list
        list = types.filter((type) => !exclude.includes(type));
    }

    const index = Math.floor(Math.random() * list.length);

    return list[index];
}

/** Check if given type match previous positions in the grid  */
function matchPreviousTypes(grid: Match3Grid, position: Match3Position, type: Match3Type) {
    // Check if previous horizontal positions are forming a match
    const horizontal1 = grid?.[position.row]?.[position.column - 1];
    const horizontal2 = grid?.[position.row]?.[position.column - 2];
    const horizontalMatch = type === horizontal1 && type === horizontal2;

    // Check if previous vertical positions are forming a match
    const vertical1 = grid?.[position.row - 1]?.[position.column];
    const vertical2 = grid?.[position.row - 2]?.[position.column];
    const verticalMatch = type === vertical1 && type === vertical2;

    // Return if either horizontal or vertical psoitions are forming a match
    return horizontalMatch || verticalMatch;
}

/**
 * Loop through every position in the grid
 * @param grid The grid in context
 * @param fn Callback for each position in the grid
 */
export function match3ForEach(
    grid: Match3Grid,
    fn: (position: Match3Position, type: Match3Type) => void,
) {
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            fn({ row: r, column: c }, grid[r][c]);
        }
    }
}

/**
 * Convert grid to a visual string representation, useful for debugging
 * @param grid The grid to be converted
 * @returns String representing the grid
 */
export function match3GridToString(grid: Match3Grid) {
    const lines: string[] = [];
    for (const row of grid) {
        const list = row.map((type) => String(type).padStart(2, '0'));
        lines.push('|' + list.join('|') + '|');
    }
    return lines.join('\n');
}