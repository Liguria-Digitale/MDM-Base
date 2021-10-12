package it.maw.choc.ws;

import it.maw.choc.model.ChocModel;
import it.maw.scan.capturing.service.TransformationService;
import org.alfresco.model.ApplicationModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.content.filestore.FileContentReader;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.web.scripts.content.StreamContent;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.util.TempFileProvider;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.apache.tika.Tika;
import org.bouncycastle.cms.CMSException;
import org.bouncycastle.cms.CMSSignedData;
import org.bouncycastle.cms.SignerInformation;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.*;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

/**
 * @author federico
 *
 */
public class DocPreview extends StreamContent {
	/**
	 * @see org.alfresco.repo.web.scripts.content.StreamContent#execute(org.springframework.extensions.webscripts.WebScriptRequest,
	 *      org.springframework.extensions.webscripts.WebScriptResponse)
	 */
	private static Logger logger = Logger.getLogger(DocPreview.class);

	@SuppressWarnings("unchecked")
	@Override
	public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {

		NodeRef node = new NodeRef(req.getParameter("noderef"));
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		NodeService nodeService = serviceRegistry.getNodeService();
		ContentService contentService = serviceRegistry.getContentService();
		ContentReader reader;

		// controllo che il contenuto non sia criptato
		if(nodeService.hasAspect(node, ChocModel.ASPECT_ENCRYPTED)) {
			logger.warn("Impossibile fornire preview di un documento criptato");
			returnErrorDoc(res.getOutputStream());
			return;
		}

		ByteArrayOutputStream outStream = new ByteArrayOutputStream();
		String name = nodeService.getProperty(node, ContentModel.PROP_NAME).toString();
		logger.debug("TEST name: " + name);
		
		ContentReader contentReader = contentService.getReader(node, ContentModel.PROP_CONTENT);
		InputStream is = contentReader.getContentInputStream();
		byte[] inputnode = IOUtils.toByteArray(is);
		is.close();

		Tika tika = new Tika();
		String mimeTypeTika = tika.detect(inputnode);

		if(!mimeTypeTika.equalsIgnoreCase("application/pkcs7-signature") && name.endsWith(".p7m")){
			mimeTypeTika = "application/pkcs7-signature";
		}

		if (!name.endsWith(".pdf")) {
			name = name + ".pdf";
		}
		res.setContentType(MimetypeMap.MIMETYPE_PDF);
		res.setHeader("Content-Disposition", "filename=\"" + name + "\"");

		reader = contentService.getReader(node, ContentModel.PROP_CONTENT);
		// check mimetype RFC822 or rather eml
		if (mimeTypeTika.equalsIgnoreCase("application/pkcs7-signature")
				|| mimeTypeTika.equalsIgnoreCase("application/pkcs7-mime")) {
			OutputStream os = null;
			try {
				CMSSignedData data = new CMSSignedData(inputnode);
				if (data.getSignedContent() != null){
					data.getSignedContent().write(outStream);
					File pdfFile = TempFileProvider.createTempFile("pkcspreview", ".bin");
					os = new FileOutputStream(pdfFile);
					os.write(outStream.toByteArray());
					reader = new FileContentReader(pdfFile);
					//DETECT
					InputStream toD = new FileInputStream(pdfFile);
					tika = new Tika();
					String mmTp = tika.detect(toD);
					if (mmTp.equalsIgnoreCase(ChocModel.MIMETYPE_APP_XML)){
						mmTp = MimetypeMap.MIMETYPE_XML;
					}
					reader.setMimetype(mmTp);
					toD.close();
				}
				else if (data.getSignerInfos() != null){ //Print signer info 
					Collection<SignerInformation> signers = data.getSignerInfos().getSigners();
					String txt = "";
					for (Iterator<SignerInformation> iterator = signers.iterator(); iterator.hasNext();) {
						SignerInformation signerInformation = iterator.next();
						txt += signerInformation.getSID().toString() + "\n"; 
					}
					File txtFile = TempFileProvider.createTempFile("p7spreview", ".txt");
					os = new FileOutputStream(txtFile);
					os.write(txt.getBytes());
					reader = new FileContentReader(txtFile);
					reader.setMimetype(MimetypeMap.MIMETYPE_TEXT_PLAIN);
				}
			} catch (CMSException e) {
				logger.error(e.getMessage());
			} finally {
				outStream.close();
				if(os!=null){
					os.flush();
					os.close();
				}
			}
		} else if (!reader.getMimetype().equals(MimetypeMap.MIMETYPE_PDF) && mimeTypeTika.equals(MimetypeMap.MIMETYPE_PDF)) {
			reader.setMimetype(mimeTypeTika);
		}

		try {
			// convert temp html file in pdf and pour it in outputStream
			IOUtils.copy(TransformationService.toPdf(reader, node), res.getOutputStream());
		} catch (Exception e) {
			logger.error("DOCPREVIEW ERROR");
			e.printStackTrace();
			returnErrorDoc(res.getOutputStream());
		}
	}

	private void returnErrorDoc(OutputStream os){
		try {
			os.write("<h3>Impossibile visualizzare l'anteprima</h3>".getBytes());
		} catch (Exception e1) {
			e1.printStackTrace();
		}
	}
}
