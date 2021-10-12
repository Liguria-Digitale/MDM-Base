package it.maw.sign.util;

import com.itextpdf.text.pdf.AcroFields;
import com.itextpdf.text.pdf.PdfPKCS7;
import com.itextpdf.text.pdf.PdfReader;
import org.apache.log4j.Logger;
import org.bouncycastle.asn1.*;
import org.bouncycastle.asn1.cms.Attribute;
import org.bouncycastle.asn1.cms.AttributeTable;
import org.bouncycastle.asn1.cms.CMSAttributes;
import org.bouncycastle.asn1.x509.X509Name;
import org.bouncycastle.cms.SignerInformation;
import org.bouncycastle.jce.PrincipalUtil;
import org.bouncycastle.jce.X509Principal;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.io.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.cert.*;
import java.util.*;


public class SignUtil {

	public static final BouncyCastleProvider BOUNCY_CASTLE_PROVIDER = new BouncyCastleProvider();
	public static final String SHA_256 = "SHA-256";
	public static final String X509 = "X.509";
	private static Logger logger = Logger.getLogger(SignUtil.class);

	public enum AdESType {
		CAdES, PAdES, XAdES
	}
	
	/**
	 * CERTIFICATE UTILS
	 */
	
	/**
	 * Obtains the Issuer for the X509Certificate.
	 * 
	 * @param cert
	 * @return
	 * @throws CertificateEncodingException
	 * @throws IOException
	 */
	public static DERObject getIssuer(X509Certificate cert) throws CertificateEncodingException, IOException {
		byte[] abTBSCertificate = cert.getTBSCertificate();
		ASN1Sequence seq = (ASN1Sequence) SignUtil.readDERObject(abTBSCertificate);
		return (DERObject) seq.getObjectAt(seq.getObjectAt(0) instanceof DERTaggedObject ? 3 : 2);
	}
	 
	/**
	 * hex certificate to X509certificate
	 * @param hexCertificate
	 * @return
	 * @throws CertificateException
	 */
	public static X509Certificate hexCertificateToX509Certificate(String hexCertificate) throws CertificateException {
		CertificateFactory cf = CertificateFactory.getInstance(X509);
		X509Certificate certificate = (X509Certificate) cf.generateCertificate(new ByteArrayInputStream(hexTobyte(hexCertificate)));
		return certificate;
	}
	  
	/**
	 * Builds the X509Certificate for the byte[].
	 * 
	 * @param encodedCertificate
	 * @return
	 * @throws IOException
	 * @throws CertificateException
	 */
	public static X509Certificate toX509Certificate( byte[] encodedCertificate ) throws IOException, CertificateException{
		CertificateFactory cf = CertificateFactory.getInstance(X509);
		ByteArrayInputStream bais = new ByteArrayInputStream(encodedCertificate);
		Certificate certificate = cf.generateCertificate( new BufferedInputStream(bais) );
		bais.close();
		return (X509Certificate) certificate;
	}

	/**
	 * extract common name or alternative from x509
	 * @param cert
	 * @return
	 * @throws CertificateEncodingException
	 */
	public static String extractName(X509Certificate cert) throws CertificateEncodingException {
		X509Principal principal = PrincipalUtil.getSubjectX509Principal(cert);
		Vector<?> cn = principal.getValues(X509Name.CN);
		if (cn.size() > 0) {
			return (String) cn.get(0);
		}
		Vector<?> pseudo = principal.getValues(X509Name.PSEUDONYM);
		if (pseudo.size() > 0) {
			return (String) pseudo.get(0);
		}
		Vector<?> o = principal.getValues(X509Name.O);
		if (o.size() > 0) {
			return (String) o.get(0);
		}
		return null;
	}
	
	/**
	 * HEX/BYTE/STRING CONVERTING UTILS
	 */

