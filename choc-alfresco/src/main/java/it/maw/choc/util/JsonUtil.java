package it.maw.choc.util;

import it.maw.choc.model.ChocModel;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by Federico Tarantino on 07/05/18.
 */
public class JsonUtil {

  /**
   * Properties to json
   */
  public static String propsToJson(NodeRef node) {
    try {
      ScriptNode scriptNode = new ScriptNode(node, ChocModel.getServiceRegistry(), ChocModel.getAppUtils().getScope());
      return new JSONObject(ChocModel.getAppUtils().toJSON(scriptNode, true)).getJSONObject("properties").toString();
    } catch (JSONException e) {
      return new JSONObject().toString();
    }
  }

}
