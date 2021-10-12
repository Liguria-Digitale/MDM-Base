package it.maw.choc.ws.audit;

import it.maw.choc.model.ServiceExecutor;
import it.maw.choc.service.Audit;
import org.activiti.engine.impl.util.json.JSONObject;
import org.alfresco.service.cmr.repository.NodeRef;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

import java.io.IOException;
import java.util.Iterator;
import java.util.Map;

/**
 * @author Federico Tarantino
 * Web Script class that invokes a BulkFilesystemImporter implementation
 */
public class InsertAudit extends DeclarativeWebScript {

    /**
     * @see DeclarativeWebScript#executeImpl(WebScriptRequest, Status, Cache)
     */
    @SuppressWarnings("unchecked")
	@Override
    protected Map<String, Object> executeImpl(WebScriptRequest request, Status status, Cache cache) {

		try {
			JSONObject json = new JSONObject(request.getContent().getContent());

			Audit entry = new Audit();
			// get mandatory params
			entry.setAction(json.getString("action"));
			entry.setAuditType(json.getString("type"));
			
			if (!json.optString("nodename").isEmpty()){
				entry.setNodeName(json.getString("nodename"));
			}
			if (!json.optString("sitename").isEmpty()){
				entry.setSite(json.getString("sitename"));	
			}
			
			// get list params
			JSONObject paramsJson = json.getJSONObject("params");
			Iterator<String> keys = paramsJson.keys();
			while (keys.hasNext()){
				String key = keys.next();
				entry.getParams().put(key, paramsJson.getString(key));
			}
			
			// get paramsAsString
			JSONObject paramsString = json.getJSONObject("paramsstring");
			Iterator<String> keys2 = paramsString.keys();
			while (keys2.hasNext()){
				String key2 = keys2.next();
				entry.getParamsString().add(paramsString.getString(key2));
			}

			// save audit
			ServiceExecutor.execute(entry, new NodeRef(json.getString("noderef")));

		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
    }

}