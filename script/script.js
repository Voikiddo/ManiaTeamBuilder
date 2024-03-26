// ==== GLOBAL letIABLES ====

// the id in mania_players.csv
// player name is always 0
const AVG_ID = 1;
const SRC_ID = 2;

let Data = [];

// About current shown template
let TemplateColor = "red";
let allTemplateColor = ["red", "orange", "yellow", "lime", "green", "white", "aqua", "blue", "purple", "pink"];

let TemplateTypeId = 0;
let TemplateType = "Mania";
let TemplateTypes = ["Mania"];
let nameColors = {
    "Mania": false
}

let CustomNameSlot = 0;

// About current shown player table
let ShowCurrentPlayers = false;
let CurrentPlayers = [];

// Number to distinguish different img with the same player
let distinguisherNum = 0;

// ========== MAIN ==========

// Get players from csv file
// Draw the player table
$.get("references/mania_players.csv", function(data, status){
    if (status == "success") {
        parseTxt(data);
        drawPlayersTable(Data);
    } else {
        alert("Something's going wrong");
    }
});

// Draw the template
drawTemplate();

// Get the current players
// Or get it from participants.json in reference
// if can't get the API because of CORS
//makeCorsRequest();

// Observe the change of the size, and readjust player slots when it happens
const resize_ob = new ResizeObserver(function() {
    resizeSlots();
});
resize_ob.observe(document.querySelector("#templateDiv"));

// Redraw the player table whenever the serach bar input is changed
$('#searchBar').bind('input', function() { 
    findPlayer($(this).val());
});

// ======= FUNCTIONS ========

// ------- Get Csv Data --------

// Handle the data from csv
// Input: text of csv
function parseTxt(text){
    let rows = text.split('\n');

    for (let row in rows) {
        let cols = rows[row].split(',');

        if (cols.length != 3) continue;

        // use Smajor's pfp if pfp doesn't exist
        if (cols[SRC_ID] == '' || cols[SRC_ID] == '\r') {
            cols[SRC_ID] = 'https://drive.google.com/uc?export=download&id=1rRHRyzX166pbNfk7bwynknW5KqL4NF2m\r';
        }

        Data.push(cols);
    }
}

// ------- Get From API --------
  
// Make the actual CORS request.
function makeCorsRequest() {
    let url = "https://api.mcchampionship.com/v1/participants";
  
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    if (!xhr) {
        alert('CORS not supported');
        return;
    }
  
    xhr.onload = function() {
        let text = xhr.responseText;
        parseJSON(text);
    };
  
    xhr.onerror = function() {
        console.log('Error making the request.');
        $.getJSON("references/participants.json", function(data) {
            processCurrentPlayers(data.data);
        });
    };
  
    xhr.send();
}

// Parse JSON Data about current players
// Input: json data
function parseJSON(text) {
    let response = JSON.parse(text).data;
    processCurrentPlayers(response)
}

// Process current players json data after it's converted
// Input: converted json data
function processCurrentPlayers(res) {
    let allTeams = [res.RED, res.ORANGE, res.YELLOW, res.LIME, res.GREEN, res.AQUA, res.BLUE, res.PURPLE, res.PINK, res.WHITE]
    for (let team of allTeams) {
        if (team != undefined) {
            for (let player of team) {
                let playerData = findPlayerData(player.username)[0];
                if (playerData != undefined) CurrentPlayers.push(playerData);
            }
        }
    }
}

function prepareAddPlayer() {
    $('#pop-on').css('visibility', 'visible');
}

function onPlayerSubmit() {
    let name = $("#inputName").val()
    console.log($("#inputSrc").prop("files")[0]);
    let src = $("#inputSrc").prop("files")[0];

    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        addPlayer(name,event.target.result)
        console.log(event.target.result);
    });
    reader.readAsDataURL(src);  

    hidePopOns()
}

// Add player from local
function addPlayer(name, src, avg=0) {
    Data.unshift([name, avg, src])
    drawPlayersTable(Data)
}

// ------- Draws --------

