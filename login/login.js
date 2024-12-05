let Username = document.querySelector('.input #Username')
let Pass = document.querySelector('.input #password')
let loginBtn = document.querySelector('.loginBtn button')
let registerBtn = document.querySelector('.register')
let wrong = document.querySelector('span#wrong')

passEye = document.querySelector('#EYE')
EYEbutton = document.querySelector('#EYEbutton')


let username = /^(?!.*[-_]{2})[a-zA-Z0-9](?:[a-zA-Z0-9_-]{1,14}[a-zA-Z0-9])?$/  //regex for username
let password = 'admin123'

passEye.addEventListener('click', e => {
    if (passEye.classList.contains('bi-eye')) {

        passEye.classList.remove('bi-eye')
        passEye.classList.add('bi-eye-slash')
        Pass.type = 'text'
    } else {
        passEye.classList.remove('bi-eye-slash')
        passEye.classList.add('bi-eye')
        Pass.type = 'password'

    }
})


Username.addEventListener('input', (e) => {
    if (!username.test(Username.value)) {
        Username.style.color = 'red';
    } else {

        Username.style.color = 'white';
    }
})

loginBtn.addEventListener('click', async (e) => {
    console.log(Username.value);
    console.log(Pass.value);

    let isCorrect

    let res = await fetch("https://finai-hackathon.onrender.com/auth", {
        method: "POST",
        body: JSON.stringify({
            "username": `${Username.value}`,
            "password": `${Pass.value}`
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }) //fetch call to the api for chcecking if the username and password combo is correct

    res = await res.json()

    console.log(res.result);

    isCorrect = res.result

    // isCorrect = true; //remove after creating a api call, just for testting

    if (isCorrect === "true") {
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('currentUsername', `${Username.value}`)
        window.location.href = ".././Dashboard/index.html";

    } else {
        wrong.innerText = 'Wrong Username or Password'
        wrong.style.display = 'block'
    }

})

registerBtn.addEventListener('click', async (e) => {

    let res = await fetch('https://finai-hackathon.onrender.com/chkUser', {
        method: 'POST',
        body: JSON.stringify({
            "username": `${Username.value}`,
            'password': `${Pass.value}`
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }) //return a boolean to check if user is present by fetching a call to the api

    let res1 = await res.json()

    let userPresent = res1.result

    // userPresent = true; //just to check remove after api is implemented

    if (userPresent === "true") {
        wrong.innerText = 'Username already present!\nLogin or choose another username'
        wrong.style.display = 'block'
    }
    else {

        let res = await fetch("https://finai-hackathon.onrender.com/register", {
            method: "POST",
            body: JSON.stringify({
                "username": `${Username.value}`,
                "password": `${Pass.value}`  //Sending username and password to backend
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        res = await res.json()

        let registered = res.result

        //Add a push call to add a username to the database

        if (registered) {
            wrong.innerText = 'Registered Successfully! Please Login'
            wrong.style.display = 'block'
            localStorage.setItem('isRegistered', 'true')
        }
        else {
            wrong.innerText = 'Error! Please try again'
            wrong.style.display = 'block'
            localStorage.setItem('isRegistered', 'false')

        }
    }

})