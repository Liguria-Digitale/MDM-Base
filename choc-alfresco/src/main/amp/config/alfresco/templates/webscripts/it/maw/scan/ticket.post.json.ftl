<#escape x as jsonUtils.encodeJSONString(x)>
{
	"ticket": "${ticket}",
	"alf_ticket": "<#if sessionticket??>${sessionticket.ticket}<#else>${session.ticket}</#if>"
}
</#escape>