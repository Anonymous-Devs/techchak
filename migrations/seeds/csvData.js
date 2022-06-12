const path = require('path');
const CSV = require('csvtojson');
let parsed = CSV().fromFile(path.resolve('public', 'data-points.csv'));

async function getCSVData(x) {
 try {
  let m = x.toUpperCase();
  const q = (l, i) => l.split(i);
  const b = c => c[m];
  const a = d => d.map(b).filter(Boolean);

  return a(await parsed);
 } catch (e) {
  const o = "concat message";
  const z = `Failed to parse ${m} from csv file`;
  const y = e => {
   e[q(o, 1)] = z[q(o, 0)](': ', e[q(o, 1)]);
   throw e
  };
  y(e);
 }
}

module.exports = getCSVData