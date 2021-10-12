package it.maw.choc.beha.tit;

import it.maw.choc.model.ChocModel;
import it.maw.choc.model.ChocUtil;
import it.maw.choc.model.ServiceExecutor;
import it.maw.choc.service.Audit;
import it.maw.choc.util.RepoUtil;
import it.maw.choc.util.TitolarioUtil;
import it.maw.sign.util.PAdES;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.node.NodeServicePolicies;
import org.alfresco.repo.policy.Behaviour;
import org.alfresco.repo.policy.Behaviour.NotificationFrequency;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.namespace.QName;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.apache.tika.Tika;

import java.io.InputStream;

/**
 * @author Federico Tarantino
 *
 */
public class Permissions implements NodeServicePolicies.OnCreateChildAssociationPolicy {

	// Behaviour
	private Behaviour setPermissions;
	public static boolean checkSignActive = true;
	private Logger logger = Logger.getLogger(Permissions.class);

	/**
	 * Init method.
	 * Create behaviour
	 */
	public void init() {

		// Create behaviours
		this.setPermissions = new JavaBehaviour(this, "onCreateChildAssociation", NotificationFrequency.TRANSACTION_COMMIT);

		// Bind behaviour to node policies
		ChocModel.getPolicyComponent().bindAssociationBehaviour(NodeServicePolicies.OnCreateChildAssociationPolicy.QNAME, ContentModel.TYPE_FOLDER, ContentModel.ASSOC_CONTAINS, this.setPermissions);
		ChocModel.getPolicyComponent().bindAssociationBehaviour(NodeServicePolicies.OnCreateChildAssociationPolicy.QNAME, ContentModel.TYPE_CONTENT, ContentModel.ASSOC_CONTAINS, this.setPermissions);
	}

