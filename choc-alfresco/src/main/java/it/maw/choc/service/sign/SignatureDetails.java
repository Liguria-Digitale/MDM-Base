package it.maw.choc.service.sign;

import java.util.Comparator;
import java.util.Date;

/**
 * The POJO container for the details of a signature.
 * It implements the Comparator interface which allows to sort a list of SignatureDetails
 * according to the order induced by the specified comparator (see the compare() method for details).
 */

public class SignatureDetails implements Comparator<SignatureDetails> {
    private String signName;
    private Date signDate;
    private String signAlgorithm;
    private String subjectName;
    private String subjectEmail;
    private String certIssuer;
    private String certDateNotBefore;
    private String certDateNotAfter;
    private String certFormat;


    public String getSignName() {
        return signName;
    }
    public void setSignName(String signName) {
        this.signName = signName;
    }
    public String getSubjectName() {
        return subjectName;
    }
    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }
    public String getSubjectEmail() {
        return subjectEmail;
    }
    public void setSubjectEmail(String subjectEmail) {
        this.subjectEmail = subjectEmail;
    }
    public String getSignAlgorithm() {
        return signAlgorithm;
    }
    public Date getSignDate() {
        return signDate;
    }
    public void setSignDate(Date signDate) {
        this.signDate = signDate;
    }
    public void setSignAlgorithm(String signAlgorithm) {
        this.signAlgorithm = signAlgorithm;
    }
    public String getCertIssuer() {
        return certIssuer;
    }
    public void setCertIssuer(String certIssuer) {
        this.certIssuer = certIssuer;
    }
    public String getCertDateNotBefore() {
        return certDateNotBefore;
    }
    public void setCertDateNotBefore(String certDateNotBefore) {
        this.certDateNotBefore = certDateNotBefore;
    }
    public String getCertDateNotAfter() {
        return certDateNotAfter;
    }
    public void setCertDateNotAfter(String certDateNotAfter) {
        this.certDateNotAfter = certDateNotAfter;
    }
    public String getCertFormat() {
        return certFormat;
    }
    public void setCertFormat(String certFormat) {
        this.certFormat = certFormat;
    }
    /**
     * Compares its two arguments to order a list of SignatureDetails by signDate.
     */
    @Override
    public int compare(SignatureDetails sign1, SignatureDetails sign2) {
        return sign1.getSignDate().compareTo(sign2.getSignDate());

    }
}
