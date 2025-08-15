const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('admin'), async (req,res)=>{ const c = new Course(req.body); await c.save(); res.json(c); });
router.get('/', protect, async (req,res)=>{ const list = await Course.find(); res.json(list); });
router.put('/:id', protect, authorize('admin'), async (req,res)=>{ const c = await Course.findByIdAndUpdate(req.params.id, req.body, {new:true}); res.json(c); });
router.delete('/:id', protect, authorize('admin'), async (req,res)=>{ await Course.findByIdAndDelete(req.params.id); res.json({message:'Deleted'}); });

module.exports = router;