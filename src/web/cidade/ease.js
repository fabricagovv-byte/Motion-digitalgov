export * from '../core.js';
import { clamp } from '../core.js';
export const easeOutBack = (x) => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const fmt = (v, d = 1) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
