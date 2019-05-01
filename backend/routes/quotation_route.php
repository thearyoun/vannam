<?php

	$app->group('/quotation', function () use ($app) {

		$app->group('/products', function () use ($app) {
			$app->delete('/:qid/:pid', function ($qid, $pid) use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /quotation/products ----------');
				$return = array () ;
				try{

					$token 				= $app->request->headers->get('token');
					$quotationService 	= new \UTILE\QuotationService () ;
					$return 			= $quotationService->deleteProductFromQuotationById ($token, $qid, $pid)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /quotation/products ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});


		$app->group('/lissage', function () use ($app) {
			$app->get('/', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /quotation/lissage ----------');
				$return = array () ;
				try{

					$token 				= $app->request->headers->get('token');
				    $productId 			= $app->request->params('product_id') ;
				    $quantity 			= $app->request->params('quantity') ; 
				    $quotationId 		= $app->request->params('quotation_id') ; 

					$quotationService 	= new \UTILE\QuotationService () ;
					$return 			= $quotationService->getQuotationLissageById ($token, $productId, $quantity, $quotationId)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /quotation/lissage ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});

		$app->group('/file', function () use ($app) {
			$app->get('/:id', function ($id) use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /quotation/file/:id ----------');
				$return = array () ;
				try{
					$token 				= $app->request->headers->get('token');
					$typeRendering 		= $app->request->params('render_type');
					$companyId 			= $app->request->params('company_id');
					$isImage			= $app->request->params('is_images');
					$formatStock		= $app->request->params('format_stock');
					$vanamPrice 		= $app->request->params('vanam_price') ;
					$header 			= $app->request->params('header') ;
				
					$quotationService 	= new \UTILE\QuotationService () ;
					$return 			= $quotationService->getQuotationDocumentById ($token, $id, $typeRendering, $isImage, $formatStock, $vanamPrice, $header, $companyId)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /quotation/file/:id ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});

		$app->group('/duplication', function () use ($app) {
			$app->post('/', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /quotation/duplication ----------');
				$return = array () ;
				try{
					$token 				= $app->request->headers->get('token');
					$body 				= $app->request->getBody();
			   		$dataBody 			= json_decode($body,true);
					$quotationId 		= $dataBody['quotation_id'];
				
					$quotationService 	= new \UTILE\QuotationService () ;
					$return 			= $quotationService->duplicateQuotationById ($token, $quotationId)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /quotation/duplication ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});

		$app->group('/convert', function () use ($app) {
			$app->post('/', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /quotation/convert ----------');
				$return = array () ;
				try{
					$token 				= $app->request->headers->get('token');
					$body 				= $app->request->getBody();
			   		$dataBody 			= json_decode($body,true);
					$quotationId 		= $dataBody['quotation_id'];
				
					$quotationService 	= new \UTILE\QuotationService () ;
					$return 			= $quotationService->convertQuotationToCommandById ($token, $quotationId)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /quotation/convert ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});

		$app->post('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /quotation ----------');
			$return = array () ;
			try{
				$token 				= $app->request->headers->get('token');
				$body 				= $app->request->getBody();
			    $dataBody 			= json_decode($body,true);

			    $quotation			= new \UTILE\Quotation ();
			    $quotation->set_companyId($dataBody['company_id']);
			    $quotation->set_clientId($dataBody['client_id']);
			    $quotation->set_changeId($dataBody['change_id']);
			    $quotation->set_comment(isset($dataBody['comment']) ? $dataBody['comment'] : '');

			    $quotationDetailsTab 		= array ();
			    if (isset($dataBody['quotation_details'])){
			   		foreach ($dataBody['quotation_details'] as $qtDetail) {
                   		$quotationDetail = new \UTILE\QuotationDetail();
                		$quotationDetail->set_productId(isset($qtDetail['product_id'])  ? $qtDetail['product_id'] : "");
                		$quotationDetail->set_salePrice(isset($qtDetail['sale_price']) ? $qtDetail['sale_price'] : "");
                		$quotationDetailStocksTab 	= array ();
                		if (isset($qtDetail['stock'])){
                			foreach($qtDetail['stock'] as $pQdStock){
                				$quotationDetailStock = new \UTILE\QuotationDetailStock();
                				$quotationDetailStock->set_rangeDetailId(isset($pQdStock['range_detail_id']) ? $pQdStock['range_detail_id'] : "");
                				$quotationDetailStock->set_value(isset($pQdStock['value']) ? $pQdStock['value'] : "");
                				array_push($quotationDetailStocksTab,$quotationDetailStock);
                			}
                		}
                		$quotationDetail->set_detailStocks($quotationDetailStocksTab);
						array_push($quotationDetailsTab,$quotationDetail);
                	}
                }
                
                $quotation->set_details ($quotationDetailsTab);

				$quotationService 	= new \UTILE\QuotationService () ;
				$return 			= $quotationService->addNewEntity ($token,$quotation)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /quotation ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->put('/:id', function ($id) use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /quotation ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $quotation	= new \UTILE\Quotation ();
			    $quotation->set_id($id);
			    $quotation->set_companyId($dataBody['company_id']);
			    $quotation->set_clientId($dataBody['client_id']);
			    $quotation->set_changeId($dataBody['change_id']);
			    $quotation->set_comment($dataBody['comment']);

			    $quotationDetailsTab 		= array ();
			    if (isset($dataBody['quotation_details'])){
			   		foreach ($dataBody['quotation_details'] as $qtDetail) {
                   		$quotationDetail = new \UTILE\QuotationDetail();
                		$quotationDetail->set_id(isset($qtDetail['id']) ? $qtDetail['id']  : "");
                		$quotationDetail->set_productId(isset($qtDetail['product_id']) ? $qtDetail['product_id'] : "");
                		$quotationDetail->set_salePrice(isset($qtDetail['sale_price']) ? $qtDetail['sale_price'] : "");
                		$quotationDetailStocksTab 	= array ();
                		if (isset($qtDetail['stock'])){
                			foreach($qtDetail['stock'] as $pQdStock){
                				$quotationDetailStock = new \UTILE\QuotationDetailStock();
                				$quotationDetailStock->set_id(isset($pQdStock['id']) ? $pQdStock['id'] : "");
                				$quotationDetailStock->set_rangeDetailId(isset($pQdStock['range_detail_id']) ? $pQdStock['range_detail_id'] : "");
                				$quotationDetailStock->set_value(isset($pQdStock['value']) ? $pQdStock['value'] : "");
                				array_push($quotationDetailStocksTab,$quotationDetailStock);
                			}
                		}
                		$quotationDetail->set_detailStocks($quotationDetailStocksTab);
                		$quotationDetailStocksTab 	= array ();
						array_push($quotationDetailsTab,$quotationDetail);
                	}
                }
                
                $quotation->set_details ($quotationDetailsTab);

				$quotationService 	= new \UTILE\QuotationService () ;
				$return 			= $quotationService->updateEntityById ($token,$quotation)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /quotation ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /quotation ----------');
			$return = array () ;
			try{
				$token 				= $app->request->headers->get('token');
				$companyId 			= $app->request->params('company_id');

				$criteria 			= new \UTILE\CriteriaQuotation();
				$criteria->set_num($app->request->params('num_quotation'));
				$criteria->set_creator($app->request->params('creator'));
				$criteria->set_company($app->request->params('company'));

				$quotationService 	= new \UTILE\QuotationService () ;
				$return 			= $quotationService->getAllQuotationsByCriteria ($token, $criteria, $companyId)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /quotation ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/:id', function ($id) use($app) {
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /quotation/:id ----------');
			$return = array () ;
			try{
				$token 				= $app->request->headers->get('token');

				$quotationService 	= new \UTILE\QuotationService () ;
				$return 			= $quotationService->getEntityById ($token, $id)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /quotation/:id ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->delete('/:id', function ($id) use ($app){
		$logger 	= \Logger::getLogger(basename(__FILE__));	
		$logger->debug('START /quotation ----------');
		try{
			
			$token 				= $app->request->headers->get('token');	

			$quotationService 	= new \UTILE\QuotationService () ;
			$return 			= $quotationService->deleteEntityById ($token,$id)	;	
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		} catch (Exception $e){
			$logger->debug($e);
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
		$logger->debug('END /quotation ----------');
	});
});
 
?>