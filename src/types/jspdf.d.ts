declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: any);
    setFont(font: string, style?: string): void;
    setFontSize(size: number): void;
    text(text: string | string[], x: number, y: number): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    addPage(): void;
    output(type?: string): string | ArrayBuffer;
    splitTextToSize(text: string, maxSize: number): string[];
    internal: { pageSize: { getWidth(): number; getHeight(): number } };
    setDrawColor(color: number): void;
  }
}
