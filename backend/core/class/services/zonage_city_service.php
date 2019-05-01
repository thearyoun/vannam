<?php

namespace UTILE;

class ZonageCityService implements PreferenceEntityInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key, $zonageCityBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [ZONAGE] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$zonageCity 				= \R::dispense('zonagecities');
			$zonageCity->city 			= $zonageCityBean->get_city() ;
			$zonageCity->trigram 		= $zonageCityBean->get_trigram() ;
			$zonageCity->company_id 	= $zonageCityBean->get_companyId() ;
			$idZonageCity 				= \R::store($zonageCity);

			$return = array("success"=>'true',"msg"=> "La ville de zonage est ajoutée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [ZONAGE] ------- ");
		return $return;	
	}

	public function updateEntityById ($key, $zonageCityBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [ZONAGE] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$zonageCity 			= \R::load('zonagecities',$zonageCityBean->get_id ());
			$zonageCity->city 		= $zonageCityBean->get_city() ;
			$zonageCity->trigram 	= $zonageCityBean->get_trigram() ;
			$idZonageCity 			= \R::store($zonageCity);

			$return 		= array("success"=>'true',"msg"=> "La ville de zonage est modifiée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateEntityById [ZONAGE] ------- ");
		return $return;	
	}	

	public function getAllEntities ($key, $companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [ZONAGE] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$zonageCities = \R::getAll ("select * from zonagecities where company_id = :company_id order by id DESC",
											array (
													":company_id" 	=> $companyId
												  )
										) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération liste des villes de zonage avec succés."	,
								"zonage_cities" 	=> $zonageCities
							);
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [ZONAGE] ------- ");
		return $return;	
	}

	public function getEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getEntityById [ZONAGE] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$zonageCity   = \R::getRow ("select * from zonagecities where id=:id",array (":id"=>$id)) ;
			
			$return = array(	"success" 		=> "true"												,
								"msg"	 		=> "Récupération du zonage ville avec succès."	,
								"zonage_city" 	=> $zonageCity
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getEntityById [ZONAGE] ------- ");
		return $return;	
	}

	public function deleteEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [ZONAGE] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$zonageCity   	= \R::load ("zonagecities", $id) ;
			\R::trash ($zonageCity);			
			$return = array(	"success" 	=> "true"										,
								"msg"	 	=> "Suppression du zonage ville avec succès."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [ZONAGE] ------- ");
		return $return;	
	}
}

?>