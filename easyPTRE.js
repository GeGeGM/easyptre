// ==UserScript==
// @name         EasyPTRE
// @namespace    https://openuserjs.org/users/GeGe_GM
// @version      0.1.1
// @description  Plugin to use PTRE's basics features with AGR. Check https://ptre.chez.gg/
// @author       GeGe_GM
// @license      MIT
// @copyright    2022, GeGe_GM
// @match        https://*.ogame.gameforge.com/game/*
// @updateURL    https://openuserjs.org/meta/GeGe_GM/easyptre.meta.js
// @downloadURL  https://openuserjs.org/install/GeGe_GM/easyptre.user.js
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==


var toolName              = 'EasyPTRE';
var serveur               = document.getElementsByName('ogame-universe')[0].content;
var splitted = serveur.split('-');
var universe = splitted[0].slice(1);
var splitted2 = splitted[1].split('.');
var country = splitted2[0];
var galaxyContentLinkTest = "https:\/\/"+serveur+"\/game\/index.php?page=ingame&component=galaxy&action=fetchGalaxyContent&ajax=1&asJson=1";
var userPlayerID          = document.getElementsByName('ogame-player-id')[0].content;
var listenerGala          = false;
var lastActivitiesGalaSent = 0;
var lastActivitiesSysSent = 0;

// GM keys
var ptreTeamKey = "ptre-" + country + "-" + universe + "-TK";
var ptreUseAGRList = "ptre-" + country + "-" + universe + "-UseAGRList";
var ptrePTREPlayerListJSON = "ptre-" + country + "-" + universe + "-PTREPlayerListJSON";
var ptreAGRPlayerListJSON = "ptre-" + country + "-" + universe + "-AGRPlayerListJSON";

// Images
var imgPTRE      = 'https://i.ibb.co/qpLLSD4/PTREicon.png';
var imgPTREgreen = 'https://i.ibb.co/nrprJWj/sendREOK.png';
var imgAddPlayer = 'https://i.ibb.co/ZXhMk4v/ajouter-Joueur-Liste.png';
var imgSupPlayer = 'https://i.ibb.co/D9m73bm/retirer-Joueur-Liste.png';
var imgPTREred   = 'https://i.ibb.co/fCZwdB2/PTREicon-Rouge.png';

// Settings
var ptreMessageDisplayTime = 5;
var menuImageDisplayTime   = 3;
var ptreMenuDisplayTime    = 3;
var ptreTargetListMaxSize  = 15;

// PTRE URLs
var urlPTREImportSR    = 'https://ptre.chez.gg/scripts/oglight_import.php?tool='+toolName;
var URLapiSendActiPTRE = "https://ptre.chez.gg/scripts/oglight_import_player_activity.php?tool="+toolName

// TODO: DELETE
var urlAPIPlayerOgame = "https://"+serveur+"/api/playerData.xml?id=123886"



// Add PTRE menu to OGame menu
if (!/page=standalone&component=empire/.test(location.href))
{
    // Bouton options
    var aff_option = '<span class="menu_icon"><a id="iconeUpdate" href="https://ptre.chez.gg" target="blank_" ><img id="imgPTREmenu" class="mouseSwitch" src="' + imgPTRE + '" rel="' + imgPTRE + '" height="26" width="26"></a></span>';
    aff_option += '<a id="affOptionsPTRE" class="menubutton " href="#" accesskey="" target="_self"><span  class="textlabel">' + toolName + '</span></a>';

    var tab = document.createElement("li");
    tab.innerHTML = aff_option;
    tab.id = 'optionPTRE';
    document.getElementById('menuTableTools').appendChild(tab);

    document.getElementById('affOptionsPTRE').addEventListener("click", function (event)
    {
        displayPTRETeamKeyMenu();
    }, true);
}

// Galaxy page: Send activities
if (/page=ingame&component=galaxy/.test(location.href)){
    console.log("Galaxy detected");
    var mode = 1;

    

    if (mode == 1) {
        var interSendActi = setInterval(sendGalaxyActivities, 1000);
        var interListePlayer = setInterval(addPTREStuffsToGalaxyPage, 800);
    } else {
        setTimeout(addPTREStuffsToGalaxyPage, 800);
        setTimeout(sendGalaxyActivities, 1000);
    }
}

