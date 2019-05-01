<?php

namespace UTILE;

class ZonageCity{
		
	private $_id		;
	private $_city		;
	private $_trigram	;
	private $_companyId	;

	public function __construct(){

	}

	public function get_id(){
		return $this->_id;
	}

	public function set_id($_id){
		$this->_id = $_id;
	}

	public function get_city(){
		return $this->_city;
	}

	public function set_city($_city){
		$this->_city = $_city;
	}

	public function get_trigram(){
		return $this->_trigram;
	}

	public function set_trigram($_trigram){
		$this->_trigram = $_trigram;
	}

	public function get_companyId(){
		return $this->_companyId;
	}

	public function set_companyId($_companyId){
		$this->_companyId = $_companyId;
	}
}
?>
