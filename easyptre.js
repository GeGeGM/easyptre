// ==UserScript==
// @name         EasyPTRE
// @namespace    https://openuserjs.org/users/GeGe_GM
// @version      0.6.2
// @description  Plugin to use PTRE's basics features with AGR. Check https://ptre.chez.gg/
// @author       GeGe_GM
// @license      MIT
// @copyright    2022, GeGe_GM
// @match        https://*.ogame.gameforge.com/game/*
// @updateURL    https://openuserjs.org/meta/GeGe_GM/EasyPTRE.meta.js
// @downloadURL  https://openuserjs.org/install/GeGe_GM/EasyPTRE.user.js
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==


var toolName = 'EasyPTRE';
var serveur = document.getElementsByName('ogame-universe')[0].content;
var splitted = serveur.split('-');
var universe = splitted[0].slice(1);
var splitted2 = splitted[1].split('.');
var country = splitted2[0];
var galaxyContentLinkTest = "https:\/\/"+serveur+"\/game\/index.php?page=ingame&component=galaxy&action=fetchGalaxyContent&ajax=1&asJson=1";
var lastActivitiesGalaSent = 0;
var lastActivitiesSysSent = 0;
var versionCheckTimeout = 86400;

// GM keys
var ptreTeamKey = "ptre-" + country + "-" + universe + "-TK";
var ptreUseAGRList = "ptre-" + country + "-" + universe + "-UseAGRList";
var ptreImproveAGRSpyTable = "ptre-" + country + "-" + universe + "-ImproveAGRSpyTable";
var ptrePTREPlayerListJSON = "ptre-" + country + "-" + universe + "-PTREPlayerListJSON";
var ptreAGRPlayerListJSON = "ptre-" + country + "-" + universe + "-AGRPlayerListJSON";
var ptreEnableConsoleDebug = "ptre-" + country + "-" + universe + "-EnableConsoleDebug";
var ptreLastAvailableVersion = "ptre-" + country + "-" + universe + "-LastAvailableVersion";
var ptreLastAvailableVersionRefresh = "ptre-" + country + "-" + universe + "-LastAvailableVersionRefresh";

