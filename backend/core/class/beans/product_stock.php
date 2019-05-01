<?php

namespace UTILE;

class ProductStock{
		
	private $_id				;
	private $_productId			;
	private $_rangeDetailId		;
	private $_value				;


	public function __construct(){
		$this->_categories = array ();
	}

	public function get_id(){
		return $this->_id;
	}

	public function set_id($_id){
		$this->_id = $_id;
	}

	public function get_productId(){
		return $this->_productId;
	}

	public function set_productId($_productId){
		$this->_productId = $_productId;
	}

	public function get_rangeDetailId(){
		return $this->_rangeDetailId;
	}

	public function set_rangeDetailId($_rangeDetailId){
		$this->_rangeDetailId = $_rangeDetailId;
	}

	public function get_value(){
		return $this->_value;
	}

	public function set_value($_value){
		$this->_value = $_value;
	}
}
?>
