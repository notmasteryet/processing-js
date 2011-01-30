var workerScriptUrl = ((function() {
  var lastDOMElement = document.body ? document.body :
    document.getElementsByTagName("head")[0];
  while (lastDOMElement.lastChild) {
    lastDOMElement = lastDOMElement.lastChild;
  }
  var url = lastDOMElement.src;
  return url.substring(0, url.lastIndexOf('/') + 1) + "processing-worker.js";
})());

function RemoteProcessing(canvas, code) {
  var nextInstanceId = RemoteProcessing.instances.length;
  var p = new Processing(canvas, attach);
  this.instance = p;
  this.instanceId = nextInstanceId;

  function keyEventForward(func) {
    RemoteProcessing.postMessage({
      type: "keyForward", func: func, instance: nextInstanceId, key: p.key, keyCode: p.keyCode, keyPressed: p.__keyPressed
    });
  }
  function mouseEventForward(func) {
    RemoteProcessing.postMessage({
      type: "mouseForward", func: func, instance: nextInstanceId, 
      pmouseX: p.mouseX, pmouseY: p.pmouseY, mouseX: p.mouseX, mouseY: p.mouseY,
      mouseButton: p.mouseButton, mousePressed: p.__mousePressed, mouseDragging: p.mouseDragging, mouseScroll: p.mouseScroll
    });
  }
  function attach(p) {
    p.keyPressed = function() {
      keyEventForward("keyPressed");
    };
    p.keyReleased = function() {
      keyEventForward("keyReleased");
    };
    p.keyTyped = function() {
      keyEventForward("keyTyped");
    };
    p.mouseMoved = function() {
      mouseEventForward("mouseMoved");
    };
    p.mouseClicked = function() {
      mouseEventForward("mouseClicked");
    };
    p.mousePressed = function() {
      mouseEventForward("mousePressed");
    };
    p.mouseReleased = function() {
      mouseEventForward("mouseReleased");
    };
    p.mouseDragged = function() {
      mouseEventForward("mouseDragged");
    };
    p.mouseScrolled = function() {
      mouseEventForward("mouseScrolled");
    };
  }

  RemoteProcessing.instances[nextInstanceId] = p;
  RemoteProcessing.postMessage({
    type:"new", instance: nextInstanceId, code: code,
    canvas: { width: p.width, height: p.height, }
  });
}

function __updatePixels(p, pixels) {
  p.loadPixels();
  for (var i = 0, l = pixels.length; i < l; ++i) {
    if (pixels[i] !== void(0)) {
      p.imageData.data[i] = pixels[i];
    }
  }
  p.updatePixels();
}

var __images = [];
function __loadImage(p, instanceId, imageId, src) {
  var img = p.loadImage(src, "", function() {
    RemoteProcessing.postMessage({
      type:"updateImage", instance: instanceId, image: imageId,
      width: img.width, height: img.height, 
      data: img.imageData, isRemote: img.isRemote
    });
  });
  __images[imageId] = img;
}

RemoteProcessing.instances = [];
RemoteProcessing.worker = ((function() {
  var w = new Worker(workerScriptUrl);
  w.addEventListener("message", function(e) {
    for (var i = 0, l = e.data.length; i < l; ++i) {
      var data = e.data[i];
      var p = data.instance !== void(0)? RemoteProcessing.instances[data.instance] : null;
      switch(data.type) {
      case "log.print":
         Processing.logger.log(data.message);
         break;
      case "forward":
         p[data.func].apply(p, data.args);
         break;
      case "updatePixels":
         __updatePixels(p, data.data);
         break;
      case "loadImage":
         __loadImage(p, data.instance, data.image, data.src);
         break;
      case "updateImage":
         __updateImage(p, data.image, data.data);
         break;
      case "image":
         var args = data.args;
         args[0] = __images[args[0]];
         p.image.apply(p, args);
         break;
      default:
         throw "Not implemented";
      }
    }
  }, false);
  w.postMessage([{type:"Processing"}]);
  return w;
})());
RemoteProcessing.postMessage = ((function() {
  var queue = [];
  function flushMessages() {
    if (queue.length === 0) return;
    RemoteProcessing.worker.postMessage(queue);
    queue = [];
  }
  setInterval(flushMessages, 20);
  return function(message) {
    queue.push(message);
    if (queue.length > 100) {
      flushMessages();
    }
  };
})());

