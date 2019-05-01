<?php

namespace UTILE;

class CriteriaInvoice extends CriteriaQuotation{
		
	private $_client		;
	private $_startDate		;
	private $_endDate		;


	public function __construct(){

	}

	public function get_client(){
		return $this->_client;
	}

	public function set_client($_client){
		$this->_client = $_client;
	}

	public function get_startDate(){
		return $this->_startDate;
	}

	public function set_startDate($_startDate){
		$this->_startDate = $_startDate;
	}

	public function get_endDate(){
		return $this->_endDate;
	}

	public function set_endDate($_endDate){
		$this->_endDate = $_endDate;
	}
}
?>