// Images
var imgPTRE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB1FBMVEUAAEAAAEE1IjwvHTsEA0GBTCquYhxbNjINCUAFBEEqGjwyIDsAAUAYED+kXR++aBS7aBaKUCctHDwTDUBDKTeBSymwYxuYVyQPCkA8JTm4Zxi7ZxW9aBSrYR2fWyG+aRS8ZxS2Zhg6JDlqPzC+aRW8ZxV1RCwBAkEMCEGUVSW8aBSlXh8bET8oGj27aBdNLzZSMjW8aBaHTigGBUEXDz5kOS1qOymbWCG9aRayZBt0QihnOisiFj0PCj9FKjdKLDVIKzVGKjZHKjZILDYXDz8BAUENCD4OCD4KBj8OCT4MCD8CAkEiFj6MUSadWB+fWR2NUSYVDj8HBUBqPzGJTyeYViGeWB6fWR8+JzkFA0AWDj4kFz2ITiazZBl2RSwIBkASDD8ZED5hOTCwYhqbWSIHBD80IDodEz4PCT8kFjsKB0AhFDwTDD8DA0E1IToQCTybVh6pYB6ETSlWNDQrGzwHBUEjFj1PMDV+SSqoXhwfETmdVhyxZBuWViRrPy8DAkFjOzGPUiarXhgeETm9aBWiXCB9SSp4RiyeWiG1ZRm9aRW8aBWrXhmdVxysXhgPCT2UVCKzZRyxZByyZRyiXB8dEDoDAkAhFj4oGj4kGD4GBED///9i6fS4AAAAAWJLR0Sb79hXhAAAAAlwSFlzAAAOwgAADsIBFShKgAAAAAd0SU1FB+YMAw4EFzatfRkAAAE3SURBVCjPY2AgDBhxSzEx45JkYWVj5wDq5eTi5kGT4uXjFxAUEhYRFROXQLNJUkpaWkZWTkpeQVEJ1WRGZRVpaWlVGSChoqaOIqWhCRIFAy1tHRQpXTFVmJS0nj6yiYwGhnAZaX4jY7iEiamZuYUAHBhaWlnbQKVs7ewdHEHAyQlC2Tu7wM1jdHVzd3PzYGT08HRz8/JmRLbMh9XXzz8gMCg4JDQsPALFY5FR0TGxcfEMCYlJySnRcOHUtHROoLqMzCywouwcxlzePDewVH5BYVFxCQfUAsbSsvIKvsoqiFS1vLxhTW2dpEu9q3BeQyOboTx/UzNUqgUUfCpSrW3tHZ1d/MBw6e5BkgIBGXl5aEhiSCEAXKqXXxUNyPRBpPonTJyEBiZPmQqWmjZ9BgaYOYuIRIgVAABizF3wXn23IAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0xMi0wM1QxNDowNDoxNyswMDowMEeHM70AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMTItMDNUMTQ6MDQ6MTcrMDA6MDA22osBAAAAAElFTkSuQmCC';
var imgPTRESaveOK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABg1BMVEUSFhoRFBn///+03f9fdpECAwQAAAACAgMAAAAhKTElLTYlLTYkLTYlLTYhKTEeJS0gJzAgJzAeJS0WGyEcIyscIysWGyEWGyEWGyEVGh8UGR8UGR8UGR4UGR8TGB0TGB0QFBgQFBgKDA8TGB0TGB0JDA4LDhETFx0TFxwLDhEJCw0OERUQFBkRFRkQFBgNERUICw0cIioaICcZICcZHyYZHiYZISUYJiQYJyMXMCAPZg0NdAgNdggNdAkNdQgNdwcTShcPZA4TTBYMfQUURRkVOxwVPBwSUhQMegYSUBUNeQcTSxcYJSQNcwkXMSAYKiIZHScZHCcTSBgUQBsWMiAXLCIVPRwUQBoNegcWNh4VPxsNcgkZHicMfAYURxgRWxEYKCMQYw4ObAsObQsRWBIZIiUVPRsZICYYJCQSURURWhESURQMfgUQYQ8WMSAXKiIWMx8PagwPaQwXKyIUQxkURhgUQhoYKSIWMh8OcgkOcQoXMiAPZQ4TTRYYHSQXHST////VYAyAAAAAMXRSTlMAAAAAAAAAAAFIs+HlsUVh6uhePOXjOJqUx8HMxcXHwZmTO+TiN2Dp6F1GseDl4K9EdwVsxAAAAAFiS0dEAmYLfGQAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAHdElNRQfmDAMOAyYoMuvkAAABm0lEQVQoz22S61vTMBSHI6gMUbmIIiL3myIojCxZ1zQMaLPBegmKwyFKYWBhAkWHclmBf510K2UD3k/nyfv8niTnHAAijU+ant6i6dnzyANQ19wyFb3DVGtbPXjRPg1DYoJKFX35CnRExQnCGMcDcOBeg05hpIRMFEWRBXSGJivuDeiCECVm5+ZVjQm0VHphMVNWb32lG8ykFud8iX3WDP1LOhMqrLBl8lXcz1OJrIFjK9+S1you+6klkcqtat9xbC1D8bWizPyx8NNHXac65JocD1XW3tiskN/ahpxVqV8cOgHi2zUqu7NbCPmtVysm7e0X1ssU9vek6rvYAXW5gxByHO7SgxplUvfwTz6f3/x76FJTozWpon30T1XV/3ZRpG6ULLpRdGzXPT62nSJZvnmGaNQJsXKnhFJ6lrPICVNwVXuJhaRSqWRKyCImM/RAIc87F0MJUOfPPQ9B2A16/FF6BjEMuYwhSk8SY+gFfRf+AujhBohCR8Jc9IOBQXgvQ8OgbmT08q64fPf+IXgUGfswPnGLj58mHzdcAcEAo6hY/dQmAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTEyLTAzVDE0OjAzOjMyKzAwOjAwtUYAHgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0xMi0wM1QxNDowMzozMiswMDowMMQbuKIAAAAASUVORK5CYII=';
var imgPTREOK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACEFBMVEXO6eHO6ODP7ejL07/KyrHQ9fTO597O593O6+TO6eDP8/HFqXy6YArFroXO7ObP7unO6N/P8/DN4tbO6uPP7ujAh0e6Xwm6Xge/gj/P8vDP7+rP8u/N4NPHtpG+eTLBklnP8O3O59/M3My8bB27ZhS7ahm6YQu7ZhPKz7nCmmW8byK8axvM28zP8e7IvZy7aRi7ZxW7ZBC7ZRG8ahrGsYnP8u7CmGK7aBa7aBe6YQy/gkDO6uK9eC+6Yw+7Zxa7ZBHKzra6XgbDoXDFq3+7aRm9dizO5tzAhkbIwKDP8e3O5t29dSq7ZRK6Yg29dy7L1MDKzrfJx6zJya/KzLTKy7PKzLPKzbXKy7LJyK3N5NnP7+vQ8/HQ+frQ+PnQ9/fQ9vbQ9/bP8OzJxKjAiEnBjlLBk1rEonHGtY+/gT7AiUrBj1TAjE/Fr4XP7efP7ObL1cLFrYPGtI24VQC4UQDO7OW5VwC3TwDCl2HQ9/jL1cHAi07BkljM28vJx6u/hUXDm2fIwqTN49fO6+XN5tzFqX3M2ce9dCq5XAO9cyjBkVbL1sTM3c7Iv5++eTHK0Lq+fjm6XwjEpXfJyrHN5dvL077GsIjAi028biC6YAnL0r2+fDa7ZxS6Yg7Cll7Iv57DoG6+fTi7aRfL0ry6Ygy+fTe9dy+5XAS6Yw7K0bvIwqPHuJTHupjHupfHu5jN4dT///8mUFEXAAAAAWJLR0SvzmyjMQAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAAd0SU1FB+YMAw4AFMvI6acAAAHoSURBVCjPY2AAAUYmZhZWBjYQi52Bg5MBCbBxcfPw8vGzC7BxCDIICSNLCYiIiolLMEtKScvIyskrKCJkGPmUlFVU1dR5NTS1xHm0dfgYEebp6onpG+irqxmKG+kbi5tIsiGkTM3E9Q0MzC3M9c0NLCytELo4rdltbM0NYMDOXkNKAKZJysEQIWOg7+gkyQ53urOjC0LKwtDVjQMsYS3MyORuqW+OAPpqHp6MQM9Ze4l62/jYGiIDX2U5P39+oLaAwKDgkNCQkJDQsDAQIzQ8OCQiKBIUJlIKUdExsXHxCfFR/KwgRhxrVGIiOLQEvESSrJJTUlPS2PjTMzKzUrNzctnBrmdjE8jLLyjUKirOyC0JLeC1LS0rlwYGNDD8PT052DmkKyqrqmty2aSiK2rr6oUYGKKkhRnYChoaPXWb3Dj4E3MZGQTYmnNFuLh02RxaWhkY29o7OmW7+HT5Ob3YFNkY+D35u3s0e23F+hgY+219JohbZEycNFnXM1FSeMrUadNniNsaaM9kYJzlq6+vP9vScY7r3Hm18xeoOPL46OtbqCxcBJKyAAWcvrmtOM9iR18DfX1QUCNJAYG5/kILfSgbTQoFqOgDpZbY6ltgAjtVoDOWLlvuiwnUbFcwcK5ctXoNFrB2HQBKf5KDmlHLoAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0xMi0wM1QxMzo1OTo1NyswMDowMDoXHO0AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMTItMDNUMTM6NTk6NTcrMDA6MDBLSqRRAAAAAElFTkSuQmCC';
var imgPTREKO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABfVBMVEXEDxjEDhjCLR/CKR3EDxnEEhq+UB28YxnAPh7EFxvEExrDJh3CKx7DHRy9Xxq7aBS7aBa+VBzCKB3DGhzBMx68ZBi9WhzEGBvEDRjCMB67Zxe7ZxW7aBW8Yhm9XRu7ZhfCLh7ARR67aRW/Sh3EEBnEFhu+WBzDHhzDJR28ZBnBOB7BOh6+UxzDHBvAQBq/Qhi9Wxq7aRa8ZRm/Rxm/QRnDIhzBNR3BNB3BMx3BNR7DHBzDFhnEFRnEFBnEFhnDIh2/UB69Wxi8Wxe+VRzDGxvARh+9WRq9Wxe9XBnCMR7EEhnDIxy+Uhu8ZRe/Sx3EFBrDGRvDHRvAQB28Yxi9WxvDIx3EExnCKx3DHxzDFxrDIhvEFRrDIBvDGhvEERrCLB3DFxi9WRe8YRq+UR3BPB7CJx3EDBjEDhm/Th28XxjDHRjDFhi8WRW9WRzARh7CLx7EERnAQh6+Vhy8YBW9Xhq9XBu8ZhjDHRe9Vxm8Zhq8ZRrDJh/DJh7DJB7///+TS0aXAAAAAWJLR0R+P7hBcwAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAAd0SU1FB+YMAw4FCdW5cTsAAAE5SURBVCjPY2AgAjDilGFiZgFLMmIoYWVj5+BkZGTk4uZBN42Xj19AUEhYhE1UTBxVn4SklLS0jKyclIy0vAKqFIuikjQQyICwsgqKlKoaSBQMZPjUkbUxamhKw4GAFpIUo4S2AEJKRocLJseoq6dvYCiAAEbGJqYQSUZxETNzCxAwh1JmllYwfRISKtZAYMPIaGttbWenIiGBsI3R3kHQ0cnZhctVx83dwxNJgpHBS9fbx9fPnyEgMCg4JJQRFpBh4RFcjBISkVHRIFVeMbGMcbzx1mCphMSk5JRUTpY0RpBUur+pVgZfZhZYX3aOjIyAaG5evlWBinB4YRG7gIxMMVwK5FElqZIMv9IyGXCIoUiBZGVkYCGJLoUEcEvJFJdDpCoqq9BBCURXgX11DRqorg2DhQYmwJ8wAVajTZNVjYEMAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTEyLTAzVDE0OjA1OjA1KzAwOjAw83BJNAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0xMi0wM1QxNDowNTowNSswMDowMIIt8YgAAAAASUVORK5CYII=';
var imgAddPlayer = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABIFBMVEV+oLt6mrRcdotVbYFMXm5ZcIJcdIhcdYlcdYhcdIhZcIJLXm1GWWhZcYVZcYVGWGdQZ3lQZnhRaHtRaHpRZ3pQZ3lQZ3lPZnlRaHpPZXdOZXZDVmVCVWQpNT9IXG1HXGwpND4nMjs8TVtFWWlGWmpFWWo8TVomMTpdd4xcdotbdYpkfI9lfI9cdoqSoa3b3uLb3+KUo65whZbp6+z////r7e5xhpdadIp+kJ/29/f4+PmAkqH3+PhYc4h8j55+kaBYcoiYprH4+fn5+fqaqLKVo67q7O1lfY/d4eRmfZDe4eSXpbDs7e/5+vpyh5ecqbNXcohxhpbr7O7s7u9zh5hac4fg4+Xg4+aZp7JddotZc4dZcodnfpBnfpFcdYpZcobNc5NHAAAAKHRSTlMAAAAAOrnq7Ozstzk11NMzqKTY09rV2tXa2NOnozTU0jI6t+rs7LY38nTtTwAAAAFiS0dENKmx6f0AAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAHdElNRQfmDAMNMw+3gPsiAAAA/0lEQVQY022QeVPCMBDF1wuKJ4qANwqiEI1HXU3axBa5oYAH4H18/29hk8wwMMP+s29/s0leHsD8QiRqWVY0FtMtsrg0A8srhaIqcnZOtCisrkFcqyK9uLy6pkavw4bZs28Qb+/MbgI2dWfcQXQF00NyHMpxSBi79xT0S4wRA6nNufdQRqxUPc5tqiCp1R3HCRliORT1GklCqtHEiWo20pBqtSdhu5UOjwcdV8qKmrtSup2A6Id6QvjV8NLuoy9Ej44slYylp5GlKea3pn1z2wTy/ILYH5hAdmB3aKILXt/eP7T83IP9gy+z+/3zq8Vf5hBmj7K5Y1X5vG65k9O5fzTlR68NJU1NAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTEyLTAzVDEzOjUxOjA3KzAwOjAwYSBSfQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0xMi0wM1QxMzo1MTowNyswMDowMBB96sEAAAAASUVORK5CYII=';
var imgSupPlayer = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAvVBMVEV+oLt6mrRcdotVbYFMXm5ZcIJcdIhcdYlcdYhZcIJLXm1GWWhZcYVZcYVGWGdQZ3lQZnhRaHtRaHpRZ3pQZ3lQZ3lPZnlRaHpPZXdOZXZDVmVCVWQpNT9IXG1HXGwpND4nMjs8TVtFWWlGWmo8TVomMTpdd4xcdotbdYpadIpcdopwhZZ+kJ+Vo67q7O329/dlfY/d4eT///9mfZDe4eSXpbDs7e/4+Pn3+Phyh5eAkqFac4dZc4dZcodZcoZxO/KfAAAAJnRSTlMAAAAAOrnq7Oy3OTXU0zOopNjT2tXa1drY06ejNNTSMjq36uy2N8+M6pEAAAABYktHRDJA0kzIAAAACXBIWXMAAAsSAAALEgHS3X78AAAAB3RJTUUH5gwDDgk1VmNCsAAAAJNJREFUGNN1ztcOgkAURdFjA3sF7KKoMA6CIE1s//9ZtoTMOLAfV3JzD1CtSXI9S5YazRJabdPiMjtd9CyhPgYiDjESUSlEcmAiP6T2kcmmHySOe2JyHaJA9fwzl+9pUIOQxzDQ3udRnFyykjgi30fplSmlxZNyxo/zcCLiFLPbv93nWCwfvD1XOsrrjbFlMnb7ygvg8zvdxWLNowAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0xMi0wM1QxNDowOTo0OCswMDowMAzRxoAAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMTItMDNUMTQ6MDk6NDgrMDA6MDB9jH48AAAAAElFTkSuQmCC';

