
var body = document.body;
var html = document.documentElement;

// GENERAL UTILITIES

function show(elem) {
    if(elem.hasClass("hide")) {
        elem.removeClass("hide");
    }
}

function hide(elem) {
    if(!elem.hasClass("hide")) {
        elem.addClass("hide");
    }
}

function toggle(elem) {
    if(elem.hasClass("hide")) {
        elem.removeClass("hide");
    } else {
        elem.addClass("hide");
    }
}

function hideAll(elems) {
    elems.addClass("hide");
}

// FASTER SCROLL PAST INTRO

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
	var scrollAmount = body.scrollTop || html.scrollTop;
	var documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
	var viewportHeight = Math.max(html.clientHeight, window.innerHeight || 0);
	var diff = documentHeight - viewportHeight;
	var introHeight = $("#intro").outerHeight() || 100;
	
	if (diff > 300) {
		var maxOffset = introHeight / 2 + 10;
		var scrollSpeed = 1;
		var offset = Math.min(Math.max(0, scrollAmount * scrollSpeed), maxOffset);
		$("#intro").css("margin-top", -offset + "px");
	} else {
		$("#intro").css("margin-top", 0);
	}
}

// PROJECT TILE

$(".project-tile").hover(function () {
	$(this).find(".project-summary-container").toggleClass("animate-from-bottom", true);
}, function () {
	$(this).find(".project-summary-container").toggleClass("animate-from-bottom", false);
	
});

// PROJECT DETAILS WINDOWS

var modals = [];
var currentModal;

function initDetails (summary, modal) {
	modals.push(modal);
	var i = modals.indexOf(modal);
	
	summary.click(function() {
		showDetails(true, modal);
	});
	var controlPrevious = $("<div class='modal-previous modal-control'><img src='icons/icon-left.svg'/></div>");
	var controlNext = $("<div class='modal-next modal-control'><img src='icons/icon-right.svg'/></div>");
	var controlClose = $("<div class='modal-close modal-control'><img src='icons/icon-close.svg'/></div>");
	
	controlPrevious.click(function() {
		var previ = i - 1;
		if (previ < 0) previ = modals.length - 1;
		var prev = modals[previ];
		showDetails(true, $(prev));
	});
	
	controlNext.click(function() {
		var nexti = i + 1;
		if (nexti > modals.length - 1) nexti = 0;
		var next = modals[nexti];
		showDetails(true, $(next));
	});
	
	controlClose.click(function() {
		showDetails(false, $(modal));
	});
	
	modal.append(controlPrevious);
	modal.append(controlNext);
	modal.append(controlClose);
};

function showDetails (value, modal) {
	if (!modal) return;
	modal.css("display", value ? "block" : "none");
	if (value) {
		var previousModal = currentModal;
		if (previousModal) {
			showDetails(false, previousModal);
		}
		modal.toggleClass("animate-fade", !previousModal);
		$('.carousel-container').slick('setPosition');
		$('.carousel-container').slick('slickGoTo', 0, true);
		currentModal = modal;
	} else {
		currentModal = null;
	}
	$("body").css("overflow", value ? "hidden" : "inherit");
}

$.each($(".project-summary"), function () {
	var modalID = $(this).attr("data-modal-id");
	var modal = $("#" + modalID);
	if (modal.length < 1) return;
	initDetails($(this), modal);
});


// PROJECT IMAGE CAROUSEL

$(document).ready(function(){
  $('.carousel-container').slick({
		arrows: true,
		dots: true,
		variableWidth: true,
		centerMode: true,
  });

});

document.addEventListener('keydown', function (event) {
    if (event.defaultPrevented) {
        return;
    }
    var key = event.key || event.keyCode;
    if (key === 'Escape' || key === 'Esc' || key === 27) {
		showDetails(false, currentModal);
    }
});