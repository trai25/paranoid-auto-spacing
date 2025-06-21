#!/usr/bin/env node
"use strict";
const index = require("../shared/index.cjs");
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
function once(func) {
  let executed = false;
  return function(...args2) {
    if (executed) {
      return void 0;
    }
    executed = true;
    return func(...args2);
  };
}
function debounce(func, delay, mustRunDelay = Infinity) {
  let timer = null;
  let startTime = null;
  return function(...args2) {
    const currentTime = Date.now();
    if (timer) {
      clearTimeout(timer);
    }
    if (!startTime) {
      startTime = currentTime;
    }
    if (currentTime - startTime >= mustRunDelay) {
      func(...args2);
      startTime = currentTime;
    } else {
      timer = window.setTimeout(() => {
        func(...args2);
      }, delay);
    }
  };
}
class BrowserPangu extends index.Pangu {
  constructor() {
    super();
    __publicField(this, "blockTags");
    __publicField(this, "ignoredTags");
    __publicField(this, "presentationalTags");
    __publicField(this, "spaceLikeTags");
    __publicField(this, "spaceSensitiveTags");
    __publicField(this, "isAutoSpacingPageExecuted");
    this.blockTags = /^(div|p|h1|h2|h3|h4|h5|h6)$/i;
    this.ignoredTags = /^(code|pre|script|style|textarea|iframe)$/i;
    this.presentationalTags = /^(b|code|del|em|i|s|strong|kbd)$/i;
    this.spaceLikeTags = /^(br|hr|i|img|pangu)$/i;
    this.spaceSensitiveTags = /^(a|del|pre|s|strike|u)$/i;
    this.isAutoSpacingPageExecuted = false;
  }
  spacingNodeByXPath(xPathQuery, contextNode) {
    if (!(contextNode instanceof Node) || contextNode instanceof DocumentFragment) {
      return;
    }
    const textNodes = document.evaluate(xPathQuery, contextNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    let currentTextNode;
    let nextTextNode = null;
    for (let i = textNodes.snapshotLength - 1; i > -1; --i) {
      currentTextNode = textNodes.snapshotItem(i);
      if (!currentTextNode) continue;
      if (currentTextNode.parentNode && this.isSpecificTag(currentTextNode.parentNode, this.presentationalTags) && !this.isInsideSpecificTag(currentTextNode.parentNode, this.ignoredTags)) {
        const elementNode = currentTextNode.parentNode;
        if (elementNode.previousSibling) {
          const { previousSibling } = elementNode;
          if (previousSibling.nodeType === Node.TEXT_NODE) {
            const testText = previousSibling.data.slice(-1) + currentTextNode.data.charAt(0);
            const testNewText = this.spacingText(testText);
            if (testText !== testNewText) {
              previousSibling.data = `${previousSibling.data} `;
            }
          }
        }
        if (elementNode.nextSibling) {
          const { nextSibling } = elementNode;
          if (nextSibling.nodeType === Node.TEXT_NODE) {
            const testText = currentTextNode.data.slice(-1) + nextSibling.data.charAt(0);
            const testNewText = this.spacingText(testText);
            if (testText !== testNewText) {
              nextSibling.data = ` ${nextSibling.data}`;
            }
          }
        }
      }
      if (this.canIgnoreNode(currentTextNode)) {
        nextTextNode = currentTextNode;
        continue;
      }
      if (currentTextNode instanceof Text) {
        const newText = this.spacingText(currentTextNode.data);
        if (currentTextNode.data !== newText) {
          currentTextNode.data = newText;
        }
      }
      if (nextTextNode) {
        if (currentTextNode.nextSibling && currentTextNode.nextSibling.nodeName.search(this.spaceLikeTags) >= 0) {
          nextTextNode = currentTextNode;
          continue;
        }
        if (!(currentTextNode instanceof Text) || !(nextTextNode instanceof Text)) {
          continue;
        }
        const testText = currentTextNode.data.slice(-1) + nextTextNode.data.slice(0, 1);
        const testNewText = this.spacingText(testText);
        if (testNewText !== testText) {
          let nextNode = nextTextNode;
          while (nextNode.parentNode && nextNode.nodeName.search(this.spaceSensitiveTags) === -1 && this.isFirstTextChild(nextNode.parentNode, nextNode)) {
            nextNode = nextNode.parentNode;
          }
          let currentNode = currentTextNode;
          while (currentNode.parentNode && currentNode.nodeName.search(this.spaceSensitiveTags) === -1 && this.isLastTextChild(currentNode.parentNode, currentNode)) {
            currentNode = currentNode.parentNode;
          }
          if (currentNode.nextSibling) {
            if (currentNode.nextSibling.nodeName.search(this.spaceLikeTags) >= 0) {
              nextTextNode = currentTextNode;
              continue;
            }
          }
          if (currentNode.nodeName.search(this.blockTags) === -1) {
            if (nextNode.nodeName.search(this.spaceSensitiveTags) === -1) {
              if (nextNode.nodeName.search(this.ignoredTags) === -1 && nextNode.nodeName.search(this.blockTags) === -1) {
                if (nextTextNode.previousSibling) {
                  if (nextTextNode.previousSibling.nodeName.search(this.spaceLikeTags) === -1) {
                    if (nextTextNode instanceof Text) {
                      nextTextNode.data = ` ${nextTextNode.data}`;
                    }
                  }
                } else {
                  if (!this.canIgnoreNode(nextTextNode)) {
                    if (nextTextNode instanceof Text) {
                      nextTextNode.data = ` ${nextTextNode.data}`;
                    }
                  }
                }
              }
            } else if (currentNode.nodeName.search(this.spaceSensitiveTags) === -1) {
              if (currentTextNode instanceof Text) {
                currentTextNode.data = `${currentTextNode.data} `;
              }
            } else {
              const panguSpace = document.createElement("pangu");
              panguSpace.innerHTML = " ";
              if (nextNode.parentNode) {
                if (nextNode.previousSibling) {
                  if (nextNode.previousSibling.nodeName.search(this.spaceLikeTags) === -1) {
                    nextNode.parentNode.insertBefore(panguSpace, nextNode);
                  }
                } else {
                  nextNode.parentNode.insertBefore(panguSpace, nextNode);
                }
              }
              if (!panguSpace.previousElementSibling) {
                if (panguSpace.parentNode) {
                  panguSpace.parentNode.removeChild(panguSpace);
                }
              }
            }
          }
        }
      }
      nextTextNode = currentTextNode;
    }
  }
  spacingNode(contextNode) {
    let xPathQuery = ".//*/text()[normalize-space(.)]";
    if (contextNode instanceof Element && contextNode.children && contextNode.children.length === 0) {
      xPathQuery = ".//text()[normalize-space(.)]";
    }
    this.spacingNodeByXPath(xPathQuery, contextNode);
  }
  spacingElementById(idName) {
    const xPathQuery = `id("${idName}")//text()`;
    this.spacingNodeByXPath(xPathQuery, document);
  }
  spacingElementByClassName(className) {
    const xPathQuery = `//*[contains(concat(" ", normalize-space(@class), " "), "${className}")]//text()`;
    this.spacingNodeByXPath(xPathQuery, document);
  }
  spacingElementByTagName(tagName) {
    const xPathQuery = `//${tagName}//text()`;
    this.spacingNodeByXPath(xPathQuery, document);
  }
  spacingPageTitle() {
    const xPathQuery = "/html/head/title/text()";
    this.spacingNodeByXPath(xPathQuery, document);
  }
  spacingPageBody() {
    let xPathQuery = "/html/body//*/text()[normalize-space(.)]";
    ["script", "style", "textarea"].forEach((tag) => {
      xPathQuery = `${xPathQuery}[translate(name(..),"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")!="${tag}"]`;
    });
    this.spacingNodeByXPath(xPathQuery, document);
  }
  spacingPage() {
    this.spacingPageTitle();
    this.spacingPageBody();
  }
  autoSpacingPage(pageDelay = 1e3, nodeDelay = 500, nodeMaxWait = 2e3) {
    if (!(document.body instanceof Node)) {
      return;
    }
    if (this.isAutoSpacingPageExecuted) {
      return;
    }
    this.isAutoSpacingPageExecuted = true;
    const onceSpacingPage = once(() => {
      this.spacingPage();
    });
    const videos = document.getElementsByTagName("video");
    if (videos.length === 0) {
      setTimeout(() => {
        onceSpacingPage();
      }, pageDelay);
    } else {
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        if (video.readyState === 4) {
          setTimeout(() => {
            onceSpacingPage();
          }, 3e3);
          break;
        }
        video.addEventListener("loadeddata", () => {
          setTimeout(() => {
            onceSpacingPage();
          }, 4e3);
        });
      }
    }
    const queue = [];
    const self = this;
    const debouncedSpacingNodes = debounce(
      () => {
        while (queue.length) {
          const node = queue.shift();
          if (node) {
            self.spacingNode(node);
          }
        }
      },
      nodeDelay,
      nodeMaxWait
    );
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        switch (mutation.type) {
          case "childList":
            mutation.addedNodes.forEach((node2) => {
              if (node2.nodeType === Node.ELEMENT_NODE) {
                queue.push(node2);
              } else if (node2.nodeType === Node.TEXT_NODE && node2.parentNode) {
                queue.push(node2.parentNode);
              }
            });
            break;
          case "characterData":
            const { target: node } = mutation;
            if (node.nodeType === Node.TEXT_NODE && node.parentNode) {
              queue.push(node.parentNode);
            }
            break;
        }
      });
      debouncedSpacingNodes();
    });
    mutationObserver.observe(document.body, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isContentEditable(node) {
    return node.isContentEditable || node.getAttribute && node.getAttribute("g_editable") === "true";
  }
  isSpecificTag(node, tagRegex) {
    return node && node.nodeName && node.nodeName.search(tagRegex) >= 0;
  }
  isInsideSpecificTag(node, tagRegex, checkCurrent = false) {
    let currentNode = node;
    if (checkCurrent) {
      if (this.isSpecificTag(currentNode, tagRegex)) {
        return true;
      }
    }
    while (currentNode.parentNode) {
      currentNode = currentNode.parentNode;
      if (this.isSpecificTag(currentNode, tagRegex)) {
        return true;
      }
    }
    return false;
  }
  canIgnoreNode(node) {
    let currentNode = node;
    if (currentNode && (this.isSpecificTag(currentNode, this.ignoredTags) || this.isContentEditable(currentNode))) {
      return true;
    }
    while (currentNode.parentNode) {
      currentNode = currentNode.parentNode;
      if (currentNode && (this.isSpecificTag(currentNode, this.ignoredTags) || this.isContentEditable(currentNode))) {
        return true;
      }
    }
    return false;
  }
  isFirstTextChild(parentNode, targetNode) {
    const { childNodes } = parentNode;
    for (let i = 0; i < childNodes.length; i++) {
      const childNode = childNodes[i];
      if (childNode.nodeType !== Node.COMMENT_NODE && childNode.textContent) {
        return childNode === targetNode;
      }
    }
    return false;
  }
  isLastTextChild(parentNode, targetNode) {
    const { childNodes } = parentNode;
    for (let i = childNodes.length - 1; i > -1; i--) {
      const childNode = childNodes[i];
      if (childNode.nodeType !== Node.COMMENT_NODE && childNode.textContent) {
        return childNode === targetNode;
      }
    }
    return false;
  }
}
const pangu = new BrowserPangu();
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
    console.log(pangu.spacingText(text));
  } else {
    console.log(usage);
    process.exit(1);
  }
}
function printSpacingFile(path) {
  if (typeof path === "string") {
    console.log(pangu.spacingFileSync(path));
  } else {
    console.log(usage);
    process.exit(1);
  }
}
if (args.length === 0) {
  console.log(usage);
} else {
  switch (args[0]) {
    case "-h":
    case "--help":
      console.log(usage);
      break;
    case "-v":
    case "--version":
      console.log(pangu.version);
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
