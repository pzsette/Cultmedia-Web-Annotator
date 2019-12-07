//
// $(document).ready(function() {
// new Awesomplete('input[data-multiple]', {
// 	filter: function(text, input) {
// 		return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
// 	},
//
// 	item: function(text, input) {
// 		return Awesomplete.ITEM(text, input.match(/[^,]*$/)[0]);
// 	},
//
// 	replace: function(text) {
// 		var before = this.input.value.match(/^.+,\s*|/)[0];
// 		this.input.value = before + text + ", ";
// 	}
// });
// });

$(document).ready(function() {

    var domain = domain_root + full_path;

    var ajax = new XMLHttpRequest();
    ajax.open("GET", domain_root + "/api/get_keywords", true);
    ajax.onload = function() {
        var list = JSON.parse(ajax.responseText).map(function(i) { return i; });
        new Awesomplete('input[data-multiple]', {
        list: list,
        filter: function(text, input) {
            return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
        },

        item: function(text, input) {
            return Awesomplete.ITEM(text, input.match(/[^,]*$/)[0]);
        },

        replace: function(text) {
            var before = this.input.value.match(/^.+,\s*|/)[0];
            this.input.value = before + text + ", ";
        },

    });
    };
    ajax.send();

});