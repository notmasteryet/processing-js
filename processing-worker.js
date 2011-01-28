
function _addEventListener(name, func, hook) {
  var listeners = this._listeners;
  if (!listeners[name]) {
    listeners[name] = [];
  }
  listeners[name].push(func);
};
function _removeEventListener(name, func, hook) {
  var listeners = this._listeners;
  if (!listeners[name]) {
    return;
  }
  var i = listeners[name].indexOf(func);
  if (i < 0) {
    return;
  }
  listeners[name].splice(i, 1);
};

var window = {
  _listeners : {},
  addEventListener : _addEventListener,
  removeEventListener : _removeEventListener
};
var document = {
  _listeners : {},
  view : {},
  createElement : function(tagName) {
    switch (tagName) {
    case "canvas":
      return { getContext: function() { return {}; } };
    case "p":
      return { style: {}, offsetWidth: 0 };
    case "style":
      return {};
    default:
      throw "$$ Cannot create " + tagName;
    }
  },
  getElementsByTagName : function (tagName) {
    switch (tagName) {
    case "body":
      return [{ appendChild: function() { }, removeChild: function() {} }];
    default:
      throw "$$ Cannot locate " + tagName;
    }    
  },
  documentElement : { style: {} },
  addEventListener : _addEventListener,
  removeEventListener : _removeEventListener
};

function _definePropertyWrapper(obj, propertyName, actionId, canvasId, initValue) {
  Object.defineProperty(obj, propertyName, {
    get: function () { return initValue },
    set: function (value) {
      initValue = value;
      postMessage({type:actionId, canvas: canvasId, value: value});
    }
  });
}

function Canvas(descriptor) {
  _definePropertyWrapper(this, "width", "canvas.width", descriptor.id, descriptor.width);
  _definePropertyWrapper(this, "height", "canvas.height", descriptor.id, descriptor.height);
  this.style = {
    setProperty : function() {}
  };
  this._listeners = {};
  this.addEventListener = _addEventListener;
  this.removeEventListener = _removeEventListener;
  this.context = {
    save: function() {},
    restore: function() {},
    translate: function() {},
    setTransform: function() {}
  };
  this.getContext = function(type) { return this.context; };
}

var p;
function createNewInstance(canvas, code) {
  try {
    p = new Processing(new Canvas(canvas), "__setupRemoting(arguments[0]);\n" + code);
  } catch(e) {
    postMessage({type:"log.print", message: e.toString() });
//    postMessage({type:"log.print", message: e.message + " @" + e.lineNumber });
  }
}

addEventListener("message", function(d) {
  switch(d.data.type) {
  case "Processing":
    break;
  case "new":
    createNewInstance(d.data.canvas, d.data.code);
    break;
  }
}, false);

try
{
  importScripts("processing.js");

  Processing.logger = {
    log: function(message) {
      postMessage({type: "log.print", message: message});
    }
  };
}
catch(e)
{
    postMessage({type: "log.print", message: "Init error: " + e.message});
}

function __forwardToParent(func, args) {
  var ar = [];
  for (var i = 0, l = args.length; i < l; ++i) {
    ar[i] = args[i];
  }
  postMessage({type:"forward", func: func, args: ar});
}


function __setupRemoting(p) {
  var forwarded = "shapeMode, cursor, noCursor, link, beginDraw, endDraw, disableContextMenu, enableContextMenu, status, ambientLight, directionalLight, lightFalloff, lightSpecular, lights, pointLight, noLights, spotLight, beginCamera, endCamera, camera, perspective, frustum, ortho, printProjection, printCamera, box, sphereDetail, sphere, modelX, modelY, modelZ, ambient, emissive, shininess, specular, screenX, screenY, screenZ, fill, noFill, stroke, noStroke, strokeWeight, strokeCap, strokeJoin, smooth, noSmooth, point, beginShape, vertex, endShape, bezierVertex, texture, textureMode, curveVertex, curve, curveTightness, curveDetail, rectMode, imageMode, ellipseMode, arc, line, bezier, bezierDetail, bezierPoint, bezierTangent, curvePoint, curveTangent, triangle, quad, rect, ellipse, normal, set, hint, background, image, clear, tint, noTint, copy, blend, filter, shared, filter_new_scanline, filter_bilinear, blit_resize, textFont, textSize, textAlign, textWidth, textLeading, textAscent, textDescent, glyphLook, text, textMode".split(/,\s+/g);

  function createForwardProxy(func) {
    return (function() {
      __forwardToParent(func, arguments);
    });
  }

  for (var i = 0; i < forwarded.length; ++i) {
    p[forwarded[i]] = createForwardProxy(forwarded[i]);
  }

  // proxy: size, loadShape, loadImage, requestImage, createImage, createGraphics, loadFont, createFont, PFont, PImage, shape
  p.size = function(width, height) {
    p.width = width;
    p.height = height;
    __forwardToParent("size", arguments);
  };

  //forbiden: get, pixels, 
  p.get = function() { throw "Not supported in worker"; };
}

/*
safe: externals, name, use3DContext, focused, pmouseX, pmouseY, mouseX, mouseY, mouseButton, mouseScroll, mouseClicked, mouseDragged, mouseMoved, mousePressed, mouseReleased, mouseScrolled, key, keyCode, keyPressed, keyReleased, keyTyped, draw, setup, __mousePressed, __keyPressed, __frameRate, 
frameCount, width, height, defineProperty, Character, PShape, PShapeSVG, XMLElement, PMatrix2D, PMatrix3D, PMatrixStack, split, splitTokens, 
append, concat, sort, splice, subset, join, shorten, expand, arrayCopy, reverse, mix, peg, modes, color, brightness, saturation, hue, red, green, blue, alpha, lerpColor, defaultColor, colorMode, blendColor, printMatrix, translate, scale, pushMatrix, popMatrix, resetMatrix, applyMatrix, rotateX, rotateZ, rotateY, rotate, pushStyle, popStyle, year, month, day, hour, minute, second, millis, redraw, noLoop, loop, frameRate, exit, binary, unbinary, nf, nfs, nfp, nfc, hex, unhex, loadStrings, loadBytes, matchAll, match, console, str, trim, boolean, byte, char, float, int, __int_cast, abs, ceil, constrain, dist, exp, floor, lerp, log, mag, map, max, min, norm, pow, round, sq, sqrt, acos, asin, atan, atan2, cos, degrees, radians, sin, tan, random, randomSeed, Random, noise, noiseDetail, noiseSeed, imageData, extendClassChain, addMethod, createJavaArray, intersect, print, println

undecided: breakShape, glyphTable, Import, saveStrings, save, saveFrame, loadGlyphs,loadPixels,updatePixels, 

forbiden: get, pixels, updatePixels, loadPixels,

*/
