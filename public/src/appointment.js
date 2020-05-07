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

const appointmentForm = document.getElementById('add-appointment');

const tableTypes = {
  waiting: document.querySelector('#waiting-table tbody'),
  attending: document.querySelector('#attending-table tbody'),
  attended: document.querySelector('#done-table tbody'),
}
console.log('tableTypes :>> ', tableTypes);

appointmentForm.addEventListener('submit', (e) => {
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




  fetch('/appointment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
    .then((response) => response.json())
    .then((parsedResponse) => {
      console.log('parsedResponse', parsedResponse)
      const { appointment } = parsedResponse;
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
            <tr>
                <th scope="row">${appointment.code}</th>
                <td>${appointment.fName}</td>
                <td>${appointment.lName}</td>
                <td>
                    ${appointment.tags.reduce((acc, tag) => acc + ` ${tag}`, '')}
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


})

function renderButtons(appointmentObj) {
  if (appointmentObj.status === 'waiting') {
    return ` <a href="/dashboard/to_room/${appointmentObj._id}">
            <button class="btn p-1">TO ROOM</button>
          </a>
            <a href="/dashboard/delete/${appointmentObj._id}/${appointmentObj.status}">
          <button class="btn p-1">DELETE</button>
          </a>`
  } else if (appointmentObj.status === 'attending') {
    return ` <a href="/dashboard/done/${appointmentObj._id}">
              <button class="btn p-1">DONE</button>
          </a>
          <a href="/dashboard/delete/${appointmentObj._id}/${appointmentObj.status}">
              <button class="btn p-1">DELETE</button>
          </a>`

  } else {
    return `
            <a href="/dashboard/delete/${appointmentObj._id}/${appointmentObj.status}">
          <button class="btn p-1">DELETE</button>
          </a>`

  }
}

