const fs = require('fs');
const path = require('path');

const routes = ['habitRoutes.js', 'taskRoutes.js', 'projectRoutes.js', 'exerciseRoutes.js', 'transactionRoutes.js', 'goalRoutes.js'];

routes.forEach((file) => {
  const content = `const express = require('express');
const router = express.Router();
const controller = require('../controllers/${file.replace('Routes.js', 'Controller')}');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, controller.getAll);
router.post('/', protect, controller.create);
router.put('/:id', protect, controller.update);
router.delete('/:id', protect, controller.delete);

module.exports = router;
`;
  fs.writeFileSync(path.join(__dirname, 'routes', file), content);
  console.log(`Updated ${file}`);
});
