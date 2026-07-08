/* демо-витрина: глушим ошибки переполнения localStorage (персистенс не критичен для демо) */
(function () {
  try {
    var orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { try { return orig.call(this, k, v); } catch (e) { /* quota — молча */ } };
  } catch (e) {}
})();
