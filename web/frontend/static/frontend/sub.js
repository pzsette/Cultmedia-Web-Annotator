/**
 *addSub add a line for a subtitle
 */
function addSub(){
	var content = 
	"<div class=\"subtitle\">" +
		" <span>From</span> <input type=\"text\" class=\"start\" placeholder=\"mm:ss.d\" readonly=\"readonly\">" +
		" <span>to</span> <input type=\"text\" class=\"end\" placeholder=\"mm:ss.d\" readonly=\"readonly\">" +
		" <input type=\"text\" class=\"subText\" maxlength=\"45\" placeholder=\"Write your text here\">" +
	"</div>";
	$(".subEditing").append(content);
}

/**
 *openWindow open a pop-up for editing of subtitles
 @param {string} videoId indicate the video id
 */
function openWindow(videoId){
	var $subWindow = $("<div id=\""+videoId+"_subWindow\" class=\"subWindow\"></div>");
	$("body").append($subWindow);
	$subWindow = $("#"+videoId+"_subWindow");
	$("#"+videoId+"\\.mp4").clone().appendTo($subWindow);
	
	$(".subWindow video").eq(0).on('loadedmetadata', function(){
		$(this).after("<input type=\"range\" min=\"0\" max=\""+this.duration+"\" step=\"0.2\" value=\"0.0\"><p>00:00.0</p>");
		var content = 
			"<div class=\"subEditing\"></div>" +
			"<button class=\"addSub waves-effect waves-light\" onclick=\"addSub()\"><i class=\"fa fa-plus-circle fa-2x\"></i></button>";
		$subWindow.append(content);
		addSub();
		addSub();
		restoreSubtitles($("#"+videoId));
	});
	
	$subWindow.append("<button class=\"backbtn waves-effect waves-light\"><i class=\"fa fa-chevron-left fa-2x\"></i></button>");
	$subWindow.append("<button class=\"clearbtn waves-effect waves-light\"><i class=\"fa fa-eraser fa-2x\"></i></button>");
	$subWindow.append("<button class=\"savebtn waves-effect waves-light\"><i class=\"fa fa-save fa-2x\"></i></button>");
}

/**
 *memorizeSubtitles will save the sequence of all subtitles
 *@param {jquery var} $spot - the spot whose subtitles have changed
 */
function memorizeSubtitles($spot){
	if(localStorage.getItem("subtitles") == null){
		var array = new Array($(".spot").length - 1);
		array.fill("||");
		localStorage.setItem("subtitles", array);
	}
	var allSubtitles = localStorage.getItem("subtitles").split("||,");
	var subtitlesVideo = "";
	$(".subtitle").each(function(){
		var start = $(this).find(".start").val();
		var end = $(this).find(".end").val();
		var txt = $(this).find(".subText").val().replace(/\|/g, "\u2223");
		if (start != "" && end != "" && txt != "" && start != end){
			subtitlesVideo = subtitlesVideo + start + "|" + end + "|" + txt + "||";
		}
		if (subtitlesVideo == ""){
			subtitlesVideo = "||";
		}
	});
	for(var i = 0; i < allSubtitles.length - 1; i++){ //exluding last video's
		allSubtitles[i] += "||";
	}
	if($(".subWindow").length != 0){
		allSubtitles[findSpotPosition($spot)] = subtitlesVideo;
	} else {
		$(".spot:not([id])").not(":last").each( function(){
			allSubtitles[findSpotPosition($(this))] = "||";
		});
		allSubtitles[findSpotPosition($spot)] = "||";
	}
	localStorage.setItem("subtitles", allSubtitles);
}
/**
 *restoreSubtitles restore saved subtitles when a subWindow is open
 @param {jquery var} $spot indicate the spot relative to the window
 */
function restoreSubtitles($spot){
	var allSubtitles = localStorage.getItem("subtitles").split("||,");
	var subtitlesVideo = allSubtitles[findSpotPosition($spot)];
	if(subtitlesVideo != "" && subtitlesVideo != "||") {
		subtitlesVideo = subtitlesVideo.split("||");
		for(var i = 0; i < subtitlesVideo.length; i++){
			var subtitleParameters = subtitlesVideo[i].split("|");
			var start = subtitleParameters[0];
			var end = subtitleParameters[1];
			var txt = subtitleParameters[2];
			var box = $("#"+ $spot.get(0).id + "_subWindow").find(".subtitle").eq(i);
			box.find(".start").val(start);
			box.find(".end").val(end);
			box.find(".subText").val(txt);
			addSub();
		}
	}
}

