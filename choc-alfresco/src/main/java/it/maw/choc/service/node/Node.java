package it.maw.choc.service.node;

import it.maw.choc.model.ChocModel;
import it.maw.choc.model.ChocUtil;
import it.maw.choc.model.Service;
import it.maw.choc.util.RepoUtil;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.version.VersionModel;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.AssociationRef;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.version.VersionType;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.ParameterCheck;
import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.*;

//import org.springframework.transaction.annotation.Transactional;

/**
 * Created by Federico Tarantino on 30/10/15.
 */
public class Node extends Service {

    Logger logger = Logger.getLogger(Node.class);

    public enum ModeCreate {
        NEW, EDIT, DELETE
    }

    private String type = "cm:content"; // default type
    private ModeCreate mode;
    private HashMap<String, String> properties = new HashMap<>();
    private Map<QName, Serializable> propertiesQname = new HashMap<>();
    private List<QName> aspects = new ArrayList<>();
    // upload param
    private InputStream is;
    // run ad admin mode
    private boolean runAsAdmin = false;
    // optional: to use if date string is in not standard format
    private SimpleDateFormat dateFormatter;
    private boolean versioning = false;
    
    @SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
    protected boolean run() throws Exception {
        // check mandatory params
        ParameterCheck.mandatory("Noderef", getNodeRef());
        ParameterCheck.mandatory("Mode type", mode);

        ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
        // run as admin?
        String currentUser = null;
        if(runAsAdmin){
            currentUser = serviceRegistry.getAuthenticationService().getCurrentUserName();
            AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();
        }

        NodeService nodeService = serviceRegistry.getNodeService();
        NodeRef node = null;
        if(mode==ModeCreate.NEW){
            String name = properties.remove("cm:name");
            if(name==null || name.equals("")){
                name = UUID.randomUUID().toString();
            } else {
                name = RepoUtil.validateAlfrescoName(name);
            }

            node = serviceRegistry.getFileFolderService().create(getNodeRef(), name, RepoUtil.getQName(type)).getNodeRef();
            setNodeRef(node);
            // upload mode, set inputstream
            if(is!=null){
                ContentWriter writer = RepoUtil.getWriter(node);
                writer.setMimetype(serviceRegistry.getMimetypeService().guessMimetype(name));
                writer.setEncoding("UTF-8");
                writer.putContent(is);
            }
        } else if(mode==ModeCreate.EDIT){
            node = getNodeRef();
            String name = (String) nodeService.getProperty(node, ContentModel.PROP_NAME);
            if (properties.get("cm:name") != null) {
            	name =  RepoUtil.validateAlfrescoName(properties.get("cm:name"));
            }
            if (propertiesQname.get(ContentModel.PROP_NAME) != null) {
            	name =  RepoUtil.validateAlfrescoName((String) propertiesQname.get(ContentModel.PROP_NAME));
            }
            // upload mode, set inputstream
            if(is!=null){
            	if (versioning) {
            		Map<String, Serializable> versionProperties = new HashMap<String, Serializable>();
            		if (!nodeService.hasAspect(node, ContentModel.ASPECT_VERSIONABLE)){
            			versionProperties.put(VersionModel.PROP_VERSION_LABEL, "1.1");
            		}
            		versionProperties.put(VersionModel.PROP_VERSION_TYPE, VersionType.MINOR);
            		serviceRegistry.getVersionService().createVersion(node, versionProperties);
            	}
        		ContentWriter writer = RepoUtil.getWriter(node);
                writer.setMimetype(serviceRegistry.getMimetypeService().guessMimetype(name));
                writer.setEncoding("UTF-8");
                writer.putContent(is);
            }
        } else if(mode==ModeCreate.DELETE){
            serviceRegistry.getFileFolderService().delete(getNodeRef());
            return true;
        } else {
            return false;
        }

        if (propertiesQname.isEmpty()){
        	for(String key : properties.keySet()){
                String datatype = ChocUtil.getPropertyType(key);
                QName prop = RepoUtil.getQName(key);
                String value = properties.get(key).trim();
                if(datatype!=null){
                    if(value!=null){
                        if(datatype.equalsIgnoreCase("d:boolean")){
                            nodeService.setProperty(node, prop, Boolean.parseBoolean(value));
                        } else if(datatype.equalsIgnoreCase("d:date") || datatype.equalsIgnoreCase("d:datetime")){
                            if(!value.isEmpty()){
                                Date dateValue;
                                try {
                                    if (dateFormatter != null) {
                                        // string custom
                                        dateValue = dateFormatter.parse(value);
                                    } else if (value.length() <= 10) {
                                        // stringa solo date
                                        dateValue = ChocModel.dateSimpleformatter.parse(value);
                                    } else if (value.length() <= 16 && value.contains(" ")) {
                                        // stringa data e ora
                                        dateValue = ChocModel.datetimeSimpleformatter.parse(value);
                                    } else {
                                        // formato iso 8601
                                        dateValue = ChocModel.getScriptUtils().fromISO8601(value);
                                    }
                                } catch (Exception pe){
                                    logger.warn("Data non valida per la proprietà "+key+": "+value);
                                    continue;
                                }
                                nodeService.setProperty(node, prop, dateValue);
                            } else {
                                nodeService.setProperty(node, prop, null);
                            }
                        } else if(datatype.equalsIgnoreCase("d:int") || datatype.equalsIgnoreCase("d:float")){
                            if(!value.isEmpty()){
                                if(datatype.equalsIgnoreCase("d:float")){
                                    // autofix for separator
                                    value = value.replace(",",".");
                                }
                                nodeService.setProperty(node, prop, value);
                            } else {
                                nodeService.setProperty(node, prop, null);
                            }
                        } else {
                            // check if text prop is multiple
                        	if(!value.isEmpty()){
    	                        if(ChocUtil.isPropertyMultiple(key)){
    	                            nodeService.setProperty(node, prop, new ArrayList(Arrays.asList(value.split(","))));
    	                        } else {
    	                            nodeService.setProperty(node, prop, value);
    	                        }
                        	} else {
                        		nodeService.setProperty(node, prop, null);
                        	}
                        }
                    }
                } else {
                    // se non ha trovato il property type, è un assoc
                    List<AssociationRef> existsAssocs = nodeService.getTargetAssocs(node, prop);
                    if (existsAssocs!=null && existsAssocs.size()>0){
                        for(AssociationRef assoc : existsAssocs){
                            nodeService.removeAssociation(node, assoc.getTargetRef(), prop);
                        }
                    }
                    if(value!=null && !value.isEmpty()){
                        String[] refs = value.split(",");
                        for(String ref : refs){
                            if (ref.length() >= 25 && ref.startsWith("workspace://SpacesStore")){
                                nodeService.createAssociation(node, new NodeRef(ref), prop);
                            }
                        }
                    }
                }
            }	
        } else {
        	nodeService.addProperties(node, propertiesQname);
        }

        // aspects
        for(QName aspect : aspects){
            if(!nodeService.hasAspect(node, aspect)){
                nodeService.addAspect(node, aspect, null);
            }
        }

        // reset user session
        if(currentUser!=null){
            AuthenticationUtil.setFullyAuthenticatedUser(currentUser);
        }
        
        return true;
    }

