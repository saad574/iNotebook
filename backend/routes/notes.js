const express = require('express')
const router = express.Router()
const Note = require('../models/Note')
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator')


//route 1: Get all the notes using: GET "/api/notes/getuser". login required

router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('internal server error')
    }

})


//route 2: Add a new note using: POST "/api/notes/addnote". login required
router.post('/addnote', fetchuser, [
    body('title', 'Please enter a valid Title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //if there are errors return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();
        res.json(savedNote)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('internal server error')
    }

})


//route 3: update an existing note using: PUT "/api/notes/updatenote". login required
  router.put('/updatenote/:id',fetchuser,[
    body('title', 'Please enter a valid Title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 })
  ], async (req,res)=>{
    const {title,description,tag} = req.body;
    //create a newNote object
    const newNote = {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};

    //find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if(!note){
        return res.status(404).send('not found')
    }
    if(note.user.toString()!== req.user.id){
        return res.status(401).send('not allowed')
    }

     note =await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
     res.json({note})
  })


  //route 4: Delete existing note using: DELETE "/api/notes/deletenote". login required
   router.delete('/deletenote/:id',fetchuser, async (req,res)=>{
    const {title,description,tag} = req.body;

    //find the note to delete and delete it
    let note = await Note.findById(req.params.id);
    if(!note){
        return res.status(404).send('not found')
    }
    //allow deletion if user owns this note
    if(note.user.toString()!==req.user.id){
        return res.status(401).send('not allowed')
    }
     
     note = await Note.findByIdAndDelete(req.params.id)
     res.json({"success": "note has been deleted"})
   })

module.exports = router;