/*reference origenal bookmarks manager and basic bookmarks sample(see https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/docs/examples/api/bookmarks/basic/).*/
"use strict";
define("querybookmarkstree",function (require) {
    var $ = require('jquery');
    var csslinkElement= require('query-bookmarks-tree/css/tree.css');
    
    var selectedNode = null;//for selected effact

    function dumpBookmarks(jqElement, option) {
        chrome.bookmarks.getTree(
                function (bookmarkTreeNodes) {
                    jqElement.append(dumpTreeNodes(jqElement, bookmarkTreeNodes, option));
                });
    }

    function dumpTreeNodes(jqElement, bookmarkNodes, option) {
        var list = (bookmarkNodes[0].id > 0) ? $('<div class="node-list">') : jqElement;//avoid root node

        bookmarkNodes.forEach(function (node) {
            if (option.onlyFolder) {//Only display folder
                if (!node.url) {
                    list.append(dumpNode(jqElement, node, option));
                }
            } else {
                list.append(dumpNode(jqElement, node, option));
            }
        });

        return (list[0].childElementCount === 0) ? null : list;//avoid create list which has no children.

    }

    function dumpNode(jqElement, bookmarkNode, option) {

        if (bookmarkNode.children && bookmarkNode.children.length > 0) {
            var sublist = dumpTreeNodes(jqElement, bookmarkNode.children, option);//maybe is null value 
        }

        if (bookmarkNode.title) {
            var icon = $(!sublist || bookmarkNode.url ? '<span class="expand-icon" hidden>' : '<span class="expand-icon">');
            var label = $(bookmarkNode.url ? '<span class="node link">' : '<span class="node">');
            label.text(bookmarkNode.title);

            if (bookmarkNode.url) {//define page item 
                label[0].style.backgroundImage = "-webkit-image-set(url(chrome://favicon/size/16@1x/" + bookmarkNode.url + ") 1x, url(chrome://favicon/size/16@2x/" + bookmarkNode.url + ") 2x)";
                label.click(function () {
                    chrome.tabs.create({url: bookmarkNode.url});
                });
            }

            var nodeContainer = $('<div class="node-container">');
            nodeContainer.click(function (e) {//selected effact
                if (selectedNode) {
                    selectedNode.removeAttribute("selected");
                }
                e.currentTarget.setAttribute("selected", "");
                selectedNode = e.currentTarget;
                if (option.queryId)
                    option.queryId(bookmarkNode.id);
            });

            if (sublist) {
                nodeContainer.dblclick(function (e) {//expand effact
                    if (e.currentTarget.hasAttribute("expand")) {
                        e.currentTarget.removeAttribute("expand");
                    } else {
                        e.currentTarget.setAttribute("expand", "");
                    }
                });
            }

            nodeContainer.append(icon);
            nodeContainer.append(label);
        }

        var nodeItem = $(bookmarkNode.title ? '<div class="node-item">' : '<div class="node-item notitle">');
        nodeItem.append(nodeContainer);
        nodeItem.append(sublist);
        return nodeItem;
    }
    
    var querybookmarkstree = {getTreeDOM:dumpBookmarks,getTreeCSS:csslinkElement};
    return querybookmarkstree;
});
