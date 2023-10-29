
/*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) imageId 
        - (String) title
        - (String) author
        - (String) url
        - (Date) date

    comment objects must have the following attributes
        - (String) commentId
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date

****************************** */






// add a comment to an image
export function addComment(imageId, content) {
  console.log(imageId,content);
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/addComment", true); // 使用 POST 请求方式发送数据到服务器的 /addComment 路由

  // 设置请求头
  xhr.setRequestHeader("Content-Type", "application/json");

  // 创建评论对象
  const comment = {
    imageId,
    content,
  };

  // 将评论对象转换为 JSON 格式
  const commentJSON = JSON.stringify(comment);

  // 处理请求完成时的回调函数
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // 请求成功，可以在此处执行成功后的操作
        console.log("Comment added successfully.");
        //updateGallery(); 
      } else {
        // 请求失败，可以在此处处理失败情况
        console.error("Failed to add comment.");
      }
    }
  };

  // 发送评论数据到服务器
  xhr.send(commentJSON);
}


// delete a comment to an image
// 删除评论
export function deleteComment(commentId, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('DELETE', `/deleteComment/${commentId}`, true);

  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
          if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              callback(null, response);
          } else {
              const errorResponse = JSON.parse(xhr.responseText);
              callback(errorResponse, null);
          }
      }
  };

  xhr.send();
}


// 删除图像
export function deleteImage(imageId, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('DELETE', `/deleteImage/${imageId}`, true);

  xhr.onload = () => {
    if (xhr.status === 200) {
      callback(null, 'Image deleted successfully');
    } else {
      alert("You donot have permission to delete")
      callback('Failed to delete image', null);
    }
  };
  

  xhr.onerror = () => {
    
    callback('Failed to delete image', null);
  };

  xhr.send();
}





export function getImages() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/getImages', false);
    xhr.send();
    if (xhr.status !== 200) {
      throw new Error('Failed to fetch images.');
    }
    const data = JSON.parse(xhr.responseText);
    const images = data.images;
    return images; // 返回图像数据，如果需要的话
}





export function getComments() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/getComments', false);
  xhr.send();
  if (xhr.status !== 200) {
    throw new Error('Failed to fetch comments.');
  }
  const data = JSON.parse(xhr.responseText);
  const comments = data.comments;
  console.log(comments);
  return comments; // 返回图像数据，如果需要的话
}

  // Define the prev function
export function previous(currentIndex, array) {
  if (currentIndex <= 0) {
    // If currentIndex is at the first element or below, wrap around to the last element
    return array.length - 1;
  } else {
    // Otherwise, just go to the previous element
    return currentIndex - 1;
  }
}

// Define the next function
export function next(currentIndex, array) {
  if (currentIndex >= array.length - 1) {
    // If currentIndex is at the last element or above, wrap around to the first element
    return 0;
  } else {
    // Otherwise, just go to the next element
    return currentIndex + 1;
  }
}

