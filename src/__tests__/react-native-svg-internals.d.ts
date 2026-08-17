declare module 'react-native-svg/lib/commonjs/lib/Matrix2D' {
  export function reset(): void;
  export function append(
    a: number,
    b: number,
    c: number,
    d: number,
    tx: number,
    ty: number,
  ): void;
  export function toArray(): number[];
}

declare module 'react-native-svg/lib/commonjs/lib/extract/transform' {
  export function parse(transform: string): number[];
}
