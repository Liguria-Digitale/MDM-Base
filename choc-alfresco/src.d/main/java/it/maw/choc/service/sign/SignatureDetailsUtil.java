package it.maw.choc.service.sign;

import it.maw.sign.util.SignUtil;
import org.apache.log4j.Logger;
import org.bouncycastle.asn1.x509.X509Name;
import org.bouncycastle.cms.CMSException;
import org.bouncycastle.cms.CMSSignedData;
import org.bouncycastle.cms.SignerInformation;
import org.bouncycastle.jce.PrincipalUtil;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.cert.*;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.Iterator;

public class SignatureDetailsUtil {

    private static Logger logger = Logger.getLogger(SignatureDetailsUtil.class);

    /**
     * A method to retrieve signature information from a given PKCS7
     */
    public static void inspectSignatureP7M(SignerInformation signerInfo, CertStore certStore, CMSSignedData signedData, SignatureDetails signatureDetails) {
		try {
			Collection<?> certCollection = certStore.getCertificates(signerInfo.getSID());
			Iterator<?> certIter = certCollection.iterator();
			X509Certificate cert = (X509Certificate) certIter.next();

			boolean isValidSignature = signerInfo.verify(cert, BouncyCastleProvider.PROVIDER_NAME);
			logger.debug("Signature integrity check OK: "+isValidSignature);
			if (isValidSignature) {
				SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

				String signName = ""+ PrincipalUtil.getSubjectX509Principal(cert).getValues(X509Name.SERIALNUMBER).get(0);
				signatureDetails.setSignName(signName);

				String signAlg = cert.getSigAlgName();
				signatureDetails.setSignAlgorithm(signAlg);

				Date signOn = SignUtil.getSignatureDateDER(signerInfo);
				signatureDetails.setSignDate(signOn);

				String subjectName = (String) PrincipalUtil.getSubjectX509Principal(cert).getValues(X509Name.CN).get(0);
				signatureDetails.setSubjectName(subjectName);

				String subjectEmail = SignUtil.getSubjectAlternativeNameByType(cert, 1);
				signatureDetails.setSubjectEmail(subjectEmail);

				String certIssuer= "CN="+ PrincipalUtil.getIssuerX509Principal(cert).getValues(X509Name.CN).get(0)+", O="+ PrincipalUtil.getIssuerX509Principal(cert).getValues(X509Name.O).get(0);
				signatureDetails.setCertIssuer(certIssuer);

				String certFormat = cert.getType();
				signatureDetails.setCertFormat(certFormat);

				String certDateNotBefore = dateFormat.format(cert.getNotBefore());
				signatureDetails.setCertDateNotBefore(certDateNotBefore);

				String certDateNotAfter = dateFormat.format(cert.getNotAfter());
				signatureDetails.setCertDateNotAfter(certDateNotAfter);
			}
		} catch (CertificateEncodingException | CertStoreException | CertificateExpiredException | CertificateNotYetValidException | NoSuchAlgorithmException | NoSuchProviderException | CMSException e) {
			logger.error("Error while trying to inspect PKCS7 P7M Signature. Exception: "+e);
			e.printStackTrace();
		}
    }

    public static CertStore getCertStore(CMSSignedData signedData){
        try {
            return signedData.getCertificatesAndCRLs("Collection", SignUtil.BOUNCY_CASTLE_PROVIDER);
        }
        catch (Exception e){
            e.printStackTrace();
        }
        return null;
    }
}
