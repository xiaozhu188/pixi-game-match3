import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';
import { randomRange } from './random';

gsap.registerPlugin(CustomEase);

/** Unique identifiers for custom eases */
let customEaseUID = 1;

/**
 * Register a custom ease curve, wrapped this way basically to prevent override accross different files
 * @param curve The string representing the curve
 * @param name Optional name for the tween, otherwise it will create an unique id
 * @returns The ease function to be used in tweens
 */
export function registerCustomEase(curve: string, name?: string) {
    if (!name) name = 'customEase' + customEaseUID++;
    if (CustomEase.get(name)) throw new Error('Custom ease already registered: ' + name);
    return CustomEase.create(name, curve);
}

/**
 * Safely kill tweens without breaking their promises. It seems that in gsap,
 * if you kill a tween, its promises hangs forever, without either resolve or reject
 * @param targets The tween targets that must have related tweens killed
 */
export async function resolveAndKillTweens(targets: gsap.TweenTarget) {
    const tweens = gsap.getTweensOf(targets);
    for (const tween of tweens) {
        // Force resolve tween promise, if exists
        if ((tween as any)['_prom']) (tween as any)['_prom']();
    }
    gsap.killTweensOf(targets);
}