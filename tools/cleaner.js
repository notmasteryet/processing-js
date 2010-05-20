// Swap escaped bits in code.  See jsshellhelper.py for creation of __escaped_string
function __unescape_string() {
  return __escaped_string.replace(/@DQUOTE@/g, '"').
                          replace(/@SQUOTE@/g, "'").
                          replace(/@NEWLINE@/g, '\n').
                          replace(/@BACKSLASH@/g, '\\');
}

function __unescape_compiled_string() {
  if(typeof(__escaped_compiled_string) === 'undefined') return undefined;
  
  return __escaped_compiled_string.replace(/@DQUOTE@/g, '"').
                          replace(/@SQUOTE@/g, "'").
                          replace(/@NEWLINE@/g, '\n').
                          replace(/@BACKSLASH@/g, '\\');
}
