<div class="choc-container choc-${page.id}" data-i18n="[data-title]desktop:title">
	<div class="ui grid">
        <div class="ten wide computer sixteen wide tablet column">
			<div class="ui grid">
                <div class="eight wide computer sixteen wide tablet column">
                    <div class="ui fluid card">
                        <div class="content">
                            <div class="ui right floated tiny button" onclick="Choc._lastUploadsChooseFolder();"><i class="icon folder"></i></div>
                            <div class="header" data-i18n="[append]desktop:docs.lastdocs"><i class='icon file'></i></div>
                            <div class="ui tiny grey header" style="margin-top:0"></div>
                            <div id="desktop-uploads" class="ui divided list"></div>
                        </div>
                    </div>
                </div>
			</div>
        </div>
        <div class="five wide computer sixteen wide tablet column">
        </div>
	</div>
</div>
<script type="text/javascript">
$(document).ready(function(){
    Choc._lastUploads();
});
</script>