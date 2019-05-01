<?php

namespace UTILE;

class Location{
		
	private $_id			;
	private $_productId		;
	private $_zonageCityId	;
	private $_aisle			;	    
	private $_palette		;	
	private $_userId		;    

	public function __construct(){

	}

	public function get_id(){
		return $this->_id;
	}

	public function set_id($_id){
		$this->_id = $_id;
	}

	public function get_productId(){
		return $this->_productId;
	}

	public function set_productId($_productId){
		$this->_productId = $_productId;
	}

	public function get_zonageCityId(){
		return $this->_zonageCityId;
	}

	public function set_zonageCityId($_zonageCityId){
		$this->_zonageCityId = $_zonageCityId;
	}

	public function get_aisle(){
		return $this->_aisle;
	}

	public function set_aisle($_aisle){
		$this->_aisle = $_aisle;
	}

	public function get_palette(){
		return $this->_palette;
	}

	public function set_palette($_palette){
		$this->_palette = $_palette;
	}

	public function get_userId(){
		return $this->_userId;
	}

	public function set_userId($_userId){
		$this->_userId = $_userId;
	}
}
?>
