"use strict";
require({
    baseUrl:"js/libs",
    paths: {
        "jquery":"jquery/jquery.min",
        "querybookmarkstree":"query-bookmarks-tree/querybookmarkstree"
        //recommand named 'querybookmarkstree'
    },
    map:{
        "*":{
            "css":"require-css/css.min"//setup require-css
        }
    }
});


