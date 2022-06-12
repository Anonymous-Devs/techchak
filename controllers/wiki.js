const Q = require("../modules/wiki/handler"),
r = require("../modules/comments/handler");

exports.c = async (r, y, n) => {
  try {

    const q = y.locals,
    v = q[m];
    v.createdBy = q.user.pid;


    const p = await Q.c(v, r.query);
    y[a](p.code)[b](p);
  } catch (k) {
    logger.error(k);
    r[a](k.code)[b](k);
  }
}

exports.v = async (r, y, n) => {
  try {

    const q = y.locals;
    const p = await Q.v(r[x][o], q[m]);
    y[a](p.code)[b](p);
  } catch (k) {
    logger.error(k);
    y[a](k.code)[b](k);
  }
}

exports.h = async (r, y, n) => {
  try {
    const p = await Q.g(r[x][o]);
    y[a](p.code)[b](p);
  } catch (r) {
    logger.error(r);
    y[a](r.code)[b](r);
  }
}

exports.j = async (r, p, n) => {
  try {
    const n = await Q.m(r.query, p.locals.user);
    p[a](n.code)[b](n);
  } catch (r) {
    logger.error(r);
    p[a](r.code)[b](r);
  }
}

exports.d = async (r, p, n) => {
  try {
    const {
      user
    } = p.locals;

    const d = await Q.d(r[x][o], user, r.body);
    p[a](d.code)[b](d);
  } catch (h) {
    logger.error(h);
    p[a](h.code)[b](h);
  }
}

exports.t = async (w, y, n) => {
  try {
    const f = w[x];

    const v = y.locals,
      c = v[m];
    c.createdBy = v["user"].pid;
    c.type = 'wiki';

    const k = await r.cc(f[o], c);
    y[a](k.code)[b](k);
  } catch (k) {
    logger.info(k);
    y[a](k.code)[b](k);
  }
}

exports.k = async (y, r, n) => {
  try {
    const f = y[x];

    const c = r.locals.user;

    const w = await Q.k(f[o], c);
    r[a](w.code)[b](w);
  } catch (n) {
    logger.error(n);
    r[a](n.code)[b](n);
  }
}

exports.ac = async (c, e, n) => {
  try {
    const s = c[x];

    const f = await Q.ac(s[o]);
    e[a](f.code)[b](f);
  } catch (c) {
    logger.error(c);
    e[a](c.code)[b](c);
  }
}

  const sl="ninja4",
  z = helper[sl],
  n = 44,
  i = z(false, n - 27),
  x = z(null, null),
  o = z(0, n / 4 + 3),
  a = z(0, n / 4), m = i, b = z(0, (n / 4) + 1);