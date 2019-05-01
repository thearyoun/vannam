<?php

	$app->group('/command', function () use ($app) {

		$app->group('/products', function () use ($app) {
			$app->delete('/:qid/:pid', function ($qid, $pid) use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /command/products ----------');
				$return = array () ;
				try{

					$token 				= $app->request->headers->get('token');
					$commandService 	= new \UTILE\CommandService () ;
					$return 			= $commandService->deleteProductFromCommandById ($token, $qid, $pid)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /command/products ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});

		$app->group('/convert', function () use ($app) {
			$app->post('/quotation', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /command/convert/quotation ----------');
				$return = array () ;
				try{

					$token 				= $app->request->headers->get('token');
					$body 				= $app->request->getBody();
			    	$dataBody 			= json_decode($body,true);
				    $commandId 			= $dataBody['command_id'] ; 
				    
					$commandService 	= new \UTILE\CommandService () ;
					$return 			= $commandService->convertCommandToQuotationById ($token, $commandId)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /command/convert/quotation ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});

		$app->group('/bp', function () use ($app) {
			$app->get('/print', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /command/bp/print ----------');
				$return = array () ;
				try{

					$token 				= $app->request->headers->get('token');
					$commandId 			= $app->request->params('command_id') ; 

					$commandService 	= new \UTILE\CommandService () ;
					$return 			= $commandService->printBpOfCommandById ($token, $commandId)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /command/bp/print ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});

		$app->group('/invoice', function () use ($app) {
			$app->post('/create', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /command/invoice/create ----------');
				$return = array () ;
				try{

					$token 				= $app->request->headers->get('token');
					$body 				= $app->request->getBody();
			    	$dataBody 			= json_decode($body,true);
				    $commandId 			= $dataBody['command_id'] ; 

					$commandService 	= new \UTILE\CommandService () ;
					$return 			= $commandService->generateInvoiceById ($token, $commandId)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /command/invoice/create ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});

		$app->group('/proforma', function () use ($app) {
			$app->get('/', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /command/proforma ----------');
				$return = array () ;
				try{

					$token 				= $app->request->headers->get('token');
				    $commandId 			= $app->request->params('command_id') ; 
				    $typePayment 		= $app->request->params('type_payment') ; 
				    $typePrint 			= $app->request->params('type_print') ; 

					$commandService 	= new \UTILE\CommandService () ;
					$return 			= $commandService->generateProformaOrInvoiceById ($token, $commandId, $typePayment, $typePrint, PROFORMA_TYPE)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /command/proforma ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});

		$app->group('/lissage', function () use ($app) {
			$app->get('/', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /command/lissage/ ----------');
				$return = array () ;
				try{

					$token 				= $app->request->headers->get('token');
				    $productId 			= $app->request->params('product_id') ;
				    $quantity 			= $app->request->params('quantity') ; 
				    $commandId 			= $app->request->params('command_id') ; 

					$commandService 	= new \UTILE\CommandService () ;
					$return 			= $commandService->getCommandLissageById ($token, $productId, $quantity, $commandId)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /command/lissage ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});

		$app->group('/file', function () use ($app) {
			$app->get('/:id', function ($id) use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /command/file/:id ----------');
				$return 	= array () ;
				try{
					$token 				= $app->request->headers->get('token');
					$typeRendering 		= $app->request->params('render_type');
					$companyId 			= $app->request->params('company_id');
					$isImage			= $app->request->params('is_images');
					$formatStock		= $app->request->params('format_stock');
					$vanamPrice 		= $app->request->params('vanam_price') ;
					$header 			= $app->request->params('header') ;

				
					$commandService 	= new \UTILE\CommandService () ;
					$return 			= $commandService->getCommandDocumentById ($token, $id, $typeRendering, $isImage, $formatStock, $vanamPrice, $header, $companyId)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /command/file/:id ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});

		$app->group('/media', function () use ($app) {
			$app->post('/', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /command/media ----------');
				$return 	= array () ;
				try{
					$token 			= $app->request->headers->get('token');
					$commandId 		= $app->request->params('command_id');
					$files 			= $_FILES['file'];					
					
				
					$commandService 	= new \UTILE\CommandService () ;
					$return 			= $commandService->addFileToCommandById ($token, $commandId, $files)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /command/media ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});

			$app->delete('/:id/:fileId', function ($id,$fileId) use ($app){
    			$logger = \Logger::getLogger(basename(__FILE__));
        		$logger->debug('START /booking/media ----------');
        		try{
        			$token 				= $app->request->headers->get('token');
					$commandService 	= new \UTILE\CommandService () ;
					
            		$return         	= $commandService->deleteFileFromCommandById($token, $id, $fileId);
        		} catch(Exception $e){
        			$logger->debug($e);
            		$app->response()->status(400);
            		$app->response()->header('X-Status-Reason', $e->getMessage());
            		$return = array("success"=>'false',"msg"=>$e->getMessage());
       	 		}
        		$logger->debug('END /booking/media ----------');
        		if ($return['success'] == "false") {
        			$app->response()->status(400);
        		}
        		$app->response()->header('Content-Type', 'application/json');
        		echo json_encode($return);
   			});	
		});

		$app->post('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /command ----------');
			$return = array () ;
			try{
				$token 				= $app->request->headers->get('token');
				$body 				= $app->request->getBody();
			    $dataBody 			= json_decode($body,true);

			    $command			= new \UTILE\Command ();
			    $command->set_companyId($dataBody['company_id']);
			    $command->set_clientId($dataBody['client_id']);
			    $command->set_changeId($dataBody['change_id']);
			    $command->set_status($dataBody['status']);
			    $command->set_comment(isset($dataBody['comment']) ? $dataBody['comment'] :"");
			    $command->set_transportAmount(isset($dataBody['transport_amount']) ? $dataBody['transport_amount'] : "");
			    $command->set_tvaExoneration(isset($dataBody['tva_exoneration']) ? $dataBody['tva_exoneration'] : "");
			    $command->set_isInvoicePDF(isset($dataBody['is_invoice_pdf']) ? $dataBody['is_invoice_pdf'] : "");
			    $command->set_isInvoiceEXCEL(isset($dataBody['is_invoice_excel']) ? $dataBody['is_invoice_excel'] : "");


			    $commandDetailsTab 		= array ();
			    if (isset($dataBody['command_details'])){
			   		foreach ($dataBody['command_details'] as $cmdDetail) {
                   		$commandDetail = new \UTILE\CommandDetail();
                		$commandDetail->set_productId(isset($cmdDetail['product_id']) ? $cmdDetail['product_id'] : "");
                		$commandDetail->set_salePrice(isset($cmdDetail['sale_price']) ? $cmdDetail['sale_price'] : "");
                		$commandDetailStocksTab 	= array ();
                		if (isset($cmdDetail['stock'])){
                			foreach($cmdDetail['stock'] as $cmdQStock){
                				$commandDetailStock = new \UTILE\CommandDetailStock();
                				$commandDetailStock->set_rangeDetailId(isset($cmdQStock['range_detail_id']) ? $cmdQStock['range_detail_id'] : "");
                				$commandDetailStock->set_value(isset($cmdQStock['value']) ? $cmdQStock['value'] :"");
                				array_push($commandDetailStocksTab,$commandDetailStock);
                			}
                		}
                		$commandDetail->set_detailStocks($commandDetailStocksTab);
						array_push($commandDetailsTab,$commandDetail);
                	}
                }
                
                $command->set_details ($commandDetailsTab);

				$commandService 	= new \UTILE\CommandService () ;
				$return 			= $commandService->addNewEntity ($token,$command)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /command ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->put('/:id', function ($id) use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /command ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $command			= new \UTILE\Command ();
			    $command->set_id($id);
			    $command->set_companyId($dataBody['company_id']);
			    $command->set_clientId($dataBody['client_id']);
			    $command->set_changeId($dataBody['change_id']);
				$command->set_status($dataBody['status']);
				$command->set_comment(isset($dataBody['comment']) ? $dataBody['comment'] :"");
			    $command->set_transportAmount(isset($dataBody['transport_amount']) ? $dataBody['transport_amount'] : "");
			    $command->set_tvaExoneration(isset($dataBody['tva_exoneration']) ? $dataBody['tva_exoneration'] : "");
			    $command->set_isInvoicePDF(isset($dataBody['is_invoice_pdf']) ? $dataBody['is_invoice_pdf'] : "");
			    $command->set_isInvoiceEXCEL(isset($dataBody['is_invoice_excel']) ? $dataBody['is_invoice_excel'] : "");

			    $commandDetailsTab 		= array ();
			    if (isset($dataBody['command_details'])){
			   		foreach ($dataBody['command_details'] as $cmdDetail) {
						$commandDetail = new \UTILE\CommandDetail();
						$commandDetail->set_id(isset($cmdDetail['id']) ? $cmdDetail['id'] : "");
						$commandDetail->set_productId(isset($cmdDetail['product_id']) ? $cmdDetail['product_id'] : "");
                		$commandDetail->set_salePrice(isset($cmdDetail['sale_price']) ? $cmdDetail['sale_price'] : "");
                		$commandDetailStocksTab 	= array ();
                		if (isset($cmdDetail['stock'])){
                			foreach($cmdDetail['stock'] as $cmdQStock){
								$commandDetailStock = new \UTILE\CommandDetailStock();
								$commandDetailStock->set_id(isset($cmdDStock['id']) ? $cmdDStock['id'] : "");
                				$commandDetailStock->set_rangeDetailId(isset($cmdQStock['range_detail_id']) ? $cmdQStock['range_detail_id'] : "");
                				$commandDetailStock->set_value(isset($cmdQStock['value']) ? $cmdQStock['value'] :"");
                				array_push($commandDetailStocksTab,$commandDetailStock);
                			}
                		}
                		$commandDetail->set_detailStocks($commandDetailStocksTab);
                		$commandDetailStocksTab 	= array ();
						array_push($commandDetailsTab,$commandDetail);
                	}
                }
                
                $command->set_details ($commandDetailsTab);

				$commandService 	= new \UTILE\CommandService () ;
				$return 			= $commandService->updateEntityById ($token,$command)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /command ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /command ----------');
			$return = array () ;
			try{
				$token 				= $app->request->headers->get('token');
				$companyId 			= $app->request->params('company_id');

				$criteria 			= new \UTILE\CriteriaCommand();
				$criteria->set_num($app->request->params('num_command'));
				$criteria->set_creator($app->request->params('creator'));
				$criteria->set_company($app->request->params('company'));

				$commandService 	= new \UTILE\CommandService () ;
				$return 			= $commandService->getAllCommandsByCriteria ($token, $criteria, $companyId)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /command ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/:id', function ($id) use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /command/:id ----------');
			$return = array () ;
			try{
				$token 				= $app->request->headers->get('token');

				$commandService 	= new \UTILE\CommandService () ;
				$return 			= $commandService->getEntityById ($token, $id)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /command/:id ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->delete('/:id', function ($id) use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /command ----------');
		try{
			
			$token 				= $app->request->headers->get('token');	

			$commandService 	= new \UTILE\CommandService () ;
			$return 			= $commandService->deleteEntityById ($token,$id)	;	
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /command ----------');
	});
});
 
?>