// Add PTRE send SR button to messages page
if (/page=messages/.test(location.href))
{
    if (GM_getValue(ptreTeamKey) != '') {
        var interGetRE = setInterval(addPTRESendSRButtonToMessagesPage, 800);
    }
}


// *** *** ***
// FUNCTIONS
// *** *** ***

// Displays PTRE responses messages
// Responses from server
function displayPTREMessage(message) {
    var divPTREMessage = '<div id="boxPTREMessage" style="padding:10px;z-index: 1000;position: fixed; bottom: 30px; left: 10px; border: solid black 2px; background:rgba(0,26,52,0.8);">PTRE: <span id="ptreMessage">' + message + '</span></div>';

    var boxPTREMessage = document.createElement("div");
    boxPTREMessage.innerHTML = divPTREMessage;
    boxPTREMessage.id = 'boxPTREMessage';

    if (document.getElementById('links')) {
        document.getElementById('links').appendChild(boxPTREMessage);
        setTimeout(function() {document.getElementById('boxPTREMessage').remove();}, ptreMessageDisplayTime * 1000);
    }
}

// Display message under galaxy view
function displayPTREGalaxyMessage(message) {
    if (document.getElementById("ptreSpanGalaxyMessageD")) {
        document.getElementById("ptreSpanGalaxyMessageD").innerHTML = "PTRE: " + message;
    } else {
        console.log("[PTRE] Error. Cant display: " + message);
    }
}

// Detects if AGR is enabled
function isAGREnabled() {
    if (document.getElementById('ago_panel_Player')) {
        return true;
    }
    return false;
}

function buildPTRELinkToPlayer(playerID) {
    return 'https://ptre.chez.gg/?country=' + country + '&univers=' + universe + '&player_id=' + playerID;
}

