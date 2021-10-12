package it.maw.choc.util;

import it.maw.choc.model.ChocModel;
import it.maw.choc.model.ServiceExecutor;
import it.maw.choc.service.Hookable;
import it.maw.choc.service.node.Search;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.namespace.QName;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.json.JSONObject;

import java.util.List;

/**
 * Created by Federico Tarantino on 03/07/15.
 */
public class AooUtil {

	public static String PERM_GROUP = "GROUP_site_%s_perm_%s";
	private static Logger logger = Logger.getLogger(AooUtil.class);
    private AooUtil(){}

	/**
	 * ###### CONTAINER UTIL ######
	 */

	public static NodeRef createChocContainer(String containerName, String site){
		return createChocContainer(containerName, site, ContentModel.TYPE_FOLDER);
	}

	public static NodeRef createChocContainer(String containerName, String site, String type){
		return createChocContainer(containerName, site, RepoUtil.getQName(type));
	}

	public static NodeRef createChocContainer(String containerName, String site, QName type){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		PermissionService permissionService = serviceRegistry.getPermissionService();
		NodeRef container = serviceRegistry.getSiteService().createContainer(site, containerName, type, null);
		permissionService.deletePermissions(container);
		if(containerName.equals(ChocModel.CONTAINER_DOCLIB)){
			// fix permessi iniziali doclib: org UO -> SiteManager, gli altri site consumer
			permissionService.setPermission(container, "GROUP_site_"+site+"_SiteConsumer", SiteModel.SITE_CONSUMER, true);
			permissionService.setPermission(container, "GROUP_site_"+site+"_uo_org", SiteModel.SITE_MANAGER, true);
		} else {
			permissionService.setPermission(container, "GROUP_site_"+site+"_SiteConsumer", SiteModel.SITE_MANAGER, true);
		}
		return container;
	}

	public static NodeRef getUserHome(String site){
		return getUserHome(ChocModel.getServiceRegistry().getAuthenticationService().getCurrentUserName(), site);
	}

	public static NodeRef getUserHome(String username, String site){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		NodeRef homes = serviceRegistry.getSiteService().getContainer(site, ChocModel.CONTAINER_HOMES);
		NodeRef home = serviceRegistry.getNodeService().getChildByName(homes, ContentModel.ASSOC_CONTAINS, username);
		if(home==null){
			home = serviceRegistry.getFileFolderService().create(homes, username, ContentModel.TYPE_FOLDER).getNodeRef();
			serviceRegistry.getNodeService().addAspect(home, SiteModel.ASPECT_SITE_CONTAINER, null);
			serviceRegistry.getPermissionService().setInheritParentPermissions(home, false);
			serviceRegistry.getPermissionService().deletePermissions(home);
			serviceRegistry.getPermissionService().setPermission(home, username, SiteModel.SITE_MANAGER, true);
		}
		return home;
	}

	public static void deleteAooGroups(String site){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		SiteInfo siteInfo = serviceRegistry.getSiteService().getSite(site);
		PermissionService permissionService = serviceRegistry.getPermissionService();

		// rimuovo i gruppi delle uo
		Search search = new Search();
		search.setType(ChocModel.TYPE_NODE_UO.toPrefixString(serviceRegistry.getNamespaceService()));
		ServiceExecutor.execute(search, siteInfo.getNodeRef());
		List<NodeRef> uos = search.getNoderefs();
		for(NodeRef uo : uos){
			String uoGroup = (String) serviceRegistry.getNodeService().getProperty(uo, ChocModel.PROP_UO_GROUP);
			if(StringUtils.isNotBlank(uoGroup)){
				serviceRegistry.getAuthorityService().deleteAuthority(uoGroup);
			}
		}

		// delete permissions on site
		permissionService.deletePermissions(siteInfo.getNodeRef());

	}

	public static String getPermGroup(String site, String perm){
		return String.format(PERM_GROUP, site, perm);
	}

	/**
	 * CUSTOM CONFIG FOR AOO
	 */
	public static String buildCustomConfig(String site){
		Hookable hookable = new Hookable(Hookable.HookableType.EXTEND_SITE_CONFIG);
		hookable.getProperties().put("site", site);
		ServiceExecutor.execute(hookable);
		String json = (String) hookable.getProperties().get("custom");
		if(json==null){
			json = new JSONObject().toString();
		}
		return json;
	}

}
