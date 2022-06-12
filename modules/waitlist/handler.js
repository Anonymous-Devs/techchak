const WaitlistService = require('../../services/waitlist.service');

class H extends WaitlistService {
 
 static async k(b) {
  
  const c = await this.t({o:b.l});
  return c;
 }

 static async p() {
  const x = await this.gt();
  return x;
 }
 static async q(f) {
  const x = await this.s({i:f.o});
  return x;
 }
}

const O = {
 f: H
}

module.exports = O;