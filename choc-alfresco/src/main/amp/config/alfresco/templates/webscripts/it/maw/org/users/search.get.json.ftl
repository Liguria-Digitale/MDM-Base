<#escape x as jsonUtils.encodeJSONString(x)>
{"users":[
	<#list users as user>
	{
		<#if uo>
		"uos": [
			<#if user.sourceAssocs["org:usersAssoc"]??>
			<#list user.sourceAssocs["org:usersAssoc"] as uo>
			{
				"site": "${uo.getSiteShortName()}",
				"noderef": "${uo.nodeRef.toString()}"
			}<#if uo_has_next>,</#if>
			</#list>
			</#if>
		],
		</#if>
		"username": "${user.properties["cm:userName"]}",
		"name": "${user.properties["cm:firstName"]!""}",
		"surname": "${user.properties["cm:lastName"]!""}",
		"mail": "${user.properties["cm:email"]!""}"
	}<#if user_has_next>,</#if>
	</#list>
]}
</#escape>