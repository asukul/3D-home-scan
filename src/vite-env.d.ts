/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type ModelViewerProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  alt?: string;
  poster?: string;
  exposure?: string;
  'camera-controls'?: boolean | string;
  'auto-rotate'?: boolean | string;
  ar?: boolean | string;
  'ar-modes'?: string;
  'ios-src'?: string;
  'shadow-intensity'?: string;
  'environment-image'?: string;
  'interaction-prompt'?: string;
  'camera-orbit'?: string;
  'field-of-view'?: string;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerProps;
    }
  }
}
