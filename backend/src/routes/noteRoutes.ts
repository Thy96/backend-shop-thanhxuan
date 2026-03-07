import express from "express";
import { getAll, postNote, updateNote, getNoteById, moveNoteToTrash, getTrashNotes, restoreNote, forceDeleteNote, getNoteBySlug } from "../controllers/noteController";
import { upload } from "../lib/config/upload";
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

router.get('/', getAll);
/* ====== TRASH ====== */
router.get('/trash', getTrashNotes);

router.post('/', authenticate, authorize('admin', 'editor'), upload.single("thumbnail"), postNote);
router.put('/:id', authenticate, authorize('admin', 'editor'), upload.single("thumbnail"), updateNote);

/* ====== SOFT DELETE ====== */
router.patch('/:id/trash', authenticate, authorize('admin', 'editor'), moveNoteToTrash
);

router.patch('/:id/restore', authenticate, authorize('admin', 'editor'), restoreNote
);

/* ====== FORCE DELETE ====== */
router.delete('/:id/force', authenticate, authorize('admin', 'editor'), forceDeleteNote);

router.get('/slug/:slug', getNoteBySlug);
router.get('/:id', getNoteById);

export default router;
