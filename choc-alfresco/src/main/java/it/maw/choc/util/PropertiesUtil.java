package it.maw.choc.util;

import it.maw.choc.model.ChocModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.NamespaceService;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.simple.parser.JSONParser;

import java.io.InputStream;

public class PropertiesUtil {

	private static Logger logger = Logger.getLogger(PropertiesUtil.class);

	public static InputStream getResourceReader(String defaultPath, String sitePath){
		InputStream is = null;

		try {
			if (sitePath != null) {
				// try to get file with site
				try {
					is = PropertiesUtil.class.getClassLoader().getResourceAsStream(sitePath);
				} catch (Exception e){}
			}
			if (is == null) {
				// try default
				is = PropertiesUtil.class.getClassLoader().getResourceAsStream(defaultPath);
			}

		} catch (Exception e) {
			logger.error("Unable to create a valid InputStreamReader from: "+sitePath + " or " + defaultPath);
			e.printStackTrace();
		}
		return is;
	}

}