// Draw the player table on the left
// Input: data = ['player', 'avg points', 'picture url']
function drawPlayersTable(data) {
    if (data == []) return;

    let html = '';
    html += '<button class="playerPic" id="addPlayer" onclick="prepareAddPlayer()">+</button>'
    for (let i=0; i<data.length; i++) {
        html += '<div class="playerDiv" id="div_' + data[i][0] + '"><img class="playerPic" id="' + data[i][0] + '" src=' + data[i][SRC_ID] + ' draggable="true" ondragstart="drag(event)" ondrop = "dropPlayerPic(event)" ondragover="allowDrop(event)"></div>';
    }
    
    $('#playersTable').html(html);
}

// Draw the team template on the right
// Input: templatePath = path from template
function drawTemplate() {
    let templatePath = `references/templates/${TemplateType}/${TemplateColor}.png`
    $('#template').attr("src", templatePath);
    resizeSlots();
}

// Readjust the player slots in the template
function resizeSlots() {
    // player slots
    let templateWidth = $('#template').width();
    let templateHeight = templateWidth * 1080 / 1920;

    let slotSize = templateHeight / 1080 * 352;

    $('#slot1').css('left', 0);
    $('#slot1').css('top', 0);
    $('#slot1').css('width', slotSize);
    $('#slot1').css('height', slotSize);

    $('#nameSlot1').css('left', slotSize + 1/12 * slotSize)
    $('#nameSlot1').css('top', 1/4 * slotSize)
    $('#nameSlot1').css('right', templateWidth / 2 + 1/12 * slotSize)
    $('#nameSlot1').css('height', 1/3 * slotSize)
    
    $('#slot2').css('right', 0);
    $('#slot2').css('top', 0);
    $('#slot2').css('width', slotSize);
    $('#slot2').css('height', slotSize);

    $('#nameSlot2').css('right', slotSize + 1/12 * slotSize)
    $('#nameSlot2').css('top', 1/4 * slotSize)
    $('#nameSlot2').css('left', templateWidth / 2 + 1/12 * slotSize)
    $('#nameSlot2').css('height', 1/3 * slotSize)

    $('#slot3').css('left', 0);
    $('#slot3').css('top', templateHeight-slotSize);
    $('#slot3').css('width', slotSize);
    $('#slot3').css('height', slotSize);

    $('#nameSlot3').css('left', slotSize + 1/12 * slotSize)
    $('#nameSlot3').css('top', templateHeight - slotSize + 1/4 * slotSize)
    $('#nameSlot3').css('right', templateWidth / 2 + 1/12 * slotSize)
    $('#nameSlot3').css('height', 1/3 * slotSize)

    $('#slot4').css('right', 0);
    $('#slot4').css('top', templateHeight-slotSize);
    $('#slot4').css('width', slotSize);
    $('#slot4').css('height', slotSize);

    $('#nameSlot4').css('right', slotSize + 1/12 * slotSize)
    $('#nameSlot4').css('top', templateHeight - slotSize + 1/4 * slotSize)
    $('#nameSlot4').css('left', templateWidth / 2 + 1/12 * slotSize)
    $('#nameSlot4').css('height', 1/3 * slotSize)

    $('#hline1').css('top', 32/33*slotSize)
    $('#hline2').css('top', templateHeight - slotSize - 1/100*slotSize)
}

function responseFontSize(slot) {
    let text = slot.html()
    if (text.length < 10) {
        slot.css('font-size', Math.floor(1.6*slot.width() / 10))
    }
    else {
        slot.css('font-size', Math.floor(1.6*slot.width() / text.length))
    }
}

// ------- Selects --------

// Find the players user searched
// Input: keyword (string)
function findPlayer(keyword) {
    let newData = findPlayerData(keyword) 
    drawPlayersTable(newData);
}

// Find data using current shown data and a keyword
function findPlayerData(keyword) {
    let newData = []
    let usingData = []
    if (ShowCurrentPlayers) usingData = CurrentPlayers;
    else usingData = Data;

    for (let player of usingData) {
        if (player[0].toLowerCase().includes(keyword.toLowerCase())) {
            newData.push(player);
        } else if (keyword.toLowerCase().includes(player[0].toLowerCase())) {
            newData.push(player);
        }
    }

    return newData;
}

