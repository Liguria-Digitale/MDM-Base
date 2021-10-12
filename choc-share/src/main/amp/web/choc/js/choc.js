/**
 * Choc generic Module
 * @namespace Choc
*/

(function(){
	
Choc = {
    // version
    version: null,
    // constants
    alf_url: location.context + "/proxy/alfresco/",
    choc_url: location.context + "/proxy/alfresco/choc/",
    doclib_url: location.context + "/proxy/alfresco/slingshot/doclib/",
    doclib2_url: location.context + "/proxy/alfresco/slingshot/doclib2/",
    mustache_url: location.context + "/res/choc/mustache/",
    mustache_picker_url: location.context + "/res/choc/mustache/pickers/",
    page: null,
    site: null,
    title: null,
    node: null,
    // user id and permissions
    user: {
        id: null
    },
    // mimetypes
    mime: {
        // immagini
        JPG: "image/jpeg", JPEG: "image/jpeg",
        GIF: "image/gif",
        TIF: "image/tiff", TIFF: "image/tiff",
        PNG: "image/png",
        BMP: "image/bmp",
        // documenti
        TXT: "text/plain", TEXT: "text/plain",
        HTM: "text/html", HTML: "text/html",
        XML: "text/xml",
        PDF: "application/pdf",
        // altri
        PKCS7: "application/pkcs7",
        ZIP: "application/zip",
        // microsoft office
        DOC: "application/msword",
        DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        XLS: "application/vnd.ms-excel",
        XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        PPT: "application/vnd.ms-powerpoint",
        PPTX: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    },
    // audit types
    auditsConst: {
        document: "DOCUMENTO",
        tit: "TITOLARIO"
    },
    // show or hide a link to alfresco share
    enableShare: true,
    // is ie9 or minor
    ie9: false,
    // docs and folder aspect meta/indicators
    /**
     * how to use: for each aspect you can create a function
     * to return an html element
     * Cut & paste example:
     *        "some:aspect": function(node){
	 * 			return "<i class='icon help'>Help</i>";
	 * 		}
     */
    meta: {},
    indicators: {},
    // docs and folder types
    /**
     * properties structure:
     *    name: short qname of properties
     *    type: type of properties (input, checkbox, date, password, etc...)
     *    title: display name of properties
     *    rules: rules for form validation
     *    form: name of form where properties is visible (create, edit, or custom name form)
     */
    types: {},
    // array for specialize doc (with aspect) after upload
    uploadAspects: [],
    // mandatory init function to call every page
    init: function (settings) {
        // set site and page
        Choc.site = settings.site;
        Choc.page = settings.page;
        // set user id and permissions
        Choc.user.id = settings.user;
        Choc.user.fullname = settings.fullname;
        Choc.version = settings.version;
        // setup i18next
        i18next.init({
            lng: settings.locale,
            lowerCaseLng: true,
            fallbackLng: "it",
            resources: settings.i18n
        });
        jqueryI18next.init(i18next, $);
        $(document).ready(function () {
            // add class to autogenerate share div
            $(".choc-container").parents("div[id^='page_']").addClass("share-div");
            // translate static text
            $("body").localize();
            // setup left menu
            if (Choc.site) {
                $("body > .ui.sidebar").sidebar({
                    transition: "overlay",
                    mobileTransition: "overlay",
                    dimPage: false,
                    scrollLock: true
                });
                // set header text and (if in site) user id and permissions
                $(".choc-sitemenu-header").html("<div class='section'>" + Choc.site + "</div><i class='right caret icon divider'></i><div class='section'>" + $("div.choc-" + Choc.page).data("title") + "</div>");
            } else {
                $(".choc-sitemenu-header").html("<div class='section'>" + $("div.choc-" + Choc.page).data("title") + "</div>");
            }
            // setup semantic
            $.fn.dropdown.settings.message.addResult = '<i class="icon plus"></i><b>{term}</b>';
            // ie9 fix
            if (Choc.ie9) {
                $.easing.easeOutQuint = $.easing.swing;
                $.fn.dropdown.settings.transition = "none";
            }
            // setup toastr
            toastr.options = {
                "closeButton": true,
                "timeOut": "3000"
            }
            // setup blockui
            $.blockUI.defaults.css.border = "none";
            $.blockUI.defaults.css.backgroundColor = "none";
            $.blockUI.defaults.css.color = "#000";
            $.blockUI.defaults.message = "<i class='big spinner loading icon'></i>";
            $.blockUI.defaults.overlayCSS.opacity = 0.1;
            $.blockUI.defaults.overlayCSS.backgroundColor = "rgba(255, 255, 255, 0.1)";
            $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI).ajaxError(function(scope, jqXHR){
                $.unblockUI();
                if(jqXHR.status==401){
                    location.href = location.context;
                }
            });
            // add button to menu if enable share
            if (Choc.enableShare) {
                $(".enable-share-link").removeClass("hide");
            }
            // init menu dropdown
            $(".user_sub_container .ui.dropdown").dropdown();

            if (Choc.site) {
                Choc.Org.getAoos(function (res) {
                    for (var cOao in res){
                        if (res[cOao].shortName == Choc.site){
                            Choc.node = res[cOao].noderef.replace("workspace/SpacesStore", "workspace://SpacesStore");
                        }
                    }
                });
            }
        });
    },
    // logout function
    logout: function () {
        var redirectFn = function () {
            location.href = location.context;
        }
        $.ajax({
            type: "POST",
            url: location.context + "/page/dologout",
            success: redirectFn,
            error: redirectFn
        });
    },
    alert: function (message, type, onclose, timeout) {
        toastr[type == "danger" ? "error" : (type || "success")](message, null, {
            timeOut: timeout || "5000",
            onHidden: function () {
                if (onclose) {
                    onclose();
                }
            }
        });
    },
    // function for alert with time
    poptime: function (message, type) {
        toastr[type == "danger" ? "error" : (type || "success")](message);
    },
    // modal confirm
    confirm: function (config) {
        $(".ui.modals").remove();
        var html = "<div class='ui "+(config.fullscreen?"fullscreen":"small")+" modal'><i class='close icon'></i>";
        html += "<div class='content'><div class='description'>" + config.message + "</div></div>";
        if (!config.hideButtons) {
            html += "<div class='actions'><div class='ui icon negative button'><i class='icon remove'></i></div>";
            html += "<div class='ui icon positive button'><i class='icon check'></i></div></div></div>";
        }
        $(html).modal({
            onDeny: config.deny || $.noop,
            onApprove: config.approve || $.noop,
            transition: "fade",
            duration: 200
        }).modal("show");
    },
    // function for format iso date (like 2014-01-07T09:52:36.830Z )
    formatIsoDate: function (isodate) {
        return moment(isodate.iso8601).format("DD/MM/YYYY HH:mm");
    },
    // like formatIsoDate
    formatIsoDateWithoutHour: function (isodate) {
        return moment(isodate.iso8601).format("DD/MM/YYYY");
    },
    // parse dd/mm/yyyy to iso date
    parseDateToIso: function (value) {
        return moment.utc(value, "D/M/YYYY", true).toISOString();
    },
    // parse dd/mm/yyyy hh:mm to iso date
    parseDatetimeToIso: function (value) {
        return moment.utc(value, "D/M/YYYY HH:mm", true).toISOString();
    },
    // function for format bytes size
    bytesToSize: function (bytes) {
        if (bytes <= 0) return '0 Byte';
        var k = 1024;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },
    // escape apice
    escapeSingleQuote: function(text){
    	return text.replace(/'/g,"\\\'");
    },
    /**
     * Implement Luhn validation algorithm
     * @see http://en.wikipedia.org/wiki/Luhn
     */
    luhn: function (value) {
        var length = value.length,
            mul = 0,
            prodArr = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]],
            sum = 0;
        while (length--) {
            sum += prodArr[mul][parseInt(value.charAt(length), 10)];
            mul ^= 1;
        }
        return (sum % 10 === 0 && sum > 0);
    },
    /**
     * int number to roman number from 1 to 100
     */
    intToRoman: function (value) {
        if (value) {
            if (typeof value != "number") {
                value = parseInt(value);
                if (isNaN(value)) {
                    return "";
                }
            }
            if (value < 1 || value > 3999) return "";
            var s = "";
            while (value >= 1000) {
                s += "M";
                value -= 1000;
            }
            while (value >= 900) {
                s += "CM";
                value -= 900;
            }
            while (value >= 500) {
                s += "D";
                value -= 500;
            }
            while (value >= 100) {
                s += "C";
                value -= 100;
            }
            while (value >= 90) {
                s += "XC";
                value -= 90;
            }
            while (value >= 50) {
                s += "L";
                value -= 50;
            }
            while (value >= 40) {
                s += "XL";
                value -= 40;
            }
            while (value >= 10) {
                s += "X";
                value -= 10;
            }
            while (value >= 9) {
                s += "IX";
                value -= 9;
            }
            while (value >= 5) {
                s += "V";
                value -= 5;
            }
            while (value >= 4) {
                s += "IV";
                value -= 4;
            }
            while (value >= 1) {
                s += "I";
                value -= 1;
            }
            return s;
        } else return "";
    },
    insertAudit: function(config){
        if(!config.params){
            config.params = {}
        }
        if(!config.paramsstring){
            config.paramsstring = {}
        }
        $.ajax({
            type: "POST",
            url: Choc.choc_url+"audit/insert",
            data: JSON.stringify(config),
            contentType: "application/json",
            datatype: "json"
        });
    },
    // search audits by mode and query
    audits: function(config){
        $.getJSON(Choc.choc_url+"reg/audit/search?mode="+config.mode+"&q="+config.q+"&page="+config.page+"&site="+Choc.site, config.callback);
    },
    // get specified audit for noderef
    audit: function(noderef, callback){
        $.getJSON(Choc.choc_url+"reg/audit/get?noderef="+noderef, callback);
    }
}
	
})();
