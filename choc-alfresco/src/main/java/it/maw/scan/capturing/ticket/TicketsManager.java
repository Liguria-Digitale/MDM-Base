package it.maw.scan.capturing.ticket;

import java.util.HashMap;
import java.util.Map;

/**
 * @author Federico Tarantino
 */
public class TicketsManager {
	
	public static final String PAGE_NAME = "page";
	
	public static final String FORMAT_PDF = ".pdf";
	public static final String FORMAT_JPG = ".jpg";
	public static final String FORMAT_JPEG = ".jpeg";
	public static final String FORMAT_PNG = ".png";
	public static final String FORMAT_TIF = ".tif";
	public static final String FORMAT_TIFF = ".tiff";
	public static final String FORMAT_HTML = ".html";
	
	public static Map<String, Ticket> tickets = new HashMap<String, Ticket>();
	
	private TicketsManager(){}
	
	/**
	 * create a ticket
	 * @return ticket
	 */
	public static Ticket create(){
		Ticket ticket = new Ticket();
		tickets.put(ticket.getId(), ticket);
		return ticket;
	}
	
	/**
	 * get an existing ticket from id
	 * @param ticketId
	 * @return ticket
	 */
	public static Ticket get(String ticketId){
		return tickets.get(ticketId);
	}
	
	/**
	 * remove a ticket from id
	 * @param ticketId
	 */
	public static void invalidate(String ticketId){
		tickets.remove(ticketId);
	}
}
