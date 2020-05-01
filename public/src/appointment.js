const tagsInput = document.querySelector("#tags-input");
const tagsDisplay = document.querySelector("#tags");
const tagsListHidden = document.querySelector("#tags-list");

tagsInput.addEventListener("keypress", function (e) {
  let inputText = e.target.value;
  // const lastTypedChar = inputText[inputText.length - 1];

  if (e.key === "Enter") {
    const newLi = document.createElement("li");
    newLi.innerHTML = inputText;
    tagsDisplay.appendChild(newLi);

    if (tagsListHidden.value === "") tagsListHidden.value += inputText;
    else tagsListHidden.value += " " + inputText;

    console.log("tagsListHidden.value", tagsListHidden.value);

    e.target.value = "";
    e.preventDefault()
  }
});