// Settings
var ptreMessageDisplayTime = 5;
var menuImageDisplayTime = 3;
var ptreMenuDisplayTime = 1;
var ptreTargetListMaxSize = 15;
// TODO: Set ptreAGRTargetListMaxSize

// PTRE URLs
var urlPTREImportSR    = 'https://ptre.chez.gg/scripts/oglight_import.php?tool='+toolName;
var urlPTREPushActivity = "https://ptre.chez.gg/scripts/oglight_import_player_activity.php?tool="+toolName
var urlToScriptMetaInfos = 'https://openuserjs.org/meta/GeGe_GM/EasyPTRE.meta.js'

// *** *** ***
// MAIN EXEC
// *** *** ***

// Update main pages
if (!/page=standalone&component=empire/.test(location.href))
{
    // Bouton options
    var ptreMenuName = toolName;
    var lastAvailableVersion = GM_getValue(ptreLastAvailableVersion, -1);
    if (lastAvailableVersion != -1 && lastAvailableVersion !== GM_info.script.version) {
        ptreMenuName = "UPDATE ME";
    }
    var aff_option = '<span class="menu_icon"><a id="iconeUpdate" href="https://ptre.chez.gg" target="blank_" ><img id="imgPTREmenu" class="mouseSwitch" src="' + imgPTRE + '" height="26" width="26"></a></span>';
    aff_option += '<a id="affOptionsPTRE" class="menubutton " href="#" accesskey="" target="_self"><span class="textlabel" id="ptreMenuName">' + ptreMenuName + '</span></a>';

    var tab = document.createElement("li");
    tab.innerHTML = aff_option;
    tab.id = 'optionPTRE';
    document.getElementById('menuTableTools').appendChild(tab);

    document.getElementById('affOptionsPTRE').addEventListener("click", function (event)
    {
        displayPTREMenu();
    }, true);

    if (isAGREnabled()) {
        if (document.getElementById('ago_panel_Player')) {
            let observer2 = new MutationObserver(updateLocalAGRList);
            var node2 = document.getElementById('ago_panel_Player');
            observer2.observe(node2, {
                attributes: true,
                childList: true, // observer les enfants directs
                subtree: true, // et les descendants aussi
                characterDataOldValue: true // transmettre les anciennes données au callback
            });
        }
        if (document.getElementById('ago_box_title')) {
            // Add PTRE link to AGR pinned player
            addPTRELinkToAGRPinnedTarget();
            // Check if pinned player is updated
            let observer = new MutationObserver(addPTRELinkToAGRPinnedTarget);
            var node = document.getElementById('ago_box_title');
            observer.observe(node, {
                attributes: true,
                childList: true, // observer les enfants directs
                subtree: true, // et les descendants aussi
                characterDataOldValue: true // transmettre les anciennes données au callback
            });
        }
    }
}

