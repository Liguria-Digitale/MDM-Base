package it.maw.scan.capturing.service;

import com.itextpdf.text.Document;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.pdf.PdfWriter;
import it.maw.choc.model.ChocModel;
import it.maw.scan.capturing.ticket.Ticket;
import it.maw.scan.capturing.ticket.TicketsManager;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.content.filestore.FileContentReader;
import org.alfresco.repo.content.filestore.FileContentWriter;
import org.alfresco.repo.content.transform.ContentTransformer;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.util.TempFileProvider;
import org.apache.log4j.Logger;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.UUID;


/**
 * @author Federico Tarantino
 */
public class TransformationService {

	private static final String	TESSERACT_COMMAND = "tesseract.ocr.command";
	private static Logger logger = Logger.getLogger(TransformationService.class);
	
	private TransformationService(){}

	public static void image2pdf(File inputFile, Ticket ticket){
		try {
			String baseOutput = ticket.getWorkPath() + TicketsManager.PAGE_NAME + ticket.getPages();
			logger.debug("Retrieved base output: "+baseOutput);
			File outFile = new File(baseOutput + ticket.getTargetFormat());
			image2pdfInternal(inputFile, outFile);
		} catch (Exception e){
			logger.error("Impossibile convertire immagine in pdf con itext: "+e.getMessage());
			TransformationService.transform(inputFile, ticket);
		}
	}

	/**
	 * transform a file to another format with alfresco transformation server
	 * @param inputFile
	 * @param ticket
	 */
	public static void transform(File inputFile, Ticket ticket){
		
		ServiceRegistry serviceRegistry = ChocModel.getServiceRegistry();
		
		// get base output
		String baseOutput = ticket.getWorkPath() + TicketsManager.PAGE_NAME + ticket.getPages();
		logger.debug("Retrieved base output: "+baseOutput);
		// create content reader
		FileContentReader contentReader = new FileContentReader(inputFile);
		contentReader.setMimetype(serviceRegistry.getMimetypeService().guessMimetype(inputFile.getName()));
		// create content writer
		FileContentWriter contentWriter = new FileContentWriter(new File(baseOutput+ticket.getTargetFormat()));
		if(ticket.getTargetFormat().equals(TicketsManager.FORMAT_PDF)){
			contentWriter.setMimetype(MimetypeMap.MIMETYPE_PDF);
		} else if(ticket.getTargetFormat().equals(TicketsManager.FORMAT_TIF)){
			contentWriter.setMimetype(MimetypeMap.MIMETYPE_IMAGE_TIFF);
		}
		ContentTransformer transformer = serviceRegistry.getContentService().getTransformer(contentReader.getMimetype(), contentWriter.getMimetype());
		transformer.transform(contentReader, contentWriter);
		logger.debug("Successfully transformed source TIFF to PDF: "+contentWriter.getFile().getAbsolutePath());
		
	}

