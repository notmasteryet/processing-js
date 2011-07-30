// see ticket 1408
class X {
  /* the following will create dependency for the parser:
     class I extends Y {}  */
  static Y y = new Y();
}
class Y{}

