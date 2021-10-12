package it.maw.choc.service.node;

import it.maw.choc.model.ChocModel;
import it.maw.choc.model.ChocUtil;
import it.maw.choc.model.Service;

import it.maw.choc.util.RepoUtil;
import org.alfresco.model.ContentModel;
import org.alfresco.query.PagingRequest;
import org.alfresco.query.PagingResults;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchParameters;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.Pair;
import org.alfresco.util.ParameterCheck;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import java.util.*;

/**
 * Created by Federico Tarantino on 22/09/15.
 */
public class Children extends Service {

    public static int MAX_CHILDREN_SIZE = 50;
    private Logger logger = Logger.getLogger(Children.class);

    private int page = 0;
    private Integer elements = null;
    private String orderBy = "cm:name";
    private boolean orderDesc = false;
    private String pattern = null;
    // result noderef
    private List<NodeRef> noderefs;
    private Integer totalWithPaging;

    @Override
    protected boolean run() throws Exception {
        // check mandatory params
        ParameterCheck.mandatory("Parent Node", getNodeRef());
        // set elements
        if(elements == null){
            elements = MAX_CHILDREN_SIZE;
        }

        ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();

        List<Pair<QName, Boolean>> sortProps = new ArrayList<>();
        String[] orderByList = orderBy.split(",");
        for(int i=0;i<orderByList.length; i++) {
            sortProps.add(new Pair<>(RepoUtil.getQName(orderByList[i]), !orderDesc));
        }
        //infine verifico ci sia la ricerca per nome, ed in caso negativo la aggiungo in coda
        if(!Arrays.asList(orderByList).contains("cm:name")){
            sortProps.add(new Pair<>(ContentModel.PROP_NAME, !orderDesc));
        }

        PagingRequest paging = new PagingRequest(page * elements, elements);
        paging.setRequestTotalCountMax(Integer.MAX_VALUE);
        PagingResults<FileInfo> results;
        if(pattern==null) {
            results = serviceRegistry.getFileFolderService().list(getNodeRef(), true, true, null, sortProps, paging);
        } else {
            results = serviceRegistry.getFileFolderService().list(getNodeRef(), true, true, "*"+pattern+"*", null, sortProps, paging);
        }

        noderefs = new ArrayList<>();
        List<FileInfo> files = results.getPage();
        for(FileInfo file : files){
            noderefs.add(file.getNodeRef());
        }

        Pair<Integer, Integer> totalResultCountpage = results.getTotalResultCount();
        if (totalResultCountpage != null){
            totalWithPaging = totalResultCountpage.getSecond();
            if(totalWithPaging==null){
                totalWithPaging = totalResultCountpage.getFirst();
                if(totalWithPaging==null){
                    totalWithPaging = elements;
                }
            }
            logger.debug("total con paginazione: " + totalWithPaging);
        } else {
            totalWithPaging = files.size();
        }

        return true;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public Integer getElements() {
        return elements;
    }

    public void setElements(Integer elements) {
        this.elements = elements;
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

    public List<NodeRef> getNoderefs() {
        return noderefs;
    }

    public Integer getTotalWithPaging() {
        return totalWithPaging;
    }

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }
}
