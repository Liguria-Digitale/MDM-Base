package it.maw.choc.model;

import org.alfresco.service.cmr.repository.NodeRef;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class Service {

	/**
	 * optional base nodeRef for execution
	 */
	private NodeRef nodeRef;
	/**
	 * boolean for enable/disable hooks for service instance
	 */
	private boolean hooksEnabled = true;
	/**
	 * String message to return for service instance
	 */
	private String message = "";
	/**
	 * list of prehooks of all service
	 */
	private static Map<Class<? extends Service>, List<Hook>> preHooks = new HashMap<>();
	/**
	 * list of posthooks of all service
	 */
	private static Map<Class<? extends Service>, List<Hook>> postHooks = new HashMap<>();

	/**
	 * execution method for service instance
	 * @return true if execution is ok
	 */
	protected abstract boolean run() throws Exception;

	/**
	 * method for hooks logic running
	 * @param nodeRef
	 * @return true if execution is ok
	 */
	protected boolean execute(NodeRef nodeRef) {
		this.nodeRef = nodeRef;
		this.message = "";
		try {
			// run all pre-hooks
			if(hooksEnabled) {
				List<Hook> preHooks = Service.preHooks.get(this.getClass());
				if (preHooks != null) {
					for (Hook hook : preHooks) {
						if (!hook.run(this)){
							return false;
						}
					}
				}
			}
			// run action... if fail, return without run post hooks
			if(!run()){
				return false;
			} else {
				// run all post-hooks
				if(hooksEnabled) {
					List<Hook> postHooks = Service.postHooks.get(this.getClass());
					if (postHooks != null) {
						for (Hook hook : postHooks) {
							hook.run(this);
						}
					}
				}
			}
		} catch (Exception e){
			setMessage(message += " " + e.getMessage());
			e.printStackTrace();
			return false;
		}
		return true;
	}

	/**
	 * method for hook adding
	 * @param className
	 * @param hook
	 * @param <T>
	 */
	public static <T extends Service> void addPreHook(Class<T> className, Hook hook){
		List<Hook> hooks = preHooks.get(className);
		if(hooks==null){
			hooks = new ArrayList<>();
			preHooks.put(className, hooks);
		}
		hooks.add(hook);
	}

	/**
	 * method for hook adding
	 * @param className
	 * @param hook
	 * @param <T>
	 */
	public static <T extends Service> void addPostHook(Class<T> className, Hook hook){
		List<Hook> hooks = postHooks.get(className);
		if(hooks==null){
			hooks = new ArrayList<>();
			postHooks.put(className, hooks);
		}
		hooks.add(hook);
	}

	/**
	 * @return true if hooks are enabled
	 */
	public boolean isHooksEnabled(){
		return hooksEnabled;
	}

	/**
	 * enable hooks for service instance
	 */
	public void enableHooks(){
		hooksEnabled = true;
	}

	/**
	 * disable hooks for service instance
	 */
	public void disableHooks(){
		hooksEnabled = false;
	}

	/**
	 * @return noderef of service instance
	 */
	public NodeRef getNodeRef() {
		return nodeRef;
	}

	/**
	 * override noderef for service instance (for example, for result)
	 * @param nodeRef
	 */
	protected void setNodeRef(NodeRef nodeRef) {
		this.nodeRef = nodeRef;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}
