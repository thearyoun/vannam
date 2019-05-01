<?php

namespace UTILE;

class Product{
	
	private $_id 				;
	private $_companyId 		;
	private $_reference 		;
	private $_description 		;
	private $_categoryId 		;	
	private $_brandId 			;	
	private $_rangeId 			;
	private $_genderId 			;
	private $_sportId 			;
	private $_color 			;
	private $_purchasePriceMin 	;
	private $_purchasePriceMax 	;	
	private $_salePublicPrice 	;		
	private $_saleVanamPrice 	;
	private $_saleRatePublic 	;

	private $_locationProduct	;

	public function __construct(){
		$this->_locationProduct = new \UTILE\Location ();
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

	public function get_reference(){
		return $this->_reference;
	}

	public function set_reference($_reference){
		$this->_reference = $_reference;
	}

	public function get_description(){
		return $this->_description;
	}

	public function set_description($_description){
		$this->_description = $_description;
	}

	public function get_categoryId(){
		return $this->_categoryId;
	}

	public function set_categoryId($_categoryId){
		$this->_categoryId = $_categoryId;
	}

	public function get_brandId(){
		return $this->_brandId;
	}

	public function set_brandId($_brandId){
		$this->_brandId = $_brandId;
	}

	public function get_rangeId(){
		return $this->_rangeId;
	}

	public function set_rangeId($_rangeId){
		$this->_rangeId = $_rangeId;
	}

	public function get_genderId(){
		return $this->_genderId;
	}

	public function set_genderId($_genderId){
		$this->_genderId = $_genderId;
	}

	public function get_sportId(){
		return $this->_sportId;
	}

	public function set_sportId($_sportId){
		$this->_sportId = $_sportId;
	}

	public function get_color(){
		return $this->_color;
	}

	public function set_color($_color){
		$this->_color = $_color;
	}

	public function get_purchasePriceMin(){
		return $this->_purchasePriceMin;
	}

	public function set_purchasePriceMin($_purchasePriceMin){
		$this->_purchasePriceMin = $_purchasePriceMin;
	}

	public function get_purchasePriceMax(){
		return $this->_purchasePriceMax;
	}

	public function set_purchasePriceMax($_purchasePriceMax){
		$this->_purchasePriceMax = $_purchasePriceMax;
	}

	public function get_salePublicPrice(){
		return $this->_salePublicPrice;
	}

	public function set_salePublicPrice($_salePublicPrice){
		$this->_salePublicPrice = $_salePublicPrice;
	}

	public function get_saleVanamPrice(){
		return $this->_saleVanamPrice;
	}

	public function set_saleVanamPrice($_saleVanamPrice){
		$this->_saleVanamPrice = $_saleVanamPrice;
	}

	public function get_saleRatePublic(){
		return $this->_saleRatePublic;
	}

	public function set_saleRatePublic($_saleRatePublic){
		$this->_saleRatePublic = $_saleRatePublic;
	}

	public function get_locationProduct(){
		return $this->_locationProduct;
	}

	public function set_locationProduct($_locationProduct){
		$this->_locationProduct = $_locationProduct;
	}

}
?>