// Galaxy page: Send activities
if (/component=galaxy/.test(location.href)){
    consoleDebug("Galaxy detected");
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
        setTimeout(addPTREStuffsToMessagesPage, 800);
    }
}

// Check for new version only if we already did the check once
// In order to not display the autorisation window during an inappropriate moment
// It will be enabled when user opens the PTRE menu
if (GM_getValue(ptreLastAvailableVersionRefresh, 0) != 0) {
    updateLastAvailableVersion(false);
} else {
    consoleDebug("Version Check not initialized: open settings to initialize it");
}

// *** *** ***
// Add PTRE styles
// Ugly style... yes!
// *** *** ***
GM_addStyle(`
.status_positif {
    color:#508d0e;
    font-weight:bold;
}
.status_negatif {
    color: #bb2e15;
    font-weight:bold;
}
.status_warning {
    color:#bb6715;
    font-weight:bold;
}
#boxPTRESettings {
    padding:10px;
    z-index: 1000;
    position: fixed;
    bottom: 30px;
    right: 10px;
    border: solid black 2px;
    background:rgba(0,26,52,0.8);
}
#boxPTREMessage {
    padding:10px;
    z-index: 1000;
    position: fixed;
    bottom: 30px;
    right: 10px;
    border: solid black 2px;
    background:rgba(0,26,52,0.8);"
}
#btnSaveOptPTRE {
    cursor:pointer;
}
#ptreSpanGalaxyMessageD {
    color:green;
    font-weight:bold;"
}
.ptre_maintitle {
    color: #299f9b;
    font-weight:bold;
    text-decoration: underline;
}
.ptre_title {
    color: #299f9b;
    font-weight:bold;
}
.td_cell {
    padding: 3px;
}
`);

// *** *** ***
// NOTIFICATIONS FUNCTIONS
// *** *** ***

// Displays PTRE responses messages
// Responses from server
function displayPTREMessage(message) {
    var divPTREMessage = '<div id="boxPTREMessage">PTRE: <span id="ptreMessage">' + message + '</span></div>';

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

// *** *** ***
// MINI FUNCTIONS
// *** *** ***

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

function consoleDebug(message) {
    if (GM_getValue(ptreEnableConsoleDebug, 'false') == 'true') {
        console.log('[PTRE] ' + message);
    }
}

function updateLastAvailableVersion(force) {
    // Only check once a day

    var lastCheckTime = GM_getValue(ptreLastAvailableVersionRefresh, 0);
    var currentTime = serverTime.getTime() / 1000;

    if (force === true || currentTime > lastCheckTime + versionCheckTimeout) {
        consoleDebug("Checking last version available");
        GM_xmlhttpRequest({
            method:'GET',
            url:urlToScriptMetaInfos,
            onload:result => {
                //consoleDebug(result.responseText);
                var tab = result.responseText.split('//');
                var availableVersion = tab[2].match(/\d+\.\d+.\d+/);
                availableVersion = availableVersion[0];
                consoleDebug("Current version: " + GM_info.script.version);
                consoleDebug("Last version: " + availableVersion);
                GM_setValue(ptreLastAvailableVersion, availableVersion);
                GM_setValue(ptreLastAvailableVersionRefresh, currentTime);
                if (availableVersion !== GM_info.script.version) {
                    if (document.getElementById('ptreVersion')) {
                        document.getElementById('ptreVersion').innerHTML = '<span class="status_negatif">Update EasyPTRE to <a href="https://openuserjs.org/scripts/GeGe_GM/EasyPTRE" target="_blank">version ' + availableVersion + '</a></span>';
                    }
                    if (document.getElementById('ptreMenuName')) {
                        document.getElementById('ptreMenuName').innerHTML = 'UPDATE ME';
                    }
                    consoleDebug('Version ' + availableVersion + ' is available');
                }
            }
        });
    } else {
        var temp = lastCheckTime + versionCheckTimeout - currentTime;
        consoleDebug("Skipping last version check. Next check in " + temp + " sec min");
    }
}

// *** *** ***
// PTRE/AGR LIST RELATED
// *** *** ***

// Remove player from PTRE/AGR list
function deletePlayerFromList(playerId, playerPseudo, type) {

    // Check if player is part of the list
    if (isPlayerInList(playerId, playerPseudo, type)) {
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
                // TODO: Pourquoi est ce qu'on test le pseudo ?
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
        //consoleDebug(type + " list updated (deletePlayerFromList fct)");

        return 'Player was removed from ' + type + ' list';
    } else {
        return 'Player is not part of ' + type + ' list';
    }
}

// Add player to PTRE/AGR list
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
            consoleDebug('Player ' + playerPseudo + ' has been added to ' + type + ' list');
            //consoleDebug(type + " list updated (addPlayerToList fct)");
            return 'Player has been added to ' + type + ' list';
        }
    } else {
        return 'Player is already in ' + type + ' list';
    }
}

