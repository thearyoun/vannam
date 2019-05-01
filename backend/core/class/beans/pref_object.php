<?php

namespace UTILE;

class PrefObject {
	
	private $_id			;
	private $_name			;	
	private $_companyId		;	

	public function __construct(){

	}

	public function get_id(){
		return $this->_id;
	}

	public function set_id($_id){
		$this->_id = $_id;
	}

	public function get_name(){
		return $this->_name;
	}

	public function set_name($_name){
		$this->_name = $_name;
	}

	public function get_companyId(){
		return $this->_companyId;
	}

	public function set_companyId($_companyId){
		$this->_companyId = $_companyId;
	}
}
?>