// Displays PTRE settings
function displayPTRETeamKeyMenu() {

    if (!document.getElementById('btnSaveOptPTRE')) {
        var useAGR = '';
        var ptreStoredTK = GM_getValue(ptreTeamKey, '');
        var divPTRE = '<div id="boxPTREsetOpt" style="padding:10px;z-index: 1000;position: fixed; bottom: 30px; left: 10px; border: solid black 2px; background:rgba(0,26,52,0.8);"><table border="1">';
        divPTRE += '<tr><td><b>PTRE PANNEL (' + country + '-' + universe + ')</b></td><td align="right"><input style="margin-top:5px;" id="btnSaveOptPTRE" type="button" value="SAVE" style="cursor:pointer;" /></td></tr>';
        divPTRE += '<tr><td align="center" colspan="2"><span id="msgErrorPTRESettings"></span></td></tr>';
        divPTRE += '<tr><td align="center" colspan="2"><hr /></td></tr>';
        divPTRE += '<tr><td align="center" colspan="2"><div style="margin-top:10px;">PTRE Settings</div></td></tr>';
        divPTRE += '<tr><td><div style="margin-top:10px;">PTRE Team Key:</div></td><td align="center"><div style="margin-top:10px;"><input style="width:160px;" type="text" id="ptreTK" value="'+ ptreStoredTK +'"></div></td></tr>';

        divPTRE += '<tr><td style="margin-top:5px;">Use AGR Targets List:</td>';
        // If AGR is detected
        if (isAGREnabled()) {
            useAGR = (GM_getValue(ptreUseAGRList, 'true') == 'true' ? 'checked' : '');
            divPTRE += '<td align"="center"><input id="PTREuseAGRCheck" type="checkbox" ';
            divPTRE += useAGR;
            divPTRE += ' /></td></tr>';
        } else {
            divPTRE += '<td align="center"><span style="color:red;font-weight:bold;">AGR is not enabled!</span></td></tr>';
        }

        divPTRE += '<tr><td align="center" colspan="2"><hr /></td></tr>';
        divPTRE += '<tr><td align="center" colspan="2"><div style="margin-top:10px;">PTRE Targets list</div></td></tr>';
        // If PTRE Player list is used instead of AGR player list
        if (useAGR != 'checked') {
            var targetJSON = GM_getValue(ptrePTREPlayerListJSON, '');
            if (targetJSON != '') {
                var targetList = JSON.parse(targetJSON);
            }
            if (!targetList) {
                divPTRE += '<tr><td align="center" colspan="2"><div style="margin-left:30px;">Empty: Add player via galaxy view</div></td></tr>';
            } else {
                $.each(targetList, function(i, PlayerCheck) {
                    //console.log(PlayerCheck);
                    divPTRE += '<tr><td><a id="checkedPlayer'+PlayerCheck.id+'" idplayer="'+PlayerCheck.id+'" style="margin-left:3px;cursor:pointer;">- '+PlayerCheck.pseudo+'</a></td><td align="center"><a href="' + buildPTRELinkToPlayer(PlayerCheck.id) + '" target="_blank">PTRE Profile</a></td></tr>';
                });
            }
        } else {
            divPTRE += '<tr><td align="center" colspan="2"><div style="margin-top:10px;">You are using AGR target list</div></td></tr>';
        }

        divPTRE += '<tr><td align="center" colspan="2"><hr /></td></tr>';
        divPTRE += '<tr><td align="center" colspan="2"><a href="https://ptre.chez.gg/" target="_blank">PTRE</a> | <a href="https://discord.gg/WsJGC9G" target="_blank">Discord</a></td></tr>';

        //fin div table tr
        divPTRE += '</table></div>';

        var eletementSetPTRE = document.createElement("div");
        eletementSetPTRE.innerHTML = divPTRE;
        eletementSetPTRE.id = 'divPTRESetOpt';

        if (document.getElementById('links')) {
            document.getElementById('links').appendChild(eletementSetPTRE);
        }

        if (useAGR != 'checked') {
            $.each(targetList, function(i, PlayerCheck) {
                document.getElementById('checkedPlayer'+PlayerCheck.id).addEventListener("click", function (event)
                { // On affiche les coords du joueur
                    afficheCoordJoueur();
                });
            });
        }

        document.getElementById('btnSaveOptPTRE').addEventListener("click", function (event)
        { // Save PTRE Team Key
            var newTK = document.getElementById('ptreTK').value;
            // Check PTRE Team Key Format
            if (newTK.replace(/-/g, '').length == 18 && newTK.substr(0,2) == 'TM') {
                // If new TK, store it
                if (newTK != ptreStoredTK) {
                    GM_setValue(ptreTeamKey, document.getElementById('ptreTK').value);
                }
                // Update AGR setting
                GM_setValue(ptreUseAGRList, document.getElementById('PTREuseAGRCheck').checked + '');
                // Update menu image and remove it after 3 sec
                document.getElementById('imgPTREmenu').src = imgPTREgreen;
                setTimeout(function() {document.getElementById('imgPTREmenu').src = imgPTRE;}, menuImageDisplayTime * 1000);
                // Display OK message and remove div after 5 sec
                document.getElementById('msgErrorPTRESettings').innerHTML = 'Team Key Format OK';
                setTimeout(function() {document.getElementById('boxPTREsetOpt').parentNode.removeChild(document.getElementById('boxPTREsetOpt'));}, ptreMenuDisplayTime * 1000);
            } else {
                document.getElementById('msgErrorPTRESettings').innerHTML = 'Wrong Team Key Format';
            }
        });
    }
}

// Remove player from PTRE list
function deletePlayerFromList(playerId, playerPseudo, type) {

    // Check if player is part of the list
    if (isPlayerInList(playerId, playerPseudo)) {
        // Get list content depending on if its PTRE or AGR list
        var targetJSON = '';
        if (type == 'PTRE') {
            targetJSON = GM_getValue(ptrePTREPlayerListJSON, '');
        } else if (type == 'AGR') {
            targetJSON = GM_getValue(ptreAGRPlayerListJSON, '');
        }
        var targetList = [];
        var idASup = '_';
        if (targetJSON != '') {
            targetList = JSON.parse(targetJSON);
        }

        $.each(targetList, function(i, PlayerCheck) {
            if (PlayerCheck.id == playerId) {
                idASup = i;
            } else if (PlayerCheck.pseudo == playerPseudo) {
                // TOTO: Pourquoi est ce qu'on test le pseudo ? 
                // On ne devrait se baser que sur l'ID
                idASup = i;
            }
        });

        if (idASup != '_') {
            targetList.splice(idASup, 1);
        }

        // Save list
        targetJSON = JSON.stringify(targetList);
        if (type == 'PTRE') {
            GM_setValue(ptrePTREPlayerListJSON, targetJSON);
        } else if (type == 'AGR') {
            GM_setValue(ptreAGRPlayerListJSON, targetJSON);
        }
        //console.log(type + " list updated (deletePlayerFromList fct)");

        return 'Player was remove from ' + type + ' list';
    } else {
        return 'Player is not part of ' + type + ' list';
    }
}

