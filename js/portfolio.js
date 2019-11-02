
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

// PROJECT TILE

$(".project-tile").hover(function () {
	$(this).find(".project-summary-container").toggleClass("animate-from-bottom", true);
}, function () {
	$(this).find(".project-summary-container").toggleClass("animate-from-bottom", false);
	
});

// PROJECT DETAILS WINDOWS

var modals = [];
var currentModal;
var direction_top = 0;
var direction_left = 1;
var direction_right = 2;

function initDetails (summary, modal) {
	modals.push(modal);
	var i = modals.indexOf(modal);
	
	summary.click(function() {
		showDetails(true, modal, direction_top);
	});
	var controlPrevious = $("<div class='modal-previous modal-control'><img src='icons/icon-left.svg'/></div>");
	var controlNext = $("<div class='modal-next modal-control'><img src='icons/icon-right.svg'/></div>");
	var controlClose = $("<div class='modal-close modal-control'><img src='icons/icon-close.svg'/></div>");
	
	controlPrevious.click(function() {
		var previ = i - 1;
		if (previ < 0) previ = modals.length - 1;
		var prev = modals[previ];
		showDetails(true, $(prev), direction_left);
	});
	
	controlNext.click(function() {
		var nexti = i + 1;
		if (nexti > modals.length - 1) nexti = 0;
		var next = modals[nexti];
		showDetails(true, $(next), direction_right);
	});
	
	controlClose.click(function() {
		showDetails(false, $(modal), direction_top);
	});
	
	modal.append(controlPrevious);
	modal.append(controlNext);
	modal.append(controlClose);
	
	var pageNum = $("<span class='modal-pagenum'>" + (i+1) + "/" + $(".project-summary").length + "</span>");
	modal.append(pageNum);
	
	showDetails(false, modal, direction_top);
};

function showDetails (value, modal, dir) {
	if (!modal) return;
	var previousModal = currentModal;
	if (value) {
		modal.css("z-index", 11);
		if (previousModal) {
			showDetails(false, previousModal, dir);
		}
		animateModalIn(modal, null, previousModal != null, dir);
		$('.carousel-container').slick('setPosition');
		$('.carousel-container').slick('slickGoTo', 0, true);
		currentModal = modal;
		updateScroll();
	} else {
		modal.css("z-index", 10);
		animateModalOut(modal, function () {
			updateScroll();
		}, dir);
		currentModal = null;
	}
}

function animateModalIn(modal, cb, quick, dir) {
	var project_details = modal.find(".project-details");
	project_details.css("top", dir == direction_top ? -50 : 0);
	project_details.css("left", dir == direction_left ? -100 : "unset");
	project_details.css("right", dir == direction_right ? -100 : "unset");
	project_details.css("opacity", 0.5);
	var inner_animation_target = {
		top: 0,
		left: 0,
		right: 0,
		opacity: 1
	};
	if (quick) {
		modal.fadeIn(50, function () {
			modal.find(".modal-control").fadeIn(10);
			if (cb) cb();
		});
		project_details.animate(inner_animation_target, 200);
	} else {
		modal.fadeIn(300, function () {
			modal.find(".modal-control").fadeIn(200);
			if (cb) cb();
		});
		project_details.animate(inner_animation_target, 300);
	}
}

function animateModalOut(modal, cb, dir) {
	var project_details = modal.find(".project-details");
	var inner_animation_target = {};
	if (dir == direction_top) inner_animation_target.top = -50;
	if (dir == direction_left) inner_animation_target.right = -200;
	if (dir == direction_right) inner_animation_target.left = -200;
	modal.find(".modal-control").fadeOut(200);
	project_details.animate(inner_animation_target, 100, function () {	
		modal.fadeOut(200, function () {
			if (cb) cb();
		});
	});
}

function updateScroll() {
	$("body").css("overflow-y", currentModal ? "hidden" : "inherit");
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
		showDetails(false, currentModal, direction_top);
    }
});