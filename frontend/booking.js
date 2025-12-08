const form = document.getElementById("bookingForm");
const resultDiv = document.getElementById("result");

//Looking for form submission
form.addEventListener("submit", async (e) => {
    e.preventDefault(); //Prevents reloading once form is submitted

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const date = document.getElementById("date").value;
    const service = document.getElementById("service").value;

    //Making sure that no field is empty
    if (!name || !email || !date || !service) {
        resultDiv.innerHTML = `<div class="alert alert-danger">Please fill out all of the fields.</div>`;
        return; //stop if form is incomplete
    }

    try {
        //Sends booking request to the server
        const response = await fetch("http://localhost:5000/book", {
            method: "POST", //Tells the server that we are sending some data
            headers: {"Content-Type": "application/json"}, //States the format of the data
            body: JSON.stringify({ name, email, date, service }) //Convert JS to JSON
        });

        const data = await response.json();//Convert back to JS


        //If the booking was successful
        if (data.success) {
            resultDiv.innerHTML = `<div class="alert alert-success">${data.reply}</div>`;
            form.reset();
        } else {
            //Server is working fine, user error
            resultDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }

    } catch (err) {
        //Only if request fails (server offline, network error, etc.)
        resultDiv.innerHTML = `<div class="alert alert-danger">Something went wrong. Please try again later.</div>`;
    }
});