// Add player to PTRE list
function addPlayerToList(playerId, playerPseudo, type) {

    // Check if player is part of the list
    if (!isPlayerInList(playerId, playerPseudo, type)) {
        // Get list content depending on if its PTRE or AGR list
        var targetJSON = '';
        if (type == 'PTRE') {
            targetJSON = GM_getValue(ptrePTREPlayerListJSON, '');
        } else if (type == 'AGR') {
            targetJSON = GM_getValue(ptreAGRPlayerListJSON, '');
        }

        var targetList = [];
        if (targetJSON != '') {
            targetList = JSON.parse(targetJSON);
        }
        if (type == 'PTRE' && targetList.length >= ptreTargetListMaxSize) {
            return type + ' targets list is full, please remove a target';
        } else {
            // Add player to list
            var player = {id: playerId, pseudo: playerPseudo};
            targetList.push(player);

            // Save list
            targetJSON = JSON.stringify(targetList);
            if (type == 'PTRE') {
                GM_setValue(ptrePTREPlayerListJSON, targetJSON);
            } else if (type == 'AGR') {
                GM_setValue(ptreAGRPlayerListJSON, targetJSON);
            }
            //console.log('Player ' + playerPseudo + ' has been added to ' + type + ' list');
            //console.log(type + " list updated (addPlayerToList fct)");
            return 'Player has been added to ' + type + ' list';
        }
    } else {
        return 'Player is already in ' + type + ' list';
    }
}

