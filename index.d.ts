type TemplateFunction<T> = (template: TemplateStringsArray, ...values: any[]) => T;
export type BoundTemplateFunction<T extends Element | ShadowRoot> = TemplateFunction<T>;
export type WiredTemplateFunction = TemplateFunction<any>;

export declare function bind<T extends Element | ShadowRoot>(element: T): BoundTemplateFunction<T>;

export declare function define(intent: string, callback: Function): void;

export declare function wire(identity?: object | null, type?: 'html' | 'svg'): WiredTemplateFunction;
export declare function wire(identity?: object | null, type_id?: string): WiredTemplateFunction;

export declare const hyper: {
  bind: typeof bind;
  define: typeof define;
  hyper: typeof hyper;
  wire: typeof wire;

  // hyper(null, 'html')`HTML`
  (identity: null | undefined, type?: 'html' | 'svg'): WiredTemplateFunction;

  // hyper('html')`HTML`
  (type: 'html' | 'svg'): WiredTemplateFunction;

  // hyper(element)`HTML`
  <T extends Element>(element: T): BoundTemplateFunction<T>;

  // hyper`HTML`
  (template: TemplateStringsArray, ...values: any[]): any;

  // hyper(obj, 'html:id')`HTML`
  // hyper(obj)`HTML`
  (identity: object, type?: 'html' | 'svg'): WiredTemplateFunction;
  (identity: object, type_id?: string): WiredTemplateFunction;

  // hyper()`HTML`
  (): WiredTemplateFunction;
};

export default hyper;
