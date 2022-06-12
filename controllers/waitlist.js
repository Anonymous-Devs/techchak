const { loggers } = require('winston');
const A = require('../modules/waitlist/handler');

exports.c = async (req, res) => {
 const l = {
  l: req.body
 }
 A.f.k(l).then(r => {
  res.status(r.code).json(r)
 }).catch(e => {
  loggers.error(e)
  res.status(e.code).json(e)
 })
}

exports.w = async (req, res) => {
 try{
  const q = await A.f.p();
  res.status(q.code).json(q)
 }catch(j){
  loggers.error(j)
  res.status(j.code).json(j)
 }
}

exports.n = async (req, res) => {
 try{
  const q = await A.f.q(req.params);
  res.status(q.code).json(q)
 }catch(k){
  loggers.error(k)
  res.status(k.code).json(k)
 }

}