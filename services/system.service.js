const fs = require("fs"),
  path = require("path"),
  _sys_Services = [],
  _sys_whiteList = ['system.service', 'mail.notification.service', 'account.service', 'platform.service', 'privateChats.service', 'privateMessage.service', 'supportGroup.service', 'groupChatMessage.service', 'groupChats.service', 'oauth.service', 'rating.service'];

fs.readdirSync("./services").filter(file => {
  file = path.basename(file, '.js');
  
  if (!_sys_whiteList.includes(file)) {
    let service = require(path.resolve(`${__dirname}/${file}`));

    const getDisstructuredServices = fn => _sys_Services.push(service[fn]);

    if (typeof service == 'object') {
      Object.keys(service).forEach(getDisstructuredServices)

    } else _sys_Services.push(service);
  }
});


module.exports = class SYSTEM {
  /**
   * @description Attaches the users profile id to the system
   * @param {String} user - The user account id
   */
  static async digest(user) {
    logger.info("user to be digested", user)
    try {
      let profile;
      for (let service of _sys_Services) {
        if (service.name.toLowerCase() == 'profile'){
           profile = await service.getProfileByAccountId({
          user,
          filter: ['_id']
        })
      }
      }

      logger.info(`digesting user ${profile._id} <- ${user}`);
      this.pid = profile._id;
    } catch (err) {
      logger.warn(err)
      this.pid = null
    }
  }

  static async detachCredentials() {
    try {
      logger.info("detaching user ID from the system's data")
      const toBeSaved = []
      for (let service of _sys_Services) {
        let s = await service.find();

        if (s.length > 0) {
          for (let i in s) {
            
            Object.keys(s[i]._doc).forEach(async key => {
            
              if (s[i]._doc[key] instanceof Array) {
            
                if (s[i]._doc[key].includes(this.pid)) {
                  let a = s[i]._doc[key].splice(s[i]._doc[key].indexOf(this.pid), 1);
                  logger.info(a[0] + ' detached from ' + key + ' of ' + service.name + ' ' + s[i]._id)
                  if (!toBeSaved.includes(s[i])) toBeSaved.push(s[i])
                }
              }
            })
          }
        }
      }
      Promise.all(toBeSaved.map(async s => {
        let a = await s.save();
        logger.info(`${a._id} saved`)
      }))

    } catch (err) {
      loggers.error(err)
    }
  }

  static async ejectUser() {

    if (this.pid) {
      logger.info(`digested user ${this.pid}. Now Ejecting...`)
      try {
        await this.detachCredentials();
        const summary = []
        for (const i in _sys_Services) {
          if (_sys_Services[i].deleteByOwner) {
            let deleted = await _sys_Services[i].deleteByOwner(this.pid)
            summary.push(deleted)

          } else {
            logger.warn(`${_sys_Services[i].name} does not have a deleteByOwner function`)
          }
        }

        logger.info('Ejected user', this.pid)
        console.log('Ejected data summary', summary)

        
      } catch (err) {
        logger.error(err)
        logger.error("Ejection Failed for user", this.pid)
      }
    } else logger.error("SYSTEM ERROR: User " + this.pid + " is not in the system!")

  }

}