import type { LineStyle, OutputLine, Span, Writer } from '~/terminal/types';

export type LineSink = (line: OutputLine) => void;

export class LineWriter implements Writer {
  private pending: Span[] = [];
  private dirty = false;

  constructor(
    private readonly sink: LineSink,
    private readonly nextId: () => number,
    private readonly defaultStyle?: LineStyle,
  ) {}

  write(text: string, style?: LineStyle): void {
    const parts = text.split('\n');
    parts.forEach((part, index) => {
      if (part.length > 0) this.push({ text: part, style: style ?? this.defaultStyle });
      if (index < parts.length - 1) this.emit();
    });
  }

  line(text = '', style?: LineStyle): void {
    this.write(`${text}\n`, style);
  }

  link(label: string, href: string): void {
    this.push({ text: label, style: 'accent', href });
  }

  raw(spans: Span[]): void {
    for (const span of spans) this.push(span);
  }

  flush(): void {
    if (this.dirty) this.emit();
  }

  private push(span: Span): void {
    const clean: Span = { text: span.text };
    if (span.style) clean.style = span.style;
    if (span.href) clean.href = span.href;
    this.pending.push(clean);
    this.dirty = true;
  }

  private emit(): void {
    this.sink({ id: this.nextId(), spans: this.pending });
    this.pending = [];
    this.dirty = false;
  }
}

export class CaptureWriter implements Writer {
  private buffer = '';

  write(text: string): void {
    this.buffer += text;
  }

  line(text = ''): void {
    this.buffer += `${text}\n`;
  }

  link(label: string): void {
    this.buffer += label;
  }

  raw(spans: Span[]): void {
    for (const span of spans) this.buffer += span.text;
  }

  flush(): void {}

  text(): string {
    return this.buffer;
  }
}
