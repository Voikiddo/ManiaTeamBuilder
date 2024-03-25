// ==== GLOBAL VARIABLES ====

// the id in players_csv.csv
// player name is always 0
const AVG_ID = 1;
const SRC_ID = 2;

var Data = [];

// About current shown template
var TemplateColor = "red";
var allTemplateColor = ["red", "orange", "yellow", "lime", "green", "cyan", "aqua", "blue", "purple", "pink"];

var TemplateTypeId = 0;
var TemplateType = "Regular";
var TemplateTypes = ["Regular", "AllStars", "Pride"];
var nameColors = {
    "Regular": false,
    "AllStars": true,
    "Pride": false,
}

var CustomNameSlot = 0;

// About current shown player table
var ShowCurrentPlayers = false;
var CurrentPlayers = [];

// Number to distinguish different img with the same player
var distinguisherNum = 0;

// ========== MAIN ==========

// Get players from csv file
// Draw the player table
$.get("references/players_csv.csv", function(data, status){
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
makeCorsRequest();

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
    var rows = text.split('\n');

    for (var row in rows) {
        var cols = rows[row].split(',');

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
    var url = "https://api.mcchampionship.com/v1/participants";
  
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    if (!xhr) {
        alert('CORS not supported');
        return;
    }
  
    xhr.onload = function() {
        var text = xhr.responseText;
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
    var response = JSON.parse(text).data;
    processCurrentPlayers(response)
}

// Process current players json data after it's converted
// Input: converted json data
function processCurrentPlayers(res) {
    var allTeams = [res.RED, res.ORANGE, res.YELLOW, res.LIME, res.GREEN, res.CYAN, res.AQUA, res.BLUE, res.PURPLE, res.PINK]
    for (var team of allTeams) {
        for (var player of team) {
            var playerData = findPlayerData(player.username)[0];
            if (playerData != undefined) CurrentPlayers.push(playerData);
        }
    }
}

// ------- Draws --------

// Draw the player table on the left
// Input: data = ['player', 'avg points', 'picture url']
function drawPlayersTable(data) {
    if (data == []) return;

    var N = data.length;
    var n = Math.floor(N / 3);
    var r = N % 3;

    var html = '';

    for(let i = 0; i < n; i++) {
        html += '<tr class="playersTR">';
        for (let j = 0; j < 3; j++) {
            var playerN = 3 * i + j;
            html += '<td class="playersTD" id=td_' + i + '_' + j + '>';
            html += '<img class="playerPic" id="' + data[playerN][0] + '" src=' + data[playerN][SRC_ID] + ' draggable="true" ondragstart="drag(event)" ondrop = "dropPlayerPic(event)" ondragover="allowDrop(event)">';
            html += '</td>';
        }
        html += '</tr>';
    }

    if (r != 0) {
        html += '<tr class="playersTR">';
        for (let j = 0; j < r; j++) {
            var playerN = 3 * n + j;
            html += '<td class="playersTD" id=td_' + (n-1) + '_' + j + '>';
            html += '<img class="playerPic" id="' + data[playerN][0] + '" src=' + data[playerN][SRC_ID] + ' draggable="true" ondragstart="drag(event)" ondrop = "dropPlayerPic(event)" ondragover="allowDrop(event)">';
            html += '</td>';
        }
        html += '</tr>';
    }
    
    $('#playersTable').html(html);
}

// Draw the team template on the right
// Input: templatePath = path from template
function drawTemplate() {
    var templatePath = `references/templates/${TemplateType}/${TemplateColor}.webp`
    $('#template').attr("src", templatePath);
    resizeSlots();
}

// Readjust the player slots in the template
function resizeSlots() {
    // player slots
    var templateWidth = $('#template').width();
    var templateHeight = templateWidth * 1000 / 1778;

    var initWidth = templateWidth * 0.079;
    var sepaWidth = templateWidth * 0.2183;
    var initHeight = templateHeight * 0.3246;

    var slotSize = templateWidth * 0.188;
    
    for (let i=1; i<=4; i++) {
        var slotID = '#slot' + i;
        $(slotID).css('left', initWidth + sepaWidth * (i-1));
        $(slotID).css('top', initHeight);
        $(slotID).css('width', slotSize);
        $(slotID).css('height', slotSize);
    }

    // player name slots
    var nameSlotInitWidth = templateWidth * 0.068;
    var nameSlotInitHeight = templateHeight * 0.68;
    var nameSlotWidth = templateWidth * 0.21;
    var nameSlotHeight = templateWidth * 0.07;
    for (let i=1; i<=4; i++) {
        var slotID = '#nameSlot' + i;
        $(slotID).css('left', nameSlotInitWidth + sepaWidth * (i-1));
        $(slotID).css('top', nameSlotInitHeight);
        $(slotID).css('width', nameSlotWidth);
        $(slotID).css('height', nameSlotHeight);
    }

    var nameSize = nameSlotWidth / 10;
    for (let i=1; i<=4; i++) {
        var slotID = '#name' + i;
        $(slotID).css('font-size', nameSize);
    }
}

// ------- Selects --------

// Find the players user searched
// Input: keyword (string)
function findPlayer(keyword) {
    var newData = findPlayerData(keyword) 
    drawPlayersTable(newData);
}

// Find data using current shown data and a keyword
function findPlayerData(keyword) {
    var newData = []
    var usingData = []
    if (ShowCurrentPlayers) usingData = CurrentPlayers;
    else usingData = Data;

    for (var player of usingData) {
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
        var slotID = '#name' + i;
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
    var team = [];

    for (let i=0; i<4; i++) {
        var playerN = Math.floor(Math.random() * Data.length);
        team.push(Data[playerN]);
    }

    for (var playerN in team) {
        var playerData = team[playerN];
        var src = playerData[SRC_ID];
        var slotN = parseInt(playerN) + 1;

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
    var randomColorID = Math.floor(Math.random() * allTemplateColor.length);
    selectColor(allTemplateColor[randomColorID]);

    TemplateTypeId = Math.floor(Math.random() * TemplateTypes.length);
    selectType();

    selectRandomTeam();
}

// ------- Finish Team --------

// Generate team picture after clicking the buttom
function finishTeam() {
    $('#pop-on').css('visibility', 'visible');

    var team = []
    for (let i=1; i<=4; i++) {
        var playerName = $('#name' + i).html();
        if (playerName != "") team.push(playerName);
    }

    drawCanvas();
    calcAvg(team);
}

// Put the full team into a full canvas
function drawCanvas() {
    var templateObj = new Image();
    templateObj.setAttribute('src', $('#template').attr('src'))

    var canvas = document.getElementById("teamCanvas");
    canvas.width = templateObj.naturalWidth;
    canvas.height = templateObj.naturalHeight;

    var context = canvas.getContext("2d");
    context.drawImage( templateObj, 0, 0, templateObj.width, templateObj.height, 0, 0, canvas.width, canvas.height);

    var slotInitX = 140;
    var slotInitY = 325;
    var slotSapaX = 388;

    for (let i=1; i<=4; i++) {
        var x = slotInitX + slotSapaX * (i-1);
        var y = slotInitY;

        var slot = new Image();
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
    var totalScore = 0;
    for (var player of team) {
        for (var data of Data) {
            if (player == data[0]) {
                totalScore += parseInt(data[AVG_ID]);
            }
        }
    }

    var avgScore = totalScore / team.length;
    $("#avgScore").html(`Avg: ${avgScore}`);
}

// Hide pop on div after clicking the buttom
function hidePopOns() {
    $('#pop-on').css('visibility', 'hidden');
}

// ------- Custom Name --------
// change the player's name to custom name after clicking ok & hide the div
function changeCustomName() {
    var newName = $("#inputName").val();
    $(`#name${CustomNameSlot}`).html(newName);
    $('#customNameOuterDiv').css('visibility', 'hidden');
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
    if (ev.target.className == 'playerPic') return;

    var playerID = ev.dataTransfer.getData("player_on_drag");
    var originalSlotID = ev.dataTransfer.getData("original_slot");

    if ($(`#${originalSlotID}`).attr('class') == "playersTD") {
        var src = $(`#${playerID}`).attr('src');
        distinguisherNum++;

        jQuery('<img>', {
            id: playerID + distinguisherNum,
            class: 'playerPic',
            src: src,
            draggable: true,
            ondragstart: 'drag(event)',
            ondrop: 'dropPlayerPicOnT(event)',
        }).appendTo(`#${ev.target.id}`);

        $(`#name${ev.target.id[4]}`).html(playerID);
    } else {
        $(`#${playerID}`).detach().appendTo(`#${ev.target.id}`)

        var originalName = $(`#name${originalSlotID[4]}`);
        var newName = $(`#name${ev.target.id[4]}`);

        newName.html(originalName.html());
        originalName.html("");
    }
}

// Drop at player table on the left
function dropPlayerPic(ev) {
    var player = $(`#${ev.dataTransfer.getData("player_on_drag")}`);

    if (player.parent().attr('class') == "playerSlot") {
        var slotN = player.parent().attr('id')[4];

        player.parent().html("");
        $(`#name${slotN}`).html("");
    }

    return;
}

// Drop at player pic that's in the slot on the template
function dropPlayerPicOnT(ev) {
    var originalSlotID = ev.dataTransfer.getData("original_slot");
    if ($(`#${originalSlotID}`).attr('class') == 'playerSlot') {
        // Swap players between slots
        var AN = originalSlotID[4];
        var BN = ev.target.parentNode.id[4];

        // exchange imgs
        var slotA = $(`#${originalSlotID}`);
        var slotB = $(`#slot${BN}`);
        
        var playerAID = slotA.children(":first").attr('id');
        var playerA = $(`#${playerAID}`);

        var playerBID = slotB.children(":first").attr('id');
        var playerB =  $(`#${playerBID}`);

        playerA.detach().appendTo(`#slot${BN}`)
        playerB.detach().appendTo(`#slot${AN}`)

        // exchange names
        var nameA = $(`#name${AN}`);
        var nameB = $(`#name${BN}`);

        var temp = nameA.html();
        nameA.html(nameB.html());
        nameB.html(temp);

        return;
    } else {
        // Replace the player on the slot
        var playerID = ev.dataTransfer.getData("player_on_drag");
        var targetSlotID = ev.target.parentNode.id;
        var src = $(playerID).attr('src');

        $( `#${targetSlotID}`).html()

        distinguisherNum++
        jQuery('<img>', {
            id: playerID + distinguisherNum,
            class: 'playerPic',
            src: src,
            draggable: true,
            ondragstart: 'drag(event)',
            ondrop: 'dropPlayerPicOnT(event)',
        }).appendTo(`#${targetSlotID}`);

        $(`name${targetSlotID[4]}`).html(playerID);
    }
}