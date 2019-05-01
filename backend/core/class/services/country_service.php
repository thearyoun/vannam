<?php

namespace UTILE;

class CountryService implements PreferenceEntityInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key, $countryBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [COUNTRY] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$country 				= \R::dispense('countries');
			$country->name 			= $countryBean->get_name() ;
			$country->company_id 	= $countryBean->get_companyId() ;
			$idCountry 				= \R::store($country);

			$return = array(	"success"	=> "true"							,
								"msg"		=> "Le pays est ajouté avec succés."
							);
		}
		else {
			$return = array(	"success"	=> "false"							,
								"msg"		=> "Le token n'est plus valide !"	,
								"err_code"	=> "100"
							);
		}
		
		$logger->debug("END addNewEntity [COUNTRY] ------- ");
		return $return;	
	}

	public function updateEntityById ($key, $countryBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [COUNTRY] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$country 			= \R::load('countries',$countryBean->get_id ());
			$country->name 		= $countryBean->get_name() ;
			$idCountry 			= \R::store($country);

			$return 			= array("success"=>'true',"msg"=> "Le pays est modifié avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateEntityById [COUNTRY] ------- ");
		return $return;	
	}	

	public function getAllEntities ($key, $companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [COUNTRY] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$countries = \R::getAll ("select id,name from countries where company_id = :company_id order by name asc",
											array (
													":company_id" 	=> $companyId
												  )
										) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération liste des pays avec succés."	,
								"countries" => $countries
							);
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [COUNTRY] ------- ");
		return $return;	
	}

	public function getEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getEntityById [COUNTRY] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$country   = \R::getRow ("select * from countries where id=:id",array (":id"=>$id)) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération de pays avec succès."	,
								"country" 	=> $country
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getEntityById [COUNTRY] ------- ");
		return $return;	
	}

	public function deleteEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [COUNTRY] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$country   	= \R::load ("countries", $id) ;
			\R::trash ($country);			
			$return = array(	"success" 	=> "true"										,
								"msg"	 	=> "Suppression de pays avec succès."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [COUNTRY] ------- ");
		return $return;	
	}
}

?>