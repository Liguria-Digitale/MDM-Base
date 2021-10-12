package it.maw.choc.service;

import it.maw.choc.model.ChocModel;
import it.maw.choc.model.Service;
import it.maw.choc.model.ServiceExecutor;
import it.maw.choc.service.titolario.Tree;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.ParameterCheck;

import java.io.Serializable;
import java.util.*;

/**
 * Created by Federico Tarantino on 12/05/15.
 */
public class Audit extends Service {

    // list of current audit type
    public static final String AUDIT_DOCUMENTO = "DOCUMENTO";
    public static final String AUDIT_TITOLARIO = "TITOLARIO";

    private String user; // optional
    private String site; // optional
    private String action; // mandatory
    private Date date; // optional
    private NodeRef nodeRef; // mandatory
    private String nodeName; // optional
    private String auditType; // mandatory
    private Map<String, String> params = new HashMap<>(); // optional
    private List<String> paramsString = new ArrayList<>(); // optional

    @Override
    protected boolean run() throws Exception {
        // check mandatory params
        ParameterCheck.mandatory("Audit NodeRef", getNodeRef());
        ParameterCheck.mandatory("Audit Action", action);
        ParameterCheck.mandatory("Audit Type", auditType);

        ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
        String username = serviceRegistry.getAuthenticationService().getCurrentUserName();
        // clean data in audit entry
        if(site==null){
            site = AuthenticationUtil.runAs(new AuthenticationUtil.RunAsWork<String>() {
                @Override
                public String doWork() {
                    return ChocModel.getServiceRegistry().getSiteService().getSite(getNodeRef()).getShortName();
                }
            }, AuthenticationUtil.getAdminUserName());
        }
        if(user==null){
            user = username;
        }
        if(date==null){
            date = new Date();
        }
        if(nodeName==null){
            nodeName = serviceRegistry.getNodeService().getProperty(getNodeRef(), ContentModel.PROP_NAME).toString();
        }
        // get folder to save audit entry
        NodeRef auditContainer = ChocModel.getServiceRegistry().getSiteService().getContainer(site, ChocModel.CONTAINER_AUDIT);
        Tree treeService = new Tree();
        treeService.setPath(Tree.dateToPath(date, Calendar.DAY_OF_MONTH));
        ServiceExecutor.execute(treeService, auditContainer);
        NodeRef folderContainer = treeService.getNodeRef();

        // prepare props
        String auditName = UUID.randomUUID().toString() + "_" + String.valueOf(date.getTime());
        Map<QName, Serializable> propsAE = new HashMap<>();
        propsAE.put(ContentModel.PROP_NAME, auditName);
        propsAE.put(ChocModel.PROP_AUDIT_USER, user);
        propsAE.put(ChocModel.PROP_AUDIT_SITE, site);
        propsAE.put(ChocModel.PROP_AUDIT_ACTION, action);
        propsAE.put(ChocModel.PROP_AUDIT_DATE, date);
        propsAE.put(ChocModel.PROP_AUDIT_NODE, getNodeRef().toString());
        propsAE.put(ChocModel.PROP_AUDIT_NAME, nodeName);
        propsAE.put(ChocModel.PROP_AUDIT_TYPE, auditType);

        ArrayList<String> stringParams = new ArrayList<>();
        for (String key : params.keySet()){
            stringParams.add(key + "|" + params.get(key));
        }
        if (!paramsString.isEmpty()){
            stringParams.addAll(paramsString);
        }

        propsAE.put(ChocModel.PROP_AUDIT_PARAMS, stringParams);

        serviceRegistry.getNodeService().createNode(folderContainer, ContentModel.ASSOC_CONTAINS,
                QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, auditName), ChocModel.TYPE_AUDIT_ENTITY, propsAE);

        return true;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getSite() {
        return site;
    }

    public void setSite(String site) {
        this.site = site;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getNodeName() {
        return nodeName;
    }

    public void setNodeName(String nodeName) {
        this.nodeName = nodeName;
    }

    public String getAuditType() {
        return auditType;
    }

    public void setAuditType(String auditType) {
        this.auditType = auditType;
    }

    public Map<String, String> getParams() {
        return params;
    }

    public void setParams(Map<String, String> params) {
        this.params = params;
    }

    public List<String> getParamsString() {
        return paramsString;
    }

    public void setParamsString(List<String> paramsString) {
        this.paramsString = paramsString;
    }
}
