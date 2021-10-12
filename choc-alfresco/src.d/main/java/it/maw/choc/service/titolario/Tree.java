package it.maw.choc.service.titolario;

import it.maw.choc.model.ChocModel;
import it.maw.choc.model.Service;
import it.maw.choc.model.ServiceExecutor;
import org.alfresco.model.ContentModel;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.ParameterCheck;
import org.apache.commons.lang.StringUtils;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

/**
 * Created by Federico Tarantino on 07/07/15.
 */
public class Tree extends Service {

    private final String TEMPLATE_YEAR = "{YEAR}";
    private final String TEMPLATE_MONTH = "{MONTH}";
    private final String TEMPLATE_DAY = "{DAY}";

    private String path;

    public Tree(){
        this(dateToPath());
    }

    public Tree(String path){
        this.path = path;
    }

    @Override
    protected boolean run() throws Exception {
        // check mandatory params
        ParameterCheck.mandatory("Parent node", getNodeRef());
        ParameterCheck.mandatory("Path", getPath());

        ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
        String[] pathLevels = path.split("/");
        for(int i=0;i<pathLevels.length;i++){
            String pathLevel = pathLevels[i];
            // check for template variables
            if(pathLevel.equals(TEMPLATE_YEAR)){
                pathLevel = String.valueOf(Calendar.getInstance().get(Calendar.YEAR));
            } else if(pathLevel.equals(TEMPLATE_MONTH)){
                pathLevel = String.valueOf(Calendar.getInstance().get(Calendar.MONTH)+1);
            } else if(pathLevel.equals(TEMPLATE_DAY)){
                pathLevel = String.valueOf(Calendar.getInstance().get(Calendar.DAY_OF_MONTH));
            }
            // which type use for this level?
            QName folderType = ContentModel.TYPE_FOLDER;
            SiteInfo site = serviceRegistry.getSiteService().getSite(getNodeRef());
            if(site!=null) {
                QName parentType = serviceRegistry.getNodeService().getType(getNodeRef());
                if (parentType.isMatch(ChocModel.TYPE_TIT_BASEFOLDER)) {
                    folderType = ChocModel.TYPE_TIT_TITOLO;
                } else if (parentType.isMatch(ChocModel.TYPE_TIT_TITOLO)) {
                    folderType = ChocModel.TYPE_TIT_CLASSE;
                } else if (parentType.isMatch(ChocModel.TYPE_TIT_CLASSE)) {
                    folderType = ChocModel.TYPE_TIT_FASCICOLO;
                } else if (parentType.isMatch(ChocModel.TYPE_TIT_FASCICOLO)) {
                    folderType = ChocModel.TYPE_TIT_FASCICOLO;
                }
            }
            TitolarioEntry titEntry = new TitolarioEntry(folderType, pathLevel);
            // create level
            ServiceExecutor.execute(titEntry, getNodeRef());
            // get created folder
            setNodeRef(titEntry.getNodeRef());
        }
        return true;
    }

    /**
     * get a path from date
     * @return
     */
    public static String dateToPath(){
        return dateToPath(new Date());
    }

    /**
     * get a path from date
     * @return
     */
    public static String dateToPath(Date date){
        return dateToPath(date, Calendar.DAY_OF_MONTH);
    }

    /**
     * get a path from date
     * @return
     */
    public static String dateToPath(Date date, int toLevel){
        return dateToPath(date, Calendar.YEAR, toLevel);
    }

    /**
     * get a path from date
     * @return
     */
    public static String dateToPath(Date date, int fromLevel, int toLevel){
        if(date==null){
            date = new Date();
        }
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        List<String> path = new ArrayList<>();
        // special case
        if(fromLevel>toLevel){
            return null;
        }
        // normal case
        do {
            // get value
            int pathValue = cal.get(fromLevel);
            if(fromLevel==Calendar.MONTH){
                pathValue++;
            }
            path.add(String.valueOf(pathValue));
            // calculate next level
            if(fromLevel==Calendar.YEAR){
                fromLevel = Calendar.MONTH;
            } else if(fromLevel==Calendar.MONTH){
                fromLevel = Calendar.DAY_OF_MONTH;
            } else if(fromLevel==Calendar.DAY_OF_MONTH){
                fromLevel = Calendar.HOUR_OF_DAY;
            } else if(fromLevel==Calendar.HOUR_OF_DAY){
                fromLevel = Calendar.MINUTE;
            } else if(fromLevel==Calendar.MINUTE){
                fromLevel = Calendar.SECOND;
            } else {
                break;
            }
        } while (fromLevel<=toLevel);
        return StringUtils.join(path, "/");
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}
