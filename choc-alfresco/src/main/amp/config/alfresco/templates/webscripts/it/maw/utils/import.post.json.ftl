<#escape x as jsonUtils.encodeJSONString(x)>
{
    "status": "${statusM}",
    "error": "${error!""}",
    "duration": ${(duration!0)?c},
    "created": ${(created!0)?c},
    "replaced": ${(replaced!0)?c},
    "skipped": ${(skipped!0)?c}
}
</#escape>