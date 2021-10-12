/**
 * Choc @Types Module
 * @namespace Choc.*
*/
(function(){
	
/**
 * @Types module
 */

    $.extend(Choc.types, {
        "doc:base": {
            name: "Documento Base",
            props: [
                {name:"doc:oggetto",type:"input",title:"Oggetto del documento",form:["edit"]},
                {name:"doc:soggetto",type:"input",title:"Denominazione Soggetto",rules:["mandatory"],help:"Specificare nome e cognome oppure ragione sociale",form:["edit"]},
                {name:"doc:soggettoId",type:"input",title:"CF/PIVA Soggetto",rules:["mandatory"],form:["edit"]},
                {name:"doc:destinatario",type:"input",title:"Denominazione Destinatario",help:"Specificare nome e cognome oppure ragione sociale",form:["edit"]},
                {name:"doc:destinatarioId",type:"input",title:"CF/PIVA Destinatario",form:["edit"]}
            ]
        }
    });
    $.extend(Choc.types, {
        "doc:generic": {
            name: "Documento Generico",
            props: $.merge($.merge([],Choc.types["doc:base"].props),[]),
            search: true,
            conservable: true,
            isDoc: true
        },
        "tit:titolo":{
            name: "Titolo",
            props: [
                {name:"cm:name",type:"input",title:"Nome",rules:["mandatory"],form:["create","edit"]},
                {name:"tit:baseFolderNumber",type:"input",rules:["mandatory","range[0-3999]"],title:"Numero",form:["create","edit"],change:Choc.Docs.setRomanNumberField,help:"Deve essere inserito un numero da 0 a 3999. Se inserisci lo 0, il numero romano non sarà calcolato"},
                {name:"tit:titoloNumeroRomano",type:"input",title:"Numero Romano",form:["create","edit"],readonly:true,help:"Il numero sarà automaticamente calcolato a partire dal numero intero" }
            ]
        },
        // classe del titolario
        "tit:classe":{
            name: "Classe",
            props: [
                {name:"cm:name",type:"input",title:"Nome",rules:["mandatory"],form:["create","edit"]},
                {name:"tit:baseFolderNumber",type:"input",title:"Numero",rules:["mandatory","integer"],form:["create","edit"]}
            ]
        },
        // fascicolo del titolario
        "tit:fascicolo":{
            name: "Fascicolo",
            props: [
                {name:"cm:name", type: "input", title: "Oggetto", rules: ["mandatory"], form: ["create", "edit", "search"]},
                {name:"tit:baseFolderNumber",type: "input",title: "Numero",rules: ["integer"],form: ["create", "edit", "search"],help: "Se non viene inserito o se esiste già, verrà generato automaticamente. Se si sta creando un fascicolo su una persona fisica o giuridica, si dovrebbe specificare il numero di matricola o un ID univoco."},
                {name:"tit:fascicoloUfficio", type: "putcode", title: "Responsabile del fascicolo",form: ["create", "edit", "search"], code: function (p) {
                    return Choc.types["tit:fascicolo"].fn.codeResponsabile(p);
                }},
                {name:"tit:fascicoloTipo",type: "select",title: "Tipologia",choices: "affari,procedimenti,materia,persone",form: ["create", "edit", "search"]},
                {name:"tit:fascicoloAnnuale",type:"checkbox",title:"Annuale",form:["create", "edit", "search"]},
                {name:"tit:fascicoloNote",type:"textarea",title:"Note",form:["create","edit", "search"]},
                {name:"tit:fascicoloStato", type: "select", choices: "aperto|Aperto,chiuso|Chiuso", title: "Stato", form: ["search"]},
                {name:"tit:fascicoloDataChiusura",type:"date",title:"Data chiusura", form: ["search"]}
            ],
            search: true,
            fn: {
                codeResponsabile: function (propName) {
                    var html = "<div class='ui right labeled input'>";
                    html += "<input type='text' name='"+propName+"' placeholder='Ufficio o persona responsabile...'>";
                    html += "<a class='ui basic label' onclick='Choc.types[\"tit:fascicolo\"].fn.selectResp(this)'><i class='icon sitemap' style='margin-right: 0'></i></a>";
                    html += "</div>";
                    return html;
                },
                selectResp: function (el) {
                    var inputEl = $(el).prev();
                    Choc.Picker.searchUsers({
                        multiple: true,
                        uo: true,
                        callback: function(results){
                            if(results.length>0){
                                inputEl.val($.map(results, function (n, i) {
                                    return n.name;
                                }).join(", "));
                            }
                        }
                    });
                }
            }
        },
        // cartella generica
        "cm:folder":{
            name: "Cartella",
            props: [
                {name:"cm:name",type:"input",title:"Nome",rules:["mandatory"],form:["create","edit"]}
            ]
        },
        // documento generico
        "cm:content":{
            name: "Documento",
            props: [
                {name:"cm:name",type:"input",title:"Nome",rules:["mandatory"],form:["edit","editdescription"]},
                {name:"cm:description",type:"input",title:"Descrizione",form:["editdescription", "editonlydescription"]}
            ]
        },
        // utente
        "cm:person":{
            name: "Utente",
            props: [
                {name:"name",type:"input",title:"Nome",rules:["mandatory"],form:["create","edit"]},
                {name:"surname",type:"input",title:"Cognome",rules:["mandatory"],form:["create","edit"]},
                {name:"user",type:"input",title:"Username",rules:["mandatory"],form:["create"]},
                {name:"pass",type:"password",title:"Password",rules:["mandatory","length[3]"],form:["create","password"]},
                {name:"pass2",type:"password",title:"Conferma Password",rules:["mandatory","length[3]"],form:["password"]},
                {name:"email",type:"input",title:"Email",rules:["mandatory","email"],form:["create","edit"]}
            ]
        }
    });
})();
