<?php

namespace UTILE;

class CriteriaProduct{
			
	private $_companyId					;
	private $_refDescValue				;
	private $_categories				;
	private $_brands					;
	private $_sports					;
	private $_genders					;
	private $_color						;
	private $_entryEventInformation		;
	private $_entryEventDate			;
	private $_entryEventAfterBefore		;
	private $_aisle						;
	private $_palette					;
	private $_qtrExhausted				;
	private $_qteMin					;
	private $_qteMax					;
	private $_isNoPictures				;
	private $_idDevis 					;
	private $_idCommand 				;
	private $_lissage 					;

	private $_renderingType				;
	private $_isImages					;
	private $_isPAchat					;
	private $_isPTarif					;
	private $_isPPublic					;
	private $_isPVanam					;
	private $_isZonage					;
	private $_isByZone					;
	private $_isTransport 				;
	private $_formatStock				;
	private $_header					;
	private $_withStock					;


	public function __construct(){
		$this->_categories = array ();
		$this->_isImages   = 1;
	}

	public function get_companyId(){
		return $this->_companyId;
	}

	public function set_companyId($_companyId){
		$this->_companyId = $_companyId;
	}

	public function get_refDescValue(){
		return $this->_refDescValue;
	}

	public function set_refDescValue($_refDescValue){
		$this->_refDescValue = $_refDescValue;
	}

	public function get_categories(){
		return $this->_categories;
	}

	public function set_categories($_categories){
		$this->_categories = $_categories;
	}

	public function get_brands(){
		return $this->_brands;
	}

	public function set_brands($_brands){
		$this->_brands = $_brands;
	}

	public function get_sports(){
		return $this->_sports;
	}

	public function set_sports($_sports){
		$this->_sports = $_sports;
	}

	public function get_genders(){
		return $this->_genders;
	}

	public function set_genders($_genders){
		$this->_genders = $_genders;
	}

	public function get_color(){
		return $this->_color;
	}

	public function set_color($_color){
		$this->_color = $_color;
	}

	public function get_entryEventInformation(){
		return $this->_entryEventInformation;
	}

	public function set_entryEventInformation($_entryEventInformation){
		$this->_entryEventInformation = $_entryEventInformation;
	}

	public function get_entryEventDate(){
		return $this->_entryEventDate;
	}

	public function set_entryEventDate($_entryEventDate){
		$this->_entryEventDate = $_entryEventDate;
	}

	public function get_entryEventAfterBefore(){
		return $this->_entryEventAfterBefore;
	}

	public function set_entryEventAfterBefore($_entryEventAfterBefore){
		$this->_entryEventAfterBefore = $_entryEventAfterBefore;
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

	public function get_qtrExhausted(){
		return $this->_qtrExhausted;
	}

	public function set_qtrExhausted($_qtrExhausted){
		$this->_qtrExhausted = $_qtrExhausted;
	}

	public function get_qteMin(){
		return $this->_qteMin;
	}

	public function set_qteMin($_qteMin){
		$this->_qteMin = $_qteMin;
	}

	public function get_qteMax(){
		return $this->_qteMax;
	}

	public function set_qteMax($_qteMax){
		$this->_qteMax = $_qteMax;
	}

	public function get_isNoPictures(){
		return $this->_isNoPictures;
	}

	public function set_isNoPictures($_isNoPictures){
		$this->_isNoPictures = $_isNoPictures;
	}

	public function get_idDevis(){
		return $this->_idDevis;
	}

	public function set_idDevis($_idDevis){
		$this->_idDevis = $_idDevis;
	}

	public function get_idCommand(){
		return $this->_idCommand;
	}

	public function set_idCommand($_idCommand){
		$this->_idCommand = $_idCommand;
	}

	public function get_lissage(){
		return $this->_lissage;
	}

	public function set_lissage($_lissage){
		$this->_lissage = $_lissage;
	}
	
	public function get_renderingType(){
		return $this->_renderingType;
	}

	public function set_renderingType($_renderingType){
		$this->_renderingType = $_renderingType;
	}

	public function get_isImages(){
		return $this->_isImages;
	}

	public function set_isImages($_isImages){
		$this->_isImages = $_isImages;
	}

	public function get_isPAchat(){
		return $this->_isPAchat;
	}

	public function set_isPAchat($_isPAchat){
		$this->_isPAchat = $_isPAchat;
	}

	public function get_isPTarif(){
		return $this->_isPTarif;
	}

	public function set_isPTarif($_isPTarif){
		$this->_isPTarif = $_isPTarif;
	}

	public function get_isPPublic(){
		return $this->_isPPublic;
	}

	public function set_isPPublic($_isPPublic){
		$this->_isPPublic = $_isPPublic;
	}

	public function get_isPVanam(){
		return $this->_isPVanam;
	}

	public function set_isPVanam($_isPVanam){
		$this->_isPVanam = $_isPVanam;
	}

	public function get_isZonage(){
		return $this->_isZonage;
	}

	public function set_isZonage($_isZonage){
		$this->_isZonage = $_isZonage;
	}

	public function get_isByZone(){
		return $this->_isByZone;
	}

	public function set_isByZone($_isByZone){
		$this->_isByZone = $_isByZone;
	}

	public function get_isTransport(){
		return $this->_isTransport;
	}

	public function set_isTransport($_isTransport){
		$this->_isTransport = $_isTransport;
	}

	public function get_formatStock(){
		return $this->_formatStock;
	}

	public function set_formatStock($_formatStock){
		$this->_formatStock = $_formatStock;
	}

	public function get_header(){
		return $this->_header;
	}

	public function set_header($_header){
		$this->_header = $_header;
	}

	public function get_withStock(){
		return $this->_withStock;
	}

	public function set_withStock($_withStock){
		$this->_withStock = $_withStock;
	}

}
?>
