////////////////////////////GENERATING HTML ELEMENT
/**
 *addEmptySpot generate an empty spot for video in timeline
 *@param {boolean} effect - indicate if before the empty spot should be create an effect select
 */
function addEmptySpot(effect){	//Add an empty spot on timeline. The "boolean" effect indicate if should be add also an effects select
    var content = "";
	if (effect) {
		content +=
		"		<select class=\"effects browser-default\" onchange=\"memorizeEffects()\">" +
		"       	<option value=\"0\" selected>NoEffect</option>" +
		"       	<option value=\"1\">Fade</option>" +
		"		</select>"
	}
	content +=
	"		<div class=\"spot\">" +
	"		<div class=\"boxed\" ondrop=\"drop(event)\" ondragover=\"allowDrop(event)\"></div>" +
	"		</div>"
    $("#plus").before(content);
}
/**
 *removeSpot remove the spot passed as parameter
 */
function removeSpot($spot){
	if(confirm("Are you sure you want to remove this spot?")){
		var position = findSpotPosition($spot);
		$spot.next(".effects").remove();
		$spot.remove();
		removeData(position);
		if($(".spot").length == 1){
			localStorage.clear();
		}
	}
}
//////////////////////////////SAVING ELEMENTS IN LOCAL STORAGE
/**
 *autosave will save videos, texts, audios and effects
 *@param {jquery var} $spot - the spot that has changed
 */
function autosave($spot){
	$('video').prop('draggable', false);
	memorizeVideo($spot);
	memorizeText($spot);
	memorizeEffects();
	memorizeAudio($spot);
	memorizeSubtitles($spot);

	setTimeout(function(){						//prevent inconsistent state of LocalStorage due to multiple close additions
		$('video').prop('draggable', true);
		}, 750);
}
/**
 *removeData will remove in all local storage saves the position of a spot
 */
function removeData(position) {
	if(localStorage.getItem("videos") != null){
		var array = localStorage.getItem("videos").split(",");
		array.splice(position, 1);
		localStorage.setItem("videos", array);
	}
	if(localStorage.getItem("audios") != null){
		var array = localStorage.getItem("audios").split(",");
		array.splice(position, 1);
		localStorage.setItem("audios", array);
	}
	if(localStorage.getItem("texts") != null){
		var array = localStorage.getItem("texts").split(",");
		array.splice(position, 1);
		localStorage.setItem("texts", array);
	}
	if(localStorage.getItem("subtitles") != null){
		var array = localStorage.getItem("subtitles").split("||,");
		array[array.length - 1] = array[array.length - 1].substring(0, array[array.length - 1].length - 2);
		array.splice(position, 1);
		for(var i = 0; i < array.length; i++){ //ultimo sottotitolo dell'ultimo spot escluso
			array[i] += "||";
		}
		localStorage.setItem("subtitles", array);
	}
	memorizeEffects();
}
/**
 *memorizeEffects will save the sequence of all effects
 */
function memorizeEffects(){
	var effects = [];
	$("#timeline .effects").each(function(){
		effects.push($(this).val());
	});
	localStorage.setItem("effects", effects);
}
/**
 *memorizeVideo will save the sequence of all video in timeline
 *@param {jquery var} $spot - the spot where the video has changed
 */
function memorizeVideo($spot){
	if(localStorage.getItem("videos") == null){
		var array = new Array($(".spot").length - 1).fill(null);
		localStorage.setItem("videos", array);
	}
	var videos = localStorage.getItem("videos").split(",");
	var id = $spot.get(0).id;
	videos[findSpotPosition($spot)] = id;
	localStorage.setItem("videos", videos);
}
/**
 *memorizeText will save the sequence of all texts
 *@param {jquery var} $spot - the spot where the video has changed
 */
function memorizeText($spot){
	if(localStorage.getItem("texts") == null){
		var array = new Array($(".spot").length - 1).fill(null);
		localStorage.setItem("texts", array);
	}
	var texts = localStorage.getItem("texts").split(",");
	var id = $spot.get(0).id;
	var txt = $spot.find("#" + id + "_textContent").val();
	texts[findSpotPosition($spot)] = txt;
	localStorage.setItem("texts", texts);
}
/**
 *memorizeAudio will save the sequence of all texts
 *@param {jquery var} $spot - the spot where the audio has changed
 */
function memorizeAudio($spot){
	if(localStorage.getItem("audios") == null){
		var array = new Array($(".spot").length - 1).fill("0");
		localStorage.setItem("audios", array);
	}
	var audios = localStorage.getItem("audios").split(",");
	var id = $spot.get(0).id;
	var audio = $spot.find("#" + id + "_audioSelect").val();
	audios[findSpotPosition($spot)] = audio;
	localStorage.setItem("audios", audios);
}

///////////////////////////////HANDLING DRAG AND DROP
/**
 *allowDrop allow to drop a video on timeline
 @param {event} ev
 */
function allowDrop(ev) {
    ev.preventDefault();
}
/**
 *drag allow to drag a video from search-wrapper
 @param {event} ev
 */
