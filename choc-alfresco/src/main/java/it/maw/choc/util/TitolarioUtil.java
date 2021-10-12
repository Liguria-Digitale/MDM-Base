package it.maw.choc.util;

import it.maw.choc.model.ChocModel;
import org.alfresco.model.ContentModel;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.namespace.QName;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import java.util.Calendar;
import java.util.Date;


/**
 * 
 * @author Federico Tarantino
 *
 */
public class TitolarioUtil {

	private static Logger logger = Logger.getLogger(TitolarioUtil.class);
	
	private TitolarioUtil(){}
	
	/**
	 * generate counter for fascicolo (from its classe)
	 * @param fascicolo
	 * @return
	 */
	public static int generateFascicoloNumber(NodeRef fascicolo){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		NodeService nodeService = serviceRegistry.getNodeService();
		NodeRef parent = fascicolo;
		parent = nodeService.getPrimaryParent(parent).getParentRef();
		// risalgo fino a trovare la classe
		String counterYear = (String) nodeService.getProperty(parent, ChocModel.PROP_BASE_COUNTER);
		counterYear = (counterYear == null) ? "2000-0" : counterYear;
		int year = Integer.parseInt(counterYear.substring(0, 4));
		int counter = Integer.parseInt(counterYear.substring(5));
		// controllo se è cambiato anno dall'ultima volta
		int currentYear = Calendar.getInstance().get(Calendar.YEAR);
		if(currentYear>year){
			year = currentYear;
			counter = 0;
		}
		// increment counter
		counter++;
		// save new counter
		nodeService.setProperty(parent, ChocModel.PROP_BASE_COUNTER, year+"-"+counter);
		// check if exists fascicolo with this number
		if(existsFascicoloWithNumber(fascicolo, counter)){
			return generateFascicoloNumber(fascicolo);
		} else {
			return counter;
		}
	}
	
	/**
	 * check if exists fascicolo with number "number"
	 * @param fascicolo
	 * @param number
	 * @return
	 */
	public static boolean existsFascicoloWithNumber(NodeRef fascicolo, int number){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		NodeService nodeService = serviceRegistry.getNodeService();
		SearchService searchService = serviceRegistry.getSearchService();
		// recupero la classe in cui è presente il fascicolo
		NodeRef parent = fascicolo;
		parent = nodeService.getPrimaryParent(parent).getParentRef();
		// cerco fascicoli con quel numero
		String query = "select cmis:objectId from tit:fascicolo where tit:baseFolderNumber="+number+" and in_tree('"+parent.toString()+"')";
		// ritorno il risultato
		return searchService.query(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE, SearchService.LANGUAGE_CMIS_ALFRESCO, query).length()>0;
	}

	public static String buildCollocazione(NodeRef node){
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		NodeService nodeService = serviceRegistry.getNodeService();
		Integer fascicoloNumber = (Integer) nodeService.getProperty(node, ChocModel.PROP_BASEFOLDER_NUMBER);
		if(fascicoloNumber!=null){
			String collocazione = String.valueOf(fascicoloNumber);
			Date creationDate = (Date) nodeService.getProperty(node, ContentModel.PROP_CREATED);
			Calendar calendar = Calendar.getInstance();
			calendar.setTime(creationDate);
			int anno = calendar.get(Calendar.YEAR);
			String roman = null;
			String titolo = null;
			NodeRef parent = nodeService.getPrimaryParent(node).getParentRef();
			QName parentType = nodeService.getType(parent);
			while (serviceRegistry.getDictionaryService().isSubClass(parentType, ChocModel.TYPE_TIT_BASEFOLDER)){
				if(parentType.isMatch(ChocModel.TYPE_TIT_CLASSE) || parentType.isMatch(ChocModel.TYPE_TIT_FASCICOLO)){
					Integer baseNumber = (Integer) nodeService.getProperty(parent, ChocModel.PROP_BASEFOLDER_NUMBER);
					if(baseNumber!=null){
						collocazione = String.valueOf(baseNumber)+"."+collocazione;
					} else {
						// c'è un buco nell'alberatura, collocazione non valida
						return null;
					}
				} else if(parentType.isMatch(ChocModel.TYPE_TIT_TITOLO)){
				//	roman = (String) nodeService.getProperty(parent, ChocModel.PROP_TITOLO_NUM_ROMANO);
					roman = String.valueOf(nodeService.getProperty(parent, ChocModel.PROP_BASEFOLDER_NUMBER));
					titolo = String.valueOf(nodeService.getProperty(parent, ContentModel.PROP_NAME));
				}
				parent = nodeService.getPrimaryParent(parent).getParentRef();
				parentType = nodeService.getType(parent);
			}
			// aggiungo anno e titolo
			collocazione = String.valueOf(anno) + (StringUtils.isNotBlank(roman) ? "-"+roman : "") +"|" +titolo+ "/" + collocazione;
			return collocazione;
		}
		return null;
	}

}
