const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
    requireBoardAccess,
    requireEditAccess
} = require("../middleware/whiteboardAccess");
const board = require("../controllers/whiteboardController");

const router = express.Router();

router.use(requireAuth);

router.get('/', board.listBoards);
router.post('/', board.createBoard);

router.get('/:boardId', requireBoardAccess, board.getBoard);
router.patch('/:boardId', requireBoardAccess, requireEditAccess, board.updateBoard);
router.delete('/:boardId', requireBoardAccess, board.deleteBoard);

router.post('/:boardId/members', requireBoardAccess, board.addMember);
router.delete('/:boardId/members/:userId', requireBoardAccess, board.removeMember);

module.exports = router;