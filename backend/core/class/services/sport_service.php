<?php

namespace UTILE;

class SportService implements PreferenceEntityInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key,$sportBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [SPORT] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$sport 				= \R::dispense('sports');
			$sport->name 		= $sportBean->get_name() ;
			$sport->company_id 	= $sportBean->get_companyId() ;
			$idSport 			= \R::store($sport);

			$return = array("success"=>'true',"msg"=> "Le sport est ajouté avec succés.", "sport" => $sport);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [SPORT] ------- ");
		return $return;	
	}

	public function updateEntityById ($key,$sportBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [SPORT] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$sport 			= \R::load('sports',$sportBean->get_id ());
			$sport->name 	= $sportBean->get_name() ;
			$idSport 		= \R::store($sport);

			$return 		= array("success"=>'true',"msg"=> "Le sport est modifié avec succés.", "sport" => $sport);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateEntityById [SPORT] ------- ");
		return $return;	
	}	

	public function getAllEntities ($key,$companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [SPORT] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$sports = \R::getAll ("select id,name from sports where company_id = :company_id order by name ASC",
											array (
													":company_id" 	=> $companyId
												  )
										) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération liste des sports avec succés."	,
								"sports" 	=> $sports
							);
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [SPORT] ------- ");
		return $return;	
	}

	public function getEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getEntityById [SPORT] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$sport   = \R::getRow ("select * from sports where id=:id",array (":id"=>$id)) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération de sport avec succès."	,
								"sport" 	=> $sport
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getEntityById [SPORT] ------- ");
		return $return;	
	}

	public function deleteEntityById ($key,$id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [SPORT] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$sport   	= \R::load ("sports", $id) ;
			\R::trash ($sport);			
			$return = array(	"success" 	=> "true"										,
								"msg"	 	=> "Suppression du sport avec succès."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [SPORT] ------- ");
		return $return;	
	}
}

?>