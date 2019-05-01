<?php

	$app->group('/gender', function () use ($app) {

		//insert new gender
		$app->post('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /gender ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $gender		= new \UTILE\Gender ();
			    $gender->set_name($dataBody['name']);
			    $gender->set_companyId($dataBody['company_id']);

				$genderService 	= new \UTILE\GenderService () ;
				$return 		= $genderService->addNewEntity ($token,$gender)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /gender ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->put('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /gender ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $gender		= new \UTILE\Gender ();
			    $gender->set_id($dataBody['gender_id']);
			    $gender->set_name($dataBody['name']);

				$genderService 	= new \UTILE\GenderService () ;
				$return 		= $genderService->updateEntityById ($token,$gender)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /gender ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		// Get gender
		$app->get('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /gender ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');
				$companyId 		= $app->request->params('company_id');

				$genderService 	= new \UTILE\GenderService () ;
				$return 		= $genderService->getAllEntities ($token,$companyId)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /gender ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/:id', function ($id) use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /gender/:id ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');

				$genderService 	= new \UTILE\GenderService () ;
				$return 		= $genderService->getEntityById ($token, $id)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /gender/:id ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->delete('/', function () use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /gender ----------');
		try{
			
			$token 			= $app->request->headers->get('token');	
			$body 			= $app->request->getBody();
	        $dataBody 		= json_decode($body,true);
			$genderId 		= $dataBody['gender_id'] ;

			$genderService 	= new \UTILE\GenderService () ;
			$return 		= $genderService->deleteEntityById ($token,$genderId)	;	
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /gender ----------');
	});
		
});
 
?>
