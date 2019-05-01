<?php

	$app->group('/product', function () use ($app) {

		$app->group('/exist', function () use ($app) {
			$app->get('/:ref', function ($ref) use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /product/exist ----------');
				$return = array () ;
				try{
					$token 			= $app->request->headers->get('token');

					$productService = new \UTILE\ProductService () ;
					$return 		= $productService->isProductExistByRef ($token, $ref)	;	

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  			 		$app->response()->status(401);
  			 	}
  			 	$logger->debug('END /product/exist ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return);
			});
		});

		$app->group('/stats', function () use ($app) {
			
			$app->get('/', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /product/stats ----------');
				$return = array () ;
				try{
					$token 			= $app->request->headers->get('token');
					$clientId 		= $app->request->params('product_id') ;

					$productService = new \UTILE\ProductService () ;
					$return 		= $productService->getStatsById ($token, $clientId)	;	

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  			 		$app->response()->status(401);
  			 	}
  			 	$logger->debug('END /product/stats ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return);

			});
		});

		$app->group('/search', function () use ($app) {
			$app->post('/', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /product/search ----------');
				$return = array () ;
				try{
					$token 		= $app->request->headers->get('token');
					$body 		= $app->request->getBody();
			    	$dataBody 	= json_decode($body,true);

					$criteria 	= new \UTILE\CriteriaProduct () ;
					$criteria->set_companyId($dataBody['company_id']);
					$criteria->set_refDescValue(isset($dataBody['ref_desc']) ? $dataBody['ref_desc'] : '');
					$criteria->set_categories(isset($dataBody['categories']) ? $dataBody['categories'] : '');
					$criteria->set_brands(isset($dataBody['brands']) ? $dataBody['brands']: '');
					$criteria->set_sports(isset($dataBody['sports']) ? $dataBody['sports'] : '');
					$criteria->set_genders(isset($dataBody['genders']) ? $dataBody['genders'] : '');
					$criteria->set_color(isset($dataBody['color']) ? $dataBody['color'] : '');
					$criteria->set_entryEventInformation(isset($dataBody['entry_event_information']) ? $dataBody['entry_event_information']: '');
					$criteria->set_entryEventDate(isset($dataBody['entry_event_date']) ? $dataBody['entry_event_date'] : '');
					$criteria->set_entryEventAfterBefore(isset($dataBody['entry_event_after_before']) ? $dataBody['entry_event_after_before'] : '');
					$criteria->set_aisle(isset($dataBody['aisle']) ? $dataBody['aisle'] : '');
					$criteria->set_palette(isset($dataBody['palette']) ? $dataBody['palette'] : '');
					$criteria->set_qtrExhausted(isset($dataBody['qtr_exhausted']) ? $dataBody['qtr_exhausted'] : '0');
					$criteria->set_qteMin(isset($dataBody['qte_min']) ? $dataBody['qte_min'] : '1');
					$criteria->set_qteMax(isset($dataBody['qte_max']) ? $dataBody['qte_max'] : '');
					$criteria->set_isNoPictures(isset($dataBody['is_no_pictures']) ? $dataBody['is_no_pictures'] : '0');

			    	$criteria->set_renderingType(isset($dataBody['format']) ? $dataBody['format'] : 1);
			    	$criteria->set_isImages(isset($dataBody['is_images']) ? $dataBody['is_images'] : 1);
			    	$criteria->set_isPAchat(isset($dataBody['purchase_price']) ? $dataBody['purchase_price'] : 1);
			    	$criteria->set_isPTarif(isset($dataBody['rate_price']) ? $dataBody['rate_price'] : 1);
			    	$criteria->set_isPPublic(isset($dataBody['public_price']) ? $dataBody['public_price'] : 1);
			    	$criteria->set_isPVanam(isset($dataBody['vanam_price']) ? $dataBody['vanam_price'] : 1);
			    	$criteria->set_isZonage(isset($dataBody['is_zonage']) ? $dataBody['is_zonage'] : 1);
			    	$criteria->set_isByZone(isset($dataBody['is_by_zone']) ? $dataBody['is_by_zone'] : 1);
			    	$criteria->set_formatStock(isset($dataBody['format_stock']) ? $dataBody['format_stock'] : 1);
			    	$criteria->set_lissage(isset($dataBody['lissage']) ? $dataBody['lissage'] : 0);

			    	$criteria->set_withStock(isset($dataBody['with_stock']) ? $dataBody['with_stock'] : 0);

					$productService = new \UTILE\ProductService () ;
					$return 		= $productService->getProductsByCriteria ($token, $criteria)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /product/search ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
		});

		$app->group('/utils', function () use ($app) {

			$app->put('/zonage', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /product/zonage ----------');
				$return = array () ;
				try{
					$token 			= $app->request->headers->get('token');
					$body 			= $app->request->getBody();
			 	    $dataBody 		= json_decode($body,true);

				    $locationBean	= new \UTILE\Location ();

				    $locationBean->set_productId($dataBody['product_id']);
				    $locationBean->set_aisle($dataBody['aisle']);
				    $locationBean->set_palette($dataBody['palette']);

					$productService = new \UTILE\ProductService () ;
					$return 		= $productService->updateProductZonage($token,$locationBean)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}	
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /product/stock ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 

			});
			
		});

		$app->group('/picture', function () use ($app) {

			$app->post('/', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /product/picture ----------');
				$return = array () ;
				try{
					$token 		= $app->request->headers->get('token');
				    $product	= new \UTILE\Product ();
					$product->set_id($app->request->params('product_id'));
			 	   	$files 		= $_FILES['picture'];

					$productService = new \UTILE\ProductService () ;
					$return 		= $productService->addPicturesForProduct ($token,$product,$files)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}	
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /product/picture ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});

			$app->post('/default', function () use($app) { 
				$logger 	= \Logger::getLogger(basename(__FILE__));	
				$logger->debug('START /product/picture/default ----------');
				$return = array () ;
				try{
					$token 		= $app->request->headers->get('token');
				    $product	= new \UTILE\Product ();
					$body 		= $app->request->getBody();
			 	    $dataBody 	= json_decode($body,true);

				    $pictureId  = $dataBody['picture_id'] ;
				    $productId 	= $dataBody['product_id'] ;

					$productService = new \UTILE\ProductService () ;
					$return 		= $productService->updateDefaultPicturesOfProduct ($token,$productId,$pictureId)	;

				} catch (Exception $e){
					$logger->debug($e);
					$app->response()->status(400);
					$app->response()->header('X-Status-Reason', $e->getMessage());
				}
				if ($return['success'] == "false") {
  		 			$app->response()->status(401);
  		 		}
  		 		$logger->debug('END /product/picture/default ----------');
				$app->response()->header('Content-Type', 'application/json');
				echo json_encode($return); 
			});
			
			$app->delete('/', function () use ($app){
    			$logger = \Logger::getLogger(basename(__FILE__));
        		$logger->debug('START /product/picture ----------');
        		$return = array ();
        		try{
					$body 			= $app->request->getBody();
	        		$dataBody 		= json_decode($body,true);
					$pictureId 		= $dataBody['picture_id']	;
        			$token 			= $app->request->headers->get('token');
            		$productService = new \UTILE\ProductService();
            		$return         = $productService->deletePictureFromProductCatalog($token,$pictureId);
        		} catch(Exception $e){
        			$logger->debug($e);
            		$app->response()->status(400);
            		$app->response()->header('X-Status-Reason', $e->getMessage());
            		$return = array("success"=>'false',"msg"=>$e->getMessage());
        		}
        		$logger->debug('END /product/picture ----------');
        		if ($return['success'] == "false") {
        			$app->response()->status(401);
        		}
        		$app->response()->header('Content-Type', 'application/json');
        		echo json_encode($return);
   			});	
		
		});

		$app->post('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /product ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $product	= new \UTILE\Product ();	 			

			    $product->set_companyId($dataBody['company_id']);
			    $product->set_categoryId($dataBody['category_id']);
			    $product->set_reference($dataBody['reference']);
			    $product->set_description($dataBody['description']);
			    $product->set_brandId($dataBody['brand_id']);
			    $product->set_rangeId($dataBody['range_id']);
			    $product->set_genderId(isset($dataBody['gender_id']) ? $dataBody['gender_id'] : "");
			    $product->set_sportId(isset($dataBody['sport_id']) ? $dataBody['sport_id'] :"");
			    $product->set_color(isset($dataBody['color']) ? $dataBody['color'] : "");
			    $product->set_salePublicPrice(isset($dataBody['sale_public_price']) ? $dataBody['sale_public_price'] : 0);
			    $product->set_saleVanamPrice(isset($dataBody['sale_vanam_price']) ? $dataBody['sale_vanam_price']: 0);
			    $product->set_saleRatePublic(isset($dataBody['sale_rate_public']) ? $dataBody['sale_rate_public'] : 0);

			    if 	(	isset($dataBody['aisle']) && 
			    		isset($dataBody['palette'])
			    	) {
			    	
			    	$location	= new \UTILE\Location ();	
			   		$location->set_zonageCityId(isset($dataBody['zonage_city_id']) ? $dataBody['zonage_city_id'] : 1 ); 			
			    	$location->set_aisle($dataBody['aisle']); 			
			    	$location->set_palette($dataBody['palette']); 			

			    	$product->set_locationProduct($location);
			    }
			   

				$productService = new \UTILE\ProductService () ;
				$return 		= $productService->addNewEntity ($token,$product)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /product ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->put('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /product ----------');
			$return = array () ;
			try{
				$token 		= $app->request->headers->get('token');
				$body 		= $app->request->getBody();
			    $dataBody 	= json_decode($body,true);

			    $product	= new \UTILE\Product ();	 			

			    $product->set_id($dataBody['product_id']);
			    $product->set_categoryId($dataBody['category_id']);
			    $product->set_reference($dataBody['reference']);
			    $product->set_description($dataBody['description']);
			    $product->set_brandId($dataBody['brand_id']);
			    $product->set_rangeId($dataBody['range_id']);
			    $product->set_genderId($dataBody['gender_id']);
			    $product->set_sportId($dataBody['sport_id']);
			    $product->set_color(isset($dataBody['color']) ? $dataBody['color'] : "");
			    $product->set_salePublicPrice(isset($dataBody['sale_public_price']) ? $dataBody['sale_public_price'] : 0);
			    $product->set_saleVanamPrice(isset($dataBody['sale_vanam_price']) ? $dataBody['sale_vanam_price'] : 0);
			    $product->set_saleRatePublic(isset($dataBody['sale_rate_public']) ? $dataBody['sale_rate_public'] : 0);

			    if 	(	isset($dataBody['aisle']) && 
			    		isset($dataBody['palette'])
			    	) {
			    	
			    	$location	= new \UTILE\Location ();	
			   		$location->set_zonageCityId(isset($dataBody['zonage_city_id']) ? $dataBody['zonage_city_id'] : 1 ); 			
			    	$location->set_aisle($dataBody['aisle']); 			
			    	$location->set_palette($dataBody['palette']); 			

			    	$product->set_locationProduct($location);
			    }

				$productService = new \UTILE\ProductService () ;
				$return 		= $productService->updateEntityById ($token,$product)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /product ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		

		$app->get('/:id', function ($id) use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /product/:id ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');
				$isEntryEvent 	= $app->request->params('is_entry_event');
				$productService = new \UTILE\ProductService () ;
				$return 		= $productService->getEntityById ($token, $id, $isEntryEvent)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /product/:id ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->get('/', function () use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /product ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');
				$companyId 		= $app->request->params('company_id');

				$productService = new \UTILE\ProductService () ;
				$return 		= $productService->getAllEntities ($token, $companyId)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /product ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});

		$app->delete('/:id', function ($id) use($app) { 
			$logger 	= \Logger::getLogger(basename(__FILE__));	
			$logger->debug('START /product ----------');
			$return = array () ;
			try{
				$token 			= $app->request->headers->get('token');

				$productService = new \UTILE\ProductService () ;
				$return 		= $productService->deleteEntityById ($token, $id)	;

			} catch (Exception $e){
				$logger->debug($e);
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
			if ($return['success'] == "false") {
  		 		$app->response()->status(401);
  		 	}
  		 	$logger->debug('END /product ----------');
			$app->response()->header('Content-Type', 'application/json');
			echo json_encode($return); 
		});
	});
 
?>