/**
 * Returns a random number within a range
 * @param min - lowest number (inclusive)
 * @param max - highest number (exclusive)
 * @param random - The random function to be used (defaults to Math.random)
 */
export function randomRange(min: number, max: number, random = Math.random): number {
    const a = Math.min(min, max);
    const b = Math.max(min, max);

    const v = a + (b - a) * random();

    return v;
}