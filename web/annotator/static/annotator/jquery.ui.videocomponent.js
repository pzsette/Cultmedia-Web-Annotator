/*
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 *   jquery.ui.effects.js
 *	 jquery.ui.mouse.js
 *   jquery.ui.draggable.js
 *   jquery.ui.droppable.js
 *	 jquery.editinplace.js
 */

(function( $ ) {
	
$.widget( "ui.videocomponent", {
   
	options: {
		width : 640,
		height : 480,
	},
	
	video : null,
    timeline : null,
    timelineProgress : null,
    drag : null,
	play : null,
	pause : null,
	startScreen : null,
	startScreenContext : null,
	endScreen : null,
	endScreenContext : null,
	annotationsList : null,
	videosList : null,
	currentScreen : 1,
	currentVideoId : null,
	currentShotStart : 0,
	currentShotEnd : null,
	currentShotArousal : 5,
	currentShotValence : 5,

	_create: function() {
		var self = this; 
		var opts = self.options;
		var el = self.element;
		el
			.addClass( "cultmedia-videocomponent" )
			.attr({
				role: "videocomponent"
			})
			.empty()
			.css({
				'width': opts.width + "px", 
				'height': opts.height + "px" 
		});
		$(document).off("click", ".remove-item-btn");
		$(document).off("click", ".video-item");
		$('table .list').empty();
		
		console.log("create");		 
		self._initializePreloader();
		self.getVideoInfo();
		console.log("prova function");
		self.getVideosList();
		
		return false;
	},
	
	
	_destroy: function() {
		this.element
			.removeClass( "cultmedia-videocomponent" )
			.removeAttr( "role" )
			.empty();
			
		return false;
	},


	_setOption: function( key, value ) {
		var self = this;
		var opts = self.options;
		
		if ( key === "sourceId" ) {
			opts.sourceId = value;
		}
		
		if ( key === "width" ) {
			opts.width = value;
		}
		
		if ( key === "height" ) {
			opts.height = value;
		}		
		
		self._super( "_setOption", key, value );
		
	},
	
	_refreshValue: function() {
		var self = this;
		return false;
	},
	
	_initializePreloader: function() {
		var self = this;
		var opts = self.options;
		var preloader = jQuery('<div></div>').attr('class','preloader');
		
		preloader.css({
			'borderColor': (opts.themeColor).replace(/0x/, "#"),
			'bottom': '30px', //(opts.height / 2 - 16) + "px",
			'left': '2px', //(opts.width / 2 - 16) + "px"
			'width': '20px',
			'height': '20px',
			'position': 'absolute'
		})
			.addClass('ui-corner-all')
			.ajaxStart(function() {
				$(this).css("display", "block");
			})
			.ajaxStop(function() {
				$(this).css("display", "none");
			});
		
		self.element.append(preloader);	
		console.log("initializePreloader");
		return false;
	},
	
	_initializeSliders : function(){
		var self = this;
		var handleArousal = $( "#custom-handle-arousal" );
		var handlValence = $( "#custom-handle-valence" );
		$("#flat-slider-arousal").slider({
      		orientation: "horizontal",
      		range: "min",
      		max: 10,
      		value: self.currentShotArousal,
      		change: function(event, ui){console.log("change"); self.currentShotArousal = ui.value; console.log($(this).val())},
			create: function() {
        		handleArousal.text( $( this ).slider( "value" ) );
      		},
			slide: function( event, ui ) {
				handleArousal.text( ui.value );
			}
    	});
		
		$("#flat-slider-valence").slider({
      		orientation: "horizontal",
      		range: "min",
      		max: 10,
      		value: self.currentShotValence,
      		change: function(event, ui){console.log("change"); self.currentShotValence = ui.value; console.log($(this).val())},
			create: function() {
        		handlValence.text( $( this ).slider( "value" ) );
      		},
			slide: function( event, ui ) {
				handlValence.text( ui.value );
			}
    	});

	},
		  
	
	_initializeAnnotations : function(annotationsData){
		self = this;
		var options = {
  			valueNames: [ 'start', 'end', 'arousal', 'valence', 'id' ],
			item: '<tr><td class="id" style="display:none;"></td><td class="remove"><button class="remove-item-btn"><i class="fas fa-backspace"></i></button></td><td class="start"></td><td class="end"></td><td class="arousal"></td><td class="valence"></td></tr>'
		};
		self.annotationsList = new List('video__annotations', options, annotationsData);
		self.addListCallbacks();
//		self.annotationsList.add({
//  			start: "5.5",
//  			end: "5.5",
//			arousal: "1.3",
//			valence: "2.5"
//		});
	},
	
	addListCallbacks : function(){
		self = this;
  		// Needed to add new buttons to jQuery-extended object
  		$(document).on('click', '.remove-item-btn', function() {
			var itemId = $(this).closest('tr').find('.id').text();
//			self.annotationsList.remove('id', itemId);
			self.deleteAnnotation(itemId);
	  	});
	},
	
	addVideosListCallbacks : function(){
		self = this;
  		// Needed to add new buttons to jQuery-extended object
  		$(document).on('click', '.video-item', function() {
			var itemId = $(this).closest('tr').find('.id').text();
			console.log("tendina");
//			self.annotationsList.remove('id', itemId);
			console.log(itemId);
			self.updateWidget(itemId, 'sourceId');
	  	});
	},

	
	_loadPlayer: function(videoData) {
		console.log("VIDEO DATA")
		console.log(videoData);
		var self = this;
		var element = self.element;
		var opts = self.options;		
		//autoplay muted
		var videoElement = "<video class='video-player'  ></video>";
		var controls = "<div class='controls'>" +
							"<div class='play-pause'>" +
								"<i class='far fa-play-circle play'></i>" +
								"<i class='far fa-pause-circle pause'></i>" +
							"</div><div class='video-list' id='video__list'>" +
								"<i class='fas fa-th-list video-list-button'></i>" +
							"<div class='filters-panel filters-hide'>" +
								"<table class='table'>" +
									"<thead>" +
										"<tr>" +
											"<th class='id'>Id</th>" +
											"<th class='title'>Titolo</th>" +
											"<th class='path'>Percorso</th></tr>" +
									"</thead>" +
									"<tbody class='list'>" +
						"</tbody></table></div></div></div>";

		/*var tabella = document.getElementById('table');
		var row = tabella.insertRow(0)
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		cell1.innerHTML = videoData[0][4];
		cell2.innerHTML = videoData[0][5];*/

		var annotations = "<div class='annotations row'>" +
			
			"<div class='screen__container col-xs-2'><p>Inizio</p><div class='start__screen'><canvas width='100' height='100'></canvas></div><p class='timecode'>Istante<p></div>" +
			
			"<div class='time__bar col-xs-1'><div class='bar'></div></div>" +
			
			"<div class='screen__container col-xs-2'><p>Fine</p><div class='end__screen'><canvas width='100' height='100'></canvas></div><p class='timecode'>time<p></div>" + 
			
			"<div class='emotions__container col-xs-4'><div id='flat-slider-arousal'><div id='custom-handle-arousal' class='ui-slider-handle'></div><label>Coinvolgimento</label></div><div id='flat-slider-valence'><div id='custom-handle-valence' class='ui-slider-handle'></div><label>Positivit&agrave;</label></div></div>" +
			
			"<div class='button__container col-xs-2'><button class='btn btn-success btn-lg btn-block add_annotation'><i class='far fa-plus-square'></i></button></div>" +
			
			"</div>";
		var timeline = "<div class='timeline'><div class='timeline__drag'></div><span class='timeline__progress'></span></div>";
		
		element.append(videoElement);
//		element.append(toolsContainer)
		element.append(controls);
		element.append(annotations);
		element.append(timeline);
		
		//var filepath_selected_video = videoData.videos[0].path;
		var filepath_selected_video = videoData[0].uri;
		//var id_selected_video = videoData.videos[0].id
		var id_selected_video = videoData[0].id
		
		self.currentVideoId = id_selected_video;
		var videoSource = "<source src='../"+"frontend/" + filepath_selected_video + "' type='video/mp4'>";
		$('.video-player').append(videoSource);
		
		self.video = document.getElementsByTagName('video')[0],
    	self.timeline = document.getElementsByClassName('timeline')[0],
    	self.timelineProgress = document.getElementsByClassName('timeline__progress')[0],
    	self.drag = document.getElementsByClassName('timeline__drag')[0];
		self.play = document.getElementsByClassName('play')[0];
		self.pause = document.getElementsByClassName('pause')[0];
		self.startScreen = document.querySelector('.start__screen canvas');
		self.startScreenContext = self.startScreen.getContext('2d');
		self.endScreen = document.querySelector('.end__screen canvas');
		self.endScreenContext = self.endScreen.getContext('2d');
  		var currentShotValence = self.currentShotValence;
		var currentShotStart = self.currentShotStart;
		
		$('.filters-hide').hide();
		$('.video-list-button').on('click', function(){
  			$('.filters-panel').toggle('show');
		});
		
		
		$(self.startScreen).on('click', {screen: 1}, self.toggleCurrentScreen);
		$(self.endScreen).on('click', {screen: 2}, self.toggleCurrentScreen);
		$('.add_annotation').on(
			'click', 
			function(){
				self.addAnnotation(self.currentVideoId, self.currentShotStart, self. currentShotEnd, self.currentShotArousal, self.currentShotValence)
			}
		)
		self.selectCurrent();

		
		function vidUpdate(){
			TweenMax.set(
				self.timelineProgress, {
					scaleX: (self.video.currentTime / self.video.duration).toFixed(5)
				}
			);
		
			TweenMax.set(self.drag, {
				x: (self.video.currentTime / self.video.duration * self.timeline.offsetWidth).toFixed(4)
				}
			);
//			console.log("update");
		}
		
		self.video.onplay = function() {
			TweenMax.ticker.addEventListener('tick', vidUpdate);
		};

		self.video.onpause = function() {
			TweenMax.ticker.removeEventListener('tick', vidUpdate);
		};
		
		self.video.onended = function() {
			TweenMax.ticker.removeEventListener('tick', vidUpdate);
		};
		
		self.video.addEventListener('loadedmetadata', function() {
    		var ratio = self.video.videoWidth/self.video.videoHeight;
    		var w = self.video.videoWidth;
    		var h = parseInt(w/ratio,10);
			
			screenThumbWidth = 100;
			h = (screenThumbWidth * h) / w;
			w = screenThumbWidth;
			
    		$(self.startScreen).parents('.screen__container').width(w);
    		$(self.startScreen).parents('.screen__container').height(h);
			$(self.startScreen).parent().width(w);
			$(self.startScreen).parent().height(h);
			
			$(self.endScreen).parents('.screen__container').width(w);
    		$(self.endScreen).parents('.screen__container').height(h);
			$(self.endScreen).parent().width(w);
			$(self.endScreen).parent().height(h);
			
			self.snap(self.startScreenContext, self.startScreen, w, h)
  		},false);
		
		self.makeTimelineDraggable();
		self.play.addEventListener('click', self.togglePlay, false);
		self.pause.addEventListener('click', self.togglePlay, false);

	},
	
	toggleCurrentScreen : function(e) {
	  	console.log(e.data.screen);
		var selected = e.data.screen;
		if (selected != self.currentScreen){
			self.currentScreen = selected;
			self.selectCurrent(selected);
		}
 	},
		
	selectCurrent : function(){
		var self = this;
		if (self.currentScreen == 1) {
			$(self.startScreen).parent().css('borderColor', 'red');
			
			$(self.endScreen).parent().css('borderColor', '#636363');
		} else {
			$(self.startScreen).parent().css('borderColor', '#636363');
			$(self.endScreen).parent().css('borderColor', 'red');
			
			
		}
	},
		
	
 	togglePlay : function() {
	  	if (self.video.paused) {
			self.video.play();
			$(self.play).hide();
			$(self.pause).show();
	  	} else {
			self.video.pause();
			$(self.play).show();
			$(self.pause).hide();
	  	}
 	},
	
	snap : function(context, screen, w, h){
		var self = this;
	    screenThumbWidth = 100;
		h = (screenThumbWidth * h) / w;
		w = screenThumbWidth;
    	screen.width = w;
    	screen.height = h;
		
		
		context.fillRect(0,0,w,h);
    	context.drawImage(self.video,0,0,w,h);
		
		if (self.currentScreen == 1) {
			$(self.startScreen).parents('.screen__container').find('.timecode').text(self.video.currentTime);
			self.currentShotStart = self.video.currentTime;
		} else {
			$(self.endScreen).parents('.screen__container').find('.timecode').text(self.video.currentTime);
			self.currentShotEnd = self.video.currentTime;
		}
	},
	
	makeTimelineDraggable : function(){
		self = this;
		console.log("makeTimelineDraggable");
		Draggable.create(self.drag, {
  			type: 'x',
  			trigger: self.timeline,
  			bounds: self.timeline,
  			onPress: function(e) {
    			console.log("press");
				self.video.currentTime = this.x / this.maxX * self.video.duration;
					TweenMax.set(this.target, {
					  x: this.pointerX - self.timeline.getBoundingClientRect().left
					});
					this.update();
					var progress = this.x / self.timeline.offsetWidth;
					TweenMax.set(self.timelineProgress, {
					  scaleX: progress
					});
  			},
  			onDrag: function() {
    			console.log("drag");
				self.video.currentTime = this.x / this.maxX * self.video.duration;
    			var progress = this.x / self.timeline.offsetWidth;
    				TweenMax.set(self.timelineProgress, {
      				scaleX: progress
    			});
  			},
			onRelease: function(e) {
				var w,h,ratio;
				ratio = self.video.videoWidth/self.video.videoHeight;
    			w = self.video.videoWidth-100;
    			h = parseInt(w/ratio,10);
				if(self.currentScreen == 1) {
					self.snap(self.startScreenContext, self.startScreen, w, h)
				} else {
					self.snap(self.endScreenContext, self.endScreen, w, h)
				}
				
				e.preventDefault();
			}
		});
	},
	
	getVideoInfo: function() {
		var self = this;
		var opts = self.options;
		var sourceId = opts.sourceId;
		console.log ("LOLO");
		console.log(sourceId);
		self.getVideoDetail(sourceId);
	},
	
	getVideosList : function(){
		var self = this;
		$.getJSON(domain_root+'/api/shots', function (data) {

			self.parseVideosList(data.results);
		})

		/*var self = this;
		request_type = "load";
		var self = this;
		var request = $.ajax({
			url: 'server/',
			type: "POST",
			data: {"action" : request_type},
			dataType: "json",
		});
	 
		request.done(function(data) {
			self.parseVideosList(data);
		});
	 
		request.fail(
			function(jqXHR, textStatus) {
				alert( "Request failed: " + textStatus );
		});*/
	},
	
	parseVideosList : function(data) {
		console.log(data);
		console.log(data[0]);
		self = this;
		var options = {
  			valueNames: [ 'id', 'title', 'uri' ],
			item: '<tr class="video-item"><td class="id"></td><td class="title"></td><td class="uri"></td></tr>'
		};
		setTimeout(function(){
			self.videosList = new List('video__list', options, data);
			console.log("777");
			console.log(self.videosList);
			console.log("888");
			self.addVideosListCallbacks();
		}, 1000)
		
	},
	
	getVideoDetail(sourceId){
		var self = this;
		console.log(domain_root);
		$.getJSON(domain_root + '/api/shots?id='+sourceId, function (data) {
			self.parseVideoDetail(data.results);
		})

		/*request_type = "load";
		var self = this;
		var request = $.ajax({
			url: 'server/actions.php',
			type: "POST",
			data: {"action" : request_type, "sourceId" : sourceId},
			dataType: "json",
		});
	 
		request.done(function(data) {
			self.parseVideoDetail(data);
		});
	 
		request.fail(
			function(jqXHR, textStatus) {
				alert( "Request failed: " + textStatus );
		});*/
	},
	
	parseVideoDetail: function(data) {
		console.log("parseVideoInfo");
		console.log(data);
		
		this._loadPlayer(data);
		self._initializeAnnotations(data);
		self._initializeSliders();
	},
	
	errorVideoInfo: function(data) {
	},
	
	addAnnotation: function(video_id, start, end, arousal, valence)  {
//		var self = this;
//		console.log(self.currentShotStart)
//		console.log('ADD ANNOTATION');

//		var video_id = self.currentVideoId;
//		var start = self.currentShotStart;
//		var end = self.currentShotEnd;
//		var arousal = self.currentShotArousal;
//		var valence = self.currentShotValence;

		
		/*console.log("video_id: " + video_id);
		console.log("start: " + start);
		console.log("end: " + end);
		console.log("arousal: " + arousal);
		console.log("valence: " + valence);*/
		
		//if(video_id && (start >=0) && (end >=0) && arousal && valence) {
			console.log("video_id: " + video_id);
			console.log("start: " + start);
			console.log("end: " + end);
			console.log("arousal: " + arousal);
			console.log("valence: " + valence);
			var arousalValue;
			if (arousal < 4) {
				console.log("dentro")
				arousalValue = -1;
			} else if (arousal < 7) {
				arousalValue = 0;
			} else {
				arousalValue = 1;
			}

			var valenceValue;

			if (valence <4) {
				valenceValue = -1;
			} else if (valence <8) {
				valenceValue = 0;
			} else {
				valenceValue = 1;
			}
			self.saveAnnotation(video_id, start, end, arousalValue, valenceValue);
		/*} else {
			console.log("SOMETHING MISSING");
			console.log("video_id: " + video_id);
			console.log("start: " + start);
			console.log("end: " + end);
			console.log("arousal: " + arousal);
			console.log("valence: " + valence);
		}*/
	},
	
	saveAnnotation: function(videoId, start, end, arousal, valence){
		request_type = "insert";
		var self = this;

		var http = new XMLHttpRequest();
		var url = domain_root + '/api/shots/'+ videoId+'/';
		var params = 'arousal='+arousal+'&valence='+valence;
		http.open('PATCH', url, true);
		http.responseType='json';

		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		http.onreadystatechange = function() {
			if(http.readyState == 4 && http.status == 200) {
				self.parseAnnotation(http.response);
			}
		};
		http.send(params);
		/*var request = $.ajax({
			url: 'server/actions.php',
			type: "POST",
			data: {
				"action" : request_type,
				"videoId": videoId,
				"start": start,
				"end": end,
				"arousal": arousal,
				"valence": valence
			},
			dataType: "json",
		});*/


	 
		/*request.done(function(data) {
			self.parseAnnotation(data.results);
		});
	 
		request.fail(
			function(jqXHR, textStatus) {
				alert( "Request failed: " + textStatus );
		});*/
	},
	
	parseAnnotation: function(data){
		//console.log('parseAnnotation');
		//console.log(data);
		//console.log
		
		var annotation = data;

		self.annotationsList.clear();

		//console.log(self.annotationsList);
		
		self.annotationsList.add({
			id: annotation.id,
			videoId: annotation.video_id,
			start: annotation.start,
			end: annotation.end,
			arousal: annotation.arousal,
			valence: annotation.valence
		});
		
		self.annotationsList.sort('start', { order: "desc" });
		
	},
	
	deleteAnnotation: function(annotationId){

		var http = new XMLHttpRequest();
		var url = domain_root + '/api/shots/'+annotationId+'/';
		var params = 'arousal=&valence=';
		http.open('PATCH', url, true);
		http.responseType='json';

		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		http.onreadystatechange = function() {
			if(http.readyState == 4 && http.status == 200) {
				self.parseDeleteResponse(http.response);
			}
		};
		http.send(params);

		/*request_type = "delete";
		var self = this;
		var request = $.ajax({
			url: 'server/actions.php',
			type: "POST",
			data: {
				"action" : request_type,
				"annotationId": annotationId
			},
			dataType: "json",
		});
	 
		request.done(function(data) {
			self.parseDeleteResponse(data);
		});
	 
		request.fail(
			function(jqXHR, textStatus) {
				alert( "Request failed: " + textStatus );
		});*/
	},
	
	parseDeleteResponse: function(data){
		self = this;
		console.log('parseDeleteResponse');
		//console.log(data);
		//console.log(self.annotationsList)
		//if (data.deleted) {
		//var itemId = self.deleteTarget.closest('tr').find('.id').text();
		self.annotationsList.remove('id', data.id);
		//}
	},
	
	updateWidget : function(param, type) {
		var self = this;
		var opts = self.options;
		
		this._destroy();
		switch (type) {
			
			case "sourceId":
				opts.sourceId = param;
			break;
		}
		self._create();
	},
	
});

$.extend( $.ui.videocomponent, { version: "@VERSION" })

})( jQuery )
