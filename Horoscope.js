let userMonth = "October"; // Example input, can be changed to any month

let zodiacSign = "";


// Determine zodiac sign based on the month
if (userMonth === "January") {
    zodiacSign = "♑ Capricorn";
}
else if (userMonth === "February") {
    zodiacSign = "♒ Aquarius";
}
else if (userMonth === "March") {
    zodiacSign = "♓ Pisces";
}
else if (userMonth === "April") {
    zodiacSign = "♈ Aries";
}
else if (userMonth === "May") {
    zodiacSign = "♉ Taurus";
}
else if (userMonth === "June") {
    zodiacSign = "♊ Gemini";
}
else if (userMonth === "July") {
    zodiacSign = "♋ Cancer";
}
else if (userMonth === "August") {
    zodiacSign = "♌ Leo";
}
else if (userMonth === "September") {
    zodiacSign = "♍ Virgo";
}
else if (userMonth === "October") {
    zodiacSign = "♎ Libra";
}
else if (userMonth === "November") {
    zodiacSign = "♏ Scorpio";
}
else if (userMonth === "December") {
    zodiacSign = "♐ Sagittarius";
}
else {
    return console.log("Invalid month");
}

console.log("Your zodiac sign is: " + zodiacSign);

// Random fortune generator
let randomNumber = Math.floor(Math.random() * 10);
let fortunes = [
    "You will have a great day today!",
    "Expect some good news soon.",
    "A new opportunity is on the horizon.",
    "You will meet someone special.",
    "Your hard work will pay off.",
    "A surprise awaits you.",
    "You will find success in your endeavors.",
    "Be cautious with your decisions today.",
    "Trust your instincts.",
    "A positive change is coming."
]

// Select the random fortune and display it
let randomFortune = fortunes[randomNumber];
console.log("Your fortune: " + randomFortune);