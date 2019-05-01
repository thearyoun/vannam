<?php

	$app->group('/range', function () use ($app) {

		/********************************
		*	GESTION DETAILS DES GAMMES  *
		********************************/
		$app->post('/detail', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /range/detail ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $rangeDetail 	= new \UTILE\RangeDetail ();
			    $rangeDetail->set_name($dataBody['name']);
			    $rangeDetail->set_rangeId($dataBody['range_detail_id']);
			    $rangeDetail->set_rang(isset($dataBody['rang'])? $dataBody['rang'] :"");

				$rangeDetailService 	= new \UTILE\RangeDetailService () ;
				$return 				= $rangeDetailService->addNewEntity ($token,$rangeDetail)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /range/detail ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->put('/detail', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /range/detail ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $rangeDetail		= new \UTILE\RangeDetail ();
			    $rangeDetail->set_id($dataBody['range_detail_id']);
			    $rangeDetail->set_name($dataBody['name']);
			    $rangeDetail->set_rang($dataBody['rang']);

				$rangeDetailService 	= new \UTILE\RangeDetailService () ;
				$return 				= $rangeDetailService->updateEntityById ($token,$rangeDetail)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /range/detail ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/detail', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /range/detail ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');
				$rangeId 		= $app->request->params('range_id');

				$rangeDetailService 	= new \UTILE\RangeDetailService () ;
				$return 				= $rangeDetailService->getAllEntities ($token,$rangeId)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /range/detail ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/detail/:id', function ($id) use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /range/detail/:id ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');

				$rangeDetailtService 	= new \UTILE\RangeDetailService () ;
				$return 				= $rangeDetailService->getEntityById ($token, $id)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /range/detail/:id ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->delete('/detail', function () use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /range/detail ----------');
		try{
			
			$token 			= $app->request->headers->get('token');	
			$body 			= $app->request->getBody();
	        $dataBody 		= json_decode($body,true);
			$rangeDetailId 	= $dataBody['range_detail_id'] ;

			$rangeDetailService 	= new \UTILE\RangeDetailService () ;
			$return 				= $rangeDetailService->deleteEntityById ($token,$rangeDetailId)	;	
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /range/detail ----------');
	});


		/********************************
		*	GESTION DES GAMMES			*
		********************************/
		$app->post('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /range ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $range		= new \UTILE\Range ();
			    $range->set_name($dataBody['name']);
			    $range->set_companyId($dataBody['company_id']);

				$rangeService 	= new \UTILE\RangeService () ;
				$return 		= $rangeService->addNewEntity ($token,$range)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /range ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->put('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /range ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $range		= new \UTILE\Range ();
			    $range->set_id($dataBody['range_id']);
			    $range->set_name($dataBody['name']);

				$rangeService 	= new \UTILE\RangeService () ;
				$return 		= $rangeService->updateEntityById ($token,$range)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /range ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /range ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');
				$companyId 		= $app->request->params('company_id');

				$rangeService 	= new \UTILE\RangeService () ;
				$return 		= $rangeService->getAllEntities ($token,$companyId)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /range ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/:id', function ($id) use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /range/:id ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');

				$rangeService 	= new \UTILE\RangeService () ;
				$return 		= $rangeService->getEntityById ($token, $id)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /range/:id ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->delete('/', function () use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /range ----------');
		try{
			
			$token 			= $app->request->headers->get('token');	
			$body 			= $app->request->getBody();
	        $dataBody 		= json_decode($body,true);
			$rangeId 		= $dataBody['range_id'] ;

			$rangeService 	= new \UTILE\RangeService () ;
			$return 		= $rangeService->deleteEntityById ($token,$rangeId)	;	
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /range ----------');
	});
		
});
 
?>
