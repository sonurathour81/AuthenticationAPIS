import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import { sendEmail } from "../config/sendEmail.js";


class UserController {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, tc } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      res.send({ status: "Failed", message: "Email alredy exists" });
    } else {
      if (name && email && password && password_confirmation && tc) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
            });
            await doc.save();
            const saved_user = await UserModel.findOne({ email: email });
            // Generte tokend
            const token = Jwt.sign(
              { userID: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.status(201).send({
              status: "Success",
              message: "Registration Success",
              token: token,
            });
          } catch (error) {
            console.log(error);
            res
              .status(422)
              .send({ status: "Failed", message: "Unable to Registration" });
          }
        } else {
          res.status(422).send({
            status: "Failed",
            message: "Password and Confirm Password doesn't match",
          });
        }
      } else {
        res
          .status(422)
          .send({ status: "Failed", message: "All fields are required" });
      }
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await UserModel.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (email === user.email && isMatch) {
            // Generte tokend
            const token = Jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.status(201).send({
              status: "Success",
              message: "Login Success",
              token: token,
            });
          } else {
            res.status(422).send({
              status: "Failed",
              message: "Email or password is not a valid",
            });
          }
        } else {
          res.status(422).send({
            status: "Failed",
            message: "You are not a registered user",
          });
        }
      } else {
        res
          .status(422)
          .send({ status: "Failed", message: "All fields are required" });
      }
    } catch (error) {
      console.log(error);
      res.status(422).send({ status: "Failed", message: "Unable to Login" });
    }
  };

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.status(422).send({
          status: "Failed",
          message: "New Password and Confirm Password doesn't match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await UserModel.findByIdAndUpdate(req.user._id, {
          $set: {
            password: newHashPassword,
          },
        });
        res
          .status(200)
          .send({ status: "Success", message: "Password change success" });
      }
    } else {
      res
        .status(422)
        .send({ status: "Failed", message: "All fields are required" });
    }
  };

  static userProfile = async (req, res) => {
    res.status(200).send({ status: "Success", message: req.user });
  };

  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await UserModel.findOne({ email: email });
      const secret = user._id + process.env.JWT_SECRET_KEY;
      if (user) {
        const token = Jwt.sign({ userID: user._id }, secret, {
          expiresIn: "1d",
        });
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;

        sendEmail({
          receiver: user.email,
          subject: "Demo -  Password Reset Link",
          content: "Welcome message content",
          link: link,
        });

        res.status(200).send({
          status: "success",
          message: "Password Reset Email Sent... Please Check Your Email",
        });
      } else {
        res
          .status(401)
          .send({ status: "failed", message: "Email doesn't exists" });
      }
    } else {
      res
        .status(401)
        .send({ status: "failed", message: "Email field is required" });
    }
  };

  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await UserModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      Jwt.verify(token, new_secret);
      if (password && password_confirmation) {
        if (password === password_confirmation) {
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          await UserModel.findByIdAndUpdate(user._id, {
            $set: {
              password: newHashPassword,
            },
          });
          res
            .status(200)
            .send({ status: "Success", message: "Password Reset Success" });
        } else {
          res.status(422).send({
            status: "Failed",
            message: "New Password and Confirm Password doesn't match",
          });
        }
      } else {
        res
          .status(422)
          .send({ status: "Failed", message: "All fields are required" });
      }
    } catch (error) {
      res.status(401).send({ status: "failed", message: "Invalid Token" });
    }
  };

  static updateUserProfile = async (req, res) => {
    const { id } = req.params;
    const { name, tc } = req.body;
    try {
      await UserModel.findByIdAndUpdate(id, {
        $set: {
          name: name,
          tc: tc,
        },
      });
      res
        .status(200)
        .send({ status: "Success", message: "User update success" });
    } catch (error) {
      res.status(401).send({ status: "failed", message: "Invalid Token" });
    }
  };

  static singeFileUpload = async (req, res) => {
    if (req.file) {
      await UserModel.findByIdAndUpdate(req.user._id, {
        $set: {
          profile_image: req.file,
        },
      });
      return res.status(201).json({
        msg: "success",
      });
    } else {
      res
        .status(422)
        .send({ status: "Failed", message: "Something is wrong try again" });
    }
  };
}

export default UserController;
