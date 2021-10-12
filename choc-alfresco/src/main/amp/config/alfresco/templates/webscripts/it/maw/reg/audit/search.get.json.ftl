<#escape x as jsonUtils.encodeJSONString(x)>
{
	"totalElements": ${(totalElements!0)?c},
	"audits": [
		<#list audits as audit>
		{
			<#if mode="tit">
			"type": "${audit.typeShort}",
			</#if>
			"noderef": "${audit.nodeRef.toString()}",
			"name": "${audit.name}"
		}<#if audit_has_next>,</#if>
		</#list>
	]
}
</#escape>