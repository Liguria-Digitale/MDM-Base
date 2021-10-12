<@markup id="choc-login-css" target="css" action="after" scope="global">
    <@link href="${url.context}/res/choc/css/login.css" group="login"/>
    <@link href="${url.context}/res/choc/css/login_custom.css" group="login"/>
</@>

<#if context.headers["user-agent"]?contains("Trident") && context.headers["user-agent"]?contains("rv:11")>
    <@markup id="choc-login-btn" target="buttons" action="replace" scope="global">
    <div class="form-field">
        <input type="submit" class="login-button" value="${msg("button.login")}"/>
    </div>
    </@>
</#if>
