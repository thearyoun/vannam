<?php

namespace UTILE;

class AddressService implements PreferenceEntityInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key, $addressBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [ADDRESS] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$isOkAsFirstAdress = true ;
			// IF FIRST ADDRESS
			$allAddresses = \R::getAll ("select * from clientaddresses where client_id=:id",
										array(":id"=>$addressBean->get_clientId())
										);
			if (empty($allAddresses)) {
				if ($addressBean->get_isDeliveryAddress() == 0 || $addressBean->get_isBillingAddress() == 0) {
					$isOkAsFirstAdress = false ;
					$return = array(	"success"	=>'false'								,
										"msg"		=> "L'adresse est unique, elle doit être l'adresse de facturation et de livraison."	
							);
				}
			}
			//

			if ($isOkAsFirstAdress) {
				$address = \R::dispense('clientaddresses');
				$address->client_id 					= $addressBean->get_clientId() ;
				$address->name 							= $addressBean->get_name() ;
				$address->address 						= $addressBean->get_address() ;
				$address->postal_code					= $addressBean->get_postalcode() ;
				$address->city 							= $addressBean->get_city() ;
				$address->country 						= $addressBean->get_country() ;
				$address->comment 						= $addressBean->get_comment() ;
				$address->is_delivery_address 			= $addressBean->get_isDeliveryAddress() ;
				$address->is_billing_address 			= $addressBean->get_isBillingAddress() ;
				
				$idAddress	= \R::store($address);
	
				$return = array(	"success"	=>'true'								,
									"msg"		=> "L'adresse client est ajoutée avec succés."	
								);
			}
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [ADDRESS] ------- ");
		return $return;	
	}

	public function updateEntityById ($key, $addressBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [ADDRESS] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$address = \R::load('clientaddresses',$addressBean->get_id());
			$address->client_id 					= $addressBean->get_clientId() ;
			$address->name 							= $addressBean->get_name() ;
			$address->address 						= $addressBean->get_address() ;
			$address->postal_code					= $addressBean->get_postalcode() ;
			$address->city 							= $addressBean->get_city() ;
			$address->country 						= $addressBean->get_country() ;
			$address->comment 						= $addressBean->get_comment() ;
			$address->is_delivery_address 			= $addressBean->get_isDeliveryAddress() ;
			$address->is_billing_address 			= $addressBean->get_isBillingAddress() ;
			
			$idAddress	= \R::store($address);

			$return = array(	"success"	=>'true'								,
								"msg"		=> "L'adresse client est modifiée avec succés."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateEntityById [ADDRESS] ------- ");
		return $return;	
	}

	public function getAllEntities ($key, $clientId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [ADDRESS] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$addresses = \R::getAll ("select * from clientaddresses where client_id=:id",array (":id"=>$clientId)); 
			$return = array(	"success"		=>'true'													,
								"msg"			=> "La liste des adresses client est ajoutée avec succés."	,
								"addresses"   	=> $addresses
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [ADDRESS] ------- ");
		return $return;	
	}

	public function getEntityById ($key, $id) {

	}

	public function deleteEntityById ($key, $addressId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [ADDRESS] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$address = \R::load("clientaddresses" , $addressId);
			\R::trash($address);
			$return = array(	"success"	=>'true'													,
								"msg"		=> "L'adresse client est supprimée avec succés."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [ADDRESS] ------- ");
		return $return;	
	}


}

?>