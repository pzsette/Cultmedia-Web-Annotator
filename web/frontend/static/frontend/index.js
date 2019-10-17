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
                //var title = data[i].title;
                //console.log(data);
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

    $("#search").keyup(function () {
        load(domain_root + '/api/shots?q=' +  $("#search").val() +'&mood=' + $("#mood").val());
    });

    $("#mood").change(function () {
        load(domain_root + '/api/shots?q=' +  $("#search").val() +'&mood=' + $("#mood").val());
    });

    $("#download").click(function(){
        var dwnButton = document.getElementById("download");
        dwnButton.classList.add("dots");
        dwnButton.innerHTML = '<i class="fas fa-file-download"></i>  DOWNLOAD <span>.</span><span>.</span><span>.</span>';
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
