package it.maw.choc.service.titolario;

import it.maw.choc.model.ChocModel;
import it.maw.choc.model.Service;
import org.alfresco.model.ContentModel;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.ParameterCheck;


/**
 * Created by Federico Tarantino on 07/07/15.
 */
public class TitolarioEntry extends Service {

    private QName type = ContentModel.TYPE_FOLDER;
    private String name;

    public TitolarioEntry(){}

    public TitolarioEntry(QName type, String name){
        this.type = type;
        this.name = name;
    }

    @Override
    protected boolean run() throws Exception {
        // check mandatory params
        ParameterCheck.mandatory("Folder type", getType());
        ParameterCheck.mandatoryString("Folder name", getName());
        ParameterCheck.mandatory("Parent Node", getNodeRef());

        ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
        NodeRef folderRef = serviceRegistry.getNodeService().getChildByName(getNodeRef(), ContentModel.ASSOC_CONTAINS, getName());
        if(folderRef==null){
            folderRef = serviceRegistry.getFileFolderService().create(getNodeRef(), getName(), getType()).getNodeRef();
        }
        setNodeRef(folderRef);
        return true;
    }

    public QName getType() {
        return type;
    }

    public void setType(QName type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