	/**
	 * converting a byte[] to it's hexadecimal format String
	 * 
	 * @param buf the byte to convert
	 * @return the hex String corresponding to buf
	 */
	public static String byteToHex(byte[] buf) {
		if (buf == null) return null;
		return byteToHex(buf, 0, buf.length);
	}

	/**
	 * converting a byte[] to it's hexadecimal format String
	 * 
	 * @param buf the byte to convert
	 * @offset the offset to star with conversion
	 * @len how many byte to convert
	 * @return the hex String corresponding to buf
	 */
	public static String byteToHex(byte[] buf, int offset, int len) {
		if (buf == null)
			return null;
		StringBuffer ret = new StringBuffer();
		long tmpL = 0;
		String tmp;
		for (int i = 0; i < len / 8; i++) {
			for (int k = 0; k < 8; k++) {
				tmpL = tmpL << 8;
				tmpL = tmpL | (0xff & buf[(i * 8) + k + offset]);
			}
			tmp = Long.toHexString(tmpL);
			for (int j = 0; j < 16 - tmp.length(); j++) {
				ret.append('0');
			}
			ret.append(tmp);
			tmpL = 0;
		}
		int mod = len % 8;
		if (mod != 0) {
			for (int k = len - mod; k < len; k++) {
				tmpL = tmpL << 8;
				tmpL = tmpL | (0xff & buf[k + offset]);
			}
			tmp = Long.toHexString(tmpL);
			for (int j = 0; j < (mod * 2) - tmp.length(); j++) {
				ret.append('0');
			}
			ret.append(tmp);
		}
		return ret.toString().toUpperCase();
	}

	/**
	 * converting a hexadecimal format String to corresponding byte[]
	 * @param buf the hexadecimal format String
	 * @return corresponding byte[]
	 */
	public static byte[] hexTobyte(String buf) {
		if (buf == null)
			return null;
		byte[] ret = new byte[buf.length() / 2];
		for (int i = 0; i < buf.length(); i = i + 2) {
			ret[i / 2] = (byte) Integer.parseInt(buf.substring(i, i + 2), 16);
		}
		return ret;
	}
	
	/**
	 * DIGEST UTILS
	 */

	/**
	 * calculate fingerprint of a given byte[] using SHA-256 agorithm
	 * @param buffer the buffer on which calculate the fingerprint
	 * @return finger print
	 * @throws NoSuchAlgorithmException
	 * @throws NoSuchProviderException
	 * @throws IOException
	 */
	public static byte[] digest256(byte[] buffer) throws NoSuchAlgorithmException, NoSuchProviderException, IOException {
		return digest(SHA_256, buffer);
	}

	/**
	 * calculate fingerprint of a given byte[] using SHA-256 agorithm
	 * @param buffer the buffer on which calculate the fingerprint
	 * @return finger print
	 * @throws NoSuchAlgorithmException
	 * @throws NoSuchProviderException
	 * @throws IOException
	 */
	public static byte[] digest(String algorithm, byte[] buffer) throws NoSuchAlgorithmException, NoSuchProviderException, IOException {
		MessageDigest md =  MessageDigest.getInstance(algorithm, SignUtil.BOUNCY_CASTLE_PROVIDER);
		md.update(buffer, 0, buffer.length);
		return md.digest();
	}
	
	/**
	 * calculate fingerprint of a given InputStream using SHA-256 agorithm
	 * 
	 * @param is the inputStream on which calculate the fingerprint
	 * @return finger print
	 * @throws NoSuchAlgorithmException
	 * @throws NoSuchProviderException
	 * @throws IOException
	 */
	public static byte[] digest256(InputStream is) throws NoSuchAlgorithmException, NoSuchProviderException, IOException {
		return digest(SHA_256, is);
	}
	
