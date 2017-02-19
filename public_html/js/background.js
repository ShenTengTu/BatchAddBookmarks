"use strict";
/*以下是根據目前網址判斷是否啟用popup icon*/
/*The following is based on the current URL to determine whether to enable popup icon*/
let popupSwitchByTabUrl = (tab)=>{
    let regex = /chrome:\/\/bookmarks.*/;
    if (tab.url.match(regex)) {
        chrome.pageAction.show(tab.id);
        chrome.pageAction.setPopup({tabId: tab.id, popup: "popup.html"});
    } else {
        chrome.pageAction.hide(tab.id);
    }
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=>{
    if (tab.status === "complete") {
        chrome.tabs.sendMessage(tabId, {flag: "tab_status_Complete"});
    }
    popupSwitchByTabUrl(tab);
});

chrome.tabs.onActivated.addListener((activeInfo)=>{
    chrome.tabs.query({windowId: activeInfo.windowId, active: true}, (tabs)=>{
        popupSwitchByTabUrl(tabs[0]);
    });
});
/*=====*/

/*以下是訊息收發事件處理*/
/*The following is the message send and receive event processing*/
let tempObj;

let onMessageListener = (message, sender, sendResponse)=>{
    let resObj;
    if (message.flag === "startProcess") {
        tempObj = message;
        let index = 0;
        createBookmark(index, tempObj, ()=>{
            resObj = {flag: "processing", index: index, value: (index + 1) / tempObj.data.length};
            sendResponse(resObj);
        });
        return true;
    } else if (message.flag === "processing") {
        let index = message.index + 1;
        if (index < tempObj.data.length) {
            createBookmark(index, tempObj, ()=>{
                resObj = {flag: "processing", index: index, value: (index + 1) / tempObj.data.length};
                sendResponse(resObj);
            });
            return true;
        } else {
            tempObj = null;
            resObj = {flag: "finish"};
            sendResponse(resObj);
            return true;
        }
        return true;
    } else {
        return false;
    }

    function createBookmark(index, tempObj, callback) {
        let bookmark;
        if (tempObj.option === "folder") {
            bookmark = {parentId: tempObj.nodeId, title: tempObj.data[index]};
            setTimeout(()=>{
                chrome.bookmarks.create(bookmark, (result)=>{
                    callback();
                });
            }, 10);

        } else if (tempObj.option === "page") {
            getWebPageTitle(tempObj.data[index], (title)=>{
                bookmark = {parentId: tempObj.nodeId, title: title, url: tempObj.data[index]};
                chrome.bookmarks.create(bookmark, (result)=>{
                    callback();
                });
            });
        }
    }

    function getWebPageTitle(url, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = ()=>{
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    let title = (new DOMParser()).parseFromString(xhr.responseText, "text/html").title;
                    xhr.abort();
                    callback(title);
                } else {
                    xhr.abort();
                    callback("Invalid URL");
                }
            }
        };
        xhr.send();
    }

};

chrome.runtime.onMessage.addListener(onMessageListener);