<?php

namespace UTILE;

class Address{
		
	private $_id						;
	private $_clientId					;
	private $_name						;
	private $_address					;	    
	private $_postalCode				;	    
	private $_city						;
	private $_country					;
	private $_comment					;
	private $_isDeliveryAddress			;
	private $_isBillingAddress			;	

	public function __construct(){

	}

	public function get_id(){
		return $this->_id;
	}

	public function set_id($_id){
		$this->_id = $_id;
	}

	public function get_clientId(){
		return $this->_clientId;
	}

	public function set_clientId($_clientId){
		$this->_clientId = $_clientId;
	}

	public function get_name(){
		return $this->_name;
	}

	public function set_name($_name){
		$this->_name = $_name;
	}

	public function get_address(){
		return $this->_address;
	}

	public function set_address($_address){
		$this->_address = $_address;
	}

	public function get_postalCode(){
		return $this->_postalCode;
	}

	public function set_postalCode($_postalCode){
		$this->_postalCode = $_postalCode;
	}

	public function get_city(){
		return $this->_city;
	}

	public function set_city($_city){
		$this->_city = $_city;
	}

	public function get_country(){
		return $this->_country;
	}

	public function set_country($_country){
		$this->_country = $_country;
	}

	public function get_comment(){
		return $this->_comment;
	}

	public function set_comment($_comment){
		$this->_comment = $_comment;
	}

	public function get_isDeliveryAddress(){
		return $this->_isDeliveryAddress;
	}

	public function set_isDeliveryAddress($_isDeliveryAddress){
		$this->_isDeliveryAddress = $_isDeliveryAddress;
	}

	public function get_isBillingAddress(){
		return $this->_isBillingAddress;
	}

	public function set_isBillingAddress($_isBillingAddress){
		$this->_isBillingAddress = $_isBillingAddress;
	}
}
?>
