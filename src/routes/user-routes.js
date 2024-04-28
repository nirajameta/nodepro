const Router = require('express').Router;
const router = Router();

const upload = require('../middleware/multer-middleware')

const {register, login, logout, 
    changePassword, updateAccDetails, 
    updateUserAvatar,updateUserCoverImage} = require('../controllers/user-controller')
const verifyJWT = require('../middleware/auth-middleware')

router.route("/register").post(
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },
        {
            name:'coverImage',
            maxCount:1
        }
    ]),
    register)

router.route("/login").post(login);
router.route("/logout").post(verifyJWT,logout)
router.route("/changepassword").post(verifyJWT,changePassword)
router.route("/updateaccountdetails").patch(verifyJWT,updateAccDetails)
router.route("/updateavatar").post(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/updatecoverimage").post(verifyJWT,upload.single("coverImage"),updateUserCoverImage)





module.exports = router;