function drag(ev) {
    ev.dataTransfer.setData("videoId", ev.target.id);
}
/**
 *drop allow to drop a video on timeline
 @param {event} ev
 */
function drop(ev) {
	console.log(ev)
    ev.preventDefault();
    var data = ev.dataTransfer.getData("videoId");
    var nodeCopy = document.getElementById(data).cloneNode(true);
	data = data.replace(".mp4", "").replace("_timeline", "");
	if ($("#"+data).length > 0){
		alert("You have already add this video");
	} else{
		nodeCopy.id = data + "_timeline";
		var boxed, spot;
		if(ev.target.nodeName === "VIDEO"){
			boxed = ev.target.parentElement;
			spot = boxed.parentElement;
			boxed.removeChild(boxed.childNodes[0]);
			boxed.appendChild(nodeCopy);
			spot.id = data;
			boxed.nextElementSibling.remove();
			spot.innerHTML += createControls(data);
		} else { //event target is a #boxed element
			boxed = ev.target;
			spot = boxed.parentElement;
			boxed.appendChild(nodeCopy);
			spot.id = data;
			if(spot.nextElementSibling.id === "plus"){
				addEmptySpot(true);
			}
			spot.innerHTML += createControls(data);
		}
		autosave($(spot));
	}
}
/**
 *dragend allow to delete a video from timeline dragging it oustide the spot
 @param {event} ev
 */
function dragend(ev) {	//Allow to delete a video from timeline dragging it outside the box
    if (ev.dataTransfer.dropEffect === 'none' && ev.target.id.endsWith('_timeline')) {
		var boxed = ev.target.parentElement;
		var spot = boxed.parentElement;
		boxed.nextElementSibling.remove();
        boxed.removeChild(ev.target.parentElement.childNodes[0]);
		spot.removeAttribute("id");
		autosave($(spot));
    }
}

/////////////////////////////UTILITY
/**
 *findSpotPosition find the position of a spot in the timeline
 *@param {jquery var} $recordedAudio - the element of which you want the position
 */
function findSpotPosition($spot){
	var position = 0;
	$(".spot").each(function(){
		if ($(this).is($spot)){
			return false;
		} else {
			position++;
		}
	});
	return position;
}

