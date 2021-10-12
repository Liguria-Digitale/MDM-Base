package it.maw.scan.webscripts;

import it.maw.choc.model.ChocModel;
import it.maw.choc.util.RepoUtil;
import it.maw.scan.capturing.ticket.Ticket;
import it.maw.scan.capturing.ticket.TicketsManager;
import org.alfresco.service.cmr.dictionary.DataTypeDefinition;
import org.alfresco.service.cmr.dictionary.PropertyDefinition;
import org.alfresco.service.cmr.dictionary.TypeDefinition;
import org.alfresco.service.namespace.QName;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

import java.io.Serializable;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * @author Federico Tarantino
 *
 */
public class CreateTicket extends DeclarativeWebScript {
	
	public static SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

	/**
	 * @see org.springframework.extensions.webscripts.DeclarativeWebScript#executeImpl(org.springframework.extensions.webscripts.WebScriptRequest, org.springframework.extensions.webscripts.Status)
	 */
	@Override
	protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
		//get properties
		String ocr, language, name, destination, type;
		try {
			JSONObject json = new JSONObject(req.getContent().getContent());
			ocr = json.getString("ocr");
			language = json.getString("language");
			name = json.getString("name");
			destination = json.getString("destination");
			type = json.getString("type");
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}

		// create ticket
		Ticket ticket = TicketsManager.create();
		// set ticket param
		if(ocr!=null){
			ticket.setOcrActive(Boolean.parseBoolean(ocr));
		}
		// se ocr è attivo, forzo pdf
		if(ticket.isOcrActive()){
			ticket.setTargetFormat(TicketsManager.FORMAT_PDF);
		}
		if(language!=null){
			ticket.setOcrLanguage(language);
		}
		ticket.setOutputName(RepoUtil.validateAlfrescoName(name));
		ticket.setDestination(destination);
		QName typeDef = QName.createQName(type, ChocModel.getServiceRegistry().getNamespaceService());
		ticket.setType(typeDef);
		ticket.getUploadParam().putAll(extractProps(typeDef, req));
		Map<String, Object>	model = new HashMap<String, Object>();
		model.put("ticket", ticket.getId());
		return model;
	}

	// TO REFACTOR
	public Map<QName, Serializable> extractProps(QName type, WebScriptRequest req){
		Map<QName, Serializable> props = new HashMap<QName, Serializable>();
		// prendo le proprietà
		TypeDefinition propsDef = ChocModel.getServiceRegistry().getDictionaryService().getType(type);
		String[] names = req.getParameterNames();
		for (String name : names) {
			String value = req.getParameter(name);
			if(name.contains(":") && !value.trim().equals("")){
				QName propQ = QName.createQName(name, ChocModel.getServiceRegistry().getNamespaceService());
				PropertyDefinition propDef = propsDef.getProperties().get(propQ);
				DataTypeDefinition propType = propDef.getDataType();
				if(propType.equals(DataTypeDefinition.DATETIME)){
					try {
						props.put(propQ, formatter.parse(value));
					} catch (ParseException e) {
						props.put(propQ, new Date());
					}
				} else if(propType.equals(DataTypeDefinition.INT)){
					props.put(propQ, Integer.parseInt(value));
				} else if(propType.equals(DataTypeDefinition.FLOAT)){
					props.put(propQ, Double.parseDouble(value));
				} else if(propType.equals(DataTypeDefinition.BOOLEAN)){
					props.put(propQ, Boolean.parseBoolean(value));
				} else {
					props.put(propQ, value);
				}
			}
		}	
		return props;
	}
	
}