function debugListContent(type = 'PTRE') {

    var targetJSON = '';
    if (type == 'PTRE') {
        targetJSON = GM_getValue(ptrePTREPlayerListJSON, '');
    } else if (type == 'AGR') {
        targetJSON = GM_getValue(ptreAGRPlayerListJSON, '');
    }
    if (targetJSON != '') {
        var targetList = JSON.parse(targetJSON);
        consoleDebug(type + " list: ");
        consoleDebug(targetList);
    }
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
            }
        });
    }
    return ret;
}

function getAGRPlayerIDFromPseudo(playerPseudo) {
    var ret = 0;
    var targetJSON = GM_getValue(ptreAGRPlayerListJSON, '');
    if (targetJSON != '') {
        var targetList = JSON.parse(targetJSON);
        $.each(targetList, function(i, PlayerCheck) {
            if (PlayerCheck.pseudo == playerPseudo) {
                ret = PlayerCheck.id;
            }
        });
    }
    return ret;
}

// Copy AGR internal players list to local AGR list
// AGR list IDs
// Friend: 52
// Trader: 55 => YES
// Watch: 62 => YES
// Miner: 64 => YES
// Target: 66 => YES
// To attack: 67 => YES
function updateLocalAGRList() {
    var tabAgo = document.getElementsByClassName('ago_panel_overview');

    if (tabAgo && tabAgo[1] && tabAgo[1].children) {
        $.each(tabAgo[1].children, function(i, ligneJoueurAGR) {
            if (ligneJoueurAGR.getAttributeNode('ago-data')) {
                var txtjsonDataAgo = ligneJoueurAGR.getAttributeNode('ago-data').value;
                var jsonDataAgo = JSON.parse(txtjsonDataAgo);
                var token = jsonDataAgo.action.token;
                // Do not add friends to target list
                if (token == 55 || token == 62 || token == 64 || token == 66 || token == 67) {
                    var IdPlayer = jsonDataAgo.action.id;
                    var PseudoPlayer = ligneJoueurAGR.children[1].innerText;
                    consoleDebug('AGR native list member: ' + PseudoPlayer + ' (' + IdPlayer + ') | token:' + token + ')');
                    addPlayerToList(IdPlayer, PseudoPlayer, 'AGR');
                }
            }
        });
    }
}

// *** *** ***
// IMPROVE MAIN VIEWS
// *** *** ***

// This function adds PTRE link to AGR pinned target
function addPTRELinkToAGRPinnedTarget() {
    if (document.getElementById('ago_box_title')) {
        var pseudoAGR = document.getElementById('ago_box_title').innerHTML;
        updateLocalAGRList();
        var playerID = getAGRPlayerIDFromPseudo(pseudoAGR);
        if (playerID != 0) {
            document.getElementById('ago_box_title').innerHTML = pseudoAGR + ' [<a href="' + buildPTRELinkToPlayer(playerID) + '" target="_blank">PTRE</a>]';
        }
    }
}

