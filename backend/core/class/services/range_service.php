<?php

namespace UTILE;

class RangeService implements PreferenceEntityInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key,$rangeBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [RANGE] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$range 				= \R::dispense('ranges');
			$range->name 		= $rangeBean->get_name() ;
			$range->company_id 	= $rangeBean->get_companyId() ;
			$idRange 			= \R::store($range);

			$return = array("success"=>'true',"msg"=> "La gamme est ajoutée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [RANGE] ------- ");
		return $return;	
	}

	public function updateEntityById ($key,$rangeBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [RANGE] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$range 			= \R::load('ranges',$rangeBean->get_id ());
			$range->name 	= $rangeBean->get_name() ;
			$idRange 		= \R::store($range);

			$return 		= array("success"=>'true',"msg"=> "La gamme est modifiée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateEntityById [RANGE] ------- ");
		return $return;	
	}	

	public function getAllEntities ($key,$companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [RANGE] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$ranges = \R::getAll ("select id,name from ranges where company_id = :company_id order by id desc",
											array (
													":company_id" 	=> $companyId
												  )
										) ;
			$rangeDetailService 	= new \UTILE\RangeDetailService () ;
			foreach ($ranges as &$range) {
				$data = $rangeDetailService->getAllEntities ($key,$range['id'])	;
				$range['ranges'] = $data['range_details'] ;
			}
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération liste des gammes avec succés."	,
								"ranges" 	=> $ranges
							);
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [RANGE] ------- ");
		return $return;	
	}

	public function getEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getEntityById [RANGE] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$range   = \R::getRow ("select * from ranges where id=:id",array (":id"=>$id)) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération de la gamme avec succès."	,
								"range" 	=> $range
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getEntityById [RANGE] ------- ");
		return $return;	
	}

	public function deleteEntityById ($key,$id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [RANGE] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$range   	= \R::load ("ranges", $id) ;
			\R::trash ($range);			
			$return = array(	"success" 	=> "true"										,
								"msg"	 	=> "Suppression de la gamme avec succès."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [RANGE] ------- ");
		return $return;	
	}
}

?>