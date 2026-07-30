/* Аналитика демо-CRM: согласие, GA4, Яндекс.Метрика.
   Вынесено из инлайна в файл: CSP страниц задан как script-src 'self',
   и инлайн-скрипты им блокировались — счётчик не поднимался вообще. */
/* выбор пользователя: 'accept' | 'essential' | null (ещё не решил) */
    window.UQ_CONSENT = (function(){ try { return localStorage.getItem('uq_cookie_v1'); } catch (e) { return null; } })();
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    if (window.UQ_CONSENT === 'accept') {
      var uqGa = document.createElement('script');
      uqGa.async = true; uqGa.src = 'https://www.googletagmanager.com/gtag/js?id=G-RJ67F53962';
      document.head.appendChild(uqGa);
      gtag('js', new Date());
      gtag('config', 'G-RJ67F53962');
    }

window.UQ_MID = /(^|\.)uniqore\.ru$/.test(location.hostname) ? 111003646 : 110585817;
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document,'script','https://mc.yandex.ru/metrika/tag.js?id='+window.UQ_MID, 'ym');

    /* Счётчик визитов, источники и цели работают ВСЕГДА — на них считается реклама.
       Вебвизор (запись действий) и карта кликов — только после явного «Принять». */
    ym(window.UQ_MID, 'init', {ssr:true, webvisor:window.UQ_CONSENT!=='essential', clickmap:window.UQ_CONSENT!=='essential', ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
    /* Сквозная аналитика: ClientID Метрики + первый источник визита — уходят с заявкой в CRM,
       чтобы потом связать продажу с рекламным кликом (офлайн-конверсии). */
    try { ym(window.UQ_MID, 'getClientID', function (id) { window.UQ_CID = id; }); } catch (_) {}
    try {
      var uqP = new URLSearchParams(location.search), uqK = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','yclid','gclid'], uqF = {}, uqAny = false;
      uqK.forEach(function (k) { var v = uqP.get(k) || ''; uqF[k] = v; if (v) uqAny = true; });
      if (uqAny && !sessionStorage.getItem('uq_attr')) sessionStorage.setItem('uq_attr', JSON.stringify(uqF));
    } catch (_) {}
    /* Микроконверсии: клик по телефону → цель call, по Telegram → telegram (в тот же счётчик UQ_MID). */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      var h = a.getAttribute('href') || '';
      if (h.indexOf('tel:') === 0) { try { if (window.ym) ym(window.UQ_MID, 'reachGoal', 'call'); } catch (_) {} try { if (window.gtag) gtag('event', 'contact_phone'); } catch (_) {} }
      else if (/t\.me\//i.test(h)) { try { if (window.ym) ym(window.UQ_MID, 'reachGoal', 'telegram'); } catch (_) {} try { if (window.gtag) gtag('event', 'contact_telegram'); } catch (_) {} }
    }, true);
