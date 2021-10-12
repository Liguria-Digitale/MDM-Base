<#macro choc>
<#assign inSite = page.url.templateArgs.site??>
<!DOCTYPE html>
<html lang="it">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
		<link rel="icon" type="image/png" href="${url.context}/res/choc/images/icon.png">
		<title>MDM</title>
		<!-- Bootstrap Date Picker -->
		<link href="${url.context}/res/choc/css/bootstrap-datetimepicker.min.css" rel="stylesheet">
		<#if page.id="org">
		<link href="${url.context}/res/choc/css/jquery.orgchart.css" rel="stylesheet">
		</#if>
		<link href="${url.context}/res/choc/css/toastr.min.css" rel="stylesheet">
        <link href="${url.context}/res/choc/fonts/fonts.css" rel="stylesheet">
		<link href="${url.context}/res/choc/css/semantic.min.css" rel="stylesheet">
		<!--[if lte IE 9]>
			<link href="${url.context}/res/choc/css/semantic.ie.css" rel="stylesheet">
			<link href="${url.context}/res/choc/css/semantic.ie2.css" rel="stylesheet">
		<![endif]-->
		<!-- Choc CSS -->
		<link href="${url.context}/res/choc/css/custom.css" rel="stylesheet">
		<link href="${url.context}/res/choc/css/responsive.css" rel="stylesheet">
		<!-- jQuery -->
		<script src="${url.context}/res/choc/js/jquery-1.11.3.min.js"></script>
		<!-- can js -->
        <script src="${url.context}/res/choc/js/can.jquery.min.js"></script>
		<!-- i18next -->
		<script src="${url.context}/res/choc/js/i18next-19.3.3.min.js"></script>
		<!-- jQuery plugins -->
		<script src="${url.context}/res/choc/js/jquery.form.js"></script>
        <script src="${url.context}/res/choc/js/jquery.blockUI.js"></script>
		<script src="${url.context}/res/choc/js/toastr.min.js"></script>
		<#if page.id="org">
		<script src="${url.context}/res/choc/js/jquery.orgchart.min.js"></script>
		</#if>
        <script src="${url.context}/res/choc/js/jquery.ui.widget.js"></script>
        <script src="${url.context}/res/choc/js/jquery.fileupload.js"></script>
        <script src="${url.context}/res/choc/js/jquery-i18next-1.2.1.min.js"></script>
		<!-- Moment js -->
		<script src="${url.context}/res/choc/js/moment-with-locales.min.js"></script>
		<!-- Semantic js -->
        <script src="${url.context}/res/choc/js/semantic.min.js"></script>
        <!--[if lte IE 9]>
            <script src="${url.context}/res/choc/js/semantic-ie9-patch.js"></script>
        <![endif]-->
		<!-- Bootstrap datepicker -->
		<script src="${url.context}/res/choc/js/bootstrap-datetimepicker.min.js"></script>
		<!-- tiny mce -->
		<script src="${url.context}/res/choc/tinymce/tinymce.min.js"></script>
		<script src="${url.context}/res/choc/tinymce/jquery.tinymce.min.js"></script>
		<!-- Choc js -->
		<script type="text/javascript">location.context="${url.context}"</script>
		<script src="${url.context}/res/choc/js/choc.js"></script>
		<script type="text/javascript">
			Choc.init({
				site: <#if inSite>"${page.url.templateArgs.site}"<#else>null</#if>,
				page: "${page.id!""}",
				user: "${user.id}",
                fullname: "${user.fullName}",
				version: "RIUSO",
				username: "${user.firstName}",
                locale: "it",
                i18n: {
                    "it": {
                        "core":{"title":"MDM","menu":{"showcase":"Bacheca","doc":{"header":"DOCUMENTI","titolario":"Titolario","personal":"Personali","shared":"Condivisi"},"mail":"Mail","agenda":"Agenda","flow":"Processi","cos":"Conservazione","h2h":"Poste","invoice":{"out":"Fatture Emesse","in":"Fatture Ricevute","report":"Fatture Report"},"admin":{"header":"ADMIN","org":"Organigramma","groups":"Gruppi","roles":"Ruoli","uos":"Unità organizzativa","audit":"Audit"}},"usermenu":{"downloadexec":"Scarica eseguibile","webguide":"Consulta manuale web","userprofile":"Modifica Profilo","changepassword":"Cambia Password","remotesign":"Firma Remota","crypt":"Centro di Criptaggio","manageusers":"Gestione Utenti","gotoshare":"Vai a share","logout":"Logout"},"error":{"generic":"Errore imprevisto"},"reg":{"classification":{"mainfil":"Fascicolo Principale","docclass":"Il Documento risulta classificato","notselected":"Nessuno selezionato","edit":"Modifica","forbidden":"Non hai il permesso per eseguire questa operazione","other":"Altri Fascicoli"}}},
                        "home":{"title":"Elenco AOO","header":"Aree Organizzative Omogenee (AOO)","newaoo":"Nuova AOO"},
                        "desktop":{"title":"Bacheca","reg":{"number":"Numero","doc":"Doc","nothing":"Nessun protocollo...","date":"Data","subject":"Oggetto","attach":"Allegati","actions":{"title":"Azioni","take":"Prendi in carico","reject":"Rifiuta","complete":"Completato","classify":"Classifica","startwf":"Avvia workflow","rejectviewed":"Presa visione del rifiuto","viewed":"Presa Visione"},"classification":{"title":"Classificazione per il protocollo","mainfil":"Fascicolo Principale","docclass":"Il Documento risulta classificato","notselected":"Nessuno selezionato","edit":"Modifica","forbidden":"Non hai il permesso per eseguire questa operazione","other":"Altri Fascicoli"},"alert":{"rejectreason":"Inserisci la motivazione del rifiuto","insertreason":"Inserisci la motivazione...","warn":{"notValidChars":"Sono presenti caratteri non consentiti nel filtro di ricerca","merge":"Selezionare almeno un contatto da unire"},"ok":{"assignment":"Assegnazione presa in carico!","rejectreason":"Assegnazione rifiutata!","assignmentcompleted":"Processo di assegnazione completato!","classification":"Classificazione effettuata correttamente!","assignementviewed":"Presa visione dell'assegnazione completata!","rejectviewed":"Presa visione del rifiuto del protocollo."},"err":{"unexpected":"Errore imprevisto"}}},"tasks":{"yourtasks":"I tuoi compiti","nothing":"Nessun task assegnato..."},"docs":{"lastdocs":"Ultimi documenti caricati","folder":"Cartella","from":"Da","nothing":"Nessun documento"},"mail":{"lastmails":"Ultime PEC/Email","nothing":"Nessuna email...","attachs":"Con allegato/i","pec":"Pec","protocollata":"Protocollata","taker":"Presa in carico da","from":"Da:","subject":"Oggetto:","date":"Data"},"notices":{"lastnotices":"Ultime notifiche di fatturazione","nothing":"Nessuna notifica..."},"m4i":{"title":"M4I","docimported":"DOCUMENTI IMPORTATI","lotti":"LOTTI DA IMPORTARE","nothing":"Nessuna azienda"}}
                    }
                }
			});
		</script>
		<script src="${url.context}/res/choc/js/choc.org.js"></script>
		<script src="${url.context}/res/choc/js/choc.docs.js"></script>
		<script src="${url.context}/res/choc/js/choc.actions.js"></script>
		<script src="${url.context}/res/choc/js/choc.ui.js"></script>
		<script src="${url.context}/res/choc/js/choc.picker.js"></script>
        <script src="${url.context}/res/choc/js/choc.forms.js"></script>
        <script src="${url.context}/res/choc/js/choc.types.js"></script>
        <script src="${url.context}/res/choc/js/ui/choc.ui.${page.id}.js"></script>
        <!-- HTML5 Shim (3.7.0) and Respond.js (1.4.2) IE8 support of HTML5 elements and media queries -->
		<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
		<!--[if lt IE 9]>
		  <script src="${url.context}/res/choc/js/html5shiv.min.js"></script>
		  <script src="${url.context}/res/choc/js/respond.min.js"></script>
		<![endif]-->
		<!--[if lte IE 9]>
		  <script type="text/javascript">
		  Choc.ie9 = true;
		  </script>
		  <script src="${url.context}/res/choc/js/jquery.xdomainrequest.min.js"></script>
          <script src="${url.context}/res/choc/js/jquery.iframe-transport.js"></script>
		  <script src="${url.context}/res/choc/js/compatibility.js"></script>
		<![endif]-->
		<script src="${url.context}/res/choc/js/loader-min.js"></script>
	</head>
	<body>
		<div class="choc-app-container">
			<div class="choc-app-sidebar">
                <aside class="expanded">
					<#if inSite>
                    <nav>
                        <a class="large_logo_item" href="${url.context}/page/home">
                            <img src="${url.context}/res/choc/images/logo_mdm_retina.png" alt="Maw Document Management" class="large_logo" />
                        </a>
                        <div class="ui vertical menu" id="choc-sitemenu">
                            <a class="item<#if page.id="desktop"> active</#if>" href="desktop" data-i18n="[append]core:menu.showcase"><i class="icon desktop"></i> </a>
                            <div class="header item" data-i18n="core:menu.doc.header"></div>
                            <a class="item indentitem<#if page.id="titolario" && !page.url.args.user?? && !page.url.args.shared??> active</#if> no-before" href="titolario" data-i18n="[append]core:menu.doc.titolario"><i class="icon archive"></i> </a>
                            <a class="item indentitem<#if page.id="titolario" && page.url.args.user??> active</#if>" href="titolario?user" data-i18n="[append]core:menu.doc.personal"><i class="icon child"></i> </a>
                            <a class="item indentitem<#if page.id="titolario" && page.url.args.shared??> active</#if>" href="titolario?shared" data-i18n="[append]core:menu.doc.shared"><i class="icon share alternate"></i> </a>
							<div class="header item" data-i18n="core:menu.admin.header"></div>
								<a class="item<#if page.id="org"> active</#if> no-before" href="org" data-i18n="[append]core:menu.admin.uos"><i class="icon sitemap"></i> </a>
                                <a class="item<#if page.id="audit"> active</#if>" href="audit" data-i18n="[append]core:menu.admin.audit"><i class="icon clock"></i> </a>
                        </div>
                    </nav>
					</#if>
                </aside>
			</div>
			<div class="choc-app-content <#if !inSite>expanded</#if>">
                <div class="ui top attached borderless secondary menu" id="choc-topmenu">
					<#if inSite>
					<div class="cursor pointer icon item" onclick="$('.choc-app-sidebar > aside, .choc-app-content').toggleClass('expanded');">
						<i class="icon sidebar"></i>
					</div>
					<#else>
                        <a class="large_logo_item" href="${url.context}/page/home">
                            <img src="${url.context}/res/choc/images/logo_mdm_retina.png" alt="Maw Document Management" class="large_logo" />
                        </a>
					</#if>
                    <h4 class="choc-sitemenu-header item header ui breadcrumb"></h4>
                    <div class="right menu user_sub_container">
                        <div class="item">${user.firstName}</div>
                        <div class="ui dropdown icon item">
                            <i class="setting large icon"></i>
                            <div class="menu">
                                <a class="item" onclick='Choc._gotoGuide();' data-i18n="[append]core:usermenu.webguide"><i class='icon book'></i></a>
                                <a class="item" onclick='Choc._editUserProfile();' data-i18n="[append]core:usermenu.userprofile"><i class='icon user'></i></a>
                                <a class="item" onclick='Choc._changeUserPw();' data-i18n="[append]core:usermenu.changepassword"><i class='icon key'></i></a>
							<#if user.isAdmin>
                                <a class="item" href='${url.context}/page/users' data-i18n="[append]core:usermenu.manageusers"><i class='icon users'></i></a>
							</#if>
                                <a class="item enable-share-link" href='${url.context}/page/user/${user.id}/dashboard' data-i18n="[append]core:usermenu.gotoshare"><i class='icon empire'></i></a>
                                <a class="item" onclick='Choc.logout();' data-i18n="[append]core:usermenu.logout"><i class='icon sign out'></i></a>
                                <div class="item" data-i18n="[prepend]core:title"> - v RIUSO</div>
                            </div>
                        </div>
                    </div>
                </div>
                <#nested>
			</div>
		</div>
        <div id="choc-services"></div>
		<!-- include pdfjs (at the end, for performance -->
		<script src="${url.context}/res/choc/js/pdf.js"></script>
	</body>
</html>
</#macro>
