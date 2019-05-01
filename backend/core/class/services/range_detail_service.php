<?php

namespace UTILE;

class RangeDetailService implements PreferenceEntityInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key,$rangeDetailBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [RANGE DETAIL] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$rangeDetail 			= \R::dispense('rangedetails');
			$rangeDetail->name 		= $rangeDetailBean->get_name() ;
			$rangeDetail->range_id 	= $rangeDetailBean->get_rangeId() ;
			$rangeDetail->rang  	= $rangeDetailBean->get_rang() ;
			$idRangeDetail 			= \R::store($rangeDetail);

			$return = array("success"=>'true',"msg"=> "Le détail de la gamme est ajouté avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [RANGE DETAIL] ------- ");
		return $return;	
	}

	public function updateEntityById ($key,$rangeDetailBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [RANGE DETAIL] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$rangeDetail 		= \R::load('rangedetails',$rangeDetailBean->get_id ());
			$rangeDetail->name 	= $rangeDetailBean->get_name() ;
			$rangeDetail->rang  = $rangeDetailBean->get_rang() ;
			$idrRngeDetail 		= \R::store($rangeDetail);

			$return 		= array("success"=>'true',"msg"=> "Le détail de la gamme est modifié avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateEntityById [RANGE DETAIL] ------- ");
		return $return;	
	}	

	public function getAllEntities ($key,$rangeId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [RANGE DETAIL] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$rangeDetails = \R::getAll ("select id,name,rang from rangedetails where range_id = :rangeId order by rang asc",
											array (
													":rangeId" 	=> $rangeId
												  )
										) ;
			
			$return = array(	"success" 	=> "true"													,
								"msg"	 	=> "Récupération liste de détails de la gamme avec succés."	,
								"range_details" 	=> $rangeDetails
							);
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [RANGE DETAIL] ------- ");
		return $return;	
	}

	public function getEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getEntityById [RANGE DETAIL] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$rangeDetail   = \R::getRow ("select * from rangedetails where id=:id",array (":id"=>$id)) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération de détail de la gamme avec succès."	,
								"range_detail" 	=> $rangeDetail
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getEntityById [RANGE DETAIL] ------- ");
		return $return;	
	}

	public function deleteEntityById ($key,$id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [RANGE DETAIL] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$rangeDetail   	= \R::load ("rangedetails", $id) ;
			\R::trash ($rangeDetail);			
			$return = array(	"success" 	=> "true"										,
								"msg"	 	=> "Suppression de détail de la gamme avec succès."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [RANGE DETAIL] ------- ");
		return $return;	
	}
}

?>