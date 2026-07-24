const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// verify google id token, create/find user and issue jwtoken
// api/auth/google

const googleLogin = async (req, res, next) => {
  try {
    // google sent token
    const { credential } = req.body;
    if (!credential) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Google credential" });
    }

    // verify token authenticity
    // audience = client set in gconsole
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // get data from ticket
    const payload = ticket.getPayload();
    // sub is the numerical uuid
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, googleId, role: "student" });
    } else if (user.blocked) {
      return res
        .status(403)
        .json({ success: false, message: "This account has been blocked" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY },
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid Google token" });
  }
};

// Get currently logged in user
// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
};

module.exports = { googleLogin, getMe };
