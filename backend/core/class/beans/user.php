<?php

namespace UTILE;

class User{
	
	private $_id			;
	private $_name			;
	private $_firstName		;
	private $_mail			;	    
	private $_passwd		;	    
	private $_mobileLine	;
	private $_directLine	;
	private $_activate		;
	private $_picture		;
	private $_roleId		;
	private $_companyId		;

	public function __construct(){

	}

	public function get_id(){
		return $this->_id;
	}

	public function set_id($_id){
		$this->_id = $_id;
	}

	public function get_name(){
		return $this->_name;
	}

	public function set_name($_name){
		$this->_name = $_name;
	}

	public function get_firstName(){
		return $this->_firstName;
	}

	public function set_firstName($_firstName){
		$this->_firstName = $_firstName;
	}

	public function get_mail(){
		return $this->_mail;
	}

	public function set_mail($_mail){
		$this->_mail = $_mail;
	}

	public function get_passwd(){
		return $this->_passwd;
	}

	public function set_passwd($_passwd){
		$this->_passwd = $_passwd;
	}

	public function get_mobileLine(){
		return $this->_mobileLine;
	}

	public function set_mobileLine($_mobileLine){
		$this->_mobileLine = $_mobileLine;
	}

	public function get_directLine(){
		return $this->_directLine;
	}

	public function set_directLine($_directLine){
		$this->_directLine = $_directLine;
	}

	public function get_activate(){
		return $this->_activate;
	}

	public function set_activate($_activate){
		$this->_activate = $_activate;
	}

	public function get_picture(){
		return $this->_picture;
	}

	public function set_picture($_picture){
		$this->_picture = $_picture;
	}

	public function get_roleId(){
		return $this->_roleId;
	}

	public function set_roleId($_roleId){
		$this->_roleId = $_roleId;
	}

	public function get_companyId(){
		return $this->_companyId;
	}

	public function set_companyId($_companyId){
		$this->_companyId = $_companyId;
	}
}
?>
