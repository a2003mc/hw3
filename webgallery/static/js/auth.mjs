    window.onload=()=>{
        //auth
      
        const registerButton = document.getElementById('register-btn')
        console.log('cool');
        registerButton.onclick = (e) =>{
            console.log('not cool');
            e.preventDefault();
            const username = document.getElementById('new-username').value;
            const password = document.getElementById('new-password').value;
            console.log(username);
            console.log(username);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/register', true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            
            xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                const response = JSON.parse(this.responseText);
                console.log('Success:', response);
                sessionStorage.setItem('userId', response.userId);

                window.location.replace("http://localhost:3000/login");
            } else {
                console.error('Server error:', this.statusText);
                const errorResponse = JSON.parse(this.responseText);
                alert('Fail: ' + errorResponse.error);  // 弹出服务器返回的错误提示
            }
            };

            xhr.onerror = function() {
                console.error('Request failed');
                alert('fail: internet error');  // 弹出错误提示
            };

        xhr.send(JSON.stringify({ username, password }));
    }
}
