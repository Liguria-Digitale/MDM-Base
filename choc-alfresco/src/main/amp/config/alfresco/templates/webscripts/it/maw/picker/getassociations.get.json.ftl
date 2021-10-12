<#escape x as jsonUtils.encodeJSONString(x)>
{
"total": ${items?size},
"items":{
		<#list items as item>
		"${item.name}":{
			"total": ${item.elements?size},
			"elements":{
				<#list item.elements as element>
				"${element.nodeRef.toString()}": {
					"name": "${element.properties["cm:name"]}",
					"mime": "<#if !element.isContainer>${element.mimetype!""}</#if>"
				}<#if element_has_next>,</#if>
				</#list>
			}
		}<#if item_has_next>,</#if>
		</#list>
}
}
</#escape>