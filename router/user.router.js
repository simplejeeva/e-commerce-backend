import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { client } from "../index.js";
const router = express.Router();

//fast 2 sms

import {
  getUserByName,
  addUser,
  updateOtp,
  getOtp,
  deleteOtp,
  updatePassword,
  updateName,
} from "../service/user.service.js";

// function for hashing password

async function generateHashedPassword(password) {
  const NO_OF_ROUNDS = 10;
  const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}
router.post("/signup", express.json(), async function (request, response) {
  try {
    const { name, email, password } = request.body;

    const userFromDb = await getUserByName(email);
    // check email exists
    if (userFromDb) {
      response.status(401).send({ message: "email already exists" });
    }

    //set password length for security purposes
    else if (password.length < 8) {
      response
        .status(400)
        .send({ message: "Password must be at least 8 characters" });
    }
    //all condition passed allowed add user with hash value
    else {
      const hashedPassword = await generateHashedPassword(password);
      const result = await addUser({
        name: name,
        email: email,
        password: hashedPassword,
        cart: [],
      });
      response.status(200).send(result);
    }
  } catch (err) {
    console.log(err);
  }
});
router.post("/login", async function (request, response) {
  try {
    const { email, password } = request.body;
    const userFromDb = await getUserByName(email);
    // check email exists
    if (!userFromDb) {
      response.status(401).send({ message: "invalid credentials" });
    } else {
      const storedPassword = userFromDb.password;
      const isPasswordCheck = await bcrypt.compare(password, storedPassword);
      if (isPasswordCheck) {
        const token = jwt.sign({ id: userFromDb._id }, process.env.Secret_Key);
        response.send({
          message: "login successfull",
          token: token,
          id: userFromDb._id,
        });
      } else {
        response.status(401).send({ message: "invalid credentials" });
      }
    }
  } catch (err) {
    console.log(err);
  }
});
router.post("/login/forgetpassword", async function (request, response) {
  const { email } = request.body;
  console.log(email);
  const userFromDb = await getUserByName(email);
  if (!userFromDb) {
    response.status(401).send({ message: "invalid credentials" });
  } else {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const setOtp = updateOtp(email, randomNumber);
    const mail = sendMail(email, randomNumber);
  }
  response.status(200).send({ message: "OTP sent successfully" });
});
router.post("/verifyotp", async function (request, response) {
  const { OTP } = request.body;
  const otp = parseInt(OTP);
  const otpFromDB = await getOtp(otp);
  if (otpFromDB === null) {
    response.status(401).send({ message: "Invalid OTP" });
  } else if (otpFromDB.OTP === otp) {
    const deleteOtpDB = await deleteOtp(otp);
    response.status(200).send({ message: "OTP verified successfully" });
  }
});
router.post("/setpassword", express.json(), async function (request, response) {
  try {
    const { email, password } = request.body;
    const userFromDb = await getUserByName(email);
    if (!userFromDb) {
      response.status(401).send({ message: "Invalid Credentials" });
    } else if (password.length < 8) {
      response
        .status(400)
        .send({ message: "Password must be at least 8 characters" });
    } else {
      const hashedPassword = await generateHashedPassword(password);
      const result = await updatePassword(email, hashedPassword);
      response.send({ message: "password changed successfully" });
    }
  } catch (err) {
    console.log(err);
  }
});
router.put("/editprofile/:id", async function (req, res) {
  const { id } = req.params;
  const { name } = req.body;
  console.log(name, id);
  try {
    const Updated = {
      name: name,
    };
    const update = await updateName(id, Updated);
    res.status(200).send({ message: "updated successfully" });
  } catch (err) {
    res.send({ message: err });
  }
});

function sendMail(email, randomNumber) {
  const sender = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.Email,
      pass: process.env.Password,
    },
  });
  const composeMail = {
    from: process.env.Email,
    to: email,
    subject: "OTP for Reset Password",
    text: `OTP Number : ${randomNumber}`,
  };
  sender.sendMail(composeMail, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email ${info.response}`);
    }
  });
}

export default router;
