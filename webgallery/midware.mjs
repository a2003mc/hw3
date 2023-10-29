import { serialize } from "cookie";
import validator from "validator";
import { userDb } from "./db/createUser.mjs";
import session from "express-session";
import { imageDb } from "./db/createImage.mjs";
import { commentDb } from "./db/createComment.mjs";

const mySession = session({
  secret: 'rcArjLDfv50BumEr18nSvv1ILa3DP7ks',
  resave: false,
  saveUninitialized: true,
  cookie: { 
      httpOnly: true, // prevent the session cookie from being read by Javascript onn the browser
      secure: false,  // prevent the cookie to be sent with http, should be set to true when https is enabled
      samesite: 'strict' // prevent the cookie from being sent with cross-domain requests, should be set to lax when frontend is served on different domain
  }
})

const setSession = function(req, res, next){
  const username = (req.session.user) ? req.session.user._id : '';
  res.setHeader('Set-Cookie', serialize('username', username, {
        path : '/', 
        maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
  }));
  next();
}


const putHttpRequset = function (req, res, next){
  console.log("HTTP request", req.method, req.url, req.body);
  next();
}

const isAuthenticated = function(req, res, next) {
  if (!req.session.user) return res.status(401).end("access denied");
  next();
};


const checkUsername = function(req, res, next) {
  if (!validator.isAlphanumeric(req.body.username)) {
    return res.status(400).json({ error: 'Bad input' });
  }

  const { username } = req.body;
  userDb.findOne({ username }, (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (user) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    next(); 
  });
};


const sanitizeContent = function(req, res, next) {
  req.body.content = validator.escape(req.body.content);
  next();
}

const checkId = function(req, res, next) {
  if (!validator.isAlphanumeric(req.params.id)) return res.status(400).end("bad input");
  next();
};


const isImageOwner = (req, res, next) => {
  console.log('get');
  console.log(req.session.user._id);
  
  imageDb.findOne({ _id: req.params.imageId }, (err, image) => {
    console.log(image.userId);
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (!image) {
      res.status(404).json({ error: 'Image not found' });
    } else {
  
      if (image.userId !== req.session.user._id) {
        res.status(403).json({ error: 'Forbidden' });
      } else {
        next();
      }
    }
  });
};



const isCommentOwnerOrImageOwner = (req, res, next) => {
  const commentId = req.params.commentId;
  
  commentDb.findOne({ _id: commentId }, (err, comment) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    console.log(comment.userId);
    if (comment.userId === req.session.user._id) {
      return next();
    }

    imageDb.findOne({ _id: comment.imageId }, (err, image) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }
      if (image.userId === req.session.user._id) {
        return next();
      }
      return res.status(403).json({ error: 'Forbidden' });
    });
  });
};


function requireLogin(req, res, next) {
  const publicPaths = ['/login', '/register'];
  if (publicPaths.includes(req.path)) return next();
  
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  next();
}

export {requireLogin,setSession,putHttpRequset,isAuthenticated,checkUsername,sanitizeContent,checkId,mySession,isImageOwner,isCommentOwnerOrImageOwner}
