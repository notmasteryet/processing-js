var __postMessage = ((function() {
  var queue = []
  function flushMessages() {
    if (queue.length === 0) {
      return;
    }
    postMessage(queue);
    queue = [];
  }
  setInterval(flushMessages, 20);
  return (function(message) {
    queue.push(message);
    if (queue.length > 100) {
      flushMessages();
    }
  });
})());

function _addEventListener(name, func, hook) {
  var listeners = this._listeners;
  if(!listeners) {
    this.__listeners = listeners = {};
  }
  if (!listeners[name]) {
    listeners[name] = [];
  }
  listeners[name].push(func);
};
function _removeEventListener(name, func, hook) {
  var listeners = this.__listeners;
  if (!listeners || !listeners[name]) {
    return;
  }
  var i = listeners[name].indexOf(func);
  if (i < 0) {
    return;
  }
  listeners[name].splice(i, 1);
};

var window = {
  addEventListener : _addEventListener,
  removeEventListener : _removeEventListener
};
var document = {
  view : {},
  createElement : function(tagName) {
    switch (tagName) {
    case "canvas":
      return { getContext: function() { return {}; } };
    case "p":
      return { style: {}, offsetWidth: 0 };
    case "style":
      return {};
    case "img":
      return new Image();
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

function Canvas(descriptor) {
  this.width = descriptor.width;
  this.height = descriptor.height;
  this.style = {
    setProperty : function() {}
  };
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

var __currentInstanceId;
var __instances = [];

function createNewInstance(instanceId, canvas, code) {
  try {
    __currentInstanceId = instanceId;
    var p = new Processing(new Canvas(canvas), "__setupRemoting(arguments[0], " + instanceId + ");\n" + code);
  } catch(e) {
    __postMessage({type:"log.print", message: e.toString() + " @" + e.lineNumber });
  }
}

function keyForward(p, func, key, keyCode, keyPressed) {
  p.key = key;
  p.keyCode = keyCode;
  p.__keyPressed = keyPressed;
  p[func]();
}

function mouseForward(p, func, pmouseX, pmouseY, mouseX, mouseY, mouseButton, mousePressed, mouseDragging, mouseScroll) {
  p.pmouseX = pmouseX;
  p.pmouseY = pmouseY;
  p.mouseX = mouseX;
  p.mouseY = mouseY;
  p.mouseButton = mouseButton;
  p.__mousePressed = mousePressed;
  p.mouseDragging = mouseDragging;
  p.mouseScroll = mouseScroll;
  if (p[func]) {
    p[func]();
  }
}


addEventListener("message", function(e) {
  for (var i = 0, l = e.data.length; i < l; ++i) {
    try {
      var data = e.data[i];
      __currentInstanceId = data.instance;
      var p;
      if (data.instance !== void(0)) { p = __instances[data.instance]; }
      switch(data.type) {
      case "Processing":
        break;
      case "new":
        createNewInstance(data.instance, data.canvas, data.code);
        break;
      case "keyForward":
        keyForward(p, data.func, data.key, data.keyCode, data.keyPressed);
        break;
      case "mouseForward":
        mouseForward(p, data.func, data.pmouseX, data.pmouseY, data.mouseX, data.mouseY, 
          data.mouseButton, data.mousePressed, data.mouseDragging, data.mouseScroll);
        break;
      case "updateImage":
        __images[data.image].__load(data.width, data.height, data.isRemote, data.data);
        break;
      }

    }
    catch(e)
    {
        __postMessage({type:"log.print", message: e.toString() + " @" + e.lineNumber });
    }
  }
}, false);

try
{
  importScripts("processing.js");

  Processing.logger = {
    log: function(message) {
      __postMessage({type: "log.print", message: message});
    }
  };
}
catch(e)
{
    __postMessage({type: "log.print", message: "Processing.js remoting: " + e.message});
}

function __defineProperty(obj, name, desc) {
  if("defineProperty" in Object) {
    Object.defineProperty(obj, name, desc);
  } else {
    if (desc.hasOwnProperty("get")) {
      obj.__defineGetter__(name, desc.get);
    }
    if (desc.hasOwnProperty("set")) {
      obj.__defineSetter__(name, desc.set);
    }
  }
};

var __imageNextId = 0, __images = [];
function Image() {
  var instanceId = __currentInstanceId;
  var src;
  __defineProperty(this, "src", {
    get: function() { return src; },
    set: function(value) { 
      if (src !== value) {
        src = value;
        __postMessage({type:"loadImage", instance: instanceId, image: this.id, src: value});
      }
    }
  });
  __images[__imageNextId] = this;
  this.id = __imageNextId++;
  this.instanceId = instanceId;
  this.__load = function(width, height, isRemote, data) {
    this.width = width;
    this.height = height;
    this.isRemote = isRemote;
    this.imageData = { data: data, width: width, height: height };

    if (this.onload) {
      this.onload();
    }
  };
}

function __forwardToParent(instanceId, func, args) {
  var ar = [];
  for (var i = 0, l = args.length; i < l; ++i) {
    ar[i] = args[i];
  }
  __postMessage({type:"forward", instance: instanceId, func: func, args: ar});
}

function trace(msg) {
__postMessage({type:"log.print", message: "trace: " + msg });
}

function __setupRemoting(p, instanceId) {
  __instances[instanceId] = p;
  var canvas = p.externals.canvas;

  var forwarded = "shapeMode, cursor, noCursor, link, beginDraw, endDraw, disableContextMenu, enableContextMenu, status, ambientLight, directionalLight, lightFalloff, lightSpecular, lights, pointLight, noLights, spotLight, beginCamera, endCamera, camera, perspective, frustum, ortho, printProjection, printCamera, box, sphereDetail, sphere, modelX, modelY, modelZ, ambient, emissive, shininess, specular, screenX, screenY, screenZ, fill, noFill, stroke, noStroke, strokeWeight, strokeCap, strokeJoin, smooth, noSmooth, point, beginShape, vertex, endShape, bezierVertex, texture, textureMode, curveVertex, curve, curveTightness, curveDetail, rectMode, imageMode, ellipseMode, arc, line, bezier, bezierDetail, bezierPoint, bezierTangent, curvePoint, curveTangent, triangle, quad, rect, ellipse, normal, set, hint, background, image, clear, tint, noTint, copy, blend, filter, shared, filter_new_scanline, filter_bilinear, blit_resize, textFont, textSize, textAlign, textWidth, textLeading, textAscent, textDescent, glyphLook, printMatrix, translate, scale, pushMatrix, popMatrix, resetMatrix, applyMatrix, rotateX, rotateZ, rotateY, rotate, pushStyle, popStyle, text, textMode".split(/,\s+/g);

  function createForwardProxy(func) {
    return (function() {
      __forwardToParent(instanceId, func, arguments);
    });
  }

  for (var i = 0; i < forwarded.length; ++i) {
    p[forwarded[i]] = createForwardProxy(forwarded[i]);
  }

  // proxy: size, loadImage, requestImage,loadPixels,updatePixels
  p.size = function(width, height) {
    p.width = width;
    p.height = height;
    __forwardToParent(instanceId, "size", arguments);
  };
  p.PImage.prototype.loadPixels = function() {};
  p.PImage.prototype.updatePixels = function() {
    __postMessage({type:"updateImage", image: this.id, data: this.imageData });
  };
  p.PImage.prototype.fromHTMLImageData = function(img) {
    this.id = img.id;
    this.isRemote = img.isRemote;
    this.width = img.width;
    this.height = img.height;
    this.imageData = img.imageData;
  };
  p.loadPixels = function() { 
    var data = [];
    data.length = p.width * p.height;
    p.imageData = { data: data, width: p.width, height: p.height };
  };
  p.updatePixels = function() {
    __postMessage({type:"updatePixels", instance: instanceId, data: p.imageData.data });
  };
  p.image = function(img) {
    var args = [img.id, arguments[1], arguments[2]];
    if (arguments.length > 3) {
      args.push(arguments[3]); args.push(arguments[4]);
    }
    __postMessage({type:"image", instance: instanceId, args: args});
  };

  //forbiden: get, pixels.getPixel, PImage, createImage
  function notSupported() {
    throw "Not supported in worker for remoting";
  }
  p.get = notSupported;
  p.pixels.getPixel = notSupported;
  p.createImage = notSupported;
  p.PImage = notSupported;
}

/*
safe: externals, name, use3DContext, focused, pmouseX, pmouseY, mouseX, mouseY, mouseButton, mouseScroll, mouseClicked, mouseDragged, mouseMoved, mousePressed, mouseReleased, mouseScrolled, key, keyCode, keyPressed, keyReleased, keyTyped, draw, setup, __mousePressed, __keyPressed, __frameRate, 
frameCount, width, height, defineProperty, Character, PShape, PShapeSVG, XMLElement, PMatrix2D, PMatrix3D, PMatrixStack, split, splitTokens, 
append, concat, sort, splice, subset, join, shorten, expand, arrayCopy, reverse, mix, peg, modes, color, brightness, saturation, hue, red, green, blue, alpha, lerpColor, defaultColor, colorMode, blendColor, year, month, day, hour, minute, second, millis, redraw, noLoop, loop, frameRate, exit, binary, unbinary, nf, nfs, nfp, nfc, hex, unhex, loadStrings, loadBytes, matchAll, match, console, str, trim, boolean, byte, char, float, int, __int_cast, abs, ceil, constrain, dist, exp, floor, lerp, log, mag, map, max, min, norm, pow, round, sq, sqrt, acos, asin, atan, atan2, cos, degrees, radians, sin, tan, random, randomSeed, Random, noise, noiseDetail, noiseSeed, imageData, extendClassChain, addMethod, createJavaArray, intersect, print, println

undecided: breakShape, glyphTable, Import, saveStrings, save, saveFrame, loadGlyphs, createGraphics, loadFont, createFont, PFont, shape, loadShape, image
*/
