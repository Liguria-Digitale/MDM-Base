<#escape x as jsonUtils.encodeJSONString(x)>
{
	"total": ${elements?size},
	"elements":{
		<#list elements as element>
		"${element.nodeRef.toString()}": {
			"name": "${element.properties["cm:name"]}",
			"display": "${element.properties["cm:name"]}",
			"iscontainer": ${element.isContainer?string}
		}<#if element_has_next>,</#if>
		</#list>
	}
}
</#escape>