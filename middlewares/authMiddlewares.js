import Jwt from "jsonwebtoken";
import UserModel from "../models/user.js";

const checkUserAuth = async (req, res, next) => {
    let token;
    const { authorization } = req.headers
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            token = authorization.split(' ')[1]
            // Verify Token
            const { userID } = Jwt.verify(token, process.env.JWT_SECRET_KEY)
            // Get User from Token
            req.user = await UserModel.findById(userID).select("-password")
            next()
        } catch (error) {
            res.status(401).send({ "status": "Failed", "message": "Unauthorized User" })
        }
    }
    if (!token) {
        res.status(401).send({ "status": "Failed", "message": "Unauthorized User, No Token" })
    }
}

export default checkUserAuth