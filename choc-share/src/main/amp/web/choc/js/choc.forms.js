/**
 * Choc @Forms Module
 * @namespace Choc.*
*/
(function(){

/**
 * Choc modules
 * @Forms module
 */
Choc.Forms = {
	// list of type drawers
	drawer: {
		"input": function(prop, propName, fieldEl){
			if(prop.help){
				fieldEl.append("<label>"+prop.title+"</label><div class='ui icon input'><input type='text' aria-label='"+prop.title+"' placeholder='"+prop.title+"' name='"+propName+"' "+(prop.readonly?"readonly=''":"")+">"+
						"<i class='help icon' data-content='"+prop.help.replace(/'/g,"&#39;")+"'></i></div>");
			} else {
				fieldEl.append("<label>"+prop.title+"</label><input type='text' name='"+propName+"' aria-label='"+prop.title+"' placeholder='"+prop.title+"'"+(prop.readonly?"readonly=''":"")+">");
			}
			if(prop.change){
				fieldEl.change(prop.change);
			}
		},
		"textarea": function(prop, propName, fieldEl){
			if(prop.help){
				fieldEl.append("<label>"+prop.title+"</label><div class='ui icon input'><textarea aria-label='"+prop.title+"'  name='"+propName+"'></textarea>"
						+"<div class='ui corner label'><i class='help icon' data-content='"+prop.help.replace(/'/g,"&#39;")+"'></i></div></div>");
			} else {
				fieldEl.append("<label>"+prop.title+"</label><textarea aria-label='"+prop.title+"' rows='"+(prop.rows || 2)+"' name='"+propName+"'></textarea>");
			}
		},
		"view": function(prop, propName, fieldEl){
			fieldEl.append("<label>"+prop.title+"</label><div class='ui view list' style='margin-top:0' name='"+propName+"'></div>");
		},
		"checkbox": function(prop, propName, fieldEl){
			fieldEl.append("<div class='ui checkbox'><input type='checkbox' aria-label='"+prop.title+"' name='"+propName+"'"+(prop.checked?" checked='checked'":"")+"><label>"+prop.title+
            	(prop.help?" <i class='circular help icon' data-content='"+prop.help.replace(/'/g,"&#39;")+"'></i>":"")+"</label></div>");
			fieldEl.find('.ui.checkbox').checkbox({
				onChange: prop.change || $.noop
			});
		},
		"password": function(prop, propName, fieldEl){
			fieldEl.append("<label>"+prop.title+"</label><input type='password' name='"+propName+"'>");
		},
		"date": function(prop, propName, fieldEl){
		    if (fieldEl.data('search')){
		        fieldEl.removeClass('field').addClass('two fields');
                if(prop.help){
                    fieldEl.append("<div class='field'><label>"+prop.title+" da</label><div class='ui icon input'><input type='text' placeholder='"+prop.title+"' name='"+propName+"--from' autocomplete='off'>"+
                        "<i class='help icon' data-content='"+prop.help.replace(/'/g,"&#39;")+"'></i></div></div>");
                    fieldEl.append("<div class='field'> <label>"+prop.title+" a</label><div class='ui icon input'><input type='text' placeholder='"+prop.title+"' name='"+propName+"--to' autocomplete='off'>"+
                        "<i class='help icon' data-content='"+prop.help.replace(/'/g,"&#39;")+"'></i></div></div>");
                } else {
                    fieldEl.append("<div class='field'> <label>"+prop.title+" da</label><input type='text' placeholder='"+prop.title+"' aria-label='"+prop.title+" da' name='"+propName+"--from' autocomplete='off'></div>");
                    fieldEl.append("<div class='field'> <label>"+prop.title+" a</label><input type='text' placeholder='"+prop.title+"' aria-label='"+prop.title+" a' name='"+propName+"--to' autocomplete='off'></div>");
                }
            } else {
                if(prop.help){
                    fieldEl.append("<label>"+prop.title+"</label><div class='ui icon input'><input type='text' placeholder='"+prop.title+"' name='"+propName+"' autocomplete='off'>"+
                        "<i class='help icon' data-content='"+prop.help.replace(/'/g,"&#39;")+"'></i></div>");
                } else {
                    fieldEl.append("<label>"+prop.title+"</label><input type='text' placeholder='"+prop.title+"' aria-label='"+prop.title+"' name='"+propName+"' autocomplete='off'>");
                }
            }
			var isDatetime = $.inArray("datetime", prop.rules) > -1;
			fieldEl.find("input").datetimepicker({
				pickTime: isDatetime,
				sideBySide: isDatetime,
				useCurrent: false,
				language:'it'
			}).on("dp.change", prop.change || $.noop);
		},
		"select": function(prop, propName, fieldEl){
			var html = "<label>"+prop.title+(prop.help?" <i class='circular help icon' data-content='"+prop.help.replace(/'/g,"&#39;")+"'></i>":"");
			html += "</label><div class='ui search selection "+(prop.multiple?"multiple ":"")+"dropdown'>";
			html += "<input type='hidden' name='"+propName+"'"+(prop.value?" value='"+prop.value+"'":"")+">";
			html += "<div class='default text'>Seleziona \""+prop.title+"\"</div><i class='dropdown icon'></i><div class='menu'></div></div>";
			fieldEl.append(html);
			var drawChoices = function(choices, el){
				var choicesHtml = "";
				for(var c in choices){
					var choice = choices[c];
					var optionName, optionValue, optionTitle;
					if(choice.indexOf("|")>-1){
						var options = choice.split("|");
						optionValue = options[0];
						optionName = options[1];
						if (options.length = 3){
							optionTitle = options[2];
						}
					} else {
						optionValue = choice;
						optionName = choice;
					}
					if(optionValue) {
						choicesHtml += "<div class='item' data-value='" + optionValue + "'";
						if (optionTitle) {
							choicesHtml += " title='" + optionTitle + "'";
						}
						choicesHtml += ">" + optionName + "</div>";
					}
				}
				el.find(".ui.dropdown .menu").append(choicesHtml);
				el.find(".ui.dropdown").dropdown({
					action: prop.action || "activate",
					onChange: prop.change || $.noop,
					allowAdditions: prop.add || false,
                    fullTextSearch: prop.fullText || false
				});
			}
			if($.isFunction(prop.choices)){
				prop.choices(drawChoices, fieldEl);
			} else {
				drawChoices(prop.choices.split(","), fieldEl);
			}
		},
		"search": function(prop, propName, fieldEl){
			var html = "<label>"+prop.title+(prop.help?" <i class='circular help icon' data-content='"+prop.help.replace(/'/g,"&#39;")+"'></i>":"");
			html += "</label><div class='ui search fluid'>";
			html += "<input class='prompt' type='text' name='"+propName+"' aria-label='"+prop.title+"'><div class='results'></div></div>";
			fieldEl.append(html);
			fieldEl.find(".ui.search").search(prop.search());
		},
		"assoc": function(prop, propName, fieldEl){
			var html = "<label>"+prop.title+(prop.help?" <i class='circular help icon' data-content='"+prop.help.replace(/'/g,"&#39;")+"'></i>":"");
			html += "</label>";
			html += "<div data-assoc='"+(prop.multiple!=null?prop.multiple:false)+"' data-preview='"+(prop.preview!=null?prop.preview:false)+"' class='ui circular mini button orange icon'><i class='plus icon'></i></div>";
			html += "<div class='ui list'><div class='item empty'><div class='ui label'>Nessuno selezionato</div></div></div>";
			html += "<input type='hidden' name='"+propName+"'><div class='ui hidden divider'></div>";
			fieldEl.append(html);
			fieldEl.find("[data-assoc]").data("assocFn", prop.fn);
		},
		"putcode": function(prop, propName, fieldEl){
			var code = "";
			if (prop.code){
				if($.isFunction(prop.code)){
					code = prop.code(propName);
				} else {
					code = prop.code;
				}
			}
			fieldEl.append("<label>"+prop.title+"</label>"+code);
		},
		"message": function(prop, propName, fieldEl){
			fieldEl.append("<label>"+prop.title+"</label><div class='ui "+(prop.style||"")+" message' name='"+propName+"'>"+(prop.text||"")+"</div>");
		},
		// visualization drawer
		"columns": function(prop, propName, fieldEl){
			var colnum = "three";
			if (prop.columns==2){
				colnum = "two";
			}
			else if (prop.columns==4){
				colnum = "four";
			}
			fieldEl.append("<div class='"+colnum+" fields'></div>");
		},
		"divider": function(prop, propName, fieldEl){
			fieldEl.append("<div class='ui "+(prop.text ? "horizontal " : "")+"divider'>"+(prop.text||"")+"</div>");
		},
		"accordion": function(prop, propName, fieldEl){
			fieldEl.append("<div class='ui accordion field'><div class='title'><div class='ui blue header'><i class='icon dropdown'></i>"+(prop.title||"")+"</div></div><div class='content'></div></div>");
			fieldEl.find(".field.accordion").accordion();
		},
		"hidden": function(prop, propName, fieldEl){
			fieldEl.append("<input type='hidden' name='"+propName+"'>");
		},
		"empty": $.noop
	},
	/**
	 * function to draw html and logic form
	 * @type: custom type for form
	 * @form: name of form (default: 'basic')
	 * @submit: function to call when submit (with serialized form as argument)
	 * @text: text or html to show in submit button (default: 'Conferma')
	 * @container: jquery object for form container
	 * @search: boolean to choose if is in search mode (default: false)
	 */
	draw: function(settings){
		var type = Choc.types[settings.type] || {props:[]},
			form = settings.form || "basic",
			formValidation = {},
			search = (settings.search==null ? false : settings.search),
			formEl = $("<div class='ui form'></div>"), formElBkp,
			setFields = 0, setAccordions = 0;
		settings.container.append(formEl);
		$.each(type.props, function(index, prop){
			if($.inArray(form, prop.form)>-1){
				var propName = prop.name.replace(/:/g, "_"),
					fieldEl = $("<div class='field' data-search='"+search+"'></div>");
				if(setFields>0){
					formEl.children(".fields:last-child").append(fieldEl);
					setFields--;
				} else {
					// activate column drawing
					if(prop.type=="columns"){
						setFields = prop.columns;
						fieldEl = formEl;
					} else if(prop.type=="accordion"){
						setAccordions = prop.elements;
						fieldEl = formEl;
						formElBkp = formEl;
					} else {
						formEl.append(fieldEl);
					}
				}
				// draw field html
				Choc.Forms.drawer[prop.type](prop, propName, fieldEl, settings.type);
				// set or remove scope of form to accordion content
				if(prop.type=="accordion"){
					formEl = fieldEl.find(".field.accordion:last-child .content");
				} else if(setAccordions>0){
					if(setAccordions==1){
						formEl = formElBkp;
						formElBkp = null;
					}
					setAccordions--;
				}
				// add field validation
				if(prop.rules!=null && prop.rules.length>0){
					var fieldValidation = {
						identifier: propName,
						rules: []
					}
					if($.inArray("mandatory",prop.rules)==-1 && prop.rules.toString().indexOf("isAllEmpty")==-1){
						fieldValidation.optional = true;
					}
					$.each(prop.rules, function(index, rule){
						var ruleObj = {}
						if(rule=="mandatory"){
							if(search){
								return false;
							} else {
								fieldEl.children("label").append("<span class='required'> *</span>");
								if(fieldEl.find("input[type='radio']").length>0){
									ruleObj.type = "checked";
								} else {
									ruleObj.type = "empty";
								}
								ruleObj.prompt = "Campo obbligatorio";
							}
						} else if(rule=="date"){
							ruleObj.type = "isDate";
							ruleObj.prompt = "Data non valida (specificare in formato giorno/mese/anno)";
						} else if(rule=="datetime"){
							ruleObj.type = "isDatetime";
							ruleObj.prompt = "Data non valida (specificare in formato giorno/mese/anno ore:minuti)";
						} else if(rule.indexOf("integer")==0){
							ruleObj.type = rule;
							ruleObj.prompt = "Il campo deve essere un intero";
						} else if(rule=="decimal"){
							ruleObj.type = rule;
							ruleObj.prompt = "Il campo deve essere un numero decimale";
						} else if(rule=="email"){
							ruleObj.type = rule;
							ruleObj.prompt = "Email non valida";
						} else if(rule.indexOf("range")==0){
							ruleObj.type = rule;
							ruleObj.prompt = "L'intero non è compreso nel range previsto";
						} else if(rule.indexOf("minValue")==0){
							ruleObj.type = rule;
							ruleObj.prompt = "Valore troppo basso";
						} else if(rule.indexOf("maxValue")==0){
                            ruleObj.type = rule;
                            ruleObj.prompt = "Valore troppo alto";
                        } else if(rule.indexOf("length")==0){
							ruleObj.type = rule;
							ruleObj.prompt = "Testo troppo corto";
						} else if(rule.indexOf("maxLength")==0){
							ruleObj.type = rule;
							ruleObj.prompt = "Testo troppo lungo";
						} else if(rule=="zipcode"){
							ruleObj.type = rule;
							ruleObj.prompt = "CAP non valido";
						} else if(rule=="url"){
							ruleObj.type = rule;
							ruleObj.prompt = "URL non valida";
						} else if(rule=="vat"){
							ruleObj.type = rule;
							ruleObj.prompt = "Partita IVA non valida";
						} else if(rule.indexOf("regExp")==0){
							ruleObj.type = rule;
							ruleObj.prompt = "Campo non valido";
						} else if(rule.indexOf("isAllEmpty")==0){
							ruleObj.type = rule;
							ruleObj.prompt = "Deve essere inserito almeno un valore";
						} else if(rule.indexOf("mandatoryPg")==0){
                            ruleObj.type = rule;
                            ruleObj.prompt = "Per le persone giuridiche devi specificare il nome";
                        } else {
                            ruleObj.type = rule;
                            ruleObj.prompt = "Valore non valido";
                        }
						fieldValidation.rules.push(ruleObj);
						formValidation[prop.name] = fieldValidation;
					});
				}
			}
		});
		formEl.find("[data-assoc]").each(function(){
			var btnEl = $(this),
				multiple = btnEl.data("assoc"),
				preview = btnEl.data("preview");
			btnEl.data("assocFnCallback", function(assocs){
				if(assocs && assocs.length>0){
					var list = btnEl.next(), input = list.next();
					list.find(".item.empty").remove();
					for(var a in assocs){
						var assoc = assocs[a];
						if(list.find("[data-noderef='"+assoc.noderef+"']").length==0){
							if(!multiple){
								list.empty();
								input.val("");
							}
							var icon = "";
							if (assoc.username){
								icon = "<i class='icon user'></i>";
							}
							if (assoc.noderef && Choc.Org.getUo(assoc.noderef)){
                                icon = "<i class='icon sitemap'></i>";
							}
							if (preview){
								icon = "<i onclick='Choc.Picker.showPreview({noderef:\""+assoc.noderef+"\"});' class='icon eye cursor pointer'></i>";
							}
							var nme = assoc.name;
							if (assoc.username){
								nme = assoc.username;
							}
							list.append("<div class='item' data-noderef='"+assoc.noderef+"'><div class='ui blue label'>"+icon+nme+
									"<i class='icon delete' onclick='Choc.Forms.removeAssoc(this);'></i></div></div>");
							var val = input.val();
							if(val.length>0){
								val += ",";
							}
							val += assoc.noderef;
							input.val(val);
						}
					}
				}
			});
			btnEl.click(function(){
				$(this).data("assocFn")($(this).data("assocFnCallback"));
			});
		});
		formEl.find("i[data-content]").popup({
			position:"left center",
			variation:"large wide",
			transition:"vertical flip"
		});
		formEl.append("<div class='ui blue submit small button'>"+(settings.text||"Conferma")+"</div>");
		formEl.form({
			fields: formValidation,
			inline: true,
			onSuccess: function(event){
				if(event!=null && event.type=="submit"){
					var data = formEl.form("get values");
					// convert date fields
					for(var d in data){
						var value = data[d];
						if(moment(value, "DD/MM/YYYY", true).isValid()){
							data[d] = Choc.parseDateToIso(value);
						} else if(moment(value, "DD/MM/YYYY HH:mm", true).isValid()){
							data[d] = Choc.parseDatetimeToIso(value);
						}
					}
					formEl.find('.ui.checkbox').each(function(){
						data[$(this).find("input").prop("name")] = $(this).checkbox("is checked");
					});
					settings.submit(data);
				}
			}
		});
	},
	// function to draw exists values
	drawValues: function(item, type, formEl){
		// set current values in input
		var values = {},
			typeDef = Choc.types[type], formName = Choc.Picker.form ? Choc.Picker.form.formName : null;
		for(var p in typeDef.props){
			var propDef = typeDef.props[p], propName = propDef.name, propNameR = propName.replace(":","_");
			// skip if prop isn't in current form
			if(formName!=null){
				var isContained = false;
				for(var f in propDef.form){
					if(formName==propDef.form[f]){
						isContained = true;
					}
				}
				if(!isContained){
					continue;
				}
			}
			
			var propValue="";
			var propValueTmp = item.properties[propName] || "";
			if($.isArray(propValueTmp))
			{
				propValue=propValueTmp.join(",");
			}else{
				
				propValue=propValueTmp;
				
			}
			
			
			if(formEl.find("[name='"+propNameR+"']").length>0)
			{

				if(propDef.type=="view")
				{
						if(propDef.values){
							propValue = propDef.values[propValue];
						
							formEl.find("[name='"+propNameR.replace(":","_")+"']").html("<div class='item choc-form-message'><div class='ui compact small info message'>"+propValue+"</div></div>");
						} else if (typeof propValue=="string" && propValue.indexOf("workspace://SpacesStore/") >= 0){
							var ulEl =formEl.find("[name='"+propNameR.replace(":","_")+"']");
							var propArray = propValue.split(",");
							for (var i = 0; i < propArray.length; i++){
								if (propArray[i]){
									Choc.Docs.get(propArray[i], function(item, el){
										var name = "";
										name = item.properties["cm:name"];
										var hTw = "<div class='ui blue label ";
										if (!item.isContainer){
											hTw += "cursor pointer' onclick='Choc.Picker.showPreview({noderef:\"" + item.nodeRef + "\"});'>" + Choc.Docs.icon(name);
										}
										else{
											hTw += "'>";
										}
										hTw += name + "</div>";
										el.append(hTw);
									}, ulEl);
								}
							}
						} else {
							var elem = formEl.find("[name='"+propNameR.replace(":","_")+"']");
							if (typeof propValue == "boolean"){
								if (propValue){
									elem.html("<i class='ui large icon check circle green'></i>");
								}
								else{
									elem.html("<i class='ui large icon remove circle red'></i>");
								}
							}
							else{
								if(propValue.iso8601){
									propValue = Choc.formatIsoDateWithoutHour(propValue);
								}
								else if(typeof propValue!="number" && moment(propValue, moment.ISO_8601, true).isValid() && propValue.indexOf('T') > 0){
									propValue = Choc.formatIsoDateWithoutHour({iso8601:propValue});
								}
								
								if(propValue!=""){
									elem.html("<div class='item choc-form-message'><div class='ui compact small info message'>"+propValue+"</div></div>");
								}
							}
						}
					
				} 
				
				else if(propDef.type!="assoc"){
					if(propValue.iso8601){
						var momentObj = moment(propValue.iso8601);
						/* ES.:
						 * {name:"doc:feDataEmissione",type:"date",rules:["date","mandatory"],title:"Data Emissione",form:["edit"]},
        				 * {name:"doc:feDataEmissione",type:"view",title:"Data Emissione",form:["view"]},
						 */
						if (formEl.find("[name='"+propNameR+"']").data("DateTimePicker")){
							formEl.find("[name='"+propNameR+"']").data("DateTimePicker").setDate(momentObj);
						}
						// non setto il value dell'input in quanto automaticamente settato dalla "setDate" della riga sopra
						/*if($.inArray("datetime",propDef.rules)>-1){
							values[propNameR] = momentObj.format("DD/MM/YYYY HH:mm");
						} else {
							values[propNameR] = momentObj.format("DD/MM/YYYY");
						}*/
					} else {
						if(propValue=="true"){
							propValue = true;
						} else if(propValue=="false"){
							propValue = false;
						}
						if(propValue && propDef.type=="select" && propDef.multiple && !$.isArray(propValue)){
							propValue = propValue.split(",");
						}
						values[propNameR] = propValue;
					}
				} else {
					Choc.Forms.drawAssoc(item.nodeRef, propName, propValue, formEl);
				}
			}
		}
		formEl.form("set values", values);
	},
	// function to draw exists assoc
	drawAssoc: function(noderef, assocName, propValue, formEl){
		if(propValue){
			Choc.Forms.drawAssocValue(propValue, assocName, formEl);
		} else {
			if(noderef) {
				Choc.Docs.getAssociations(noderef, assocName, function (res) {
					var assocs = res.items[assocName];
					if (assocs && assocs.total > 0) {
						var assocsParam = [];
						for (var a in assocs.elements) {
							assocsParam.push({
								noderef: a,
								name: assocs.elements[a].name
							});
						}
						var fieldEl = formEl.find("[name='" + assocName.replace(":", "_") + "']"),
							btnEl = fieldEl.prev().prev();
						btnEl.data("assocFnCallback")(assocsParam);
					}
				});
			}
		}
	},
	// function to draw assoc value
	drawAssocValue: function(noderefs, assocName, formEl){
		var arrayVal, assocsParam = [], counter = 0, resFn;
		if($.isArray(noderefs)){
			arrayVal = noderefs;
		} else {
			arrayVal = noderefs.split(",");
		}
		resFn = function(res){
			assocsParam.push({
				noderef: res.nodeRef,
				name: Choc.Docs.displayName(res)
			});
			if (counter == arrayVal.length){
				var fieldEl = formEl.find("[name='"+assocName.replace(":","_")+"']"),
					btnEl = fieldEl.prev().prev();
				btnEl.data("assocFnCallback")(assocsParam);
			}
		}
		for (var i = 0; i < arrayVal.length; i++) {
			counter++;
			if (arrayVal[i]){
				if(arrayVal[i].indexOf("workspace://SpacesStore")==-1){
					resFn({
						nodeRef: arrayVal[i],
						properties: {
							"cm:name": arrayVal[i]
						}
					});
				} else {
					Choc.Docs.get(arrayVal[i], resFn);
				}
			}
		}
	},
	// remove assoc for assoc prop type
	removeAssoc: function(labelEl){
		labelEl = $(labelEl).parent().parent();
		var noderef = labelEl.data("noderef"),
			list = labelEl.parent(),
			input = list.next(),
			refs = input.val().split(",");
		refs.splice(refs.indexOf(noderef), 1);
		input.val(refs.join(","));
		labelEl.remove();
		if(list.children().length==0){
			list.append("<div class='item empty'><div class='ui label'>Nessuno selezionato</div></div>");
		}
	}
}

/**
 * Custom validation rules
 */
// check if string is a valid dd/mm/yyyy date
$.fn.form.settings.rules["isDate"] = function(value){
	return moment(value, "D/M/YYYY", true).isValid();
}
//check if string is a valid dd/mm/yyyy hh:mm date
$.fn.form.settings.rules["isDatetime"] = function(value){
	return moment(value, "D/M/YYYY HH:mm", true).isValid();
}
//check if string is a valid decimal
$.fn.form.settings.rules["decimal"] = function(value){
	return $.isNumeric(value);
}
//check if cap is valid
$.fn.form.settings.rules["zipcode"] = function(value){
	return value.length==5 && !isNaN(value) && value.indexOf(".")==-1;
}
//check if integer is in range
$.fn.form.settings.rules["range"] = function(value, range){
	var value = parseInt(value), range = range.split("-");
	if(isNaN(value)){
		return false;
	} else return !(value < range[0] || value > range[1]);
}
//check if integer is a minumum
$.fn.form.settings.rules["minValue"] = function(value, minValue){
	var value = parseInt(value), minValue = parseInt(minValue);
	if(isNaN(value)){
		return false;
	} else return value >= minValue;
}
//check if integer is a maximum
$.fn.form.settings.rules["maxValue"] = function(value, maxValue){
    var value = parseInt(value), maxValue = parseInt(maxValue);
    if(isNaN(value)){
        return false;
    } else return value <= maxValue;
}
// check vat number (with control of last char)
$.fn.form.settings.rules["vat"] = function(value) {
    if (/^IT[0-9]{11}$/.test(value)) {
        value = value.substr(2);
    }
    if (!/^[0-9]{11}$/.test(value)) {
        return false;
    }
    if (parseInt(value.substr(0, 7), 10) === 0) {
        return false;
    }
    var lastThree = parseInt(value.substr(7, 3), 10);
    if ((lastThree < 1) || (lastThree > 201) && lastThree !== 999 && lastThree !== 888) {
        return false;
    }
    return Choc.luhn(value);
}
// check vat number (with control of last char)
$.fn.form.settings.rules["cf"] = function(value) {
	if(value){
        var cfReg = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/,
        	set1 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        	set2 = "ABCDEFGHIJABCDEFGHIJKLMNOPQRSTUVWXYZ",
			setpari = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
			setdisp = "BAKPLCQDREVOSFTGUHMINJWZYX", s = 0;
        if (!cfReg.test(value)){
            return false;
		}
        for( i = 1; i <= 13; i += 2 )
            s += setpari.indexOf( set2.charAt( set1.indexOf( value.charAt(i) )));
        for( i = 0; i <= 14; i += 2 )
            s += setdisp.indexOf( set2.charAt( set1.indexOf( value.charAt(i) )));
        if ( s%26 != value.charCodeAt(15)-'A'.charCodeAt(0) ) {
            return false;
        }
        return true;
	}
	return false;
}
//check if value respect RegExp
$.fn.form.settings.rules["regExp"] = function(value, regExp){
	if ("" === value) return !0;
    var testRG = "string" == typeof regExp ? new RegExp(regExp) : regExp;
    return testRG.test(value)
}
$.fn.form.settings.rules["isAllEmpty"] = function(text,csv){
	//If the text of the field itself isn't empty, then it is valid
	if (text)
	  return true;
	var array = csv.split(','); // you're separating the string by commas
	var isValid = false; // return value
	
	$.each(array,function(index,elem){
	  // for each item in array, get an input element with the specified name, and check if it has any values
	  var element = $("input[name='"+elem+"']");
	  //If element is found, and it's value is not empty, then it is valid
	  if (element && element.val())
	      isValid = true;
	});
	return isValid; 
}

/**
 * Template for search type
 */
$.fn.search.settings.error.noResults = "Nessun risultato";
$.fn.search.settings.templates["message"] = function(message, type) {
	var html = '';
    if(message !== undefined && type !== undefined) {
    	return '<div class="message ' + type + '"><div class="description">' + message + '</div></div>';
    }
    return html;
};

})();
