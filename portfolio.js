$(document).ready(function() {
    setupInterestsList();
    setupProjectDescriptions();
});

// Set up "Interests" list interactivity
function setupInterestsList() {
    // Hide innter urls
    $("#interests ul").addClass("hide");
    
    // Add onclicks
    var clickableli = $("#interests > li");
    clickableli.addClass("expandable");
    clickableli.click(function() {
        hideAll($(this).siblings().children("ul"));
        toggle($(this).children("ul"));
    });
    clickableli.children("ul").addClass("static");
}

// Hide long project descriptions and add more/less links
function setupProjectDescriptions() {
    $("div.project p.project-long").addClass("hide");
    $("div.project p.project-short").append(' <span class="more">(more)</span>');
    $("div.project p.project-long").append(' <span class="less">(less)</span>');
    
    var hideLongDesc = function(projectdiv) {
        hide($(projectdiv).children("p.project-long"));
        hide($(projectdiv).children("p").children("span.less"));
        show($(projectdiv).children("p").children("span.more"));
    };
    
    var showLongDesc = function(projectdiv) {
        show($(projectdiv).children("p.project-long"));
        show($(projectdiv).children("p").children("span.less"));
        hide($(projectdiv).children("p").children("span.more"));
        $.each($(projectdiv).siblings("div.project"), function(index, value) {
            hideLongDesc(value);
        });
    }
    
    var morelinks = $("span.more");
    morelinks.addClass("expandable");
    morelinks.click(function() {
        showLongDesc($(this).parent().parent());
    });
    
    var lesslinks = $("span.less");
    lesslinks.addClass("expandable");
    hideAll(lesslinks);
    lesslinks.click(function() {
        hideLongDesc($(this).parent().parent());
    });
}

// Show the given element
function show(elem) {
    if(elem.hasClass("hide")) {
        elem.removeClass("hide");
    }
}

// Hide the given element
function hide(elem) {
    if(!elem.hasClass("hide")) {
        elem.addClass("hide");
    }
}

// Show or hide the given element
function toggle(elem) {
    if(elem.hasClass("hide")) {
        elem.removeClass("hide");
    } else {
        elem.addClass("hide");
    }
}

// Hide all given elements
function hideAll(elems) {
    elems.addClass("hide");
}