// ==UserScript==
// @name         MangaBuffAuto
// @namespace    http://tampermonkey.net/
// @version      2024-10-23
// @updateURL    https://raw.githubusercontent.com/RelicR/mbuftmprmk/refs/heads/master/mbuffscript.js
// @downloadURL  https://raw.githubusercontent.com/RelicR/mbuftmprmk/refs/heads/master/mbuffscript.js
// @description  try to take over the world!
// @author       Relic_R
// @match        *://mangabuff.ru/*/*/*/*
// @match        *://mangabuff.ru/*/*/*
// @match        *://mangabuff.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_log
// @grant        GM_registerMenuCommand
// @grant        GM_cookie
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM_setValues
// @grant        GM_getValues
// @grant        GM.setValues
// @grant        GM.getValues
// @grant        GM_notification
// @grant        GM.notification
// @grant        GM.addElement
// @grant        GM_addElement
// @grant        GM_listValues
// ==/UserScript==

(async function() {
    'use strict';

    // Your code here...
    // Update test
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    var footer, scrollBtn, fasterScrollBtn, nextCh;
    var candy, card, cardModal, pumpkin, heightDiff;
    var stats, curTime;
    var gotCard = false;
    var setup = await GM.getValues({full: false, semi: true, off: false});
    async function updCookie(fullauto, semiauto, off){
        if (!fullauto && setup.full && scrollBtn.classList.contains("icon-stop")) {
            scrollBtn.click();
            flags[3] = false;
            showStats();
        }
        setup = fullauto ? {full: true, semi: false, off: false} : setup;
        setup = semiauto ? {full: false, semi: true, off: false} : setup;
        setup = off ? {full: false, semi: false, off: true} : setup;
        await GM.setValues({full: setup.full, semi: setup.semi, off: setup.off});
        GM_log("Config updated to ");
        GM_log(setup);
        if (setup.full && !scrollBtn.classList.contains("icon-stop")) {startAutoScroll();}
    }
    function setFull() {updCookie(true, false, false);}
    function setSemi() {updCookie(false, true, false);}
    function setOff() {updCookie(false, false, true);}
    function setFarm() {updCookie(true, false, false); updStats("farm");}
    const targetNode = document.body;
    var stopFlag = false;
    GM_registerMenuCommand("Полный автомат", setFull);
    GM_registerMenuCommand("Фарм карт", setFarm);
    GM_registerMenuCommand("Только подбор", setSemi);
    GM_registerMenuCommand("Выключить", setOff);
    async function getStats(){
        //stats = await GM.getValues({candy: 0, card: 0, pumpkin: 0});
        return GM.getValues({chapter: 0, card: 0, lastCard: null});
    }
    async function updStats(item){
        switch(item){
            case "chapter":
                stats.chapter += 1;
                await GM.setValue("chapter", stats.chapter);
                console.log("Added chapter stats");
                //console.log(stats);
                //console.log(await GM.getValue("chapter", null));
                break;
            case "card":
                stats.card += 1;
                stats.lastCard = Date.now();
                await GM.setValues({card: stats.card, lastCard: stats.lastCard});
                console.log("Added card stats");
                break;
            // case "candy":
            //     stats.candy += 1;
            //     GM.setValue({candy: stats.candy});
            //     break;
            // case "pumpkin":
            //     stats.candy += 3;
            //     stats.pumpkin += 1;
            //     GM.setValues({candy: stats.candy, pumpkin: stats.pumpkin});
            //     break;
            case "reset":
                //curTime = new Date();
                console.log("Stats reset");
                stats.chapter = 0;
                stats.card = 0;
                await GM.setValues({chapter: stats.chapter, card: stats.card});
                break;
            case "farm":
                stats.chapter = 75;
                stats.card = 0;
                await GM.setValues({chapter: stats.chapter, card: stats.card});
                console.log("Stats set for farming");
                break;
        }
    }
    async function showStats(){
        await getStats();
        console.log(stats);
        //document.body.innerHTML += `<div style="position:fixed;z-index: 10; border-radius:10px; bottom:20px;left:20px;padding:10px;background:#000;color:#fff;width: 300px;font-size: 14px;" id="autoStats"><span style="color:#87CEFA">Статистика</span><span id="close-autoStats" style="position:relative;top:0px;cursor:pointer;float:right;" onclick="document.getElementById('autoStats').remove()">✖</span><ul><li>Конфеты (с учётом тыкв): ${stats.candy}</li><li>Карты: ${stats.card}</li><li>Тыквы: ${stats.pumpkin}</li></ul></div>`;
        document.body.innerHTML += `<div style="position:fixed;z-index: 10; border-radius:10px; bottom:20px;left:20px;padding:10px;background:#000;color:#fff;width: 300px;font-size: 14px;" id="autoStats"><span style="color:#87CEFA">Статистика цикла</span><span id="close-autoStats" style="position:relative;top:0px;cursor:pointer;float:right;" onclick="document.getElementById('autoStats').remove()">✖</span><ul><li>Главы: ${stats.chapter}</li><li>Карты: ${stats.card}</li></ul></div>`;
        await updStats("reset");
    }
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };
    var flags = [false, false, false, false, false];
    var W = (typeof unsafeWindow === 'undefined') ? window : unsafeWindow;
    GM_log("Script started");
    GM_log(setup);
    async function startAutoScroll(){
        scrollBtn.click();
        flags[3] = true;
        for(var i = 0; i < 10; i++) {setTimeout(fasterScrollBtn.click(), 500);}
    }
    async function getCandy(){
        flags[0] = false;
        // updStats("candy");
        return candy.click();
    }
    async function getCard(){
        flags[1] = false;
        await updStats("card");
        gotCard = true;
        return card.click();
    }
    async function doneCard(){
        cardModal = document.getElementById("modal-gift-card").childNodes[1].childNodes[1].childNodes[1].childNodes[1];
        flags[1] = false;
        return cardModal.click();
    }
    async function getPumpkin(){
        // updStats("pumpkin");
        for (var i = 0; i < 11; i++) {pumpkin.click();}
        flags[4] = false;
        return true;
    }
    async function goNext(){
        if(heightDiff <= 1300){
            if (setup.full) await updStats("chapter");
            flags[2] = false;
            return nextCh.click();
        }
        else return false;
    }
    stats = await getStats();
    console.log(stats);
    if(setup.full || setup.semi){
        //function toExit() {
        //    observer.disconnect();
        //    stopFlag = true;
        //    throw new Error("Script called to stop");
        //    return false;
        //}
        //GM_registerMenuCommand("Остановить", toExit);
        footer = document.getElementsByClassName("reader__footer")[0];
        scrollBtn = document.getElementsByClassName("icon-play")[0];
        fasterScrollBtn = document.getElementById("fasterBtn");
        footer.childNodes.forEach((b) => {
            if (b.nodeType == 1)
            {
                if (b.innerText.startsWith("След")){
                    nextCh = b;
                }
            }
        });
        if (setup.full) {
            startAutoScroll();
            //var counter = 0;
            //setInterval(function(){console.log(counter);counter+=1;}, 1000);
        }
        //const candyNot = await GM.notification({ text: "Click me." });
        //const cardNot = await GM.notification({ text: "Click me." });
        //const pumpkinNot = await GM.notification({ text: "Click me." });
        const callback = async (mutationList, observer) => {
            for (const mutation of mutationList) {
                heightDiff = document.body.offsetHeight - W.pageYOffset;
                if (!flags[2] && heightDiff <= 1300){
                    var timeDif = stats.lastCard != null ? (Date.now() - stats.lastCard)/1000/60 : null;
                    if ((gotCard || (stats.lastCard != null && timeDif < 60)) && setup.full && stats.chapter > 75) {
                        var gap = gotCard ? 3600000 : (60-timeDif)*60*1000;
                        flags[2]=true;
                        console.log(timeDif);
                        await sleep(gap).then(() => setTimeout(goNext, 1000));
                    }
                    else {
                        flags[2]=true;
                        await setTimeout(goNext, 1000)};
                    }
                if (mutation.type === "childList")
                {
                    // Event stuff
                    // candy = document.getElementsByClassName("helloween-gift-candy")[0];
                    card = document.getElementsByClassName("card-notification")[0];
                    // pumpkin = document.getElementsByClassName("helloween-gift-pumpkin")[0];
                    // if (!flags[0] && candy != undefined && !candy.classList.contains("helloween-gift-candy--collected")) {
                    //     GM_log("Candy found");
                    //     GM_notification({ text: "Candy found", timeout: 1500 });
                    //     setTimeout(getCandy, 2000);
                    //     flags[0] = true;
                    // }
                    if (!flags[1] && card != undefined && card.style.display != "none") {
                        GM_log("Card found");
                        GM_notification({ text: "Card found", timeout: 1500 });
                        await setTimeout(getCard, 1700);
                        //await sleep(3600000);
                        await setTimeout(doneCard, 2500);
                        flags[1] = true;
                    }
                    // Event stuff
                    // if (!flags[4] && pumpkin != undefined) {
                    //     GM_log("Pumpkin found");
                    //     GM_notification({ text: "Pumpkin found", timeout: 1500 });
                    //     setTimeout(getPumpkin, 250);
                    //     flags[4] = true;
                    // }
                }
                if (mutation.type === "attributes" && setup.full)
                {
                    heightDiff = document.body.offsetHeight - W.pageYOffset;
                    if (!flags[2] && heightDiff <= 1300){
                        if (gotCard) {await sleep(3600000).then(setTimeout(goNext, 1000));}
                        flags[2]=true;
                    }
                }
            }
        }
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }
})();
