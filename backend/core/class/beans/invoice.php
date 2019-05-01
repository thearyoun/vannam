<?php

namespace UTILE;

class Invoice{
		
	private $_id						;
	private $_commandId					;
	private $_isVisible					;

	public function __construct(){

	}

	public function get_id(){
		return $this->_id;
	}

	public function set_id($_id){
		$this->_id = $_id;
	}

	public function get_commandId(){
		return $this->_commandId;
	}

	public function set_commandId($_commandId){
		$this->_commandId = $_commandId;
	}

	public function get_isVisible(){
		return $this->_isVisible;
	}

	public function set_isVisible($_isVisible){
		$this->_isVisible = $_isVisible;
	}
}
?>