	/**
	 * transform an image to pdf with tesseract (with searchable text)
	 * @param inputFile
	 * @param ticket
	 */
	public static void tesseract(File inputFile, Ticket ticket){
		try {
			// get tesseract command
            String ocrCommand = ChocModel.BUNDLE_CAPTURING.getString(TESSERACT_COMMAND);
            // format command
			String inputFilePath = inputFile.getAbsolutePath();
			String output = ticket.getWorkPath() + TicketsManager.PAGE_NAME + ticket.getPages();
			String language = ticket.getOcrLanguage();

			ocrCommand = String.format(ocrCommand, inputFilePath, output, language);

			// execute tesseract
			Runtime.getRuntime().exec(ocrCommand).waitFor();

			File pdfFile = new File(output + TicketsManager.FORMAT_PDF);
			// if pdffile not exists, tesseract crashed. Then transform with alfresco
			if(!pdfFile.exists()){
				TransformationService.image2pdf(inputFile, ticket);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	// convert anything to pdf or pdfa
	public static InputStream toPdf(ContentReader reader, boolean pdfa) throws Exception {
		ContentService contentService = ChocModel.getServiceRegistry().getContentService();
		String mimenode = reader.getMimetype();
		if(mimenode.equals(MimetypeMap.MIMETYPE_PDF)){
			return reader.getContentInputStream();
		}
		String random = UUID.randomUUID().toString();
		if(mimenode.equals(MimetypeMap.MIMETYPE_IMAGE_GIF) || mimenode.equals(MimetypeMap.MIMETYPE_IMAGE_JPEG) || mimenode.equals(MimetypeMap.MIMETYPE_IMAGE_PNG)){
			// se il file è jpg, png, gif o bmp devo passare da tiff prima di convertire in pdf
			File outFile = new File(TempFileProvider.getTempDir()+"/"+random+"prev.tiff");
			ContentWriter writer = new FileContentWriter(outFile);
			writer.setMimetype(MimetypeMap.MIMETYPE_IMAGE_TIFF);
			contentService.transform(reader, writer);
			// adesso nella variabile reader inserisco il tiff
			reader = new FileContentReader(outFile);
			reader.setMimetype(MimetypeMap.MIMETYPE_IMAGE_TIFF);
		}
		// converto il reader in pdf
		File outFile = new File(TempFileProvider.getTempDir()+"/"+random+"prev.pdf");
		ContentWriter writer = new FileContentWriter(outFile);
		writer.setMimetype(MimetypeMap.MIMETYPE_PDF);
		contentService.transform(reader, writer);
		return new FileInputStream(outFile);
	}
	
	public static InputStream toPdf(ContentReader reader, NodeRef node) throws Exception {
		ContentService contentService = ChocModel.getServiceRegistry().getContentService();
		String mimenode = reader.getMimetype();
		if(mimenode.equals(MimetypeMap.MIMETYPE_PDF)){
			return reader.getContentInputStream();
		}
		String random = UUID.randomUUID().toString();
		if(mimenode.equals(MimetypeMap.MIMETYPE_IMAGE_GIF) || mimenode.equals(MimetypeMap.MIMETYPE_IMAGE_JPEG) || mimenode.equals(MimetypeMap.MIMETYPE_IMAGE_PNG)){
			// se il file è jpg, png, gif o bmp devo passare da tiff prima di convertire in pdf
			File outFile = new File(TempFileProvider.getTempDir()+"/"+random+"prev.tiff");
			ContentWriter writer = new FileContentWriter(outFile);
			writer.setMimetype(MimetypeMap.MIMETYPE_IMAGE_TIFF);
			contentService.transform(reader, writer);
			// adesso nella variabile reader inserisco il tiff
			reader = new FileContentReader(outFile);
			reader.setMimetype(MimetypeMap.MIMETYPE_IMAGE_TIFF);
		}
		// converto il reader in pdf
		File outFile = new File(TempFileProvider.getTempDir()+"/"+random+"prev.pdf");
		ContentWriter writer = new FileContentWriter(outFile);
		writer.setMimetype(MimetypeMap.MIMETYPE_PDF);
		if (node != null) {
			TransformationOptions options = new TransformationOptions();
			options.setSourceNodeRef(node); //WINDOWS SERVER PROBLEMS
			contentService.transform(reader, writer, options);
		}
		else {
			contentService.transform(reader, writer);
		}
		
		return new FileInputStream(outFile);
	}

	public static void image2pdfInternal(File inputFile, File outFile){
		try {
			Document pdfdoc = new Document(PageSize.A4);
			FileOutputStream os = new FileOutputStream(outFile);
			PdfWriter writer = PdfWriter.getInstance(pdfdoc, os);
			writer.setPdfVersion(PdfWriter.PDF_VERSION_1_4);
			writer.setPDFXConformance(PdfWriter.PDFA1B);
			pdfdoc.open();
			pdfdoc.newPage();
			Image image = Image.getInstance(inputFile.getAbsolutePath());
			image.setAbsolutePosition(0, 0);
			image.setBorderWidth(0);
			image.scaleAbsolute(PageSize.A4.getWidth(), PageSize.A4.getHeight());
			pdfdoc.add(image);
			os.flush();
			pdfdoc.close();
			os.close();
		} catch (Exception e){
			logger.error("Impossibile convertire immagine in pdf con itext: "+e.getMessage());
		}
	}

}
