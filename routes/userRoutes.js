import express from "express";
import { upload } from "../config/diskstorage.js";
const router = express.Router();
import UserController from "../controllers/userController.js";
import checkUserAuth from "../middlewares/authMiddlewares.js";

// Route level middleware - to protect route
router.use("/changePassword", checkUserAuth);
router.use("/userProfile", checkUserAuth);
router.use("/img_upload_update", checkUserAuth);

// Public Routes
router.post("/register", UserController.userRegistration);
router.post("/login", UserController.userLogin);
router.post(
  "/send-reset-password-email",
  UserController.sendUserPasswordResetEmail
);
router.post("/reset-password/:id/:token", UserController.userPasswordReset);

// Protected Routes
router.post("/changePassword", UserController.changeUserPassword);
router.get("/userProfile", UserController.userProfile);
router.put(
  "/updateUserProfile/:id",
  checkUserAuth,
  UserController.updateUserProfile
);
router.post(
  "/img_upload_update",
  upload.single("image"),
  UserController.singeFileUpload
);

export default router;
