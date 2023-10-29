window.onload = ()=>{
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('not cool');
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        console.log(username);
        console.log(username);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/login', true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        
        xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
              if (this.getResponseHeader('Content-Type').includes('application/json')) {
                const response = JSON.parse(this.responseText);
                console.log('Success:', response);
                sessionStorage.setItem('userId', response.userId);
                window.location.replace("http://localhost:3000");
              } else {
                console.error('Unexpected response type:', this.getResponseHeader('Content-Type'));
              }
            } else {
              alert("Username or Password is wrong");
            }
        };
        xhr.onerror = function() {
        console.error('Request failed');
        };

        xhr.send(JSON.stringify({ username, password }));
    });
}