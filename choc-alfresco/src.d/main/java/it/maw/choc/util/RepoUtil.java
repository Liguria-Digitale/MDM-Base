package it.maw.choc.util;

import it.maw.choc.model.ChocModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.content.encoding.ContentCharsetFinder;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.security.AccessStatus;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.TempFileProvider;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.apache.tika.Tika;

import java.io.*;
import java.net.URLDecoder;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Created by federico on 03/07/15.
 */
public class RepoUtil {
	private static Logger logger = Logger.getLogger(RepoUtil.class);

	private RepoUtil(){}

	/**
	 * validate name for alfresco folder/file
	 * @param name to be validate
	 * @return validated name
	 */
	public static String validateAlfrescoName(String name){
		try {
			name = URLDecoder.decode(name, "UTF-8");
		} catch (Exception e) {
			logger.warn("No decodable string: "+e.getMessage());
		}
		name =  name
						.replaceAll("[\\\\/]", "-")
						.replaceAll(":", " ")
						.replaceAll("\\*", " ")
						.replaceAll("\"", "'")
						.replaceAll("\\?", " ")
						.replaceAll("\\|", "l")
						.replaceAll("<", "(")
						.replaceAll(">", ")")
						.trim();
		while(name.endsWith(".")){
			name = name.substring(0, name.length()-1);
			name = name.trim();
		}
		return name.replaceAll("  ", " ");
	}

	public static String limitFileNameLength(String name, int maxLength){
		int indexExt = name.lastIndexOf(".");
		if(indexExt!=-1){
			String ext = name.substring(indexExt);
			String limetedName = name.substring(0, indexExt);
			if(limetedName!=null && limetedName.length()>maxLength) limetedName = limetedName.substring(0,maxLength);
			name = limetedName + ext;
		}else if (name.length() > maxLength){
			name = name.substring(0,maxLength);
		}
		return name;
	}

	/**
	 * @param parent noderef of parent folder
	 * @param name name to check
	 * @return valid name for child
	 */
	public static String checkChildName(NodeRef parent, String name){
		String base = FilenameUtils.getBaseName(name);
		String extension = FilenameUtils.getExtension(name);
		if (extension != null && !extension.isEmpty()) {
			extension = "."+extension;
		}
		else {
			extension = "";
		}
		String folderName = base+extension;
		boolean isValid = false;
		int cont = 1;
		do {
			NodeRef existsNode = ChocModel.getServiceRegistry().getNodeService().getChildByName(parent, ContentModel.ASSOC_CONTAINS, folderName);
			if (existsNode==null) {
				isValid = true;
			} else {
				folderName = base + "-" + cont + extension;
				cont++;
			}
		} while (!isValid);
		return folderName;
	}

	/**
	 * Write content to the node from InputStream.
	 *
	 * @param nodeRef Target node.
	 * @param content Content stream.
	 * @param mimetype MIME content type.
	 * @param encoding Encoding. Can be null for text based content, n which case the best guess.
	 */
	public static void writeContent(NodeRef nodeRef, InputStream content, String mimetype, String encoding) {
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		InputStream bis = new BufferedInputStream(content, 4092);

		// Set generic mimetype if it is null
		if(mimetype==null){
			mimetype = MimetypeMap.MIMETYPE_BINARY;
		}

		// Only guess the encoding if it has not been supplied
		if(encoding==null){
			if(serviceRegistry.getMimetypeService().isText(mimetype)){
				ContentCharsetFinder charsetFinder = serviceRegistry.getMimetypeService().getContentCharsetFinder();
				encoding = charsetFinder.getCharset(bis, mimetype).name();
			} else {
				encoding = "UTF-8";
			}
		}

		ContentService contentService = serviceRegistry.getContentService();
		ContentWriter writer = contentService.getWriter(nodeRef, ContentModel.PROP_CONTENT, true);
		writer.setMimetype(mimetype);
		writer.setEncoding(encoding);
		writer.putContent(bis);
	}

	/**
	 * get reader for a node
	 */
	public static ContentReader getReader(NodeRef node){
		return ChocModel.getServiceRegistry().getContentService().getReader(node, ContentModel.PROP_CONTENT);
	}

	/**
	 * get inputstream for a node
	 */
	public static InputStream getInpuStream(NodeRef node){
		return getReader(node).getContentInputStream();
	}

	/**
	 * get writer for a node
	 */
	public static ContentWriter getWriter(NodeRef node){
		return ChocModel.getServiceRegistry().getContentService().getWriter(node, ContentModel.PROP_CONTENT, true);
	}

	/**
	 * get outputstream of a node
	 */
	public static OutputStream getOutputstream(NodeRef node){
		return getWriter(node).getContentOutputStream();
	}

