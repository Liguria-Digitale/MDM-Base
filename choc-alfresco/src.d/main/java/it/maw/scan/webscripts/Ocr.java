package it.maw.scan.webscripts;

import it.maw.choc.model.ChocModel;
import it.maw.scan.capturing.service.TransformationService;
import it.maw.scan.capturing.ticket.Ticket;
import it.maw.scan.capturing.ticket.TicketsManager;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.commons.io.IOUtils;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

/**
 * @author Federico Tarantino
 *
 */
public class Ocr extends DeclarativeWebScript {
	
	/**
	 * @see org.springframework.extensions.webscripts.DeclarativeWebScript#executeImpl(org.springframework.extensions.webscripts.WebScriptRequest, org.springframework.extensions.webscripts.Status)
	 */
	@Override
	protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		Map<String, Object> model = new HashMap<String, Object>();
		NodeRef doc = new NodeRef(req.getParameter("noderef"));
		Ticket tempTicket = TicketsManager.create();
		tempTicket.setOcrLanguage(req.getParameter("lang"));
		// create a temp file for ocr, from noderef
		String name = serviceRegistry.getNodeService().getProperty(doc, ContentModel.PROP_NAME).toString();
		File tempFile = new File(tempTicket.getWorkPath()+name);
		InputStream tempIs = serviceRegistry.getContentService().getReader(doc, ContentModel.PROP_CONTENT).getContentInputStream();
		try {
			IOUtils.copy(tempIs, new FileOutputStream(tempFile));
		} catch (Exception e) {
			e.printStackTrace();
		}
		// call ocr engine
		TransformationService.tesseract(tempFile, tempTicket);
		// retrieve output file
		File ocrFile = new File(tempTicket.getWorkPath() + TicketsManager.PAGE_NAME + tempTicket.getPages() + TicketsManager.FORMAT_PDF);
		if(ocrFile.exists()){
			String parentString = req.getParameter("parent");
			NodeRef parent;
			if(parentString==null){
				parent = serviceRegistry.getNodeService().getPrimaryParent(doc).getParentRef();
			} else {
				parent = new NodeRef(parentString);
			}
			String newname = name.substring(0, name.lastIndexOf(".")) + "-ocr.pdf";
			NodeRef ocrNode = serviceRegistry.getFileFolderService().create(parent, newname, ContentModel.TYPE_CONTENT).getNodeRef();
			ContentWriter writer = serviceRegistry.getContentService().getWriter(ocrNode, ContentModel.PROP_CONTENT, true);
			writer.setMimetype(MimetypeMap.MIMETYPE_PDF);
			try {
				writer.putContent(new FileInputStream(ocrFile));
			} catch (Exception e) {
				e.printStackTrace();
			}
			model.put("success", true);
			model.put("noderef", ocrNode);
		} else {
			model.put("success", false);
			model.put("noderef", "");
		}
		return model;
	}
	
}
