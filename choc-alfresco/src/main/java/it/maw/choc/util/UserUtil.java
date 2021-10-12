package it.maw.choc.util;

import it.maw.choc.model.ChocModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.content.encoding.ContentCharsetFinder;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.QName;

import java.io.BufferedInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by federico on 03/07/15.
 */
public class UserUtil {

    private UserUtil(){}

    public static String getEmail(String username){
		return getEmail(ChocModel.getServiceRegistry().getPersonService().getPerson(username));
    }

	public static String getEmail(NodeRef userNode){
		return (String) ChocModel.getServiceRegistry().getNodeService().getProperty(userNode, ContentModel.PROP_EMAIL);
	}

	public static String getDisplayName(String username){
		return getDisplayName(ChocModel.getServiceRegistry().getPersonService().getPerson(username));
	}

	public static String getDisplayName(NodeRef userNode){
		PersonService.PersonInfo person = ChocModel.getServiceRegistry().getPersonService().getPerson(userNode);
		String displayName = "";
		String firstName = person.getFirstName();
		String lastName = person.getLastName();
		if(firstName!=null){
			displayName += firstName+" ";
		}
		if(lastName!=null){
			displayName += lastName;
		}
		displayName = displayName.trim();
		if(displayName.length()>0){
			return displayName;
		} else {
			return person.getUserName();
		}
	}

}
