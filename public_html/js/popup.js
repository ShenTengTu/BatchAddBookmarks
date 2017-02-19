"use strict";
require(["jquery", "querybookmarkstree"], ($, querybookmarkstree)=>{

    /*i18n*/
    document.title = chrome.i18n.getMessage("appName");
    $("html").attr("lang", chrome.i18n.getMessage("htmlLang"));
    $("#title").children().first().after(document.title);
    $("h5").eq(0)[0].innerText = chrome.i18n.getMessage("selectLabel");
    $("option").eq(0)[0].innerText = chrome.i18n.getMessage("folders");
    $("option").eq(1)[0].innerText = chrome.i18n.getMessage("pages");
    $("h5").eq(1).children().eq(0).before(chrome.i18n.getMessage("batchAddTo"));
    $("h5").eq(2)[0].innerText = chrome.i18n.getMessage("textAreaLabel");
    $("#content").attr("placeholder", chrome.i18n.getMessage("folderName"));
    $("#content").attr("aria-label", chrome.i18n.getMessage("textAreaLabel"));
    $("#run")[0].textContent = chrome.i18n.getMessage("execute");
    /*i18n*/
    
    
    /*取得目前的書籤節點*/
    let CurrentBookmarkNodeId = null;
    function getCurrentBookmarksNode(id) {
        CurrentBookmarkNodeId = id;
        chrome.bookmarks.get(id, (bts)=>{
            $("#show_folder").prop("innerText", bts[0].title);
        });
    }
    
    let option = {
        onlyFolder: true,
        queryId: getCurrentBookmarksNode
    };  
    querybookmarkstree.getTreeDOM($('#bookmarks'), option);
    
    let cssstylesheet = querybookmarkstree.getTreeCSS;
    cssstylesheet.insertRule("span.expand-icon{background:url(data:image/svg+xml;base64,"
            +"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDE2IDEyIiBmaWxsPSIjM2Y1MWI1Ij4KICA8cGF0aCBkPSJNMCAwIEwwIDIgTDE0IDIgTDE0IDAgTDAgMCIvPgogIDxwYXRoIGQ9Ik0wIDQgTDcgMTAgTDE0IDQgTDAgNCIvPgo8L3N2Zz4="
            +") no-repeat center center / 8px 6px ;}",cssstylesheet.cssRules.length);
    cssstylesheet.insertRule("span.node{background-size: 18px 18px;background-image:-webkit-image-set(url('data:image/svg+xml;base64,"+
            "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj4KICA8cGF0aCBkPSJNMyAxIEw5IDEgTDExIDMgTDE4IDMgTDE4IDUgTDIgNSBMMyAxIiBmaWxsPSIjYjI4NzA3Ii8+CiAgPHBhdGggZD0iTTEgNCBMMTkgNCBMMTkgNSBMMSA1IEwxIDQiIGZpbGw9IiNlN2U3ZTciLz4KICA8cGF0aCBkPSJNMCA1IEwyMCA1IEwxOSAyMCBMMSAyMCBMMCA1IiBmaWxsPSIjRkZDMjBCIi8+Cjwvc3ZnPg=="
            +"') 1x);}",cssstylesheet.cssRules.length);
    
    $("#options").change(changeHandler);
    $("#content").bind("input paste cut", changeHandler);
    $("#run").on("click", clickHandler);

    /*UI輸入變換事件處理*/
    function changeHandler(e) {
        //console.log(e.target.id);
        if (e.target.id === "options") {
            if (e.target.value === "folder")
                $("#content").attr("placeholder", chrome.i18n.getMessage("folderName"));
            else if (e.target.value === "page")
                $("#content").attr("placeholder", chrome.i18n.getMessage("pageURL"));
        } else if (e.target.id === "content") {
            if (e.target.value === "")
                $("#run").attr("disabled", true);
            else
                $("#run").attr("disabled", false);
        }
    }
    /*UI輸入點擊事件處理*/
    function clickHandler(e) {
        if(CurrentBookmarkNodeId){
            $("#content").attr("disabled", true);
            $("#options").attr("disabled", true);
            $("#run").attr("disabled", true);
            let lineArr = $("#content").val().split("\n");
            let option = $("#options").val();
            let msgObj = {flag: "startProcess", option: option, nodeId: CurrentBookmarkNodeId, data: lineArr};
            chrome.runtime.sendMessage(null, msgObj, null, responseHandler);
        }else{
            window.alert(chrome.i18n.getMessage("needSelectFolder"));
        }

        function responseHandler(response) {
            //console.log(response);
            if (response.flag === "processing") {
                $("#progressBar").val(response.value);
                chrome.runtime.sendMessage(null, response, null, responseHandler);
                return true;
            } else if (response.flag === "finish") {
                $("#content").val("");
                $("#content").attr("disabled", false);
                $("#options").attr("disabled", false);
                $("#run").attr("disabled", false);
            }
        }
    }

});