	/**
	 * @see org.alfresco.repo.node.NodeServicePolicies.OnCreateNodePolicy#onCreateNode(org.alfresco.service.cmr.repository.ChildAssociationRef)
	 */
	public void onCreateChildAssociation(ChildAssociationRef ref, boolean isNewNode) {
		// set permissions only in choc sites and only in container doclib
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		NodeService nodeService = serviceRegistry.getNodeService();
		ContentService contentService = serviceRegistry.getContentService();

		NodeRef parent = ref.getParentRef();
		final NodeRef node = ref.getChildRef();

		String currentUser = null;
		if (!RepoUtil.hasWritePermission(node) || !RepoUtil.hasReadPermission(node) || !RepoUtil.hasReadPermission(parent)) {
			currentUser = serviceRegistry.getAuthenticationService().getCurrentUserName();
			AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();
		}

		// controllo se sono in un sito di choc
		SiteInfo site = null;
		try {
			site = AuthenticationUtil.runAs(new AuthenticationUtil.RunAsWork<SiteInfo>() {
				@Override
				public SiteInfo doWork() {
					return ChocModel.getServiceRegistry().getSiteService().getSite(node);
				}
			}, AuthenticationUtil.getAdminUserName());
		} catch (Exception e) {
			logger.warn(e.getMessage());
		}
		if(site!=null && site.getSitePreset().equals(ChocModel.CHOC_SITE_PRESET)){
			// settaggio dei permessi
			if (isNewNode && serviceRegistry.getDictionaryService().isSubClass(nodeService.getType(parent), ChocModel.TYPE_TIT_BASEFOLDER)) {
				// controllo numerazioni titolario
				QName nodeType = nodeService.getType(node);
				Integer fascicoloNumber = null;
				if (nodeType.isMatch(ChocModel.TYPE_TIT_FASCICOLO)) {
					// se non è stato indicato un numero, lo autogenero
					fascicoloNumber = (Integer) nodeService.getProperty(node, ChocModel.PROP_BASEFOLDER_NUMBER);
					if (fascicoloNumber == null || TitolarioUtil.existsFascicoloWithNumber(node, fascicoloNumber)) {
						// controllo che il parent del fasciolo non sia un titolo
						if (!nodeService.getType(nodeService.getPrimaryParent(node).getParentRef()).isMatch(ChocModel.TYPE_TIT_TITOLO)) {
							nodeService.setProperty(node, ChocModel.PROP_BASEFOLDER_NUMBER, TitolarioUtil.generateFascicoloNumber(node));
						}
					}
				}
				// audit tit creation
				Audit auditEntry = new Audit();
				boolean isFolder = serviceRegistry.getDictionaryService().isSubClass(nodeType, ContentModel.TYPE_FOLDER);
				if(isFolder) {
					auditEntry.setAuditType(Audit.AUDIT_TITOLARIO);
					auditEntry.setAction("Creazione voce di titolario");
					auditEntry.getParams().put("Tipo voce", nodeType.getLocalName());
					if(fascicoloNumber!=null) {
						auditEntry.getParams().put("Numero", String.valueOf(fascicoloNumber));
					}
				} else {
					auditEntry.setAuditType(Audit.AUDIT_DOCUMENTO);
					auditEntry.setAction("Caricamento file");
				}
				auditEntry.getParams().put("Nome", nodeService.getProperty(node, ContentModel.PROP_NAME).toString());
				auditEntry.getParams().put("Path", ChocUtil.getSitePath(node));
				auditEntry.setUser(currentUser);
				ServiceExecutor.execute(auditEntry, node);
			}

			//CONTROL IF RIGHT MIMETYPE IS ASSIGNED
			if (nodeService.exists(node) && !serviceRegistry.getDictionaryService().getType(nodeService.getType(node)).isContainer()) {
				try{
					ContentReader reader2 = contentService.getReader(node, ContentModel.PROP_CONTENT);
					if (reader2 != null) {
						String fileName = (String) nodeService.getProperty(node, ContentModel.PROP_NAME);
						String mimetype = reader2.getMimetype();
						Tika tika = new Tika();
						InputStream inSt = reader2.getContentInputStream();
						byte[] bAIs = IOUtils.toByteArray(inSt);
						inSt.close();
						String tikaMimeType = tika.detect(bAIs);
						if (tikaMimeType.equals("application/xml")){
							tikaMimeType = MimetypeMap.MIMETYPE_XML; //Alfresco non trasforma application/xml in pdf ma text/xml
						}
						if (tikaMimeType.equals(MimetypeMap.MIMETYPE_TEXT_PLAIN) && mimetype.equals(MimetypeMap.MIMETYPE_HTML)){
							tikaMimeType = MimetypeMap.MIMETYPE_HTML; // DO NOT CHANGE
						}
						if (tikaMimeType.equals(ChocModel.MIMETYPE_P7S)){
							String extension = FilenameUtils.getExtension(fileName);
							if (!extension.isEmpty() && extension.toLowerCase().contains("p7m")){
								tikaMimeType = ChocModel.MIMETYPE_P7M;
							}
						}
						if (!tikaMimeType.equals(mimetype) && !tikaMimeType.equals(MimetypeMap.MIMETYPE_BINARY) && !mimetype.equals(ChocModel.MIMETYPE_P7M)){
							ContentData content = (ContentData) nodeService.getProperty(node, ContentModel.PROP_CONTENT);
							content = ContentData.setMimetype(content, tikaMimeType);
							nodeService.setProperty(node, ContentModel.PROP_CONTENT, content);
							logger.info("Changing MimeType to " + tikaMimeType + " from " + mimetype + " for node " + node.toString());
						}
					}
				} catch (Exception e) {
					e.printStackTrace();
					logger.warn("Error in mimetype control");
				}
			}

			if (checkSignActive) {
				//Check for signed documents
				if (nodeService.exists(node)) {
					if (!nodeService.hasAspect(node, ChocModel.ASPECT_SIGN)){
						ContentReader reader = contentService.getReader(node, ContentModel.PROP_CONTENT);
						String filename = (String) nodeService.getProperty(node, ContentModel.PROP_NAME);
						if (reader != null) {
							//if content has p7m mimetype or its filename ends with .p7m
							if (reader.getMimetype().equals(ChocModel.MIMETYPE_P7M) || filename.endsWith(ChocModel.FORMAT_P7M)) {
								nodeService.addAspect(node, ChocModel.ASPECT_SIGN, null);
							} else if (reader.getMimetype().equals(MimetypeMap.MIMETYPE_PDF)) {
								try {	
									InputStream is = reader.getContentInputStream();
									if (PAdES.verify(is)) {
										nodeService.addAspect(node, ChocModel.ASPECT_SIGN, null);
									}
									// close is
									is.close();
								} catch (Exception e) {
									e.printStackTrace();
								}
							}
						}
					}
				}
				else{
					logger.warn("Node does not exist: " + ref.toString());
				}
			} else {
				logger.warn("Check Sign service not active");
			}
		}
		// reset user session
		if(currentUser!=null){
			AuthenticationUtil.setFullyAuthenticatedUser(currentUser);
		}
	}

	public static boolean isCheckSignActive() {
		return checkSignActive;
	}

	public static void setCheckSignActive(boolean checkSignActive) {
		Permissions.checkSignActive = checkSignActive;
	}
}
