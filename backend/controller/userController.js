import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { generateToken } from "../utils/jwtUtils.js";
import { generateOTP, sendOTP } from "../utils/mailUtils.js";
import AppError from "../utils/appError.js";

export const registerUser = async (req, res, next) => {
  try {
    const { email, phoneNumber, password, fullName } = req.body;

    console.log(req.body);

    if (!email || !phoneNumber || !password || !fullName) {
      return next(new AppError("Please provide all required fields", 400));
    }

    const userExists = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (userExists) {
      if (!userExists.isVerified && userExists.otpExpiry < new Date()) {
        userExists.name = fullName;

        const passwordMatch = await bcrypt.compare(
          password,
          userExists.password
        );
        if (!passwordMatch) {
          const salt = await bcrypt.genSalt(10);
          userExists.password = await bcrypt.hash(password, salt);
        }

        const newOtp = generateOTP();
        const newOtpExpiry = new Date();
        newOtpExpiry.setMinutes(newOtpExpiry.getMinutes() + 10);

        userExists.verificationOTP = newOtp;
        userExists.otpExpiry = newOtpExpiry;

        await userExists.save();
        await sendOTP(email, newOtp);

        const token = generateToken({ id: userExists._id });

        res.cookie("userToken", token, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        return res.status(200).json({
          _id: userExists._id,
          name: userExists.fullName,
          email: userExists.email,
          phoneNumber: userExists.phoneNumber,
          message:
            "Account updated! Please verify your email with the new OTP sent.",
        });
      } else if (!userExists.isVerified) {
        return next(
          new AppError(
            "Account already exists but not verified. Please check your email for OTP or wait for current OTP to expire.",
            400
          )
        );
      } else {
        return next(
          new AppError(
            "User  already exists with this email or phone number",
            400
          )
        );
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
    console.log(`the OTP is ${otp}`);

    const user = await User.create({
      name: fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      verificationOTP: otp,
      otpExpiry,
    });

    if (user) {
      await sendOTP(email, otp);

      const token = generateToken({ id: user._id });

      res.cookie("userToken", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        message:
          "Registration successful! Please verify your email with the OTP sent.",
      });
    } else {
      return next(new AppError("Invalid user data", 400));
    }
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new AppError("Please provide email and OTP", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("User  not found", 404));
    }

    if (user.verificationOTP !== otp) {
      return next(new AppError("Invalid OTP", 400));
    }

    if (new Date() > user.otpExpiry) {
      return next(
        new AppError("OTP has expired. Please request a new one", 400)
      );
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide both email and password", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("User  not registered. Please sign up.", 404));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return next(new AppError("Incorrect password.", 401));
    }

    const token = generateToken({ id: user._id });

    res.cookie("userToken", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified,
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("userToken");

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Please provide email", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("User  not found with this email", 404));
    }

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    user.resetPasswordOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save();

    await sendOTP(email, otp);

    return res.status(200).json({
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Please provide email address", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("User  not found", 404));
    }

    if (user.isVerified) {
      return next(new AppError("User  is already verified login", 400));
    }

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    user.verificationOTP = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTP(email, otp);

    console.log("otp:", otp);

    return res.status(200).json({
      message: "Verification OTP resent to your email",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return next(new AppError("Please provide all required fields", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("User  not found", 404));
    }

    if (user.resetPasswordOTP !== otp) {
      return next(new AppError("Invalid OTP", 400));
    }

    if (new Date() > user.resetOTPExpiry) {
      return next(
        new AppError("OTP has expired. Please request a new one", 400)
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (user) {
      return res.status(200).json(user);
    } else {
      return next(new AppError("User  not found", 404));
    }
  } catch (error) {
    next(error);
  }
};
