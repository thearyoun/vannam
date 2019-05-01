<?php

namespace UTILE;

class Brand extends PrefObject{
	
	private $_marge ;

	public function __construct(){

	}

	public function get_marge(){
		return $this->_marge;
	}

	public function set_marge($_marge){
		$this->_marge = $_marge;
	}


}
?>
