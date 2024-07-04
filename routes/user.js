const express = require('express');
const User = require('../Schemas/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchUser');

const JWT_SECRET = process.env.JWT_SECRET;

// Route 1: Create a User using: POST "http://localhost:4000/user/createuser". 
router.post('/createuser', [
  body('name', 'Name must be atleast 3 characters').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be atleast 6 characters').isLength({ min: 6 }),
  body('dob', 'Enter a dob').isDate(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error= errors.array();
    return res.status(400).json( error[0].msg);
  }
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      const error = "Sorry a user with this email already exists";
      return res.status(400).json(error)
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,
      dob : req.body.dob,
    });
    const data = {
      user:{
        id: user.id
      }
    }
    
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({authtoken, user})
    
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
})

// Authenticate a User using: POST "http://localhost:4000/user/login". 
router.post('/login', [ 
    body('email', 'Enter a valid email').isEmail(), 
    body('password', 'Password cannot be blank').exists(), 
  ], async (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error= errors.array();
      return res.status(400).json( error[0].msg);
    }
  
    const {email, password} = req.body;
    try {
      let user = await User.findOne({email});
      const error = "Please try to login with correct credentials";
      if(!user){
        return res.status(400).json(error);
      }
  
      const passwordCompare = await bcrypt.compare(password, user.password);
      if(!passwordCompare){
        return res.status(400).json(error);
      }
  
      const data = {
        user:{
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({authtoken, user})
  
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  })
// ROUTE 3: Get Users Details using: POST "http://localhost:4000/user/userlist". Login required
router.get('/userlist', fetchuser,  async (req, res) => {

  try {
    const users = await User.find().select("-password")
    res.status(200).send(users)
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
})
module.exports = router