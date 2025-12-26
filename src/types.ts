
export const ExportFormat = {
  GIF: 'GIF',
  MP4: 'MP4',
  WEBM: 'WEBM'
} as const;

export type ExportFormat = typeof ExportFormat[keyof typeof ExportFormat];

export interface ConverterSettings {
  fps: number;
  duration: number;
  scale: number;
  quality: number;
  format: ExportFormat;
  transparent: boolean;
}

export interface SvgAnalysis {
  hasSmil: boolean;
  hasCssAnimation: boolean;
  viewBox: string | null;
  width: number;
  height: number;
  suggestedDuration: number;
}
