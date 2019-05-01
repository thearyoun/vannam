<?php

namespace UTILE;

class EntryEventDetail{
		
	private $_id						;
	private $_entryEventId				;
	private $_productId					;
	private $_purchasePrice				;
	private $_saleRatePrice 			;
	private $_vanamPrice	 			;

	private $_entryEventDetailStocks 	;
	private $_location					;

	public function __construct(){
		$this->_entryEventDetailStocks 	= array ();
		$this->_location				= new \UTILE\Location ();
	}

	public function get_id(){
		return $this->_id;
	}

	public function set_id($_id){
		$this->_id = $_id;
	}

	public function get_eventEntryId(){
		return $this->_entryEventId;
	}

	public function set_entryEventId($_entryEventId){
		$this->_entryEventId = $_entryEventId;
	}

	public function get_productId(){
		return $this->_productId;
	}

	public function set_productId($_productId){
		$this->_productId = $_productId;
	}

	public function get_purchasePrice(){
		return $this->_purchasePrice;
	}

	public function set_purchasePrice($_purchasePrice){
		$this->_purchasePrice = $_purchasePrice;
	}

	public function get_saleRatePrice(){
		return $this->_saleRatePrice;
	}

	public function set_saleRatePrice($_saleRatePrice){
		$this->_saleRatePrice = $_saleRatePrice;
	}

	public function get_vanamPrice(){
		return $this->_vanamPrice;
	}

	public function set_vanamPrice($_vanamPrice){
		$this->_vanamPrice = $_vanamPrice;
	}

	public function get_entryEventDetailStocks(){
		return $this->_entryEventDetailStocks;
	}

	public function set_entryEventDetailStocks($_entryEventDetailStocks){
		$this->_entryEventDetailStocks = $_entryEventDetailStocks;
	}

	public function get_location(){
		return $this->_location;
	}

	public function set_location($_location){
		$this->_location = $_location;
	}
}
?>
