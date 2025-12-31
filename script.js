const SHEETDB_URL = "https://sheetdb.io/api/v1/uzr5fgk5vik6j"; 
let currentQuestion = "";

async function submitQuestion() {
    const questionText = document.getElementById('userQuestion').value;
    if (!questionText) return alert("Please type a question.");

    currentQuestion = questionText;
    toggleSections('status');

    try {
        const response = await fetch(SHEETDB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: [{
                    question: questionText,
                    timestamp: new Date().toLocaleString(),
                    answer: "" 
                }]
            })
        });

        if (response.ok) {
            document.getElementById('status-text').innerHTML = "Question received. Our expert is reviewing it now. <br><strong>Please keep this tab open.</strong>";
            startPolling();
        }
    } catch (error) {
        alert("Error connecting to the guidance center.");
    }
}

function startPolling() {
    const pollInterval = setInterval(async () => {
        try {
            // Searching specifically for our question
            const response = await fetch(`${SHEETDB_URL}/search?question=${encodeURIComponent(currentQuestion)}`);
            const data = await response.json();

            if (data.length > 0 && data[0].answer !== "") {
                clearInterval(pollInterval);
                playNotification(); // Play sound
                displayAnswer(data[0].answer);
            }
        } catch (error) {
            console.error("Checking for answer...");
        }
    }, 10000); 
}

function playNotification() {
    const sound = document.getElementById('notificationSound');
    sound.play().catch(error => {
        console.log("Audio playback blocked by browser until user interacts with the page.");
    });
}

function displayAnswer(answer) {
    toggleSections('answer');
    const box = document.getElementById('responseBox');
    box.innerText = answer;
    // Add a simple fade-in effect
    box.style.opacity = 0;
    setTimeout(() => { box.style.opacity = 1; box.style.transition = "opacity 1s"; }, 100);
}

function toggleSections(active) {
    document.getElementById('input-section').classList.add('hidden');
    document.getElementById('status-section').classList.add('hidden');
    document.getElementById('answer-section').classList.add('hidden');

    if (active === 'status') document.getElementById('status-section').classList.remove('hidden');
    if (active === 'answer') document.getElementById('answer-section').classList.remove('hidden');
}