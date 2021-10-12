<#escape x as jsonUtils.encodeJSONString(x)>
{
	"total": ${(total!0)?c},
	"items": [
		<#list refs as item>
		{
			"path": "${paths[item]}",
	        "node": <#noescape>${items[item]}</#noescape>
		}<#if item_has_next>,</#if>
		</#list>
	]
}
</#escape>