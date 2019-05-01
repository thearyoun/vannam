<?php

	$app->group('/invoice', function () use ($app) {

		$app->group('/print', function () use ($app) {
			$app->get('/', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /invoice/print ----------');
				$return = array () ;
				try{

					$token 				= $app->request->headers->get('token');
				    $commandId 			= $app->request->params('command_id') ; 
				    $typePrint 			= $app->request->params('type') ; 

					$commandService 	= new \UTILE\CommandService () ;
					$return 			= $commandService->generateProformaOrInvoiceById ($token, $commandId, '', $typePrint, INVOICE_TYPE)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /invoice/print ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});

		$app->get('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /invoice ----------');
			$return = array () ;
			try{
				$token 				= $app->request->headers->get('token');
				$companyId 			= $app->request->params('company_id');

				$criteria 			= new \UTILE\CriteriaInvoice();
				$criteria->set_num($app->request->params('num_invoice'));
				$criteria->set_client($app->request->params('client'));
				$criteria->set_startDate($app->request->params('start_date'));
				$criteria->set_endDate($app->request->params('end_date'));

				$invoiceService 	= new \UTILE\InvoiceService () ;
				$return 			= $invoiceService->getAllInvoicesByCriteria ($token, $criteria, $companyId)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /invoice ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->delete('/:id', function ($id) use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /invoice ----------');
			$return = array () ;
			try{
				$token 				= $app->request->headers->get('token');

				$invoiceService 	= new \UTILE\InvoiceService () ;
				$return 			= $invoiceService->hideInvoiceById ($token,$id)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /invoice ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});
			
	});
 
?>