$(document).ready(function() {
    ///
    var init = false;
	/**
	 *Enable horizontal scrolling with mouse wheel
	 */
	$("#search-wrapper, #timeline-wrapper").mousewheel(function(event, delta) {
      val = this.scrollLeft - (delta * 272);
      jQuery(this).stop().animate({scrollLeft:val},500);
      event.preventDefault();
	});
    ///
    console.log("full_path: " + full_path)
    console.log("domain_root: " + domain_root)

    var domain = domain_root + full_path;

    ///
    var rec = [];

	/**
	 *load will load all the video stored in the search-scroll and provide to call the initializer for timeline
	 *@param {string} url
	 */
	///

    /*function load(url) {
        $.getJSON(url, function (data) {
            var content = "";
            for (var i in data.results) {
                content += "<div class='search-elem'>"
                var uri = data.results[i].uri;
                var img = data.results[i].thumbnail;
                var url = data.results[i].uri.split("/").pop();
                // content += "<img id=\""+ url+"\" draggable=true ondragstart=drag(event) ondragend=dragend(event) src=\"" + img + "\" width='262' height='100%'>"
                // content += "</div>"
                content += "<video controls id=\""+ url+"\" draggable=true ondragstart=drag(event) ondragend=dragend(event) poster=\"" + img + "\" width='262' height='100%'>" +
                "<source src=\""+ uri +"\" type=\"video/mp4\">" +
                "</video>"
            content += "</div>"
            }
            $("#search-scroller").html(content);
        });
    }*/

    /**
	 *load will load all the video stored in the search-scroll and provide to call the initializer for timeline
	 *@param {string} url
	 */
    function load(url) {
        $.getJSON(url, function (data) {
            console.log("dentro load");
            var content = "";
            for (var i in data.results) {
                content += "<div class='search-elem'>";
                var uri = data.results[i].uri;
                var img = data.results[i].thumbnail;

                var uri_tmp = uri.replace("0.0.0.0","localhost");
                uri = uri_tmp;
                var img_tmp = img.replace("0.0.0.0","localhost");
                img = img_tmp;

                var url = data.results[i].uri.split("/").pop();

                content += "<video controls id=\""+ url +"\" draggable=false ondragstart=drag(event) onloadedmetadata=\"$(this).prop('draggable', true);\" ondragend=dragend(event) poster=\"" + img + "\" width='262' height='100%'>" +
                "<source src=\""+ uri +"\" type=\"video/mp4\">" +
                "</video>";
                content += "</div>"
            }
            $("#search-scroller").html(content);
        if(!init){
            initialize();
        }
            });
    }

    /*function createEmptyTimeline(num){
        var content = "";
        for (var i = 0; i < num; i++) {
            content += "<div class=\"elem\">" +
                "        <div id=\"boxed\" ondrop=\"drop(event)\" ondragover=\"allowDrop(event)\"></div>" +
                "      </div>";
            if(i < num-1){
                content += "<div class=\"elem\">" +
                    "        <select id=\"effects\" class=\"browser-default\" >" +
                    "          <option value=\"0\" selected>NoEffect</option>" +
                    "          <option value=\"1\" class=\"others\">Fade</option>" +
                    "        </select>" +
                    "      </div>"
            }
        }
        $("#scroller").html(content);

    }
    createEmptyTimeline(50);*/

    /**
	 *initialize will initialize the timeline: empty or filled with local storage's content
	 */
	function initialize(){
		if(localStorage.length == 0) {
			addEmptySpot(false);
		}else {
			//restore videos
			if(localStorage.getItem("videos") != null) {
				var videos = localStorage.getItem("videos").split(",");
				addEmptySpot(false);
				for(var i = 0; i < videos.length; i++){
					addEmptySpot(true);
				}
				var $spots = $(".spot");
				for(var i = 0; i < videos.length; i++){
					if (videos[i] != ""){
						var $cloneNode = $("#" + videos[i] + "\\.mp4").clone();
						$cloneNode.attr("id", $cloneNode.attr("id").replace(".mp4", "_timeline"));
						$spots.eq(i).find(".boxed").append($cloneNode);
						$spots.eq(i).attr("id", videos[i]);
						$spots.eq(i).append(createControls(videos[i]));
					}
				}
			}

			//restore effects
			if(localStorage.getItem("effects") != null) {
				var effects = localStorage.getItem("effects").split(",");
				var i = 0;
				$("#timeline .effects").each(function(){
					$(this).val(effects[i]);
					i++;
				});
			}

			//restore texts
			if(localStorage.getItem("texts") != null) {
				var texts = localStorage.getItem("texts").split(",");
				var $spots = $(".spot");
				for (var i = 0; i <= texts.length - 1; i++){
					if(texts[i] != ""){
						$spots.eq(i).find(".textContent").val(texts[i]);
						$spots.eq(i).find(".textbtn").addClass("setted");
					}
				}
			}

			//restore audios
			if(localStorage.getItem("audios") != null) {
				var audios = localStorage.getItem("audios").split(",");
				var $spots = $(".spot");
				//var audioSelects = document.getElementById("timeline").getElementsByClassName("audioSelect");
				for (var i = 0; i <= audios.length - 1; i++) {
					if(audios[i] != ""){
						$spots.eq(i).find(".audioSelect").val(audios[i]);
						var $audiobtn = $spots.eq(i).find(".audiobtn");
						switch(audios[i]){
							case '1':
								$audiobtn.find("i").removeClass("fa-volume-up").addClass("fa-volume-off");
								break;
							case '2':
								$audiobtn.find("i").removeClass("fa-volume-up").addClass("fa-microphone");
								$audiobtn.addClass("warning");
								break;
							case '3':
								$audiobtn.find("i").removeClass("fa-volume-up").addClass("fa-file-audio-o");
								$audiobtn.addClass("warning");
								break;
						}
					}
				}
			}

			//restore subtitles
			var subtitles = localStorage.getItem("subtitles").split("||,");
			for(var i = 0; i <= subtitles.length - 1; i++){
				if(subtitles[i] != "" && subtitles[i] != "||"){
					$(".subbtn").eq(i).addClass("setted");
				} else {
					$(".subbtn").eq(i).removeClass("setted");
				}
			}
		}
		init = true;
	}

    load(domain_root + '/api/shots');

	$("#plusbtn").click(function(){
		addEmptySpot(true);
	});

    /*$("#search").keyup(function () {
        load(domain_root + '/api/shots?q=' +  $("#search").val() +'&mood=' + $("#mood").val());
    });*/

    /*$("#awesomplete-search").keyup(function () {
        load(domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&mood=' + $("#mood").val());
    });*/

    /**
	 *event attached to text, audio and subtitles button
	 */
	$("body").on('click', ".textbtn", function(){ //LASCIARE COSI'
		$(this).hide();
		$(this).siblings(".audiobtn, .subbtn").hide();
		$(this).next().show();	//textCheckbtn
		$(this).next().next().show().focus();	//textContent
	});
	$("body").on('click', ".textCheckbtn", function(){
		$(this).siblings(".textbtn, .audiobtn, .subbtn").show();
		$(this).hide();
		$(this).next().hide();	//textContent
		if($(this).next().val() != ""){
			$(this).siblings(".textbtn").addClass("setted");
		} else {
			$(this).siblings(".textbtn").removeClass("setted");
		}
		memorizeText($(this).parents(".spot"));
	});
	$("body").on('keyup', ".textContent", function(e){
		if(e.keyCode == 13){
			$(this).prev().click();
		}
	});
	$("body").on('click', ".audiobtn", function(){
		$(this).hide();
		$(this).siblings(".textbtn, .subbtn").hide();
		$(this).next().show();	//audioCheckbtn
		$(this).next().next().show().change();	//audioSelect
	});
	$("body").on('click', ".audioCheckbtn", function(){
		$(this).siblings().hide();
		$(this).siblings(".textbtn, .audiobtn, .subbtn").show();
		$(this).hide();
		switch($(this).siblings(".audioSelect").val()){
			case "0":
			case "1":
				$(this).siblings(".audiobtn").removeClass("warning");
				break;
			case "2":
				$(this).siblings().find(".stopRecord").click();
				if($(this).siblings(".recordedAudio")[0].hasAttribute("src")){
					$(this).siblings(".recordedAudio").show();
					$(this).siblings(".audiobtn").removeClass("warning");
				}
				else{
					$(this).siblings(".audiobtn").addClass("warning");
				}
				break;
			case "3":
				if($(this).siblings(".formAudio").find("input[type=file]").val() != ""){
					$(this).siblings(".audioFileName").show();
					$(this).siblings(".audiobtn").removeClass("warning");
				}
				else{
					$(this).siblings(".audiobtn").addClass("warning");
				}
		}
	});
	$("body").on('change', ".formAudio", function () {
		var input = $(this).find("input[type=file]").prop('files')[0];
		if(input.type === "audio/wav" || input.type === "audio/mp3" || input.type === "audio/ogg" || input.type === "audio/x-m4a" || input.type === "audio/mpeg"){
			$(this).siblings(".audioFileName").show().text("Audio: " + $(this).find("input[type=file]").val().split('\\').pop());
			sendData(input, $(this)[0].id.replace("_formAudio", ""));
		}else{
			alert("this file is not an audio");
			$(this).find("input[type=file]").val("");
		}
	});
    $("body").on('change', ".audioSelect", function () {
		$(this).siblings().find(".stopRecord").click();
		switch($(this).val()){
			case '0':
				$(this).siblings(".audiobtn").children("i").removeClass("fa-volume-off fa-microphone fa-file-audio-o").addClass("fa-volume-up");
				$(this).siblings(".recordingConsole").hide().children().hide();
				$(this).siblings(".recordedAudio").prop("controls", false).removeAttr("src");
				$(this).siblings(".formAudio").hide().children().hide().find("input[type=file]").val('');
				$(this).siblings(".audioFileName").hide().html('');
				break;
			case '1':
				$(this).siblings(".audiobtn").children("i").removeClass("fa-volume-up fa-microphone fa-file-audio-o").addClass("fa-volume-off");
				$(this).siblings(".recordingConsole").hide().children().hide();
				$(this).siblings(".recordedAudio").prop("controls", false).removeAttr("src");
				$(this).siblings(".formAudio").hide().children().hide().find("input[type=file]").val('');
				$(this).siblings(".audioFileName").hide().html('');
				break;
			case '2':
				$(this).siblings(".audiobtn").children("i").removeClass("fa-volume-up fa-volume-off fa-file-audio-o").addClass("fa-microphone");
				$(this).siblings(".recordingConsole").show().children().show();
				$(this).siblings(".formAudio").hide().children().hide().find("input[type=file]").val('');
				$(this).siblings(".audioFileName").hide().html('');
				activateMicrophone($(this));
				break;
			case '3':
				$(this).siblings(".audiobtn").children("i").removeClass("fa-volume-up fa-volume-off fa-microphone").addClass("fa-file-audio-o");
				$(this).siblings(".recordingConsole").hide().children().hide();
				$(this).siblings(".recordedAudio").prop("controls", false).removeAttr("src");
				$(this).siblings(".formAudio").show().children().not("input").show();
				break;
		}
		memorizeAudio($(this).parents(".spot"));
    });
    $("body").on('click', ".record", function startRecording(){
        console.log("start clicked");
		$(this).prop("disabled", true).addClass("recording");
		$(this).siblings(".stopRecord").prop("disabled", false);
        audioChunks = [];
		var position = findSpotPosition($(this).parents(".spot"));
		$(this).parents(".spot").find("video")[0].currentTime = 0;
		$(this).parents(".spot").find("video").prop("muted", true).trigger("play");
        rec[position].start();
    });
    $("body").on('click', ".stopRecord", function stopRecording(){
        console.log("stop clicked");
		$(this).prop("disabled", true);
		$(this).siblings(".record").prop("disabled", false).removeClass("recording");
		var position = findSpotPosition($(this).parents(".spot"));
		rec[position].stop();
		$(this).parents(".spot").find("video").trigger("pause").prop("muted", false);
		$(this).parents(".spot").find("video")[0].currentTime = 0;
		$(this).parent().siblings(".recordedAudio").show();
    });
	$("body").on('contextmenu', ".boxed:not(:last)", function(event){
		event.preventDefault();
		$(".contextmenu").remove();

		var $spot = $(this).parents(".spot");
		var contextmenu = $("<div class=\"contextmenu\"><i class=\"fa fa-trash\"></i> REMOVE</div>")
							.css({display: "block", left: event.pageX, top: event.pageY});
		$spot.append(contextmenu);
	});
	$("body").on('click', ".contextmenu", function(){
		removeSpot($(this).parents(".spot"));
	});
	$("body").on('click', function(){
		$(".contextmenu").remove();
		$(".spot").removeClass("deletable");
	});

	////////////////////////////////HANDLING Audio
	/**
	 *activeMicrophone provide to acquire permission for mic
	 @param {jquery var} $audioSelect - indicate which audioSelect call the function
	 */
	function activateMicrophone($audioSelect) {
		if (navigator.userAgent.indexOf('Edge') >= 0){
			alert("Your browser doesn't support simple HTML5 API");
			$audioSelect.val('0').change();
		}
		else{
			navigator.mediaDevices.getUserMedia({audio: true})
				.then(stream => {
					handlerFunction(stream, $audioSelect.siblings(".recordedAudio"));
					$(".record").prop("disabled", false);
				})
				.catch(err => {
					alert("Access to microphone denied!");
					$audioSelect.val('0').change();
			});
		}
    }
    function handlerFunction(stream, $recordedAudio) {
		var position = findSpotPosition($recordedAudio.parents(".spot"));
        rec[position] = new MediaRecorder(stream);
        rec[position].ondataavailable = e => {
            var audioChunks = [];
            audioChunks.push(e.data);
            if(rec[position].state === "inactive"){
                var blob_audio = new Blob(audioChunks, {type:'audio/wav'});
                $recordedAudio.prop("src", URL.createObjectURL(blob_audio));
                $recordedAudio.prop("controls", true);
                $recordedAudio.prop("autoplay", false);
                sendData(blob_audio, $recordedAudio[0].id.replace("_recordedAudio", ""));
            }
        }
    }
	function sendData(blob, id) {
        var fd = new FormData();
        var format = blob.type.split("/")[1];
        fd.append('audio', blob, id+'.'+format);
		fd.append('id', id);
        var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
        $.ajaxSetup({
            beforeSend: function (xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });
        $.ajax({
           url: '/api/upload/',
           type: 'POST',
           data: fd,
           processData: false,
           contentType: false,
           success: function(data){
              console.log(fd);
            }
        });
    }
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $("#awesomplete-search").keyup(function () {
        load(domain_root + '/api/shots?'+ getMoodQueryset()+'&q=' + $("#awesomplete-search").val());
        console.log(domain_root + '/api/shots?'+ getMoodQueryset()+'&q=' + $("#awesomplete-search").val());
    });

    $("#awesomplete-search").on('awesomplete-selectcomplete',function(){
        query = domain_root + '/api/shots?'+getMoodQueryset()+'&q=' +  this.value;
        load(domain_root + '/api/shots?'+getMoodQueryset()+'&q=' +  this.value);
        console.log(query);
    });

    $("#clear").click(function(){
		var permission = confirm("L'operazione non potrà essere annullata. \nSei sicuro di voler svuotare la timeline?");
		if(permission == true){
			$(".spot, .effects").remove();
			addEmptySpot(false);
			localStorage.clear();
		}
	});

    $("#mood-filter").change(function () {
        //load(domain_root + '/api/shots?q=' +  $("#search").val() +'&mood=' + $("#mood").val());
        filterType = $("#mood-filter").val();
        mainDiv= document.getElementsByClassName("pzdropdown")
        parameters = document.getElementById("dropelement");
        switch (filterType) {
            case "1":
                console.log("primo filtro");
                mainDiv[0].style.display="block";
                parameters.innerHTML = '<p id="pzp">Piacere</p> ' +
                    '       <div class="itemspace"> ' +
                    '           <label id="pzlabel" style="color:black"><input id="HTCRange" type="range" min="0" max="1" step="0.1" value="0">Min Colourfulness: <span id="HTCValue"></span></label> ' +
                    '       </div> ' +
                    '       <div class="itemspace"> ' +
                    '           <select class="pzselect" id="DNSelect">' +
                    '               <option value="" selected>All Day</option> ' +
                    '               <option value="0" class="others">Day</option> ' +
                    '               <option value="1" class="others">Night</option> ' +
                    '           </select>' +
                    '       </div>' +
                    '       <div class="itemspace"> ' +
                    '           <select class="pzselect" id="moodSelect">' +
                    '               <option value="0" selected>No Mood</option> ' +
                    '               <option value="1" class="others">Happy</option> ' +
                    '               <option value="2" class="others">Neutral</option> ' +
                    '               <option value="3" class="others">Sad</option> ' +
                    '           </select>' +
                    '       </div>'
                var HTCslider = document.getElementById("HTCRange");
                var HTCoutput = document.getElementById("HTCValue");
                HTCoutput.innerHTML = HTCslider.value;
                HTCslider.oninput = function() {
                HTCoutput.innerHTML = this.value;
                };

                $("#HTCRange").change(function() {
                    daytimeValue = $("#DNSelect").val();
                    colorValue =  $("#HTCRange").val();
                    moodValue = $("#moodSelect").val();

                    query = domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&mood='+moodValue+"&daytime="+daytimeValue+"&colourfulness="+colorValue;
                    load(query);
                    console.log(query);
                });

                $("#DNSelect").change(function() {
                    daytimeValue = $("#DNSelect").val();
                    colorValue =  $("#HTCRange").val();
                    moodValue = $("#moodSelect").val();

                    query = domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&mood='+moodValue+"&daytime="+daytimeValue+"&colourfulness="+colorValue;
                    load(query);
                    console.log(query);
                });

                $("#moodSelect").change(function() {
                    daytimeValue = $("#DNSelect").val();
                    colorValue =  $("#HTCRange").val();
                    moodValue = $("#moodSelect").val();

                    query = domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&mood='+moodValue+"&daytime="+daytimeValue+"&colourfulness="+colorValue;
                    load(query);
                    console.log(query);
                });

                break;
            case "2":
                console.log("secondo filtro");
                mainDiv[0].style.display="block";
                parameters.innerHTML = '<p id="pzp">Energia</p>\n' +
                    '\n' +
                    '        <div class="itemspace"> ' +
                    '           <select class="pzselect" id="DNSelect">' +
                    '               <option value="0" selected>All Day</option> ' +
                    '               <option value="1" class="others">Day</option> ' +
                    '               <option value="2" class="others">Night</option> ' +
                    '           </select>' +
                    '       </div>' +
                    '\n' +
                    '        <div class="itemspace"> ' +
                    '           <select class="pzselect" id="IOSelect">' +
                    '               <option value="0" selected>All Position</option> ' +
                    '               <option value="1" class="others">Indoor</option> ' +
                    '               <option value="2" class="others">Outdoor</option> ' +
                    '           </select>' +
                    '       </div>' +
                    '\n' +
                    '        <div class="itemspace">\n' +
                    '          <label style="color: black"><input id="EAPRange" type="range" min="0" max="1" step="0.1" value="0"> Min Pixel Motion: <span id="EAPValue"></span></label>\n' +
                    '        </div>\n' +
                    '\n' +
                    '        <div class="itemspace">\n' +
                    '          <label style="color: black"><input id="EADRange" type="range" min="10" max="90" step="10" value="90">Max Shot Duration: <span id="EADValue"></span></label>\n' +
                    '        </div>\n' +
                    '\n' +
                    '        <div class="itemspace">\n' +
                    '          <label style="color: black"><input id="EALRange" type="range" min="0" max="1" step="0.1" value="1"> Max Loudness: <span id="EALValue"></span></label>\n' +
                    '        </div>\n' +
                    '\n' +
                    '        <div class="itemspace"> ' +
                    '           <select class="pzselect" id="DNDSelect">' +
                    '               <option value="0" selected>Dialogue and Not</option> ' +
                    '               <option value="1" class="others">Dialogue</option> ' +
                    '               <option value="2" class="others">Not Dialogue</option> ' +
                    '           </select>' +
                    '       </div>'
                var EAPslider = document.getElementById("EAPRange");
                var EAPoutput = document.getElementById("EAPValue");
                EAPoutput.innerHTML = EAPslider.value;
                EAPslider.oninput = function() {
                  EAPoutput.innerHTML = this.value;
                }

                var EADslider = document.getElementById("EADRange");
                var EADoutput = document.getElementById("EADValue");
                EADoutput.innerHTML = EADslider.value;
                EADslider.oninput = function() {
                  EADoutput.innerHTML = this.value;
                }

                var EALslider = document.getElementById("EALRange");
                var EALoutput = document.getElementById("EALValue");
                EALoutput.innerHTML = EALslider.value;
                EALslider.oninput = function() {EALoutput.innerHTML = this.value};

                $('#IOSelect').change(function () {
                    daytimeValue = $("#DNSelect").val();
                    indoorVal = $('#IOSelect').val();
                    mpm = $('#EAPRange').val();
                    msd = $('#EADRange').val();
                    ml = $('#EALRange').val();
                    dnd = $('#DNDSelect').val();

                    query = domain_root + '/api/shots?indoor='+indoorVal+'&daytime='+daytimeValue+'&pixelmotion='+mpm+'&duration='+msd+'&loudness='+ml+'&dialogue='+dnd+'&q='+$("#awesomplete-search").val();
                    load(query);
                    console.log(query);
                });

                $('#DNSelect').change(function () {
                    daytimeValue = $("#DNSelect").val();
                    indoorVal = $('#IOSelect').val();
                    mpm = $('#EAPRange').val();
                    msd = $('#EADRange').val();
                    ml = $('#EALRange').val();
                    dnd = $('#DNDSelect').val();

                    query = domain_root + '/api/shots?indoor='+indoorVal+'&daytime='+daytimeValue+'&pixelmotion='+mpm+'&duration='+msd+'&loudness='+ml+'&dialogue='+dnd+'&q='+$("#awesomplete-search").val();
                    load(query);
                    console.log(query);
                });

                $('#EAPRange').change(function () {
                    daytimeValue = $("#DNSelect").val();
                    indoorVal = $('#IOSelect').val();
                    mpm = $('#EAPRange').val();
                    msd = $('#EADRange').val();
                    ml = $('#EALRange').val();
                    dnd = $('#DNDSelect').val();

                    query = domain_root + '/api/shots?indoor='+indoorVal+'&daytime='+daytimeValue+'&pixelmotion='+mpm+'&duration='+msd+'&loudness='+ml+'&dialogue='+dnd+'&q='+$("#awesomplete-search").val();
                    load(query);
                    console.log(query);
                });

                $('#EADRange').change(function () {
                    daytimeValue = $("#DNSelect").val();
                    indoorVal = $('#IOSelect').val();
                    mpm = $('#EAPRange').val();
                    msd = $('#EADRange').val();
                    ml = $('#EALRange').val();
                    dnd = $('#DNDSelect').val();

                    query = domain_root + '/api/shots?indoor='+indoorVal+'&daytime='+daytimeValue+'&pixelmotion='+mpm+'&duration='+msd+'&loudness='+ml+'&dialogue='+dnd+'&q='+$("#awesomplete-search").val();
                    load(query);
                    console.log(query);
                });

                $('#EALRange').change(function () {
                    daytimeValue = $("#DNSelect").val();
                    indoorVal = $('#IOSelect').val();
                    mpm = $('#EAPRange').val();
                    msd = $('#EADRaange').val();
                    ml = $('#EALRange').val();
                    dnd = $('#DNDSelect').val();

                    query = domain_root + '/api/shots?indoor='+indoorVal+'&daytime='+daytimeValue+'&pixelmotion='+mpm+'&duration='+msd+'&loudness='+ml+'&dialogue='+dnd+'&q='+$("#awesomplete-search").val();
                    load(query);
                    console.log(query);
                });

                $('#DNDSelect').change(function () {
                    daytimeValue = $("#DNSelect").val();
                    indoorVal = $('#IOSelect').val();
                    mpm = $('#EAPRange').val();
                    msd = $('#EADRaange').val();
                    ml = $('#EALRange').val();
                    dnd = $('#DNDSelect').val();

                    query = domain_root + '/api/shots?indoor='+indoorVal+'&daytime='+daytimeValue+'&pixelmotion='+mpm+'&duration='+msd+'&loudness='+ml+'&dialogue='+dnd+'&q='+$("#awesomplete-search").val();
                    load(query);
                    console.log(query);
                });


                break;
            case "3":
                console.log("terzo filtro");
                mainDiv[0].style.display="block";
                parameters.innerHTML = '<p id="pzp">Tensione</p>\n' +
                    '\n' +
                    '        <div class="itemspace">\n' +
                    '        <label style="color:black"><input id="pzcheckbox" name="NHFCheckbox" type="checkbox" align=""><br>No happy Faces</label>\n' +
                    '        </div>\n' +
                    '\n' +
                    '        <div class="itemspace">\n' +
                    '          <select class="pzselect" id="moodSelect">\n' +
                    '            <option value="0" selected>No mood</option>\n' +
                    '            <option value="1">Happy</option>\n' +
                    '            <option value="2">Neutral</option>\n' +
                    '            <option value="3">Sad</option>\n' +
                    '          </select>\n' +
                    '        </div>'

                $("#moodSelect").change(function() {
                    nhf =  $("#pzcheckbox").val();
                    moodValue = $("#moodSelect").val();
                    query = domain_root + '/api/shots?&mood=' + moodValue + '&nohappyfaces='+nhf + '&q=' +  $("#awesomplete-search").val();

                    load(query);
                    console.log(query);
                });

                $("#pzcheckbox").change(function() {
                    nhf =  $("#pzcheckbox").val();
                    moodValue = $("#moodSelect").val();
                    query = domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&mood=' + moodValue + '&nohappyfaces='+nhf

                    load(query);
                    console.log(query);
                });
                break;
            case "0":
                mainDiv[0].style.display="none";
                console.log("no filtro");
                break;
        }
    });

    /*$("#download").click(function(){
        var dwnButton = document.getElementById("download");
        dwnButton.classList.add("dots");
        dwnButton.innerHTML = '<i class="fas fa-file-download"></i>  DOWNLOADING <span>.</span><span>.</span><span>.</span>';
        var final = []
        var effects = []
        var videos= document.getElementById("scroller").getElementsByTagName("VIDEO")
        var effectsElements = document.getElementById("scroller").getElementsByTagName("SELECT")
        for (var i = 0; i < videos.length; i++) {
            final.push(videos[i].id)
        }
        for (var i = 0; i < videos.length-1; i++){
            effects.push(effectsElements[i].value)
        }

        $.ajax({ url: domain_root + "/api/process_videos?videos=" + final + "&effects=" + effects, success: function (result) {
          var req = new XMLHttpRequest();
          req.open("GET", domain + "videoferracani/final_file.mp4", true);
          req.responseType = "blob";

          req.onload = function (event) {
            var blob = req.response;
            console.log(blob.size);
            var link=document.createElement('a');
            link.href=window.URL.createObjectURL(blob);
            link.download="final_file.mp4";
            link.click();
            dwnButton.innerHTML = '<i class="fas fa-file-download"></i>  DOWNLOAD'
            dwnButton.classList.remove('dots')
          };

          req.send();

        }})
    })*/

    $("#download").click(function(){
		if($("#timeline .spot").length == $("#timeline video").length + 1 && $("#timeline video").length > 0){
			if($(".warning").length == 0) {
				$(this).prop("disabled", true);
				$("#loading").removeClass("disappeared");
				$(this).html("<i class=\"fa fa-download\"></i> RENDERING...");

				//Videos
				var videos = encodeURIComponent(localStorage.getItem("videos").split(","));

				//Texts
				var texts = encodeURIComponent(localStorage.getItem("texts").split(","));

				//Audios
				var audios = encodeURIComponent(localStorage.getItem("audios").split(","));

				//Effects
				var effects = encodeURIComponent(localStorage.getItem("effects").split(","));

				//Subtitles
				var subtitles = localStorage.getItem("subtitles");
				subtitles = subtitles.substring(0, subtitles.length - 2);
				subtitles = encodeURIComponent(subtitles);

				console.log("start ajax");

				$.ajax({url: domain_root + "/api/process_edited_videos/?videos=" + videos + "&effects=" + effects + "&audios=" + audios + "&texts=" + texts + "&subtitles=" + subtitles
					, success: function (result) {
						var req = new XMLHttpRequest();
						req.open("GET", domain + "videoferracani/final_file.mp4", true);
						req.responseType = "blob";
						req.onload = function (event) {
							var blob = req.response;
							console.log(blob.size);
							var link = document.createElement('a');
							link.href = window.URL.createObjectURL(blob);
							link.download = "final_file.mp4";
							document.body.appendChild(link);
							link.click();
							link.remove();
							$("#loading").addClass("disappeared");
							$("#download").html("<i class=\"fa fa-download\"></i> DOWNLOAD").prop("disabled", false);
						};
						req.send();
					}
				});
			} else{
				alert("You are missing some audio source");
			}
		} else {
			alert("You miss some spots... fill them or remove them");
		}
    });

    $('#upload').click(function(){
         window.open(domain_root+'/frontend/upload','_blank');
    })

    $('#annotator').click(function(){
        window.open(domain_root+'/annotator','_blank');
    })

    $('#export').click(function(){
        var expButton = document.getElementById("export");
        expButton.classList.add("dots");
        expButton.innerHTML = '<i class="fas fa-file-export"></i>  EXPORTING <span>.</span><span>.</span><span>.</span>';
        var final = []
        var effects = []
        var videos= document.getElementById("scroller").getElementsByTagName("VIDEO")
        var effectsElements = document.getElementById("scroller").getElementsByTagName("SELECT")
        for (var i = 0; i < videos.length; i++) {
            final.push(videos[i].id)
        }
        for (var i = 0; i < videos.length-1; i++){
            effects.push(effectsElements[i].value);
        }

        for (var i=0; i < final.length; i++) {
            final[i] = final[i].replace("_timeline", "");
        }
        console.log("Final:");
        console.log(final);
        console.log("Effects:");
        console.log(effects);

        $.ajax({ url: domain_root + "/api/retrieve_videos?videos=" + final, success: function (result) {
            var req = new XMLHttpRequest();
            req.open("GET", domain + "zipvideo/video.zip", true);
            req.responseType = "blob";

            req.onload = function (event) {
                var blob = req.response;
                console.log(blob.size);
                var link=document.createElement('a');
                link.href=window.URL.createObjectURL(blob);
                link.download="video.zip";
                link.click();
          };

          req.send();
          expButton.innerHTML = '<i class="fas fa-file-export"></i>  EXPORT'
          expButton.classList.remove('dots')
        }})

    })

});

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

/*function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var nodeCopy = document.getElementById(data).cloneNode(true);
    nodeCopy.id = data + "_timeline";
    if(ev.target.nodeName=== "VIDEO"){
        ev.target.parentElement.appendChild(nodeCopy);
        ev.target.parentElement.removeChild(ev.target.parentElement.childNodes[0]);
    } else {
        ev.target.appendChild(nodeCopy);
    }
}*/

/*function dragend(ev){
    if(ev.dataTransfer.dropEffect=== 'none' && ev.target.id.endsWith('_timeline')){
        ev.target.parentElement.removeChild(ev.target.parentElement.childNodes[0]);
    }
}*/

function getMoodQueryset() {
    console.log("inside getMoodQueryset");
    filterType = $("#mood-filter").val();
    //console.log(filterType);
    switch (filterType) {
        case "0":
            console.log("inside case 0");
          return '';
        case "1":
            console.log("inside case 1");
            moodValue = $('#moodSelect').val();
            daytimeValue = $("#DNSelect").val();
            colorValue = $("#HTCRange").val();
            console.log(colorValue);
            moodQueryString = "&mood="+moodValue+"&daytime="+daytimeValue+"&colourfulness="+colorValue;
            return moodQueryString;
        case "2":
            console.log("inside case 2");
            indoorValue = $('#IOCheckbox').val();
            switch (indoorValue) {
                case "0":
                    return "&mood=";
                case "1":
                    return "&mood=True";
                case "2":
                    return "&mood=True";
            }
        case "3":
            console.log("inside case 3");
            moodValue = $('#moodSelect').val();
            nhfValue = $('#pzcheckbox').val();
            moodQueryString = "&mood="+moodValue+'&nohappyfaces='+nhfValue;
            return moodQueryString;
    }
}
