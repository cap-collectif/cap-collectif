declare class ModernizrStatic {
  intl: boolean,
};

declare module "Modernizr" {
  declare var exports: ModernizrStatic;
}
declare var Modernizr: ModernizrStatic;
