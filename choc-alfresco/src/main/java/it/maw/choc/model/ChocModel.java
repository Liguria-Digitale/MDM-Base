package it.maw.choc.model;

import org.alfresco.repo.jscript.ApplicationScriptUtils;
import org.alfresco.repo.jscript.ScriptUtils;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.namespace.QName;

import java.text.SimpleDateFormat;
import java.util.ResourceBundle;

public class ChocModel {

	// Global object for common use
	private static ServiceRegistry serviceRegistry;
	private static PolicyComponent policyComponent;
	private static ApplicationScriptUtils appUtils;
	private static ScriptUtils scriptUtils = new ScriptUtils();
	public static final String FORMAT_P7M = ".p7m";
	public static final String MIMETYPE_P7M = "application/pkcs7-mime";
	public static final String MIMETYPE_P7S = "application/pkcs7-signature";
	public static final String MIMETYPE_APP_XML = "application/xml";
	public static final String FOLDER_CHOC = "Choc";
	public static final String PROPERTIES_CAPTURING = "alfresco/module/choc/properties/capturing";
	public static ResourceBundle BUNDLE_CAPTURING = ChocUtil.getRB(PROPERTIES_CAPTURING);
	public static final String CHOC_SITE_PRESET = "choc-site";
	public static final String CONTAINER_DOCLIB = "documentLibrary";
	public static final String CONTAINER_AUDIT = "auditLists";
	public static final String CONTAINER_HOMES = "homes";
	public static final String URI_SIGN = "http://www.sign.org/model/dictionary/1.0";
	public static final String URI_ORG = "http://www.org.it/model/org/1.0";
	public static final String URI_TIT = "http://www.reg.it/model/tit/1.0";
	public static final String URI_AUDIT = "http://www.reg.it/model/audit/1.0";
	public static final QName TYPE_TIT_BASEFOLDER = QName.createQName(URI_TIT, "baseFolder");
	public static final QName TYPE_TIT_TITOLO = QName.createQName(URI_TIT, "titolo");
	public static final QName TYPE_TIT_CLASSE = QName.createQName(URI_TIT, "classe");
	public static final QName TYPE_TIT_FASCICOLO = QName.createQName(URI_TIT, "fascicolo");
	public static final QName TYPE_AUDIT_ENTITY = QName.createQName(URI_AUDIT, "auditEntity");
	public static final QName TYPE_NODE_UO = QName.createQName(URI_ORG, "nodeUo");
	public static final QName ASPECT_SIGN = QName.createQName(URI_SIGN, "signed");
	public static final QName ASPECT_ENCRYPTED = QName.createQName(URI_SIGN, "encrypted");
	public static final QName ASSOC_ORG_USERS = QName.createQName(URI_ORG, "usersAssoc");
	public static final QName PROP_UO_GROUP = QName.createQName(URI_ORG, "nodeUoGroup");
	public static final QName PROP_BASEFOLDER_NUMBER = QName.createQName(URI_TIT, "baseFolderNumber");
	public static final QName PROP_BASE_COUNTER = QName.createQName(URI_TIT, "baseCounter");
	public static final QName PROP_AUDIT_USER = QName.createQName(URI_AUDIT, "userOwner");
	public static final QName PROP_AUDIT_SITE = QName.createQName(URI_AUDIT, "site");
	public static final QName PROP_AUDIT_ACTION = QName.createQName(URI_AUDIT, "action");
	public static final QName PROP_AUDIT_DATE = QName.createQName(URI_AUDIT, "date");
	public static final QName PROP_AUDIT_NODE = QName.createQName(URI_AUDIT, "referenceNodeRef");
	public static final QName PROP_AUDIT_NAME = QName.createQName(URI_AUDIT, "referenceName");
	public static final QName PROP_AUDIT_TYPE = QName.createQName(URI_AUDIT, "referenceType");
	public static final QName PROP_AUDIT_PARAMS = QName.createQName(URI_AUDIT, "params");
	public static SimpleDateFormat dateSimpleformatter = new SimpleDateFormat("dd/MM/yyyy");
	public static SimpleDateFormat datetimeSimpleformatter = new SimpleDateFormat("dd/MM/yyyy HH:mm");
	public static SimpleDateFormat dateYearDashFormatter = new SimpleDateFormat("yyyy-MM-dd");
	public static SimpleDateFormat timezoneFormatter = new SimpleDateFormat("Z");

	public static ServiceRegistry getServiceRegistry() {
		return serviceRegistry;
	}

	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		ChocModel.serviceRegistry = serviceRegistry;
	}

	public static PolicyComponent getPolicyComponent() {
		return policyComponent;
	}

	public void setPolicyComponent(PolicyComponent policyComponent) {
		ChocModel.policyComponent = policyComponent;
	}

	public static ApplicationScriptUtils getAppUtils() {
		return appUtils;
	}

	public static void setAppUtils(ApplicationScriptUtils appUtils) {
		ChocModel.appUtils = appUtils;
	}

	public static ScriptUtils getScriptUtils() {
		return scriptUtils;
	}

	private ChocModel(){}

}
