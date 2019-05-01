<?php

namespace UTILE;

class Command extends Quotation{
	
	private $_quotationParentId ;
	private $_status			;
	private $_transportAmount	;
	private $_tvaExoneration	;
	private $_isInvoicePDF		;
	private $_isInvoiceEXCEL	;

	public function __construct(){
		parent::__construct();
	}

	public function get_quotationParentId(){
		return $this->_quotationParentId;
	}

	public function set_quotationParentId($_quotationParentId){
		$this->_quotationParentId = $_quotationParentId;
	}

	public function get_status(){
		return $this->_status;
	}

	public function set_status($_status){
		$this->_status = $_status;
	}

	public function get_transportAmount(){
		return $this->_transportAmount;
	}

	public function set_transportAmount($_transportAmount){
		$this->_transportAmount = $_transportAmount;
	}

	public function get_tvaExoneration(){
		return $this->_tvaExoneration;
	}

	public function set_tvaExoneration($_tvaExoneration){
		$this->_tvaExoneration = $_tvaExoneration;
	}

	public function get_isInvoicePDF(){
		return $this->_isInvoicePDF;
	}

	public function set_isInvoicePDF($_isInvoicePDF){
		$this->_isInvoicePDF = $_isInvoicePDF;
	}

	public function get_isInvoiceEXCEL(){
		return $this->_isInvoiceEXCEL;
	}

	public function set_isInvoiceEXCEL($_isInvoiceEXCEL){
		$this->_isInvoiceEXCEL = $_isInvoiceEXCEL;
	}
}
?>
