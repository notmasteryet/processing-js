float[] obj = {1.0, 2.0 };

HashMap m = new HashMap();
m.put("test", "1");
m.put("test2", obj);

_checkEqual(2, m.size());
_checkFalse(m.isEmpty());

_checkEqual("1", m.get("test"));
_checkEqual(obj, m.get("test2"));
_checkIsNull(m.get("test3"));

m.remove("test");
_checkEqual(1, m.size());

m.remove("test");
_checkEqual(1, m.size());

m.clear();
_checkEqual(0, m.size());
_checkTrue(m.isEmpty());

m.put(map, map);
_checkEqual(map, m.get(map));

