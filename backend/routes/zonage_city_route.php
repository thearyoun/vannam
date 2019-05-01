<?php

	$app->group('/zonage', function () use ($app) {

		$app->post('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /zonage ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $zonageCity	= new \UTILE\ZonageCity ();
			    $zonageCity->set_city($dataBody['city']);
			    $zonageCity->set_trigram($dataBody['trigram']);
			    $zonageCity->set_companyId($dataBody['company_id']);

				$zonageCityService 	= new \UTILE\ZonageCityService () ;
				$return 			= $zonageCityService->addNewEntity ($token,$zonageCity)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /zonage ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->put('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /zonage ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $zonageCity		= new \UTILE\ZonageCity ();
			    $zonageCity->set_id($dataBody['zonage_city_id']);
			    $zonageCity->set_city($dataBody['city']);
			    $zonageCity->set_trigram($dataBody['trigram']);

				$zonageCityService 	= new \UTILE\ZonageCityService () ;
				$return 			= $zonageCityService->updateEntityById ($token,$zonageCity)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /zonage ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /zonage ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');
				$companyId 		= $app->request->params('company_id');

				$zonageCityService 	= new \UTILE\ZonageCityService () ;
				$return 			= $zonageCityService->getAllEntities ($token,$companyId)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /zonage ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/:id', function ($id) use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /zonage/:id ----------');
			$return = array () ;
			try{
				$token 				= $app->request->headers->get('token');

				$zonageCityService 	= new \UTILE\ZonageCityService () ;
				$return 			= $zonageCityService->getEntityById ($token, $id)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /zonage/:id ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->delete('/', function () use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /zonage ----------');
		try{
			
			$token 			= $app->request->headers->get('token');	
			$body 			= $app->request->getBody();
	        $dataBody 		= json_decode($body,true);
			$zonageCityId 		= $dataBody['zonage_city_id'] ;

			$zonageCityService 	= new \UTILE\ZonageCityService () ;
			$return 			= $zonageCityService->deleteEntityById ($token,$zonageCityId)	;	
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /zonage ----------');
	});
		
});
 
?>
