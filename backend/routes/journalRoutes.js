'use strict';
const router=require('express').Router();
const ctrl=require('../controllers/journalController');
const {auth,requireRole}=require('../middlewares/authMiddleware');
router.get('/',auth,requireRole('Administrateur'),ctrl.list);
module.exports=router;
