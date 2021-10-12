package it.maw.choc.ws;

import it.maw.choc.model.ChocModel;
import it.maw.choc.model.ChocUtil;
import it.maw.scan.capturing.service.TransformationService;
import it.maw.scan.capturing.ticket.TicketsManager;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;


/**
 * @author federico
 *
 */
public class EditorSave extends DeclarativeWebScript {

	@Override
	public Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache){
		Map<String, Object> model = new HashMap<String, Object>();
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		// get parameters
		NodeRef node = null;
		boolean pdf = false;
		String text = null, type = null;
		try {
			JSONObject json = new JSONObject(req.getContent().getContent());
			node = new NodeRef(json.getString("noderef"));
			pdf = json.getBoolean("pdf");
			text = json.getString("text");
			type = json.getString("type");
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
		
		NodeRef file;
		String mime = null;
		if(serviceRegistry.getFileFolderService().getFileInfo(node).isFolder()){
			// è una cartella, creo il documento
			String name = ChocUtil.checkFilename(node, "Nuovo documento."+type);
			file = serviceRegistry.getFileFolderService().create(node, name, ContentModel.TYPE_CONTENT).getNodeRef();
			if(type.equals("txt")){
				mime = MimetypeMap.MIMETYPE_TEXT_PLAIN;
			} else {
				mime = MimetypeMap.MIMETYPE_HTML;
			}
		} else {
			file = node;
		}
		//Adding versionable Aspect
		if (!serviceRegistry.getNodeService().hasAspect(file, ContentModel.ASPECT_VERSIONABLE)){
			serviceRegistry.getNodeService().addAspect(file, ContentModel.ASPECT_VERSIONABLE, null);
		}
		// salvo il contenuto
		ContentWriter writer = serviceRegistry.getContentService().getWriter(file, ContentModel.PROP_CONTENT, true);
		if(mime!=null){
			writer.setMimetype(mime);
		}
		writer.putContent(text);
		
		// se è stato richiesto il pdf trasformo il file
		if(pdf){
			ContentReader reader = serviceRegistry.getContentService().getReader(file, ContentModel.PROP_CONTENT);
			InputStream is = null;
			try {
				is = TransformationService.toPdf(reader , false);
			} catch (Exception e) {}
			if(is!=null){
				writer = serviceRegistry.getContentService().getWriter(file, ContentModel.PROP_CONTENT, true);
				writer.setMimetype(MimetypeMap.MIMETYPE_PDF);
				writer.putContent(is);
				//rename
				NodeRef parent = serviceRegistry.getNodeService().getPrimaryParent(file).getParentRef();
				String name = serviceRegistry.getNodeService().getProperty(file, ContentModel.PROP_NAME).toString();
				name = ChocUtil.checkFilename(parent, name + TicketsManager.FORMAT_PDF);
				serviceRegistry.getNodeService().setProperty(file, ContentModel.PROP_NAME, name);
			}
		}
				
		model.put("success", true);
		model.put("noderef", file.toString());
		return model;
	}
}
