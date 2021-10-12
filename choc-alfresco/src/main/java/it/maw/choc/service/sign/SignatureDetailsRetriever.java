package it.maw.choc.service.sign;

import it.maw.choc.model.ChocModel;
import it.maw.choc.model.Service;
import it.maw.choc.util.RepoUtil;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.service.cmr.repository.ContentReader;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.cos.COSString;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.bouncycastle.cms.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.cert.CertStore;
import java.util.*;


/**
 * This service takes care of retrieving the signature information such as name of signer, expiration date, issuer's authority and so on.
 * The retrieved details are stored in a List of SignatureDetails objects.
 *
 * @author Giuseppe Urso
 * @see "http://www.alvestrand.no/objectid/2.5.29.17.html"
 * @see "http://docs.oracle.com/javase/7/docs/api/java/security/cert/X509Certificate.html#getSubjectAlternativeNames%28%29"
 *
 */
public class SignatureDetailsRetriever extends Service {

	private Logger logger = Logger.getLogger(SignatureDetailsRetriever.class);
	private List<SignatureDetails> signatureDetailsList;

	/**
	 * The service executor.
	 * The BouncyCastle provider prevents the 'SHA256 MessageDigest not available' exception.
	 */
	@Override
	protected boolean run() throws Exception {
		ContentReader reader = RepoUtil.getReader(getNodeRef());
		String mimetype = reader.getMimetype();
		InputStream is = RepoUtil.getInpuStream(getNodeRef());
		logger.debug("Trying to get signature details from the given content with mimetype: "+mimetype);

		if (mimetype!=null && mimetype.equals(MimetypeMap.MIMETYPE_PDF)) {
			getSignatureDetailsPDF(is);
		} else if (mimetype!=null && (mimetype.equalsIgnoreCase("application/pkcs7-signature")||mimetype.equalsIgnoreCase("application/pkcs7-mime"))) {
			getSignatureDetailsP7M(is);
		} else {
			// tento estrazione se il node del file finisce per .p7m
			String filename = ChocModel.getServiceRegistry().getFileFolderService().getFileInfo(getNodeRef()).getName();
			if(filename.toLowerCase().endsWith(ChocModel.FORMAT_P7M)){
				getSignatureDetailsP7M(is);
			}
		}
		is.close();
		return true;
	}

	/**
	 * SignatureDetails list getter and setter.
	 * @return
	 */
	public List<SignatureDetails> getSignatureDetailsList() {
		return signatureDetailsList;
	}
	public void setSignatureDetailsList(List<SignatureDetails> signatureDetailsList) {
		this.signatureDetailsList = signatureDetailsList;
	}


	/**
	 * The retriever of signature details from InputStream.
	 * The BouncyCastle provider prevents the 'SHA256 MessageDigest not available' exception.
	 * @param is
	 */

	public void getSignatureDetailsPDF(InputStream is) {
		try {
			byte[] bAIs = IOUtils.toByteArray(is);
			is.close();
			logger.debug("[PDF] Signature details retriever started...");
			InputStream bIs = new ByteArrayInputStream(bAIs);
			PDDocument pdf = PDDocument.load(bIs);
			List<PDSignature> signatures = pdf.getSignatureDictionaries();
			signatureDetailsList = new ArrayList<>();
			for (Iterator<PDSignature> iterator = signatures.iterator(); iterator.hasNext();) {
				PDSignature pdSignature = iterator.next();
				String name = pdSignature.getName();
				logger.debug("Inspect PDF signature details for [Signature field: "+name+"]");
				inspectSignaturePDF(pdSignature, bAIs);
			}
			Collections.sort(signatureDetailsList, new SignatureDetails());
			bIs.close();
		}
		catch (Exception e) {
			logger.error("Error while trying to retrieve PDF signature details from the given InputStream.");
			e.printStackTrace();
		}
	}

	/**
	 * A method to retrieve signature information from a given PDSignature
	 * @param pDSignature
	 */
	private void inspectSignaturePDF(PDSignature pdSignature, byte[] bAIs) {
		try {
			COSString contents = (COSString) pdSignature.getDictionary().getDictionaryObject(COSName.CONTENTS);
			byte[] buf = pdSignature.getSignedContent(bAIs);

			CMSSignedData signedData = new CMSSignedData(new CMSProcessableByteArray(buf), contents.getBytes());
			CertStore certStore = SignatureDetailsUtil.getCertStore(signedData);
			SignerInformationStore signerInfoStore = signedData.getSignerInfos();
			Collection<SignerInformation> signers = signerInfoStore.getSigners();
			Iterator<?> signersIter = signers.iterator();
			logger.debug("Total of Signers found: "+signers.size());
			int signCount=1;
			while (signersIter.hasNext()) {
				SignerInformation signerInfo = (SignerInformation) signersIter.next();
				logger.debug("Signer-"+signCount+" Fetching details...");
				SignatureDetails signatureDetails = new SignatureDetails();
				SignatureDetailsUtil.inspectSignatureP7M(signerInfo, certStore, signedData, signatureDetails);
				Calendar signDate = pdSignature.getSignDate();
				if(signDate!=null) {
					signatureDetails.setSignDate(signDate.getTime());
				}
				signatureDetailsList.add(signatureDetails);
				signCount++;
			}
		} catch (Exception e) {
			logger.error("Error while trying to inspect PKCS7 Signature.");
			e.printStackTrace();
		}
	}

	/**
	 * The retriever of signature details in case of P7M signed files.
	 * The BouncyCastle provider prevents the 'SHA256 MessageDigest not available' exception.
	 * @param is
	 * @see "https://www.borelly.net/cb/docs/javaBC-1.4.8/pkix/org/bouncycastle/cms/CMSSignedData.html"
	 */

	public void getSignatureDetailsP7M(InputStream is) {
		try {
			logger.debug("[P7M] Signature details retriever started...");
			byte[] contentBytes = IOUtils.toByteArray(is);
			is.close();
			CMSSignedData signedData = new CMSSignedData(contentBytes);

			CertStore certStore = SignatureDetailsUtil.getCertStore(signedData);
			SignerInformationStore signerInfoStore = signedData.getSignerInfos();
			Collection<SignerInformation> signers = signerInfoStore.getSigners();
			Iterator<?> signersIter = signers.iterator();
			logger.debug("Total of Signers found: " + signers.size());
			signatureDetailsList = new ArrayList<>();
			int signCount = 1;
			while (signersIter.hasNext()) {
				SignerInformation signerInfo = (SignerInformation) signersIter.next();
				logger.debug("Signer-" + signCount + " Fetching details...");
				SignatureDetails signatureDetails = new SignatureDetails();
				SignatureDetailsUtil.inspectSignatureP7M(signerInfo, certStore, signedData, signatureDetails);
				signatureDetailsList.add(signatureDetails);
				signCount++;
			}
		} catch (IOException e) {
			logger.error("Error while trying to retrieve P7M signature details from the given InputStream. Exception: "+e);
			e.printStackTrace();
		} catch (CMSException e) {
			logger.error("Error while trying to extract CMSSignedData from the given InputStream. Exception: "+e);
			e.printStackTrace();
		}
	}

}
