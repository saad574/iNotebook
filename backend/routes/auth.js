const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')


JWT_SECRET = 'hassadisagoodb$oy';


// Validation middleware
const validateUser = [
  body('name', 'name should be atleast 4 characters').isLength({ min: 4 }).notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('phone').notEmpty().withMessage('phone is required'),
  body('work').notEmpty().withMessage('work is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('cpassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];
//route 1
router.post('/createUser', validateUser, async (req, res) => {
  let success = false;
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() })
    }
    const { name, email, phone, work, password,cpassword} = req.body; // Destructure user data from the request body
    if(password!==cpassword){
      return res.status(400).json({success,error:"password do not match"})
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, phone, work, password: hashedPassword,cpassword: hashedPassword});
     // Create a new user document
    const authentication = jwt.sign({ userId: user._id }, JWT_SECRET);
    success = true;
    res.send({ success, authentication }); // Send the saved user as a response
  } catch (error) {
    console.error('Error saving user', error);
    res.status(500).send('Error saving user');
  }
});

//   route 2

router.post('/login', async (req, res) => {
  let success = false;
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
    if (!user) {
      success = false;
      return res.status(400).json({ error: 'please login with correct credentials' })
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success = false;
      return res.status(400).json({ success, error: 'please login with correct credentials' });

    }
    const authentication = jwt.sign({ userId: user._id }, JWT_SECRET);
    success = true;
    res.json({ success, authentication })
  } catch (error) {
    console.error('error during login', error)
    res.status(500).json({ error: 'server error' })
  }
})



//route 3 : get logedin user details with the help of authtoken

router.post('/getuser', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password')
    res.send(user)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('internal server error')
  }
})




module.exports = router;