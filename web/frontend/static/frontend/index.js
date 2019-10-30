$(document).ready(function() {

    console.log("full_path: " + full_path)
    console.log("domain_root: " + domain_root)

    var domain = domain_root + full_path;

    function load(url) {
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
    }

    function createEmptyTimeline(num){
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

    createEmptyTimeline(50);

    load(domain_root + '/api/shots');

    /*$("#search").keyup(function () {
        load(domain_root + '/api/shots?q=' +  $("#search").val() +'&mood=' + $("#mood").val());
    });*/

    /*$("#awesomplete-search").keyup(function () {
        load(domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&mood=' + $("#mood").val());
    });*/

    $("#awesomplete-search").keyup(function () {
        load(domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() + getMoodQueryset());
        console.log(domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() + getMoodQueryset())
    });

    $("#awesomplete-search").on('awesomplete-selectcomplete',function(){
        load(domain_root + '/api/shots?q=' +  this.value +'&mood=' + getMoodQueryset());
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
                parameters.innerHTML = '<p id="pzp">Hedonic Tone</p> <div class="itemspace"> <label id="pzlabel"><input id="HTCRange" type="range" min="0" max="1" step="0.1" value="0.5">Colourfulness: <span id="HTCValue"></span></label> </div> <div class="itemspace"> <label id="pzlabel"><input id="pzcheckbox" name="DNCheckbox" type="checkbox"><br>Day/Night</label> </div> <div class="itemspace"> <select id="pzselect"><option value="0" selected>No Mood</option> <option value="1" class="others">Happy</option> <option value="2" class="others">Neutral</option> <option value="3" class="others">Sad</option> </select></div>'
                var HTCslider = document.getElementById("HTCRange");
                var HTCoutput = document.getElementById("HTCValue");
                HTCoutput.innerHTML = HTCslider.value;
                HTCslider.oninput = function() {
                HTCoutput.innerHTML = this.value;
                };

                $("#pzselect").change(function() {
                    load(domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&mood=' + $("#pzselect").val());
                    console.log(domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&mood=' + $("#pzselect").val());
                });

                break;
            case "2":
                console.log("secondo filtro");
                mainDiv[0].style.display="block";
                parameters.innerHTML = '<p id="pzp">Energetic Arousal</p>\n' +
                    '\n' +
                    '        <div class="itemspace">\n' +
                    '        <label><input id="pzcheckbox" name="DNCheckbox" type="checkbox" align=""><br>Day/Night</label>\n' +
                    '        </div>\n' +
                    '\n' +
                    '        <div class="itemspace">\n' +
                    '        <label><input id="pzcheckbox" name="IOCheckbox" type="checkbox" align=""><br>Indoor/Outdoor</label>\n' +
                    '        </div>\n' +
                    '\n' +
                    '        <div class="itemspace">\n' +
                    '          <label><input id="EAPRange" type="range" min="0" max="1" step="0.1" value="0.5">Pixel Motion: <span id="EAPValue"></span></label>\n' +
                    '        </div>\n' +
                    '\n' +
                    '        <div class="itemspace">\n' +
                    '          <label><input id="EADRange" type="range" min="10" max="120" step="10" value="20">Max Shot Duration: <span id="EADValue"></span></label>\n' +
                    '        </div>\n' +
                    '\n' +
                    '        <div class="itemspace">\n' +
                    '          <label><input id="EALRange" type="range" min="0" max="1" step="0.1" value="0.5">Loudness: <span id="EALValue"></span></label>\n' +
                    '        </div>\n' +
                    '\n' +
                    '        <div class="itemspace">\n' +
                    '        <label><input id="pzcheckbox" name="DCheckbox" type="checkbox" align=""><br>Dialogue/Not Dialogue</label>\n' +
                    '        </div>'
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

                $('[name="IOCheckbox"]').change(function () {
                    if(this.checked) {
                        load(domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&indoor=True');
                        console.log(domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&indoor=True')
                    } else {
                        load(domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&indoor=False');
                        console.log(domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&indoor=False')
                    }
                });
                break;
            case "3":
                console.log("terzo filtro");
                mainDiv[0].style.display="block";
                parameters.innerHTML = '<p id="pzp">Tense Arousal</p>\n' +
                    '\n' +
                    '        <div class="itemspace">\n' +
                    '        <label><input id="pzcheckbox" name="NHFCheckbox" type="checkbox" align=""><br>No happy Faces</label>\n' +
                    '        </div>\n' +
                    '\n' +
                    '        <div class="itemspace">\n' +
                    '          <select id="pzselect">\n' +
                    '            <option value="0" selected>No mood</option>\n' +
                    '            <option value="1">Happy</option>\n' +
                    '            <option value="2">Neutral</option>\n' +
                    '            <option value="3">Sad</option>\n' +
                    '          </select>\n' +
                    '        </div>'

                $("#pzselect").change(function() {
                    load(domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&mood=' + $("#pzselect").val());
                    console.log(domain_root + '/api/shots?q=' +  $("#awesomplete-search").val() +'&mood=' + $("#pzselect").val());
                });

                break;
            case "0":
                mainDiv[0].style.display="none";
                console.log("no filtro");
                break;
        }
    });

    $("#download").click(function(){
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
    })

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

function drop(ev) {
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
}

function dragend(ev){
    if(ev.dataTransfer.dropEffect=== 'none' && ev.target.id.endsWith('_timeline')){
        ev.target.parentElement.removeChild(ev.target.parentElement.childNodes[0]);
    }
}

function getMoodQueryset() {
    console.log("inside getMoodQueryset");
    filterType = $("#mood-filter").val();
    console.log(filterType);
    switch (filterType) {
        case "0":
            console.log("inside case 0");
          return '';
        case "1":
            console.log("inside case 1");
            moodValue = $('#pzselect').val();
            moodQueryString = "&mood="+moodValue;
            return moodQueryString;
        case "2":
            console.log("inside case 2");
            indoorValue = $('[name="IOCheckbox"]').val();
            return "&indoor="+indoorValue;
        case "3":
            console.log("inside case 3");
            moodValue = $('#pzselect').val();
            moodQueryString = "&mood="+moodValue;
            return moodQueryString;
    }
}