	/**
	 * calculate fingerprint of a given InputStream using given agorithm
	 * 
	 * @param alghoritm the algorithm to use
	 * @param is the inputStream on which calculate the fingerprint
	 * @return finger print
	 * @throws NoSuchAlgorithmException
	 * @throws NoSuchProviderException
	 * @throws IOException
	 */
	private static byte[] digest(String alghoritm, InputStream is) throws NoSuchAlgorithmException, NoSuchProviderException, IOException {
		byte[] buffer = new byte[1024];
		MessageDigest md =  MessageDigest.getInstance(alghoritm, SignUtil.BOUNCY_CASTLE_PROVIDER);
		int read = is.read(buffer);
		while (read!=-1) {
			md.update(buffer, 0, read);
			read = is.read(buffer);
		}
		is.close();
		return md.digest();
	}
	
	/**
	 * IO UTILS
	 */

	/**
	 * Dumps the content of in-memory Object to a byte[].
	 * 
	 * @param v
	 * @return
	 * @throws IOException
	 */
	public static byte[] toByteArray(ASN1EncodableVector v) throws IOException {
		return new DERSequence(v).getEncoded();
	}

	/**
	 * Dumps the content of in-memory Object to a byte[].
	 * 
	 * @param derEncObject
	 * @return
	 * @throws IOException
	 */
	public static byte[] toByteArray(DEREncodable derEncObject)	throws IOException {
		ByteArrayOutputStream bOut = new ByteArrayOutputStream();
		BufferedOutputStream bos = new BufferedOutputStream(bOut);
		ASN1OutputStream dout = new ASN1OutputStream(bos);
		dout.writeObject(derEncObject);
		dout.close();
		return bOut.toByteArray();
	}

	/**
	 * Reads an DERObject from a byte[].
	 * 
	 * @param ab
	 * @return
	 * @throws IOException
	 */
	public static DERObject readDERObject(byte[] ab) throws IOException {
		ASN1InputStream in = SignUtil.getASN1InputStream(ab);
		DERObject obj = in.readObject();
		return obj;
	}

	/**
	 * Reads an DERObject from a byte[].
	 * 
	 * @param ab
	 * @return
	 * @throws IOException
	 */
	public static ASN1EncodableVector readASN1EncodableVector(byte[] ab) throws IOException {
		ASN1EncodableVector v = new ASN1EncodableVector();
		ASN1StreamParser p = new ASN1StreamParser(ab);
		DEREncodable s = (DEREncodable) p.readObject();
		@SuppressWarnings("rawtypes")
		Enumeration e = ((DERSequence)s.getDERObject()).getObjects();
		while (e.hasMoreElements()) {
			DERObject de = (DERObject)e.nextElement();
			v.add(de);
		}
		return v;
	}

	/**
	 * Gets an ASN1Stream from a byte[].
	 * 
	 * @param ab
	 * @return
	 */
	private static ASN1InputStream getASN1InputStream(byte[] ab) {
		ByteArrayInputStream bais = new ByteArrayInputStream(ab);
		BufferedInputStream bis = new BufferedInputStream(bais);
		ASN1InputStream asn1is = new ASN1InputStream(bis);
		return asn1is;
	}

	/**
	 * Retrieves the Subject alternative name field of a given x509 certificate corresponding to
	 * the specified type code number.</br>List of permitted type codes, according to the OID 2.5.29.17 certificate extension:</br>
	 * </br>
	 * otherName                       [0]     OtherName</br>
     * rfc822Name (email)              [1]     IA5String</br>
     * dNSName                         [2]     IA5String</br>
     * x400Address                     [3]     ORAddress</br>
     * directoryName                   [4]     Name</br>
     * ediPartyName                    [5]     EDIPartyName</br>
     * uniformResourceIdentifier       [6]     IA5String</br>
     * iPAddress                       [7]     OCTET STRING</br>
     * registeredID                    [8]     OBJECT IDENTIFIER</br>
  	 *
	 * @param certificate
	 * @param type (permitted values 0...8)
	 * @return
	 */
	public static String getSubjectAlternativeNameByType(X509Certificate certificate, int type) {
		String value = "";
		try {
			Collection<?> subjectAltNames = certificate.getSubjectAlternativeNames();
			if (subjectAltNames == null) {
				logger.debug("Subject Alternative Names list is empty!");
				return value;
			}
			for (Object subjectAltName : subjectAltNames) {
				List<?> entry = (List<?>) subjectAltName;
				if (entry != null && entry.size() > 0) {
					Integer altNameType = (Integer) entry.get(0);
					if (altNameType == type) {
						logger.debug("Subject Alternative Names TYPE: " + altNameType);
						String altName = (String) entry.get(1);
						if (altName != null) {
							logger.debug("Subject Alternative Names VALUE: " + altName);
							value = altName;
						}
					}
				}
			}
			return value;
		} catch (CertificateParsingException e) {
			logger.warn("Error while trying to retrieves Subject Alternative Name from X509 Certificate. Exception: " + e);
			return value;
		}
	}
	
