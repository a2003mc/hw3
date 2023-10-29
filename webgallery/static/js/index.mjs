import {
  deleteImage,
  addComment,
  previous,
  next,
  getImages,
  getComments,
  deleteComment,
 
} from "./api.mjs";

//dom elements
const imageDiv = document.querySelector("#image");
const commentsDiv = document.querySelector("#comments");
const previousButton = document.querySelector("#previous");

const nextButton = document.querySelector("#next");
const deleteButton = document.querySelector("#delete");
const createCommentFormElement = document.getElementById("create_comment_form");
const moveUpButton = document.getElementById("moveUpButton");
const moveDownButton = document.getElementById("moveDownButton");
const signoutButton = document.getElementById('signout')
const loginButton =  document.getElementById('login')




let currentImageIndex = 0
let index1=0;
let currentImageId = null
let commentsLength = 0
let currentCommentIndex = 0


// Event listeners
previousButton.addEventListener("click", handlePrevious);
nextButton.addEventListener("click", handleNext);
deleteButton.addEventListener("click", handleDelete);
createCommentFormElement.addEventListener("submit", handleAddComment);
loginButton.onclick = ()=>{
  console.log('ss');
  window.location.href = "http://localhost:3000/login";
}





updateGallery()

//post Image
document.getElementById('add_image_form').addEventListener('submit', function (e) {
  e.preventDefault(); // 阻止表单的默认提交行为

  const formData = new FormData(this); // 创建一个 FormData 对象，并传入表单元素

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/addImage', true);
  xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
          console.log('Image uploaded successfully:', xhr.responseText);
          updateGallery();
      } else {
          console.error('Failed to upload image:', xhr.statusText);
          return alert("You have no permission to access")
      }
  };
  xhr.onerror = function () {
      console.error('Network error');
  };
  xhr.send(formData); // 发送 FormData 对象
});


function updateGallery() {
  const images = getImages();
  console.log(images);
  const comments = getComments();
  let index = getComments().length;
  commentsLength = getComments().length;
  console.log(comments);

  if (index1 < 0 && index + index1 >= 10) index = index + index1;
  else {
    index1 = 0;
  }
  // 对评论按照comment.date进行排序
  comments.sort((a, b) => new Date(b.date) - new Date(a.date));

  clearGallery();

  if (images.length === 0) {
    const p = document.createElement("p");
    p.innerText = "No Image selected";
    p.style.color = "white";
    p.style.fontSize = "32px";
    imageDiv.appendChild(p);
  } else {
    const currentImage = images[currentImageIndex];
    currentImageId = images[currentImageIndex]._id;
    if (currentImage) {
      imageDiv.innerHTML = `
      <div class="image-item">
        <img src="${currentImage.file}" alt="${currentImage.title}" style="height: 300px;">
        <h2 style="color: white; border-bottom: 1px solid white;">
          ${currentImage.author}
        </h2>
        <p style="color: white;">
          ${currentImage.title}
        </p>
      </div>
    `;

    let count = 0;
    comments.slice(currentCommentIndex, currentCommentIndex + 10).forEach((comment) => {
      if (comment.imageId === currentImageId && count < 10) {
        const commentItem = document.createElement("div");
        commentItem.className = "comment";
        commentItem.innerHTML = `
          <div class="comment_user">
            <div class="comment_username">${comment.username}</div>
          </div>
          <div class="comment_content">${comment.content}</div>
          <div class="date">${comment.date}</div>
          <button class="comment-delete" data-comment-id="${comment._id}">delete</button>
        `;
        commentsDiv.appendChild(commentItem);

        const deleteCommentButton = commentItem.querySelector(".comment-delete");
        deleteCommentButton.addEventListener("click", () => {
          const commentIdToDelete = deleteCommentButton.getAttribute("data-comment-id");
          deleteComment(commentIdToDelete,(err,res)=>{
            if (err) {
              console.error("fail to delete:", err.message);
            } else {
              console.log("deleted sucessfilly:", res);
              commentItem.remove(); 
              count--;
              updateGallery();
            }
        
          })})
      }

      count++;
    });
      

      
    }
  }
}


function handleAddComment(e){
    e.preventDefault()
    const content = document.getElementById("post_content").value;
    const imageId = currentImageId
    document.getElementById("create_comment_form").reset();
    addComment(imageId, content);
    updateGallery();
}

function handleNext(e){
  e.preventDefault();
  currentImageIndex = next(currentImageIndex, getImages());
  updateGallery();
}

function handlePrevious(e) {
  e.preventDefault();
  currentImageIndex = previous(currentImageIndex, getImages());
  updateGallery();
}


function handleDelete(e) {
  e.preventDefault();

  deleteImage(currentImageId, (error, message) => {
    if (error) {
      console.error(error); 
    } else {
      console.log(message); 
      updateGallery();
    }
  });
}


function clearGallery(){
  imageDiv.innerHTML = ""
  commentsDiv.innerHTML = ""
}



moveUpButton.addEventListener("click", handleMoveUp);
moveDownButton.addEventListener("click", handleMoveDown);

function handleMoveUp(e) {
  e.preventDefault();
  if (currentCommentIndex > 0) {
    currentCommentIndex -= 10; // 向上翻页，每次显示前10条评论
    updateGallery();
  }
}

function handleMoveDown(e) {
  e.preventDefault();
  if (currentCommentIndex + 10 < commentsLength) {
    currentCommentIndex += 10; // 向下翻页，每次显示接下来的10条评论
    updateGallery();
  }
}

function signout (e){
  e.preventDefault();

      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/signout', true);
      
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          console.log('Successfully signed out');
          window.location.href = "http://localhost:3000/login";
        } else {
          console.error('Sign out failed');
        }
      };

      xhr.onerror = function() {
        console.error('Request failed');
      };

      xhr.send();
  }


signoutButton.addEventListener("click",signout)
