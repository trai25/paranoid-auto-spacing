#!/usr/bin/env node
"use strict";
const node_index = require("./index.cjs");
const usage = `
usage: pangu [-h] [-v] [-t] [-f] text_or_path

pangu.js -- Paranoid text spacing for good readability, to automatically
insert whitespace between CJK and half-width characters (alphabetical letters,
numerical digits and symbols).

positional arguments:
  text_or_path   the text or file path to apply spacing

optional arguments:
  -h, --help     show this help message and exit
  -v, --version  show program's version number and exit
  -t, --text     specify the input value is a text
  -f, --file     specify the input value is a file path
`.trim();
const [, , ...args] = process.argv;
function printSpacingText(text) {
  if (typeof text === "string") {
    console.log(node_index.pangu.spacingText(text));
  } else {
    console.log(usage);
    process.exit(1);
  }
}
function printSpacingFile(path) {
  if (typeof path === "string") {
    console.log(node_index.pangu.spacingFileSync(path));
  } else {
    console.log(usage);
    process.exit(1);
  }
}
if (args.length === 0) {
  console.log(usage);
} else {
  switch (args[0]) {
    /* eslint-disable indent */
    case "-h":
    case "--help":
      console.log(usage);
      break;
    case "-v":
    case "--version":
      console.log(node_index.pangu.version);
      break;
    case "-t":
      printSpacingText(args[1]);
      break;
    case "-f":
      printSpacingFile(args[1]);
      break;
    default:
      printSpacingText(args[0]);
  }
}
process.exit(0);
//# sourceMappingURL=cli.cjs.map
