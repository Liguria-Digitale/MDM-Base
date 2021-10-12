package it.maw.choc.ws.utils;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.alfresco.repo.bulkimport.BulkImportParameters;
import org.alfresco.repo.bulkimport.BulkImportStatus;
import org.alfresco.repo.bulkimport.NodeImporter;
import org.alfresco.repo.bulkimport.impl.MultiThreadedBulkFilesystemImporter;
import org.alfresco.repo.bulkimport.impl.StreamingNodeImporterFactory;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

/**
 * @author Federico Tarantino
 * Web Script class that invokes a BulkFilesystemImporter implementation
 */
public class ServerImporter extends DeclarativeWebScript {

	private StreamingNodeImporterFactory importerFactory;
	private MultiThreadedBulkFilesystemImporter bulkImporter;
	
    /**
     * @see org.springframework.extensions.webscripts.DeclarativeWebScript#executeImpl(org.springframework.extensions.webscripts.WebScriptRequest, org.springframework.extensions.webscripts.Status, org.springframework.extensions.webscripts.Cache)
     */
    @Override
    protected Map<String, Object> executeImpl(WebScriptRequest request, Status status, Cache cache) {
    	
        Map<String, Object> model  = new HashMap<String, Object>();
		String noderef = null, path = null;
		try {
			JSONObject json = new JSONObject(request.getContent().getContent());
			noderef = json.getString("noderef");
			path = json.getString("path");
		} catch (Exception e) {
			e.printStackTrace();
		}

        cache.setNeverCache(true);
        
        NodeImporter nodeImporter = importerFactory.getNodeImporter(new File(path.trim()));
        
        try {
        	if(!bulkImporter.getStatus().inProgress()){
            	BulkImportParameters bulkImportParameters = new BulkImportParameters();
                bulkImportParameters.setDisableRulesService(false);
                bulkImportParameters.setReplaceExisting(true);
                bulkImportParameters.setTarget(new NodeRef(noderef));
                bulkImporter.bulkImport(bulkImportParameters, nodeImporter);

                model.put("statusM", "started");
				BulkImportStatus impStatus = bulkImporter.getStatus();
				model.put("duration", impStatus.getDurationInNs());
				model.put("created", impStatus.getNumberOfContentNodesCreated());
				model.put("replaced", impStatus.getNumberOfContentNodesReplaced());
				model.put("skipped", impStatus.getNumberOfContentNodesSkipped());
				model.put("error", impStatus.getLastExceptionAsString());
            } else {
            	model.put("statusM", "progress");
            }
		} catch (Exception e) {
			model.put("statusM", "error");
			model.put("error", e.getMessage());
		}
                
        return model;
    }

	/**
	 * @return the importerFactory
	 */
	public StreamingNodeImporterFactory getImporterFactory() {
		return importerFactory;
	}

	/**
	 * @param importerFactory the importerFactory to set
	 */
	public void setImporterFactory(StreamingNodeImporterFactory importerFactory) {
		this.importerFactory = importerFactory;
	}

	/**
	 * @return the bulkImporter
	 */
	public MultiThreadedBulkFilesystemImporter getBulkImporter() {
		return bulkImporter;
	}

	/**
	 * @param bulkImporter the bulkImporter to set
	 */
	public void setBulkImporter(MultiThreadedBulkFilesystemImporter bulkImporter) {
		this.bulkImporter = bulkImporter;
	}

}