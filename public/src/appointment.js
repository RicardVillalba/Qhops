// tags in add appointment form
const tagsInput = document.querySelector("#tags-input");
const tagsDisplay = document.querySelector("#tags");
const tagsListHidden = document.querySelector("#tags-list");

tagsInput.addEventListener("keypress", function (e) {
  let inputText = e.target.value;
  // const lastTypedChar = inputText[inputText.length - 1];

  if (e.key === "Enter") {

    // const newDiv = document.createElement('div')
    const newLi = document.createElement("li");

    // newDiv.innerHTML = `<div class="formbox-appointment"><li>${inputText}</li></div>`



    newLi.innerHTML = inputText;
    tagsDisplay.appendChild(newLi);

    if (tagsListHidden.value === "") tagsListHidden.value += inputText;
    else tagsListHidden.value += " " + inputText;

    console.log("tagsListHidden.value", tagsListHidden.value);

    e.target.value = "";
    e.preventDefault()
  }
});



// axios / fetch to update tables without reloading view
const appointmentForm = document.getElementById('add-appointment');

const tableTypes = {
  waiting: document.querySelector('#waiting-table tbody'),
  attending: document.querySelector('#attending-table tbody'),
  attended: document.querySelector('#done-table tbody'),
}
console.log('tableTypes :>> ', tableTypes);

appointmentForm.addEventListener('submit', (e) => {
  appointmentForm.classList.toggle('open')

  e.preventDefault()
  const body = {
    fName: document.getElementById('fName').value,
    lName: document.getElementById('lName').value,
    email: document.getElementById('email').value,
    tagsList: document.getElementById('tags-list').value,
    isUrgent: document.getElementById('isUrgent').value,
    status: document.querySelector('input[name=status]:checked').value
  };
  console.log('body', body)


  // fetch('/appointment', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(body)
  // })
  // .then((response) => response.json())

  setTimeout(() => {

    axios.post('/appointment', body)

      .then((response) => {
        console.log('response', response)
        const { appointment } = response.data;

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <tr>
                <th scope="row">${appointment.code}</th>
                <td>${appointment.fName}</td>
                <td>${appointment.lName}</td>
                <td>
                    ${appointment.tags.reduce((acc, tag) => acc + ` ${tag}`)}
                </td>
                <td>${appointment.email}</td>

                <td>
                   ${renderButtons(appointment)}

                </td>
            </tr >
            `;
        const table = tableTypes[appointment.status];
        table.appendChild(newRow);

      })
  }, 1800)
  document.getElementById('fName').value = ''
  document.getElementById('lName').value = ''
  document.getElementById('email').value = ''
  document.getElementById('tags-list').value = ''
  document.getElementById('isUrgent').value = ''
  document.getElementById('waiting').checked = true
  document.getElementById('tags').innerHTML = ''
  
})


//helper function to render the right buttons depending of appointment status 
//(waiting, attending or attended)

function renderButtons(appointmentObj) {
  if (appointmentObj.status === 'waiting') {
    return ` 
            <a href="/dashboard/delete/${appointmentObj._id}/${appointmentObj.status}">
            <button class="btn p-1 float-right">DELETE</button>
            </a>
            <a href="/dashboard/to_room/${appointmentObj._id}">
            <button class="btn p-1 float-right">ROOM</button>
            </a> 
          `
  } else if (appointmentObj.status === 'attending') {
    return `
          <a href="/dashboard/delete/${appointmentObj._id}/${appointmentObj.status}">
              <button class="btn p-1 float-right">DELETE</button>
          </a>
          <a href="/dashboard/done/${appointmentObj._id}">
          <button class="btn p-1 float-right">DONE</button>
          </a>
          `

  } else {
    return `
            <a href="/dashboard/delete/${appointmentObj._id}/${appointmentObj.status}">
          <button class="btn p-1 float-right">DELETE</button>
          </a>`

  }
}


const addButton = document.getElementById('addButton')
addButton.addEventListener('click', (e) => {
  appointmentForm.classList.toggle('open')
})
