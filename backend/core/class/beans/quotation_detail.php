<?php

namespace UTILE;

class QuotationDetail{
		
	private $_id					;
	private $_parentId				;
	private $_productId				;
	private $_salePrice				;

	private $_detailStocks 	;

	public function __construct(){
		$this->_detailStocks 	= array ();
	}

	public function get_id(){
		return $this->_id;
	}

	public function set_id($_id){
		$this->_id = $_id;
	}

	public function get_parentId(){
		return $this->_parentId;
	}

	public function set_parentId($_parentId){
		$this->_parentId = $_parentId;
	}

	public function get_productId(){
		return $this->_productId;
	}

	public function set_productId($_productId){
		$this->_productId = $_productId;
	}

	public function get_salePrice(){
		return $this->_salePrice;
	}

	public function set_salePrice($_salePrice){
		$this->_salePrice = $_salePrice;
	}

	public function get_detailStocks(){
		return $this->_detailStocks;
	}

	public function set_detailStocks($_detailStocks){
		$this->_detailStocks = $_detailStocks;
	}
}
?>
