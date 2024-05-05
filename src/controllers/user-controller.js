const User = require("../models/user-model");
const HttpError = require("../utils/api-err-handler");
const {uploadOnCloudinary, deleteFromCloudinary} = require("../utils/cloudinary");

const register = async (req, res) => {
  // return res.status(200).json({
  //     message:"OK"
  // })
  const { fullName, email, username, password } = req.body;

  try {
    const checkExistingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (checkExistingUser) {
      throw new HttpError(409, "User is already Exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files.coverImage[0].path;
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatarLocalPath) {
      throw new HttpError(400, "Avatar file is required");
    }

    if (!coverImage) {
      throw new HttpError(400, "Cover file is required");
    }

    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new HttpError(
        500,
        "Something went wrong while registering the user"
      );
    }

    return res.status(201).json({
      status: 200,
      message: "User registered Successfully",
      data: createdUser,
    });
  } catch (err) {
    console.log(err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        status: err.statusCode,
        message: err.message,
      });
    }

    console.log(err);
  }
};

const login = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!(username || email)) {
      throw new HttpError(400, "username or email is required");
    }

    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      throw new HttpError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid Password");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        status: 200,
        data: loggedInUser,
        accessToken,
        refreshToken,
        message: "User logged In Successfully",
      });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        status: err.statusCode,
        message: err.message,
      });
    } else {
      console.log(err);
    }
  }
};

const logout = async (req, res) => {
  try {
    User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1, // this removes the field from document
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        status: 200,
        message: "User logged Out",
      });
  } catch (error) {
    res.send(error);
  }
};

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // pushed refresh token with registered user data
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new HttpError(500, "Something is wrong with Token");
    console.log(error);
    // return res.status(500).json({
    //   status:500,
    //   message:'Something is wrong with token'
    // })
  }
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user?.id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    console.log(isPasswordCorrect);
    if (!isPasswordCorrect) {
      throw new HttpError(400, "Invalid old password");
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      status: 200,
      message: "Password changed successfully",
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 200,
        message: error.message,
      });
    } else {
      return res.status(500).json({
        status: 200,
        message: err | "Something went wrong",
      });
    }
  }

  // const user = await User.findById(req.user?._id)
  // return res.end(oldPassword, newPassword);
};

const updateAccDetails = async (req, res) => {
  const { fullName, email } = req.body;

  console.log(fullName);
  console.log(email);

  try {
    if (!fullName || !email) {
      throw new HttpError(400, "All fields are required");
    }
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullName,
          email,
        },
      },

      {
        new: true,
      }
    ).select("-password");

    return res.status(200).json({
      status: 200,
      message: "Data has been updated successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }
};

const updateUserAvatar = async(req, res) => {
  try{
    const avatarLocalPath = req.file?.path;
    console.log(avatarLocalPath);
    if (!avatarLocalPath) {
      throw new HttpError(400, "Avatar file is missing")
    }
    const existUser = await User.findById(req.user?._id);

    if(existUser.avatar){
      await deleteFromCloudinary(existUser.avatar);
      // existUser.avatar = null;
      // await existUser.save({ validateBeforeSave: false });
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
              avatar: avatar.url
          }
      },
      {new: true}
  ).select("-password");

  return res.status(200).json({
    'status': 200,
    'message': 'Avatar image updated successfully'
  })

  }catch(err){
    console.log(err)
  }
}

const updateUserCoverImage  = async(req, res) => {
  try{
    const coverImageLocalPath  = req.file?.path;
    if (!coverImageLocalPath) {
      throw new HttpError(400, "Cover image is missing")
    }
    const existUser = await User.findById(req.user?._id);

    if(existUser.avatar){
      await deleteFromCloudinary(existUser.coverImage);
      // existUser.coverImage = null;
      // await existUser.save({ validateBeforeSave: false });
    }

    const coverImage  = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on cover image")
        
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
              avatar: coverImage.url
          }
      },
      {new: true}
  ).select("-password");

  return res.status(200).json({
    'status': 200,
    'message': 'Avatar image updated successfully'
  })

  }catch(err){
    console.log(err)
  }
}


module.exports = {
  register,
  login,
  logout,
  changePassword,
  updateAccDetails,
  updateUserAvatar,
  updateUserCoverImage
};
