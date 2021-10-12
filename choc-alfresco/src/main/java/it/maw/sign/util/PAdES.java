package it.maw.sign.util;

import com.itextpdf.text.pdf.AcroFields;
import com.itextpdf.text.pdf.PdfReader;
import org.alfresco.error.AlfrescoRuntimeException;
import org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;

public class PAdES {

	/**
	 * Check if signed file contains valid sign
	 * @param is
	 * @return true if sign is valid, false otherwise
	 */
	public static boolean verify(InputStream is) {
		try {
			boolean verified = verify(new PdfReader(is));
			IOUtils.closeQuietly(is);
			return verified;
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}
	}
	
	/**
	 * Check if signed file contains valid sign
	 * @param reader
	 * @return true if sign is valid, false otherwise
	 */
	public static boolean verify(PdfReader reader) {
		try {
			AcroFields af = reader.getAcroFields();
			ArrayList<String> names = af.getSignatureNames();
			if (names.size() > 0) {
				return true;
			} else {
				return false;
			}
		} catch (Exception e) {
			throw new AlfrescoRuntimeException("Unable to read PDF. Unable to check if the pdf is signed.",e);
		}
	}

}
