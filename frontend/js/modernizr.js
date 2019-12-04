/*eslint-disable */
/* [Internationalization API] */
global.Modernizr = (function(e, n, t) {
  function r(e, n) {
    return typeof e === n;
  }
  function o() {
    var e, n, t, o, i, s, a;
    for (var f in g) {
      if (
        ((e = []),
        (n = g[f]),
        n.name &&
          (e.push(n.name.toLowerCase()),
          n.options && n.options.aliases && n.options.aliases.length))
      )
        for (t = 0; t < n.options.aliases.length; t++) e.push(n.options.aliases[t].toLowerCase());
      for (o = r(n.fn, 'function') ? n.fn() : n.fn, i = 0; i < e.length; i++)
        (s = e[i]),
          (a = s.split('.')),
          1 === a.length
            ? (Modernizr[a[0]] = o)
            : (!Modernizr[a[0]] ||
                Modernizr[a[0]] instanceof Boolean ||
                (Modernizr[a[0]] = new Boolean(Modernizr[a[0]])),
              (Modernizr[a[0]][a[1]] = o)),
          y.push((o ? '' : 'no-') + a.join('-'));
    }
  }
  function i(e) {
    var n = _.className,
      t = Modernizr._config.classPrefix || '';
    if ((x && (n = n.baseVal), Modernizr._config.enableJSClass)) {
      var r = new RegExp(`(^|\\s)${t}no-js(\\s|$)`);
      n = n.replace(r, `$1${t}js$2`);
    }
    Modernizr._config.enableClasses &&
      ((n += ` ${t}${e.join(` ${t}`)}`), x ? (_.className.baseVal = n) : (_.className = n));
  }
  function s(e) {
    return e
      .replace(/([a-z])-([a-z])/g, function(e, n, t) {
        return n + t.toUpperCase();
      })
      .replace(/^-/, '');
  }
  function a(e, n) {
    return function() {
      return e.apply(n, arguments);
    };
  }
  function f(e, n, t) {
    var o;
    for (var i in e)
      if (e[i] in n) return t === !1 ? e[i] : ((o = n[e[i]]), r(o, 'function') ? a(o, t || n) : o);
    return !1;
  }
  function l() {
    return 'function' != typeof n.createElement
      ? n.createElement(arguments[0])
      : x
      ? n.createElementNS.call(n, 'http://www.w3.org/2000/svg', arguments[0])
      : n.createElement.apply(n, arguments);
  }
  function u(e, n) {
    return !!~`${e}`.indexOf(n);
  }
  function p(e) {
    return e
      .replace(/([A-Z])/g, function(e, n) {
        return `-${n.toLowerCase()}`;
      })
      .replace(/^ms-/, '-ms-');
  }
  function d() {
    var e = n.body;
    return e || ((e = l(x ? 'svg' : 'body')), (e.fake = !0)), e;
  }
  function c(e, t, r, o) {
    var i,
      s,
      a,
      f,
      u = 'modernizr',
      p = l('div'),
      c = d();
    if (parseInt(r, 10))
      for (; r--; ) (a = l('div')), (a.id = o ? o[r] : u + (r + 1)), p.appendChild(a);
    return (
      (i = l('style')),
      (i.type = 'text/css'),
      (i.id = `s${u}`),
      (c.fake ? c : p).appendChild(i),
      c.appendChild(p),
      i.styleSheet ? (i.styleSheet.cssText = e) : i.appendChild(n.createTextNode(e)),
      (p.id = u),
      c.fake &&
        ((c.style.background = ''),
        (c.style.overflow = 'hidden'),
        (f = _.style.overflow),
        (_.style.overflow = 'hidden'),
        _.appendChild(c)),
      (s = t(p, e)),
      c.fake
        ? (c.parentNode.removeChild(c), (_.style.overflow = f), _.offsetHeight)
        : p.parentNode.removeChild(p),
      !!s
    );
  }
  function m(n, r) {
    var o = n.length;
    if ('CSS' in e && 'supports' in e.CSS) {
      for (; o--; ) if (e.CSS.supports(p(n[o]), r)) return !0;
      return !1;
    }
    if ('CSSSupportsRule' in e) {
      for (var i = []; o--; ) i.push(`(${p(n[o])}:${r})`);
      return (
        (i = i.join(' or ')),
        c(`@supports (${i}) { #modernizr { position: absolute; } }`, function(e) {
          return 'absolute' == getComputedStyle(e, null).position;
        })
      );
    }
    return t;
  }
  function v(e, n, o, i) {
    function a() {
      p && (delete N.style, delete N.modElem);
    }
    if (((i = r(i, 'undefined') ? !1 : i), !r(o, 'undefined'))) {
      var f = m(e, o);
      if (!r(f, 'undefined')) return f;
    }
    for (var p, d, c, v, h, y = ['modernizr', 'tspan']; !N.style; )
      (p = !0), (N.modElem = l(y.shift())), (N.style = N.modElem.style);
    for (c = e.length, d = 0; c > d; d++)
      if (((v = e[d]), (h = N.style[v]), u(v, '-') && (v = s(v)), N.style[v] !== t)) {
        if (i || r(o, 'undefined')) return a(), 'pfx' == n ? v : !0;
        try {
          N.style[v] = o;
        } catch (g) {}
        if (N.style[v] != h) return a(), 'pfx' == n ? v : !0;
      }
    return a(), !1;
  }
  function h(e, n, t, o, i) {
    var s = e.charAt(0).toUpperCase() + e.slice(1),
      a = `${e} ${b.join(`${s} `)}${s}`.split(' ');
    return r(n, 'string') || r(n, 'undefined')
      ? v(a, n, o, i)
      : ((a = `${e} ${S.join(`${s} `)}${s}`.split(' ')), f(a, n, t));
  }
  var y = [],
    g = [],
    C = {
      _version: '3.0.0',
      _config: { classPrefix: '', enableClasses: !0, enableJSClass: !0, usePrefixes: !0 },
      _q: [],
      on(e, n) {
        var t = this;
        setTimeout(function() {
          n(t[e]);
        }, 0);
      },
      addTest(e, n, t) {
        g.push({ name: e, fn: n, options: t });
      },
      addAsyncTest(e) {
        g.push({ name: null, fn: e });
      },
    },
    Modernizr = function() {};
  (Modernizr.prototype = C), (Modernizr = new Modernizr());
  var _ = n.documentElement,
    x = 'svg' === _.nodeName.toLowerCase(),
    w = 'Moz O ms Webkit',
    S = C._config.usePrefixes ? w.toLowerCase().split(' ') : [];
  C._domPrefixes = S;
  var b = C._config.usePrefixes ? w.split(' ') : [];
  C._cssomPrefixes = b;
  var E = function(n) {
    var r,
      o = prefixes.length,
      i = e.CSSRule;
    if ('undefined' == typeof i) return t;
    if (!n) return !1;
    if (((n = n.replace(/^@/, '')), (r = `${n.replace(/-/g, '_').toUpperCase()}_RULE`), r in i))
      return `@${n}`;
    for (var s = 0; o > s; s++) {
      var a = prefixes[s],
        f = `${a.toUpperCase()}_${r}`;
      if (f in i) return `@-${a.toLowerCase()}-${n}`;
    }
    return !1;
  };
  C.atRule = E;
  var z = { elem: l('modernizr') };
  Modernizr._q.push(function() {
    delete z.elem;
  });
  var N = { style: z.elem.style };
  Modernizr._q.unshift(function() {
    delete N.style;
  }),
    (C.testAllProps = h);
  var P = (C.prefixed = function(e, n, t) {
    return 0 === e.indexOf('@')
      ? E(e)
      : (-1 != e.indexOf('-') && (e = s(e)), n ? h(e, n, t) : h(e, 'pfx'));
  });
  Modernizr.addTest('intl', !!P('Intl', e)), o(), i(y), delete C.addTest, delete C.addAsyncTest;
  for (var T = 0; T < Modernizr._q.length; T++) Modernizr._q[T]();
  e.Modernizr = Modernizr;

  return Modernizr;
})(window, document);
