{ pkgs, lib, config, inputs, ... }:

{
  packages = [ pkgs.git ];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    # package.json の packageManager (pnpm@11.x) を corepack で固定する
    corepack.enable = true;
  };
}