	/**
	 * convert noderef strings to java object
	 */
	public static List<NodeRef> toNodeRefs(String stringRefs){
		List<NodeRef> refs = new ArrayList<>();
		if(stringRefs!=null && stringRefs.trim().length()>0){
			String[] attachRefs = stringRefs.trim().split(",");
			for (String attach : attachRefs) {
				refs.add(new NodeRef(attach));
			}
		}
		return refs;
	}

	/**
	 * convert noderef strings to java object with check of username (converted to noderef)
	 */
	public static List<NodeRef> toNodeRefsWithUsers(String stringRefs){
		List<NodeRef> refs = new ArrayList<>();
		if(stringRefs!=null && stringRefs.trim().length()>0){
			ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
			String[] stringRefsArray = stringRefs.trim().split(",");
			for (String stringRef : stringRefsArray) {
				if(stringRef.startsWith(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE.toString())) {
					refs.add(new NodeRef(stringRef));
				} else {
					NodeRef person = serviceRegistry.getPersonService().getPerson(stringRef);
					if(person!=null) {
						refs.add(person);
					}
				}
			}
		}
		return refs;
	}

	/**
	 * get qname type from string
	 */
	public static QName getQName(String type){
		return QName.createQName(type, ChocModel.getServiceRegistry().getNamespaceService());
	}

	/**
	 * Check if node is under Titolario repository portion
	 * @param node
	 * @return
	 */
	public static boolean isInTitolario(NodeRef node){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		List<Path> paths = serviceRegistry.getNodeService().getPaths(node, false);
		for (Iterator<Path> iterator = paths.iterator(); iterator.hasNext();) {
			Path path = iterator.next();
			if (path.toPrefixString(serviceRegistry.getNamespaceService()).contains("/cm:documentLibrary")){
				return true;
			}
		}
		return false;
	}

	/**
	 * Create a folder node into a given parent.
	 * @return NodeRef
	 */
	public static NodeRef createFolder(NodeRef parent, String folderName){
		FileFolderService fileFolderService = ChocModel.getServiceRegistry().getFileFolderService();
		NodeRef node = null;
		try {
			node = fileFolderService.create(parent, folderName, ContentModel.TYPE_FOLDER).getNodeRef();
		} catch (Exception e) {
			logger.error("Exception while trying to create folder '"+folderName+"in parent: "+parent);
			logger.error(e);
		}
		return node;
	}

	/**
	 * Inputstream mimetype detection using Apache Tika library (http://tika.apache.org/).
	 * @param is
	 * @return
	 */
	public static String getMimetypeTika(InputStream is){
		String mime = "application/octet-stream";
		if (is!=null) {
			Tika tika = new Tika();
			try {
				mime = tika.detect(is);
				logger.debug("Mimetype of the InputStream retrieved (Tika): "+mime);
			} catch (IOException e) {
				logger.error("Unable to detect mimetype of the origin InputStream:  "+e);
				logger.warn("Setting up a mimetype default value to: "+mime);
			}
		}
		return mime;
	}

	/**
	 * Changes the mimetype of a content from octect-stream to pdf and updates the file extension if not exists.
	 * @param sourceNode
	 */
	public static void octectstreamToPdf (NodeRef sourceNode){
		ContentReader sourceReader = getReader(sourceNode);
		String originalName =(String) ChocModel.getServiceRegistry().getNodeService().getProperty(sourceNode, ContentModel.PROP_NAME);
		if (sourceReader != null && sourceReader.exists()){
			logger.warn("It seems the mimetype of the origin Content stream "+MimetypeMap.MIMETYPE_PDF+" does not match the value identified by the file extension. Trying to update mimetype from octect-stream to pdf...");
			ContentWriter writer = ChocModel.getServiceRegistry().getContentService().getWriter(sourceNode, ContentModel.PROP_CONTENT, true);
			try {
				logger.debug("Trying to update the Mimetype of the origin: "+sourceReader.getMimetype());
				writer.setMimetype(MimetypeMap.MIMETYPE_PDF);
				writer.putContent(sourceReader);
				sourceReader = writer.getReader();
				logger.debug("Content Mimetype updated: "+sourceReader.getMimetype());

				logger.debug("Trying to update the File Name of the origin: "+originalName);
				if (!StringUtils.containsIgnoreCase(originalName, ".pdf")) {
					String updatedName = originalName+".pdf";
					ChocModel.getServiceRegistry().getNodeService().setProperty(sourceNode, ContentModel.PROP_NAME, updatedName);
					logger.debug("File Name updated with .pdf extension: "+updatedName);
				}
			} catch (ContentIOException e) {
				logger.error("Unable to update Content Mimetype: "+e);
			}
		}
	}

	/**
	 * Creates a temp file into the file system (by default <tomcat>/temp/Alfresco)
	 * by using the provided noderef as file name and parent directory name.
	 *
	 * @param nodeRef
	 * @return
	 */
	public static File getTempFile(NodeRef nodeRef) {
		File alfTempDir = TempFileProvider.getTempDir();
		File toolkitTempDir = new File(alfTempDir.getPath() + File.separatorChar + nodeRef.getId());
		toolkitTempDir.mkdir();
		File file = new File(toolkitTempDir, ChocModel.getServiceRegistry().getFileFolderService().getFileInfo(nodeRef).getName());

		return file;
	}


