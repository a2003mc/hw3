
import express from 'express'
import multer from 'multer';
import path from 'path';

import { fileURLToPath } from 'url';
import {  getComments, getImages } from './db/api.mjs';
import { imageDb } from './db/createImage.mjs';
import { commentDb } from './db/createComment.mjs';
import { userDb } from './db/createUser.mjs';
import { checkUsername, isAuthenticated, mySession, setSession,isImageOwner, isCommentOwnerOrImageOwner } from './midware.mjs';
import { genSalt, hash,compare } from 'bcrypt';
import { serialize } from 'cookie';


const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const storage = multer.diskStorage({
    destination: (path.join(__dirname, '/static/uploads')), 
    filename: (req, file, callback) => {
      const extname = path.extname(file.originalname);
      callback(null, Date.now() + extname); 
    },
});
  

const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '/static')));
app.use(mySession)
app.use(setSession)



app.post('/addImage', isAuthenticated, upload.single('image'), (req, res) => {
  const { filename } = req.file;
  const file = `http://localhost:${port}/uploads/${filename}`;
  const { title } = req.body;
  const userId = req.session.user._id;
  
  userDb.findOne({ _id: userId }, (err, user) => {
    if (err || !user) {
      res.status(500).json({ error: 'Failed to find user' });
    } else {
      const author = user.username;
      const newImage = { title, userId, file, author };
      
      imageDb.insert(newImage, (err, insertedImage) => {
        if (err) {
          res.status(500).json({ error: 'Failed to add image' });
        } else {
          res.redirect('/');
        }
      });
    }
  });
});



app.post('/addComment', isAuthenticated, (req, res) => {
  const { imageId, content } = req.body;
  console.log('Adding comment:', imageId, content);
  const userId = req.session.user._id;

  imageDb.findOne({ _id: imageId }, (err, image) => {
    if (err) {
      console.error('Error finding image:', err);
      return res.status(500).json({ error: 'Failed to find image' });
    }
    if (!image) {
      console.error('Image not found');
      return res.status(500).json({ error: 'Failed to find image' });
    }

    userDb.findOne({ _id: userId }, (err, user) => {
      if (err) {
        console.error('Error finding user:', err);
        return res.status(500).json({ error: 'Failed to find user' });
      }
      if (!user) {
        console.error('User not found');
        return res.status(500).json({ error: 'Failed to find user' });
      }

      const newComment = {
        imageId, 
        userId, 
        username: user.username,
        content,
        date: new Date()
      };

      commentDb.insert(newComment, (err, insertedComment) => {
        if (err) {
          console.error('Error adding comment:', err);
          return res.status(500).json({ error: 'Failed to add comment' });
        }

        console.log('Comment added successfully');
        res.status(200).json({ message: 'Comment added successfully', comment: insertedComment });
      });
    });
  });
});





app.delete('/deleteImage/:imageId', isImageOwner, (req, res) => {
    const imageId = req.params.imageId;
    console.log(imageId);
    imageDb.remove({ _id: imageId }, {}, function (err, numRemoved) {
        if(err){
            res.status(500).json({ error: 'Failed to delte image' });
        }else{
            res.status(200).json({ message: 'deleted image successfully'});
        }
    });
    }
)


app.delete('/deleteComment/:commentId', isCommentOwnerOrImageOwner, (req, res) => {
  const commentId = req.params.commentId;

  commentDb.remove({ _id: commentId }, {}, (err, numRemoved) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete comment' });
    }
    if (numRemoved === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json({ message: 'Deleted comment successfully' });
  });
});


app.get('/getImages',isAuthenticated, getImages);
app.get('/getComments', getComments);


// Login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/static/login.html'));
});


app.post('/login', function (req, res) {
  if (!('username' in req.body)) return res.status(400).json({ error: 'username is missing' });
  if (!('password' in req.body)) return res.status(400).json({ error: 'password is missing' });

  const { username, password } = req.body;

  userDb.findOne({ username }, function (err, user) {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    if (!user) return res.status(401).json({ error: 'access denied' });

    compare(password, user.password, function (err, valid) {
      if (err) return res.status(500).json({ error: 'Internal Server Error' });
      if (!valid) return res.status(401).json({ error: 'access denied' });

      req.session.user = user;

      res.json({ message: 'User logged in successfully', userId: user._id });
    });
  });
});




//Register 
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '/static/register.html'));
});



app.post('/register', checkUsername, (req, res) => {
  // This route will only be reached if the username is not already in use
  const { username, password } = req.body;
  genSalt(10, function (err, salt) {
    hash(password, salt, function (err, hash) {
      userDb.insert({ username, password: hash }, (err, newUser) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to register user' });
        }
        res.status(200).json({ message: 'User registered successfully', userId: newUser._id });
      });
    });
  });
});


app.get('/signout', function(req, res, next){
  req.session.destroy();
  res.setHeader('Set-Cookie', serialize('username', '', {
        path : '/', 
        maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
  }));
  return res.status(200).json({ message: "Signout successfully" });
});



app.listen(port, () => {
  console.log(`Server is running on  http://localhost:${port}`);
});
