<?php

namespace UTILE;

class RangeDetail extends PrefObject{
	
	private $_rangeId 	;
	private $_rang 		;

	public function __construct(){

	}

	public function get_rangeId(){
		return $this->_rangeId;
	}

	public function set_rangeId($_rangeId){
		$this->_rangeId = $_rangeId;
	}

	public function get_rang(){
		return $this->_rang;
	}

	public function set_rang($_rang){
		$this->_rang = $_rang;
	}
}
?>
