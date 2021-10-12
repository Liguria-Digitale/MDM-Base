<#escape x as jsonUtils.encodeJSONString(x)>
{
	"site": {
		"title": "${site.title}",
		"node": "${site.node.nodeRef.toString()}"
	},
	"custom": <#noescape>${custom}</#noescape>
}
</#escape>
