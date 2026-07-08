// демо: не даём localStorage.setItem падать при переполнении
(function(){
  var proto = Storage.prototype, orig = proto.setItem;
  proto.setItem = function(k, v){
    try { return orig.call(this, k, v); } catch(e) { /* quota — молча игнорируем в демо */ }
  };
})();
