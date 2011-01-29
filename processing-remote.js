function RemoteProcessing(canvas, code) {
  var nextInstanceId = RemoteProcessing.instances.length;
  var p = new Processing(canvas, attach);
  this.instance = p;
  this.instanceId = nextInstanceId;

  function keyEventForward(func) {
    RemoteProcessing.worker.postMessage({
      type: "keyForward", func: func, instance: nextInstanceId, key: p.key, keyCode: p.keyCode, keyPressed: p.__keyPressed
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
  }

  RemoteProcessing.instances[nextInstanceId] = p;
  RemoteProcessing.worker.postMessage({
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
  var img = p.loadImage(src, void(0), function() {
    RemoteProcessing.worker.postMessage({
      type:"updateImage", instance: nextInstanceId, image: imageId,
      width: img.width, height: img.height, 
      data: img.imageData, isRemote: img.isRemote
    });
  });
  __images[imageId] = img;
}

RemoteProcessing.instances = [];
RemoteProcessing.worker = ((function() {
  var w = new Worker("processing-worker.js");
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
         __loadImage(p, data.id, data.src);
      case "updateImage":
         throw "Not implemented";
      }
    }
  }, false);
  w.postMessage({type:"Processing"});
  return w;
})());


