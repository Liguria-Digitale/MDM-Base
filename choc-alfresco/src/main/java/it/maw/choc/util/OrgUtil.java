package it.maw.choc.util;

import it.maw.choc.model.ChocModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.repository.AssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.site.SiteInfo;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by Federico Tarantino on 03/07/15.
 */
public class OrgUtil {

	private static Logger logger = Logger.getLogger(OrgUtil.class);
    private OrgUtil(){}

	/**
	 * create new UO
	 * @param name
	 * @param parent
	 * @return NodeRef of created UO
	 */
	public static NodeRef createUO(String name, NodeRef parent){
		final ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		NodeRef newUo;
		String displayName = name;
		final SiteInfo site;
		boolean addSalt = true;
		if(serviceRegistry.getNodeService().getType(parent).isMatch(SiteModel.TYPE_SITE)) {
			site = serviceRegistry.getSiteService().getSite(parent);
			newUo = AooUtil.createChocContainer(name, site.getShortName(), ChocModel.TYPE_NODE_UO);
			displayName = site.getTitle();
			addSalt = false;
		} else {
			newUo = serviceRegistry.getFileFolderService().create(parent, name, ChocModel.TYPE_NODE_UO).getNodeRef();
			site = serviceRegistry.getSiteService().getSite(newUo);
		}

		// creo gruppo alfresco corrispondente all'UO
		String groupName = "site_"+site.getShortName()+"_uo_"+name.toLowerCase().replaceAll("\\s", "_");
		// aggiungo salt per evitare nomi uguali
		if(addSalt) {
			groupName += "_" + RandomStringUtils.randomAlphanumeric(5).toLowerCase();
		}
		final String finalGroupName = groupName;
		final String finalDisplayName = displayName;
		String createdGroup = AuthenticationUtil.runAs(new AuthenticationUtil.RunAsWork<String>() {
			@Override
			public String doWork() {
				ServiceRegistry sr = ChocModel.getServiceRegistry();
				String createdGroup = sr.getAuthorityService().createAuthority(AuthorityType.GROUP, finalGroupName);
				sr.getAuthorityService().setAuthorityDisplayName(createdGroup, finalDisplayName);
				sr.getAuthorityService().addAuthority("GROUP_site_"+site.getShortName()+"_SiteConsumer", createdGroup);
				return createdGroup;
			}
		}, AuthenticationUtil.getAdminUserName());

		serviceRegistry.getNodeService().setProperty(newUo, ChocModel.PROP_UO_GROUP, createdGroup);
		logger.info("UO group '"+createdGroup+"' created for site "+site.getShortName());

		return newUo;
	}

	public static String deleteUO(NodeRef uo){
		NodeService nodeService = ChocModel.getServiceRegistry().getNodeService();
		List<FileInfo> childrenAssocs = ChocModel.getServiceRegistry().getFileFolderService().list(uo);
		List<AssociationRef> usersAssocs = nodeService.getTargetAssocs(uo, ChocModel.ASSOC_ORG_USERS);
		String errorMessage = null;
		if (childrenAssocs != null && !childrenAssocs.isEmpty()) {
			errorMessage = "Non puoi eliminare Unità Organizzative che ne contengono delle altre!";
		}else	if (usersAssocs != null && !usersAssocs.isEmpty()){
			errorMessage = "Non puoi eliminare Unità Organizzative a cui sono associati utenti!";
		} else if (nodeService.hasAspect(uo, SiteModel.ASPECT_SITE_CONTAINER)){
			errorMessage = "Non puoi eliminare l'Unità Organizzativa principale!";
		} else {
			final String uoGroup = (String) nodeService.getProperty(uo, ChocModel.PROP_UO_GROUP);
			if (!StringUtils.isBlank(uoGroup)){
				AuthenticationUtil.runAs(new AuthenticationUtil.RunAsWork<Void>() {
					@Override
					public Void doWork() {
						ChocModel.getServiceRegistry().getAuthorityService().deleteAuthority(uoGroup, false);
						return null;
					}
				}, AuthenticationUtil.getAdminUserName());
			}
			nodeService.deleteNode(uo);
		}

		return errorMessage;
	}

	/**
	 * ########  USERS  ##########
	 */

	/**
	 * add user to uo
	 * @param username
	 * @param uo
	 */
	public static void addUserToUo(final String username, NodeRef uo){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		final String uoGroup = (String) ChocModel.getServiceRegistry().getNodeService().getProperty(uo, ChocModel.PROP_UO_GROUP);
		AuthenticationUtil.runAs(new AuthenticationUtil.RunAsWork<Void>() {
			@Override
			public Void doWork() {
				ChocModel.getServiceRegistry().getAuthorityService().addAuthority(uoGroup, username);
				return null;
			}
		}, AuthenticationUtil.getAdminUserName());
		serviceRegistry.getNodeService().createAssociation(uo, serviceRegistry.getPersonService().getPerson(username), ChocModel.ASSOC_ORG_USERS);
		logger.info("User "+username+" added to uo "+serviceRegistry.getFileFolderService().getFileInfo(uo).getName());
	}

	/**
	 * remove user from uo
	 * @param username
	 * @param uo
	 */
	public static void removeUserFromUo(final String username, NodeRef uo){
		final ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		final String uoGroup = (String) serviceRegistry.getNodeService().getProperty(uo, ChocModel.PROP_UO_GROUP);
		AuthenticationUtil.runAs(new AuthenticationUtil.RunAsWork<Void>() {
			@Override
			public Void doWork() {
				ChocModel.getServiceRegistry().getAuthorityService().removeAuthority(uoGroup, username);
				return null;
			}
		}, AuthenticationUtil.getAdminUserName());
		serviceRegistry.getNodeService().removeAssociation(uo, serviceRegistry.getPersonService().getPerson(username), ChocModel.ASSOC_ORG_USERS);
		logger.info("User "+username+" removed from uo "+serviceRegistry.getFileFolderService().getFileInfo(uo).getName());
	}

	/**
     * get email from user
     * @param uo
     * @return users
     */
    public static List<NodeRef> getUsersFromUo(NodeRef uo){
		List<NodeRef> users = new ArrayList<>();
		List<AssociationRef> assocs = ChocModel.getServiceRegistry().getNodeService().getTargetAssocs(uo, ChocModel.ASSOC_ORG_USERS);
		if(assocs!=null && assocs.size()>0){
			for(AssociationRef assoc : assocs){
				users.add(assoc.getTargetRef());
			}
		}
		return users;
    }

}
