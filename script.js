// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase configuration settings
const appSettings = {
    databaseURL: "https://endorsements-2933d-default-rtdb.firebaseio.com/"
}
// Initialize Firebase app with the provided settings
const app = initializeApp(appSettings);

// Get a reference to the Firebase database
const database = getDatabase(app);

// Reference to the "endorsementList" node in the database
const endorsementListInDB = ref(database, "endorsementList");

// DOM elements
const publishBtnEl = document.getElementById("publish-btn");
const endorsementListEl = document.getElementById("endorsement-list");
const textAreaFieldEL = document.getElementById("textarea-field");
const inputFieldFromEl = document.getElementById("input-field-from");
const inputFieldToEl = document.getElementById("input-field-to");

// Event handler for the "Publish" button
function addPublishBtnEl(event) {
    if (
        event.type === "click" ||
        (event.type === "keydown" && event.key === "Enter")
    ) {
        // Get values from input fields
        const textAreaFieldValue = textAreaFieldEL.value;
        const inputFieldFromValue = inputFieldFromEl.value;
        const inputFieldToValue = inputFieldToEl.value;

        // Create a data item to be pushed to the database
        const dataItem = {
            message: textAreaFieldValue,
            from: inputFieldFromValue,
            to: inputFieldToValue,
            like: 0,
        }

        // Check if the message field is not empty before pushing to the database
        if (!textAreaFieldValue) {
            return;
        }

        // Push the data item to the "endorsementList" node in the database
        push(endorsementListInDB, dataItem);

        // Clear the input fields after publishing
        clearTextField();
    }
}

// Attach event listeners for the "Publish" button
publishBtnEl.addEventListener("click", addPublishBtnEl);
publishBtnEl.addEventListener("keydown", addPublishBtnEl);
publishBtnEl.tabIndex = 0;

// Function to clear the input fields
function clearTextField() {
    textAreaFieldEL.value = "";
    inputFieldFromEl.value = "";
    inputFieldToEl.value = "";
}

// Firebase event listener for changes in the "endorsementList" node
onValue(endorsementListInDB, function (snapshot) {
    // Check if the snapshot contains data
    if (snapshot.exists()) {
        clearEndorsementListEl(); // Prevent re-rendering
        const itemsArray = Object.entries(snapshot.val());

        // Iterate through the items and append them to the endorsement list
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i];
            appendItemToEndorsementListEl(currentItem);
        }
    } else {
        // Display a message if no endorsements are present in the database
        endorsementListEl.innerHTML = "<li class='no-items'>Be the first to endorse...</li>";
    }
})

// Function to clear the content of the shopping list in the UI
function clearEndorsementListEl() {
    endorsementListEl.innerHTML = "";
}

// Function to append a new item to the shopping list in the UI
function appendItemToEndorsementListEl(item) {
    let currentItemID = item[0];
    let currentItemValue = item[1];
    // Create a new list item element
    let newEl = document.createElement("li");

    // Set the innerHTML of the new element with endorsement details
    newEl.innerHTML = `
      <h3>To ${currentItemValue.to}</h3> 
      <p>${currentItemValue.message}</p>
         <div class="meta-container">
            <h3>From ${currentItemValue.from}</h3>
            <div class="likes-counter">
                <button type="button" class="like-btn">🖤</button>
                <span class="count-likes" data-likes="${currentItemValue.like}">${currentItemValue.like}</span>
            </div>
        </div>
    `;
    // Get references to elements within the new endorsement item
    const likeBtn = newEl.querySelector(".like-btn");
    const countLikes = newEl.querySelector(".count-likes");

    // Event listener for the "Like" button
    likeBtn.addEventListener("click", () => {
        let currentLikes = parseInt(countLikes.dataset.likes);
        currentLikes++;
        countLikes.dataset.likes = currentLikes;
        let exactLocationOfItemDB = ref(database, `endorsementList/${currentItemID}/like`);

        // Update the "like" property in the database
        set(exactLocationOfItemDB, currentLikes);
    });

    // Append the new endorsement item to the endorsement list in the UI
    endorsementListEl.append(newEl)
}





