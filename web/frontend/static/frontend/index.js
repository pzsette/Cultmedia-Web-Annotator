
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
        document.getElementById("loading").classList.remove("disappeared");
        document.getElementById("download").innerHTML = '<i class="fa fa-download"></i> RENDERING...';
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
            document.getElementById("loading").classList.add("disappeared");
            document.getElementById("download").innerHTML = '<i class="fa fa-download"></i> DOWNLOAD';
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
          //req.open("GET", domain + "videoferracani/video.zip", true);
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

        }})

        /*var matrix = [];
        for(var i=0; i<final.length; i++) {
            matrix[i] = new Array(2);
        }

        for(var i=0; i<matrix.length; i++) {
            matrix[i][0] = final[i];
            matrix[i][1] = i;
        }

        console.log(matrix);
        downloadCSV(matrix);*/

    })

});

function downloadCSV(args) {
        var data, filename, link;
        var csv = convertArrayOfObjectsToCSV(args);
        console.log("Hereee");
        console.log(csv);
        if (csv == null) return;

        filename = args.filename || 'export.csv';

        if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        data = encodeURI(csv);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
}

function convertArrayOfObjectsToCSV(args) {
        var result, ctr, keys, columnDelimiter, lineDelimiter, data;
        console.log("mmmm");
        //console.log(args.data);

        data = args || null;
        if (data == null || !data.length) {
            console.log("bhabahabah");
            return null;
        }

        columnDelimiter = args.columnDelimiter || ',';
        lineDelimiter = args.lineDelimiter || '\n';

        keys = Object.keys(data[0]);

        result = '';
        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        data.forEach(function(item) {
            ctr = 0;
            keys.forEach(function(key) {
                if (ctr > 0) result += columnDelimiter;

                result += item[key];
                ctr++;
            });
            result += lineDelimiter;
        });

        return result;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

// function drop(ev) {
//     ev.preventDefault();
//     var data = ev.dataTransfer.getData("text");
//     var nodeCopy = document.getElementById(data).cloneNode(true);
//     nodeCopy.id = data + "_timeline";
//     if(ev.target.nodeName=== "IMG"){
//         ev.target.parentElement.appendChild(nodeCopy);
//         ev.target.parentElement.removeChild(ev.target.parentElement.childNodes[0]);
//     } else {
//         ev.target.appendChild(nodeCopy);
//     }
//
// }

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
