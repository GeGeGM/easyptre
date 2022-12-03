// ==UserScript==
// @name         EasyPTRE
// @namespace    https://openuserjs.org/users/GeGe_GM
// @version      0.1.3
// @description  Plugin to use PTRE's basics features with AGR. Check https://ptre.chez.gg/
// @author       GeGe_GM
// @license      MIT
// @copyright    2022, GeGe_GM
// @match        https://*.ogame.gameforge.com/game/*
// @updateURL    https://openuserjs.org/meta/GeGe_GM/EasyPTRE.meta.js
// @downloadURL  https://openuserjs.org/install/GeGe_GM/EasyPTRE.user.js
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
var imgPTRE       = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB1FBMVEUAAEAAAEE1IjwvHTsEA0GBTCquYhxbNjINCUAFBEEqGjwyIDsAAUAYED+kXR++aBS7aBaKUCctHDwTDUBDKTeBSymwYxuYVyQPCkA8JTm4Zxi7ZxW9aBSrYR2fWyG+aRS8ZxS2Zhg6JDlqPzC+aRW8ZxV1RCwBAkEMCEGUVSW8aBSlXh8bET8oGj27aBdNLzZSMjW8aBaHTigGBUEXDz5kOS1qOymbWCG9aRayZBt0QihnOisiFj0PCj9FKjdKLDVIKzVGKjZHKjZILDYXDz8BAUENCD4OCD4KBj8OCT4MCD8CAkEiFj6MUSadWB+fWR2NUSYVDj8HBUBqPzGJTyeYViGeWB6fWR8+JzkFA0AWDj4kFz2ITiazZBl2RSwIBkASDD8ZED5hOTCwYhqbWSIHBD80IDodEz4PCT8kFjsKB0AhFDwTDD8DA0E1IToQCTybVh6pYB6ETSlWNDQrGzwHBUEjFj1PMDV+SSqoXhwfETmdVhyxZBuWViRrPy8DAkFjOzGPUiarXhgeETm9aBWiXCB9SSp4RiyeWiG1ZRm9aRW8aBWrXhmdVxysXhgPCT2UVCKzZRyxZByyZRyiXB8dEDoDAkAhFj4oGj4kGD4GBED///9i6fS4AAAAAWJLR0Sb79hXhAAAAAlwSFlzAAAOwgAADsIBFShKgAAAAAd0SU1FB+YMAw4EFzatfRkAAAE3SURBVCjPY2AgDBhxSzEx45JkYWVj5wDq5eTi5kGT4uXjFxAUEhYRFROXQLNJUkpaWkZWTkpeQVEJ1WRGZRVpaWlVGSChoqaOIqWhCRIFAy1tHRQpXTFVmJS0nj6yiYwGhnAZaX4jY7iEiamZuYUAHBhaWlnbQKVs7ewdHEHAyQlC2Tu7wM1jdHVzd3PzYGT08HRz8/JmRLbMh9XXzz8gMCg4JDQsPALFY5FR0TGxcfEMCYlJySnRcOHUtHROoLqMzCywouwcxlzePDewVH5BYVFxCQfUAsbSsvIKvsoqiFS1vLxhTW2dpEu9q3BeQyOboTx/UzNUqgUUfCpSrW3tHZ1d/MBw6e5BkgIBGXl5aEhiSCEAXKqXXxUNyPRBpPonTJyEBiZPmQqWmjZ9BgaYOYuIRIgVAABizF3wXn23IAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0xMi0wM1QxNDowNDoxNyswMDowMEeHM70AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMTItMDNUMTQ6MDQ6MTcrMDA6MDA22osBAAAAAElFTkSuQmCC';
var imgPTRESaveOK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABg1BMVEUSFhoRFBn///+03f9fdpECAwQAAAACAgMAAAAhKTElLTYlLTYkLTYlLTYhKTEeJS0gJzAgJzAeJS0WGyEcIyscIysWGyEWGyEWGyEVGh8UGR8UGR8UGR4UGR8TGB0TGB0QFBgQFBgKDA8TGB0TGB0JDA4LDhETFx0TFxwLDhEJCw0OERUQFBkRFRkQFBgNERUICw0cIioaICcZICcZHyYZHiYZISUYJiQYJyMXMCAPZg0NdAgNdggNdAkNdQgNdwcTShcPZA4TTBYMfQUURRkVOxwVPBwSUhQMegYSUBUNeQcTSxcYJSQNcwkXMSAYKiIZHScZHCcTSBgUQBsWMiAXLCIVPRwUQBoNegcWNh4VPxsNcgkZHicMfAYURxgRWxEYKCMQYw4ObAsObQsRWBIZIiUVPRsZICYYJCQSURURWhESURQMfgUQYQ8WMSAXKiIWMx8PagwPaQwXKyIUQxkURhgUQhoYKSIWMh8OcgkOcQoXMiAPZQ4TTRYYHSQXHST////VYAyAAAAAMXRSTlMAAAAAAAAAAAFIs+HlsUVh6uhePOXjOJqUx8HMxcXHwZmTO+TiN2Dp6F1GseDl4K9EdwVsxAAAAAFiS0dEAmYLfGQAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAHdElNRQfmDAMOAyYoMuvkAAABm0lEQVQoz22S61vTMBSHI6gMUbmIIiL3myIojCxZ1zQMaLPBegmKwyFKYWBhAkWHclmBf510K2UD3k/nyfv8niTnHAAijU+ant6i6dnzyANQ19wyFb3DVGtbPXjRPg1DYoJKFX35CnRExQnCGMcDcOBeg05hpIRMFEWRBXSGJivuDeiCECVm5+ZVjQm0VHphMVNWb32lG8ykFud8iX3WDP1LOhMqrLBl8lXcz1OJrIFjK9+S1you+6klkcqtat9xbC1D8bWizPyx8NNHXac65JocD1XW3tiskN/ahpxVqV8cOgHi2zUqu7NbCPmtVysm7e0X1ssU9vek6rvYAXW5gxByHO7SgxplUvfwTz6f3/x76FJTozWpon30T1XV/3ZRpG6ULLpRdGzXPT62nSJZvnmGaNQJsXKnhFJ6lrPICVNwVXuJhaRSqWRKyCImM/RAIc87F0MJUOfPPQ9B2A16/FF6BjEMuYwhSk8SY+gFfRf+AujhBohCR8Jc9IOBQXgvQ8OgbmT08q64fPf+IXgUGfswPnGLj58mHzdcAcEAo6hY/dQmAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTEyLTAzVDE0OjAzOjMyKzAwOjAwtUYAHgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0xMi0wM1QxNDowMzozMiswMDowMMQbuKIAAAAASUVORK5CYII=';
var imgPTREOK     = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACEFBMVEXO6eHO6ODP7ejL07/KyrHQ9fTO597O593O6+TO6eDP8/HFqXy6YArFroXO7ObP7unO6N/P8/DN4tbO6uPP7ujAh0e6Xwm6Xge/gj/P8vDP7+rP8u/N4NPHtpG+eTLBklnP8O3O59/M3My8bB27ZhS7ahm6YQu7ZhPKz7nCmmW8byK8axvM28zP8e7IvZy7aRi7ZxW7ZBC7ZRG8ahrGsYnP8u7CmGK7aBa7aBe6YQy/gkDO6uK9eC+6Yw+7Zxa7ZBHKzra6XgbDoXDFq3+7aRm9dizO5tzAhkbIwKDP8e3O5t29dSq7ZRK6Yg29dy7L1MDKzrfJx6zJya/KzLTKy7PKzLPKzbXKy7LJyK3N5NnP7+vQ8/HQ+frQ+PnQ9/fQ9vbQ9/bP8OzJxKjAiEnBjlLBk1rEonHGtY+/gT7AiUrBj1TAjE/Fr4XP7efP7ObL1cLFrYPGtI24VQC4UQDO7OW5VwC3TwDCl2HQ9/jL1cHAi07BkljM28vJx6u/hUXDm2fIwqTN49fO6+XN5tzFqX3M2ce9dCq5XAO9cyjBkVbL1sTM3c7Iv5++eTHK0Lq+fjm6XwjEpXfJyrHN5dvL077GsIjAi028biC6YAnL0r2+fDa7ZxS6Yg7Cll7Iv57DoG6+fTi7aRfL0ry6Ygy+fTe9dy+5XAS6Yw7K0bvIwqPHuJTHupjHupfHu5jN4dT///8mUFEXAAAAAWJLR0SvzmyjMQAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAAd0SU1FB+YMAw4AFMvI6acAAAHoSURBVCjPY2AAAUYmZhZWBjYQi52Bg5MBCbBxcfPw8vGzC7BxCDIICSNLCYiIiolLMEtKScvIyskrKCJkGPmUlFVU1dR5NTS1xHm0dfgYEebp6onpG+irqxmKG+kbi5tIsiGkTM3E9Q0MzC3M9c0NLCytELo4rdltbM0NYMDOXkNKAKZJysEQIWOg7+gkyQ53urOjC0LKwtDVjQMsYS3MyORuqW+OAPpqHp6MQM9Ze4l62/jYGiIDX2U5P39+oLaAwKDgkNCQkJDQsDAQIzQ8OCQiKBIUJlIKUdExsXHxCfFR/KwgRhxrVGIiOLQEvESSrJJTUlPS2PjTMzKzUrNzctnBrmdjE8jLLyjUKirOyC0JLeC1LS0rlwYGNDD8PT052DmkKyqrqmty2aSiK2rr6oUYGKKkhRnYChoaPXWb3Dj4E3MZGQTYmnNFuLh02RxaWhkY29o7OmW7+HT5Ob3YFNkY+D35u3s0e23F+hgY+219JohbZEycNFnXM1FSeMrUadNniNsaaM9kYJzlq6+vP9vScY7r3Hm18xeoOPL46OtbqCxcBJKyAAWcvrmtOM9iR18DfX1QUCNJAYG5/kILfSgbTQoFqOgDpZbY6ltgAjtVoDOWLlvuiwnUbFcwcK5ctXoNFrB2HQBKf5KDmlHLoAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0xMi0wM1QxMzo1OTo1NyswMDowMDoXHO0AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMTItMDNUMTM6NTk6NTcrMDA6MDBLSqRRAAAAAElFTkSuQmCC';
var imgPTREKO     = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABfVBMVEXEDxjEDhjCLR/CKR3EDxnEEhq+UB28YxnAPh7EFxvEExrDJh3CKx7DHRy9Xxq7aBS7aBa+VBzCKB3DGhzBMx68ZBi9WhzEGBvEDRjCMB67Zxe7ZxW7aBW8Yhm9XRu7ZhfCLh7ARR67aRW/Sh3EEBnEFhu+WBzDHhzDJR28ZBnBOB7BOh6+UxzDHBvAQBq/Qhi9Wxq7aRa8ZRm/Rxm/QRnDIhzBNR3BNB3BMx3BNR7DHBzDFhnEFRnEFBnEFhnDIh2/UB69Wxi8Wxe+VRzDGxvARh+9WRq9Wxe9XBnCMR7EEhnDIxy+Uhu8ZRe/Sx3EFBrDGRvDHRvAQB28Yxi9WxvDIx3EExnCKx3DHxzDFxrDIhvEFRrDIBvDGhvEERrCLB3DFxi9WRe8YRq+UR3BPB7CJx3EDBjEDhm/Th28XxjDHRjDFhi8WRW9WRzARh7CLx7EERnAQh6+Vhy8YBW9Xhq9XBu8ZhjDHRe9Vxm8Zhq8ZRrDJh/DJh7DJB7///+TS0aXAAAAAWJLR0R+P7hBcwAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAAd0SU1FB+YMAw4FCdW5cTsAAAE5SURBVCjPY2AgAjDilGFiZgFLMmIoYWVj5+BkZGTk4uZBN42Xj19AUEhYhE1UTBxVn4SklLS0jKyclIy0vAKqFIuikjQQyICwsgqKlKoaSBQMZPjUkbUxamhKw4GAFpIUo4S2AEJKRocLJseoq6dvYCiAAEbGJqYQSUZxETNzCxAwh1JmllYwfRISKtZAYMPIaGttbWenIiGBsI3R3kHQ0cnZhctVx83dwxNJgpHBS9fbx9fPnyEgMCg4JJQRFpBh4RFcjBISkVHRIFVeMbGMcbzx1mCphMSk5JRUTpY0RpBUur+pVgZfZhZYX3aOjIyAaG5evlWBinB4YRG7gIxMMVwK5FElqZIMv9IyGXCIoUiBZGVkYCGJLoUEcEvJFJdDpCoqq9BBCURXgX11DRqorg2DhQYmwJ8wAVajTZNVjYEMAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTEyLTAzVDE0OjA1OjA1KzAwOjAw83BJNAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0xMi0wM1QxNDowNTowNSswMDowMIIt8YgAAAAASUVORK5CYII=';
var imgAddPlayer  = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABIFBMVEV+oLt6mrRcdotVbYFMXm5ZcIJcdIhcdYlcdYhcdIhZcIJLXm1GWWhZcYVZcYVGWGdQZ3lQZnhRaHtRaHpRZ3pQZ3lQZ3lPZnlRaHpPZXdOZXZDVmVCVWQpNT9IXG1HXGwpND4nMjs8TVtFWWlGWmpFWWo8TVomMTpdd4xcdotbdYpkfI9lfI9cdoqSoa3b3uLb3+KUo65whZbp6+z////r7e5xhpdadIp+kJ/29/f4+PmAkqH3+PhYc4h8j55+kaBYcoiYprH4+fn5+fqaqLKVo67q7O1lfY/d4eRmfZDe4eSXpbDs7e/5+vpyh5ecqbNXcohxhpbr7O7s7u9zh5hac4fg4+Xg4+aZp7JddotZc4dZcodnfpBnfpFcdYpZcobNc5NHAAAAKHRSTlMAAAAAOrnq7Ozstzk11NMzqKTY09rV2tXa2NOnozTU0jI6t+rs7LY38nTtTwAAAAFiS0dENKmx6f0AAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAHdElNRQfmDAMNMw+3gPsiAAAA/0lEQVQY022QeVPCMBDF1wuKJ4qANwqiEI1HXU3axBa5oYAH4H18/29hk8wwMMP+s29/s0leHsD8QiRqWVY0FtMtsrg0A8srhaIqcnZOtCisrkFcqyK9uLy6pkavw4bZs28Qb+/MbgI2dWfcQXQF00NyHMpxSBi79xT0S4wRA6nNufdQRqxUPc5tqiCp1R3HCRliORT1GklCqtHEiWo20pBqtSdhu5UOjwcdV8qKmrtSup2A6Id6QvjV8NLuoy9Ej44slYylp5GlKea3pn1z2wTy/ILYH5hAdmB3aKILXt/eP7T83IP9gy+z+/3zq8Vf5hBmj7K5Y1X5vG65k9O5fzTlR68NJU1NAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTEyLTAzVDEzOjUxOjA3KzAwOjAwYSBSfQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0xMi0wM1QxMzo1MTowNyswMDowMBB96sEAAAAASUVORK5CYII=';
var imgSupPlayer  = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAvVBMVEV+oLt6mrRcdotVbYFMXm5ZcIJcdIhcdYlcdYhZcIJLXm1GWWhZcYVZcYVGWGdQZ3lQZnhRaHtRaHpRZ3pQZ3lQZ3lPZnlRaHpPZXdOZXZDVmVCVWQpNT9IXG1HXGwpND4nMjs8TVtFWWlGWmo8TVomMTpdd4xcdotbdYpadIpcdopwhZZ+kJ+Vo67q7O329/dlfY/d4eT///9mfZDe4eSXpbDs7e/4+Pn3+Phyh5eAkqFac4dZc4dZcodZcoZxO/KfAAAAJnRSTlMAAAAAOrnq7Oy3OTXU0zOopNjT2tXa1drY06ejNNTSMjq36uy2N8+M6pEAAAABYktHRDJA0kzIAAAACXBIWXMAAAsSAAALEgHS3X78AAAAB3RJTUUH5gwDDgk1VmNCsAAAAJNJREFUGNN1ztcOgkAURdFjA3sF7KKoMA6CIE1s//9ZtoTMOLAfV3JzD1CtSXI9S5YazRJabdPiMjtd9CyhPgYiDjESUSlEcmAiP6T2kcmmHySOe2JyHaJA9fwzl+9pUIOQxzDQ3udRnFyykjgi30fplSmlxZNyxo/zcCLiFLPbv93nWCwfvD1XOsrrjbFlMnb7ygvg8zvdxWLNowAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0xMi0wM1QxNDowOTo0OCswMDowMAzRxoAAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMTItMDNUMTQ6MDk6NDgrMDA6MDB9jH48AAAAAElFTkSuQmCC';

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
    var aff_option = '<span class="menu_icon"><a id="iconeUpdate" href="https://ptre.chez.gg" target="blank_" ><img id="imgPTREmenu" class="mouseSwitch" src="' + imgPTRE + '" height="26" width="26"></a></span>';
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
                document.getElementById('imgPTREmenu').src = imgPTRESaveOK;
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
                        spanBtnPTRE.innerHTML = '<a class="tooltip" target="ptre" title="Envoyer le rapport sur '+toolName+'"><img id="sendRE-' + apiKeyRE + '" apikey="' + apiKeyRE + '" style="cursor:pointer;" class="mouseSwitch" src="' + imgPTRE + '" height="26" width="26"></a>';
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
                                            document.getElementById('sendRE-'+apiKeyRE).src = imgPTREOK;
                                        } else {
                                            document.getElementById('sendRE-'+apiKeyRE).src = imgPTREKO;
                                        }
                                        displayPTREMessage(reponse.message_verbose);
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
                            var AddPlayerCheck = '<a class="tooltip" id="addcheckptr_'+nbBtnPTRE+'" title="Ajouter ce joueur a la liste PTRE" style="cursor:pointer;"><img class="mouseSwitch" src="' + imgAddPlayer + '" height="20" width="20"></a>';
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
                            var SupPlayerCheck = '<a class="tooltip" id="suppcheckptr_'+nbBtnPTRE+'" title="Retirer ce joueur de la liste PTRE" style="cursor:pointer;"><img class="mouseSwitch" src="' + imgSupPlayer + '" height="20" width="20"></a>';
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
