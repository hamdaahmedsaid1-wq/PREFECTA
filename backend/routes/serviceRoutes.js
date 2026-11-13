'use strict';
const router=require('express').Router();
const ctrl=require('../controllers/serviceController');
const {auth,requireRole}=require('../middlewares/authMiddleware');
router.get('/',auth,ctrl.list);
router.post('/',auth,requireRole('Administrateur'),ctrl.create);
router.patch('/:id',auth,requireRole('Administrateur'),ctrl.update);
module.exports=router;
