const searchButton = document.getElementById("search-btn");
const usernameInput = document.getElementById("user-input");
const statsContainer = document.querySelector(".stats-container");
const easyProgressCircle = document.querySelector(".Easy-progress");
const mediumProgressCircle = document.querySelector(".Medium-progress");
const hardProgressCircle = document.querySelector(".Hard-progress");
const easylabel = document.getElementById("Easy-label");
const mediumlabel = document.getElementById("Medium-label");
const hardlabel = document.getElementById("Hard-label");
const cardStatsContainer = document.querySelector(".stats-card");

function validateUsername(username){
    if(username.trim() == ""){
        alert("User name should not be empty");
        return false;
    }
    const regex = /^[a-zA-Z0-9_-]{1,15}$/;
    const isMatching = regex.test(username);
    if(!isMatching){
        alert("Invalid username");
    }
    return isMatching;
};

async function fetchUserDetails(username){
    try{
        searchButton.textContent="Searching...";
        searchButton.disabled= true;
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/' ;
        const targetUrl = 'https://leetcode.com/graphql/';

        const myHeaders=new Headers();
        myHeaders.append("Content-type","application/json");

        const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { "username": `${username}` }
        })

        const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
        };

        const response = await fetch(proxyUrl+targetUrl, requestOptions);
        if(!response.ok){
            throw new Error("Unable to fetch the User details");
        }
        const parsedData =await response.json();
        console.log("Logging data :",parsedData);
        displayUserData(parsedData);
    }
    catch(error){
        statsContainer.innerHTML = `<p>${error.message}</p>`;
    }
    finally{
        searchButton.textContent="Search";
        searchButton.disabled=false;
    }
}

function updateProgress(solved,total,label,circle){

    const ProgressDegree = (solved/total)*100;
    circle.style.setProperty("--progress-degree",`${ProgressDegree}%`);
    label.textContent = `${solved}/${total}`
}

function displayUserData(parsedData){
    const data = parsedData.data;
    if (!data.matchedUser) {
        statsContainer.innerHTML = `<p>User not found on LeetCode</p>`;
        return;
    }

    const totalQues = parsedData.data.allQuestionsCount[0].count;
    const easyQues = parsedData.data.allQuestionsCount[1].count;
    const mediumQues = parsedData.data.allQuestionsCount[2].count;
    const hardQues = parsedData.data.allQuestionsCount[3].count;

    const solvedTotalQues =  parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
    const solvedeasyQues =   parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
    const solvedmediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
    const solvedhardQues =   parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

    updateProgress(solvedeasyQues,easyQues,easylabel,easyProgressCircle);
    updateProgress(solvedmediumQues,mediumQues,mediumlabel,mediumProgressCircle);
    updateProgress(solvedhardQues,hardQues,hardlabel,hardProgressCircle);

    const cardsData = [
        {label: "Overall Submission",value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
        {label: "Overall Easy Submission",value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
        {label: "Overall Medium Submission",value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
        {label: "Overall Hard Submission",value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions}
    ];

    cardStatsContainer.innerHTML = cardsData
    .map(data=> {
        return `
        <div class="card">
            <h4>${data.label}</h4>
            <p>${data.value}</p>
        </div>
        `
    }).join("");

}

searchButton.addEventListener('click',function(){
    const username=usernameInput.value;
    if(validateUsername(username)){
        fetchUserDetails(username);
    }
})