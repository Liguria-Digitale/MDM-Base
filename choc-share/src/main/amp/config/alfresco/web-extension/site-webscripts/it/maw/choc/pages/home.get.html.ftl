<div class="choc-container choc-${page.id}" data-i18n="[data-title]home:title">
	<div class="ui centered grid">
		<div class="fourteen wide column">
            <div class="hidden divider"></div>
			<div class="ui header">
				<i class="icon sitemap"></i>
				<div class="content" data-i18n="home:header"></div>
			</div>
			<div class="ui cards" id="org-aoo">
			</div>
			<#if user.isAdmin>
			<div class="ui basic segment">
				<div class="ui blue button" onclick="Choc._addAoo();" data-i18n="[append]home:newaoo"><i class="icon plus"></i></div>
			</div>
			</#if>
		</div>
	</div>
</div>
<script type="text/javascript">
$(document).ready(function(){
	<#if user.isAdmin>Choc._isAdmin=true;</#if>
	Choc._listAoo();
});
</script>
