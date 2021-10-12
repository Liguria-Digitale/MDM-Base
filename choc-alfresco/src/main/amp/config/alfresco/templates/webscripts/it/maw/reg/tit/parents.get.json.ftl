<#escape x as jsonUtils.encodeJSONString(x)>
{
	"total": ${parents?size},
	"items": [
		<#list parents as parentNode><#noescape>${parentNode}</#noescape><#if parentNode_has_next>,</#if>
		</#list>
	]
}
</#escape>