const JSERVICE_API_URL = "https://jservice.io/api/"
const NUM_CATEGORIES = 6;
const NUM_CLUES = 5;

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    let response = await axios.get(`${JSERVICE_API_URL}categories?count=100`);
    let categoryIds = response.data.map(cat => cat.id);
    const shuffled = [...categoryIds].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, NUM_CATEGORIES);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    let response = await axios.get(`${JSERVICE_API_URL}category?id=${catId}`);
    let category = response.data;
    let allClues = category.clues;
    let shuffled = [...allClues].sort(() => 0.5 - Math.random()).slice(0, NUM_CLUES);
    let clues = shuffled.map(clue => ({
        question: clue.question,
        answer: clue.answer,
        showing: null,
    }));

    return { title: category.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {

    //build table head
    $('#jeopardy thead').empty();
    let $tr = $('<tr>');
    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
        $tr.append($('<th>').text(categories[catIdx].title));
    }    
    $('#jeopardy thead').append($tr);

    //add row for each clue
    $('#jeopardy tbody').empty();
    for(let clueIdx = 0; clueIdx < NUM_CLUES; clueIdx++){
        let $tr = $("<tr>");
        for(let categoryIdx = 0; categoryIdx < NUM_CATEGORIES; categoryIdx++){
            $tr.append($("<td>").attr("id", `${categoryIdx}-${clueIdx}`).text("?"));
        }
        $('#jeopardy tbody').append($tr);
    }


}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let id = evt.target.id;
    let [categoryId, clueId] = id.split("-");
    let clue = categories[categoryId].clues[clueId];

    let message;

    if (!clue.showing){
        msg = clue.question;
        clue.showing = "question";
    } else if (clue.showing === "question"){
        msg = clue.answer;
        clue.showing = "answer";
    } else {
        return
    }

    $(`#${categoryId}-${clueId}`).html(msg);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    let categoryIds = await getCategoryIds();

    categories = [];

    for (let categoryId of categoryIds){
        categories.push(await getCategory(categoryId));
    }

    fillTable();
}

/** On click of start / restart button, set up game. */
$("#restart").on("click", setupAndStart);

// TODO

$(async function() {
    setupAndStart();
    $("#jeopardy").on("click", "td", handleClick);
})