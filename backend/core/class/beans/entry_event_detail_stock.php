<?php

namespace UTILE;

class EntryEventDetailStock extends ProductStock{
		
	private $_entryEventDetailId	;
	
	public function __construct(){

	}

	public function get_entryEventDetailId(){
		return $this->_entryEventDetailId;
	}

	public function set_entryEventDetailId($_entryEventDetailId){
		$this->_entryEventDetailId = $_entryEventDetailId;
	}
}
?>
