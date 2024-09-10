// ==UserScript==
// @name         EasyPTRE
// @namespace    https://openuserjs.org/users/GeGe_GM
// @version      0.10.0
// @description  Plugin to use PTRE's basics features with AGR. Check https://ptre.chez.gg/
// @author       GeGe_GM
// @license      MIT
// @copyright    2022, GeGe_GM
// @match        https://*.ogame.gameforge.com/game/*
// @match        https://ptre.chez.gg/*
// @updateURL    https://openuserjs.org/meta/GeGe_GM/EasyPTRE.meta.js
// @downloadURL  https://openuserjs.org/install/GeGe_GM/EasyPTRE.user.js
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// Check current website
var modeEasyPTRE = "ingame";
if (/ptre.chez.gg/.test(location.href)) {
    modeEasyPTRE = "ptre";
    console.log("[PTRE] EasyPTRE: Mode PTRE");
}


var toolName = 'EasyPTRE';
var server = -1;
var country = "";
var universe = -1;
var currentPlayerID = -1;
var ptreID = "ptre-id";
const deepSpacePlayerId = 99999;

if (modeEasyPTRE == "ingame") {
    server = document.getElementsByName('ogame-universe')[0].content;
    var splitted = server.split('-');
    universe = splitted[0].slice(1);
    var splitted2 = splitted[1].split('.');
    country = splitted2[0];
    currentPlayerID = document.getElementsByName('ogame-player-id')[0].content;
} else {
    country = document.getElementsByName('ptre-country')[0].content;
    universe = document.getElementsByName('ptre-universe')[0].content;
    GM_setValue(ptreID, document.getElementsByName('ptre-id')[0].content);
}

var galaxyContentLinkTest = "https:\/\/"+server+"\/game\/index.php?page=ingame&component=galaxy&action=fetchGalaxyContent&ajax=1&asJson=1";
var lastActivitiesGalaSent = 0;
var lastActivitiesSysSent = 0;
var versionCheckTimeout = 6*60*60;
var technosCheckTimeout = 15*60;
var dataSharingDelay = 5;
var lastPTREActivityPushMicroTS = 0;
var ptreGalaxyMessageBoxContentFadeOut = 60*1000;
var ptreGalaxyActivityCount = 0;
var ptreGalaxyEventCount = 0;
const improvePageDelay = 200;

// GM keys
var ptreTeamKey = "ptre-" + country + "-" + universe + "-TK";
var ptreImproveAGRSpyTable = "ptre-" + country + "-" + universe + "-ImproveAGRSpyTable";
var ptrePTREPlayerListJSON = "ptre-" + country + "-" + universe + "-PTREPlayerListJSON";
var ptreAGRPlayerListJSON = "ptre-" + country + "-" + universe + "-AGRPlayerListJSON";
var ptreAGRPrivatePlayerListJSON = "ptre-" + country + "-" + universe + "-AGRPrivatePlayerListJSON";
var ptreEnableConsoleDebug = "ptre-" + country + "-" + universe + "-EnableConsoleDebug";
var ptreLastAvailableVersion = "ptre-" + country + "-" + universe + "-LastAvailableVersion";
var ptreLastAvailableVersionRefresh = "ptre-" + country + "-" + universe + "-LastAvailableVersionRefresh";
var ptreMaxCounterSpyTsSeen = "ptre-" + country + "-" + universe + "-MaxCounterSpyTsSeen";
var ptreTechnosJSON = "ptre-" + country + "-" + universe + "-Technos";
var ptreLastTechnosRefresh = "ptre-" + country + "-" + universe + "-LastTechnosRefresh";
var ptrePlayerID = "ptre-" + country + "-" + universe + "-PlayerID";
var ptreDataToSync = "ptre-" + country + "-" + universe + "-DataToSync";
var ptreGalaxyData = "ptre-" + country + "-" + universe + "-GalaxyDataG";

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
var ptreTargetListMaxSize = 300;
var ptrePushDelayMicroSec = 500;
// TODO: Set ptreAGRTargetListMaxSize

// PTRE URLs
var urlPTREImportSR = 'https://ptre.chez.gg/scripts/oglight_import.php?tool=' + toolName;
var urlPTREPushActivity = 'https://ptre.chez.gg/scripts/oglight_import_player_activity.php?tool=' + toolName + '&country=' + country + '&univers=' + universe;
var urlPTRESyncTargets = 'https://ptre.chez.gg/scripts/api_sync_target_list.php?tool=' + toolName + '&country=' + country + '&univers=' + universe;
var urlPTREGetPlayerInfos = 'https://ptre.chez.gg/scripts/oglight_get_player_infos.php?tool=' + toolName + '&country=' + country + '&univers=' + universe;
var urlPTRESyncSharableData = 'https://ptre.chez.gg/scripts/api_sync_data.php?tool=' + toolName + '&country=' + country + '&univers=' + universe;
var urlPTREGetPhalanxInfosFromGala = 'https://ptre.chez.gg/scripts/api_get_phalanx_infos.php?tool=' + toolName + '&country=' + country + '&univers=' + universe;
var urlPTREGetGEEInfosFromGala = 'https://ptre.chez.gg/scripts/api_get_gee_infos.php?tool=' + toolName + '&country=' + country + '&univers=' + universe;
var urlPTREPushGalaUpdate = 'https://ptre.chez.gg/scripts/api_galaxy_import_infos.php?tool=' + toolName + '&country=' + country + '&univers=' + universe;
var urlToScriptMetaInfos = 'https://openuserjs.org/meta/GeGe_GM/EasyPTRE.meta.js';

// ****************************************
// MAIN EXEC
// OGame pages
// ****************************************

if (modeEasyPTRE == "ingame") {

    // Add EasyPTRE menu
    if (!/page=standalone&component=empire/.test(location.href)) {
        // Setup Mneu Button
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

        document.getElementById('affOptionsPTRE').addEventListener("click", function (event) {
            displayPTREMenu();
        }, true);
    }

    // Run on all pages
    if (!/page=standalone&component=empire/.test(location.href)) {
        consoleDebug("Any page detected");
        setTimeout(improvePageAny, improvePageDelay);
    }

    // Galaxy page: Set routines
    if (/component=galaxy/.test(location.href)) {
        consoleDebug("Galaxy page detected");
        setTimeout(improvePageGalaxy, improvePageDelay);
    }

    // Message page: Add PTRE send SR button
    if (/component=messages/.test(location.href)) {
        consoleDebug("Message page detected");
        setTimeout(improvePageMessages, improvePageDelay);
    }

    // Save fleeters techs in order to send it to simulator from PTRE pages
    // Huge QOL to not add them manually
    if (/page=ingame&component=fleetdispatch/.test(location.href)) {
        consoleDebug("Fleet page detected");
        setTimeout(improvePageFleet, improvePageDelay);
    }

    // Capture Phalanx level
    if (/page=ingame&component=facilities/.test(location.href)) {
        consoleDebug("Facilities page detected");
        setTimeout(improvePageFacilities, improvePageDelay);
    }

    // Check for new version only if we already did the check once
    // In order to not display the Tampermoney autorisation window during an inappropriate moment
    // It will be enabled when user opens the PTRE menu
    if (GM_getValue(ptreLastAvailableVersionRefresh, 0) != 0) {
        updateLastAvailableVersion(false);
    } else {
        consoleDebug("Version Check not initialized: open settings to initialize it");
    }
}

// ****************************************
// MAIN EXEC
// PTRE pages only
// ****************************************

if (modeEasyPTRE == "ptre") {
    // Remove EasyPTRE notification from PTRE website
    if (document.getElementById("easyptre_install_notification")) {
        document.getElementById("easyptre_install_notification").remove();
    }

    // Display Lifeforms research on PTRE Lifeforms page
    if (/ptre.chez.gg\/\?page=lifeforms_researchs/.test(location.href)){
        if (universe != 0) {
            console.log("[PTRE] PTRE Lifeforms page detected: "+country+"-"+universe);
            const json = GM_getValue(ptreTechnosJSON, '');
            if (json != '') {
                tab = parsePlayerResearchs(json, "tab");
                document.getElementById("tech_from_easyptre").innerHTML = tab;
                console.log("[PTRE] Updating lifeforms page");
            } else {
                console.log("[PTRE] No lifeforms data saved");
            }
        }
    }

    // Update PTRE Spy Report Pages
    if (/ptre.chez.gg\/\?iid/.test(location.href)){
        console.log("[PTRE] PTRE Spy Report page detected: "+country+"-"+universe);
        const json = GM_getValue(ptreTechnosJSON, '');
        if (json != '') {
            const linkElement = document.getElementById("simulate_link");
            let hrefValue = linkElement.getAttribute("href");
            var prefill = parsePlayerResearchs(json, "prefill");
            hrefValue = hrefValue.replace("replaceme", prefill);
            linkElement.setAttribute("href", hrefValue);
            document.getElementById("simulator_comment").innerHTML = "This link contains your LF techs";
            console.log("[PTRE] Updating simulator link");
        } else {
            console.log("[PTRE] No lifeforms data saved");
        }
    }

}

