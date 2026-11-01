const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
    requireBoardAccess,
    requireEditAccess
} = require("../middleware/whiteboardAccess");
const board = require("../controllers/whiteboardController");
const element  = require("../controllers/elementController");

const router = express.Router();

router.use(requireAuth);

router.get('/', board.listBoards);
router.post('/', board.createBoard);

router.get('/:boardId', requireBoardAccess, board.getBoard);
router.patch('/:boardId', requireBoardAccess, requireEditAccess, board.updateBoard);
router.delete('/:boardId', requireBoardAccess, board.deleteBoard);

router.post('/:boardId/members', requireBoardAccess, board.addMember);
router.delete('/:boardId/members/:userId', requireBoardAccess, board.removeMember);

router.post('/:boardId/elements', requireBoardAccess, requireEditAccess, element.createElement);
router.post('/:boardId/elements/bulk', requireBoardAccess, requireEditAccess, element.bulkCreate);
router.patch('/:boardId/elements/:elementId', requireBoardAccess, requireEditAccess, element.updateElement);
router.delete('/:boardId/elements/:elementId', requireBoardAccess, requireEditAccess, element.deleteElement);

module.exports = router;