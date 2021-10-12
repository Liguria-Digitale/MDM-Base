package it.maw.choc.service.node;

import it.maw.choc.model.ChocModel;
import it.maw.choc.model.ChocUtil;
import it.maw.choc.model.Service;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchParameters;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.util.ParameterCheck;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import java.util.*;

/**
 * Created by Federico Tarantino on 18/09/15.
 */
public class Search extends Service {

	Logger logger = Logger.getLogger(Search.class);
	
    public static int MAX_SEARCH_SIZE = 250;

    private int page = 0;
    private String orderBy = "cm:name";
    private boolean orderDesc = false;
    private String term;
    private String type;
    private boolean exactType = false;
    private List<String> aspects = new ArrayList<>();
    private List<String> noAspects = new ArrayList<>();
    private Map<String, String> properties = new HashMap<>();
    private Map<String, String> notProperties = new HashMap<>(); //TODO FOR NOW ONLY STRING
    private List<String> isNull = new ArrayList<>();
    private boolean indepth = true;
    private Integer limit = null;
    // result noderef and total
    private List<NodeRef> noderefs;
    private long total;

    @Override
    protected boolean run() throws Exception {
        // check mandatory params
        ParameterCheck.mandatory("Root Node", getNodeRef());

        ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
        // build query
        String query = "";
        // path
        String qnamePath = serviceRegistry.getNodeService().getPath(getNodeRef()).toPrefixString(serviceRegistry.getNamespaceService());
        query += "+PATH:\""+qnamePath+"/"+(indepth?"/":"")+"*\" ";
        // type
        if(type!=null){
            if(exactType){
                query += "AND +EXACTTYPE:\"" + type + "\" ";
            } else {
                query += "AND +TYPE:\"" + type + "\" ";
            }
        }
        if(aspects.size()>0){
            for(String aspect : aspects){
                query += "AND +ASPECT:\""+aspect+"\" ";
            }
        }
        if(noAspects.size()>0){
            for(String noAspect : noAspects){
                query += "AND -ASPECT:\""+noAspect+"\" ";
            }
        }

        if(term!=null && term.trim().length()>0){
            query += "AND +(TEXT:\""+term+"\" OR cm:name:\"*"+term+"*\") "; //OR (e non or) DOVREBBE FIXARE SU 4.2
        }

        if(properties.size()>0){
            properties = parseRangeDate(properties);
            for (String propNameFull : properties.keySet()) {
                String propValue = properties.get(propNameFull).trim();
                String[] propNames = propNameFull.split(",");
                query += "AND +(";
                for(int n=0;n<propNames.length;n++){
                    String propName = propNames[n];
                    if(n>0){
                        query += " OR ";
                    }
                    String datatype = ChocUtil.getPropertyType(propName);
                    if(datatype.equals("d:date") || datatype.equals("d:datetime")){
                        if(propValue.startsWith("[") && propValue.endsWith("]")){
                            // date range
                            query += propName + ":" + propValue + " ";
                        } else {
                            // single day
                            query += propName + ":\"" + propValue.split("T")[0] + "\" ";
                        }
                    } else if(datatype.equals("d:int") || datatype.equals("d:float")|| datatype.equals("d:boolean")){
                        query += propName+":"+propValue+" ";
                    } else {
                        if(propValue.contains(",")){
                            String[] propValues = propValue.split(",");
                            query += "+(";
                            for(int i=0;i<propValues.length;i++){
                                if(i>0){
                                    query += " OR ";
                                }
                                query += propName + ":\"" + propValues[i] + "\"";
                            }
                            query += ") ";
                        } else {
                            query += propName + ":\"" + propValue + "\" ";
                        }
                    }
                }
                query += ") ";
            }
        }
        
        if (notProperties.size() > 0) {
            for (String propNameFull : notProperties.keySet()) {
                String propValue = notProperties.get(propNameFull).trim();
                if (StringUtils.isNotBlank(propValue)) {
                    String[] propNames = propNameFull.split(","); //TOFIX NECESSARIO??
                    for (int nn = 0; nn < propNames.length; nn++) {
                        String propName = propNames[nn];
                        if (propValue.contains(",")) {
                            String[] propValues = propValue.split(",");
                            for (int ni = 0; ni < propValues.length; ni++) {
                                query += "AND -" + propName + ":\"" + propValues[ni] + "\"";
                            }
                        } else {
                            query += "AND -" + propName + ":\"" + propValue + "\"";
                        }
                    }
                }
            }
        }

        if(isNull.size()>0){
            for(String n : isNull){
                query += "AND +ISNULL:\""+n+"\" ";
            }
        }

        SearchParameters searchParam = new SearchParameters();
        searchParam.addStore(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
        searchParam.setQuery(query);
        logger.debug("QUERY: " + query);
        searchParam.setLanguage(SearchService.LANGUAGE_FTS_ALFRESCO);
        String[] orders = orderBy.split(",");
        for (String order : orders) {
            searchParam.addSort(order, !orderDesc);
        }
        searchParam.setMaxItems(limit==null ? MAX_SEARCH_SIZE : limit);
        searchParam.setSkipCount(page*(limit==null ? MAX_SEARCH_SIZE : limit));
        // execute query
        ResultSet res = serviceRegistry.getSearchService().query(searchParam);
        noderefs = res.getNodeRefs();
        total = res.getNumberFound();
        return true;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public String getOrderBy() {
        return orderBy;
    }

    public void setOrderBy(String orderBy) {
        this.orderBy = orderBy;
    }

    public boolean isOrderDesc() {
        return orderDesc;
    }

    public void setOrderDesc(boolean orderDesc) {
        this.orderDesc = orderDesc;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getAspects() {
        return aspects;
    }

    public void setAspects(List<String> aspects) {
        this.aspects = aspects;
    }
    
    public List<String> getNoAspects() {
        return noAspects;
    }

    public void setNoAspects(List<String> noAspects) {
        this.noAspects = noAspects;
    }

    public Map<String, String> getProperties() {
        return properties;
    }

    public void setProperties(Map<String, String> properties) {
        this.properties = properties;
    }

    public Map<String, String> getNotProperties() {
		return notProperties;
	}

	public void setNotProperties(Map<String, String> notProperties) {
		this.notProperties = notProperties;
	}

	public boolean isIndepth() {
        return indepth;
    }

    public void setIndepth(boolean indepth) {
        this.indepth = indepth;
    }

    public Integer getLimit() { return limit; }

    public void setLimit(Integer limit) { this.limit = limit; }

    public List<NodeRef> getNoderefs() {
        return noderefs;
    }

    public long getTotal() {
        return total;
    }

    public boolean isExactType() {
        return exactType;
    }

    public void setExactType(boolean exactType) {
        this.exactType = exactType;
    }

    public List<String> getIsNull() {
        return isNull;
    }

    public void setIsNull(List<String> isNull) {
        this.isNull = isNull;
    }

    /**
     * If there are parameters containing --from or --to it replace them in [fromDate TO toDate] (lucene based)
     * @param properties properties map
     * @return parsed map
     */
    private Map<String,String> parseRangeDate(Map<String, String> properties) {

        Map<String, String> ranges = new HashMap<>();

        for(Iterator<Map.Entry<String, String>> it = properties.entrySet().iterator(); it.hasNext(); ) {
            Map.Entry<String, String> entry = it.next();

            if(entry.getKey().contains("--from") || entry.getKey().contains("--to")) {
                String propName = entry.getKey().split("--")[0];
                String propValue = entry.getValue();
                String from = "MIN"; String to = "MAX";
                if (entry.getKey().contains("--from") && !entry.getKey().isEmpty()){
                    from = propValue;
                }
                if (entry.getKey().contains("--to") && !entry.getKey().isEmpty()){
                    to = propValue;
                    if(to.contains("T00:00:00")){
                        to = to.replace("T00:00:00", "T23:59:00");
                    }
                }

                if (ranges.containsKey(propName)) {
                    if (entry.getKey().contains("--to")) {
                        ranges.put(propName, ranges.get(propName).replace("MAX", propValue));
                    } else {
                        ranges.put(propName, ranges.get(propName).replace("MIN", propValue));
                    }
                } else {
                    ranges.put(propName, "[" + from + " TO " + to + "]");
                }
                it.remove();
            }
        }
        properties.putAll(ranges);
        return properties;
    }
}
