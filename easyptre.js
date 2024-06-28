// ==UserScript==
// @name         EasyPTRE
// @namespace    https://openuserjs.org/users/GeGe_GM
// @version      0.7.6
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
var lastPTREActivityPushMicroTS = 0;

// GM keys
var ptreTeamKey = "ptre-" + country + "-" + universe + "-TK";
var ptreImproveAGRSpyTable = "ptre-" + country + "-" + universe + "-ImproveAGRSpyTable";
var ptrePTREPlayerListJSON = "ptre-" + country + "-" + universe + "-PTREPlayerListJSON";
var ptreAGRPlayerListJSON = "ptre-" + country + "-" + universe + "-AGRPlayerListJSON";
var ptreAGRPrivatePlayerListJSON = "ptre-" + country + "-" + universe + "-AGRPrivatePlayerListJSON";
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
var ptreTargetListMaxSize = 100;
var ptrePushDelayMicroSec = 500;
// TODO: Set ptreAGRTargetListMaxSize

// PTRE URLs
var urlPTREImportSR    = 'https://ptre.chez.gg/scripts/oglight_import.php?tool=' + toolName;
var urlPTREPushActivity = 'https://ptre.chez.gg/scripts/oglight_import_player_activity.php?tool=' + toolName + '&country=' + country + '&univers=' + universe;
var urlPTRESyncTargets = 'https://ptre.chez.gg/scripts/api_sync_target_list.php?tool=' + toolName + '&country=' + country + '&univers=' + universe;
var urlPTREGetPlayerInfos = 'https://ptre.chez.gg/scripts/oglight_get_player_infos.php?tool=' + toolName + '&country=' + country + '&univers=' + universe;
var urlToScriptMetaInfos = 'https://openuserjs.org/meta/GeGe_GM/EasyPTRE.meta.js';

// *** *** ***
// MAIN EXEC
// *** *** ***

// Update main pages
if (!/page=standalone&component=empire/.test(location.href)) {
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

    document.getElementById('affOptionsPTRE').addEventListener("click", function (event) {
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

// Galaxy page: Set routines
if (/component=galaxy/.test(location.href)) {
    consoleDebug("Galaxy detected: Setting routines");
    setTimeout(addPTREStuffsToGalaxyPage, 250);
    setTimeout(checkForNewSystem, 500);
}

// Add PTRE send SR button to messages page
if (/component=messages/.test(location.href)) {
    if (GM_getValue(ptreTeamKey) != '') {
        // Update Message Page (spy report part)
        setTimeout(addPTREStuffsToMessagesPage, 800);
        // Update AGR Spy Table
        if (isAGREnabled() && (GM_getValue(ptreImproveAGRSpyTable) == 'true')) {
            let spyTableObserver = new MutationObserver(addPTRESendSRButtonToAGRSpyTable);
            var nodeSpyTable = document.getElementById('messagecontainercomponent');
            spyTableObserver.observe(nodeSpyTable, {
                attributes: true,
                childList: true, // observer les enfants directs
                subtree: true, // et les descendants aussi
            });
        }
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
    cursor: pointer;
    display: inline-block;
    background-color: #8495b5;
}
#boxPTRESettings {
    width: 500px;
    padding:10px;
    z-index: 1000;
    position: fixed;
    bottom: 30px;
    right: 10px;
    border: solid black 2px;
    background:rgba(0,26,52,0.95);
}
#boxPTREMessage {
    padding:10px;
    z-index: 1001;
    position: fixed;
    bottom: 30px;
    right: 10px;
    border: solid black 2px;
    background:rgba(0,26,52,0.95);
}
#boxPTREInfos {
    min-width: 300px;
    padding:10px;
    z-index: 1000;
    position: fixed;
    bottom: 30px;
    right: 540px;
    border: solid black 2px;
    background:rgba(0,26,52,0.95);
}
#btnSaveOptPTRE {
    cursor:pointer;
}
#ptreSpanGalaxyMessageD {
    color:green;
    font-weight:bold;"
}
#targetDivSettings {
    height: 400px;
    overflow-y: scroll;
  }