// Displays PTRE settings
function displayPTREMenu() {

    if (!document.getElementById('btnSaveOptPTRE')) {
        var useAGR = '';
        var ptreStoredTK = GM_getValue(ptreTeamKey, '');
        var divPTRE = '<div id="boxPTRESettings"><table border="1">';
        divPTRE += '<tr><td class="td_cell" align="center"><span class="ptre_maintitle">EasyPTRE PANNEL</span></td><td class="td_cell" align="right"><input id="btnCloseOptPTRE" type="button" value="CLOSE" /></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><span id="msgErrorPTRESettings"></span></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><hr /></td></tr>';
        divPTRE += '<tr><td class="td_cell"><div class="ptre_title">Settings</div></td><td class="td_cell" align="right"><input id="btnSaveOptPTRE" type="button" value="SAVE" /></td></tr>';
        divPTRE += '<tr><td class="td_cell"><div>PTRE Team Key:</div></td><td class="td_cell" align="center"><div><input onclick="document.getElementById(\'ptreTK\').type = \'text\'" style="width:160px;" type="password" id="ptreTK" value="'+ ptreStoredTK +'"></div></td></tr>';


        // If AGR is detected
        if (isAGREnabled()) {
            // AGR Target List
            divPTRE += '<tr><td class="td_cell">Use AGR Targets List:</td>';
            useAGR = (GM_getValue(ptreUseAGRList, 'true') == 'true' ? 'checked' : '');
            divPTRE += '<td class="td_cell" style="text-align: center;"><input id="PTREuseAGRCheck" type="checkbox" ';
            divPTRE += useAGR;
            divPTRE += ' />';
            if (useAGR != 'checked') {
                divPTRE += ' <span class="status_warning">(recommended)</span>';
            }
            divPTRE += '</td></tr>';
            // AGR Spy Table Improvement
            divPTRE += '<tr><td class="td_cell">Improve AGR Spy Table:</td>';
            var improveAGRSpyTable = (GM_getValue(ptreImproveAGRSpyTable, 'true') == 'true' ? 'checked' : '');
            divPTRE += '<td class="td_cell" style="text-align: center;"><input id="PTREImproveAGRSpyTable" type="checkbox" ';
            divPTRE += improveAGRSpyTable;
            divPTRE += ' />';
            if (improveAGRSpyTable != 'checked') {
                divPTRE += ' <span class="status_warning">(recommended)</span>';
            }
            divPTRE += '</td></tr>';
        } else {
            divPTRE += '<tr><td colspan="2" class="td_cell" align="center"><span class="status_negatif">AGR is not enabled!</span></td></tr>';
        }
        // Console Debug mode
        divPTRE += '<tr><td class="td_cell">Enable Console Debug:</td>';
        debugMode = (GM_getValue(ptreEnableConsoleDebug, 'false') == 'true' ? 'checked' : '');
        divPTRE += '<td class="td_cell" style="text-align: center;"><input id="PTREEnableConsoleDebug" type="checkbox" ';
        divPTRE += debugMode;
        divPTRE += ' />';
        divPTRE += '</td></tr>';

        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><hr /></td></tr>';
        divPTRE += '<tr><td class="td_cell"><div class="ptre_title">Targets list</div></td><td class="td_cell" align="right"><input id="btnRefreshOptPTRE" type="button" value="REFRESH" /></td></tr>';
        // Display PTRE list if AGR list setting is disabled OR AGR extension not installed
        var targetJSON = '';
        var targetList = '';
        var type = "PTRE";
        if (useAGR == 'checked' && isAGREnabled()) {
            updateLocalAGRList();
            type = "AGR";
            targetJSON = GM_getValue(ptreAGRPlayerListJSON, '');
            divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><div class="status_positif">You are using AGR target list</div><div>Add targets via AGR lists</div></div></td></tr>';
        } else {
            targetJSON = GM_getValue(ptrePTREPlayerListJSON, '');
            divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><div class="status_positif">You are using PTRE target lists</div><div>Add targets via galaxy view</div></td></tr>';
        }
        if (targetJSON != '') {
            targetList = JSON.parse(targetJSON);
            if (targetList) {
                $.each(targetList, function(i, PlayerCheck) {
                    //consoleDebug(PlayerCheck);
                    divPTRE += '<tr id="rawPLayer_'+PlayerCheck.id+'"><td class="td_cell">';
                    divPTRE += '- <a id="checkedPlayer'+PlayerCheck.id+'" idplayer="'+PlayerCheck.id+'" cursor:pointer;">'+PlayerCheck.pseudo+'</a></td><td class="td_cell" align="center"><a href="' + buildPTRELinkToPlayer(PlayerCheck.id) + '" target="_blank">PTRE Profile</a>';
                    divPTRE += ' <a class="tooltip" id="removePlayerFromListBySettings_'+PlayerCheck.id+'" style="cursor:pointer;"><img class="mouseSwitch" src="' + imgSupPlayer + '" height="12" width="12"></a>';
                    divPTRE += '</td></tr>';
                });
            }
        }

        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><hr /></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><a href="https://ptre.chez.gg/" target="_blank">PTRE</a> | <a href="https://discord.gg/WsJGC9G" target="_blank">Discord</a> | <a href="https://ko-fi.com/ptreforogame" target="_blank">Donate</a></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><span id="ptreVersion">';
        var lastAvailableVersion = GM_getValue(ptreLastAvailableVersion, -1);
        if (lastAvailableVersion != -1 && lastAvailableVersion !== GM_info.script.version) {
            divPTRE += '<span class="status_negatif">Update EasyPTRE to <a href="https://openuserjs.org/scripts/GeGe_GM/EasyPTRE" target="_blank">version ' + lastAvailableVersion + '</a></span>';
        } else {
            divPTRE += '<b>EasyPTRE  v' + GM_info.script.version + '</b>';
        }
        divPTRE += '</span> <input id="forceCheckVersionButton" type="button" value="CHECK" /></td></tr>';
        // Check last script version
        updateLastAvailableVersion(false);

        //fin div table tr
        divPTRE += '</table></div>';

        var eletementSetPTRE = document.createElement("div");
        eletementSetPTRE.innerHTML = divPTRE;
        eletementSetPTRE.id = 'divPTRESettings';

        if (document.getElementById('links')) {
            document.getElementById('links').appendChild(eletementSetPTRE);
        }

        // Action: Delete player
        if (targetList) {
            $.each(targetList, function(i, PlayerCheck) {
                document.getElementById('removePlayerFromListBySettings_'+PlayerCheck.id).addEventListener("click", function (event)
                {
                    // Delete player from list
                    deletePlayerFromList(PlayerCheck.id, PlayerCheck.pseudo, type);
                    document.getElementById('rawPLayer_'+PlayerCheck.id).remove();
                });
            });
        }

        // Action: Check version
        document.getElementById('forceCheckVersionButton').addEventListener("click", function (event)
        {
            updateLastAvailableVersion(true);
        });

        // Action: Close
        document.getElementById('btnCloseOptPTRE').addEventListener("click", function (event)
        {
            document.getElementById('divPTRESettings').parentNode.removeChild(document.getElementById('divPTRESettings'));
        });

        // Action: Save
        document.getElementById('btnSaveOptPTRE').addEventListener("click", function (event)
        {
            // Save PTRE Team Key
            var newTK = document.getElementById('ptreTK').value;
            // Check PTRE Team Key Format
            if (newTK.replace(/-/g, "").length == 18 && newTK.substr(0,2) == "TM") {
                // If new TK, store it
                if (newTK != ptreStoredTK) {
                    GM_setValue(ptreTeamKey, document.getElementById('ptreTK').value);
                }
                if (isAGREnabled()) {
                    // Update AGR settings
                    GM_setValue(ptreUseAGRList, document.getElementById('PTREuseAGRCheck').checked + '');
                    GM_setValue(ptreImproveAGRSpyTable, document.getElementById('PTREImproveAGRSpyTable').checked + '');
                }
                // Update Console Debug Mode
                GM_setValue(ptreEnableConsoleDebug, document.getElementById('PTREEnableConsoleDebug').checked + '');
                // Update menu image and remove it after 3 sec
                document.getElementById('imgPTREmenu').src = imgPTRESaveOK;
                setTimeout(function() {document.getElementById('imgPTREmenu').src = imgPTRE;}, menuImageDisplayTime * 1000);
                // Display OK message and remove div after 5 sec
                document.getElementById('msgErrorPTRESettings').innerHTML = 'Team Key Format OK';
                setTimeout(function() {document.getElementById('divPTRESettings').parentNode.removeChild(document.getElementById('divPTRESettings'));}, ptreMenuDisplayTime * 1000);
            } else {
                document.getElementById('msgErrorPTRESettings').innerHTML = 'Wrong Team Key Format';
            }
        });
        document.getElementById('btnRefreshOptPTRE').addEventListener("click", function (event)
        {
            document.getElementById('divPTRESettings').parentNode.removeChild(document.getElementById('divPTRESettings'));
            setTimeout(function() {displayPTREMenu();}, 100);
        });

        // TODO
        if (useAGR != 'checked') {
            $.each(targetList, function(i, PlayerCheck) {
                document.getElementById('checkedPlayer'+PlayerCheck.id).addEventListener("click", function (event)
                { // On affiche les coords du joueur
                    afficheCoordJoueur();
                });
            });
        }
    }
}

