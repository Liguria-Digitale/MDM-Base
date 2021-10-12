<#escape x as jsonUtils.encodeJSONString(x)>
{
	"total": ${children?size},
	"totalElements": ${(totalElements!0)?c},

	"items": [
		<#list children as child>
		{
			"path": "${path}",
			"fullPath": "${fullPath}",
			"node": <#noescape>${child}</#noescape>
		}<#if child_has_next>,</#if>
		</#list>
	]
}
</#escape>