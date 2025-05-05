declare module 'react/jsx-runtime' {
  import { ReactElement } from 'react';
  
  export function jsx(
    type: any,
    props: any,
    key?: string
  ): ReactElement;
  
  export function jsxs(
    type: any,
    props: any,
    key?: string
  ): ReactElement;
}