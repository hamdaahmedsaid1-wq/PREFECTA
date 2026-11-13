'use strict';
const router=require('express').Router();
const ctrl=require('../controllers/healthController');
router.get('/health',ctrl.health);
module.exports=router;
