package it.maw.choc.model;

import org.alfresco.model.ContentModel;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.dictionary.DictionaryService;
import org.alfresco.service.cmr.dictionary.PropertyDefinition;
import org.alfresco.service.cmr.dictionary.TypeDefinition;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.Path;
import org.alfresco.service.namespace.QName;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.log4j.Logger;

import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.ParseException;
import java.util.*;

public class ChocUtil {
	private static Logger logger = Logger.getLogger(ChocUtil.class);
	
	private ChocUtil(){}

	/**
	 * check if in parent exists file with specified name, and propose new name
	 * @param parent
	 * @param name
	 * @return
	 */
	public static String checkFilename(NodeRef parent, String name){
		String fileName = name;
		boolean isValid = false;
		int cont = 1;
		do {
			NodeRef existsNode = ChocModel.getServiceRegistry().getNodeService().getChildByName(parent, ContentModel.ASSOC_CONTAINS, fileName);
			if (existsNode==null) {
				isValid = true;
			} else {
				if (fileName.contains(".")){
					fileName = name.substring(0, name.lastIndexOf(".")) + "-" + cont + name.substring(name.lastIndexOf("."));
				}
				else{
					fileName = name + "-" + cont;
				}
				cont++;
			}
		} while (!isValid);
		return fileName;
	}
	
	/**
	 * from property name, get datatype
	 * @param prop
	 * @return
	 */
	public static String getPropertyType(String prop){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		QName propQ = QName.createQName(prop, serviceRegistry.getNamespaceService());
		PropertyDefinition propDef = ChocModel.getServiceRegistry().getDictionaryService().getProperty(propQ);
		if(propDef!=null){
			return propDef.getDataType().getName().getPrefixString(); 
		}
		return null;
	}
	
	/**
	 * return if property is multiple
	 * @param prop
	 * @return
	 */
	public static boolean isPropertyMultiple(String prop){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		QName propQ = QName.createQName(prop, serviceRegistry.getNamespaceService());
		PropertyDefinition propDef = ChocModel.getServiceRegistry().getDictionaryService().getProperty(propQ);
		if(propDef!=null){
			return propDef.isMultiValued();
		}
		return false;
	}

	/**
	 * return true is value is an alfresco type
	 */
	public static boolean isType(String value){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		QName type = QName.createQName(value, serviceRegistry.getNamespaceService());
		return !serviceRegistry.getDictionaryService().getClass(type).isAspect();
	}

	public static boolean isType(QName value){
		return !ChocModel.getServiceRegistry().getDictionaryService().getClass(value).isAspect();
	}

	/**
	 * get site path of a node (container excluded)
	 * @param nodeRef nodeRef path
	 */
	public static String getSitePath(NodeRef nodeRef){
		NodeService nodeService = ChocModel.getServiceRegistry().getNodeService();
		Path path = nodeService.getPath(nodeRef);
		path = path.subPath(5, path.size()-1);
		String displayPath = path.toDisplayPath(nodeService, ChocModel.getServiceRegistry().getPermissionService());
		displayPath += "/"+nodeService.getProperty(nodeRef, ContentModel.PROP_NAME).toString();
		return displayPath; // Titolo/Classe/Fascicolo
	}

	/**
	 * Create Structure YEAR-MONTH from a container or a folder
	 * @param container
	 * @return
	 * @deprecated use Tree service instead
	 */
	@Deprecated
	public static NodeRef checkStructureFolder(NodeRef container){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();

		Calendar calendar = Calendar.getInstance();
		calendar.setTime(new Date());
		String year = String.valueOf(calendar.get(Calendar.YEAR));
		String month = String.valueOf(calendar.get(Calendar.MONTH) + 1);

		NodeRef yearNode = serviceRegistry.getNodeService().getChildByName(container, ContentModel.ASSOC_CONTAINS, year);
		if(yearNode==null){
			yearNode = serviceRegistry.getFileFolderService().create(container, year, ContentModel.TYPE_FOLDER).getNodeRef();
		}

		NodeRef monthNode = serviceRegistry.getNodeService().getChildByName(yearNode, ContentModel.ASSOC_CONTAINS, month);
		if(monthNode==null){
			monthNode = serviceRegistry.getFileFolderService().create(yearNode, month, ContentModel.TYPE_FOLDER).getNodeRef();
		}

		return monthNode;
	}

	/**
	 * Get unix timestamp
	 * @return unix timestamp
     */
	public static String getUnixTimestamp(){
		long unixTime = System.currentTimeMillis() / 1000L;
		return String.valueOf(unixTime).toString();
	}

