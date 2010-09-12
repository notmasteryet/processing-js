/* end of includes/parts */

  var ast = parseLalr(processingGrammar, pdeCode);
  var sketch = new Processing.Sketch();
  var compiledPde = compileProcessing(ast);
  sketch.sourceCode = compiledPde;
  return sketch;
};

