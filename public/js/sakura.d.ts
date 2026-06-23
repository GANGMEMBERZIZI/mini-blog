interface SakuraOption {
    className: string;
    fallSpeed: number;
    maxSize: number;
    minSize: number;
    delay: number;
    colors: Array<SakuraColors>;
}
interface SakuraColors {
    gradientColorStart: string;
    gradientColorEnd: string;
    gradientColorDegree: number;
}
export declare class Sakura {
    private el;
    private setting;
    constructor(selector: string, option?: Partial<SakuraOption>);
    private randomInt;
    private randomArrayElem;
    private readonly prefixes;
    private prefixedEvent;
    private elementInViewport;
    private createPetal;
    private animId;
    start(): void;
    stop(graceful?: boolean): void;
}
export {};
//# sourceMappingURL=sakura.d.ts.map