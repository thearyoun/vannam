<?php

namespace UTILE;

class EntryEvent{
		
	private $_id				;
	private $_information		;
	private $_parcelNb 			;
	private $_changeId			;
	private $_insertDate		;
	private $_userId			;
	private $_companyId			;

	private $_entryEventDetails ;


	public function __construct(){
		$this->_entryEventDetails = array ();
	}

	public function get_id(){
		return $this->_id;
	}

	public function set_id($_id){
		$this->_id = $_id;
	}

	public function get_information(){
		return $this->_information;
	}

	public function set_information($_information){
		$this->_information = $_information;
	}

	public function get_parcelNb(){
		return $this->_parcelNb;
	}

	public function set_parcelNb($_parcelNb){
		$this->_parcelNb = $_parcelNb;
	}

	public function get_changeId(){
		return $this->_changeId;
	}

	public function set_changeId($_changeId){
		$this->_changeId = $_changeId;
	}

	public function get_insertDate(){
		return $this->_insertDate;
	}

	public function set_insertDate($_insertDate){
		$this->_insertDate = $_insertDate;
	}

	public function get_userId(){
		return $this->_userId;
	}

	public function set_userId($_userId){
		$this->_userId = $_userId;
	}

	public function get_companyId(){
		return $this->_companyId;
	}

	public function set_companyId($_companyId){
		$this->_companyId = $_companyId;
	}

	public function get_entryEventDetails(){
		return $this->_entryEventDetails;
	}

	public function set_entryEventDetails($_entryEventDetails){
		$this->_entryEventDetails = $_entryEventDetails;
	}
}
?>
