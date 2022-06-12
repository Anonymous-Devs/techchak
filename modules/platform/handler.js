'use strict';
const PlatformService = require('../../services/platform.service');

const path = require('path');

const CSV = require('csvtojson');

const {
    Skillsets,
    Certifications,
    Departments,
    Areas
  } = require('./model');

  // Skillsets.deleteMany().then(() => console.log('Skillsets collection deleted'));
  // Certifications.deleteMany().then(() => console.log('Certifications collection deleted'));
  // Departments.deleteMany().then(() => console.log('Departments collection deleted'));
  // Areas.deleteMany().then(() => console.log('Areas collection deleted'));

exports.getPlatformSetting = async (req, res, next) => {
  logger.info({method: req.method, path: req.originalUrl});
  try {
    const data = await PlatformService.getPlatformSettings();
    res.status(data.code).json(data)
  } catch (error) {
    logger.error(error);
    res.status(error.code).json(error)
  }
}

exports.updatePlatformSetting = async (req, res, next) => {
  logger.info({method: req.method, path: req.originalUrl});
  try {
    const data = await PlatformService.updatePlatformSettings(req.body);
    res.status(data.code).json(data)
  } catch (error) {
    logger.error(error);
    res.status(error.code).json(error)
  }
}

let getSkillsets = async (req, res, next) => {

  const departments = [{
      name: 'CLOUD',
    },
    {
      name: 'DATA ANALYTICS',
    }
  ];
  const areas = [{
      department: "DATA ANALYTICS",
      name: "DATABASE ANALYTICS",
    }, {
      department: "DATA ANALYTICS",
      name: "DATA ANALYSIS/REPORTING",
    },
    {
      department: "DATA ANALYTICS",
      name: "DATA VISUALIZATION"
    },

    {
      department: "CLOUD",
      name: "AWS NETWORKING"
    },
    {
      department: "CLOUD",
      name: "AWS SECURITY"
    },
    {
      department: "CLOUD",
      name: "AWS BIG DATA"
    },
    {
      department: "CLOUD",
      name: "AWS DEVOPS"
    },
    {
      department: "CLOUD",
      name: "AWS INFRASTRUCTURE"
    }
  ]
  let isDepartment = await Departments.find();
  let isArea = await Areas.find();

  departments.forEach(async department => {
    if (!isDepartment[0] && department) await Departments.create(department);
  })

  areas.forEach(async area => {
    if (!isArea[0] && area) await Areas.create(area);
  })

  let parsed = CSV().fromFile(path.resolve('public','data-points.csv'));
  parsed.then(async data => {

    let isSkillset = await Skillsets.find();
    let isCertification = await Certifications.find();

    data.forEach(async element => {
      const skillset = element.SKILLSETS,
        certification = element.CERTIFICATIONS;

      if (!isSkillset[0] && skillset) {
        await Skillsets.create({
          name: skillset
        })
      }

      if (!isCertification[0] && certification) {
        await Certifications.create({
          name: certification
        })
      }
    });

  }).catch(err => {
    logger.error(err);

  })
}

(async _ => {
  await getSkillsets()
})()
 

exports.getSkillsets = async (req, res, next) => {
  logger.info({method: req.method, path: req.originalUrl});
  try {
    const data = await Skillsets.find({});
    const total = await Skillsets.countDocuments()
    
    res.status(200).json({
      total,
      code: 200,
      data: data,
      message: "Skillsets retrieved successfully"
    })
  } catch (error) {
    logger.error(error);
    res.status(500).json(error)
  }
}

exports.getCertifications = async (req, res, next) => {
  logger.info({method: req.method, path: req.originalUrl});
  try {
    const data = await Certifications.find({});
    const total = await Certifications.countDocuments()
    res.status(200).json({
      total,
      code: 200,
      data: data,
      message: "Certifications retrieved successfully"
    })
  } catch (error) {
    logger.error(error);
    res.status(500).json(error)
  }
}

exports.getDepartments = async (req, res, next) => {
  logger.info({method: req.method, path: req.originalUrl});
  try {
    const data = await Departments.find({});
    const total = await Departments.countDocuments()
    res.status(200).json({
      total,
      code: 200,
      data: data,
      message: "Departments retrieved successfully"
    })
  } catch (error) {
    logger.error(error);
    res.status(500).json(error)
  }
}

exports.getAreas = async (req, res, next) => {
  try {
    const data = await Areas.find({});
    const total = await Areas.countDocuments()
    res.status(200).json({
      total,
      code: 200,
      data: data,
      message: "Areas retrieved successfully"
    })
  } catch (error) {
    logger.error(error);
    res.status(500).json(error)
  }
}

exports.createCertifications = async (req, res, next) => {
  try{
  logger.info({method: req.method, path: req.originalUrl});
  
  const res = await Certifications.insertMany(req.body.certifications);
  
  res.json({code: 201, data: res, message: "Certification created successfully"})
}catch(err){
  const arr = err.writeErrors[0].errmsg.split(':'),
  msg = err.writeErrors[0].errmsg.split(':')[arr.length - 1].replace(/[}"]/g,'');

    if(err.code === 11000){
      res.json({code: 409, message: `${msg.trim()} already exists`})
    }
    else res.json({code: 500, data: err, message: "Certification creation failed"})
  }
}

exports.GetRESOURCES = async (req, res, next) => {
  logger.info({method: req.method, path: req.originalUrl});
  try {
    const data = await PlatformService.GetRESOURCES(req.query);
    res.status(data.code).json(data)
  } catch (error) {
    res.status(error.code).json(error)
  }
}

exports.g = async (req, res, next) => {
  try{
    const data = await PlatformService.u({f:req.files.file});
    res.status(data.code).json(data)
  }catch(r){
    res.status(r.code).json(r)
  }
}