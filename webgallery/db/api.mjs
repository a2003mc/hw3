

import { imageDb } from "../db/createImage.mjs";
import { commentDb } from "../db/createComment.mjs";

/*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) _id 
        - (String) title
        - (String) author
        - (Date) date

    comment objects must have the following attributes
        - (String) _id
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date

****************************** */


export function addImage(title, author, file, callback) {
    const image = {
      _id: generateUniqueId(),
      title,
      author,
      date: new Date(),
      file,
    };
  
    imageDb.insert(image, (err, newImage) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, newImage);
      }
    });
}


export function addComment(imageId, content, callback) {
    const comment = {
      _id: generateUniqueId(),
      imageId,
      content,
      date: new Date(),
    };
  
    commentDb.insert(comment, (err, newComment) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, newComment);
      }
    });
  }



  export function getImages(req, res) {
    imageDb.find({}, (err, images) => {
      if (err) {
        res.status(500).json({ error: 'Failed to fetch images' });
      } else {
        return res.json({ images });
      }
    });
  }
  
  export function getComments(req, res) {
    commentDb.find({}, (err, comments) => {
      if (err) {
        res.status(500).json({ error: 'Failed to fetch comments' });
      } else {
        console.log(comments);
        return res.json({ comments });
      }
    });
  }


function generateUniqueId() {
    return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}
