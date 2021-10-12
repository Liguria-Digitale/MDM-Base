<#escape x as jsonUtils.encodeJSONString(x)>
<#setting time_zone="Europe/Rome">
{
	"events": [
	<#list results as row>
	{
		"noderef": "${row.nodeRef.toString()}",
		"name": "${row.name}",
		"user": "${row.properties["audit:userOwner"]}",
		"site": "${row.properties["audit:site"]}",
		"action": "${row.properties["audit:action"]}",
		"date": <#if row.properties["audit:date"]??>"${row.properties["audit:date"]?string("dd.MMM.yyyy HH:mm:ss")}"</#if>,
		"referenceNodeRef": "${row.properties["audit:referenceNodeRef"]}",
		"referenceName": "${row.properties["audit:referenceName"]}",
		"referenceType": "${row.properties["audit:referenceType"]}",
		"params": [<#list row.properties["audit:params"] as param>"${param}"<#if param_has_next>,</#if></#list>]
	}<#if row_has_next>,</#if>
	</#list>
	]
}
</#escape>