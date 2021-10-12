package it.maw.choc.util.audit;

import it.maw.choc.model.ChocModel;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.ResultSetRow;
import org.alfresco.service.cmr.search.SearchParameters;
import org.alfresco.service.cmr.search.SearchService;
import org.apache.log4j.Logger;

import java.io.Serializable;
import java.util.*;

/**
 * @author Vito Russo
 */

public abstract class AuditUtil {

	private static Logger logger = Logger.getLogger(AuditUtil.class);

	/**
	 * get a List of
	 * @return list of noderef
	 */
	public static Map<String, Serializable> getAudits(String query, String page, String elements, String site){

		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		ArrayList<String> nodeRefs = new ArrayList<>();
		NodeRef cos = serviceRegistry.getSiteService().getContainer(site, ChocModel.CONTAINER_AUDIT);
		String path = serviceRegistry.getNodeService().getPath(cos).toPrefixString(serviceRegistry.getNamespaceService());

		SearchParameters sp = new SearchParameters();
		sp.addStore(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
		sp.setLanguage(SearchService.LANGUAGE_CMIS_ALFRESCO);
		sp.setSkipCount(Integer.valueOf(page)*Integer.valueOf(elements));
		sp.setMaxItems(Integer.valueOf(elements));
		sp.setQuery(query);
		sp.addSort("cm:modified", false);
		ResultSet results = serviceRegistry.getSearchService().query(sp);

		long total = results.getNumberFound();

		for (ResultSetRow row : results) {
			NodeRef currentNodeRef = row.getNodeRef();
			nodeRefs.add(currentNodeRef.toString());
		}

		HashMap<String, Serializable> model = new HashMap<>();
		model.put("noderefs", nodeRefs);
		model.put("total", total);
		return model;
	}
}