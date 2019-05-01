<?php

namespace UTILE;

class Authorization{
		
	private $_id						;
	private $_userId					;
	private $_companyId					;
	private $_roleId					;	    
	private $_clientId					;	   

	private $_brands				;
	private $_categories			; 
		

	public function __construct(){
		$this->_brands	 			= new \UTILE\Brand ();
		$this->_categories 			= new \UTILE\Category ();
	}

	public function get_id(){
		return $this->_id;
	}

	public function set_id($_id){
		$this->_id = $_id;
	}

	public function get_userId(){
		return $this->_userId;
	}

	public function set_userId($_userId){
		$this->_userId = $_userId;
	}

	public function get_companyId	(){
		return $this->_companyId	;
	}

	public function set_companyId($_companyId){
		$this->_companyId= $_companyId;
	}

	public function get_roleId(){
		return $this->_roleId;
	}

	public function set_roleId($_roleId){
		$this->_roleId = $_roleId;
	}

	public function get_clientId(){
		return $this->_clientId;
	}

	public function set_clientId($_clientId){
		$this->_clientId = $_clientId;
	}

	public function get_brands(){
		return $this->_brands;
	}

	public function set_brands($_brands){
		$this->_brands = $_brands;
	}
	public function get_categories(){
		return $this->_categories;
	}

	public function set_categories($_categories){
		$this->_categories = $_categories;
	}
}
?>
