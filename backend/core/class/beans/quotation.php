<?php

namespace UTILE;

class Quotation{
	
	private $_id			;
	private $_companyId		;
	private $_clientId		;
	private $_userId		;
	private $_changeId		;
	private $_comment		;

	private $_details ;

	public function __construct(){
		$this->_details = array ();
	}

	public function get_id(){
		return $this->_id;
	}

	public function set_id($_id){
		$this->_id = $_id;
	}

	public function get_companyId(){
		return $this->_companyId;
	}

	public function set_companyId($_companyId){
		$this->_companyId = $_companyId;
	}

	public function get_clientId(){
		return $this->_clientId;
	}

	public function set_clientId($_clientId){
		$this->_clientId = $_clientId;
	}

	public function get_userId(){
		return $this->_userId;
	}

	public function set_userId($_userId){
		$this->_userId = $_userId;
	}

	public function get_changeId(){
		return $this->_changeId;
	}

	public function set_changeId($_changeId){
		$this->_changeId = $_changeId;
	}

	public function get_comment(){
		return $this->_comment;
	}

	public function set_comment($_comment){
		$this->_comment = $_comment;
	}

	public function get_details(){
		return $this->_details;
	}

	public function set_details($_details){
		$this->_details = $_details;
	}
}
?>
