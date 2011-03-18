/*@pjs-test libraries="processing.util.js"; */


  size(100,1);

  ArrayList list = new ArrayList();

  list.add(new A(1));
  list.add(new A(6));
  list.add(new A(2));

  Collections.sort(list, new CompA());

  _checkEqual(list.get(0).i, 6);
  _checkEqual(list.get(1).i, 2);
  _checkEqual(list.get(2).i, 1);

  Collections.sort(list);

  _checkEqual(list.get(0).i, 1);
  _checkEqual(list.get(1).i, 2);
  _checkEqual(list.get(2).i, 6);


class A // implements Comparable<A>
{
  int i;

  A(int i) {
    this.i = i;
  }

  int compareTo(A other) {
    return this.i - other.i;
  }

  String toString() {
    return "[" + i + "]";
  }
}

class CompA // implements Comparator<A>
{
  int compare(A x, A y) {
    return y.i - x.i; // reverse order
  }

  boolean equals(A x, A y) {
    return x.i == y.i;
  }
}
