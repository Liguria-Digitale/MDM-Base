package it.maw.scan.capturing.ticket;

import java.io.File;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.TempFileProvider;

/**
 * @author Federico Tarantino
 */
public class Ticket {
	
	private String id; //id del ticket
	private String targetFormat; //formato del file finale
	private boolean ocrActive; // ocr attivo o disattivo
	private String ocrLanguage; // linguaggio da usare per l'ocr
	private List<Integer> barcodePages; // i numeri delle pagine che contengono barcode
	private int pages; // numero di pagine
	private String outputName; // nome del file finale
	private List<File> outputFiles; // lista dei file finali da caricare
	private Map<NodeRef, String> noderefs; // lista dei noderef dei file caricati
	private String workPath; // directory working
	private QName type; // type del file da caricare
	private Map<QName, Serializable> uploadParam; // mappa delle proprietà per l'upload dei file
	private String destination;
	
	
	protected Ticket(){
		// create new UUID
		setId(UUID.randomUUID().toString());
		// set default values
    setTargetFormat(TicketsManager.FORMAT_PDF);
		setBarcodePages(new ArrayList<Integer>());
		setOcrLanguage("ita");
		setOcrActive(false);
		setPages(0);
		setOutputFiles(new ArrayList<File>());
		setNoderefs(new HashMap<NodeRef, String>());
		File temp = new File(TempFileProvider.getTempDir()+"/"+getId());
		temp.mkdir();
		setWorkPath(temp.getAbsolutePath()+"/");
		setUploadParam(new HashMap<QName, Serializable>());
	}

	/**
	 * @return the id
	 */
	public String getId() {
		return id;
	}

	/**
	 * @param id the id to set
	 */
	private void setId(String id) {
		this.id = id;
	}

	/**
	 * @return the targetFormat
	 */
	public String getTargetFormat() {
		return targetFormat;
	}

	/**
	 * @param targetFormat the targetFormat to set
	 */
	public void setTargetFormat(String targetFormat) {
		this.targetFormat = targetFormat;
	}

	/**
	 * @return the ocrActive
	 */
	public boolean isOcrActive() {
		return ocrActive;
	}

	/**
	 * @param ocrActive the ocrActive to set
	 */
	public void setOcrActive(boolean ocrActive) {
		this.ocrActive = ocrActive;
	}

	/**
	 * @return the ocrLanguage
	 */
	public String getOcrLanguage() {
		return ocrLanguage;
	}

	/**
	 * @param ocrLanguage the ocrLanguage to set
	 */
	public void setOcrLanguage(String ocrLanguage) {
		this.ocrLanguage = ocrLanguage;
	}

	/**
	 * @return the barcodePages
	 */
	public List<Integer> getBarcodePages() {
		return barcodePages;
	}

	/**
	 * @param barcodePages the barcodePages to set
	 */
	private void setBarcodePages(List<Integer> barcodePages) {
		this.barcodePages = barcodePages;
	}
	
	/**
	 * @param pageNumber
	 */
	public void addBarcodePage(int pageNumber) {
		getBarcodePages().add(pageNumber);
	}

	/**
	 * @return the pages
	 */
	public int getPages() {
		return pages;
	}

	/**
	 * @param pages the pages to set
	 */
	public void setPages(int pages) {
		this.pages = pages;
	}

	/**
	 * @return the outputName
	 */
	public String getOutputName() {
		return outputName;
	}

	/**
	 * @param outputName the outputName to set
	 */
	public void setOutputName(String outputName) {
		this.outputName = outputName;
	}

	/**
	 * @return the outputFiles
	 */
	public List<File> getOutputFiles() {
		return outputFiles;
	}

	/**
	 * @param outputFiles the outputFiles to set
	 */
	private void setOutputFiles(List<File> outputFiles) {
		this.outputFiles = outputFiles;
	}
	
	/**
	 * @param outputFile
	 */
	public void addOutputFile(File outputFile) {
		getOutputFiles().add(outputFile);
	}
	
	/**
	 * @return the noderefs
	 */
	public Map<NodeRef, String> getNoderefs() {
		return noderefs;
	}

	/**
	 * @param noderefs the noderefs to set
	 */
	public void setNoderefs(Map<NodeRef, String> noderefs) {
		this.noderefs = noderefs;
	}
	
	/**
	 * @param noderef the noderefs to set
	 * @param name the name of node
	 */
	public void addNoderef(NodeRef noderef, String name) {
		this.noderefs.put(noderef, name);
	}

	/**
	 * @return the workPath
	 */
	public String getWorkPath() {
		return workPath;
	}

	/**
	 * @param workPath the workPath to set
	 */
	private void setWorkPath(String workPath) {
		this.workPath = workPath;
	}

	/**
	 * @return the type
	 */
	public QName getType() {
		return type;
	}

	/**
	 * @param type the type to set
	 */
	public void setType(QName type) {
		this.type = type;
	}

	/**
	 * @return the uploadParam
	 */
	public Map<QName, Serializable> getUploadParam() {
		return uploadParam;
	}

	/**
	 * @param uploadParam the uploadParam to set
	 */
	public void setUploadParam(Map<QName, Serializable> uploadParam) {
		this.uploadParam = uploadParam;
	}

	/**
	 * @return the destination
	 */
	public String getDestination() {
		return destination;
	}

	/**
	 * @param destination the destination to set
	 */
	public void setDestination(String destination) {
		this.destination = destination;
	}
}
