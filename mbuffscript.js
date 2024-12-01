// ==UserScript==
// @name         MangaBuffAuto
// @namespace    http://tampermonkey.net/
// @version      2024-12-01
// @updateURL    https://raw.githubusercontent.com/RelicR/mbuftmprmk/master/mbuffscript.js
// @downloadURL  https://raw.githubusercontent.com/RelicR/mbuftmprmk/master/mbuffscript.js
// @description  try to take over the world!
// @author       RR
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

    var W = (typeof unsafeWindow === 'undefined') ? window : unsafeWindow;
    const curDate = (start=Date.now(),offset=0) => new Date(start-3600000-offset);
    // Notifis
    if(W.location.href.startsWith("https://mangabuff.ru/notifications") && W.location.href.endsWith("sort=all")){
        var nots = document.getElementsByClassName("notifications__wrapper");
        var notsText, notsTime;
        var todaysCards = 0;
        for (var i = 0; i < nots.length; i++){
            notsText = nots[i].childNodes[1].innerText;
            notsTime = nots[i].childNodes[3].childNodes[1].innerText;
            if (notsText.startsWith("Вы получили новую карту") && notsTime.startsWith((curDate().getDate() < 10) ? "0"+curDate().getDate().toString() + " " : curDate().getDate().toString() + " ")){todaysCards += 1;}
        }
        document.getElementsByClassName("secondary-title")[0].innerText += ` | Найдено ${todaysCards}/10 карт за сегодня`;
        return false;
    }
    // Your code here...
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const config = { attributes: true, childList: true, subtree: true };
    var footer, scrollBtn, fasterScrollBtn, nextCh;
    var card, cardModal;
    var windHeight = W.innerHeight;
    // Event
    // var candy, pumpkin;
    // var events = { candy: false, pumpkin: false };
    var heightDiff, curPage, totalPage, pageDiff, timeDiff, gap, dayDiff;
    var stats, curTime;
    var gotCard = false;
    var setup = await GM.getValues({full: false, semi: true, farm: false, off: false});
    var flags = { card: false, cardPop:false, scroll: false, next: false };
    GM_log("Script started");
    GM_log(setup);
    //
    // Stats
    async function updStats(item){
        switch(item){
            case "chapter":
                stats.chapter += 1;
                await GM.setValue("chapter", stats.chapter);
                console.log("Updated chapter stats");
                break;
            case "card":
                stats.card += 1;
                stats.lastCard = curDate().getTime();
                await GM.setValues({card: stats.card, lastCard: stats.lastCard});
                console.log("Updated card stats");
                break;
            case "reset":
                // if (stats.lastCard && curDate().getDate() != curDate(stats.lastCard, -3600000).getDate()) {
                //     stats.chapter = 0;
                //     stats.card = 0;
                //     await GM.setValues({chapter: stats.chapter, card: stats.card});
                //     console.log("Stats reset");
                // }
                stats = {card: 0, chapter: 0, lastCard: null}
                await GM.setValues({card: stats.card, chapter: stats.chapter, lastCard: stats.lastCard});
                if (gotCard) {await updStats("card");}
                console.log("Stats reset");
                break;
            default:
                stats = {chapter: 0, card: 0, lastCard: null};
                await GM.setValues({chapter: stats.chapter, card: stats.card, lastCard: stats.lastCard});
                break;
            // case "farm":
            //     stats.chapter = 75;
            //     stats.card = 0;
            //     await GM.setValues({chapter: stats.chapter, card: stats.card});
            //     console.log("Stats set for farming");
            //     break;
            //
            // Event
            // case "candy":
            //     stats.candy += 1;
            //     GM.setValue({candy: stats.candy});
            //     break;
            // case "pumpkin":
            //     stats.candy += 3;
            //     stats.pumpkin += 1;
            //     GM.setValues({candy: stats.candy, pumpkin: stats.pumpkin});
            //     break;
        }
    }
    async function getStats(){
        return GM.getValues({chapter: 0, card: 0, lastCard: null});
    }
    async function showStats(){
        console.log("Stats are ");
        console.log(stats);
        //document.body.innerHTML += `<div style="position:fixed;z-index: 10; border-radius:10px; bottom:20px;left:20px;padding:10px;background:#000;color:#fff;width: 300px;font-size: 14px;" id="autoStats"><span style="color:#87CEFA">Статистика</span><span id="close-autoStats" style="position:relative;top:0px;cursor:pointer;float:right;" onclick="document.getElementById('autoStats').remove()">✖</span><ul><li>Конфеты (с учётом тыкв): ${stats.candy}</li><li>Карты: ${stats.card}</li><li>Тыквы: ${stats.pumpkin}</li></ul></div>`;
        document.body.innerHTML += `<div style="position:fixed;z-index: 10; border-radius:10px; bottom:20px;left:20px;padding:10px;background:#000;color:#fff;width: 300px;font-size: 14px;" id="autoStats"><span style="color:#87CEFA">Статистика цикла</span><span id="close-autoStats" style="position:relative;top:0px;cursor:pointer;float:right;" onclick="document.getElementById('autoStats').remove()">✖</span><ul><li>Главы: ${stats.chapter}</li><li>Карты: ${stats.card}</li></ul></div>`;
    }
    //
    // RMB menu
    async function updConfig(fullauto, semiauto, farm, off){
        setup = fullauto ? {full: true, semi: false, farm: false, off: false} : setup;
        setup = semiauto ? {full: false, semi: true, farm: false, off: false} : setup;
        setup = farm ? {full: false, semi: false, farm: true, off: false} : setup;
        setup = off ? {full: false, semi: false, farm: false, off: true} : setup;
        console.log(setup);
        await GM.setValues({full: setup.full, semi: setup.semi, farm: setup.farm, off: setup.off});
        GM_log("Config updated to ");
        GM_log(setup);
        if ((!fullauto && !farm) && flags.scroll && scrollBtn.classList.contains("icon-stop")) {
            scrollBtn.click();
            flags.scroll = false;
            showStats();
        }
        if ((setup.full || setup.farm) && !scrollBtn.classList.contains("icon-stop")) {startAutoScroll();}
    }
    function setFull() {updConfig(true, false, false, false);}
    function setSemi() {updConfig(false, true, false, false);}
    function setFarm() {updConfig(false, false, true, false);}
    function setOff() {updConfig(false, false, false, true);}
    GM_registerMenuCommand("Полный автомат", setFull);
    GM_registerMenuCommand("Фарм карт", setFarm);
    GM_registerMenuCommand("Только подбор", setSemi);
    GM_registerMenuCommand("Выключить", setOff);
    GM_registerMenuCommand("Сброс статистики", updStats);
    //
    // Tasks
    async function startAutoScroll(){
        scrollBtn.click();
        flags.scroll = true;
        for(var i = 0; i < 10; i++) {setTimeout(fasterScrollBtn.click(), 500);}
    }
    async function getCard(){
        flags.card = false;
        await updStats("card");
        gotCard = true;
        return card.click();
    }
    async function doneCard(){
        cardModal = document.getElementById("modal-gift-card").childNodes[1].childNodes[1].childNodes[1].childNodes[1];
        flags.cardPop = false;
        return cardModal.click();
    }
    async function goNext(){
        if(heightDiff <= windHeight){
            if (stats.lastCard != null && curDate().getDate() != curDate(stats.lastCard, -3600000).getDate()) await updStats("reset");
            await updStats("chapter");
            flags.next = false;
            return nextCh.click();
        }
        else return false;
    }
    //
    // Event
    // async function getPumpkin(){
    //     flags[4] = false;
    //     for (var i = 0; i < 11; i++) {pumpkin.click();}
    //     await updStats("pumpkin");
    //     return true;
    // }
    // async function getCandy(){
    //     flags[0] = false;
    //     await updStats("candy");
    //     return candy.click();
    // }
    //
    // Prep
    stats = await getStats();
    console.log("Stats are ");
    console.log(stats);
    //
    if(setup.full || setup.farm || setup.semi){
        footer = document.getElementsByClassName("reader__footer")[0];
        scrollBtn = document.getElementsByClassName("icon-play")[0];
        fasterScrollBtn = document.getElementById("fasterBtn");
        totalPage = Number(document.getElementsByClassName("reader-menu__item--page")[0].innerText.split('/')[1]);
        curPage = document.getElementsByClassName("reader-menu__item--page")[0].childNodes[0];
        footer.childNodes.forEach((b) => {
            if (b.nodeType == 1)
            {
                if (b.innerText.startsWith("След")){
                    nextCh = b;
                }
            }
        });
        if (setup.full || setup.farm) {
            await setTimeout(startAutoScroll, 1500);
        }
        const callback = async (mutationList, observer) => {
            for (const mutation of mutationList) {
                heightDiff = document.body.offsetHeight - W.pageYOffset;
                if (!flags.next && heightDiff <= windHeight){
                    pageDiff = totalPage - Number(curPage);
                    timeDiff = stats.lastCard != null ? (curDate().getTime() - stats.lastCard)/1000/60 : null;
                    dayDiff = stats.lastCard != null ? curDate().getDate() - curDate(stats.lastCard, -3600000).getDate() : 0;
                    console.log(`TIMEDIF ${timeDiff}, DAYDIF ${dayDiff}`);
                    if ((setup.full || setup.farm) && stats.card >= 10) {
                        await updConfig(false, true, false, false);
                        console.log("Stopped by condition");
                    }
                    if ((gotCard || (timeDiff != null && timeDiff < 60)) && dayDiff == 0 && ((setup.full && stats.chapter > 75) || setup.farm) && stats.card < 10) {
                        gap = gotCard ? 3600000 : (60-timeDiff)*60*1000;
                        flags.next = true;
                        console.log(timeDiff);
                        await sleep(gap).then(() => setTimeout(goNext, 1000));
                    }
                    else {
                        flags.next = true;
                        await setTimeout(goNext, 3000)};
                    }
                if (mutation.type === "childList")
                {
                    card = document.getElementsByClassName("card-notification")[0];
                    if (!flags.card && card != undefined && card.style.display != "none") {
                        GM_log("Card found");
                        GM_notification({ text: "Card found", timeout: 1500 });
                        await setTimeout(getCard, 1700);
                        await setTimeout(doneCard, 2500);
                        flags.card = true;
                    }
                    //
                    // Event
                    // candy = document.getElementsByClassName("helloween-gift-candy")[0];
                    // pumpkin = document.getElementsByClassName("helloween-gift-pumpkin")[0];
                    // if (!events.candy && candy != undefined && !candy.classList.contains("helloween-gift-candy--collected")) {
                    //     GM_log("Candy found");
                    //     GM_notification({ text: "Candy found", timeout: 1500 });
                    //     setTimeout(getCandy, 2000);
                    //     events.candy = true;
                    // }
                    // if (!events.pumpkin && pumpkin != undefined) {
                    //     GM_log("Pumpkin found");
                    //     GM_notification({ text: "Pumpkin found", timeout: 1500 });
                    //     setTimeout(getPumpkin, 250);
                    //     events.pumpkin = true;
                    // }
                }
                // if (mutation.type === "attributes" && setup.full)
                // {
                //     heightDiff = document.body.offsetHeight - W.pageYOffset;
                //     if (!flags[2] && heightDiff <= 1300){
                //         if (gotCard) {await sleep(3600000).then(setTimeout(goNext, 1000));}
                //         flags[2]=true;
                //     }
                // }
            }
        }
        const observer = new MutationObserver(callback);
        observer.observe(document.body, config);
    }
})();
