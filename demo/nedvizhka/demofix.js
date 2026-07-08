/* демо-витрина: каждая загрузка — чистый старт, данные посетителей не копятся */
(function () {
  try {
    var PREFIX = 'kvartalR9_';
    var toRemove = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(PREFIX) === 0) toRemove.push(k);
    }
    toRemove.forEach(function (k) { localStorage.removeItem(k); });
  } catch (e) {}
})();
/* глушим ошибки переполнения localStorage (персистенс не критичен для демо) */
(function () {
  try {
    var orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { try { return orig.call(this, k, v); } catch (e) { /* quota — молча */ } };
  } catch (e) {}
})();