// ****************************************
// Add PTRE styles
// Ugly style... yes!
// ****************************************
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
.ptre_maintitle {
    color: #299f9b;
    font-weight:bold;
    text-decoration: underline;
}
.ptre_title {
    color: #299f9b;
    font-weight:bold;
}
.ptre_tab_title {
    color: #299f9b;
}
.td_cell {
    padding: 3px;
}
.ptre_ship {
    background-image: url('https://gf3.geo.gfsrv.net/cdn84/3b19b4263662f5a383524052047f4f.png');
    background-repeat: no-repeat;
    height: 28px;
    width: 28px;
    display: block;
}
.ptre_ship_202 {
    background-position: 0 0;
}
.ptre_ship_203 {
    background-position: -28px 0;
}
.ptre_ship_204 {
    background-position: -56px 0;
}
.ptre_ship_205 {
    background-position: -84px 0;
}
.ptre_ship_206 {
    background-position: -112px 0;
}
.ptre_ship_207 {
    background-position: -140px 0;
}
.ptre_ship_208 {
    background-position: -168px 0;
}
.ptre_ship_209 {
    background-position: -196px 0;
}
.ptre_ship_210 {
    background-position: -224px 0;
}
.ptre_ship_211 {
    background-position: -252px 0;
}
.ptre_ship_212 {
    background-position: -280px 0;
}
.ptre_ship_213 {
    background-position: -308px 0;
}
.ptre_ship_214 {
    background-position: -336px 0;
}
.ptre_ship_215 {
    background-position: -364px 0;
}
.ptre_ship_217 {
    background-position: -448px 0;
}
.ptre_ship_218 {
    background-position: -392px 0;
}
.ptre_ship_219 {
    background-position: -420px 0;
}
.td_ship {
    padding: 3px;
}
.button {
    padding: 0px;
}
#divPTRESettings {
    position: fixed;
    bottom: 30px;
    right: 10px;
    z-index: 1000;
    font-size: 10pt;
}
#boxPTRESettings {
    width: 500px;
    padding:10px;
    border: solid black 2px;
    background:rgba(0,26,52,0.95);
}
#boxPTREMessage {
    position: fixed;
    bottom: 30px;
    right: 10px;
    z-index: 1001;
    padding:10px;
    
    border: solid black 2px;
    background:rgba(0,26,52,0.95);
}
#boxPTREInfos {
    position: fixed;
    bottom: 30px;
    right: 540px;
    z-index: 1000;
    font-size: 10pt;
    min-width: 300px;
    padding:10px;
    border: solid black 2px;
    background:rgba(0,26,52,0.95);
}
#btnSaveOptPTRE {
    cursor:pointer;
}
#ptreGalaxyMiniMessage {
    color:green;
    font-weight:bold;"
}
#targetDivSettings {
    height: 400px;
    overflow-y: scroll;
}
#ptreGalaxyBox {
    background:rgba(0,26,52,0.95);
    font-weight: revert;
}
#ptreGalaxyMessageBoxContent {
    padding-left: 10px;
    padding-top: 3px;
    text-align: left;
    display: block;
    line-height: 1.3em;
}
`);

// ****************************************
// IMPROVE VIEWS
// ****************************************

// To run on all pages
function improvePageAny() {
    console.log("[PTRE] Improving Any Page");
    if (isAGREnabled() && !isOGLorOGIEnabled()) {
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

// Add PTRE buttons to messages page
function improvePageMessages() {
    console.log("[PTRE] Improving Messages Page");
    if (!isOGLorOGIEnabled() && !isOGLorOGIEnabled()) {
        if (GM_getValue(ptreTeamKey) != '') {
            // Update Message Page (spy report part)
            setTimeout(addPTREStuffsToMessagesPage, 1000);
            // Update AGR Spy Table
            if (isAGREnabled() && (GM_getValue(ptreImproveAGRSpyTable, 'true') == 'true')) {
                let spyTableObserver = new MutationObserver(improveAGRSpyTable);
                var nodeSpyTable = document.getElementById('messagecontainercomponent');
                spyTableObserver.observe(nodeSpyTable, {
                    attributes: true,
                    childList: true, // observer les enfants directs
                    subtree: true, // et les descendants aussi
                });
            }
        }
    }
}

// Add buttons to galaxy
function improvePageGalaxy() {
    console.log("[PTRE] Improving Galaxy Page");

    var tempContent = '<table width="100%"><tr>';
    tempContent+= '<td valign="top"><span class="ptre_maintitle">PTRE TOOLBAR</span></td><td valign="top"><div id="ptreGalaxyPhalanxButton" type="button" class="button btn_blue">CLOSE PHALANX</div> <div id="ptreGalaxyGEEButton" type="button" class="button btn_blue">GALAXY EVENT EXPLORER</div></td>';
    tempContent+= '<td valign="top">';
    if (!isOGLorOGIEnabled()) {
        tempContent+= '<span id="ptreGalaxyActivityCount" class="status_positif"></span> Activities | <span id="ptreGalaxyEventCount" class="status_positif"></span> Galaxy Events';
    } else {
        tempContent+= '---';
    }
    tempContent+= '</td></tr><td valign="top" colspan="3"><hr></td></tr>';
    tempContent+= '<td valign="top" colspan="3"><div id="ptreGalaxyMessageBoxContent"></div></td></tr></table>';
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML = tempContent;
    tempDiv.id = 'ptreGalaxyBox';
    document.getElementsByClassName("galaxyTable")[0].appendChild(tempDiv);

    document.getElementById('ptreGalaxyPhalanxButton').addEventListener("click", function (event) {
        getPhalanxInfosFromGala();
    });
    document.getElementById('ptreGalaxyGEEButton').addEventListener("click", function (event) {
        getGEEInfosFromGala();
    });

    // Add PTRE debug message Div
    if (!document.getElementById("ptreGalaxyMessageD")) {
        tempDiv = document.createElement("div");
        tempDiv.innerHTML = '<span id="ptreGalaxyMiniMessage"></span>';
        tempDiv.id = 'ptreGalaxyMessageD';
        document.getElementsByClassName('galaxyRow ctGalaxyFleetInfo')[0].appendChild(tempDiv);
    }

    if (isAGREnabled() && !isOGLorOGIEnabled()) {
        // Run it once (As AGR does not modifiy Galaxy)
        checkForNewSystem();
        // Then add Trigger
        if (document.getElementById('galaxyHeader')) {
            console.log("[PTRE] Add trigger on galaxyHeader");
            let spyTableObserver = new MutationObserver(checkForNewSystem);
            var nodeSpyTable = document.getElementById('galaxyRow8');
            spyTableObserver.observe(nodeSpyTable, {
                attributes: true/*,
                childList: true, // observer les enfants directs
                subtree: true, // et les descendants aussi
                characterDataOldValue: true*/ // transmettre les anciennes données au callback
            });
        }
    }

    // If no AGR/OGL/OGI: add PTRE stuffs to Galaxy tab
    // This only add buttons to add target to native EasyPTRE
    if (!isAGREnabled() && !isOGLorOGIEnabled()) {
        consoleDebug("Improving Galaxy Page for AGR");
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
                                var isInList = isPlayerInTheList(playerId, 'PTRE');
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
                                        displayPTREPopUpMessage(retAdd[1]);
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
                                        var retSupp = deletePlayerFromList(playerId, 'PTRE');
                                        displayPTREPopUpMessage(retSupp);
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
}

// Save lifeforms researchs
// Save JSON "API 2" from fleet page
function improvePageFleet() {
    console.log("[PTRE] Improving Fleet Page");
    var currentTime = serverTime.getTime() / 1000;
    if (currentTime > GM_getValue(ptreLastTechnosRefresh, 0) + technosCheckTimeout) {
        GM_setValue(ptrePlayerID, currentPlayerID);
        var spanElement = document.querySelector('.show_fleet_apikey');
        var tooltipContent = spanElement.getAttribute('data-tooltip-title');
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = tooltipContent;
        var inputElements = tempDiv.querySelectorAll('input');
        var secondInputElement = inputElements[1];
        var techJSON = secondInputElement ? secondInputElement.value : null;
        if (techJSON != null) {
            //techList = JSON.parse(techJSON);
            GM_setValue(ptreTechnosJSON, techJSON);
            var tempMessage = 'Saving Lifeforms researches: <a href="https://ptre.chez.gg/?page=lifeforms_researchs" target="_blank">Display on PTRE</a>';
            displayPTREPopUpMessage(tempMessage);
            // Update last check TS
            GM_setValue(ptreLastTechnosRefresh, currentTime);
        } else {
            console.log("[PTRE] Cant find Techs!");
        }
    }
}

// Update Phalanx data
function improvePageFacilities() {
    console.log("[PTRE] Improving Facilities Page");
    if (document.getElementById('technologies')) {
        const technologiesDiv = document.getElementById('technologies');
        if (technologiesDiv.querySelector('li.sensorPhalanx')) {
            const sensorPhalanxLi = technologiesDiv.querySelector('li.sensorPhalanx');
            const levelSpan = sensorPhalanxLi.querySelector('span.level');
            var phalanx_level = levelSpan.getAttribute('data-value');
            var coords = document.getElementsByName('ogame-planet-coordinates')[0].content;
            //console.log('[PTRE] ' + coords + ' Found Phalanx level '+phalanx_level);

            //var moon = {type: "moon", id: coords, val: {pha_lvl: phalanx_level, toto: "titi", tata: "tutu"}};
            var phalanx = {type: "phalanx", id: coords, val: phalanx_level};
            addDataToPTREData(phalanx);
        }
    }
}

// ****************************************
// NOTIFICATIONS FUNCTIONS
// ****************************************

// Displays PTRE responses messages
// Responses from server
// Displayed on the rigth-bottom corner
function displayPTREPopUpMessage(message) {
    var previousContent = '';
    if (document.getElementById('boxPTREMessage') && document.getElementById("ptreMessage")) {
        // Get previous content and remove box
        previousContent = document.getElementById("ptreMessage").innerHTML;
        document.getElementById('boxPTREMessage').remove();
    }

    // Recreate box
    var divPTREMessage = '<div id="boxPTREMessage">PTRE:<span id="ptreMessage">' + previousContent + '<span id="fisrtPtreMessage"><br>' + message + '</span></span></div>';
    var boxPTREMessage = document.createElement("div");
    boxPTREMessage.innerHTML = divPTREMessage;
    boxPTREMessage.id = 'boxPTREMessage';

    if (document.getElementById('bottom')) {
        document.getElementById('bottom').appendChild(boxPTREMessage);
        setTimeout(function() {cleanFirstPTREPopUpMessage();}, ptreMessageDisplayTime * 1000);
    }
}

// Remove first message in list and remove entire message box if empty
function cleanFirstPTREPopUpMessage() {
    if (document.getElementById('fisrtPtreMessage')) {
        document.getElementById('fisrtPtreMessage').remove();
        if (document.getElementById("ptreMessage").innerHTML == '') {
            document.getElementById('boxPTREMessage').remove();
        }
    }
}

// Display message under galaxy view
function displayGalaxyMiniMessage(message) {
    if (document.getElementById("ptreGalaxyMiniMessage")) {
        document.getElementById("ptreGalaxyMiniMessage").innerHTML = "PTRE: " + message;
    } else {
        console.log("[PTRE] Error. Cant display: " + message);
    }
}

// Display message content on galaxy page
function displayGalaxyMessageContent(message) {
    if (document.getElementById("ptreGalaxyMessageBoxContent")) {
        document.getElementById("ptreGalaxyMessageBoxContent").innerHTML = message;
    } else {
        console.log("[PTRE] Error. Cant display: " + message);
    }
}

// ****************************************
// MINI FUNCTIONS
// ****************************************

// Detects if AGR is enabled
function isAGREnabled() {
    if (document.getElementById('ago_panel_Player')) {
        return true;
    }
    return false;
}

// Detects if OGL is enabled
function isOGLorOGIEnabled() {
    if (document.querySelector('body.oglight') || document.getElementsByClassName('ogl-harvestOptions').length != 0) {
        return true;
    }
    return false;
}

// Convert planets activities to OGL - PTRE format
function convertActivityToOGLFormat(showActivity, idleTime) {
    if (showActivity == '15') {
        return '*';
    } else if (showActivity == '60') {
        return idleTime;
    } else if (!showActivity) {
        return '60';
    }
    return '60';
}

function buildPTRELinkToPlayer(playerID) {
    return 'https://ptre.chez.gg/?country=' + country + '&univers=' + universe + '&player_id=' + playerID;
}

function consoleDebug(message) {
    if (GM_getValue(ptreEnableConsoleDebug, 'false') == 'true') {
        console.log('[PTRE] ' + message);
    }
}

function round(x, y) {
    return Number.parseFloat(x).toFixed(y);
}

function displayMessageInSettings(message) {
    if (document.getElementById('messageDivInSettings')) {
        document.getElementById('messageDivInSettings').innerHTML = message;
    }
}

function setNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// ****************************************
// PTRE/AGR LIST RELATED
// ****************************************

// Remove player from PTRE/AGR list
function deletePlayerFromList(playerId, type) {

    // Check if player is part of the list
    if (isPlayerInTheList(playerId, type)) {
        // Get list content depending on if its PTRE or AGR list
        var targetJSON = '';
        var pseudo = '';
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
                pseudo = PlayerCheck.pseudo;
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

        return 'Player ' + pseudo + ' was removed from ' + type + ' list';
    } else {
        return 'Player is not part of ' + type + ' list';
    }
}

// Add player to PTRE/AGR list
function addPlayerToList(playerId, playerPseudo, type) {

    // Check if player is part of the list
    if (!isPlayerInTheList(playerId, type)) {
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
            return [0, type + ' targets list is full, please remove a target'];
        } else {
            // Add player to list
            var player = {id: playerId, pseudo: playerPseudo};
            targetList.push(player);

            // Save list
            targetJSON = JSON.stringify(targetList);
            var ret_code = 0;
            if (type == 'PTRE') {
                GM_setValue(ptrePTREPlayerListJSON, targetJSON);
            } else if (type == 'AGR') {
                GM_setValue(ptreAGRPlayerListJSON, targetJSON);
                // We want to detect and notify when an AGR target is added
                ret_code = 1;
            }
            consoleDebug('Player ' + playerPseudo + ' has been added to ' + type + ' list');
            return [ret_code, 'Player has been added to ' + type + ' list'];
        }
    } else {
        return [0, 'Player is already in ' + type + ' list'];
    }
}

// This list contains targets that should not be shared to PTRE Team
function tooglePrivatePlayer(playerId) {
    var targetJSON = '';
    var targetList = [];
    var status = '';
    targetJSON = GM_getValue(ptreAGRPrivatePlayerListJSON , '');

    var idASup = -1;
    if (targetJSON != '') {
        targetList = JSON.parse(targetJSON);

        $.each(targetList, function(i, PlayerCheck) {
            if (PlayerCheck.id == playerId) {
                // Present => Delete
                idASup = i;
            }
        });
        if (idASup != -1) {
            targetList.splice(idASup, 1);
            status = 'shareable (sync to share)';
            consoleDebug("Deleting private player (" + idASup + "): " + playerId);
        }
    }
    if (idASup == -1) {
        var player = {id: playerId};
        targetList.push(player);
        status = 'private';
        consoleDebug("Adding private player " + playerId);
    }
    // Save new list
    targetJSON = JSON.stringify(targetList);
    GM_setValue(ptreAGRPrivatePlayerListJSON, targetJSON);

    return status;
}

function isTargetPrivate(playerId) {
    var targetJSON = '';
    var targetList = [];
    targetJSON = GM_getValue(ptreAGRPrivatePlayerListJSON , '');

    var found = 0;
    if (targetJSON != '') {
        targetList = JSON.parse(targetJSON);

        $.each(targetList, function(i, PlayerCheck) {
            if (PlayerCheck.id == playerId) {
                found = 1;
            }
        });
        if (found == 1) {
            return true;
        }
    }
    return false;
}

function debugListContent() {

    var targetJSON = '';

    targetJSON = GM_getValue(ptreAGRPlayerListJSON, '');
    var targetList = JSON.parse(targetJSON);
    console.log("[PTRE] AGR list: ");
    console.log(targetList);

    targetJSON = GM_getValue(ptrePTREPlayerListJSON, '');
    targetList = JSON.parse(targetJSON);
    console.log("[PTRE] PTRE list: ");
    console.log(targetList);
}

// Check is player is in list
function isPlayerInLists(playerId) {
    if (isPlayerInTheList(playerId, 'AGR') || isPlayerInTheList(playerId, 'PTRE')) {
        return true;
    }
    return false;
}

function isPlayerInTheList(playerId, type = 'PTRE') {

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
// Friend: 52 => NO
// Trader: 55 => NO
// Watch: 62 => YES
// Miner: 64 => YES
// Target: 66 => YES
// To attack: 67 => YES
function updateLocalAGRList() {
    var tabAgo = document.getElementsByClassName('ago_panel_overview');

    var count = 0;
    if (tabAgo && tabAgo[1] && tabAgo[1].children) {
        $.each(tabAgo[1].children, function(i, ligneJoueurAGR) {
            if (ligneJoueurAGR.getAttributeNode('ago-data')) {
                var txtjsonDataAgo = ligneJoueurAGR.getAttributeNode('ago-data').value;
                var jsonDataAgo = JSON.parse(txtjsonDataAgo);
                var token = jsonDataAgo.action.token;
                // Do not add Friends and Traders to target list
                // This will add user custom list too
                if (token != 52 && token != 55) {
                    var IdPlayer = jsonDataAgo.action.id;
                    var PseudoPlayer = ligneJoueurAGR.children[1].innerText;
                    //consoleDebug('AGR native list member: ' + PseudoPlayer + ' (' + IdPlayer + ') | token:' + token + ')');
                    var ret = addPlayerToList(IdPlayer, PseudoPlayer, 'AGR');
                    count+= ret[0];
                }
            }
        });
    }
    if (count > 0) {
        displayPTREPopUpMessage(count + ' targets added to AGR list');
    }
}

// ****************************************
// IMPROVE MAIN VIEWS
// ****************************************

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
function displayPTREMenu(mode = 'AGR') {

    if (!document.getElementById('btnSaveOptPTRE')) {
        var ptreStoredTK = GM_getValue(ptreTeamKey, '');
        // Get menu mode (what we will display)
        var other_mode = 'PTRE';
        if (mode == 'PTRE') {
            other_mode = 'AGR';
        }
        // Check if AGR is enabled
        var isAGROn;
        if (isAGREnabled()) {
            isAGROn = true;
        } else {
            isAGROn = false;
            mode = 'PTRE';
            other_mode = 'AGR';
        }
        var divPTRE = '<div id="boxPTRESettings"><table border="1" width="100%">';
        divPTRE += '<tr><td class="td_cell"><span class="ptre_maintitle">EasyPTRE PANNEL</span></td><td class="td_cell" align="right"><div id="btnHelpPTRE" type="button" class="button btn_blue">HELP</div> <div id="btnRefreshOptPTRE" type="button" class="button btn_blue">REFRESH</div> <div id="btnCloseOptPTRE" type="button" class="button btn_blue">CLOSE</div></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><div id=messageDivInSettings class="status_warning"></div></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><hr /></td></tr>';
        divPTRE += '<tr><td class="td_cell"><div class="ptre_title">Settings</div></td><td class="td_cell" align="right"><div id="btnSaveOptPTRE" type="button" class="button btn_blue">SAVE</div></td></tr>';
        divPTRE += '<tr><td class="td_cell"><div>PTRE Team Key:</div></td><td class="td_cell" align="center"><div><input onclick="document.getElementById(\'ptreTK\').type = \'text\'" style="width:160px;" type="password" id="ptreTK" value="'+ ptreStoredTK +'"></div></td></tr>';

        // If AGR is detected
        if (isAGROn) {
            // AGR Spy Table Improvement
            divPTRE += '<tr><td class="td_cell">Improve AGR Spy Table:</td>';
            var improveAGRSpyTableValue = (GM_getValue(ptreImproveAGRSpyTable, 'true') == 'true' ? 'checked' : '');
            divPTRE += '<td class="td_cell" style="text-align: center;"><input id="PTREImproveAGRSpyTable" type="checkbox" ';
            divPTRE += improveAGRSpyTableValue;
            divPTRE += ' />';
            if (improveAGRSpyTableValue != 'checked') {
                divPTRE += ' <span class="status_warning">(recommended)</span>';
            }
            divPTRE += '</td></tr>';
        }
        // Console Debug mode
        divPTRE += '<tr><td class="td_cell">Enable Console Debug:</td>';
        var debugMode = (GM_getValue(ptreEnableConsoleDebug, 'false') == 'true' ? 'checked' : '');
        divPTRE += '<td class="td_cell" style="text-align: center;"><input id="PTREEnableConsoleDebug" type="checkbox" ';
        divPTRE += debugMode;
        divPTRE += ' />';
        divPTRE += '</td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><hr /></td></tr>';

        // A reprendre
        if (isOGLorOGIEnabled()) {
            divPTRE += '<tr><td class="td_cell"><span class="ptre_title">Targets list & Galaxy data</span></td></tr>';
            divPTRE += '<tr><td class="td_cell" colspan="2"><br><span class="status_warning">OGLight or OGInfinity is enabled: some EasyPTRE features are disabled to leave priority to your favorite tool, OGL / OGI<br><br>Pease also add your TeamKey into OGL / OGI</span>';
            divPTRE += '<br><br><span class="status_positif">EasyPTRE is still managing some tasks like:<br>- Galaxy Event Explorer Infos (in galaxy view)<br>- Lifeforms/combat researchs sync (for PTRE spy reports)<br>- Phalanx infos sharing (in galaxy view or Discord)</span></td></tr>';
        } else {
            // EasyPTRE enabled (AGR mode or vanilla mode)
            // Targets list
            divPTRE += '<tr><td class="td_cell"><span class="ptre_title">' + mode + ' Targets list</span>&nbsp;(<a href="https://ptre.chez.gg/?country='+country+'&univers='+universe+'&page=players_list" target="_blank">Manage</a>)</td><td class="td_cell" align="right"><div id="synctTargetsWithPTRE" class="button btn_blue"/>SYNC TARGETS</div></td></tr>';
            if (isAGROn) {
                divPTRE += '<tr><td class="td_cell"><i>Both lists are used</i></td><td class="td_cell" align="right"><div id="btnRefreshOptPTRESwitchList" type="button" class="button btn_blue">DISPLAY ' + other_mode + ' LIST</div></td></tr>';
            } else {
                divPTRE += '<tr><td colspan="2" class="td_cell" align="center"><span class="status_negatif">AGR is not enabled: Only using PTRE list.</span></td></tr>';
            }
            // Display PTRE list if AGR list setting is disabled OR AGR extension not installed
            var targetJSON = '';
            var targetList = '';
            divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><div id="targetDivSettings"><table width="90%">';
            if (mode == 'AGR') {
                divPTRE += '<tr><td class="td_cell"><span class="ptre_tab_title">Player<br>Name</span></td><td class="td_cell" align="center"><span class="ptre_tab_title">Fleet<br>Infos</span></td><td class="td_cell" align="center"><span class="ptre_tab_title">PTRE<br>Profile</span></td><td class="td_cell" align="center"><span class="ptre_tab_title">Keep<br>Private</span></td><td class="td_cell" align="center"><span class="ptre_tab_title">Remove<br>Target</span></td></tr>';
            } else {
                divPTRE += '<tr><td class="td_cell"><span class="ptre_tab_title">Player<br>Name</span></td><td class="td_cell" align="center"><span class="ptre_tab_title">Fleet<br>Infos</span></td><td class="td_cell" align="center"><span class="ptre_tab_title">Remove<br>Target</span></td></tr>';
            }
            if (mode == 'AGR' && isAGROn) {
                updateLocalAGRList();
                targetJSON = GM_getValue(ptreAGRPlayerListJSON, '');
                //divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><div class="status_positif">You are using AGR target list</div><div>Add targets via AGR lists</div></div></td></tr>';
            } else {
                targetJSON = GM_getValue(ptrePTREPlayerListJSON, '');
                //divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><div class="status_positif">You are using PTRE target lists</div><div>Add targets via galaxy view</div></td></tr>';
            }
            if (targetJSON != '') {
                targetList = JSON.parse(targetJSON);
                if (targetList) {
                    $.each(targetList, function(i, PlayerCheck) {
                        //consoleDebug(PlayerCheck);
                        divPTRE += '<tr id="rawPLayer_'+PlayerCheck.id+'"><td class="td_cell">- '+PlayerCheck.pseudo+'</td>';
                        divPTRE += '<td class="td_cell" align="center"><div id="btnGetPlayerInfos'+PlayerCheck.id+'" type="button" class="button btn_blue">FLEET</div></td>';
                        divPTRE += '<td class="td_cell" align="center"><a href="' + buildPTRELinkToPlayer(PlayerCheck.id) + '" target="_blank">Profile</a></td>';
                        if (mode == 'AGR') {
                            var checked = '';
                            if (isTargetPrivate(PlayerCheck.id)) {
                                checked = ' checked';
                            }
                            divPTRE += '<td class="td_cell" align="center"><input class="sharedTargetStatus" id="'+PlayerCheck.id+'" type="checkbox"' + checked + '></td>';
                        }
                        divPTRE += '<td class="td_cell" align="center"><a class="tooltip" id="removePlayerFromListBySettings_'+PlayerCheck.id+'" style="cursor:pointer;"><img class="mouseSwitch" src="' + imgSupPlayer + '" height="12" width="12"></a></td>';
                        divPTRE += '</tr>';
                    });
                }
            }
            divPTRE += '</table></div></td></tr>';

            // Galaxy Data
            divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><hr /></td></tr>';
            divPTRE += '<tr><td class="td_cell"><span class="ptre_title">Galaxy data</span></td><td class="td_cell" align="right"><div id="displayGalaxyTracking" class="button btn_blue"/>DETAILS</div></td></tr>';
            divPTRE += '<tr><td class="td_cell" colspan="2" align="center">'+displayTotalSystemsSaved()+'</td></tr>';
        }

        // Lifeforms Menu
        const currentTime = serverTime.getTime() / 1000;
        const lastTechCheck = GM_getValue(ptreLastTechnosRefresh, 0);
        var techMessage = '<span class="status_negatif">No Lifeforms researchs saved. Go to <a href="/game/index.php?page=ingame&component=fleetdispatch">Fleet Page to update</a>.</span>';
        if (lastTechCheck != 0) {
            var nb_min = (currentTime - lastTechCheck) / 60;
            techMessage = '<b>Lifeforms researchs saved for simulator '+round(nb_min, 0)+' minute(s) ago</b>.<br><a href="/game/index.php?page=ingame&component=fleetdispatch">Fleet menu to update</a> - <a href="https://ptre.chez.gg/?page=lifeforms_researchs" target="_blank">Check it out on PTRE</a>';
        }
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><hr /></td></tr>';
        divPTRE += '<tr><td class="td_cell" colspan="2"><span class="ptre_title">Lifeforms researchs</span></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2">'+techMessage+'</td></tr>';

        // Shared data
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><hr /></td></tr>';
        divPTRE += '<tr><td class="td_cell"><span class="ptre_title">Team shared data</span></td><td class="td_cell" align="right"><div id="synctDataWithPTRE" class="button btn_blue">SYNC DATA</div></td></tr>';
        divPTRE += '<tr><td class="td_cell" colspan="2">Phalanx: ';
        var dataJSON = '';
        dataJSON = GM_getValue(ptreDataToSync, '');

        var phalanxCount = 0;
        var dataList = [];
        if (dataJSON != '') {
            dataList = JSON.parse(dataJSON);
            $.each(dataList, function(i, elem) {
                if (elem.type = "phalanx") {
                    phalanxCount++;
                }
            });
        }
        divPTRE += '<span class="status_positif">' + phalanxCount + '</span> synced to PTRE Team</td></tr>';


        // Footer
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><hr /></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><a href="https://ptre.chez.gg/" target="_blank">PTRE</a> | <a href="https://discord.gg/WsJGC9G" target="_blank">Discord</a> | <a href="https://ko-fi.com/ptreforogame" target="_blank">Donate</a></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><b>EasyPTRE  v' + GM_info.script.version + '</b> <div id="forceCheckVersionButton" type="button" class="button btn_blue">CHECK</div></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><span id="ptreUpdateVersionMessage">';
        var lastAvailableVersion = GM_getValue(ptreLastAvailableVersion, -1);
        if (lastAvailableVersion != -1 && lastAvailableVersion !== GM_info.script.version) {
            divPTRE += '<span class="status_negatif">Check <a href="https://openuserjs.org/scripts/GeGe_GM/EasyPTRE" target="_blank">EasyPTRE</a> updates</a></span>';
        }
        divPTRE += '</span></td></tr>';
        // Check last script version
        updateLastAvailableVersion(false);

        //fin div table tr
        divPTRE += '</table></div>';

        var eletementSetPTRE = document.createElement("div");
        eletementSetPTRE.innerHTML = divPTRE;
        eletementSetPTRE.id = 'divPTRESettings';

        if (document.getElementById('bottom')) {
            document.getElementById('bottom').appendChild(eletementSetPTRE);
        }

        // Action: Sync data to PTRE
        document.getElementById('synctDataWithPTRE').addEventListener("click", function (event) {
            syncSharableData('manual');
        });

        // Action: Check version
        document.getElementById('forceCheckVersionButton').addEventListener("click", function (event) {
            document.getElementById('ptreUpdateVersionMessage').innerHTML = '';
            updateLastAvailableVersion(true);
        });

        // Action: Help
        document.getElementById('btnHelpPTRE').addEventListener("click", function (event) {
            displayHelp();
        });

        // Action: Display Galaxy Tracking
        if (document.getElementById('displayGalaxyTracking')) {
            document.getElementById('displayGalaxyTracking').addEventListener("click", function (event) {
                displayGalaxyTracking();
            });
        }

        // Action: Close
        document.getElementById('btnCloseOptPTRE').addEventListener("click", function (event) {
            document.getElementById('divPTRESettings').parentNode.removeChild(document.getElementById('divPTRESettings'));
            if (document.getElementById('divPTREInfos')) {
                document.getElementById('divPTREInfos').parentNode.removeChild(document.getElementById('divPTREInfos'));
            }
        });

        // Action: Save
        document.getElementById('btnSaveOptPTRE').addEventListener("click", function (event) {
            // Save PTRE Team Key
            var newTK = document.getElementById('ptreTK').value;
            // Check PTRE Team Key Format
            if (newTK.replace(/-/g, "").length == 18 && newTK.substr(0,2) == "TM") {
                // If new TK, store it
                if (newTK != ptreStoredTK) {
                    GM_setValue(ptreTeamKey, document.getElementById('ptreTK').value);
                }
                if (isAGROn) {
                    // Update settings
                    GM_setValue(ptreImproveAGRSpyTable, document.getElementById('PTREImproveAGRSpyTable').checked + '');
                }
                // Update Console Debug Mode
                GM_setValue(ptreEnableConsoleDebug, document.getElementById('PTREEnableConsoleDebug').checked + '');
                // Update menu image and remove it after few sec
                document.getElementById('imgPTREmenu').src = imgPTRESaveOK;
                setTimeout(function() {document.getElementById('imgPTREmenu').src = imgPTRE;}, menuImageDisplayTime * 1000);
                // Display OK message and remove div after few sec
                displayMessageInSettings('Team Key Format OK');
            } else {
                displayMessageInSettings('Wrong Team Key Format');
            }
        });
        document.getElementById('btnRefreshOptPTRE').addEventListener("click", function (event) {
            document.getElementById('divPTRESettings').parentNode.removeChild(document.getElementById('divPTRESettings'));
            setTimeout(function() {displayPTREMenu();}, 100);
        });
        if (isAGROn) {
            document.getElementById('btnRefreshOptPTRESwitchList').addEventListener("click", function (event) {
                document.getElementById('divPTRESettings').parentNode.removeChild(document.getElementById('divPTRESettings'));
                setTimeout(function() {displayPTREMenu(other_mode);}, 100);
            });
        }

        if (!isOGLorOGIEnabled()) {
            // Toogle target status
            var targetStatus = document.getElementsByClassName('sharedTargetStatus');
            $.each(targetStatus, function(nb, target) {
                document.getElementById(target.id).addEventListener("click", function (event)
                {
                    var status = tooglePrivatePlayer(target.id);
                    displayMessageInSettings('Target is now ' + status);
                });
            });

            // Action: Sync targets
            document.getElementById('synctTargetsWithPTRE').addEventListener("click", function (event) {
                var AGRJSON = GM_getValue(ptreAGRPlayerListJSON, '');
                var PTREJSON = GM_getValue(ptrePTREPlayerListJSON, '');
                var targetList = [];
                var targetListTemp;
                var player;
                var nb_private = 0;

                if (AGRJSON != '' && PTREJSON != '') {
                    targetListTemp = JSON.parse(AGRJSON);
                    var targetListPTRE = JSON.parse(PTREJSON);
                    targetListTemp = targetListTemp.concat(targetListPTRE);
                } else if (AGRJSON != '') {
                    targetListTemp = JSON.parse(AGRJSON);
                } else if (PTREJSON != '') {
                    targetListTemp = JSON.parse(PTREJSON);
                } else {
                    targetListTemp = [];
                }

                targetListTemp.forEach(function(item, index, object) {
                    consoleDebug(item.id + ' ' + item.pseudo);
                    if (isTargetPrivate(item.id)) {
                        consoleDebug("Ignoring " + item.pseudo);
                        nb_private++;
                    } else {
                        player = {id: item.id, pseudo: item.pseudo};
                        targetList.push(player);
                    }
                });

                fetch(urlPTRESyncTargets + '&version=' + GM_info.script.version + '&team_key=' + ptreStoredTK,
                { method:'POST', body:JSON.stringify(targetList) })
                .then(response => response.json())
                .then(data => {
                    if(data.code == 1) {
                        var count = 0;
                        var newTargetList = JSON.parse(JSON.stringify(data.targets_array));
                        $.each(newTargetList, function(i, incomingPlayer) {
                            if (!isPlayerInLists(incomingPlayer.player_id)) {
                                addPlayerToList(incomingPlayer.player_id, incomingPlayer.pseudo, 'PTRE');
                                count++;
                            }
                        });
                        displayMessageInSettings(nb_private + ' private targets ignored. ' + data.message + ' ' + count + ' new targets added.');
                    } else {
                        displayMessageInSettings(data.message);
                    }
                });
            });

            // Action: Player Infos
            if (targetList) {
                $.each(targetList, function(i, PlayerCheck) {
                    document.getElementById('btnGetPlayerInfos'+PlayerCheck.id).addEventListener("click", function (event) {
                        getPlayerInfos(PlayerCheck.id, PlayerCheck.pseudo);
                    });
                });
            }

            // Action: Delete player
            if (targetList) {
                $.each(targetList, function(i, PlayerCheck) {
                    document.getElementById('removePlayerFromListBySettings_'+PlayerCheck.id).addEventListener("click", function (event) {
                        // Delete player from list
                        var mess = deletePlayerFromList(PlayerCheck.id, mode);
                        displayMessageInSettings(mess);
                        document.getElementById('rawPLayer_'+PlayerCheck.id).remove();
                    });
                });
            }
        }
    }
    syncSharableData();
}

// This function adds PTRE send SR button to AGR Spy Table
function improveAGRSpyTable(mutationList, observer) {
    if (document.getElementById('agoSpyReportOverview')) {
        // Stop observer
        observer.disconnect();
        var TKey = GM_getValue(ptreTeamKey, '');
        if (TKey != '') {
            console.log("[PTRE] Updating AGR Spy Table");
            var table = document.getElementsByClassName("ago_reports")[0];
            for (var i = 0, row; row = table.rows[i]; i++) {
                var nbCol = row.cells.length;
                if (row.cells[0].tagName == "TD") {
                    var rowCurrent = table.getElementsByTagName("tr")[i];
                    var messageID = rowCurrent.id.slice(2);
                    if (document.getElementById("m"+messageID)) {
                        // Find API Key in page
                        var apiKeyRE;
                        var rawMessageData = document.querySelector('div.msg[data-msg-id="' + messageID + '"] .rawMessageData');
                        if (rawMessageData) {
                            // Obtenir la valeur de data-raw-hashcode
                            apiKeyRE = rawMessageData.getAttribute('data-raw-hashcode');
                        }
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
                                    displayPTREPopUpMessage(reponse.message_verbose);
                                }
                            });
                        });
                    } else {
                        console.log("[PTRE] Error. Cant find data element: m" + messageID);
                    }
                }
            }
        } else {
            displayPTREPopUpMessage("Error. Add Team Key to PTRE settings");
        }
    }
}

// Add PTRE button to spy reports
function addPTREStuffsToMessagesPage() {

    // Add PTRE button to messages
    var TKey = GM_getValue(ptreTeamKey, '');
    if (TKey != '') {
        if (document.getElementsByClassName('messagesHolder')[0]) {
            var maxCounterSpyTsSeen = GM_getValue(ptreMaxCounterSpyTsSeen, 0);
            var maxCounterSpyTsSeenNow = 0;
            var tabActiPos = [];
            var messages = document.getElementsByClassName('msgWithFilter');
            Array.prototype.forEach.call(messages, function(current_message) {
                var apiKeyRE = "";

                var messageID = current_message.getAttributeNode("data-msg-id").value;
                var rawMessageData = document.querySelector('div.msg[data-msg-id="' + messageID + '"] .rawMessageData');
                if (rawMessageData) {
                    // Obtenir la valeur de data-raw-hashcode
                    apiKeyRE = rawMessageData.getAttribute('data-raw-hashcode');
                    if (currentPlayerID !== rawMessageData.getAttribute('data-raw-targetplayerid')) {
                        // This is a Spy Report
                        var spanBtnPTRE = document.createElement("span"); // Create new div
                        spanBtnPTRE.innerHTML = '<a class="tooltip" target="ptre" title="Send to PTRE"><img id="sendRE-' + apiKeyRE + '" apikey="' + apiKeyRE + '" style="cursor:pointer;" class="mouseSwitch" src="' + imgPTRE + '" height="26" width="26"></a>';
                        spanBtnPTRE.id = 'PTREspan';
                        current_message.getElementsByClassName("msg_actions")[0].getElementsByTagName("message-footer-actions")[0].appendChild(spanBtnPTRE);
                        document.getElementById('sendRE-' + apiKeyRE).addEventListener("click", function (event) { 
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
                                    displayPTREPopUpMessage(reponse.message_verbose);
                                }
                            });
                        });
                    } else {
                        var planet_acti;
                        var jsonLune;
                        const message_ts = rawMessageData.dataset.rawDatetime;
                        const spy_message_ts = message_ts * 1000;
                        var alreadySentLabel = "";

                        if (message_ts > maxCounterSpyTsSeen) {
                            if (message_ts > maxCounterSpyTsSeenNow) {
                                maxCounterSpyTsSeenNow = message_ts;
                            }
                            // Get Spy coords
                            var temp = current_message.getElementsByClassName("msgTitle")[0].innerHTML;
                            const regex = /\[(\d+):(\d+):(\d+)\]/;
                            var coords;
                            coords = temp.match(regex);
                            // Set both position as active
                            // TODO: find a way to find out if planet or moon in text :(
                            planet_acti = "*";
                            jsonLune = {activity:"*"};
                            // Find Player ID
                            const tmpHTML = document.createElement('div');
                            tmpHTML.insertAdjacentHTML("afterbegin", current_message.querySelector("span.player").dataset.tooltipTitle);
                            const playerID = tmpHTML.querySelector("[data-playerId]").dataset.playerid;

                            // Send counter-spy messages
                            var jsonActiPos = {
                                messageID : messageID,
                                player_id : playerID,
                                teamkey : TKey,
                                coords : coords[1]+':'+coords[2]+':'+coords[3],
                                galaxy : coords[1],
                                system : coords[2],
                                position : coords[3],
                                main : false,
                                activity : planet_acti,
                                moon : jsonLune,
                                spy_message_ts: spy_message_ts
                            };
                            tabActiPos.push(jsonActiPos);
                        } else {
                            alreadySentLabel = " already";
                        }

                        // Add button
                        var spanBtnPTRE2 = document.createElement("span"); // Create new div
                        spanBtnPTRE2.innerHTML = '<a class="tooltip" target="ptre" title="Counter Spy' + alreadySentLabel + ' sent to PTRE"><img style="cursor:pointer;" class="mouseSwitch" src="' + imgPTREOK + '" height="26" width="26"></a>';
                        spanBtnPTRE2.id = 'PTREspan';
                        current_message.getElementsByClassName("msg_actions")[0].getElementsByTagName("message-footer-actions")[0].appendChild(spanBtnPTRE2);
                    }
                }
            });

            if (tabActiPos.length > 0){
                // Save New max TS to not re-send same counter spy messages
                GM_setValue(ptreMaxCounterSpyTsSeen, maxCounterSpyTsSeenNow);

                // Build JSON
                var jsonSystem = '{';
                $.each(tabActiPos, function(nb, jsonPos){
                    jsonSystem += '"'+jsonPos.coords+'-'+jsonPos.messageID+'":'+JSON.stringify(jsonPos)+',';
                });
                jsonSystem = jsonSystem.substr(0,jsonSystem.length-1);
                jsonSystem += '}';

                // Sent to PTRE
                $.ajax({
                    url : urlPTREPushActivity,
                    type : 'POST',
                    data: jsonSystem,
                    cache: false,
                    success : function(reponse){
                        var reponseDecode = jQuery.parseJSON(reponse);
                        displayPTREPopUpMessage(reponseDecode.message);
                        if (reponseDecode.code != 1) {
                            displayPTREPopUpMessage(reponseDecode.message);
                        }
                    }
                });
                console.log('[PTRE] Pushing counter spy messages');
            }
        }
    }
}

// This function creates empty Info Box.
// Its ready to be updated
function setupInfoBox() {
    if (document.getElementById('divPTREInfos')) {
        document.getElementById('divPTREInfos').parentNode.removeChild(document.getElementById('divPTREInfos'));
    }
    var divPTRE = '<div id="boxPTREInfos"><table border="1" width="100%"><tr><td align="right"><div id="btnCloseInfosPTRE" type="button" class="button btn_blue">CLOSE</div><hr></td></tr><tr><td><div id="infoBoxContent"><br><br><center><span class="status_warning">LOADING...</span><center><br><br><br></div></td></tr></table>';
    var eletementSetPTRE = document.createElement("div");
    eletementSetPTRE.innerHTML = divPTRE;
    eletementSetPTRE.id = 'divPTREInfos';

    if (document.getElementById('ingamepage')) {
        document.getElementById('ingamepage').appendChild(eletementSetPTRE);
    }

    document.getElementById('btnCloseInfosPTRE').addEventListener("click", function (event) {
        document.getElementById('divPTREInfos').parentNode.removeChild(document.getElementById('divPTREInfos'));
    });
}

// This function calls PTRE backend to get player informations
// And sends results to Info Box
function getPlayerInfos(playerID, pseudo) {
    setupInfoBox();

    $.ajax({
        dataType: "json",
        url: urlPTREGetPlayerInfos + '&team_key=' + GM_getValue(ptreTeamKey, '') + '&player_id=' + playerID + '&pseudo=' + pseudo + '&noacti=yes',
        success: function(reponse) {
            if (reponse.code == 1) {
                var content = '<center><table width="90%"><tr><td class="td_ship ptre_tab_title" align="center">' + pseudo + '</td><td class="td_ship ptre_tab_title" align="center">' + setNumber(reponse.top_sr_fleet_points) + ' fleet points</td></tr>';
                content+= '<tr><td class="td_ship" align="center">[<a href="' + buildPTRELinkToPlayer(playerID) + '" target="_blank">PROFILE</a>]</td><td class="td_ship" align="center">[<a href="' + reponse.top_sr_link + '" target="_blank">BEST REPORT</a>]</td></tr>';
                content+= '<tr><td class="td_ship" colspan="2"><hr></td></tr>';
                reponse.fleet_json.forEach(function(item, index, object) {
                    content+= '<tr><td class="td_ship" align="center"><span class="ptre_ship ptre_ship_' + item.ship_type + '"></td><td class="td_ship" align="center"></span><b>' + setNumber(item.count) + '</b></td></tr>';
                });
                content+= '</table></center>';
                document.getElementById('infoBoxContent').innerHTML = content;
            } else {
                document.getElementById('infoBoxContent').innerHTML = '<span class="status_negatif">' + reponse.message + '</span>';
            }
        }
    });
}

function displayHelp() {
    setupInfoBox();
    var content = '<span class="ptre_maintitle">EasyPTRE Help</span><br><br><span class="ptre_tab_title">Purpose</span><br><br>EasyPTRE works as a side-car of AGR in order to enable PTRE basic features. Once configured, you will be able to: <br>- Push and share spy reports<br>- Push counter spy messages as acivities<br>- Track targets galaxy activities and check results on PTRE website<br>- Track galaxy events (new moons, etc)<br>- Display player top fleet from PTRE<br>- Sync targets list with your Team';
    content+= '<br><br><span class="ptre_tab_title">Team Key setting</span><br><br>To use it, you need to create a Team on <a href="https://ptre.chez.gg?page=team" target="_blank">PTRE website</a> and add Team Key to EasyPTRE settings.<br>PTRE Team Key should look like: TM-XXXX-XXXX-XXXX-XXXX. Create your Team or ask your teammates for it.';
    content+= '<br><br><span class="ptre_tab_title">Spy report push</span><br><br>You can push spy reports from the messages page or when opening a spy report. Spy report will be shared to your Team and over Discord (if <a href="https://ptre.chez.gg/?page=discord_integration" target="_blank">configuration</a> is done).';
    content+= '<br><br><span class="ptre_tab_title">Galaxy tracking</span><br><br>EasyPTRE will track galaxy modifications (new moon, destroyed planet, etc) when you browse it and send data to your PTRE Team.<br>You can also enable notifications on Discord (type "!ptre !gala") or check all events on the <a href="https://ptre.chez.gg/?page=galaxy_event_explorer" target="_blank">Galaxy Event Explorer</a>.<br>This feature is disable if you use OGL or OGI, as it is directly integrated to thoses tools.';
    content+= '<br><br><span class="ptre_tab_title">Lifeforms Researchs synchronization</span><br><br>EasyPTRE will save your LF researchs so you never have to manually enter thme into simulator when using PTRE links. <a href="https://ptre.chez.gg/?page=lifeforms_researchs" target="_blank">Details here</a>.';
    content+= '<br><br><span class="ptre_tab_title">Activity sharing</span><br><br>EasyPTRE will send targets activities from galaxy and counter-spy messages from Inbox.<br>It allows you to check activity table and what your opponent is doing.<br>This feature is disable if you use OGL or OGI, as it is directly integrated to thoses tools.';
    content+= '<br><br><span class="ptre_tab_title">Target lists</span><br><br>EasyPTRE targets lists determines players that will be activity-tracked when exploring the galaxy. ';
    content+= 'EasyPTRE manages two targets lists that works at same time (both lists are tracked):<br>- AGR target list: it is based on you AGR left pannel: Target, To attack, Watch, Miner. It ignores Friends and traders. To update this list, open your AGR target pannels<br>- PTRE target list: this list containes targets shared by your team';
    content+= '<br><br>You can sync your target lists with your teammates (you may ignore some of your targets in order to NOT share them with friends and keep it to yourself).';
    content+= '<br><br>Common targets list (for your PTRE Team) can be configured <a href="https://ptre.chez.gg/?page=players_list" target="_blank">on PTRE players list page</a>.';
    content+= '<br><br><span class="ptre_tab_title">Need more help?</span><br><br>You can get some help on <a href="https://discord.gg/WsJGC9G" target="_blank">Discord</a>, come and ask us.';

    document.getElementById('infoBoxContent').innerHTML = content;
}

function displayGalaxyTracking() {
    setupInfoBox();
    var countGala = 0;
    var countSsystemTotal = 0;
    var countSsystem = 0;
    var content2 = '';
    var content = '<span class="ptre_maintitle">Galaxy tracking distribution</span><br><br><br><span class="ptre_tab_title">Distribution</span><br><br><table>';
    var temp = [];
    //var oldestTs = serverTime.getTime() / 1000 + 60;

    for(var gala = 1; gala <= 12 ; gala++) {
        var galaxyDataJSON = GM_getValue(ptreGalaxyData+gala, '');
        if (galaxyDataJSON != '') {
            countGala++;
            countSsystem = 0;
            for (var i = 1 ; i <= 499 ; i++) {
                temp[i] = '.';
            }
            content+='<tr><td>G'+gala+': </td>';
            galaxyDataList = JSON.parse(galaxyDataJSON);
            $.each(galaxyDataList, function(i, elem) {
                countSsystemTotal++;
                countSsystem++;
                temp[Object.keys(elem)[0]] = '!';
            });
            for (var j = 1 ; j <= 499 ; j++) {
                if (j %2 == 0) {
                    content+= '<td>'+temp[j]+'</td>';
                }
            }
            content+= '</tr>';
            var percentTemp = round(countSsystem / 500 * 100, 0);
            content2+='Tracked systems for galaxy '+gala+': <span class="status_positif">'+countSsystem+'</span> / 500 (<span class="status_positif">'+percentTemp+'%</span>)<br>';
        }
    }
    content+= '</table><br><br><span class="ptre_tab_title">Total</span><br><br>Tracked Galaxies: <span class="status_positif">'+countGala+'</span> | Tracked Systems: <span class="status_positif">'+countSsystemTotal+'</span><br><br><br>';
    content+='<span class="ptre_tab_title">Galaxy details</span><br><br>'+content2;
    //content+= '</table>';

    content+= '<br><br><div id="purgeGalaxyTracking" class="button btn_blue"/>PURGE DATA</div>';
    document.getElementById('infoBoxContent').innerHTML = content;

    // Action: Purge Galaxy Tracking
    document.getElementById('purgeGalaxyTracking').addEventListener("click", function (event) {
        validatePurgeGalaxyTracking();
    });
}

function validatePurgeGalaxyTracking() {
    setupInfoBox();
    var content = '<span class="ptre_maintitle">Delete Galaxy tracking data ?</span><br><br><br>';
    content+= '<span class="status_negatif">This will delete galaxy data from local storage.</span><br><br>';
    content+= 'It is recommended to delete thoses data only if you have issues with galaxy feature or if you have not play for a long time this universe.<br><br>';
    content+= 'You will have to rebuild it again by browsing galaxies.<br><br>';
    content+= '<div id="purgeGalaxyTracking" class="button btn_blue"/>PURGE DATA, REALLY?</div>';
    document.getElementById('infoBoxContent').innerHTML = content;

    // Action: Purge Galaxy Tracking
    document.getElementById('purgeGalaxyTracking').addEventListener("click", function (event) {
        for(var gala = 1; gala <= 12 ; gala++) {GM_deleteValue(ptreGalaxyData+gala); displayGalaxyTracking();}
    });
}

// ****************************************
// GALAXY EXEC STUFFS
// ****************************************

// Function called on galaxy page
// Checks if a new system is displayed
// If yes, we will push activities
function checkForNewSystem() {
    // Get current params
    var systemElem = $("input#system_input")[0];
    var galaxyElem = $("input#galaxy_input")[0];
    var galaxy = galaxyElem.value;
    var system = systemElem.value;

    consoleDebug('[' + galaxy + ':' + system + '] Check For New System');

    // Check for wrong input
    if (galaxy.length === 0 || $.isNumeric(+galaxy) === false || system.length === 0 || $.isNumeric(+system) === false) {
        return;
    }

    var currentMicroTime = serverTime.getTime();
    if (galaxy != lastActivitiesGalaSent || system != lastActivitiesSysSent || (currentMicroTime > lastPTREActivityPushMicroTS + ptrePushDelayMicroSec)) {
        lastPTREActivityPushMicroTS = currentMicroTime;
        lastActivitiesGalaSent = galaxy;
        lastActivitiesSysSent = system;
        consoleDebug('[' + galaxy + ':' + system + "] Need to update");
        displayGalaxyMiniMessage('[' + galaxy + ':' + system + "] Checking system updates");

        // Get Galaxy System JSON
        $.post(galaxyContentLinkTest, {
            galaxy: galaxy,
            system: system
        }, processGalaxyDataCallback);
    } else {
        console.log("[PTRE] Cant push. Wait...");
        displayGalaxyMiniMessage("Cant push. Wait...");
    }
}

// Process galaxy data
// Sends player activity and galaxy updates
/*
    playerId != -1 => Player is here (at least a planet)
        moonId != -1 => Player also has a moon

    playerId == -1 => No player here
        planetId != -1 => This is his previous planet
        moonId != -1 => This is his previous moon
*/
function processGalaxyDataCallback(data) {
    var startTime = serverTime.getTime();
    var currentTimestamp = round(startTime / 1000);
    var json = $.parseJSON(data);
    var galaxyContent = json.system.galaxyContent;
    var galaxy = galaxyContent[0].galaxy;
    var system = galaxyContent[0].system;
    var tabActiPos = [];
    var tabNewSystemToPush = [];
    var previousSystemData = [];
    var galaxyDataList = [];
    var systemDataList = [];
    var jsonSystem = '';
    var systemNeedsToBeUpdated = 0;
    var systemIdInGalaxyList = -1;
    var ptreStoredTK = GM_getValue(ptreTeamKey, '');

    if (isAGREnabled()) {
        // Update AGR local list
        updateLocalAGRList();
    }
    //debugListContent();

    // Get LOCAL Galaxy content (from storage)
    var galaxyDataJSON = GM_getValue(ptreGalaxyData+galaxy, '');
    if (galaxyDataJSON != '') {
        galaxyDataList = JSON.parse(galaxyDataJSON);
    }
    console.log("[PTRE] ["+galaxy+":"+system+"] Processing System");
    //console.log(galaxyDataList);
    
    // Init default previous structure
    for(var i = 1; i<=15; i++) {
        previousSystemData[i] = [];
        previousSystemData[i]["planetId"] = -1;
        previousSystemData[i]["moonId"] = -1;
        previousSystemData[i]["playerId"] = -1;
    }
    // Search our SS in previous data
    $.each(galaxyDataList, function(i, elem) {
        if (Object.keys(elem)[0] == system) {
            systemIdInGalaxyList = i;
        }
    });
    // Merge both
    if (systemIdInGalaxyList > -1) {
        consoleDebug("Found previous system");
        $.each(galaxyDataList[systemIdInGalaxyList][system][0], function(i, elem) {
            previousSystemData[elem.pos]["playerId"] = elem.playerId;
            previousSystemData[elem.pos]["planetId"] = elem.planetId;
            previousSystemData[elem.pos]["moonId"] = elem.moonId;
        });
    }
    /*
    // For tests
    previousSystemData[8]["playerId"] = -1;
    previousSystemData[8]["planetId"] = -1;
    previousSystemData[8]["moonId"] = -1;
    */


    // Loop over each position
    $.each(galaxyContent, function(pos, positionContent){
        // If planet (even destroyed)
        if (positionContent.planets['0']) {
            // Get position infos
            var moonIndex = -1;
            var moonId = -1;
            var moonSize = -1;
            var debrisIndex = -1;
            var debrisSize = -1;
            var playerId = positionContent.player['playerId'];
            var playerName = positionContent.player['playerName'];
            var position = positionContent.position;
            var coords = galaxy+":"+system+":"+position;
            var planetId = positionContent.planets[0]['planetId'];

            // Patch playerId: We dont want to use 99999
            if (playerId == deepSpacePlayerId) {
                playerId = -1;
            }
            
            //consoleDebug('['+galaxy+':'+system+':'+position+'] '+playerName+' ('+playerId+')');
            // Search Moon index (depends on debris field or not)
            // If there is a debris field AND/OR a moon
            for (var i = 1; i <= 2; i++) {
                if (positionContent.planets[i]) {
                    if (positionContent.planets[i]['planetType'] == 2) {
                        debrisIndex = i;
                    } else if (positionContent.planets[i]['planetType'] == 3) {
                        moonIndex = i;
                    }
                }
            }
            if (moonIndex != -1) {
                moonId = positionContent.planets[moonIndex]['planetId'];
                moonSize = positionContent.planets[moonIndex]['size'];
            }
            if (debrisIndex != -1) {
                debrisSize = Number(positionContent.planets[debrisIndex]['resources']['metal']['amount']) + Number(positionContent.planets[debrisIndex]['resources']['crystal']['amount']) + Number(positionContent.planets[debrisIndex]['resources']['deuterium']['amount']);
            }

            // Push players activities
            if (playerId != -1 && !isOGLorOGIEnabled() && isPlayerInLists(playerId)) {
                // Why this test?
                var ina = positionContent.positionFilters;
                if (!/inactive_filter/.test(ina)){
                    if (moonIndex != -1) {
                        var moonActvity = convertActivityToOGLFormat(positionContent.planets[moonIndex]['activity']['showActivity'], positionContent.planets[moonIndex]['activity']['idleTime']);
                        var jsonLune = {id:moonId, size:moonSize, activity:moonActvity};
                        //jsonLune = JSON.stringify(jsonLune);
                        //consoleDebug("MOON: " + jsonLune);
                        ptreGalaxyActivityCount++;
                    }
                    var jsonActiPos = {player_id : playerId,
                                       teamkey : ptreStoredTK,
                                       id : planetId,
                                       coords : coords,
                                       galaxy : galaxy,
                                       system : system,
                                       position : position,
                                       main : false,
                                       activity : convertActivityToOGLFormat(positionContent.planets[0]['activity']['showActivity'], positionContent.planets[0]['activity']['idleTime']),
                                       moon : jsonLune};
                    //console.log(jsonActiPos);
                    tabActiPos.push(jsonActiPos);
                    ptreGalaxyActivityCount++;
                }
            }

            // Push galaxy data
            if (!isOGLorOGIEnabled()) {
                // We push only if we alrady know the system
                if (systemIdInGalaxyList > -1) {
                    // And if there is some changes
                    consoleDebug("Position "+position+": "+previousSystemData[position]["playerId"]+"=>"+playerId+" "+previousSystemData[position]["planetId"]+"=>"+planetId+" "+previousSystemData[position]["moonId"]+"=>"+moonId);
                    if (playerId != previousSystemData[position]["playerId"] || planetId != previousSystemData[position]["planetId"] || moonId != previousSystemData[position]["moonId"]) {
                        systemNeedsToBeUpdated = 1;
                        var rank = -1;
                        var status = "";
                        var oldName = "";
                        var planetIdToSend = planetId;
                        var moonIdToSend = moonId;
                        if (positionContent.player['highscorePositionPlayer'] > 0) {
                            rank = positionContent.player['highscorePositionPlayer'];
                        }
                        if (playerId == -1) {
                            // If player left
                            // Replace moon ID per old
                            planetIdToSend = previousSystemData[position]["planetId"];
                            moonIdToSend = previousSystemData[position]["moonId"];
                            playerName = "";
                            // We dont save if for now
                            // oldName =
                        } else {
                            if (positionContent.player['isOnVacation'] == true) {
                                status+='v';
                            }
                            if (positionContent.player['isBanned'] == true) {
                                status+='b';
                            }
                            if (positionContent.player['isInactive'] == true) {
                                status+='i';
                            }
                            if (positionContent.player['isLongInactive'] == true) {
                                status+='I';
                            }
                        }
                        var jsonLuneG = {id:moonIdToSend, size:moonSize};
                        var jsonTemp = {player_id : playerId,
                                        teamkey : ptreStoredTK,
                                        timestamp_ig : currentTimestamp,
                                        id : planetIdToSend,
                                        coords : coords,
                                        galaxy : galaxy,
                                        system : system,
                                        position : position,
                                        name: playerName,
                                        old_player_id: previousSystemData[position]["playerId"],
                                        old_name: oldName,
                                        status: status,
                                        rank: rank,
                                        old_rank: -1,
                                        moon : jsonLuneG};
                        console.log(jsonTemp);
                        tabNewSystemToPush.push(jsonTemp);
                        ptreGalaxyEventCount++;
                    }
                }
            }

            // Update System (no matter if we send date or not)
            // We save only if their is something in place
            if (playerId != -1 || planetId != -1 || moonId != -1) {
                var jsonPos = {pos: position, playerId: playerId, planetId: planetId, moonId: moonId, ts: currentTimestamp};
                systemDataList.push(jsonPos);
            }
        }
    });

    // Save system to galaxy storage
    if (systemIdInGalaxyList == -1 || systemNeedsToBeUpdated == 1) {
        if (systemIdInGalaxyList > -1) {
            galaxyDataList.splice(systemIdInGalaxyList, 1);
        }
        if (systemDataList) {
            var temp = {[system]:[systemDataList]};
            galaxyDataList.push(temp);
            galaxyDataJSON = JSON.stringify(galaxyDataList);
            GM_setValue(ptreGalaxyData+galaxy, galaxyDataJSON);
        }
    }

    // Monitor duration
    var duration = serverTime.getTime() - startTime;
    consoleDebug("Duration: "+duration+"ms");

    // Do acti push
    if (tabActiPos.length > 0){
        // Build JSON
        jsonSystem = '{';
        $.each(tabActiPos, function(nb, jsonPos){
            jsonSystem += '"'+jsonPos.coords+'":'+JSON.stringify(jsonPos)+',';
            //consoleDebug(jsonSystem);
        });
        jsonSystem = jsonSystem.substr(0,jsonSystem.length-1);
        jsonSystem += '}';

        // Sent to PTRE
        $.ajax({
            url : urlPTREPushActivity,
            type : 'POST',
            data: jsonSystem,
            cache: false,
            success : function(reponse){
                var reponseDecode = jQuery.parseJSON(reponse);
                consoleDebug(reponseDecode.message);
                displayGalaxyMiniMessage(reponseDecode.message);
                if (reponseDecode.code != 1) {
                    displayPTREPopUpMessage(reponseDecode.message);
                }
            }
        });
        console.log('[PTRE] [' + galaxy + ':' + system + '] Pushing Activities');
    } else {
        displayGalaxyMiniMessage("No target in this system");
    }

    // Do Galaxy push
    if (tabNewSystemToPush.length > 0){
        // Build JSON
        jsonSystem = '{';
        $.each(tabNewSystemToPush, function(nb, jsonPos){
            jsonSystem += '"'+jsonPos.coords+'":'+JSON.stringify(jsonPos)+',';
            //consoleDebug(jsonSystem);
        });
        jsonSystem = jsonSystem.substr(0,jsonSystem.length-1);
        jsonSystem += '}';

        // Sent to PTRE
        $.ajax({
            url : urlPTREPushGalaUpdate,
            type : 'POST',
            data: jsonSystem,
            cache: false,
            success : function(reponse){
                var reponseDecode = jQuery.parseJSON(reponse);
                consoleDebug(reponseDecode.message);
                displayGalaxyMiniMessage(reponseDecode.message);
                if (reponseDecode.code != 1) {
                    displayPTREPopUpMessage(reponseDecode.message);
                }
            }
        });
        console.log('[PTRE] [' + galaxy + ':' + system + '] Pushing Galaxy updates');
    }
    // Update counts on galaxy view
    if (document.getElementById('ptreGalaxyActivityCount') && document.getElementById('ptreGalaxyEventCount')) {
        document.getElementById('ptreGalaxyActivityCount').innerHTML = ptreGalaxyActivityCount;
        document.getElementById('ptreGalaxyEventCount').innerHTML = ptreGalaxyEventCount;
    }

}

// ****************************************
// CORE FUNCTIONS
// ****************************************

// Check if EasyPTRE needs to be updated
function updateLastAvailableVersion(force) {
    // Only check once a day

    var lastCheckTime = GM_getValue(ptreLastAvailableVersionRefresh, 0);
    var currentTime = serverTime.getTime() / 1000;

    if (force === true || currentTime > lastCheckTime + versionCheckTimeout) {
        consoleDebug("Checking last version available");
        GM_xmlhttpRequest({
            method:'GET',
            url:urlToScriptMetaInfos,
            nocache:true,
            onload:result => {
                //consoleDebug(result.responseText);
                if (result.status == 200) {
                    var tab = result.responseText.split('//');
                    var availableVersion = tab[2].match(/\d+\.\d+.\d+/);
                    availableVersion = availableVersion[0];
                    consoleDebug("Current version: " + GM_info.script.version);
                    consoleDebug("Last version: " + availableVersion);
                    GM_setValue(ptreLastAvailableVersion, availableVersion);
                    GM_setValue(ptreLastAvailableVersionRefresh, currentTime);
                    if (availableVersion !== GM_info.script.version) {
                        if (document.getElementById('ptreUpdateVersionMessage')) {
                            document.getElementById('ptreUpdateVersionMessage').innerHTML = '<span class="status_negatif">Check <a href="https://openuserjs.org/scripts/GeGe_GM/EasyPTRE" target="_blank">EasyPTRE</a> updates</span>';
                        }
                        if (document.getElementById('ptreMenuName')) {
                            document.getElementById('ptreMenuName').innerHTML = 'UPDATE ME';
                        }
                        consoleDebug('Version ' + availableVersion + ' is available');
                    } else {
                        if (document.getElementById('ptreUpdateVersionMessage')) {
                            document.getElementById('ptreUpdateVersionMessage').innerHTML = '<span class="status_positif">EasyPTRE is up to date</span>';
                        }
                    }
                } else {
                    document.getElementById('ptreUpdateVersionMessage').innerHTML = '<span class="status_negatif">Error ' + result.status + ' (' + result.statusText + ')</span>';
                }
            }
        });
    } else {
        var temp = lastCheckTime + versionCheckTimeout - currentTime;
        consoleDebug("Skipping last version check. Next check in " + round(temp, 0) + " sec min");
    }
}

// Convert IG API 2 JSON to Prefill format
// mode can be "prefill" or "tab"
function parsePlayerResearchs(json, mode) {
    const obj = JSON.parse(json);
    const characterClassId = obj.characterClassId;
    const allianceClassId = obj.allianceClassId;
    let out = {};

    if (mode == "tab") {
        var str = '<table width="60%" border="1"><tr><td style="padding: 5px" align="center">Ships</td>';
        str+='<td style="padding: 5px" align="center"><img src="/img/ogame/speed.png" width="30px"><br>Speed</td>';
        str+='<td style="padding: 5px" align="center"><img src="/img/ogame/armor.png" width="30px"><br>Armor</td>';
        str+='<td style="padding: 5px" align="center"><img src="/img/ogame/shield.png" width="30px"><br>Shield</td>';
        str+='<td style="padding: 5px" align="center"><img src="/img/ogame/weapon.png" width="30px"><br>Weapon</td>';
        str+='<td style="padding: 5px" align="center"><img src="/img/ogame/cargo.png" width="30px"><br>Cargo</td>';
        str+='<td style="padding: 5px" align="center"><br>Fuel</td></tr>';
    } else {
        out["0"] = {
            "class": characterClassId,
            "playerClass": characterClassId,
            "allianceClass": allianceClassId,
            "research": {},
            "lifeformBonuses": {
                "BaseStatsBooster": {},
                "CharacterClassBooster": {}
            }
        };
        for (const key in obj.researches) {
            out["0"]["research"][key] = JSON.parse('{"level":'+obj.researches[key]+'}');
        }
    }

    for (const key in obj.ships) {
        if (mode == "tab") {
            var type = 'ship';
            if (key > 400) {
                type = 'def';
            }
            str+= '<tr><td align="center"><img src="/img/ogame/mini/'+type+'_'+key+'.png"></td>';
            var temp = '-'; if (obj.ships[key].speed > 0) { temp = '<span class="status_positif">'+round(obj.ships[key].speed*100, 2)+' %<span>'; }
            str+= '<td align="center">'+temp+'</td>';
            temp = '-'; if (obj.ships[key].armor > 0) { temp = '<span class="status_positif">'+round(obj.ships[key].armor*100, 2)+' %<span>'; }
            str+= '<td align="center">'+temp+'</td>';
            temp = '-'; if (obj.ships[key].shield > 0) { temp = '<span class="status_positif">'+round(obj.ships[key].shield*100, 2)+' %<span>'; }
            str+= '<td align="center">'+temp+'</td>';
            temp = '-'; if (obj.ships[key].weapon > 0) { temp = '<span class="status_positif">'+round(obj.ships[key].weapon*100, 2)+' %<span>'; }
            str+= '<td align="center">'+temp+'</td>';
            temp = '-'; if (obj.ships[key].cargo > 0) { temp = '<span class="status_positif">'+round(obj.ships[key].cargo*100, 2)+' %<span>'; }
            str+= '<td align="center">'+temp+'</td>';
            temp = '-'; if (obj.ships[key].fuel > 0) { temp = '<span class="status_positif">'+round(obj.ships[key].fuel*100, 2)+' %<span>'; }
            str+= '<td align="center">'+temp+'</td></tr>';
        } else {
            out["0"]["lifeformBonuses"]["BaseStatsBooster"][key] = {
                "armor": obj.ships[key].armor,
                "shield": obj.ships[key].shield,
                "weapon": obj.ships[key].weapon,
                "cargo": obj.ships[key].cargo,
                "speed": obj.ships[key].speed,
                "fuel": obj.ships[key].fuel
            };
        }
    }

    if (mode == "tab") {
        str+= '</table>';
        return str;
    }

    out["0"]["lifeformBonuses"]["CharacterClassBooster"]["1"] = obj.bonuses.characterClassBooster["1"];
    out["0"]["lifeformBonuses"]["CharacterClassBooster"]["2"] = obj.bonuses.characterClassBooster["2"];
    out["0"]["lifeformBonuses"]["CharacterClassBooster"]["3"] = obj.bonuses.characterClassBooster["3"];
    
    // Hook for simulator
    let ARR_ATT = [];
    ARR_ATT.push(out["0"]);
    const jsonOut = JSON.stringify({ "0": ARR_ATT });

    return btoa(jsonOut);
}

// Add data to sharable structure
function addDataToPTREData(newData) {
    var dataJSON = '';
    dataJSON = GM_getValue(ptreDataToSync, '');
    var dataList = [];
    if (dataJSON != '') {
        dataList = JSON.parse(dataJSON);
    }

    // Look for same entry
    var idASup = -1;
    $.each(dataList, function(i, elem) {
        //console.log("[PTRE] Checking elem " + elem.type + " / " + elem.id);
        if (elem.type == newData.type && elem.id == newData.id) {
            if (elem.val == newData.val) {
                //console.log("[PTRE] Element has not changed. No update");
                idASup = -2;
            } else {
                idASup = i;
            }
        }
    });
    if (idASup == -2) {
        return -1;
    } else if (idASup != -1) {
        // Delete entry if found
        dataList.splice(idASup, 1);
    }
    // Add the new entry
    console.log("[PTRE] Updating " + newData.type + " data");
    dataList.push(newData);

    // Save list
    dataJSON = JSON.stringify(dataList);
    GM_setValue(ptreDataToSync, dataJSON);
    // Sync data to PTRE (but not now, wait for no more refresh)
    setTimeout(syncSharableData, dataSharingDelay * 1000);
}

function debugSharableData() {
    var dataJSON = '';
    dataJSON = GM_getValue(ptreDataToSync, '');

    var dataList = [];
    if (dataJSON != '') {
        dataList = JSON.parse(dataJSON);
        $.each(dataList, function(i, elem) {
            console.log("[" + elem.type + "] " + elem.id + " => " + elem.val);
        });
    } else {
        console.log("[PTRE] No data to display");
    }
}

// This function sends commun data to Team
// Like:
// - Phalanx levels
function syncSharableData(mode) {
    console.log("[PTRE] Syncing data");
    const teamKey = GM_getValue(ptreTeamKey, '');
    if (teamKey == '') {
        displayPTREPopUpMessage("No TeamKey: Add a PTRE TeamKey in EasyPTRE settings");
        return -1;
    }
    var dataJSON = '';
    dataJSON = GM_getValue(ptreDataToSync, '');
    if (dataJSON != '') {
        $.ajax({
            url : urlPTRESyncSharableData + '&version=' + GM_info.script.version + '&current_player_id=' + currentPlayerID + '&ptre_id=' + GM_getValue(ptreID, '') + '&team_key=' + teamKey,
            type : 'POST',
            data: dataJSON,
            cache: false,
            success : function(reponse){
                var reponseDecode = jQuery.parseJSON(reponse);
                console.log('[PTRE] ' + reponseDecode.message);
                if (mode == 'manual') {
                    displayMessageInSettings(reponseDecode.message);
                }
            }
        });
    } else {
        if (mode == 'manual' && document.getElementById('messageDivInSettings')) {
            displayMessageInSettings("No data to sync to PTRE Team");
        }
    }
}

// This function fetchs closest friend phalanx
function getPhalanxInfosFromGala() {
    var systemElem = $("input#system_input")[0];
    var galaxyElem = $("input#galaxy_input")[0];
    var galaxy = galaxyElem.value;
    var system = systemElem.value;
    displayGalaxyMessageContent("Loading info for " + galaxy + ":" + system + " ...");
    const teamKey = GM_getValue(ptreTeamKey, '');
    if (teamKey == '') {
        displayGalaxyMessageContent('<span class="status_negatif">No TeamKey: Add a PTRE TeamKey in EasyPTRE settings</span>');
        return -1;
    }
    $.ajax({
        url : urlPTREGetPhalanxInfosFromGala + '&version=' + GM_info.script.version + '&current_player_id=' + currentPlayerID + '&ptre_id=' + GM_getValue(ptreID, '') + '&team_key=' + teamKey + '&galaxy=' + galaxy + '&system=' + system,
        type : 'POST',
        data: null,
        cache: false,
        success : function(reponse){
            var reponseDecode = jQuery.parseJSON(reponse);
            var message = atob(reponseDecode.message);
            if (reponseDecode.code != 1) {
                console.log('[PTRE] ' + message);
            }
            displayGalaxyMessageContent(message);
            setTimeout(function() {document.getElementById('ptreGalaxyMessageBoxContent').innerHTML = "";}, ptreGalaxyMessageBoxContentFadeOut);
        }
    });
}

// This function fetchs Galaxy Event Explorer infos
function getGEEInfosFromGala() {
    var systemElem = $("input#system_input")[0];
    var galaxyElem = $("input#galaxy_input")[0];
    var galaxy = galaxyElem.value;
    var system = systemElem.value;
    displayGalaxyMessageContent("Loading info for " + galaxy + ":" + system + " ...");
    const teamKey = GM_getValue(ptreTeamKey, '');
    if (teamKey == '') {
        displayGalaxyMessageContent('<span class="status_negatif">No TeamKey: Add a PTRE TeamKey in EasyPTRE settings</span>');
        return -1;
    }
    $.ajax({
        url : urlPTREGetGEEInfosFromGala + '&version=' + GM_info.script.version + '&current_player_id=' + currentPlayerID + '&ptre_id=' + GM_getValue(ptreID, '') + '&team_key=' + teamKey + '&galaxy=' + galaxy + '&system=' + system,
        type : 'POST',
        data: null,
        cache: false,
        success : function(reponse){
            var reponseDecode = jQuery.parseJSON(reponse);
            var message = atob(reponseDecode.message);
            if (reponseDecode.code != 1) {
                console.log('[PTRE] ' + message);
            }
            displayGalaxyMessageContent(message);
            setTimeout(function() {document.getElementById('ptreGalaxyMessageBoxContent').innerHTML = "";}, ptreGalaxyMessageBoxContentFadeOut);
        }
    });
}

function displayTotalSystemsSaved() {
    var countGala = 0;
    var countSsystem = 0;

    for(var gala = 1; gala <= 12 ; gala++) {
        var galaxyDataJSON = GM_getValue(ptreGalaxyData+gala, '');
        if (galaxyDataJSON != '') {
            countGala++;
            var galaxyDataList = JSON.parse(galaxyDataJSON);
            $.each(galaxyDataList, function(i, elem) {
                countSsystem++;
            });
        }
    }
    return 'Tracked Galaxies: <span class="status_positif">'+countGala+'</span> | Tracked Systems: <span class="status_positif">'+countSsystem+'</span>';
}