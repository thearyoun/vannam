<?php

	$app->group('/category', function () use ($app) {

		$app->post('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /category ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $category		= new \UTILE\Category ();
			    $category->set_name($dataBody['name']);
			    $category->set_companyId($dataBody['company_id']);

				$categoryService 	= new \UTILE\CategoryService () ;
				$return 			= $categoryService->addNewEntity ($token,$category)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /category ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->put('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /category ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $category		= new \UTILE\Category ();
			    $category->set_id($dataBody['category_id']);
			    $category->set_name($dataBody['name']);

				$categoryService 	= new \UTILE\CategoryService () ;
				$return 			= $categoryService->updateEntityById ($token,$category)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /category ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /category ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');
				$companyId 		= $app->request->params('company_id');

				$categoryService 	= new \UTILE\CategoryService () ;
				$return 			= $categoryService->getAllEntities ($token,$companyId)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /category ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/:id', function ($id) use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /category/:id ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');

				$CategoryService 	= new \UTILE\CategoryService () ;
				$return 			= $CategoryService->getEntityById ($token, $id)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /category/:id ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->delete('/', function () use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /category ----------');
		try{
			
			$token 			= $app->request->headers->get('token');	
			$body 			= $app->request->getBody();
	        $dataBody 		= json_decode($body,true);
			$categoryId 	= $dataBody['category_id'] ;

			$categoryService 	= new \UTILE\CategoryService () ;
			$return 			= $categoryService->deleteEntityById ($token,$categoryId)	;	
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /category ----------');
	});
		
	});
 
?>