// Select current event players & draw players table
// Using Noxcrew's API
function selectCurrentPlayers() {
    ShowCurrentPlayers = !ShowCurrentPlayers;

    if ($("#searchBar").val() != "") findPlayer($("#searchBar").val());
    else if (ShowCurrentPlayers) drawPlayersTable(CurrentPlayers);
    else drawPlayersTable(Data);
}

// Change color of team template
// Input: team color (String)
function selectColor(color) {
    TemplateColor = color;
    drawTemplate();
}

// Change type of team template to the next type, using selectType()
function selectNextType() {
    TemplateTypeId++;
    selectType();
}

// Change type of team template
function selectType() {
    if (TemplateTypeId == TemplateTypes.length) {
        TemplateTypeId = 0;
    }

    TemplateType = TemplateTypes[TemplateTypeId];

    for (let i=1; i<=4; i++) {
        let slotID = '#name' + i;
        if (nameColors[TemplateType]) {
            $(slotID).css('color', "white");
        } else {
            $(slotID).css('color', "black");
        }
    }
    drawTemplate();
}

// Randomly choose 4 people as a team
function selectRandomTeam() {
    let team = [];

    for (let i=0; i<4; i++) {
        let playerN = Math.floor(Math.random() * Data.length);
        team.push(Data[playerN]);
    }

    for (let playerN in team) {
        let playerData = team[playerN];
        let src = playerData[SRC_ID];
        let slotN = parseInt(playerN) + 1;

        $(`#slot${(slotN)}`).empty();

        distinguisherNum++;
        jQuery('<img>', {
            id: playerData[0] + distinguisherNum,
            class: 'playerPic',
            src: src,
            draggable: true,
            ondragstart: 'drag(event)',
            ondrop: 'dropPlayerPicOnT(event)',
        }).appendTo(`#slot${(slotN)}`);

        $(`#name${(slotN)}`).empty();
        $(`#name${(slotN)}`).html(playerData[0]);
    }
}

function randomizer() {
    let randomColorID = Math.floor(Math.random() * allTemplateColor.length);
    selectColor(allTemplateColor[randomColorID]);

    TemplateTypeId = Math.floor(Math.random() * TemplateTypes.length);
    selectType();

    selectRandomTeam();
}

// ------- Finish Team --------

// Generate team picture after clicking the buttom
function finishTeam() {
    alert("Please use your browser's clip function peepoLove")
    // $('#pop-on').css('visibility', 'visible');

    // let team = []
    // for (let i=1; i<=4; i++) {
    //     let playerName = $('#name' + i).html();
    //     if (playerName != "") team.push(playerName);
    // }

    // drawCanvas();
    // calcAvg(team);
}

// Put the full team into a full canvas
function drawCanvas() {
    let templateObj = new Image();
    templateObj.setAttribute('src', $('#template').attr('src'))

    let canvas = document.getElementById("teamCanvas");
    canvas.width = templateObj.naturalWidth;
    canvas.height = templateObj.naturalHeight;

    let context = canvas.getContext("2d");
    context.drawImage( templateObj, 0, 0, templateObj.width, templateObj.height, 0, 0, canvas.width, canvas.height);

    let slotInitX = 140;
    let slotInitY = 325;
    let slotSapaX = 388;

    for (let i=1; i<=4; i++) {
        let x = slotInitX + slotSapaX * (i-1);
        let y = slotInitY;

        let slot = new Image();
        slot.setAttribute('src', $('#slot' + i).children().attr('src'))
        context.drawImage( slot, 0, 0, slot.width, slot.height, x, y, 334, 334);
        
        context.textAlign = 'center';
        context.font = '30px "Minecraftia"'

        if (nameColors[TemplateType]) {
            context.fillStyle = 'white';
        } else {
            context.fillStyle = 'black';
        }

        context.fillText($('#name' + i).html(), 310 + slotSapaX * (i-1), 725);
    }
}

// Calculate average scoring
function calcAvg(team) {
    let totalScore = 0;
    for (let player of team) {
        for (let data of Data) {
            if (player == data[0]) {
                totalScore += parseInt(data[AVG_ID]);
            }
        }
    }

    let avgScore = totalScore / team.length;
    $("#avgScore").html(`Avg: ${avgScore}`);
}

// Hide pop on div after clicking the buttom
function hidePopOns() {
    $('#pop-on').css('visibility', 'hidden');
}

