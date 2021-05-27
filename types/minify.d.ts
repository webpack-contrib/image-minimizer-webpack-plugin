export = minify;
declare function minify(options?: {}): Promise<{
  code: any;
  filename: any;
  warnings: never[];
  errors: never[];
}>;
