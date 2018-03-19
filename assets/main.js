((() => {
    const socket = io();

    document.addEventListener("DOMContentLoaded", () => {
        document.body.style.backgroundColor = 'black';
        let div = document.createElement(`div`);
        document.body.appendChild(div);
        div.id = `main`;
        div.classList.add('contain');
        socket.emit('init', false);
    });

    const users = ({ names, pics }, type, guild_name) => {
        document.getElementById('main').innerHTML = `<h2>Here's a list of every users in <b>${guild_name}</b> excluding <button id="hey" class="btn btn-info">${type}</button></h2>`;
        names.forEach((user, index) => {
            document.getElementById('main').innerHTML += `
            <img src="${pics[index]}" class="user" id="${names[index]}" draggable="false">
            `;
            [].forEach.call(document.getElementsByClassName('user'), el => {
                el.addEventListener('click', ({ target }) => {
                    target.classList.add('anim');
                    setTimeout(() => {
                        target.classList.remove('anim');
                        socket.emit('manageUser', { username: target.id, img: target.src });
                    }, 800);

                });
            });
        });
        document.getElementById('hey').addEventListener('click', e => {
            if (e.target.innerHTML === "bots") {
                document.getElementById('main').innerHTML = "";
                socket.emit('init', true);
            }
            else if (e.target.innerHTML === "members") {
                document.getElementById('main').innerHTML = "";
                socket.emit('init', false);
            }
            else {
                e.target.innerHTML = "bots";
            }
        });
    }

    const manage = user => {
        document.getElementById('main').innerHTML = `
        <div class="row">
        <div class="col-lg-4 back">
            <span id="goback"><i class="far fa-arrow-alt-circle-left fa-3x"></i></span>
        </div>
        <div class="col-lg-4 back" style="text-align: center;">
            <h3>Manage: <b>${user.name}</b></h3>
        </div>
        <div class="col-lg-4">
            <img src="${user.pic}" style="float: right;" class="manageimg">
        </div>
        </div>
        <div class="row" style="margin-bottom: 5px;">
            <div class="col-lg-12">
                <button class="btn btn-primary" style="width: 100%;" id="changeusername">Change username</button>
            </div>
        </div>
        <div class="row" style="margin-bottom: 5px;">
            <div class="col-lg-12">
                <button class="btn btn-primary" style="width: 100%;" id="sendmessage">Send Message</button>
            </div>
        </div>
        <!-- <div class="row">
            <div class="col-lg-12">
                <button class="btn btn-danger" style="width: 100%;">Kick</button>
            </div> Adding this feature soon... -->
        `;
        document.getElementById('goback').addEventListener('click', e => {
            socket.emit('init');
        });

        document.getElementById('changeusername').addEventListener('click', e => {
            let name = prompt("Enter new name:", user.name);
            if (name == null || name == "") {}
            else {
                socket.emit('action', { action: "changeusername", params: [user.name, name] });
                window.location.reload(true); 
            }
        });
        document.getElementById('sendmessage').addEventListener('click', e => {
            let msg = prompt("Enter your message:", `Hi ${user.name}!`);
            if (msg == null || msg == "") {}
            else {
                socket.emit('action', { action: "sendmessage", params: [user.name, msg] });
                window.location.reload(true); 
            }
        });
    }
    socket.on('manage', ({ user }) => manage(user));
    socket.on('init', ({ members, type, guild_name }) => users(members, type, guild_name));
}))();
