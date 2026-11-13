'use strict';
const router=require('express').Router();
const ctrl=require('../controllers/dossierController');
const {auth,requireRole}=require('../middlewares/authMiddleware');
router.get('/',auth,ctrl.list);
router.post('/',auth,requireRole('Administrateur','Agent'),ctrl.create);
router.put('/:id',auth,requireRole('Administrateur','Agent'),ctrl.update);
module.exports=router;