	public void setBase64Content(String base64content){
        this.is = new ByteArrayInputStream(Base64.decodeBase64(base64content));
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
    
    public ModeCreate getMode() {
        return mode;
    }

    public void setMode(ModeCreate mode) {
        this.mode = mode;
    }

    public HashMap<String, String> getProperties() {
        return properties;
    }

    public void setProperties(HashMap<String, String> properties) {
        this.properties = properties;
    }
	
    public Map<QName, Serializable> getPropertiesQname() {
        return propertiesQname;
    }

    public void setPropertiesQname(Map<QName, Serializable> propertiesQname) {
        this.propertiesQname = propertiesQname;
    }

    public InputStream getIs() {
        return is;
    }

    public void setIs(InputStream is) {
        this.is = is;
    }

    public boolean isRunAsAdmin() {
        return runAsAdmin;
    }

    public void setRunAsAdmin(boolean runAsAdmin) {
        this.runAsAdmin = runAsAdmin;
    }

    public List<QName> getAspects() {
        return aspects;
    }

    public void setAspects(List<QName> aspects) {
        this.aspects = aspects;
    }

    public SimpleDateFormat getDateFormatter() {
    	return dateFormatter;
    }
    
    public void setDateFormatter(SimpleDateFormat dateFormatter) {
        this.dateFormatter = dateFormatter;
    }
    
    public boolean isVersioning() {
		return versioning;
	}

	public void setVersioning(boolean versioning) {
		this.versioning = versioning;
	}
}