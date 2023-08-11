const jwt = require('jsonwebtoken')
JWT_SECRET = 'hassadisagoodb$oy';


const fetchuser = (req, res, next) => {
    //get the user from jwt token and add id to req object
    const token = req.header('auth-token')
    if (!token) {
        return res.status(401).send({ error: "please authenticate using a valid token" })
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);

        // req.user = data.user;
        req.user = { id: data.userId };

        next();
    } catch (error) {
        return res.status(401).send({ error: "please authenticate using a valid token" })
    }

}


module.exports = fetchuser;