	/**
	 * A method to create a temp archive zip file into temporary folder
	 * (default <tomcat>/temp/Alfresco) from a List of NodeRef.
	 *
	 * @param noderefs
	 * @return tempFile
	 */
	public static File createZip(List<NodeRef> noderefs) {
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		NodeService nodeService = serviceRegistry.getNodeService();
		ContentService contentService = serviceRegistry.getContentService();
		File createdZip = null;
		if (noderefs != null && noderefs.size()>0){
			try{
				createdZip = File.createTempFile(UUID.randomUUID().toString(), ".zip");
				FileOutputStream fos = new FileOutputStream(createdZip);
				ZipOutputStream zos = new ZipOutputStream(fos);
				for (Iterator<NodeRef> iterator = noderefs.iterator(); iterator.hasNext();) {
					NodeRef nodeRef = iterator.next();
					String nodeName = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_NAME);
					ContentReader reader = contentService.getReader(nodeRef, ContentModel.PROP_CONTENT);
					InputStream is = reader.getContentInputStream();
					ZipEntry zipEntry = new ZipEntry(nodeName);
					zos.putNextEntry(zipEntry);
					byte[] bytes = new byte[1024];
					int length;
					while ((length = is.read(bytes)) >= 0) {
						zos.write(bytes, 0, length);
					}
					zos.closeEntry();
					is.close();
					logger.debug("Noderef '" + nodeRef.toString() + "' aggiunto nell'archivio zip");
				}
				zos.close();
				fos.close();
			}
			catch (Exception e) {
				logger.error("Errore nella creazione del file zip");
				e.printStackTrace();
			}
		}
		else{
			logger.warn("Attenzione, impossibile creare il file zip senza nodi e senza path");
		}
		return createdZip;
	}

	public static boolean hasReadPermission(NodeRef nodeRef){
		AccessStatus access = ChocModel.getServiceRegistry().getPermissionService().hasPermission(nodeRef, PermissionService.READ);
		return access.equals(AccessStatus.ALLOWED);
	}

	public static boolean hasWritePermission(NodeRef nodeRef){
		AccessStatus access = ChocModel.getServiceRegistry().getPermissionService().hasPermission(nodeRef, PermissionService.WRITE);
		return access.equals(AccessStatus.ALLOWED);
	}

	/**
	 * Prints the progress percentage in a for-loop.
	 */
	public static void logInfoProgressPercentage(int currentLoopIndex, int loopSize, String logHeader) {
		DecimalFormat df = new DecimalFormat("#.##");
		float perc = (float) currentLoopIndex*100/loopSize;
		if (currentLoopIndex==loopSize-1) {
			logger.info(logHeader+" - "+(currentLoopIndex+1)+"/"+loopSize+" Finished...100 %");
		}else{
			logger.info(logHeader+" - "+(currentLoopIndex+1)+"/"+loopSize+" Progress..."+df.format(perc)+" %");
		}
	}

	/**
	 * Creates a list of unique random numbers from a given range.
	 * @param min
	 * @param max
	 * @param totalToGet
	 * @return
	 */
	public static List<Integer> getRandomNumberList(int min, int max, int totalToGet){
		ArrayList<Integer> list = new ArrayList<Integer>();
		for (int i=min; i<max; i++) {
			list.add(new Integer(i));
		}
		Collections.shuffle(list);
		ArrayList<Integer> listWithRandomNumbers = new ArrayList<Integer>();
		for (int i=0; i<totalToGet; i++) {
			listWithRandomNumbers.add(list.get(i));
		}
		return listWithRandomNumbers;
	}

	public static NodeRef getContainer(NodeRef node){

		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		NodeService nodeService = serviceRegistry.getNodeService();

		NodeRef container = null;
		NodeRef childNode = node;
		while (container == null){
			if (nodeService.hasAspect(childNode, SiteModel.ASPECT_SITE_CONTAINER)){
				container = childNode;
				break;
			} else {
				childNode = nodeService.getPrimaryParent(childNode).getParentRef();
			}
		}
		return container;
	}

	public static String getContainerName(NodeRef node){
		return (String) ChocModel.getServiceRegistry().getNodeService().getProperty(RepoUtil.getContainer(node), ContentModel.PROP_NAME);
	}

	public static String getSiteNameFromNodeRef(NodeRef node){
		String sitename = null;
		if (node != null) {
			ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
			SiteService siteService = serviceRegistry.getSiteService();
			SiteInfo siteInfo = siteService.getSite(node);
			if (siteInfo != null) {
				sitename = siteInfo.getShortName();
			}
		}
		return sitename;
	}
}
