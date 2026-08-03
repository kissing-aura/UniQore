
(function(){
  'use strict';

  var card  = document.getElementById('c1card'),
      stage = document.getElementById('c1stage'),
      src   = document.getElementById('c1src'),
      spine = document.getElementById('c1spine'),
      form  = document.getElementById('c1form'),
      r1    = document.getElementById('c1r1'),
      r2    = document.getElementById('c1r2'),
      v1    = document.getElementById('c1v1'),
      v2    = document.getElementById('c1v2'),
      btn   = document.getElementById('c1btn'),
      cur   = document.getElementById('c1cur'),
      ring  = document.getElementById('c1ring'),
      conv  = document.getElementById('c1conv'),
      hit   = document.getElementById('c1hit');

  if (!card) return;

  var NAME  = 'Виталий',
      DIG   = '79132041108',
      PHONE = '+7 913 204-11-08';

  var REDUCE = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  /* таймеры: всё состояние доезжает даже если rAF заморожен */
  var timers = [];
  function later(fn, ms){ var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearAll(){ for (var i=0;i<timers.length;i++) clearTimeout(timers[i]); timers = []; }

  /* маска телефона: разделители подставляются сами */
  function fmt(n){
    var out = '';
    for (var i=0;i<n;i++){
      out += DIG.charAt(i);
      if (i === 0) out = '+' + out + ' ';
      else if (i === 3) out += ' ';
      else if (i === 6) out += '-';
      else if (i === 8) out += '-';
    }
    return out;
  }

  /* easing */
  function easeInOutCubic(t){ return t<.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  function easeOutQuad(t){ return 1 - (1-t)*(1-t); }
  function outBack(t){ var s = .13; t -= 1; return t*t*((s+1)*t + s) + 1; }

  /* курсор по квадратичной дуге */
  var pos = [-26,-26], token = 0;

  function paint(x, y){
    pos[0] = x; pos[1] = y;
    cur.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
  }

  function glide(to, dur, bow, ease, cb){
    var x0 = pos[0], y0 = pos[1], x1 = to[0], y1 = to[1],
        dx = x1-x0, dy = y1-y0,
        len = Math.sqrt(dx*dx + dy*dy) || 1,
        cx = (x0+x1)/2 - dy/len*bow,
        cy = (y0+y1)/2 + dx/len*bow,
        mine = ++token, t0 = 0, fin = false;

    function finish(){
      if (fin || mine !== token) return;
      fin = true; paint(x1, y1); if (cb) cb();
    }
    function frame(ts){
      if (fin || mine !== token) return;
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      if (p >= 1) { finish(); return; }
      var u = ease(p), m = 1-u;
      paint(m*m*x0 + 2*m*u*cx + u*u*x1, m*m*y0 + 2*m*u*cy + u*u*y1);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    later(finish, dur + 90);          /* страховка: фоновая вкладка */
  }

  /* точка внутри сцены */
  function pt(el, fx, fy){
    var s = stage.getBoundingClientRect(), b = el.getBoundingClientRect();
    return [b.left - s.left + b.width*fx, b.top - s.top + b.height*fy];
  }

  /* спина структуры */
  function fill(v, dur){
    spine.style.transitionProperty = 'transform';
    spine.style.transitionDuration = dur + 'ms';
    spine.style.transitionTimingFunction = 'cubic-bezier(.22,1,.28,1)';
    spine.style.transform = 'scaleY(' + v + ')';
  }

  /* печать с плавающей скоростью */
  function typeName(cb){
    var i = 0;
    (function step(){
      v1.textContent = NAME.slice(0, ++i);
      if (i < NAME.length) later(step, 52 + Math.random()*63);
      else if (cb) later(cb, 0);
    })();
  }
  function typePhone(cb){
    var n = 0;
    (function step(){
      v2.textContent = fmt(++n);
      if (n < 11){
        var brk = (n===1 || n===4 || n===7 || n===9);
        later(step, brk ? 120 + Math.random()*68 : 44 + Math.random()*36);
      } else if (cb) later(cb, 0);
    })();
  }

  /* состояния */
  function reset(){
    clearAll(); token++;
    card.classList.add('c1-noanim');

    src.style.opacity = '0'; src.style.transform = 'translateX(-5px)';
    conv.style.opacity = '0'; conv.classList.remove('done');
    hit.style.opacity = '0'; hit.style.transform = 'translateY(4px)';

    spine.style.transitionDuration = '0ms';
    spine.style.transform = 'scaleY(0)';

    r1.classList.remove('focus','typing','done');
    r2.classList.remove('focus','typing','done');
    v1.textContent = ''; v2.textContent = '';
    form.classList.remove('lock');
    btn.classList.remove('ready','press','done');

    ring.classList.remove('go');
    cur.classList.remove('press');
    cur.style.opacity = '0';
    paint(-26,-26);

    void card.offsetWidth;                 /* сбросить переходы одним кадром */
    card.classList.remove('c1-noanim');
  }

  var settled = false;
  /* Аварийный доводчик. Срабатывает, только если сцена не доиграла сама
     (фоновая вкладка режет и rAF, и таймеры). Сначала гасит остаток
     цепочки — иначе отложенная печать перезапишет готовый результат. */
  function finalize(){
    if (settled) return;
    settled = true;
    clearAll(); token++;

    /* доводим без переходов: в скрытой вкладке кадров нет и анимация
       всё равно не проиграется — состояние должно быть верным сразу */
    card.classList.add('c1-noanim');

    if (stage.offsetWidth > 60){
      var s = stage.getBoundingClientRect(), b = btn.getBoundingClientRect();
      cur.style.opacity = '1';
      paint(b.left - s.left + b.width*.55, b.top - s.top + b.height*.9);
    } else {
      cur.style.opacity = '0';
    }
    v1.textContent = NAME; v2.textContent = PHONE;
    r1.classList.remove('focus','typing'); r1.classList.add('done');
    r2.classList.remove('focus','typing'); r2.classList.add('done');
    fill(1, 0);
    btn.classList.remove('press'); btn.classList.add('ready','done');
    form.classList.add('lock');
    src.style.opacity = ''; src.style.transform = '';
    conv.style.opacity = ''; conv.classList.add('done');
    hit.style.opacity = ''; hit.style.transform = '';

    void card.offsetWidth;
    card.classList.remove('c1-noanim');
  }

  /* сцена */
  function play(){
    reset();
    settled = false;
    if (card.classList.contains('play') === false) card.classList.add('play');

    if (REDUCE){ finalize(); return; }

    var w = stage.offsetWidth;
    if (!w || w < 60){ finalize(); return; }   /* нечего измерять — сразу итог */

    var pScan = [Math.round(w*0.66), 31],
        p1 = pt(r1, .40, .50),
        p2 = pt(r2, .52, .50),
        pB = pt(btn, .44, .54),
        pB2 = [pB[0] + 9, pB[1] - 2];

    /* аварийная страховка на весь эпизод */
    later(finalize, 7600);

    cur.style.opacity = '1';
    paint(-18, -14);
    later(function(){ src.style.opacity = ''; src.style.transform = ''; }, 90);

    /* 1 · пришёл и осмотрелся */
    later(function(){
      glide(pScan, 720, 20, easeInOutCubic, function(){

        /* 2 · структура забирает его в первое поле */
        later(function(){
          glide(p1, 400, -13, outBack, function(){
            later(function(){
              r1.classList.add('focus');
              fill(.28, 420);
              later(function(){
                r1.classList.add('typing');
                typeName(function(){
                  r1.classList.remove('typing');

                  /* 3 · поле проверено на вводе, каретка ещё в нём —
                        фокус уходит только когда курсор доедет до второго поля */
                  later(function(){ r1.classList.add('done'); }, 155);
                  later(function(){
                    glide(p2, 320, 11, outBack, function(){
                      r1.classList.remove('focus');
                      later(function(){
                        r2.classList.add('focus');
                        fill(.60, 380);
                        later(function(){
                          r2.classList.add('typing');
                          typePhone(function(){
                            r2.classList.remove('typing');

                            /* 4 · форма собрана — кнопка оживает сама,
                                  курсор в этот момент ещё стоит у поля */
                            later(function(){
                              r2.classList.add('done');
                              btn.classList.add('ready');
                              fill(.86, 460);
                            }, 170);

                            /* 5 · подход к кнопке и доводка прицела */
                            later(function(){
                              glide(pB, 420, 15, outBack, function(){
                                later(function(){
                                  glide(pB2, 150, 0, easeOutQuad, function(){

                                    /* 6 · нажатие — фокус уходит из поля именно здесь */
                                    later(function(){
                                      r2.classList.remove('focus');
                                      cur.classList.add('press');
                                      btn.classList.add('press');
                                      var s = stage.getBoundingClientRect(),
                                          b = btn.getBoundingClientRect();
                                      ring.style.setProperty('--rx',
                                        (b.left - s.left + b.width/2 - 17).toFixed(1) + 'px');
                                      ring.style.setProperty('--ry',
                                        (b.top - s.top + b.height/2 - 17).toFixed(1) + 'px');
                                      ring.classList.remove('go');
                                      void ring.offsetWidth;
                                      ring.classList.add('go');
                                    }, 95);

                                    /* 7 · отпустил — отправлено */
                                    later(function(){
                                      btn.classList.remove('press');
                                      btn.classList.add('done');
                                      cur.classList.remove('press');
                                      fill(1, 520);
                                    }, 230);

                                    later(function(){ form.classList.add('lock'); }, 330);

                                    /* 8 · рука уводит курсор, счёт визита сходится */
                                    later(function(){
                                      glide([pB2[0] + 17, pB2[1] + 15], 560, 7, easeInOutCubic);
                                    }, 420);

                                    later(function(){
                                      hit.style.opacity = ''; hit.style.transform = '';
                                      conv.classList.add('done');
                                      settled = true;
                                    }, 520);

                                  });
                                }, 235);
                              });
                            }, 340);

                          });
                        }, 120);
                      }, 110);
                    });
                  }, 165);

                });
              }, 135);
            }, 115);
          });
        }, 195);

      });
    }, 60);

    later(function(){ conv.style.opacity = ''; }, 260);
  }

  /* синхронный сброс до первой отрисовки — вёрстка без JS остаётся читаемой */
  reset();

  window.playCard1 = play;

  /* страховка: если общий скрипт не отработал и .play так и не пришёл —
     карточка встаёт в финал без анимации, пустой формы не остаётся */
  setTimeout(function(){
    if (!card.classList.contains('play')) finalize();
  }, 6000);
})();


(function(){
  var card = document.getElementById('c2');
  if (!card) return;

  var elRatio = document.getElementById('c2-ratio'),
      elLeads = document.getElementById('c2-leads'),
      elSpend = document.getElementById('c2-spend'),
      elEarn  = document.getElementById('c2-earn');

  var NB = ' ';                                   /* неразрывный пробел в разрядах */
  /* накопленные значения по неделям — те же, что рисуют колонки */
  var SPEND = ['8'+NB+'000','16'+NB+'000','24'+NB+'000','32'+NB+'000','40'+NB+'000','48'+NB+'000'],
      EARN  = ['11'+NB+'000','31'+NB+'000','56'+NB+'000','86'+NB+'000','121'+NB+'000','163'+NB+'000'],
      RATIO = ['×1,4','×1,9','×2,3','×2,7','×3,0','×3,4'],
      LEADS = [3,10,18,27,37,47];

  function plural(n){
    var d = n % 10, h = n % 100;
    if (d === 1 && h !== 11) return 'заявка';
    if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return 'заявки';
    return 'заявок';
  }
  function week(i){
    elSpend.textContent = SPEND[i] + ' ₽';
    elEarn.textContent  = EARN[i]  + ' ₽';
    elRatio.textContent = RATIO[i];
    elLeads.textContent = LEADS[i] + ' ' + plural(LEADS[i]) + ' · 6 недель';
  }
  function finish(){ week(5); }

  card.classList.add('c2-live');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (reduce){
    finish();
    window.playCard2 = finish;
    return;
  }

  function reset(){
    elSpend.textContent = '0 ₽';
    elEarn.textContent  = '0 ₽';
    elRatio.textContent = '×0,0';
    elLeads.textContent = '0 заявок · 6 недель';
  }
  reset();

  var timers = [];
  function T(fn, ms){ timers.push(setTimeout(fn, ms)); }
  function stop(){ for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]); timers = []; }

  /* Страховка от пустой панели: .c2-live уже спрятал колонки, а .play может
     не прийти (не сработал наблюдатель, отключился общий скрипт).
     Через 6 с просто снимаем .c2-live — карточка мгновенно в финале. */
  var guard = setTimeout(function(){
    if (!card.classList.contains('play')){ card.classList.remove('c2-live'); finish(); }
  }, 6000);

  /* Запуск: общий скрипт ставит .play и зовёт playCard2(). */
  window.playCard2 = function(){
    clearTimeout(guard);
    card.classList.add('c2-live');
    stop(); reset();
    if (!card.classList.contains('play')) card.classList.add('play');
    for (var i = 0; i < 6; i++){
      (function(i){ T(function(){ week(i); }, 880 + i * 205); })(i);
    }
    /* доводчик: таймеры в фоновой вкладке троттлятся — итог выставляем безусловно */
    T(finish, 2600);
  };
})();


(function(){
  var card  = document.getElementById('card3'),
      chip  = document.getElementById('c3chip'),
      dot   = document.getElementById('c3dot'),
      fork  = document.getElementById('c3fork'),
      rTr   = document.getElementById('c3railTr'),
      rTg   = document.getElementById('c3railTg'),
      rCrm  = document.getElementById('c3railCrm'),
      tg    = document.getElementById('c3tg'),
      crm   = document.getElementById('c3crm'),
      sum   = document.getElementById('c3sum'),
      cn    = document.getElementById('c3cn'),
      clock = document.getElementById('c3clock'),
      scene = document.getElementById('c3');

  if (!card) return;

  var TOTAL = 0.40,          /* итоговая задержка, с   */
      DUR   = 815,           /* её экранная длительность, мс */
      T = [], gen = 0, clockFin = null;

  function at(fn, ms){ T.push(setTimeout(fn, ms)); }
  function stop(){ for (var i = 0; i < T.length; i++) clearTimeout(T[i]); T = []; }
  function fmt(v){ return v.toFixed(2).replace('.', ',') + ' с'; }

  /* читаем настройку каждый раз: её могут переключить уже после загрузки */
  function reduced(){
    return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* конечное состояние = разметка по умолчанию */
  function settle(){
    scene.classList.remove('armed');
    chip.classList.add('on');
    dot.classList.remove('hot');
    rTr.classList.add('lit'); rTg.classList.add('lit'); rCrm.classList.add('lit');
    fork.classList.remove('go-tr','go-tg','go-crm');
    tg.classList.add('uq-hit'); crm.classList.add('uq-hit');
    sum.classList.add('full'); cn.textContent = '2';
    clock.classList.add('done'); clock.textContent = fmt(TOTAL);
  }

  /* взвести сцену */
  function arm(){
    scene.classList.add('armed');
    chip.classList.remove('on');
    dot.classList.remove('hot');
    rTr.classList.remove('lit'); rTg.classList.remove('lit'); rCrm.classList.remove('lit');
    fork.classList.remove('go-tr','go-tg','go-crm');
    tg.classList.remove('uq-hit'); crm.classList.remove('uq-hit');
    sum.classList.remove('full'); cn.textContent = '0';
    clock.classList.remove('done'); clock.textContent = fmt(0);
    void card.offsetWidth;      /* сброс, чтобы keyframes отыгрались повторно */
  }

  /* секундомер: rAF для плавности + дубль по таймеру (фоновая вкладка) */
  function runClock(g){
    var t0 = 0, done = false;
    clockFin = function(){
      if (done || g !== gen) return;
      done = true;
      clock.textContent = fmt(TOTAL);
    };
    function frame(ts){
      if (done || g !== gen) return;
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / DUR);
      clock.textContent = fmt(TOTAL * p);
      if (p < 1) requestAnimationFrame(frame); else clockFin();
    }
    requestAnimationFrame(frame);
    at(clockFin, DUR + 160);
  }

  window.playCard3 = function(){
    stop();
    gen++;
    if (reduced()){ settle(); return; }
    var g = gen;
    arm();

    at(function(){ chip.classList.add('on'); }, 130);

    /* отправка: точка вспыхивает, сигнал уходит по стволу, секундомер пошёл */
    at(function(){
      dot.classList.add('hot');
      fork.classList.add('go-tr');
      runClock(g);
    }, 400);

    /* развилка: один сигнал стал двумя, с разной скоростью */
    at(function(){ rTr.classList.add('lit'); fork.classList.add('go-tg'); }, 522);
    at(function(){ fork.classList.add('go-crm'); }, 534);

    /* 0,20 с — Telegram */
    at(function(){
      rTg.classList.add('lit');
      tg.classList.add('uq-hit');
      cn.textContent = '1';
    }, 807);

    /* 0,40 с — CRM, секундомер замирает на этом же значении */
    at(function(){
      rCrm.classList.add('lit');
      crm.classList.add('uq-hit');
      cn.textContent = '2';
      sum.classList.add('full');
      if (clockFin) clockFin();
      clock.classList.add('done');
    }, 1215);

    /* обе копии на месте — источнику больше нечего держать */
    at(function(){ dot.classList.remove('hot'); }, 1560);
  };

  /* В сборке карточка ждёт своей очереди в цепочке, поэтому взводим её сразу:
     иначе до своего шага она стояла бы в финале и потом прыгала в начало. */
  if (!reduced()) arm();

  /* страховка, как у 02: если .play так и не пришёл — финал без анимации */
  setTimeout(function(){
    if (!card.classList.contains('play')) settle();
  }, 6000);
})();


(function(){
  var card    = document.getElementById('card4'),
      numWe   = document.getElementById('c4-numWe'),
      numThey = document.getElementById('c4-numThey'),
      timeThey= document.getElementById('c4-timeThey'),
      curWe   = document.getElementById('c4-curWe'),
      curThey = document.getElementById('c4-curThey'),
      winThey = document.getElementById('c4-winThey'),
      stWe    = document.getElementById('c4-stWe'),
      stThey  = document.getElementById('c4-stThey'),
      xBtn    = document.getElementById('c4-x'),
      ring    = document.getElementById('c4-ring'),
      btn     = card && card.querySelector('.c4-btn');

  if (!card) return;

  var timers = [];
  function later(fn, ms){ timers.push(setTimeout(fn, ms)); }
  function clearAll(){ for (var i=0;i<timers.length;i++) clearTimeout(timers[i]); timers = []; }

  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function sec(v){ return v.toFixed(1).replace('.', ',') + ' c'; }

  /* секундомер: rAF + обязательная страховка таймером —
     в фоновой вкладке rAF замораживается, финал должен дойти всё равно */
  function clock(el, to, dur, delay, onEnd){
    var done = false, t0 = 0;
    function fin(){
      if (done) return;
      done = true;
      el.textContent = sec(to);
      if (onEnd) onEnd();
    }
    later(function(){
      function frame(ts){
        if (done) return;
        if (!t0) t0 = ts;
        var p = (ts - t0) / dur;
        if (p >= 1) { fin(); return; }
        el.textContent = sec(to * p);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      later(fin, dur + 140);
    }, delay);
  }

  /* сброс всего, что ведёт JS. CSS-состояния сбрасывает снятие .play */
  function reset(){
    clearAll();
    card.classList.add('c4-nofx');      /* откат мёртвого окна — без обратной анимации */
    card.classList.remove('c4-won','c4-final');
    btn.classList.remove('c4-hot');
    curWe.classList.remove('c4-go');
    curThey.classList.remove('c4-drift','c4-tox');
    winThey.classList.remove('c4-dead');
    timeThey.classList.remove('c4-cut');
    xBtn.classList.remove('c4-x--on');
    ring.classList.remove('c4-pop');
    stWe.classList.remove('c4-on');
    stThey.classList.remove('c4-on');
    void card.offsetWidth;              /* фиксируем чистое состояние одним кадром */
    card.classList.remove('c4-nofx');
  }

  /* финальный кадр — для prefers-reduced-motion и для аварийной страховки */
  function finalFrame(){
    numWe.textContent   = sec(0.8);
    numThey.textContent = sec(3.0);
    card.classList.add('c4-won');
    winThey.classList.add('c4-dead');
    timeThey.classList.add('c4-cut');
    stWe.classList.add('c4-on');
    stThey.classList.add('c4-on');
  }

  function leaves(){                       /* человек закрывает вкладку */
    ring.classList.remove('c4-pop'); void ring.offsetWidth; ring.classList.add('c4-pop');
    winThey.classList.add('c4-dead');
    timeThey.classList.add('c4-cut');
    later(function(){ stThey.classList.add('c4-on'); }, 190);
    later(function(){ card.classList.add('c4-won'); }, 120);   /* рамка нашего окна теплеет */
  }

  window.playCard4 = function(){
    reset();
    card.classList.add('play');          /* страховка: без .play сцена осталась бы пустой */
    if (RM){ finalFrame(); return; }

    numWe.textContent = sec(0); numThey.textContent = sec(0);

    /* наш: страница готова — секундомер останавливается сам */
    clock(numWe, 0.8, 800, 100);

    /* наш посетитель доезжает до кнопки и остаётся на ней */
    later(function(){ curWe.classList.add('c4-go'); }, 1000);
    later(function(){ btn.classList.add('c4-hot'); }, 1600);
    later(function(){ stWe.classList.add('c4-on'); }, 1800);

    /* их посетитель: скука → нетерпение → крестик */
    later(function(){ curThey.classList.add('c4-drift'); }, 2150);
    later(function(){ xBtn.classList.add('c4-x--on'); }, 2520);
    later(function(){ curThey.classList.remove('c4-drift'); curThey.classList.add('c4-tox'); }, 2560);

    /* их секундомер не финиширует, а обрывается — уход следует из ожидания */
    clock(numThey, 3.0, 2900, 100, leaves);
  };

  /* страховка: если .play так и не пришёл — статичный финальный кадр,
     без ползущей полосы и без крутящегося спиннера */
  setTimeout(function(){
    if (card.classList.contains('play')) return;
    card.classList.add('c4-final','play');
    finalFrame();
  }, 6000);
})();


(function(){
  var grid  = document.getElementById('grid');
  if (!grid) return;
  var cards = [].slice.call(grid.querySelectorAll('.uq-card'));
  var STEP  = 750;
  var queued = [];                         /* отложенные шаги цепочки */

  function play(card){
    var i = +card.dataset.i;
    /* снять и вернуть .play одним кадром — иначе CSS-переходы и keyframes
       карточек 02 и 04 не перезапустятся при повторе */
    card.classList.remove('play');
    void card.offsetWidth;
    card.classList.add('play');
    var fn = window['playCard' + (i + 1)];
    if (typeof fn === 'function') fn();
  }

  function chain(){
    for (var i = 0; i < queued.length; i++) clearTimeout(queued[i]);
    queued = [];
    cards.forEach(function(c, i){
      queued[i] = setTimeout(function(){ play(c); }, i * STEP);
    });
  }

  var started = false;
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      for (var i = 0; i < es.length; i++){
        if (es[i].isIntersecting && !started){ started = true; io.disconnect(); chain(); }
      }
    }, {threshold:.3});
    io.observe(grid);
  } else {
    chain();
  }

  /* повтор по наведению: свой шаг цепочки снимаем, чтобы карточка
     не дёрнулась второй раз и повтор не выглядел сломанным */
  cards.forEach(function(c){
    c.addEventListener('mouseenter', function(){
      var i = +c.dataset.i;
      if (queued[i]) { clearTimeout(queued[i]); queued[i] = null; }
      play(c);
    });
  });

  /* для ручной проверки в консоли */
  window.__playCard = play;
  window.__chain = chain;
})();