	/**
	 * Retrieves a list of PKCS7 certificates from a given signed PDF inputstream.
	 * @param signedPdfStream
	 */
	
	public static List<PdfPKCS7> getPKCS7fromSignedPdf(InputStream signedPdfStream) {
		List<PdfPKCS7> certList = new ArrayList<>();
		PdfReader pdfReader;
		try {
			pdfReader = new PdfReader(signedPdfStream);
			AcroFields fields = pdfReader.getAcroFields();
			ArrayList<String> names = fields.getSignatureNames();
			if (names!=null && names.size()>0) {
				for (String name : names) {
					logger.debug("Retrieving PKCS7 certificate for [Signature: "+name+"]");
					PdfPKCS7 pkcs7 = fields.verifySignature(name);
					certList.add(pkcs7);
				}
			}
		} catch (IOException e) {
			logger.error("Error while trying to retrieve PKCS7 certificates from the given InputStream. Exceprion: "+e);
		}
		return certList;
	}
	
	/**
	 * Retrieves the email field from a given PdfPKCS7 certificate.
	 * @param pkcs7
	 * @return
	 */
	public static String getSubjectEmail(PdfPKCS7 pkcs7){
		String email = PdfPKCS7.getSubjectFields(pkcs7.getSigningCertificate()).getField("E");
		if (email==null) {
			X509Certificate cert = (X509Certificate) pkcs7.getSigningCertificate();
			email = getSubjectAlternativeNameByType(cert, 1);
		}
		logger.debug("Signature email field retrieved: "+email);
		return email;
	}
	
	/**
	 * A method to extract the signature time from a SignerInformation object.
	 * The method extracts and decode the signing-time Attribute from the signedAttributes table corresponding to the subject.
	 * The signing-time Attribute must be in DER format (ASN1 format is supported only with bouncycastle versions grater than 1.47).
	 * @param signerInfo
	 * @return
	 * 
	 */
	public static Date getSignatureDateDER(SignerInformation signerInfo){
		Date signDate=null;
		try {
			AttributeTable signedAttr = signerInfo.getSignedAttributes();
			Attribute signingTime = signedAttr.get(CMSAttributes.signingTime);
			if (signingTime != null) {
				logger.debug("Signing Time Attiribute detected with OID [" + signingTime.getAttrType() + "]. Trying to parse to Date format...");
				Enumeration<?> en = signingTime.getAttrValues().getObjects();
				while (en.hasMoreElements()) {
					Object obj = en.nextElement();
					if (obj instanceof DERUTCTime) {
						DERUTCTime derTime = (DERUTCTime) obj;
						signDate = derTime.getDate();
						logger.debug("Signature date: " + signDate);
					} else {
						logger.warn("Unable to retrieve signature date. Only DER Signature Attributes are supported. ");
					}
				}
			} else {
				logger.warn("No signature time found! DER Attribute 'signingTime' is empty.");
			}
		}
		catch (Throwable e){
			logger.warn("No signature time found for DER Attribute 'signingTime' " + e.getMessage());
		}
        return signDate;
	}
}
