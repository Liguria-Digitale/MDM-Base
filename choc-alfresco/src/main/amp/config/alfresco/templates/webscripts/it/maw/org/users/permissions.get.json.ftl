<#escape x as jsonUtils.encodeJSONString(x)>
{
	"username": "${username}",
	"name": "${displayname?trim}",
	"permissions": {},
	"uos": [<#list uos as uoo>"${uoo}"<#if uoo_has_next>,</#if></#list>],
	"groups": []
}
</#escape>