	/** get timezone of a date in format yyyy-MM-dd for query use**/
	public static String getOffsetTimezone(String date){
		String offset = "Z";
		try {
			offset = ChocModel.timezoneFormatter.format(ChocModel.dateYearDashFormatter.parse(date));
			offset = offset.substring(0, 3);
		} catch (ParseException e) {
			// nothing
		}
		return offset;
	}

	/**
	 * Get title of node
	 * @param node
	 * @return
	 */
	public static QName getNodeType(NodeRef node){
		return ChocModel.getServiceRegistry().getNodeService().getType(node);
	}
		
	/**
	 * Get title of node 
	 * @param node
	 * @return
	 */
	public static String getTypeTitle(NodeRef node){
    	ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
    	TypeDefinition typeDef = serviceRegistry.getDictionaryService().getType(serviceRegistry.getNodeService().getType(node));
    	return typeDef.getTitle(null);
    }
	
	/**
	 * create folders if does not exist
	 * @param folders list
	 * @return
	 */
	public static void checkFolders(List<String> folders) throws Exception {
		for (Iterator<String> iterator = folders.iterator(); iterator.hasNext();) {
			String folder = iterator.next();
			File folderF = new File(folder);
			if (!folderF.exists() || !folderF.isDirectory()){
				if (folderF.mkdirs()) {
					logger.debug("Directory is created at: "+folder);
				} else {
					logger.debug("Failed to create directory: "+folder);
					throw new IOException("Failed to create directory: '"+folder+ "'. Check if the specified path exists and is read/writable.");
				}				
			}else if (!folderF.canRead() || !folderF.canWrite()) {
					logger.debug("Check directory permission: "+folder);
					throw new IOException("Unable to access the directory: '"+folder+ "'. Check if the specified path is read/writable.");
				}
		}
	}
	
	/**
	 * Retrieves the NodeRef of the Choc folder.
	 * @return NodeRef
	 */
	public static NodeRef getChocFolder(){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		NodeService nodeService= serviceRegistry.getNodeService();
		NodeRef chocFolder = null;
		try {
			NodeRef sitesFolder = serviceRegistry.getSiteService().getSiteRoot();
			NodeRef companyhome = serviceRegistry.getNodeService().getPrimaryParent(sitesFolder).getParentRef();
			chocFolder = nodeService.getChildByName(companyhome, ContentModel.ASSOC_CONTAINS, ChocModel.FOLDER_CHOC);
		} catch (Exception e) {
			logger.error("Exception while trying to retrieve '"+ChocModel.FOLDER_CHOC+"' NodeRef."+e);
		}
		return chocFolder;
	}

	/**
	 * Checks WEB host connection
	 * @param url
	 * @return
	 * @throws MalformedURLException
	 */
	public static Boolean isHostHTTPAvailable(String url) throws MalformedURLException {
		Boolean up = false;
		URL obj = new URL(url);
		try {
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();
			con.setRequestMethod("GET");
			con.setRequestProperty("User-Agent", "Mozilla/5.0");
			if (con.getResponseCode()==200) {
				up=true;
			}
		} catch (Exception e) {
			logger.error("Unable to create URL connection: "+url+" - "+e);
			return up;
		} 
		return up;
	}	
	
	/**
	 * Checks FTP host connectivity
	 * @param host
	 * @param port
	 * @param user
	 * @param passwd
	 * @return
	 */
	public static Boolean isHostFTPAvailable(String host, int port, String user, String passwd){
		boolean answer = false;
		FTPClient ftpClient = new FTPClient();
		try {
			ftpClient.connect(host, port);
			ftpClient.login(user, passwd);
			answer=true;
		} catch (IOException e) {
			logger.error("Unable to connect to FTP host: "+user+"@"+host+":"+port+" - Exception: "+e);			
		}
		return answer;	       
	}

	/**
	 * Retrieves the NodeRef of the companyhome
	 * @return NodeRef
	 */
	public static NodeRef getCompanyhome(){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		NodeRef sitesFolder = serviceRegistry.getSiteService().getSiteRoot();
		return serviceRegistry.getNodeService().getPrimaryParent(sitesFolder).getParentRef();
	}

	/**
	 * Get Resource Bundle
	 * @param rbPath
	 * @return
	 */
	public static ResourceBundle getRB(String rbPath) {
		ResourceBundle rb = null;		
		try {
			rb = ResourceBundle.getBundle(rbPath + "_ext");
		} catch (MissingResourceException e) {
			rb = ResourceBundle.getBundle(rbPath);
		}		
		logger.info("Loaded ResourceBundle: " + rb.getBaseBundleName());
		return rb;
	}
	
}
