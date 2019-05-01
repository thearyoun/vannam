<?php

namespace UTILE;

class ChangeService implements PreferenceEntityInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key, $changeBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [CHANGE] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$change 				= \R::dispense('changes');
			$change->name 			= $changeBean->get_name() ;
			$change->company_id 	= $changeBean->get_companyId() ;
			$idChange 				= \R::store($change);

			$return = array("success"=>'true',"msg"=> "La devise est ajoutée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [CHANGE] ------- ");
		return $return;	
	}

	public function updateEntityById ($key, $changeBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [CHANGE] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$change 		= \R::load('changes',$changeBean->get_id ());
			$change->name 	= $changeBean->get_name() ;
			$idChange 		= \R::store($change);

			$return 		= array("success"=>'true',"msg"=> "La devise est modifiée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateEntityById [CHANGE] ------- ");
		return $return;	
	}	

	public function getAllEntities ($key, $companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [CHANGE] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$changes = \R::getAll ("select *
									from changes where company_id = :company_id order by name ASC",
											array (
													":company_id" 	=> $companyId
												  )
										) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération liste des devises avec succés."	,
								"changes" 	=> $changes
							);
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [CHANGE] ------- ");
		return $return;	
	}

	public function getEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getEntityById [CHANGE] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$change   = \R::getRow ("select * from changes where id=:id",array (":id"=>$id)) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération de la devise avec succès."	,
								"change" 	=> $change
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getEntityById [CHANGE] ------- ");
		return $return;	
	}

	public function deleteEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [CHANGE] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$change   	= \R::load ("changes", $id) ;
			\R::trash ($change);			
			$return = array(	"success" 	=> "true"										,
								"msg"	 	=> "Suppression de la devise avec succès."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [CHANGE] ------- ");
		return $return;	
	}
}

?>