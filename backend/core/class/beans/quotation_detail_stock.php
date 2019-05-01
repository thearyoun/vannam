<?php

namespace UTILE;

class QuotationDetailStock extends ProductStock{
		
	private $_parentDetailId	;
	
	public function __construct(){

	}

	public function get_parentDetailId(){
		return $this->_parentDetailId;
	}

	public function set_parentDetailId($_parentDetailId){
		$this->_parentDetailId = $_parentDetailId;
	}
}
?>