`);

// *** *** ***
// NOTIFICATIONS FUNCTIONS
// *** *** ***

// Displays PTRE responses messages
// Responses from server
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

    if (document.getElementById('links')) {
        document.getElementById('links').appendChild(boxPTREMessage);
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
        consoleDebug("Skipping last version check. Next check in " + temp + " sec min");
    }
}

function displayMessageInSettings(message) {
    if (document.getElementById('messageDivInSettings')) {
        document.getElementById('messageDivInSettings').innerHTML = message;
    }
}

function setNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// *** *** ***
// PTRE/AGR LIST RELATED
// *** *** ***

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

    idASup = -1;
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
    console.log("AGR list: ");
    console.log(targetList);

    targetJSON = GM_getValue(ptrePTREPlayerListJSON, '');
    targetList = JSON.parse(targetJSON);
    console.log("PTRE list: ");
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
        divPTRE += '<tr><td class="td_cell"><span class="ptre_maintitle">EasyPTRE PANNEL</span></td><td class="td_cell" align="right"><input id="btnHelpPTRE" type="button" class="button" value="HELP" /> <input id="btnRefreshOptPTRE" type="button" class="button" value="REFRESH" /> <input id="btnCloseOptPTRE" type="button" class="button" value="CLOSE" /></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><div id=messageDivInSettings class="status_warning"></div></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><hr /></td></tr>';
        divPTRE += '<tr><td class="td_cell"><div class="ptre_title">Settings</div></td><td class="td_cell" align="right"><input id="btnSaveOptPTRE" type="button" class="button" value="SAVE" /></td></tr>';
        divPTRE += '<tr><td class="td_cell"><div>PTRE Team Key:</div></td><td class="td_cell" align="center"><div><input onclick="document.getElementById(\'ptreTK\').type = \'text\'" style="width:160px;" type="password" id="ptreTK" value="'+ ptreStoredTK +'"></div></td></tr>';

        // If AGR is detected
        if (isAGROn) {
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
        }
        // Console Debug mode
        divPTRE += '<tr><td class="td_cell">Enable Console Debug:</td>';
        debugMode = (GM_getValue(ptreEnableConsoleDebug, 'false') == 'true' ? 'checked' : '');
        divPTRE += '<td class="td_cell" style="text-align: center;"><input id="PTREEnableConsoleDebug" type="checkbox" ';
        divPTRE += debugMode;
        divPTRE += ' />';
        divPTRE += '</td></tr>';

        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><hr /></td></tr>';
        divPTRE += '<tr><td class="td_cell"><span class="ptre_title">' + mode + ' Targets list</span>&nbsp;(<a href="https://ptre.chez.gg/?page=players_list" target="_blank">Manage</a>)</td><td class="td_cell" align="right"><input id="synctTargetsWithPTRE" type="button" class="button" value="SYNC TARGETS" /></td></tr>';
        if (isAGROn) {
            divPTRE += '<tr><td class="td_cell"><i>Both lists are used</i></td><td class="td_cell" align="right"><input id="btnRefreshOptPTRESwitchList" type="button" class="button" value="DISPLAY ' + other_mode + ' LIST" /></td></tr>';
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
                    divPTRE += '<td class="td_cell" align="center"><input id="btnGetPlayerInfos'+PlayerCheck.id+'" type="button" class="button" value="FLEET"></td>';
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

        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><hr /></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><a href="https://ptre.chez.gg/" target="_blank">PTRE</a> | <a href="https://discord.gg/WsJGC9G" target="_blank">Discord</a> | <a href="https://ko-fi.com/ptreforogame" target="_blank">Donate</a></td></tr>';
        divPTRE += '<tr><td class="td_cell" align="center" colspan="2"><b>EasyPTRE  v' + GM_info.script.version + '</b> <input id="forceCheckVersionButton" type="button" class="button" value="CHECK" /></td></tr>';
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

        if (document.getElementById('links')) {
            document.getElementById('links').appendChild(eletementSetPTRE);
        }

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

        // Action: Help
        document.getElementById('btnHelpPTRE').addEventListener("click", function (event) {
            displayHelp();
        });

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

        // Action: Check version
        document.getElementById('forceCheckVersionButton').addEventListener("click", function (event) {
            document.getElementById('ptreUpdateVersionMessage').innerHTML = '';
            updateLastAvailableVersion(true);
        });

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
                setTimeout(function() {document.getElementById('divPTRESettings').parentNode.removeChild(document.getElementById('divPTRESettings'));}, ptreMenuDisplayTime * 1000);
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
                                        displayPTREPopUpMessage(reponse.message_verbose);
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
                        var msgElement = document.querySelector('div.msg[data-msg-id="' + messageID + '"] .rawMessageData');
                        if (msgElement) {
                            // Obtenir la valeur de data-raw-hashcode
                            apiKeyRE = msgElement.getAttribute('data-raw-hashcode');
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

    // Check message pop-up
    let observer = new MutationObserver(addPTRESendSRButtonToMessagePopup);
    var node = document.getElementsByClassName('messagesHolder')[0];
    observer.observe(node, {
        childList: true, // observer les enfants directs
    });

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
                                        displayPTREPopUpMessage(reponse.message_verbose);
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

// This function creates empty Info Box.
// Its ready to be updated
function setupInfoBox() {
    if (document.getElementById('divPTREInfos')) {
        document.getElementById('divPTREInfos').parentNode.removeChild(document.getElementById('divPTREInfos'));
    }
    var divPTRE = '<div id="boxPTREInfos"><table border="1" width="100%"><tr><td align="right"><input id="btnCloseInfosPTRE" type="button" class="button" value="CLOSE" /><hr></td></tr><tr><td><div id="infoBoxContent"><br><br><center><span class="status_warning">LOADING...</span><center><br><br><br></div></td></tr></table>';
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
    content = '<span class="ptre_maintitle">EasyPTRE Help</span><br><br><span class="ptre_tab_title">Purpose</span><br><br>EasyPTRE works as a side-car of AGR in order to enable PTRE basic features. Once configured, you will be able to: <br>- Push and share spy reports<br>- Display player top fleet from PTRE<br>- Track targets activities and check results on PTRE website<br>- Sync targets list with your Team';
    content+= '<br><br><span class="ptre_tab_title">Team Key setting</span><br><br>To use it, you need to create a Team on <a href="https://ptre.chez.gg?page=team" target="_blank">PTRE website</a> and add Team Key to EasyPTRE settings.<br>PTRE Team Key should look like: TM-XXXX-XXXX-XXXX-XXXX. Create your Team or ask your teammates for it.';
    content+= '<br><br><span class="ptre_tab_title">Spy report push</span><br><br>You can push spy reports from the messages page or when opening a spy report. Spy report will be shared to your Team and over Discord (if <a href="https://ptre.chez.gg/?page=discord_integration" target="_blank">configuration</a> is done).';
    content+= '<br><br><span class="ptre_tab_title">Target lists</span><br><br>EasyPTRE targets lists determines players that will be activity-tracked when exploring the galaxy. ';
    content+= 'EasyPTRE manages two targets lists that works at same time (both lists are tracked):<br>- AGR target list: it is based on you AGR left pannel: Target, To attack, Watch, Miner. It ignores Friends and traders. To update this list, open your AGR target pannels<br>- PTRE target list: this list containes targets shared by your team';
    content+= '<br><br>You can sync your target lists with your teammates (you may ignore some of your targets in order to NOT share them with friends and keep it to yourself).';
    content+= '<br><br>Common targets list (for your PTRE Team) can be configured <a href="https://ptre.chez.gg/?page=players_list" target="_blank">on PTRE players list page</a>.';
    content+= '<br><br><span class="ptre_tab_title">Need more help?</span><br><br>You can get some help on <a href="https://discord.gg/WsJGC9G" target="_blank">Discord</a>, come and ask us.';

    document.getElementById('infoBoxContent').innerHTML = content;
}

// *** *** ***
// IMPROVE GALAXY VIEW
// *** *** ***

// Add buttons to galaxy
function addPTREStuffsToGalaxyPage() {
    consoleDebug("Updating Galaxy View");

    // Add PTRE debug message Div
    if (!document.getElementById("ptreGalaxyMessageD")) {
        var spanPTREGalaxyMessageD = '<span id="ptreSpanGalaxyMessageD"></span>';
        var divPTREGalaxyMessageD = document.createElement("div");
        divPTREGalaxyMessageD.innerHTML = spanPTREGalaxyMessageD;
        divPTREGalaxyMessageD.id = 'ptreGalaxyMessageD';
        document.getElementsByClassName('galaxyRow ctGalaxyFleetInfo')[0].appendChild(divPTREGalaxyMessageD);
    }

    // Add new system trigger
    if (document.getElementById('galaxyHeader')) {
        let spyTableObserver = new MutationObserver(checkForNewSystem);
        var nodeSpyTable = document.getElementById('galaxyHeader');
        spyTableObserver.observe(nodeSpyTable, {
            attributes: true,
            childList: true, // observer les enfants directs
            subtree: true, // et les descendants aussi
            characterDataOldValue: true // transmettre les anciennes données au callback
        });
    }

    // If AGR is not enabled: add PTRE stuffs to Galaxy page
    if (!isAGREnabled()){
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

// *** *** ***
// GALAXY EXEC STUFFS
// *** *** ***

// Function called on galaxy page
// Checks if a new system is displayed
// If yes, we will push activities
function checkForNewSystem() {
    // Get current params
    var systemElem = $("input#system_input")[0];
    var galaxyElem = $("input#galaxy_input")[0];
    var galaxy = galaxyElem.value;
    var system = systemElem.value;

    // Check for wrong input
    if (galaxy.length === 0 || $.isNumeric(+galaxy) === false || system.length === 0 || $.isNumeric(+system) === false) {
        return;
    }

    var currentMicroTime = serverTime.getTime();
    if (galaxy != lastActivitiesGalaSent || system != lastActivitiesSysSent || (currentMicroTime > lastPTREActivityPushMicroTS + ptrePushDelayMicroSec)) {
        lastPTREActivityPushMicroTS = currentMicroTime;
        lastActivitiesGalaSent = galaxy;
        lastActivitiesSysSent = system;
        console.log('[PTRE] [' + galaxy + ':' + system + "] Checking targets activities");
        displayPTREGalaxyMessage('[' + galaxy + ':' + system + "] Checking targets activities");

        // Get Galaxy System JSON
        $.post(galaxyContentLinkTest, {
            galaxy: galaxy,
            system: system
        }, processGalaxyData);
    } else {
        console.log("[PTRE] Cant push. Wait...");
        displayPTREGalaxyMessage("Cant push. Wait...");
    }
}

function processGalaxyData(data) {

    var json = $.parseJSON(data);
    var systemPos = json.system.galaxyContent;
    var tabActiPos = [];
    var galaxy = "";
    var system = "";
    var jsonSystem = '';
    var ptreStoredTK = GM_getValue(ptreTeamKey, '');

    if (isAGREnabled()) {
        // Update AGR local list
        updateLocalAGRList();
    }
    //debugListContent();

    $.each(systemPos, function(pos, infoPos){

        if (infoPos.player) {
            var player_id = infoPos.player['playerId'];
            var player_name = infoPos.player['playerName'];
            //consoleDebug(infoPos);
            if (isPlayerInLists(player_id)){
                var ina = infoPos.positionFilters;

                if (player_id != 99999 && !/inactive_filter/.test(ina)){
                    galaxy = infoPos.galaxy;
                    system = infoPos.system;
                    var position = infoPos.position;
                    var coords = galaxy+":"+system+":"+position;

                    //console.log(infoPos);
                    var planete = infoPos.planets;
                    var planet_id = planete[0]['planetId'];
                    var planet_name = planete[0]['planetName'];
                    var planet_acti = convertActivityToOGLFormat(planete[0]['activity']['showActivity'], planete[0]['activity']['idleTime']);

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
                            var lune_acti = convertActivityToOGLFormat(planete[moonIndex]['activity']['showActivity'], planete[moonIndex]['activity']['idleTime']);
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
            displayPTREGalaxyMessage('Found ' + tabActiPos.length + ' positions to push');
        }

    });
    //consoleDebug("DATAS: " + jsonSystem);
    var dataPost = jsonSystem;

    if (jsonSystem != '') {
        $.ajax({
            url : urlPTREPushActivity,
            type : 'POST',
            data: dataPost,
            cache: false,
            success : function(reponse){
                var reponseDecode = jQuery.parseJSON(reponse);
                displayPTREGalaxyMessage(reponseDecode.message);
                if (reponseDecode.code != 1) {
                    displayPTREPopUpMessage(reponseDecode.message);
                }
            }
        });
        console.log('[PTRE] [' + galaxy + ':' + system + '] Pushing activities');
    } else {
        displayPTREGalaxyMessage("No target in this system");
    }
}
