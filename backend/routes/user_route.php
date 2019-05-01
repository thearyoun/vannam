<?php

	$app->post('/user', function () use($app) { 
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /user ----------');
		$return = array () ;
		try{
			$token 		= $app->request->headers->get('token');

			$userBean 	= new \UTILE\User () 				;
			$body 		= $app->request->getBody();
	        $dataBody 	= json_decode($body,true);
			$userBean->set_name($dataBody['name'])	;
			$userBean->set_firstname($dataBody['firstname'])	;
			$userBean->set_mail($dataBody['mail'])	;
			$userBean->set_passwd($dataBody['passwd'])	;
			$userBean->set_mobileLine($dataBody['mobile_line'])	;
			$userBean->set_directLine( isset($dataBody['direct_line']) ? $dataBody['direct_line'] : "") 	;
			$userBean->set_roleId($dataBody['role_id']);
			$userBean->set_companyId($dataBody['company_id']);

	
			$userService 	= new \UTILE\UserService () ;
			$return 		= $userService->addNewEntity ($token,$userBean)	;	
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug($return);
		if ($return['success'] == "false") {
        	$app->response()->status(401);
        }
        $logger->debug('END /user ----------');
		$app->response()->header('Content-Type', 'application/json');
		echo json_encode($return); 
	});

	$app->put('/user', function () use($app) {
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /user ----------');
		$return = array () ;
		try{
			$token 		= $app->request->headers->get('token');
			$userBean 	= new \UTILE\User () 				;
			$body 		= $app->request->getBody();
	        $dataBody 	= json_decode($body,true);
			$userBean->set_id($dataBody['id'])	;
			$userBean->set_name($dataBody['name'])	;
			$userBean->set_firstname($dataBody['firstname'])	;
			$userBean->set_mail($dataBody['mail'])	;
			$userBean->set_passwd($dataBody['passwd'])	;
			$userBean->set_mobileLine($dataBody['mobile_line'])	;
			$userBean->set_directLine($dataBody['direct_line'])	;
			$userBean->set_activate(isset($dataBody['activate']) ? $dataBody['activate']: 1)	;
			
			$userBean->set_roleId($dataBody['role_id']);
			$userBean->set_companyId($dataBody['company_id']);

			$userService 	= new \UTILE\UserService () ;
			$return 		= $userService->updateEntityById ($token,$userBean)	;	
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /user ----------');
		if ($return['success'] == "false") {
        	$app->response()->status(401);
        }
		$app->response()->header('Content-Type', 'application/json');
		echo json_encode($return); 
	});

	$app->get('/user', function () use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /user ----------');
		$return = array ();
		try{
			$token 			= $app->request->headers->get('token');
			$companyId 		= $app->request->params('company_id')	;
			$userService 	= new \UTILE\UserService () ;
			$return 		= $userService->getAllEntities ($token,$companyId)	;	
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		if ($return['success'] == "false") {
        	$app->response()->status(401);
        }
		$logger->debug('END /user ----------');
		$app->response()->header('Content-Type', 'application/json');
		echo json_encode($return); 

	});

	$app->get('/user/:id', function ($id) use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /user ----------');
		$return = array ();
		try{
			$token 			= $app->request->headers->get('token');
			$companyId 		= $app->request->params('company_id')	;

			$userService 	= new \UTILE\UserService () ;
			$return 		= $userService->getUserById ($token,$id,$companyId)	;	
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		if ($return['success'] == "false") {
        	$app->response()->status(401);
        }
		$logger->debug('END /user ----------');
		$app->response()->header('Content-Type', 'application/json');
		echo json_encode($return); 

	});

	$app->delete('/user/:id', function ($id) use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /user ----------');
		$return 	= array ();
		try{
			$token 			= $app->request->headers->get('token');

			$userService 	= new \UTILE\UserService () ;
			$return 		= $userService->deleteEntityById ($token,$id)	;	
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /user ----------');
		if ($return['success'] == "false") {
        	$app->response()->status(401);
        }
		$app->response()->header('Content-Type', 'application/json');
		echo json_encode($return); 

	});

	$app->post('/account/picture', function () use ($app){
    	$logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /account/picture ----------');
        $return = array ();
        try{
			$userId 		= $app->request->params('user_id') ;
        	$token 			= $app->request->headers->get('token');
			$files 			= $_FILES['picture'];
			$userService 	= new \UTILE\UserService();
           	$return         = $userService->savePictureOfUser($token,$userId,$files);
            } catch(Exception $e){
            	$logger->debug($e);
                $app->response()->status(400);
                $app->response()->header('X-Status-Reason', $e->getMessage());
                $return = array("success"=>'false',"msg"=>$e->getMessage());
            }
            $logger->debug('END /account/picture ----------');
            if ($return['success'] == "false") {
      			$app->response()->status(401);
            }
            $app->response()->header('Content-Type', 'application/json');
            echo json_encode($return);
	});

	$app->delete('/account/picture', function () use ($app){
    	$logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /account/picture ----------');
        $return = array ();
        try{
        	$userBean 		= new \UTILE\User () 				;
			$body 			= $app->request->getBody();
	        $dataBody 		= json_decode($body,true);
			$userId 		= $dataBody['user_id']	;
        	$token 			= $app->request->headers->get('token');
            $userService 	= new \UTILE\UserService();
            $return         = $userService->deletePictureOfCurrentUser($token,$userId);
        } catch(Exception $e){
        	$logger->debug($e);
            $app->response()->status(400);
            $app->response()->header('X-Status-Reason', $e->getMessage());
            $return = array("success"=>'false',"msg"=>$e->getMessage());
        }
        $logger->debug('END /account/picture ----------');
        if ($return['success'] == "false") {
        	$app->response()->status(401);
        }
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($return);
   	});	
 
?>
