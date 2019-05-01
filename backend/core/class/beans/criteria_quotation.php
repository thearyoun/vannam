<?php

namespace UTILE;

class CriteriaQuotation{
		
	private $_companyId		;
	private $_num 			;
	private $_creator		;
	private $_company		;


	public function __construct(){

	}

	public function get_companyId(){
		return $this->_companyId;
	}

	public function set_companyId($_companyId){
		$this->_companyId = $_companyId;
	}

	public function get_num(){
		return $this->_num;
	}

	public function set_num($_num){
		$this->_num = $_num;
	}

	public function get_creator(){
		return $this->_creator;
	}

	public function set_creator($_creator){
		$this->_creator = $_creator;
	}

	public function get_company(){
		return $this->_company;
	}

	public function set_company($_company){
		$this->_company = $_company;
	}
}
?>
