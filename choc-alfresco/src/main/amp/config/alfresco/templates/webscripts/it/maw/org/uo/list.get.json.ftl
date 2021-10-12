<#escape x as jsonUtils.encodeJSONString(x)>
{
	"root": "${root}",
	"uos": {
    <#list uos as uo>
		"${uo.nodeRef.toString()}": {
        <#if uo.nodeRef.toString()=root>
			"name": "${title}",
        <#else>
			"name": "${uo.name}",
        </#if>
			"group": "${uo.properties["org:nodeUoGroup"]!""}",
			"users": [
        <#if uo.assocs["org:usersAssoc"]??>
            <#list uo.assocs["org:usersAssoc"] as user>
				{
					"name": "<#if user.properties["cm:firstName"]??>${user.properties["cm:firstName"]}</#if><#if user.properties["cm:lastName"]??> ${user.properties["cm:lastName"]}</#if>",
					"lastname": "${user.properties["cm:lastName"]!""}",
					"username": "${user.properties["cm:userName"]}",
					"leader": <#if user.properties["cm:userName"] == uo.properties["org:nodeUoLeader"]!"">true<#else>false</#if>
				}<#if user_has_next>,</#if>
            </#list>
        </#if>
			],
		"groups": [
		<#if uo.assocs["org:groupsAssoc"]??>
			<#list uo.assocs["org:groupsAssoc"] as group>
				{
				"noderef": "${group.nodeRef.toString()}",
				"authorityName": "${group.properties["cm:authorityName"]!""}",
				"shortName": "${group.properties["cm:authorityDisplayName"]!""}"
				}<#if group_has_next>,</#if>
			</#list>
		</#if>
		],
			"children": [
        <#if uo.children??>
            <#list uo.children?sort_by("name") as child>
				"${child.nodeRef.toString()}"<#if child_has_next>,</#if>
            </#list>
        </#if>
			],
			"disabled":<#if uo.properties["org:nodeUoDisabled"]??>${uo.properties["org:nodeUoDisabled"]?string}<#else>false</#if>,
        <#assign pDisabled = false>
        <#if uo.parent?? && uo.parent.typeShort == "org:nodeUo">
            <#if uo.parent.properties["org:nodeUoDisabled"]?? && uo.parent.properties["org:nodeUoDisabled"]>
                <#assign pDisabled = true>
            </#if>
        </#if>
			"parentDisabled": ${pDisabled?string}
		}<#if uo_has_next>,</#if>
		</#list>
	},
"groups": {
    <#list groups as uo>
		"${uo.nodeRef.toString()}": {
        <#if uo.nodeRef.toString()=root>
			"name": "${title}",
        <#else>
			"name": "${uo.name}",
        </#if>
			"group": "${uo.properties["org:nodeUoGroup"]!""}",
			"users": [
        <#if uo.assocs["org:usersAssoc"]??>
            <#list uo.assocs["org:usersAssoc"] as user>
				{
					"name": "<#if user.properties["cm:firstName"]??>${user.properties["cm:firstName"]}</#if><#if user.properties["cm:lastName"]??> ${user.properties["cm:lastName"]}</#if>",
					"lastname": "${user.properties["cm:lastName"]!""}",
					"username": "${user.properties["cm:userName"]}",
					"leader": <#if user.properties["cm:userName"] == uo.properties["org:nodeUoLeader"]!"">true<#else>false</#if>
				}<#if user_has_next>,</#if>
            </#list>
        </#if>
			]
		}<#if uo_has_next>,</#if>
    </#list>
}
}
</#escape>
