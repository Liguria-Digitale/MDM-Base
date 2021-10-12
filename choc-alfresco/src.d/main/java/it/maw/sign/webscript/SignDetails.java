package it.maw.sign.webscript;

import it.maw.choc.model.ServiceExecutor;
import it.maw.choc.service.sign.SignatureDetails;
import it.maw.choc.service.sign.SignatureDetailsRetriever;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.log4j.Logger;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A webscript to get the signature details from a signed content stream. The Noderef parameter of the source content is mandatory.
 * 
 * @author Giuseppe Urso
 *
 */
public class SignDetails extends DeclarativeWebScript {
	 private Logger logger = Logger.getLogger(SignDetails.class);
	
	@Override
	protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
		Map<String, Object>	model = new HashMap<String, Object>();
		model.put("success", false);
		
		if (req.getParameter("noderef")!=null && !req.getParameter("noderef").equals("")) {
			NodeRef nodeRef = new NodeRef(req.getParameter("noderef"));
			logger.debug("Signature Details request received for NodeRef: "+nodeRef);
			SignatureDetailsRetriever signatureDetailService = new SignatureDetailsRetriever();
			ServiceExecutor.execute(signatureDetailService, nodeRef);
			List<SignatureDetails> signatureDetailsList = signatureDetailService.getSignatureDetailsList();
			
			if (signatureDetailsList!=null && signatureDetailsList.size()>0) {
				logSignatureProperties(signatureDetailsList);
				model.put("success", true);
				model.put("noderef", req.getParameter("noderef"));
				model.put("signatureDetails", signatureDetailsList);
			}else{
				String msg = "Unable to retrieve signature details. List of signatures is empty for noderef "+nodeRef;
				logger.warn(msg);
			}
		}else {
			String msg = "Parameter {noderef} is missing. The Noderef of the source content is mandatory.";
			logger.warn(msg);
		}
		return model;
	}
	
	/**
	 * A method to print verbose log of signature properties.
	 * @param signatureDetailsList
	 */
	private void logSignatureProperties(List<SignatureDetails> signatureDetailsList){
		for (int i = 0; i < signatureDetailsList.size(); i++) {
			logger.debug("==== [sign-"+i+"] "+signatureDetailsList.get(i).getSignName()+" ====");
			logger.debug("Signature signDate: " +signatureDetailsList.get(i).getSignDate());
			logger.debug("Signature signAlgorithm: " +signatureDetailsList.get(i).getSignAlgorithm());
			logger.debug("Signature subjectName: " +signatureDetailsList.get(i).getSubjectName());
			logger.debug("Signature subjectEmail: " +signatureDetailsList.get(i).getSubjectEmail());
			logger.debug("Signature certIssuer: " +signatureDetailsList.get(i).getCertIssuer());
			logger.debug("Signature certFormat: " +signatureDetailsList.get(i).getCertFormat());
			logger.debug("Signature certDateNotBefore: " +signatureDetailsList.get(i).getCertDateNotBefore());
			logger.debug("Signature certDateNotAfter: " +signatureDetailsList.get(i).getCertDateNotAfter());
		}		
	}
}
