class B {
  class D extends A {}
  static A a = new A();
}
class A {}
class B1 { class D extends A {} }

B b = new B();
B1 b1 = new B1();

_checkTrue(true);
