<?php

namespace UTILE;

class GenderService implements PreferenceEntityInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key, $genderBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [GENDER] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$gender 				= \R::dispense('genders');
			$gender->name 			= $genderBean->get_name() ;
			$gender->company_id 	= $genderBean->get_companyId() ;
			$idGender 				= \R::store($gender);

			$return = array("success"=>'true',"msg"=> "Le genre est ajouté avec succés.", "gender" => $gender);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [GENDER] ------- ");
		return $return;	
	}

	public function updateEntityById ($key, $genderBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [GENDER] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$gender 		= \R::load('genders',$genderBean->get_id ());
			$gender->name 	= $genderBean->get_name() ;
			$idGender 		= \R::store($gender);

			$return 		= array("success"=>'true',"msg"=> "Le genre est modifié avec succés.",  "gender" => $gender);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateEntityById [GENDER] ------- ");
		return $return;	
	}	

	public function getAllEntities ($key, $companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [GENDER] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$genders = \R::getAll ("select id,name from genders where company_id = :company_id order by id desc",
											array (
													":company_id" 	=> $companyId
												  )
										) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération liste des genres avec succés."	,
								"genders" 	=> $genders
							);
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [GENDER] ------- ");
		return $return;	
	}

	public function getEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getEntityById [GENDER] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$gender   = \R::getRow ("select * from genders where id=:id",array (":id"=>$id)) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération du genre avec succès."	,
								"gender" 	=> $gender
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getEntityById [GENDER] ------- ");
		return $return;	
	}

	public function deleteEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [GENDER] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$gender   	= \R::load ("genders", $id) ;
			\R::trash ($gender);			
			$return = array(	"success" 	=> "true"										,
								"msg"	 	=> "Suppression du genre avec succès."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [GENDER] ------- ");
		return $return;	
	}
}

?>