const backButton = document.querySelector("#backButton");
const greetings = document.querySelector(".greetings");

backButton.addEventListener("click", (e) => {
    window.location.href = "../login/login.html";
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUsername");
});

const newDate = new Date();
let time = newDate.getHours();

if (time >= 0 && time < 12) {
    greetings.innerText = `Good Morning, ${localStorage.getItem("currentUsername")}`;
} else if (time >= 12 && time < 17) {
    greetings.innerText = `Good Afternoon, ${localStorage.getItem("currentUsername")}`;
} else if (time >= 17 && time < 24) {
    greetings.innerText = `Good Evening, ${localStorage.getItem("currentUsername")}`;
}
