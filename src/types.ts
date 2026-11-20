export type Alignment = 'left' | 'center' | 'right';

export interface TextLayout {
  align?: Alignment;
  letterSpacing?: number;
  lineGap?: number;
  wrap?: boolean;
  unsupported?: 'blank' | 'error';
}

export interface TextOptions extends TextLayout {
  columns?: number;
  rows?: number;
}

export interface TextNode extends TextLayout {
  type: 'text';
  text: string;
}

export interface SvgNode {
  type: 'svg';
  path: string;
  scale?: number;
}

export type ContentNode = TextNode | SvgNode;

export interface Scene {
  nodes: readonly ContentNode[];
  label: string;
  color?: string;
}

export interface FrameOptions {
  columns?: number;
  rows?: number;
  gap?: number;
  align?: Alignment;
}

export interface GlyphFrame {
  ascii: string;
  label: string;
  color: string;
}

export interface DisplayOptions {
  autoplay?: boolean;
  transition?: 'shimmer' | 'none';
  variant?: 'text' | 'image';
  duration?: number;
  interval?: number;
  pauseOnHover?: boolean;
  advanceOnClick?: boolean;
}

export interface DisplayController {
  next(): void;
  show(index: number): void;
  play(): void;
  pause(): void;
  setTransition(transition: NonNullable<DisplayOptions['transition']>): void;
  destroy(): void;
}