// This is a callback function called when user open a message pop-up
function addPTRESendSRButtonToMessagePopup(mutationList, observer) {
    if (document.getElementsByClassName('ui-dialog').length > 0) {
        if (document.getElementsByClassName('msg_actions').length > 0) {
            if (document.getElementsByClassName('ui-dialog-content').length > 0) {
                consoleDebug("Message Pop-up!");
                var head = document.getElementsByClassName('detail_msg_head')[0];
                if (head && head.getElementsByClassName('msg_actions clearfix') && head.getElementsByClassName('msg_actions clearfix').length > 0) {
                    var apikey_elem = document.getElementsByClassName('ui-dialog-content')[0].innerHTML;
                    var regex = /sr-.*?\'/gm;
                    var matches = apikey_elem.match(regex);
                    var apiKeyRE = matches[0].slice(0, -1);
                    var spanBtnPTRE = document.createElement("span");
                    spanBtnPTRE.innerHTML = '<a class="tooltip" target="ptre" title="Send to PTRE"><img id="sendSRFromPopup-' + apiKeyRE + '" apikey="' + apiKeyRE + '" style="cursor:pointer;" class="mouseSwitch" src="' + imgPTRE + '" height="26" width="26"></a>';
                    spanBtnPTRE.id = 'PTREspan';
                    head.getElementsByClassName('msg_actions clearfix')[0].append(spanBtnPTRE);
                    if (document.getElementById('sendSRFromPopup-' + apiKeyRE)) {
                        document.getElementById('sendSRFromPopup-' + apiKeyRE).addEventListener("click", function (event) {
                            //apiKeyRE = this.getAttribute("apikey");
                            var TKey = GM_getValue(ptreTeamKey, '');
                            if (TKey != '') {
                                var urlPTRESpy = urlPTREImportSR + '&team_key=' + TKey + '&sr_id=' + apiKeyRE;
                                $.ajax({
                                    dataType: "json",
                                    url: urlPTRESpy,
                                    success: function(reponse) {
                                        if (reponse.code == 1) {
                                            document.getElementById('sendSRFromPopup-'+apiKeyRE).src = imgPTREOK;
                                        } else {
                                            document.getElementById('sendSRFromPopup-'+apiKeyRE).src = imgPTREKO;
                                        }
                                        displayPTREMessage(reponse.message_verbose);
                                    }
                                });
                            }
                        });
                    }
                }
            }
        }
    }
}

// This function adds PTRE send SR button to AGR Spy Table
function addPTRESendSRButtonToAGRSpyTable(mutationList, observer) {
    if (document.getElementById('spyTable')) {
        var TKey = GM_getValue(ptreTeamKey, '');
        if (TKey != '') {
            console.log("[PTRE] Updating AGR Spy Table");
            var table = document.getElementById("spyTable");
            for (var i = 0, row; row = table.rows[i]; i++) {
                var nbCol = row.cells.length;
                if (row.cells[0].tagName == "TD") {
                    var rowCurrent = table.getElementsByTagName("tr")[i];
                    var messageID = rowCurrent.id.slice(2);
                    if (document.getElementById("m"+messageID)) {
                        var apiKeyRE = document.getElementById("m"+messageID).getAttribute("data-api-key");
                        var tdAGRButtons = rowCurrent.getElementsByTagName("td")[nbCol-1];
                        tdAGRButtons.style.width = "110px";
                        // Create PTRE button
                        var PTREbutton = document.createElement('a');
                        PTREbutton.style.cursor = 'pointer';
                        PTREbutton.className = "spyTableIcon icon_galaxy mouseSwitch";
                        PTREbutton.id = "sendSRFromAGRTable-" + apiKeyRE;
                        PTREbutton.setAttribute('apikey', apiKeyRE);
                        PTREbutton.innerHTML = "P";
                        tdAGRButtons.append(PTREbutton);
                        // Add event to button
                        document.getElementById('sendSRFromAGRTable-' + apiKeyRE).addEventListener("click", function (event) {
                            apiKeyRE = this.getAttribute("apikey");
                            var urlPTRESpy = urlPTREImportSR + '&team_key=' + TKey + '&sr_id=' + apiKeyRE;
                            $.ajax({
                                dataType: "json",
                                url: urlPTRESpy,
                                success: function(reponse) {
                                    if (reponse.code == 1) {
                                        document.getElementById('sendSRFromAGRTable-'+apiKeyRE).remove();
                                    }
                                    displayPTREMessage(reponse.message_verbose);
                                }
                            });
                        });
                    } else {
                        console.log("[PTRE] Error. Cant find data element: m" + messageID);
                    }
                }
            }
            observer.disconnect();
        } else {
            displayPTREMessage("Error. Add Team Key to PTRE settings");
            observer.disconnect();
        }
    }
}

