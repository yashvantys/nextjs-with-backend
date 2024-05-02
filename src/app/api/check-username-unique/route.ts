import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { userNameValidation } from "@/schemas/signUpSchema";

const UserNameQuerySchema = z.object({
  userName: userNameValidation,
});

export async function GET(request: Request) {
  console.log(request.method);
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      userName: searchParams.get("userName"),
    };
    // validate with zord
    const result = UserNameQuerySchema.safeParse(queryParam);
    console.log("Result", result);
    if (!result.success) {
      const userNameErrors = result.error.format().userName?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            userNameErrors.length > 0
              ? userNameErrors.join(", ")
              : "invalid query parameter",
        },
        { status: 400 }
      );
    }
    const { userName } = result.data;
    const existingVerifiedUser = await UserModel.findOne({
      userName,
      isVerified: true,
    });
    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "User Name already taken",
        },
        { status: 400 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User Name is available",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error checking user name", error);
    return Response.json(
      {
        success: false,
        message: "Error checking user name",
      },
      { status: 500 }
    );
  }
}
