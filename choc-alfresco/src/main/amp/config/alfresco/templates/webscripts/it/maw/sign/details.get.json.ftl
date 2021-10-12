<#escape x as jsonUtils.encodeJSONString(x)>
{"success":${success?string},
 "noderef": <#if noderef??>"${noderef}"<#else>""</#if>,
 "signature":[
 			 <#if signatureDetails??>
	 			 <#list signatureDetails as details>
	 				{
	 				"signName": "${details.signName!""}",
	 				"signDate": "<#if details.signDate??>${details.signDate?string("dd MMM yyyy HH:mm:ss")}</#if>",
	 				"signAlgorithm": "${details.signAlgorithm!""}",
	 				"subjectName": "${details.subjectName!""}",
	 				"subjectEmail": "${details.subjectEmail!""}",
	 				"certIssuer": "${details.certIssuer!""}",
	 				"certDateNotBefore": "${details.certDateNotBefore!""}",
	 				"certDateNotAfter": "${details.certDateNotAfter!""}",
	 				"certFormat": "${details.certFormat!""}"
	 			 	}
	 			 	<#if details_has_next>,</#if>
	 			</#list>
	 		</#if>
 			]
}
</#escape>

