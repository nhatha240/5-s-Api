const express = require('express');
const thongKeController = require('../../controllers/thongKe.controller');
const admin = require('../../middlewares/admin');
const router = express.Router();

router.get('/bieu-do', admin(), thongKeController.bieuDo);
router.get('/seven-day', admin(), thongKeController.bayNgay);
router.get('/total', admin(), thongKeController.total);

module.exports = router;
