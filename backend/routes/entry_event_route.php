<?php

	$app->group('/entry', function () use ($app) {


		$app->group('/import', function () use ($app) {

			$app->group('/pictures', function () use ($app) {

				$app->post('/', function () use($app) {

					$logger 	= \Logger::getLogger(basename(__FILE__));
					$logger->debug('START /entry/import/pictures ----------');
					$return = array () ;
					try{
						$token 				= $app->request->headers->get('token');
					    $file 				= $_FILES['file'];

						$entryEventService 	= new \UTILE\EntryEventService () ;
						$return 			= $entryEventService->importPicturesFromZipFile ($token,$file)	;

					} catch (Exception $e){
						$logger->debug($e);
						$app->response()->status(400);
						$app->response()->header('X-Status-Reason', $e->getMessage());
					}
					if ($return['success'] == "false") {
  		 				$app->response()->status(401);
  		 			}
  		 			$logger->debug('END /entry/import/pictures ----------');
					$app->response()->header('Content-Type', 'application/json');
					echo json_encode($return);
				});
			});

			$app->group('/stepone', function () use ($app) {

				$app->post('/', function () use($app) {

					$logger 	= \Logger::getLogger(basename(__FILE__));
					$logger->debug('START /entry/import/stepone ----------');
					$return = array () ;
					try{
						$token 		= $app->request->headers->get('token');
					    $file 		= $_FILES['file'];

						$fileHelper 	= new \UTILE\FileHelper () ;
						$return 		= $fileHelper->getAllHeadersOfCurrentEntryEventsFile ($token,$file)	;

					} catch (Exception $e){
						$logger->debug($e);
						$app->response()->status(400);
						$app->response()->header('X-Status-Reason', $e->getMessage());
					}
					/*if ($return['success'] == "false") {
  		 				$app->response()->status(401);
  		 			}*/
  		 			$logger->debug('END /entry/import/stepone ----------');
					$app->response()->header('Content-Type', 'application/json');
					echo json_encode($return);
				});
			});


			$app->group('/steptwo', function () use ($app) {

				$app->post('/', function () use($app) {

					$logger 	= \Logger::getLogger(basename(__FILE__));
					$logger->debug('START /entry/import/steptwo ----------');
					$return = array () ;
					try{
						//$token 					= $app->request->headers->get('token');
						$token = "";
						$body 					= $app->request->getBody();
			    		$dataBody 				= json_decode($body,true);
			    		$data 					= isset($dataBody["data"]) ? $dataBody["data"] : null;
			    		$fileName				= isset($dataBody["file_name"]) ? $dataBody["file_name"] : null ;

			    		$entryEventService 		= new \UTILE\EntryEventService () ;
						$return		 			= $entryEventService->makeDataAsNewTable($token,$fileName,$data);
					} catch (Exception $e){
						$logger->debug($e);
						$app->response()->status(400);
						$app->response()->header('X-Status-Reason', $e->getMessage());
						echo $e->getMessage();
					}
					/*if ($return['success'] == "false") {
  		 				$app->response()->status(401);
					   }*/

  		 			$logger->debug('END /entry/import/steptwo ----------');
					$app->response()->header('Content-Type', 'application/json');
					echo json_encode($return);

				});
			});

			$app->group('/stepthree', function () use ($app) {

				$app->post('/', function () use($app) {

					$logger 	= \Logger::getLogger(basename(__FILE__));
					$logger->debug('START /entry/import/stepthree ----------');
					$return = array () ;
					try{
						$token 					= $app->request->headers->get('token');
						$body 					= $app->request->getBody();
			    		$dataBody 				= json_decode($body,true);
			    		$data 					= isset($dataBody["data"]) ? $dataBody["data"] : null;
			    		$companyId				= $dataBody['company_id'];

			    		$entryEventService 		= new \UTILE\EntryEventService () ;
						$return		 			= $entryEventService->injectDataAndUpdateProducts($token,$data,$companyId);
					} catch (Exception $e){
						$logger->debug($e);
						$app->response()->status(400);
						$app->response()->header('X-Status-Reason', $e->getMessage());
					}
					if ($return['success'] == "false") {
  		 				$app->response()->status(401);
  		 			}
  		 			$logger->debug('END /entry/import/stepthree ----------');
					$app->response()->header('Content-Type', 'application/json');
					echo json_encode($return);
				});
			});
		});

		$app->post('/', function () use($app) {
			$logger 	= \Logger::getLogger(basename(__FILE__));
			$logger->debug('START /entry ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $entryEvent	= new \UTILE\EntryEvent ();
			    $entryEvent->set_information(isset($dataBody['information']) ? $dataBody['information']: "");
			    $entryEvent->set_parcelNb(isset($dataBody['parcel_nb']) ? $dataBody['parcel_nb'] : "");
			    $entryEvent->set_changeId(isset($dataBody['change_id']) ? $dataBody['change_id'] : "");
			    $entryEvent->set_companyId($dataBody['company_id']);

			    $entryEventDetailsTab 		= array ();
			    $entryEventDetailStocksTab 	= array ();
			    if (isset($dataBody['entry_event_details'])){
			   		foreach ($dataBody['entry_event_details'] as $evDetail) {
                   		$entryEventDetail = new \UTILE\EntryEventDetail();
                		$entryEventDetail->set_productId(isset($evDetail['product_id']) ? $evDetail['product_id'] : "");
                		$entryEventDetail->set_purchasePrice(isset($evDetail['purchase_price']) ? $evDetail['purchase_price'] : "");
                		$entryEventDetail->set_saleRatePrice(isset($evDetail['sale_rate_price']) ? $evDetail['sale_rate_price'] : "");

                		$location	= new \UTILE\Location ();
			  	  		$location->set_zonageCityId(isset($evDetail['zonage_city_id']) ? $evDetail['zonage_city_id'] : 1 );
			    		$location->set_aisle(isset($evDetail['aisle']) ? $evDetail['aisle'] : "");
			    		$location->set_palette(isset($evDetail['palette']) ? $evDetail['palette'] : "");
			    		$entryEventDetail->set_location($location);

                		if (isset($evDetail['stock'])){
                			foreach($evDetail['stock'] as $pEdStock){
                				$entryEventDetailStock = new \UTILE\EntryEventDetailStock();
                				$entryEventDetailStock->set_rangeDetailId(isset($pEdStock['range_detail_id']) ? $pEdStock['range_detail_id'] : "");
                				$entryEventDetailStock->set_value(isset($pEdStock['value']) ? $pEdStock['value'] :"");
                				array_push($entryEventDetailStocksTab,$entryEventDetailStock);
                			}
                		}
                		$entryEventDetail->set_entryEventDetailStocks($entryEventDetailStocksTab);
						array_push($entryEventDetailsTab,$entryEventDetail);
						$entryEventDetailStocksTab 	= array ();
                	}
                }

                $entryEvent->set_entryEventDetails ($entryEventDetailsTab);

				$entryEventService 	= new \UTILE\EntryEventService () ;
				$return 			= $entryEventService->addNewEntity ($token,$entryEvent)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /entry ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return);
		});

		$app->put('/', function () use($app) {
			$logger 	= \Logger::getLogger(basename(__FILE__));
			$logger->debug('START /entry ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $entryEvent	= new \UTILE\EntryEvent ();
			    $entryEvent->set_id(isset($dataBody['id']) ? $dataBody['id'] : "");
			    $entryEvent->set_information(isset($dataBody['information']) ? $dataBody['information'] : "");
			    $entryEvent->set_parcelNb(isset($dataBody['parcel_nb']) ? $dataBody['parcel_nb'] : "");
			    $entryEvent->set_changeId(isset($dataBody['change_id']) ? $dataBody['change_id'] : "");

			    $entryEventDetailsTab 		= array ();
			    $entryEventDetailStocksTab 	= array ();
			    if (isset($dataBody['entry_event_details'])){
			   		foreach ($dataBody['entry_event_details'] as $evDetail) {
                   		$entryEventDetail = new \UTILE\EntryEventDetail();
                		$entryEventDetail->set_id(isset($evDetail['id']) ? $evDetail['id'] : "");
                		$entryEventDetail->set_productId(isset($evDetail['product_id']) ? $evDetail['product_id'] : "");
                		$entryEventDetail->set_purchasePrice(isset($evDetail['purchase_price']) ? $evDetail['purchase_price'] : "");
                		$entryEventDetail->set_saleRatePrice(isset($evDetail['sale_rate_price']) ? $evDetail['sale_rate_price'] : "");
                		$entryEventDetail->set_vanamPrice(isset($evDetail['sale_vanam_price']) ? $evDetail['sale_vanam_price'] : "");

						$location	= new \UTILE\Location ();
			  	  		$location->set_zonageCityId(isset($evDetail['zonage_city_id']) ? $evDetail['zonage_city_id'] : 1 );
			  	  		$location->set_aisle(isset($evDetail['aisle']) ? $evDetail['aisle'] : "");
			    		$location->set_palette(isset($evDetail['palette']) ? $evDetail['palette'] : "");
			    		$entryEventDetail->set_location($location);

                		if (isset($evDetail['stock'])){
                			foreach($evDetail['stock'] as $pEdStock){
                				$entryEventDetailStock = new \UTILE\EntryEventDetailStock();
                				$entryEventDetailStock->set_rangeDetailId(isset($pEdStock['range_detail_id']) ? $pEdStock['range_detail_id'] : "");
                				$entryEventDetailStock->set_value(isset($pEdStock['value']) ? $pEdStock['value'] : "");
                				array_push($entryEventDetailStocksTab,$entryEventDetailStock);
                			}
                		}
                		$entryEventDetail->set_entryEventDetailStocks($entryEventDetailStocksTab);
						array_push($entryEventDetailsTab,$entryEventDetail);
						$entryEventDetailStocksTab 	= array ();
                	}
                }

                $entryEvent->set_entryEventDetails ($entryEventDetailsTab);

				$entryEventService 	= new \UTILE\EntryEventService () ;
				$return 			= $entryEventService->updateEntityById ($token,$entryEvent)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /entry ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return);
		});


		$app->group('/product', function () use ($app) {

			$app->get('/:id', function ($id) use($app) {
				$logger 	= \Logger::getLogger(basename(__FILE__));
				$logger->debug('START /entry/product ----------');
				$return = array () ;
				try{
					$token 			= $app->request->headers->get('token');

					$entryEventService 	= new \UTILE\EntryEventService () ;
					$return 			= $entryEventService->getEntryEventDetailStockById ($token, $id) 	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /entry/product ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return);
			});

			$app->delete('/', function () use($app) {
				$logger 	= \Logger::getLogger(basename(__FILE__));
				$logger->debug('START /entry/product ----------');
				$return = array () ;
				try{
					$token 					= $app->request->headers->get('token');
					$entryEventDetailId 	= $app->request->params('entry_event_detail_id');
					$logger->debug($entryEventDetailId);

					$entryEventService 		= new \UTILE\EntryEventService () ;
					$return 				= $entryEventService->deleteProductFromEntryEvent ($token,$entryEventDetailId)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /entry/product ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return);
			});

			$app->put('/', function () use($app) {
				$logger 	= \Logger::getLogger(basename(__FILE__));
				$logger->debug('START /entry/product ----------');
				$return = array () ;
				try{
					$token 					= $app->request->headers->get('token');
					$body 					= $app->request->getBody();
			    	$dataBody 				= json_decode($body,true);

					$productId 				= $dataBody['product_id'];
					$rangeDetailId 			= $dataBody['range_detail_id'];
					$entryEventDetailId 	= $dataBody['entry_event_detail_id'];
					$newValue				= $dataBody['new_value'] ;

					$entryEventService 		= new \UTILE\EntryEventService () ;
					$return 				= $entryEventService->updateStockProductRangeOfEntryEvent (	$token,
																										$productId 				,
																										$entryEventDetailId 	,
																										$rangeDetailId 			,
																										$newValue
																									)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /entry/product ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return);
			});

		});

		$app->group('/print', function () use ($app) {

			$app->get('/:id', function ($id) use($app) {
				$logger 	= \Logger::getLogger(basename(__FILE__));
				$logger->debug('START /entry/print ----------');
				$return = array () ;
				try{
					$token 			= $app->request->headers->get('token');
					$ratePrice 		= $app->request->params('rate_price');
					$purchasePrice 	= $app->request->params('purchase_price');

					$entryEventService 		= new \UTILE\EntryEventService () ;
					$return 				= $entryEventService->printCurrentEntryEvent (	$token 			,
																							$id 			,
																							$ratePrice 		,
																							$purchasePrice
																		  				);

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /entry/print ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return);

			});
		});

		// query lists
		$app->get('/', function () use($app) {
			$logger 	= \Logger::getLogger(basename(__FILE__));
			$logger->debug('START /entry ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');
				$companyId 		= $app->request->params('company_id');

				$criteria		= new \UTILE\CriteriaEntryEvent () ;
				$criteria->set_numInfValue($app->request->params('num_inf_value'));
				$criteria->set_startDate($app->request->params('start_date'));
				$criteria->set_endDate($app->request->params('end_date'));

				$entryEventService 	= new \UTILE\EntryEventService () ;
				$return 			= $entryEventService->getAllEntryEventsByCriteria ($token,$companyId,$criteria)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /entry ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return);
		});

		$app->get('/:id', function ($id) use($app) {
			$logger 	= \Logger::getLogger(basename(__FILE__));
			$logger->debug('START /entry ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');
				$companyId 		= $app->request->params('company_id');
				$nbElements 	= $app->request->params('nb_elements');
				$page 			= $app->request->params('current_page');

				$entryEventService 	= new \UTILE\EntryEventService () ;
				$return 			= $entryEventService->getEntryEventByIdAndByPage ($token, $id, /*$nbElements, $page*/0, 0) 	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /entry ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return);
		});

		$app->delete('/', function () use($app) {
			$logger 	= \Logger::getLogger(basename(__FILE__));
			$logger->debug('START /entry ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');
				$entryEventId 	= $app->request->params('entry_event_id');

				$entryEventService 		= new \UTILE\EntryEventService () ;
				$return 				= $entryEventService->deleteEntityById ($token,$entryEventId)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  	 			$app->response()->status(401);
  			}
  		 	$logger->debug('END /entry ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return);
		});
	});

?>
