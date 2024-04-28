const HttpError = require("../utils/api-err-handler");
const jwt = require('jsonwebtoken');
const User = require('../models/user-model')


const verifyJWT = async(req, res, next) => {
   try {
     const checkToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
     
     if(!checkToken){
        throw new HttpError(401, "Unauthorized request");
     }
     const decodedToken = await jwt.verify(checkToken, process.env.ACESS_TOKEN_SECRET);
     
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
     if (!user) {
         throw new HttpError(401, "Invalid Access Token")
     }
 
     req.user = user;
     console.log(req.user);
     next();
   } catch (error) {
      if(error.statusCode){
         return res.status(error.statusCode).json({
            message: error.message
         })
      }
      else{
         console.log(error)
      }
     
   }
}

module.exports = verifyJWT