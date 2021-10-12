/**
 * Choc @UI Module
 * @namespace Choc
 */

(function(){

    /**
     * @UI module (appending to Choc general object)
     */
    $.extend(Choc, {
        _auditPaging: new Choc.Pagination({
            container: "#audit-pager2 .pager",
            every: function(){
                Choc._auditPage = this.page;
                this.elements = 8;
                Choc._searchAudit(null, false);
            }
        }),
        // audit page
        _auditPage: 0,
        // get audit
        _searchAudit: function(event, reset){
            if(event!=null && event.keyCode!=13)return;
            if(reset){
                Choc._auditRegPage = 0;
            }
            var mode = $("#audit-mode").dropdown("get value"),
                q = $("#audit-filter").val();


            Choc.audits({
                mode: mode,
                q: q,
                page: Choc._auditPage,
                callback: function(res){
                    var auditUl = $("#audit-results"),
                        auditPager = $("#audit-pager");
                    auditPager.removeClass("hide");
                    if(res.audits.length>0){
                        auditUl.empty();
                        for(var a in res.audits){
                            var audit = res.audits[a],
                                html = "";
                            if(mode=="tit"){
                                html += Choc._drawTitItem(audit);
                            } else if(mode=="doc"){
                                html += Choc._drawDocItem(audit);
                            }
                            auditUl.append(html);
                        }
                    } else {
                        if(Choc._auditPage==0){
                            auditUl.empty();
                            auditUl.append("<div class='item'>Nessun risultato...</div>");
                            $("#audit-pager").addClass("hide");
                        } else {
                            Choc._auditPage--;
                        }
                    }
                    Choc._auditPaging.total = res.totalElements;
                    Choc._auditPaging.update();
                }
            });
        },
        // show prev result page
        _auditPrev: function(){
            if(Choc._auditPage>0){
                Choc._auditPage--;
                Choc._searchAudit(null, false);
            }
        },
        // show next result page
        _auditNext: function(){
            Choc._auditPage++;
            Choc._searchAudit(null, false);
        },
        // draw reg row
        _drawTitItem: function(audit){
            var type = audit.type.split(":")[1], color = "black",
                html = "<div class='item cursor pointer type-"+type+"' onclick='Choc._showAudit(this, \"tit\");' data-noderef='"+audit.noderef+"'>";
            if(type=="fascicolo"){
                color = "brown";
            } else if(type=="classe"){
                color = "olive";
            } else if(type=="titolo"){
                color = "teal";
            }
            html += "<i class='"+color +" icon open folder'></i><div class='content'>"+audit.name+" ("+type+")";
            html += "</div></div>";
            return html;
        },
        // draw doc row
        _drawDocItem: function(audit){
            var html = "<div class='item' onclick='Choc._showAudit(this, \"doc\");' data-noderef='"+audit.noderef+"'>";
            html += "<i class='icon file'></i><div class='content'>"+audit.name+"</div></div>";
            return html;
        },
        // show audit detail
        _showAudit: function(el, mode){
            el = $(el);
            var noderef = el.data("noderef");
            $("#audit-results .item.active").removeClass("active");
            el.addClass("active");
            Choc.audit(noderef, function(res){
                var feedEl = $("#audit-feed");
                feedEl.html(Choc._render(Choc.mustache_url+"audit.list.ejs", {
                    events: res.events
                }));
            });
        }
    });

})();