// Add PTRE button to spy reports
function addPTRESendSRButtonToMessagesPage() {

    if (document.getElementById('subtabs-nfFleet20')) {
        if (/ui-tabs-active/.test(document.getElementById('subtabs-nfFleet20').className) && !document.getElementById('PTREspan')) {
            var listMsg = $("li.msg ");
            var tabMsg = [];
            if (listMsg.length > 0) {
                //clearInterval(interGetRE);
                jQuery.each(listMsg, function(i, msgI) {
                    //console.log(i +' val: '+ element.innetHTML);
                    var idMsg = msgI.getAttributeNode("data-msg-id").value;
                    if (msgI.getElementsByClassName('icon_nf icon_apikey')[0]) {
                        var apiKeyRE = /((sr)-[a-z]{2}-[0-9]+-[0-9a-z]+)/.exec(msgI.getElementsByClassName('icon_nf icon_apikey')[0].title)[0];
                        //console.log(apiKeyRE);
                        var spanBtnPTRE = document.createElement("span"); // Create new div
                        spanBtnPTRE.innerHTML = '<a class="tooltip" target="ptre" title="Envoyer le rapport sur '+toolName+'"><img id="sendRE-' + apiKeyRE + '" apikey="' + apiKeyRE + '" style="cursor:pointer;" class="mouseSwitch" src="' + imgPTRE + '" rel="' + imgPTRE + '" height="26" width="26"></a>';
                        spanBtnPTRE.id = 'PTREspan';
                        msgI.getElementsByClassName('msg_actions clearfix')[0].appendChild(spanBtnPTRE);
                        document.getElementById('sendRE-' + apiKeyRE).addEventListener("click", function (event) { 
                            apiKeyRE = this.getAttribute("apikey");
                            var TKey = GM_getValue(ptreTeamKey, '');
                            if (TKey != '') {
                                var urlPTRESpy = urlPTREImportSR + '&team_key=' + TKey + '&sr_id=' + apiKeyRE;
                                $.ajax({
                                    dataType: "json",
                                    url: urlPTRESpy,
                                    success: function(reponse) {
                                        console.log(reponse);
                                        if (reponse.code == 1) {
                                            document.getElementById('sendRE-'+apiKeyRE).src = imgPTREgreen;
                                        } else {
                                            document.getElementById('sendRE-'+apiKeyRE).src = imgPTREred;
                                        }
                                        displayPTREMessage(reponse.message);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    }
}

// Add buttons to galaxy
function addPTREStuffsToGalaxyPage() {
    //console.log("addPTREStuffsToGalaxyPage: Updating galaxy");

    // Add PTRE debug message Div
    if (!document.getElementById("ptreGalaxyMessageD")) {
        var spanPTREGalaxyMessageD = '<span id="ptreSpanGalaxyMessageD" style="color:green;font-weight:bold;"></span>';
        var divPTREGalaxyMessageD = document.createElement("div");
        divPTREGalaxyMessageD.innerHTML = spanPTREGalaxyMessageD;
        divPTREGalaxyMessageD.id = 'ptreGalaxyMessageD';
        document.getElementsByClassName('galaxyRow ctGalaxyFleetInfo')[0].appendChild(divPTREGalaxyMessageD);
        console.log("ADD DEBUG DIV");
    }

    if (GM_getValue(ptreUseAGRList) == 'true'){
        return;
    }

    var galaxy = document.getElementsByClassName('galaxyRow ctContentRow ');
    var nbBtnPTRE = 0;
    if (!document.getElementById('spanAddPlayer0') && !document.getElementById('spanSuppPlayer0')) {
        $.each(galaxy, function(nb, lignePosition) {
            if (lignePosition.children[7] != '') {
                var actionPos = lignePosition.children[7];
                if (actionPos.innerHTML != '') {
                    //clearInterval(interListePlayer);
                    var playerId = actionPos.children[1].getAttributeNode('data-playerid').value;
                    var playerInfo = lignePosition.children[5];
                    if (playerInfo.children[0]) {
                        var playerPseudo = playerInfo.children[0].innerText;
                        var notIna = true;
                        var inaPlayer = playerInfo.children[1].innerText;
                        if (playerPseudo == '') {
                            playerPseudo = playerInfo.children[1].innerText;
                            inaPlayer = playerInfo.children[2].innerText;
                        }
                        if (isAGREnabled()) {
                            inaPlayer = playerInfo.children[0].innerText;
                            inaPlayer = inaPlayer.substr(-4, 4);
                            var indexPseudo = playerPseudo.search(/\n/);
                            playerPseudo = playerPseudo.substr(0, indexPseudo);
                        }
                        if (inaPlayer == ' (i)' || inaPlayer == ' (I)') {
                            notIna = false;
                        }
                        //console.log('id : '+playerId+' pseudo :'+playerPseudo+' ina :'+inaPlayer);
                        var isInList = isPlayerInList(playerId, playerPseudo);
                        if (!isInList && notIna) {
                            var AddPlayerCheck = '<a class="tooltip" id="addcheckptr_'+nbBtnPTRE+'" title="Ajouter ce joueur a la liste PTRE" style="cursor:pointer;"><img class="mouseSwitch" src="' + imgAddPlayer + '" rel="' + imgAddPlayer + '" height="20" width="20"></a>';
                            var btnAddPlayer = document.createElement("span");
                            btnAddPlayer.innerHTML = AddPlayerCheck;
                            btnAddPlayer.id = 'spanAddPlayer'+nbBtnPTRE;
                            lignePosition.children[7].appendChild(btnAddPlayer);//
                            document.getElementById('addcheckptr_'+nbBtnPTRE).addEventListener("click", function (event)
                            {
                                //alert('J ajoute le joueur '+playerPseudo+' '+playerId);
                                var retAdd = addPlayerToList(playerId, playerPseudo, 'PTRE');
                                displayPTREMessage(retAdd);
                            }, true);
                            nbBtnPTRE++;
                        } else if (isInList) {
                            var SupPlayerCheck = '<a class="tooltip" id="suppcheckptr_'+nbBtnPTRE+'" title="Retirer ce joueur de la liste PTRE" style="cursor:pointer;"><img class="mouseSwitch" src="' + imgSupPlayer + '" rel="' + imgSupPlayer + '" height="20" width="20"></a>';
                            var btnSupPlayer = document.createElement("span");
                            btnSupPlayer.innerHTML = SupPlayerCheck;
                            btnSupPlayer.id = 'spanSuppPlayer'+nbBtnPTRE;
                            lignePosition.children[7].appendChild(btnSupPlayer);//
                            document.getElementById('suppcheckptr_'+nbBtnPTRE).addEventListener("click", function (event)
                            {
                                var retSupp = deletePlayerFromList(playerId, playerPseudo, 'PTRE');
                                displayPTREMessage(retSupp);
                            }, true);
                            nbBtnPTRE++;
                        }
                    }
                }
            }
        });
    }
}

// Function called on galaxy page
function sendGalaxyActivities(){

    var systemElem = $("input#system_input")[0];
    var galaxyElem = $("input#galaxy_input")[0];
    var galaxy = galaxyElem.value;
    var system = systemElem.value;
    var newSs = galaxy+':'+system;

    if (galaxy == lastActivitiesGalaSent && system == lastActivitiesSysSent) {
        return;
    }

    lastActivitiesGalaSent = galaxy;
    lastActivitiesSysSent = system;

    console.log("Checking system " + galaxy + '.' + system);

    if (0 === galaxy.length || $.isNumeric(+galaxy) === false) {
        galaxy = 1;
    }
    if (0 === system.length || $.isNumeric(+system) === false) {
        system = 1;
    }
    console.log("Sending Activities for: " + galaxy + '.' + system);
    displayPTREGalaxyMessage("Sending Activities for: " + galaxy + '.' + system);
    recupGalaRender(galaxy, system);

}

function debugListContent(type = 'PTRE') {

    var targetJSON = '';
    if (type == 'PTRE') {
        targetJSON = GM_getValue(ptrePTREPlayerListJSON, '');
    } else if (type == 'AGR') {
        targetJSON = GM_getValue(ptreAGRPlayerListJSON, '');
    }
    var targetList = JSON.parse(targetJSON);
    console.log(type + "list: ");
    console.log(targetList);
}

// Check is player is in list
function isPlayerInList(playerId, playerPseudo, type = 'PTRE') {

    var targetJSON = '';
    if (type == 'PTRE') {
        targetJSON = GM_getValue(ptrePTREPlayerListJSON, '');
    } else if (type == 'AGR') {
        targetJSON = GM_getValue(ptreAGRPlayerListJSON, '');
    }

    var ret = false;
    if (targetJSON != '') {
        var targetList = JSON.parse(targetJSON);

        $.each(targetList, function(i, PlayerCheck) {
            if (PlayerCheck.id == playerId) {
                ret = true;
            } else if (PlayerCheck.pseudo == playerPseudo) {
                ret = true;
            }
        });
    }
    return ret;
}

// Copy AGR internal players list to local AGR list
function updateLocalAGRList() {
    var tabAgo = document.getElementsByClassName('ago_panel_overview');
    var listeJoueurAGR = [];
    var targetJSON = GM_getValue(ptreAGRPlayerListJSON, '');
    var targetList = [];
    var idASup = [];
    if (targetJSON != '') {
        targetList = JSON.parse(targetJSON);
    }

    $.each(tabAgo[1].children, function(i, ligneJoueurAGR) {
        if (ligneJoueurAGR.getAttributeNode('ago-data')) {
            var txtjsonDataAgo = ligneJoueurAGR.getAttributeNode('ago-data').value;
            var jsonDataAgo = JSON.parse(txtjsonDataAgo);
            var IdPlayer = jsonDataAgo.action.id;
            var PseudoPlayer = ligneJoueurAGR.children[1].innerText;
            //console.log('AGR native list member: ' + PseudoPlayer + ' (' + IdPlayer + ')');
            var playerAGR = {id: IdPlayer, pseudo: PseudoPlayer};
            listeJoueurAGR.push(playerAGR);

            if (!isPlayerInList(IdPlayer, PseudoPlayer, 'AGR')) {
                var retAdd = addPlayerToList(IdPlayer, PseudoPlayer, 'AGR');
                //alert(retAdd);
            }
        }
    });

    // Remove targets from AGR list if not present in AGR native list
    var joueurAGRSup = false;
    $.each(targetList, function(i, PlayerCheck) {
        var find = false;
        $.each(listeJoueurAGR, function(j, PlayerListActu) {
            if (PlayerListActu.id == PlayerCheck.id) {
                find = true;
            }
        });
        if (!find) {
            idASup.push(i);
            joueurAGRSup = true;
        }
    });

    $.each(idASup, function(i, val) {
        targetList.splice(val, 1);
    });

    if (joueurAGRSup) {
        targetJSON = JSON.stringify(targetList);
        GM_setValue(ptreAGRPlayerListJSON, targetJSON);
        //console.log(type + " list updated (updateLocalAGRList fct)");
    }
}


function recupGalaRender(galaxy, system){

    $.post(galaxyContentLinkTest, {
      galaxy: galaxy,
      system: system
    }, displayGalaxyRender);
}

function displayGalaxyRender(data){

    var json = $.parseJSON(data);
    var systemPos = json.system.galaxyContent;
    var tabActiPos = [];
    var galaxy = "";
    var system = "";
    var jsonSystem = '';
    var ptreStoredTK = GM_getValue(ptreTeamKey, '');

    var type = 'PTRE';
    if (GM_getValue(ptreUseAGRList) == "true"){
        type = 'AGR';
        // Update AGR local list
        updateLocalAGRList();
    }
    debugListContent(type);

    $.each(systemPos, function(pos, infoPos){

        if (infoPos.player){
            var player_id = infoPos.player['playerId'];
            var player_name = infoPos.player['playerName'];
            //console.log(infoPos);
            if (isPlayerInList(player_id, player_name, type)){
                var ina = infoPos.positionFilters;

                if (player_id != 99999 && !/inactive_filter/.test(ina)){
                    galaxy = infoPos.galaxy;
                    system = infoPos.system;
                    var position = infoPos.position;
                    var coords = galaxy+":"+system+":"+position;

                    console.log(infoPos);
                    var planete = infoPos.planets;
                    var planet_id = planete[0]['planetId'];
                    var planet_name = planete[0]['planetName'];
                    var planet_acti = planete[0]['activity']['showActivity'];

                    // Update activities to OGLight format
                    if (planet_acti == '15') {
                        planet_acti = '*';
                    } else if (planet_acti == '60') {
                        planet_acti = planete[0]['activity']['idleTime'];
                    } else if (!planet_acti) {
                        planet_acti = '60';
                    }
                    //console.log("PLANET: " + planete);

                    // If their is a debris fiel AND/OR a moon
                    if (planete.length > 1) {
                        // Search Moon index
                        var moonIndex = -1;
                        if (planete[1]['planetType'] == 3) {
                            moonIndex = 1;
                        } else if (planete[2]['planetType'] == 3) {
                            moonIndex = 2;
                        }
                        if (moonIndex != -1) {
                            //console.log("MOON => " + planete[1]);
                            var lune_id = planete[moonIndex]['planetId'];
                            var lune_size = planete[moonIndex]['size'];
                            var lune_acti = planete[moonIndex]['activity']['showActivity'];
                            // Update activities to OGLight format
                            if (lune_acti == '15') {
                                lune_acti = '*';
                            } else if (lune_acti == '60') {
                                lune_acti = planete[moonIndex]['activity']['idleTime'];
                            } else if (!lune_acti) {
                                lune_acti = '60';
                            }
                            var jsonLune = {id:lune_id, size:lune_size, activity:lune_acti};
                            //jsonLune = JSON.stringify(jsonLune);
                            //console.log("MOON: " + jsonLune);
                        } else {
                            console.log("[PTRE] Error: Cant find moon (it should exists)");
                        }
                    } else {
                        //console.log("NO MOON");
                    }

                    var jsonActiPos = {player_id : player_id,
                                       teamkey : ptreStoredTK,
                                       id : planet_id,
                                       name : planet_name,
                                       coords : coords,
                                       galaxy : galaxy,
                                       system : system,
                                       position : position,
                                       main : false,
                                       activity : planet_acti,
                                       moon : jsonLune};

                    tabActiPos.push(jsonActiPos);
                }
            }
        }

        if (tabActiPos.length > 0){
            jsonSystem = '{';
            $.each(tabActiPos, function(nb, jsonPos){
                jsonSystem += '"'+jsonPos.coords+'":'+JSON.stringify(jsonPos)+',';
                //console.log(jsonSystem);
            });
            jsonSystem = jsonSystem.substr(0,jsonSystem.length-1);
            jsonSystem += '}';
        }

    });
    //console.log("DATAS: " + jsonSystem);
    var dataPost = jsonSystem;

    if (jsonSystem != ''){
        $.ajax({
            url : URLapiSendActiPTRE,
            type : 'POST',
            data: dataPost,
            cache: false,
            success : function(reponse){
                var reponseDecode = jQuery.parseJSON(reponse);
                  displayPTREMessage(reponseDecode.message);
                displayPTREGalaxyMessage(reponseDecode.message);
            }
        });
    } else {
        displayPTREGalaxyMessage("No data to send to PTRE");
    }
}
