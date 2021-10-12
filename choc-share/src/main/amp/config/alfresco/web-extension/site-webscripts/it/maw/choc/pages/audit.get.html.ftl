<div class="choc-container choc-${page.id}" data-title="Audit">
	<div class="ui grid">
		<div class="eleven wide column">
			<div class="ui header">Audit</div>
			<table class="ui celled table" id="audit-feed">
				<tr>
					<td>
						Puoi cercare gli audit tramite lo strumento di ricerca
                        <i class="arrow right icon"></i>
					</td>
				</tr>
			</table>
		</div>
		<div class="five wide column">
            <div class="ui header">Ricerca</div>
            <div class="ui right labeled fluid left icon input">
                <i class="icon search"></i>
                <input type="text" id="audit-filter" aria-label="Cerca Audit" onkeydown="Choc._searchAudit(event, true);">
                <div class="ui dropdown blue label" id="audit-mode">
                    <input type="hidden" value="doc" />
                    <div class="text"></div>
                    <i class="dropdown icon"></i>
                    <div class="menu">
                        <div class="item" data-value="doc">Documento</div>
                        <div class="item" data-value="tit">Voce di titolario</div>
                    </div>
                </div>
            </div>
            <div class="ui large selection divided list" id="audit-results">
            </div>
            <div id="audit-pager2"><div class="pager"></div></div>
        </div>
	</div>
</div>
<script type="text/javascript">
$(document).ready(function(){
	$("#audit-mode").dropdown();
	<#if page.url.args.noderef??>
	// mostro l'audit del
	Choc._showAudit("<span data-noderef='${page.url.args.noderef}'></span>");
	</#if>
});
</script>