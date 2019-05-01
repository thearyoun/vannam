<?php

	$app->post('/address', function () use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /address ----------');
		try{
			$token 		= $app->request->headers->get('token');
			$addressBean 	= new \UTILE\Address () 				;
			$body 			= $app->request->getBody();
	        $dataBody 		= json_decode($body,true);

			$addressBean->set_clientId($dataBody['client_id'])	;
			$addressBean->set_name($dataBody['name'])	;
			$addressBean->set_address($dataBody['address'])	;
			$addressBean->set_postalCode($dataBody['postal_code'])	;
			$addressBean->set_city($dataBody['city'])	;
			$addressBean->set_country($dataBody['country'])	;
			$addressBean->set_comment(isset($dataBody['comment']) ? $dataBody['comment'] : "")	;
			$addressBean->set_isDeliveryAddress($dataBody['is_delivery_address'])	;
			$addressBean->set_isBillingAddress($dataBody['is_billing_address'])	;
				
			$addressService 	= new \UTILE\AddressService () ;
			$return 			= $addressService->addNewEntity ($token,$addressBean)	;	
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /address ----------');
	});

	$app->put('/address', function () use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /address ----------');
		try{
			$token 		= $app->request->headers->get('token');
			$addressBean 	= new \UTILE\Address () 				;
			$body 			= $app->request->getBody();
	        $dataBody 		= json_decode($body,true);

			$addressBean->set_id($dataBody['id'])	;
			$addressBean->set_clientId($dataBody['client_id'])	;
			$addressBean->set_name($dataBody['name'])	;
			$addressBean->set_address($dataBody['address'])	;
			$addressBean->set_postalCode($dataBody['postal_code'])	;
			$addressBean->set_city($dataBody['city'])	;
			$addressBean->set_country($dataBody['country'])	;
			$addressBean->set_comment(isset($dataBody['comment']) ? $dataBody['comment'] : "")	;
			$addressBean->set_isDeliveryAddress($dataBody['is_delivery_address'])	;
			$addressBean->set_isBillingAddress($dataBody['is_billing_address'])	;
				
			$addressService 	= new \UTILE\AddressService () ;
			$return 			= $addressService->updateEntityById ($token,$addressBean)	;	
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /address ----------');
	});

	$app->get('/address', function () use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /address ----------');
		try{
			
			$token 				= $app->request->headers->get('token');	
			$clientId 			= $app->request->params('client_id') ;
			$addressService 	= new \UTILE\AddressService () ;
			$return 			= $addressService->getAllEntities ($token,$clientId)	;	
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /address ----------');
	});

	$app->delete('/address', function () use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /address ----------');
		try{
			
			$token 				= $app->request->headers->get('token');	
			$body 				= $app->request->getBody();
	        $dataBody 			= json_decode($body,true);
			$addressId 			= $dataBody['address_id'] ;

			$addressService 	= new \UTILE\AddressService () ;
			$return 			= $addressService->deleteEntityById ($token,$addressId)	;	
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /address ----------');
	});
?>
