package it.maw.choc.model;

import org.alfresco.service.cmr.repository.NodeRef;

/**
 * Execute a service on noderef
 */
public class ServiceExecutor {

    private ServiceExecutor(){}

    public static boolean execute(Service service, NodeRef noderef){
        return service.execute(noderef);
    }

    public static boolean execute(Service service){
        return service.execute(null);
    }

    public static <T extends Service> boolean execute(Class<T> className){
		 return execute(className, null);
    }

    public static <T extends Service> boolean execute(Class<T> className, NodeRef noderef){
        try {
            return execute(className.newInstance(), noderef);
        } catch (Exception e) {
            return false;
        }
    }

}
