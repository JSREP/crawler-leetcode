// src/types/web-vitals.d.ts
declare module 'web-vitals' {
    export interface Metric {
        name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB';
        value: number;
        rating: 'good' | 'needs-improvement' | 'poor';
        delta: number;
        entries: PerformanceEntry[];
        id: string;
    }

    export function getCLS(cb: (metric: Metric) => void): void;
    export function getFID(cb: (metric: Metric) => void): void;
    export function getFCP(cb: (metric: Metric) => void): void;
    export function getLCP(cb: (metric: Metric) => void): void;
    export function getTTFB(cb: (metric: Metric) => void): void;
}