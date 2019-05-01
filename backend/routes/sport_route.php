<?php

	$app->group('/sport', function () use ($app) {

		$app->post('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /sport ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $sport		= new \UTILE\Sport ();
			    $sport->set_name($dataBody['name']);
			    $sport->set_companyId($dataBody['company_id']);

				$sportService 	= new \UTILE\SportService () ;
				$return 		= $sportService->addNewEntity ($token,$sport)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /sport ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->put('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /sport ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $sport		= new \UTILE\Sport ();
			    $sport->set_id($dataBody['sport_id']);
			    $sport->set_name($dataBody['name']);

				$sportService 	= new \UTILE\SportService () ;
				$return 		= $sportService->updateEntityById ($token,$sport)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /sport ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /sport ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');
				$companyId 		= $app->request->params('company_id');

				$sportService 	= new \UTILE\SportService () ;
				$return 		= $sportService->getAllEntities ($token,$companyId)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /sport ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/:id', function ($id) use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /sport/:id ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');
				$sportId 		= $app->request->params('sport_id');

				$sportService 	= new \UTILE\SportService () ;
				$return 		= $sportService->getEntityById ($token, $id)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /sport/:id ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->delete('/', function () use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /sport ----------');
		try{
			
			$token 			= $app->request->headers->get('token');	
			$body 			= $app->request->getBody();
	        $dataBody 		= json_decode($body,true);
			$sportId 		= $dataBody['sport_id'] ;

			$sportService 	= new \UTILE\SportService () ;
			$return 		= $sportService->deleteEntityById ($token,$sportId)	;	
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /sport ----------');
	});
		
});
 
?>
