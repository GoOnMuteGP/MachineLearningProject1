```javascript
const csvUpload = document.getElementById("csvUpload");
const selectedFile = document.getElementById("selectedFile");
const processingStatus = document.getElementById("processingStatus");

const totalReviews = document.getElementById("totalReviews");
const positiveReviews = document.getElementById("positiveReviews");
const neutralReviews = document.getElementById("neutralReviews");
const negativeReviews = document.getElementById("negativeReviews");

const insightTableBody = document.getElementById("insightTableBody");

const priorityTarget = document.getElementById("priorityTarget");
const majorProjects = document.getElementById("majorProjects");
const fillIns = document.getElementById("fillIns");
const notImportant = document.getElementById("notImportant");

let reviewData = [];

csvUpload.addEventListener("change", handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    selectedFile.textContent = file.name;
    processingStatus.textContent = "Processing dataset...";

    const reader = new FileReader();

    reader.onload = function (e) {
        const csvText = e.target.result;

        reviewData = parseCSV(csvText);

        generateDashboard(reviewData);

        processingStatus.textContent = "Analysis completed";
    };

    reader.readAsText(file);
}

function parseCSV(csvText) {

    const rows = csvText
        .split("\n")
        .filter(row => row.trim() !== "");

    const headers = rows[0]
        .split(",")
        .map(header => header.trim());

    const data = [];

    for (let i = 1; i < rows.length; i++) {

        const values = rows[i]
            .split(",");

        const rowObject = {};

        headers.forEach((header, index) => {
            rowObject[header] = values[index];
        });

        data.push(rowObject);
    }

    return data;
}

function generateDashboard(data) {

    updateSummaryCards(data);

    const insights = generateInsights(data);

    renderInsightTable(insights);

    renderPriorityMatrix(insights);
}

function updateSummaryCards(data) {

    let positive = 0;
    let neutral = 0;
    let negative = 0;

    data.forEach(review => {

        const text = JSON.stringify(review).toLowerCase();

        const score = calculateSentiment(text);

        if (score > 0) {
            positive++;
        } else if (score < 0) {
            negative++;
        } else {
            neutral++;
        }
    });

    totalReviews.textContent = data.length;
    positiveReviews.textContent = positive;
    neutralReviews.textContent = neutral;
    negativeReviews.textContent = negative;
}

function calculateSentiment(text) {

    const positiveWords = [
        "good",
        "great",
        "excellent",
        "friendly",
        "comfortable",
        "amazing",
        "perfect",
        "satisfied",
        "pleasant",
        "clean"
    ];

    const negativeWords = [
        "bad",
        "delay",
        "late",
        "poor",
        "terrible",
        "dirty",
        "uncomfortable",
        "cancelled",
        "worst",
        "rude"
    ];

    let score = 0;

    positiveWords.forEach(word => {
        if (text.includes(word)) score++;
    });

    negativeWords.forEach(word => {
        if (text.includes(word)) score--;
    });

    return score;
}

function generateInsights(data) {

    const categories = {
        delay: 0,
        staff: 0,
        food: 0,
        seat: 0,
        baggage: 0,
        cleanliness: 0,
        entertainment: 0,
        pricing: 0
    };

    data.forEach(review => {

        const text = JSON.stringify(review).toLowerCase();

        if (text.includes("delay") || text.includes("late"))
            categories.delay++;

        if (
            text.includes("staff") ||
            text.includes("crew") ||
            text.includes("service")
        )
            categories.staff++;

        if (
            text.includes("food") ||
            text.includes("meal")
        )
            categories.food++;

        if (
            text.includes("seat") ||
            text.includes("legroom")
        )
            categories.seat++;

        if (
            text.includes("baggage") ||
            text.includes("luggage")
        )
            categories.baggage++;

        if (
            text.includes("clean") ||
            text.includes("dirty")
        )
            categories.cleanliness++;

        if (
            text.includes("movie") ||
            text.includes("entertainment")
        )
            categories.entertainment++;

        if (
            text.includes("price") ||
            text.includes("expensive")
        )
            categories.pricing++;
    });

    const insights = [];

    Object.entries(categories).forEach(([category, frequency]) => {

        if (frequency === 0) return;

        let priority = "Fill-ins";
        let effort = "Easy";
        let impact = "Low";

        if (frequency > 50) {
            priority = "Priority Target";
            impact = "High";
            effort = "Easy";
        }

        if (frequency > 100) {
            priority = "Major Projects";
            impact = "High";
            effort = "Hard";
        }

        if (frequency < 10) {
            priority = "Not Important";
            impact = "Low";
            effort = "Hard";
        }

        insights.push({
            category,
            frequency,
            priority,
            impact,
            effort,
            sentiment: "Mixed"
        });
    });

    insights.sort((a, b) => b.frequency - a.frequency);

    return insights;
}

function renderInsightTable(insights) {

    if (insights.length === 0) {

        insightTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    No insights generated.
                </td>
            </tr>
        `;

        return;
    }

    let html = "";

    insights.forEach(insight => {

        html += `
        <tr>
            <td>${capitalize(insight.category)}</td>
            <td>
                Customer feedback related to
                ${capitalize(insight.category)}
            </td>
            <td>${insight.frequency}</td>
            <td>${insight.sentiment}</td>
            <td>${insight.priority}</td>
        </tr>
        `;
    });

    insightTableBody.innerHTML = html;
}

function renderPriorityMatrix(insights) {

    priorityTarget.innerHTML = "";
    majorProjects.innerHTML = "";
    fillIns.innerHTML = "";
    notImportant.innerHTML = "";

    insights.forEach(insight => {

        const item = `
            <div class="matrix-item">
                <strong>${capitalize(insight.category)}</strong>
                <br>
                Frequency: ${insight.frequency}
            </div>
        `;

        switch (insight.priority) {

            case "Priority Target":
                priorityTarget.innerHTML += item;
                break;

            case "Major Projects":
                majorProjects.innerHTML += item;
                break;

            case "Fill-ins":
                fillIns.innerHTML += item;
                break;

            case "Not Important":
                notImportant.innerHTML += item;
                break;
        }
    });

    if (priorityTarget.innerHTML === "")
        priorityTarget.innerHTML = "No insights available.";

    if (majorProjects.innerHTML === "")
        majorProjects.innerHTML = "No insights available.";

    if (fillIns.innerHTML === "")
        fillIns.innerHTML = "No insights available.";

    if (notImportant.innerHTML === "")
        notImportant.innerHTML = "No insights available.";
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
```
