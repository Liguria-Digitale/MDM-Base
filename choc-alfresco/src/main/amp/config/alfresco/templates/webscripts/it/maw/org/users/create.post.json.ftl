<#escape x as jsonUtils.encodeJSONString(x)>
{
	<#if user??>
	"success": true,
	"noderef": "${user.nodeRef.toString()}",
	"username": "${user.properties["cm:userName"]}",
	"name": "${user.properties["cm:firstName"]} ${user.properties["cm:lastName"]?trim}"
	<#else>
	"success": false
	</#if>
}
</#escape>