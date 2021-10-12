<#if user.isAdmin>
<div class="choc-container choc-${page.id}" data-title="Gestione Utenti">
	<div class="ui grid">
		<div class="nine wide column">
			<div class="ui action fluid input">
				<input type="text" placeholder="Cerca utenti..." id="users-filter" onkeydown="Choc._searchUsers(event);"/>
				<button class="ui icon blue button" onclick="Choc._searchUsers();"><i class="icon search"></i></button>
			</div>
		</div>
		<div class="seven wide column">
			<button class="ui icon orange button" onclick="Choc._createUser();"><i class="icon plus"></i>Nuovo Utente</button>
		</div>
		<div class="fifteen wide column">
			<table class="ui table" id="users-list">
			</table>
		</div>
	</div>
</div>
<#else>
<div class="choc-container choc-${page.id}">
	<h3>Non hai i permessi per visualizzare questa pagina</h3>
</div>
</#if>