// ------- Custom Name --------
// change the player's name to custom name after clicking ok & hide the div
function changeCustomName() {
    let newName = $("#inputCustomName").val();
    $(`#name${CustomNameSlot}`).html(newName);
    $('#customNameOuterDiv').css('visibility', 'hidden');
    responseFontSize($(`#name${CustomNameSlot}`))
}

// Show the div after clicking player's name on template
function showCustomNameDiv(id) {
    CustomNameSlot = id;
    $("#inputName").val($(`#name${CustomNameSlot}`).html());
    $('#customNameOuterDiv').css('visibility', 'visible');
}

// ------- Drag & Drop --------

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("player_on_drag", ev.target.id);
    ev.dataTransfer.setData("original_slot", ev.target.parentNode.id);
}

// drop at a player slot
function drop(ev) {
    ev.preventDefault();
    let playerID = ev.dataTransfer.getData("player_on_drag");
    let originalSlotID = ev.dataTransfer.getData("original_slot");
    if ($(`#${originalSlotID}`).hasClass("playerDiv")) {
        let src = $(`#${playerID}`).attr('src');
        distinguisherNum++;

        jQuery('<img>', {
            id: playerID + distinguisherNum,
            class: 'playerPic',
            src: src,
            draggable: true,
            ondragstart: 'drag(event)',
            ondrop: 'dropPlayerPicOnT(event)',
        }).appendTo(`#${ev.target.id}`);

        let nameSlot = $(`#name${ev.target.id[4]}`)
        nameSlot.html(playerID);
        responseFontSize(nameSlot);
    } else {
        $(`#${playerID}`).detach().appendTo(`#${ev.target.id}`)

        let originalName = $(`#name${originalSlotID[4]}`);
        let newName = $(`#name${ev.target.id[4]}`);
        responseFontSize($(`#name${ev.target.id[4]}`))

        newName.html(originalName.html());
        originalName.html("");
    }
}

// Drop at player table on the left
function dropPlayerPic(ev) {
    ev.preventDefault();
    let player = $(`#${ev.dataTransfer.getData("player_on_drag")}`);

    if (player.parent().attr('class') == "playerSlot") {
        let slotN = player.parent().attr('id')[4];

        player.parent().html("");
        $(`#name${slotN}`).html("");
        responseFontSize($(`#name${slotN}`));
    }

    return;
}

// Drop at player pic that's in the slot on the template
function dropPlayerPicOnT(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    let originalSlotID = ev.dataTransfer.getData("original_slot");
    if ($(`#${originalSlotID}`).attr('class') == 'playerSlot') {
        // Swap players between slots
        let AN = originalSlotID[4];
        let BN = ev.target.parentNode.id[4];

        // exchange imgs
        let slotA = $(`#${originalSlotID}`);
        let slotB = $(`#slot${BN}`);
        
        let playerAID = slotA.children(":first").attr('id');
        let playerA = $(`#${playerAID}`);

        let playerBID = slotB.children(":first").attr('id');
        let playerB =  $(`#${playerBID}`);

        playerA.detach()
        playerA.appendTo(slotB)
        playerB.detach()
        playerB.appendTo(slotA)

        // exchange names
        let nameA = $(`#name${AN}`);
        let nameB = $(`#name${BN}`);

        let temp = nameA.html();
        nameA.html(nameB.html());
        nameB.html(temp);
        responseFontSize(nameA);
        responseFontSize(nameB);

        return;
    } else {
        // Replace the player on the slot
        let playerID = ev.dataTransfer.getData("player_on_drag");
        let targetSlotID = ev.target.parentNode.id;
        let src = $(`#${playerID}`).attr('src');

        distinguisherNum++
        let newPlayerPic = jQuery('<img>', {
            id: playerID + distinguisherNum,
            class: 'playerPic',
            src: src,
            draggable: true,
            ondragstart: 'drag(event)',
            ondrop: 'dropPlayerPicOnT(event)',
        });
        $( `#${targetSlotID}`).children().replaceWith(newPlayerPic)

        $(`#name${targetSlotID[4]}`).html(playerID);
        responseFontSize( $(`#name${targetSlotID[4]}`));
    }
}