////////////////////////////////UTILITY
/**
 *durationToSec convert a duration format to seconds
 */
function durationToSec(duration){
	var time = duration.split(/[:.]/);
	return parseInt(time[0])*60+parseInt(time[1])+parseInt(time[2])*0.1;
}
/**
 *secToDuration convert seconds to duration format
 */
function secToDuration(seconds){
	var min = parseInt(seconds/60);
	var sec = (seconds-min*60).toFixed(1);
	var colon = ':';
	if (sec < 10){
		colon += '0';
	}
	if (min < 10){
		min = '0'+min;
	}
	return min+colon+sec;
}
/**
 *ControlTime controls that setted timepoints for subtitles' start & end are not in conflict
 */
function controlTime(){
	var times = $(".start, .end");
	if(durationToSec(times.eq(0).val()) > durationToSec(times.eq(1).val())){
		times.eq(0).addClass("timeWarning");
	} else {
		times.eq(0).removeClass("timeWarning");
	}
	for (var i = 1; i < times.length - 1; i++){
			if (durationToSec(times.eq(i).val()) > durationToSec(times.eq(i+1).val()) || durationToSec(times.eq(i).val()) < durationToSec(times.eq(i-1).val())){
				times.eq(i).addClass("timeWarning");
			} else{
				times.eq(i).removeClass("timeWarning");
			}
	}
	if(durationToSec(times.eq(times.length - 1).val()) < durationToSec(times.eq(times.length - 2).val())){
		times.eq(times.length - 1).addClass("timeWarning");
	} else{
		times.eq(times.length - 1).removeClass("timeWarning");
	}
}
	
$(document).ready(function(){

	$("body").on('click', ".subbtn", function(){
		openWindow($(this).parents(".spot")[0].id);
		$(".audioCheckbtn").click();
		$("button").not(".record, .stopRecord, .subWindow button").prop("disabled", true);
		$("select").prop("disabled", true);
		$("video").prop("draggable", false);
		$("#timeline-wrapper, #search-wrapper").addClass("fade");
	});

	$("body").on('keyup', function(e){
		if(e.keyCode === 27){
			$(".subWindow").remove();
			$("button").not(".record, .stopRecord").prop("disabled", false);
			$("select").prop("disabled", false);
			$("video").prop("draggable", true);
			$("#timeline-wrapper, #search-wrapper").removeClass("fade");
		}
	});

	$("body").on('click', ".start", function(){
		$(this).val(secToDuration($("input[type=range]").val()));
		controlTime();
	});

	$("body").on('click', ".end", function(){
		$(this).val(secToDuration($("input[type=range]").val()));
		controlTime();
	});


	$("body").on('input', "input[type=range]", function(){
		var value = $(this).val();
		$(this).next("p").html(secToDuration(value));
		$(this).prev('video')[0].currentTime = value;
	});

	$("body").on('keyup', ".subText", function(e){
		if(e.keyCode == 13){
			addSub();
		}
	});

	$("body").on('click', ".savebtn", function(){
		if($(".timeWarning").length == 0){
			var spotId = $(this).parents(".subWindow")[0].id.replace("_subWindow","");
			memorizeSubtitles($("#" + spotId));
			$(".subWindow").remove();
			$("button").not(".record, .stopRecord").prop("disabled", false);
			$("select").prop("disabled", false);
			$("video").prop("draggable", true);
			$("#timeline-wrapper, #search-wrapper").removeClass("fade");
			var position = findSpotPosition($("#"+spotId));
			var subtitles = localStorage.getItem("subtitles").split("||,");
			if(subtitles[position] != "" && subtitles[position] != "||"){
				$("#" + spotId).find(".subbtn").addClass("setted");
			} else {
				$("#" + spotId).find(".subbtn").removeClass("setted");
			}
		} else {
			alert("Some istants are in conflict, please solve it");
		}
	});

	$("body").on('click', ".clearbtn", function(){
		if(confirm("Are you sure to delete all subtitles?")){
			$('.subtitle').remove();
			addSub();
			addSub();
		}
	});

	$("body").on('click', ".backbtn", function(){
		if(confirm("Do you really want to go back without saving?")){
			var e = jQuery.Event('keyup');
			e.keyCode = 27;
			$('body').trigger(e);
		}
	});
});

	