// Add PTRE button to spy reports
function addPTREStuffsToMessagesPage() {

    // Check message pop-up
    let observer = new MutationObserver(addPTRESendSRButtonToMessagePopup);
    var node = document.getElementById('messages');
    observer.observe(node, {
        childList: true, // observer les enfants directs
    });

    // Check AGR Table
    if (isAGREnabled() && (GM_getValue(ptreImproveAGRSpyTable) == 'true')) {
        let spyTableObserver = new MutationObserver(addPTRESendSRButtonToAGRSpyTable);
        var nodeSpyTable = document.getElementById('fleetsTab');
        spyTableObserver.observe(nodeSpyTable, {
            attributes: true,
            childList: true, // observer les enfants directs
            subtree: true, // et les descendants aussi
            characterDataOldValue: true // transmettre les anciennes données au callback
        });
    }

    // Add PTRE button to messages
    if (document.getElementById('subtabs-nfFleet20')) {
        if (/ui-tabs-active/.test(document.getElementById('subtabs-nfFleet20').className) && !document.getElementById('PTREspan')) {
            var listMsg = $("li.msg ");
            var tabMsg = [];
            if (listMsg.length > 0) {
                //clearInterval(interGetRE);
                jQuery.each(listMsg, function(i, msgI) {
                    //consoleDebug(i +' val: '+ element.innetHTML);
                    var idMsg = msgI.getAttributeNode("data-msg-id").value;
                    if (msgI.getElementsByClassName('icon_nf icon_apikey')[0]) {
                        var apiKeyRE = /((sr)-[a-z]{2}-[0-9]+-[0-9a-z]+)/.exec(msgI.getElementsByClassName('icon_nf icon_apikey')[0].title)[0];
                        //consoleDebug(apiKeyRE);
                        var spanBtnPTRE = document.createElement("span"); // Create new div
                        spanBtnPTRE.innerHTML = '<a class="tooltip" target="ptre" title="Send to PTRE"><img id="sendRE-' + apiKeyRE + '" apikey="' + apiKeyRE + '" style="cursor:pointer;" class="mouseSwitch" src="' + imgPTRE + '" height="26" width="26"></a>';
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
                                        console.log('[PTRE] ' + reponse);
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

// *** *** ***
// IMPROVE GALAXY VIEW
// *** *** ***

// Add buttons to galaxy
function addPTREStuffsToGalaxyPage() {
    consoleDebug("addPTREStuffsToGalaxyPage: Updating galaxy");

    // Add PTRE debug message Div
    if (!document.getElementById("ptreGalaxyMessageD")) {
        var spanPTREGalaxyMessageD = '<span id="ptreSpanGalaxyMessageD"></span>';
        var divPTREGalaxyMessageD = document.createElement("div");
        divPTREGalaxyMessageD.innerHTML = spanPTREGalaxyMessageD;
        divPTREGalaxyMessageD.id = 'ptreGalaxyMessageD';
        document.getElementsByClassName('galaxyRow ctGalaxyFleetInfo')[0].appendChild(divPTREGalaxyMessageD);
        consoleDebug("ADD DEBUG DIV");
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
                    if (actionPos.children[1] && actionPos.children[1].getAttributeNode('data-playerid')) {
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
                            //consoleDebug('id : '+playerId+' pseudo :'+playerPseudo+' ina :'+inaPlayer);
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
            }
        });
    }
}

// *** *** ***
// GALAXY EXEC STUFFS
// *** *** ***

// Function called on galaxy page
function sendGalaxyActivities(){

    var systemElem = $("input#system_input")[0];
    var galaxyElem = $("input#galaxy_input")[0];
    var galaxy = galaxyElem.value;
    var system = systemElem.value;

    if (galaxy == lastActivitiesGalaSent && system == lastActivitiesSysSent) {
        return;
    }

    lastActivitiesGalaSent = galaxy;
    lastActivitiesSysSent = system;

    consoleDebug("Checking system " + galaxy + '.' + system);

    if (0 === galaxy.length || $.isNumeric(+galaxy) === false) {
        galaxy = 1;
    }
    if (0 === system.length || $.isNumeric(+system) === false) {
        system = 1;
    }
    console.log('[PTRE][' + galaxy + ':' + system + "] Checking targets activities");
    displayPTREGalaxyMessage('[' + galaxy + ':' + system + "] Checking targets activities");
    recupGalaRender(galaxy, system);

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
    if (isAGREnabled() && GM_getValue(ptreUseAGRList) == "true") {
        type = 'AGR';
        // Update AGR local list
        updateLocalAGRList();
    }
    debugListContent(type);

    $.each(systemPos, function(pos, infoPos){

        if (infoPos.player){
            var player_id = infoPos.player['playerId'];
            var player_name = infoPos.player['playerName'];
            //consoleDebug(infoPos);
            if (isPlayerInList(player_id, player_name, type)){
                var ina = infoPos.positionFilters;

                if (player_id != 99999 && !/inactive_filter/.test(ina)){
                    galaxy = infoPos.galaxy;
                    system = infoPos.system;
                    var position = infoPos.position;
                    var coords = galaxy+":"+system+":"+position;

                    consoleDebug(infoPos);
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
                    //consoleDebug("PLANET: " + planete);

                    // If their is a debris fiel AND/OR a moon
                    if (planete.length > 1) {
                        // Search Moon index
                        var moonIndex = -1;
                        if (planete[1]['planetType'] == 3) {
                            moonIndex = 1;
                        } else if (planete.length == 3 && planete[2]['planetType'] == 3) {
                            moonIndex = 2;
                        }
                        if (moonIndex != -1) {
                            //consoleDebug("MOON => " + planete[1]);
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
                            //consoleDebug("MOON: " + jsonLune);
                        } else {
                            //consoleDebug("[PTRE] Error: Cant find moon");
                        }
                    } else {
                        //consoleDebug("NO MOON");
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
                //consoleDebug(jsonSystem);
            });
            jsonSystem = jsonSystem.substr(0,jsonSystem.length-1);
            jsonSystem += '}';
        }

    });
    //consoleDebug("DATAS: " + jsonSystem);
    var dataPost = jsonSystem;

    if (jsonSystem != ''){
        $.ajax({
            url : urlPTREPushActivity,
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
        displayPTREGalaxyMessage("No target in this system");
    }
}
