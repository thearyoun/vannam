<?php

namespace UTILE;

class Client{
	
	private $_id					;
	private $_companyId				;
	private $_companyName			;
	private $_siret					;	    
	private $_tvaIntra				;	    
	private $_apeCode				;
	private $_capital				;
	private $_siteUrl				;
	private $_contactName			;
	private $_contactFirstName		;
	private $_contactTelLine		;
	private $_contactmobileLine		;
	private $_contactFax			;
	private $_contactEmail			;	
	private $_refererContactId		;
	private $_isAuthorizationAccess ;

	private $_addresses				;
	

	public function __construct(){
		$this->_addresses 			= new \UTILE\Address ();
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

	public function get_companyName(){
		return $this->_companyName;
	}

	public function set_companyName($_companyName){
		$this->_companyName = $_companyName;
	}

	public function get_siret(){
		return $this->_siret;
	}

	public function set_siret($_siret){
		$this->_siret = $_siret;
	}

	public function get_tvaIntra(){
		return $this->_tvaIntra;
	}

	public function set_tvaIntra($_tvaIntra){
		$this->_tvaIntra = $_tvaIntra;
	}

	public function get_apeCode(){
		return $this->_apeCode;
	}

	public function set_apeCode($_apeCode){
		$this->_apeCode = $_apeCode;
	}

	public function get_capital(){
		return $this->_capital;
	}

	public function set_capital($_capital){
		$this->_capital = $_capital;
	}

	public function get_siteUrl(){
		return $this->_siteUrl;
	}

	public function set_siteUrl($_siteUrl){
		$this->_siteUrl = $_siteUrl;
	}

	public function get_contactName(){
		return $this->_contactName;
	}

	public function set_contactName($_contactName){
		$this->_contactName = $_contactName;
	}

	public function get_contactFirstName(){
		return $this->_contactFirstName;
	}

	public function set_contactFirstName($_contactFirstName){
		$this->_contactFirstName = $_contactFirstName;
	}

	public function get_contactTelLine(){
		return $this->_contactTelLine;
	}

	public function set_contactTelLine($_contactTelLine){
		$this->_contactTelLine = $_contactTelLine;
	}

	public function get_contactMobileLine(){
		return $this->_contactMobileLine;
	}

	public function set_contactMobileLine($_contactMobileLine){
		$this->_contactMobileLine = $_contactMobileLine;
	}

	public function get_contactFax(){
		return $this->_contactFax;
	}

	public function set_contactFax($_contactFax){
		$this->_contactFax = $_contactFax;
	}

	public function get_contactEmail(){
		return $this->_contactEmail;
	}

	public function set_contactEmail($_contactEmail){
		$this->_contactEmail = $_contactEmail;
	}

	public function get_refererContactId(){
		return $this->_refererContactId;
	}

	public function set_refererContactId($_refererContactId){
		$this->_refererContactId = $_refererContactId;
	}

	public function get_isAuthorizationAccess(){
		return $this->_isAuthorizationAccess;
	}

	public function set_isAuthorizationAccess($_isAuthorizationAccess){
		$this->_isAuthorizationAccess = $_isAuthorizationAccess;
	}

	public function get_addresses(){
		return $this->_addresses;
	}

	public function set_addresses($_addresses){
		$this->_addresses = $_addresses;
	}
}
?>
