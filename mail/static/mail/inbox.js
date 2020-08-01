document.addEventListener("DOMContentLoaded", function () {





  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  if (mailbox == "show_mail") {
    show_mail();
    return;
  }

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {



      emails.forEach((element) => {
        var item = document.createElement("div");
        if (element.read) {
          item.className = 'alert alert-dark row border border-dark ' ;
        } else {
          item.className = 'alert alert-light row border border-dark font-weight-bold';
        }


        if (mailbox != "sent") {
          sender_recipients = element.sender;
        } else {
          sender_recipients = element.recipients;
        }
        

        item.innerHTML = `
                          
                        <div class="col">${element.subject} </div>
                        <div class="col">${sender_recipients}</div>
                        <div class="col float-right">${element.timestamp}</div>
                         
                          
                          `


        document.querySelector("#emails-view").appendChild(item);
        item.addEventListener("click", () => {
          show_mail(element.id, mailbox);
        });
      });
    });
}

function show_mail(id, mailbox) {
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {

      document.querySelector("#emails-view").innerHTML = "";
      var item = document.createElement("div");
      item.className = `card`;
      

      item.innerHTML = `
      <div class="card" style="width: 18rem;">
      <div class="card-header">
        <h3>${email.subject}</h3><p class="help-text text-muted">subject</p>
      </div>
      <ul class="list-group list-group-flush">
        <li class="list-group-item"><strong> From:</strong> ${email.sender}</li>
        <li class="list-group-item"><strong>to:</strong> ${email.recipients} </li>
    
        <li class="list-group-item"><strong>Date:</strong> ${email.timestamp}</li>
      </ul>
  
      </div>
      <div class="bg-light " style="height:18rem ; padding:20px;">
        <div class="d-flex justify-content-start text-muted">Body</div>
        ${email.body}
      </div>
      
      `




      document.querySelector("#emails-view").appendChild(item);
      if (mailbox == "sent") return;
      let archive = document.createElement("btn");
      archive.className = `btn btn-outline-info my-2`;
      archive.addEventListener("click", () => {
        toggle_archive(id, email.archived);
        if (archive.innerText == "Archive") archive.innerText = "Unarchive";
        else archive.innerText = "Archive";
      });
      if (!email.archived) archive.textContent = "Archive";
      else archive.textContent = "Unarchive";
      document.querySelector("#emails-view").appendChild(archive);

      let reply = document.createElement("btn");
      reply.className = `btn btn-outline-success m-2`;
      reply.textContent = "Reply";
      reply.addEventListener("click", () => {
        reply_mail(email.sender, email.subject, email.body, email.timestamp);
      });
      document.querySelector("#emails-view").appendChild(reply);
      make_read(id);
    });
}

function toggle_archive(id, state) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !state,
    }),
  });
  load_mailbox('inbox');
}

function make_read(id) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}

function reply_mail(sender, subject, body, timestamp) {
  compose_email();
  if (!/^Re:/.test(subject)) subject = `Re: ${subject}`;
  document.querySelector("#compose-recipients").value = sender;
  document.querySelector("#compose-subject").value = subject;

  pre_fill = `On ${timestamp} ${sender} wrote:\n${body}\n`;

  document.querySelector("#compose-body").value = pre_fill;
}