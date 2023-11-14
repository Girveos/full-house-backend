const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../../constants");

const createAccessToken = (user) => {
    const expToken = new Date();
    expToken.setHours(expToken.getHours()+2);
    const payload = {
        token_type: "access",
        user_id : user._id,
        iat : Date.now(),
        ep : expToken.getTime(),
        role : user.role,
        document: user.document
    };
    return jwt.sign(payload, JWT_SECRET_KEY);
};

const ResetPasswordToken = (user) =>{
    const expToken = new Date();
    expToken.setHours(expToken.getHours() + 1);
    const payload = {
      token_type: "access",
      user_id: user._id,
      user_email: user.email,
      iat: Date.now(),
      exp: expToken.getTime(),
    };
    return jwt.sign(payload, JWT_SECRET_KEY);
  };

const createRefreshToken = (user) => {
    const expToken = new Date();
    expToken.getMonth(expToken.getMonth()+1);
    const payload = {
        token_type: "refresh",
        user_id : user._id,
        iat : Date.now(),
        ep : expToken.getTime(),
        role : user.role,
        document: user.document
    };
    return jwt.sign(payload, JWT_SECRET_KEY);
};

const generateVerificationToken = (user) => {
    const expToken = new Date();
    expToken.setDate(expToken.getDate() + 1);
    const payload = {
        token_type: "verification",
        user_id: user._id,
        iat: Date.now(),
        exp: expToken.getTime(),
    };
    return jwt.sign(payload, JWT_SECRET_KEY);
};

const decoded = (token) => {
    return jwt.decode(token, JWT_SECRET_KEY);
}

module.exports = {
    createAccessToken,
    createRefreshToken,
    ResetPasswordToken,
    generateVerificationToken,
    decoded
};
