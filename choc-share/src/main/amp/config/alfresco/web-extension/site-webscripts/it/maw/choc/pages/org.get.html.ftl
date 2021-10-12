<div class="choc-container choc-${page.id}" data-title="Unità Organizzativa">
	<div class="ui grid">
		<div class="sixteen wide column" id="choc-org-div">
			<ul id="choc-org-chart" class="hide"></ul>
			<div class="overflowed-table">
				<div class="ui right floated buttons" id="org-actions-toolbar" tabindex="0">
					<div class="ui button">Azioni</div>
					<div class="ui floating dropdown icon button">
						<i class="dropdown icon"></i>
						<div class="menu" tabindex="-1">
							<div class="item" onclick="Choc._exportUOs();"><i class="icon download"></i>Esporta in CSV</div>
							<div class="item enableUos" onclick="Choc._toogleDisabledUos()"><i class="icon eye"></i>Mostra UO disabilitate</div>
							<div class="item disableUos hide" onclick="Choc._toogleDisabledUos()"><i class="icon eye slash"></i>Nascondi UO disabilitate</div>
						</div>
					</div>
				</div>
				<div id="choc-org-chart-container"></div>
			</div>
		</div>
	</div>
</div>