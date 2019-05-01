<?php

	$app->group('/change', function () use ($app) {

		$app->post('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /change ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $change		= new \UTILE\Change ();
			    $change->set_name($dataBody['name']);
			    $change->set_companyId($dataBody['company_id']);

				$changeService 	= new \UTILE\ChangeService () ;
				$return 		= $changeService->addNewEntity ($token,$change)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /change ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->put('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /change ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $change		= new \UTILE\Change ();
			    $change->set_id($dataBody['change_id']);
			    $change->set_name($dataBody['name']);

				$changeService 	= new \UTILE\ChangeService () ;
				$return 		= $changeService->updateEntityById ($token,$change)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /change ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /change ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');
				$companyId 		= $app->request->params('company_id');

				$changeService 	= new \UTILE\ChangeService () ;
				$return 		= $changeService->getAllEntities ($token,$companyId)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /change ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/:id', function ($id) use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /change/:id ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');

				$changeService 	= new \UTILE\ChangeService () ;
				$return 		= $changeService->getEntityById ($token, $id)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /change/:id ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->delete('/', function () use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /change ----------');
		try{
			
			$token 			= $app->request->headers->get('token');	
			$body 			= $app->request->getBody();
	        $dataBody 		= json_decode($body,true);
			$changeId 		= $dataBody['change_id'] ;

			$changeService 	= new \UTILE\ChangeService () ;
			$return 		= $changeService->deleteEntityById ($token,$changeId)	;	
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /change ----------');
	});
		
});
 
?>
