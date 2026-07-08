// демо-витрина: каждая загрузка — чистый старт, данные посетителей не копятся
(function(){
  try { localStorage.removeItem('uqcmd_v5'); } catch(e) {}
})();
// демо: не даём localStorage.setItem падать при переполнении
(function(){
  var proto = Storage.prototype, orig = proto.setItem;
  proto.setItem = function(k, v){
    try { return orig.call(this, k, v); } catch(e) { /* quota — молча игнорируем в демо */ }
  };
})();
