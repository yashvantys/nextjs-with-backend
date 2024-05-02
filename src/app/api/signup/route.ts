import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helper/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { userName, email, password } = await request.json();
    const existingUserVerifiedByUserName = await UserModel.findOne({
      userName,
      isVerified: true,
    });
    if (existingUserVerifiedByUserName) {
      return Response.json(
        {
          success: false,
          message: "UserName already taken",
        },
        { status: 400 }
      );
    }
    const existinguserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existinguserByEmail) {
      if (existinguserByEmail?.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exist with this email",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 100);
        existinguserByEmail.password = hashedPassword;
        existinguserByEmail.verifyCode = verifyCode;
        existinguserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existinguserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        userName,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }
    // send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      userName,
      verifyCode
    );
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse?.message,
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User registed successfully. please verify your email",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error registering a user", error);
    return Response.json(
      {
        success: false,
        message: "Error registering a user",
      },
      {
        status: 500,
      }
    );
  }
}
