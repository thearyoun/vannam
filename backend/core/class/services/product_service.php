<?php

namespace UTILE;

class ProductService implements ProductInterface{
    
	public function __construct(){

	}
	
	public function addNewEntity ($key, $productBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [PRODUCT] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			\R::begin();

				$product 						= \R::dispense('products');
				$product->company_id 			= $productBean->get_companyId();
				$product->reference  			= $productBean->get_reference();
				$product->description   		= $productBean->get_description();
				$product->category_id   		= $productBean->get_categoryId();
				$product->brand_id	   		 	= $productBean->get_brandId();
				$product->range_id				= $productBean->get_rangeId();
				$product->gender_id				= $productBean->get_genderId();
				$product->sport_id				= $productBean->get_sportId();
				$product->color 				= $productBean->get_color();
				$product->sale_public_price		= $productBean->get_salePublicPrice();
				$product->sale_vanam_price		= $productBean->get_saleVanamPrice();
				$product->sale_rate_public		= $productBean->get_saleRatePublic();
	
				$idProduct 						= \R::store($product);
				
				if (!empty($productBean->get_locationProduct()->get_aisle()) &&
					!empty($productBean->get_locationProduct()->get_palette())
					) {
					$location						= \R::dispense('productlocations');	
					$location->product_id			= $idProduct;
					$location->user_id				= $token['user_id'] ;
					$location->zonage_city_id 		= $productBean->get_locationProduct()->get_zonageCityId();
					$location->aisle 				= $productBean->get_locationProduct()->get_aisle();
					$location->palette 				= $productBean->get_locationProduct()->get_palette();
					$idLocation						= \R::store($location);
				}
					

				$allRangeDetails = \R::getAll ('select * from rangedetails where range_id = :id',
												array (":id"=>$productBean->get_rangeId())
											  );
				if (!empty($allRangeDetails)) {
					foreach ($allRangeDetails as $rangeDetail) {
						$pStock 					= \R::dispense('productstocks');
						$pStock->product_id 		= $idProduct ;
						$pStock->range_detail_id 	= $rangeDetail['id'] ;
						$pStock->value 				= 0;
						$idPStock = \R::store ($pStock);
					}
				}

			\R::commit();

			$return = array("success"=>'true',"msg"=> "Le produit est ajouté avec succés.","id" => $idProduct);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [PRODUCT] ------- ");
		return $return;	
	}

	public function updateEntityById ($key, $productBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [PRODUCT] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			\R::begin();

				$product 						= \R::load('products',$productBean->get_id());
				$product->reference  			= $productBean->get_reference();
				$product->description   		= $productBean->get_description();
				$product->category_id   		= $productBean->get_categoryId();
				$product->brand_id	   		 	= $productBean->get_brandId();
				$product->range_id				= $productBean->get_rangeId();
				$product->gender_id				= $productBean->get_genderId();
				$product->sport_id				= $productBean->get_sportId();
				$product->color 				= $productBean->get_color();
				$product->sale_public_price		= $productBean->get_salePublicPrice();
				$product->sale_vanam_price		= $productBean->get_saleVanamPrice();
				$product->sale_rate_public		= $productBean->get_saleRatePublic();
	
				$idProduct 						= \R::store($product);
		
				if ($productBean->get_locationProduct()->get_aisle()   != "" && 
					$productBean->get_locationProduct()->get_palette() != ""
					) {
					$location						= \R::dispense('productlocations');	
					$location->product_id			= $idProduct;
					$location->user_id				= $token['user_id'] ;
					$location->zonage_city_id 		= $productBean->get_locationProduct()->get_zonageCityId();
					$location->aisle 				= $productBean->get_locationProduct()->get_aisle();
					$location->palette 				= $productBean->get_locationProduct()->get_palette();
					$idLocation						= \R::store($location);
				}

				/*\R::exec ("DELETE FROM productstocks WHERE product_id = {$productBean->get_id()}");
				$allRangeDetails = \R::getAll ('select * from rangedetails where range_id = :id',
												array (":id"=>$productBean->get_rangeId())
											  );
				if (!empty($allRangeDetails)) {
					foreach ($allRangeDetails as $rangeDetail) {
						$pStock 					= \R::dispense('productstocks');
						$pStock->product_id 		= $productBean->get_id() ;
						$pStock->range_detail_id 	= $rangeDetail['id'] ;
						$pStock->value 				= 0;
						$idPStock = \R::store ($pStock);
					}
				}*/
					

			\R::commit();

			$return = array("success"=>'true',"msg"=> "Le produit est modifié avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateEntityById [PRODUCT] ------- ");
		return $return;	
	}

	// get product when selected
	public function getEntityById ($key, $productId, $isEntryEvent = false ) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getEntityById [PRODUCT] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$product = \R::getRow ('
				SELECT p.*, t_stocks.qtr, b.name brand, ctg.name category, t_stocks.qtr - IF (t_s.qte IS NULL , 0 , t_s.qte)  qtt,t_evd.max_buying_price,t_evd.min_buying_price
				FROM products p
				LEFT JOIN (
					SELECT SUM(value) qtr, product_id
					FROM productstocks 
					WHERE entry_event_detail_id IS NULL
					GROUP BY product_id 
				) AS t_stocks ON t_stocks.product_id = p.id
				LEFT JOIN ( 
					SELECT MAX(purchase_price) max_buying_price, MIN(purchase_price) min_buying_price, product_id 
					FROM entryeventdetails 
					GROUP BY product_id  
				) AS t_evd ON t_evd.product_id = p.id
				LEFT JOIN ( 
					SELECT SUM(cmdds.value) qte, cmdd.product_id 
					FROM commanddetailstocks cmdds
                    LEFT JOIN commanddetails cmdd ON cmdd.id=cmdds.command_detail_id
                    WHERE cmdd.command_id NOT IN (SELECT command_id FROM invoices)
					GROUP BY cmdd.product_id 
				) AS t_s ON t_s.product_id = p.id
				LEFt JOIN brands b ON b.id = p.brand_id
				LEFT JOIN categories ctg ON ctg.id = p.category_id
				WHERE p.id=:id',array (':id'=>$productId)
			) ;
			if (!empty($product)) {
				$isAnyEntryEventForProduct 		= \R::getRow("	SELECT COUNT(id) nb 
																FROM entryeventdetails 
																WHERE product_id = :id ",
														array (':id'=>$productId)
														) ; 
				$product['is_ok_change_range'] 	= $isAnyEntryEventForProduct['nb'] == 0 ? true : false;
				//product ranges array
				$product['ranges'] = \R::getAll(" select rd.id, rd.name from
													products as p inner join ranges as r on p.range_id = r.id
													inner join rangedetails as rd on r.id = rd.range_id
													where p.id=:id order by rd.id
				", array (':id'=>$productId));

				//product location array
				$product['location'] = \R::getAll ("SELECT pl.id, CONCAT(zc.trigram, pl.aisle, pl.palette) zonage,
															pl.aisle, pl.palette,
															CONCAT(u.name,' ',u.firstname) name, 
															DATE_FORMAT(pl.insert_date,'%d/%m/%Y') date
													FROM productlocations pl 
													JOIN users u ON u.id = pl.user_id 
													JOIN zonagecities zc ON zc.id = pl.zonage_city_id
													WHERE product_id=:id ORDER BY id DESC LIMIT 6",
													array (':id'=>$productId)
											   ) ;
				$product['pictures'] = \R::getAll ("select id, is_default, concat('pictures/thumbnails/', product_id,'/',name) url_picture,concat('pictures/originals/',product_id,'/', name) original_url_picture
														from productpictures where product_id = :id",array(':id'=>$productId));
				$unionSqlStatment = "ORDER BY id ASC" ;

				if ($isEntryEvent) {
					$unionSqlStatment = "UNION
									SELECT NULL AS id, '{$productId}' AS product_id, id AS range_detail_id, name, 0 qtr, 0 qtt 
									FROM rangedetails 
									WHERE id NOT IN ( 
										SELECT range_detail_id 
										FROM productstocks 
										WHERE product_id = :id 
									) 
									AND range_id = (
										SELECT DISTINCT range_id 
										FROM rangedetails 
										WHERE id IN (
											SELECT range_detail_id 
											FROM productstocks 
											WHERE product_id = :id
										) 
									)
									ORDER BY ISNULL(id), id ASC" ;
				}
				
				$product['stock']    = \R::getAll ("
					SELECT 	ps.id, ps.product_id, ps.range_detail_id, rd.name, ps.value qtr, 
							ps.value - IF (t_s.qte IS NULL , 0 , t_s.qte)  qtt 
					FROM productstocks ps 
					JOIN rangedetails rd on rd.id = ps.range_detail_id
					LEFt JOIN (
						SELECT SUM(cmdds.value) qte, cmdds.range_detail_id, cmdd.product_id 
						FROM commanddetailstocks cmdds
						LEFT JOIN commanddetails cmdd ON cmdd.id=cmdds.command_detail_id
						WHERE cmdd.command_id NOT IN (SELECT command_id FROM invoices)
						GROUP BY cmdds.range_detail_id,product_id 
					) AS t_s ON (t_s.range_detail_id = ps.range_detail_id AND t_s.product_id = ps.product_id)
					WHERE ps.product_id = :id 
					AND entry_event_detail_id IS NULL 
					
					{$unionSqlStatment}",
					array(':id'=>$productId));
				$return = array(	"success"	=> 'true'								,
									"msg" 		=> "Le produit est récupéré avec succés."	,
									"product"	=> $product
								);
			}
			else {
				$return = array(	"success"	=> 'false'								,
									"msg" 		=> "Erreur de récupération de produit."	,
									"product"	=> null
								);
			}
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getEntityById [PRODUCT] ------- ");
		return $return;	
	}

	public function getProductRange($key, $rangeId, $productId)
	{
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [PRODUCT] ------- ");

		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();

		$return 		= array ();
		if ($currentTime < $token['validation_date']){
			$products = \R::getAll ("select p.reference,p.id,p.description,t_pictures.url_picture 
										from products p 
										left join ( SELECT  product_id, id ,
													concat('pictures/thumbnails/',product_id,'/',name) url_picture
												FROM productpictures 
													WHERE is_default = 1) as t_pictures
										ON t_pictures.product_id = p.id
										where p.company_id = :id
										and p.status = 1
										",array (":id"=>$companyId));
			$return = array(	"success"	=> 'true'								,
								"msg" 		=> "Récupération de la liste de produits avec succès."	,
								"products"	=> $products
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [PRODUCT] ------- ");
		return $return;	
	}

	public function getAllEntities($key, $companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [PRODUCT] ------- ");

		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();

		$return 		= array ();
		//if ($currentTime < $token['validation_date']){
		if(true){
			$products = \R::getAll ("select p.reference,p.id,p.description,t_pictures.url_picture 
										from products p 
										left join ( SELECT  product_id, id ,
													concat('pictures/thumbnails/',product_id,'/',name) url_picture
												FROM productpictures 
													WHERE is_default = 1) as t_pictures
										ON t_pictures.product_id = p.id
										where p.company_id = :id
										and p.status = 1
										",array (":id"=>$companyId));
			$return = array(	"success"	=> 'true'								,
								"msg" 		=> "Récupération de la liste de produits avec succès."	,
								"products"	=> $products
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [PRODUCT] ------- ");
		return $return;	
	}

	public function deleteEntityById ($key, $productId){
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [PRODUCT] ------- ");

		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();
		$return 		= array ();
		if ($currentTime < $token['validation_date']){

			$product 			= \R::load ("products" ,$productId);
			$product->status 	= 0 ;
			$idProduct 			= \R::store ($product);

			$return = array(	"success"	=> 'true'								,
								"msg" 		=> "Suppression du produit avec succès."
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [PRODUCT] ------- ");
		return $return;	
	}

	public function getProductsByCriteria ($key, $criteria) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getProductsByCriteria [PRODUCTS] ------- ");

		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();

		$return 		= array ();
		if ($currentTime < $token['validation_date']){
			$additionnelIn		= "";
			$typeStockLeftJoin 	= "	LEFT JOIN (
										SELECT sum(value) qtr , product_id 
										FROM productstocks 
										WHERE entry_event_detail_id IS NULL
										GROUP BY product_id 
									) AS t_stocks 
										ON t_stocks.product_id = p.id
									LEFT JOIN (	
										SELECT group_concat(concat('[',rd.name,'>',ps.value,']') SEPARATOR '#') stocks,ps.product_id 
										FROM productstocks ps 
										JOIN rangedetails rd ON rd.id=ps.range_detail_id 
										WHERE entry_event_detail_id IS NULL
										GROUP BY ps.product_id 
									) AS t_product_stocks 
										ON t_product_stocks.product_id = p.id" ;

			if (!empty($criteria->get_idDevis())) {
				$typeStockLeftJoin = "	LEFT JOIN (
											SELECT sum(qtds.value) qtr , qtd.product_id 
											FROM quotationdetailstocks qtds
											JOIN quotationdetails qtd ON qtd.id = qtds.quotation_detail_id
											GROUP BY qtd.product_id , qtd.id 
										) AS t_stocks ON t_stocks.product_id = p.id
										LEFT JOIN (	
											SELECT GROUP_CONCAT(CONCAT('[',rd.name,'>',qtds.value,']') SEPARATOR '#') stocks,qtd.product_id,qtd.sale_price 
											FROM quotationdetailstocks qtds 
											JOIN rangedetails rd ON rd.id=qtds.range_detail_id 
											JOIN quotationdetails qtd ON qtd.id = qtds.quotation_detail_id
											WHERE qtds.value > 0
											AND qtd.quotation_id = {$criteria->get_idDevis()}
											GROUP BY qtd.product_id,qtd.id 
										) as t_product_stocks ON t_product_stocks.product_id = p.id
										LEFT JOIN changes ch ON ch.id = (SELECT change_id FROM quotations WHERE id ={$criteria->get_idDevis()} )
										" ;
				$additionnelIn = ", t_product_stocks.sale_price , ch.name change_name ";
			}

			if (!empty($criteria->get_idCommand())) {
				$typeStockLeftJoin = "	
					LEFT JOIN (
						SELECT SUM(cmdds.value) qtr , cmdd.product_id 
						FROM commanddetailstocks cmdds
						JOIN commanddetails cmdd ON cmdd.id = cmdds.command_detail_id
						WHERE cmdd.command_id NOT IN (SELECT command_id FROM invoices)
						GROUP by cmdd.product_id , cmdd.id 
					) AS t_stocks ON t_stocks.product_id = p.id
					LEFT JOIN (	
						SELECT group_concat(concat('[',rd.name,'>',cmdds.value,']') SEPARATOR '#') stocks,cmdd.product_id,cmdd.sale_price,cmdd.command_id 
						FROM commanddetailstocks cmdds 
						JOIN rangedetails rd ON rd.id=cmdds.range_detail_id 
						JOIN commanddetails cmdd ON cmdd.id = cmdds.command_detail_id
						AND cmdds.value > 0
						GROUP BY cmdd.product_id, cmdd.id 
					) AS t_product_stocks ON ( t_product_stocks.product_id = p.id AND t_product_stocks.command_id = {$criteria->get_idCommand()})
					LEFT JOIN changes ch ON ch.id = (
						SELECT change_id 
						FROM commands 
						WHERE id ={$criteria->get_idCommand()} 
					) 
					LEFT JOIN (	
						SELECT sum(cmds.value) qte_stock_current_cmd, cmd.product_id AS product_id_stock_current_cmd,cm.transport_amount 
						FROM commanddetailstocks cmds 
						LEFT JOIN commanddetails cmd ON cmd.id = cmds.command_detail_id 
						LEFT JOIN commands cm ON cm.id=cmd.command_id
						WHERE cmd.command_id ={$criteria->get_idCommand()} 
						GROUP BY cmd.product_id 
					) AS t_stock_current_cmd ON t_stock_current_cmd.product_id_stock_current_cmd = p.id
					" ;
				$additionnelIn = ", t_product_stocks.sale_price, ch.name change_name,t_stock_current_cmd.qte_stock_current_cmd, transport_amount ";
			}

			$sqlSearch = "SELECT p.id,reference,description,c.name categorie,g.name gender,p.color,
								 b.name brand, s.name sport,t_locations.id id_location,p.sale_rate_public,
								 t_locations.aisle,t_locations.palette,t_pictures.url_picture,
								 concat(t_locations.aisle,t_locations.palette) location,
								 t_stocks.qtr,r.name range_name,p.sale_public_price,p.sale_vanam_price,
								 t_product_stocks.stocks,t_stocks.qtr - IF (t_stock_cmd.qte_stock_cmd IS NULL, 0, t_stock_cmd.qte_stock_cmd) qtt 
								 {$additionnelIn}
							FROM products p 
								JOIN categories c ON c.id=p.category_id
								JOIN genders g ON g.id=p.gender_id
								JOIN brands b ON b.id=p.brand_id
								LEFT JOIN sports s ON s.id=p.sport_id
								LEFT JOIN ranges r ON r.id=p.range_id
								LEFT JOIN ( 
									SELECT product_id,aisle,palette,id
									FROM productlocations 
									GROUP BY product_id HAVING MAX(id)
								) AS t_locations ON t_locations.product_id = p.id 
								LEFT JOIN ( 
									SELECT  product_id, id, is_default,
									CONCAT('pictures/thumbnails/',product_id,'/',name) url_picture
									FROM productpictures 
									HAVING is_default = 1
								) AS t_pictures ON  t_pictures.product_id = p.id	
								LEFT JOIN (	
									SELECT sum(cmds.value) qte_stock_cmd, cmd.product_id AS product_id_stock_cmd 
									FROM commanddetailstocks cmds 
									LEFT JOIN commanddetails cmd ON cmd.id = cmds.command_detail_id 
									WHERE cmd.command_id NOT IN (
										SELECT command_id 
										FROM invoices
									)
									GROUP BY cmd.product_id 
								) AS t_stock_cmd ON t_stock_cmd.product_id_stock_cmd = p.id
								{$typeStockLeftJoin}
							WHERE p.company_id=:id 
							" ;
			$bounds 	= array (':id'=>$criteria->get_companyId()) ;
			
			if (!empty($criteria->get_refDescValue())) {
				$sqlSearch 			.= " AND (p.reference LIKE '%{$criteria->get_refDescValue()}%' OR description LIKE '%{$criteria->get_refDescValue()}%')";
			}

			if (!empty($criteria->get_categories())) {
				$str 						= implode(',',$criteria->get_categories());
				$sqlSearch 					.= ' AND p.category_id IN ('.$str.')';
			}

			if (!empty($criteria->get_brands())) {
				$str 						= implode(',',$criteria->get_brands());
				$sqlSearch 					.= ' AND p.brand_id IN ('.$str.')';
			}

			if (!empty($criteria->get_sports())) {
				$str 						= implode(',',$criteria->get_sports());
				$sqlSearch 					.= ' AND p.sport_id IN ('.$str.')';
			}

			if (!empty($criteria->get_genders())) {
				$str 						= implode(',',$criteria->get_genders());
				$sqlSearch 					.= ' AND p.gender_id IN ('.$str.')';
			}

			if (!empty($criteria->get_color())) {
				$sqlSearch 			.= " AND p.color LIKE '%{$criteria->get_color()}%'";
			}

			if (!empty($criteria->get_entryEventInformation()) ||
				!empty($criteria->get_entryEventDate())) {
				$andEntryEventInformation = "" ;
				if (!empty($criteria->get_entryEventInformation())) {
					$andEntryEventInformation = "AND ( cast(id AS char(50)) LIKE '%{$criteria->get_entryEventInformation()}%'  
													OR information LIKE '%{$criteria->get_entryEventInformation()}%'
												) " ;
				}
				$andEntryEventDate = "" ;
				if (!empty($criteria->get_entryEventDate())) {
					$andEntryEventDate = "AND DATE_FORMAT(insert_date,'%Y/%m/%d') {$criteria->get_entryEventAfterBefore()}= '{$criteria->get_entryEventDate()}' " ;
				}
				$sqlSearch 			.= " AND p.id IN  (	SELECT product_id 
															FROM entryeventdetails 
																WHERE entry_event_id IN (
																	SELECT id 
																		FROM entryevents 
																			WHERE 1=1
																				{$andEntryEventInformation}
																				{$andEntryEventDate}
															)	
													) ";
			}
			
			if (!empty($criteria->get_aisle()) || !empty($criteria->get_palette())) {
				$andAisle = "" ;
				if (!empty($criteria->get_aisle())) {
					$sqlSearch .= " AND t_locations.aisle LIKE '%{$criteria->get_aisle()}%' " ;
				}

				$andPalette = "" ;
				if (!empty($criteria->get_palette())) {
					$sqlSearch .= " AND t_locations.palette LIKE '%{$criteria->get_palette()}%' " ;
				}

			}
			
			if (empty($criteria->get_idDevis()) && empty($criteria->get_idCommand())) {
				$sqlSearch .= " AND p.status = 1 ";
				if ($criteria->get_qtrExhausted()) {
					$sqlSearch 	.= " AND ( qtr = 0 or qtr IS NULL ) ";
				}
				else {
					$sqlSearch 	.= " AND qtr > 0 ";
				}
			}
			
			if ($criteria->get_qteMin() > 0) {
				$sqlSearch 	.= " AND t_stocks.qtr - IF (t_stock_cmd.qte_stock_cmd IS NULL, 0, t_stock_cmd.qte_stock_cmd) >= {$criteria->get_qteMin()} ";
			}
			if ($criteria->get_qteMax() > 0) {
				$sqlSearch 	.= " AND t_stocks.qtr - IF (t_stock_cmd.qte_stock_cmd IS NULL, 0, t_stock_cmd.qte_stock_cmd) <= {$criteria->get_qteMax()} ";
			}

			if ($criteria->get_isNoPictures()) {
				$sqlSearch 	.= " AND url_picture IS NULL ";
			}

			if (!empty($criteria->get_idDevis())) {
				$sqlSearch 	.= " AND p.id IN ( SELECT product_id FROM quotationdetails WHERE quotation_id ={$criteria->get_idDevis()} ) ";
			}

			if (!empty($criteria->get_idCommand())) {
				$sqlSearch 	.= " AND p.id IN ( SELECT product_id FROM commanddetails where command_id ={$criteria->get_idCommand()} ) ";
			}

			$authorization = \R::getRow("select * from authorization where user_id = :id", array (":id"=>$token['user_id']));
			if ($authorization['role_id'] == 4) {
				$sqlSearch 	.= " AND p.brand_id in (select brand_id from clientbrands where client_id = {$authorization['client_id']}) ";
				$sqlSearch 	.= " AND p.category_id in (select category_id from clientcategories where client_id = {$authorization['client_id']}) ";
			}
			$sqlSearch 	.= " GROUP BY p.id ";

			$products 			= \R::getAll ($sqlSearch,$bounds) ;

			$typeDocument 		= 1 ;
			$printWithHeader 	= true ;

			if(!empty($criteria->get_idDevis())) {
				$typeDocument = 2 ;
				if ($criteria->get_header() == 0) {
					$printWithHeader = false ;
				}
			}

			if(!empty($criteria->get_idCommand())) {
				$typeDocument = 3 ;
				if ($criteria->get_header() == 0) {
					$printWithHeader = false ;
				}
			}

			if ($criteria->get_renderingType() == 0) {
				if ($criteria->get_withStock()) {
					if ($criteria->get_lissage() == 1) {
						$quotationService = new \UTILE\QuotationService() ;
						foreach ($products as &$product) {
							$lissageFlat 			= $quotationService->getQuotationLissageById ($key,$product['id'], $product['qtr'],'') ;
							$product['lissage'] 	= $lissageFlat['lissage'] ;
							$product['stock'] 		= $lissageFlat['stock'] ;
						}
					}
					if ($criteria->get_lissage() == 2) {
						$commandService = new \UTILE\CommandService() ;
						foreach ($products as &$product) {
							$lissageFlat 			= $commandService->getCommandLissageById ($key,$product['id'], $product['qtr'],'') ;
							$product['lissage'] 	= $lissageFlat['lissage'] ;
							$product['stock'] 		= $lissageFlat['stock'] ;
						}
					}
									
				}
				$return = array("success" 	=> 'true'											,
								"msg" 		=> "Liste des produits est récupérée avec succés."		,
								"products"	=> $products
								);
				
			}
			else if ($criteria->get_renderingType() == 1){
				$headerObject 				= \R::getRow ('select * from companies where id = :id',
															array (":id"=>$criteria->get_companyId())
															) ;
				$quotationInformationObject = \R::getRow ('select id,date_format(creation_date,"%d/%m/%Y") date ,client_id
															from quotations 
															where id = :id',
															array (":id"=>$criteria->get_idDevis())
															) ;
				$clientInformationObjectForQuotation = \R::getRow ('select  c.id,c.company_name, cad.postal_code,cad.city,cad.address
															from clients c
															left join clientaddresses cad on cad.client_id = c.id and is_billing_address = 1
															where c.id = :id',
															array (":id"=>$quotationInformationObject['client_id'])
															) ;

				$commandInformationObject = \R::getRow ('select id,date_format(creation_date,"%d/%m/%Y") date ,client_id, comment
															from commands 
															where id = :id',
															array (":id"=>$criteria->get_idCommand())
														) ;
				$clientInformationObjectForCommand = \R::getRow ('select  c.id,c.company_name, cad.postal_code,cad.city,cad.address
																	from clients c
																	left join clientaddresses cad on cad.client_id = c.id and is_billing_address = 1
																	where c.id = :id',
															array (":id"=>$commandInformationObject['client_id'])
														) ;

				$authorization = \R::getRow("select * from authorization where user_id = :id", array (":id"=>$token['user_id']));
				
				if (in_array($authorization['role_id'], array(3,4,5))) {
					$criteria->set_isPAchat(false) ;
				}

				$fileHelper = new \UTILE\FileHelper ();
        		$urlFile 	= $fileHelper->generatePdfFile( 	$products 									,
        														$token['user_id']							,
        														$criteria->get_isImages()					,
        														$criteria->get_isPAchat()					,
        														$criteria->get_isPTarif()					,
        														$criteria->get_isPPublic()					,
        														$criteria->get_isPVanam()					,
        														$criteria->get_isZonage()					,
																$criteria->get_isByZone()					,
																$criteria->get_isTransport()				,
        														$criteria->get_formatStock()				,
        														$typeDocument								,
        														$headerObject								,
        														$quotationInformationObject					,
        														$clientInformationObjectForQuotation		,
        														$commandInformationObject					,
        														$clientInformationObjectForCommand			,
        														$printWithHeader
        												   ) ;
				$return 	= array(	"success"	=> 'true'													,
										"msg"		=> "La liste des produits est récupérée avec succés."		,
										"url_file"	=> $urlFile
							 );
			}
			else if ($criteria->get_renderingType() == 2){

				$fileHelper = new \UTILE\FileHelper ();
        		$urlFile 	= $fileHelper->generateXlsxProductsFile(	$products 						,
        																$token['user_id']				,
        																$criteria->get_isImages()		,
        																$criteria->get_isPAchat()		,
        																$criteria->get_isPTarif()		,
        																$criteria->get_isPPublic()		,
        																$criteria->get_isPVanam()		,
        																$criteria->get_formatStock()	,
        																$typeDocument
        															) ;
				$return 	= array(	"success"	=> 'true'													,
										"msg"		=> "La liste des produits est récupérée avec succés."		,
										"url_file"	=> $urlFile
							 );
			}
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getProductsByCriteria [PRODUCTS] ------- ");
		return $return;	
	}

	public function addPicturesForProduct ($key, $product, $files) {

		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addPicturesForProduct [PRODUCTS] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			if (!empty($files)) {
				$toolsService = new \UTILE\ToolsService ();
				$outputOriginal = "pictures/originals/{$product->get_id()}/";
				$outputMiniature = "pictures/thumbnails/{$product->get_id()}/";

				if (!is_dir($outputOriginal)) {
					if (!mkdir($outputOriginal, 0777, true)) {
						$logger->debug("Erreur de création de dossier {$outputOriginal}");
   						return 	 array("success"=>'false',"msg"=> "Erreur de création de photo","err_code"=>"100");
					}
				}
				if (!is_dir($outputMiniature)) {
					if (!mkdir($outputMiniature, 0777, true)) {
   						$logger->debug("Erreur de création de dossier {$outputMiniature}");
   						return 	 array("success"=>'false',"msg"=> "Erreur de création de photo","err_code"=>"100");
					}
				}
				
				$index = 0 ;
				$currentDefaultPic = \R::getRow('select * from productpictures where product_id = :id and is_default = 1',array(':id'=>$product->get_id()));
				$isDefault = empty($currentDefaultPic) ?  false  : true ;

				foreach ($files['name'] as $name) {
					$rndName = substr(str_shuffle(md5(time())),0,5);
					move_uploaded_file($files['tmp_name'][$index], $outputOriginal.$rndName.$name);
					if (in_array(strtolower($files['type'][$index]),array('image/jpg','image/jpeg'))) {
						$exif = @exif_read_data($outputOriginal.$rndName.$name);
						try {
							if (empty($exif['SectionsFound'])) {
								$iof = new \ImageOrientationFix($outputOriginal.$rndName.$name);
								$iof->fix();
							} 
						} catch (Exception $e) {
							$logger->debug($e);
						}
					}

					$toolsService->createMiniatureForProduct(	220, 
																150,
																$files['type'][$index],
																$outputOriginal.$rndName.$name, 
																$outputMiniature.$rndName.$name) ;

					$picture 			 = \R::dispense ('productpictures');
					$picture->product_id = $product->get_id();
					$picture->name 		 = $rndName.$name ;
					if ($isDefault == false) {
						$picture->is_default 		 = 1 ;
						$isDefault = true ;
					}
					$idPicture			 = \R::store($picture);
					$index ++ ;

				}
			}
			$return = array("success"=>'true',"msg"=> "Les photos du produit sont ajoutées avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addPicturesForProduct [PRODUCTS] ------- ");
		return $return;	
	}

	public function deletePictureFromProductCatalog($key, $pictureId){
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deletePictureFromProductCatalog [PRODUCTS] ------- ");

		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();

		$return 		= array ();
		if ($currentTime < $token['validation_date']){

			$picture 			= \R::load('productpictures',$pictureId);
			$filePathOriginal 	= "/pictures/originals/{$picture['product_id']}/{$picture['name']}";
			$filePathMiniature 	= "/pictures/thumbnails/{$picture['product_id']}/{$picture['name']}";
			unlink (getcwd().$filePathOriginal);
			unlink (getcwd().$filePathMiniature);
			\R::trash($picture);
			$return = array("success"=>'true',"msg"=> "La photo du produit est supprimée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deletePictureFromProductCatalog [PRODUCTS] ------- ");
		return $return;
	}

	public function updateDefaultPicturesOfProduct ($key, $productId, $pictureId) {

		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateDefaultPicturesOfProduct [PRODUCTS] ------- ");

		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();

		$return 		= array ();
		if ($currentTime < $token['validation_date']){

			\R::begin() ;
				\R::exec('update productpictures set is_default = 0 where product_id = '.$productId);
				\R::exec('update productpictures set is_default = 1 where id = '.$pictureId);
			\R::commit();
			$return = array("success"=>'true',"msg"=> "Les photos du produit sont ajoutées avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateDefaultPicturesOfProduct [PRODUCTS] ------- ");
		return $return;	
	}

	public function updateProductZonage($key, $locationBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateProductZonage [PRODUCTS] ------- ");

		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$productLocation 					= \R::load ('productlocations',$locationBean->get_id());
			$productLocation->product_id 		= $locationBean->get_productId();
			$productLocation->zonage_city_id 	= 1;
			$productLocation->user_id 			= $token['user_id'];
			$productLocation->aisle 			= $locationBean->get_aisle();
			$productLocation->palette 			= $locationBean->get_palette();
			$idProductLocation	 				= \R::store($productLocation) ;
			$return 							= array("success"=>'true',"msg"=> "La location du produit est modifiée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateProductZonage [PRODUCTS] ------- ");
		return $return;	
	}

	public function getStatsById ($key, $productId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getStatsById [PRODUCTS] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){

			$sqlQuotations 	= "	SELECT 	qt.id, DATE_FORMAT(qt.creation_date,'%d/%m/%Y') creation_date, 
										if ( t_s.total is null , 0 , t_s.total ) total, t_s.qte_total, t_s.sale_price,
										cl.company_name
								FROM quotations qt 
								JOIN (	SELECT ROUND(SUM(qtds.value * qtd.sale_price),2) total, qtd.quotation_id, SUM(qtds.value) qte_total, qtd.sale_price
											FROM quotationdetailstocks qtds
            								LEFT JOIN quotationdetails qtd ON qtds.quotation_detail_id = qtd.id
            								WHERE qtd.product_id = :id
											GROUP BY qtd.quotation_id 
							  			) AS t_s ON t_s.quotation_id = qt.id
								JOIN clients cl ON cl.id = qt.client_id
								" ;
			$quotations 	= \R::getAll($sqlQuotations, array (":id" => $productId)) ;

			$sqlCommands 	= "	SELECT cmd.id, DATE_FORMAT(cmd.creation_date,'%d/%m/%Y') creation_date, 
								IF ( t_s.total IS NULL , 0 , t_s.total ) total, t_s.qte_total, t_s.sale_price,
								cl.company_name
								FROM commands cmd 
								JOIN ( SELECT ROUND(SUM(cmdds.value * cmdd.sale_price),2) total, cmdd.command_id, SUM(cmdds.value) qte_total, cmdd.sale_price
											FROM commanddetailstocks cmdds 
											LEFT JOIN commanddetails cmdd ON cmdds.command_detail_id = cmdd.id 
											WHERE cmdd.product_id = :id
											AND cmdd.command_id NOT IN (SELECT command_id FROM invoices WHERE is_visible = 1)
											GROUP BY cmdd.command_id 
										) AS t_s ON t_s.command_id = cmd.id 
								AND cmd.id NOT IN ( SELECT command_id FROM invoices WHERE is_visible = 1)
								JOIN clients cl ON cl.id = cmd.client_id" ;
			$commands 		= \R::getAll($sqlCommands, array (":id" => $productId)) ;

			$sqlInvoices 	= "	SELECT cmd.id, DATE_FORMAT(cmd.creation_date,'%d/%m/%Y') creation_date, 
								IF ( t_s.total IS NULL , 0 , t_s.total ) total, t_s.qte_total, t_s.sale_price,
								cl.company_name
								FROM commands cmd 
								JOIN ( SELECT ROUND(SUM(cmdds.value * cmdd.sale_price),2) total, cmdd.command_id, cmdd.command_id, SUM(cmdds.value) qte_total, cmdd.sale_price
											FROM commanddetailstocks cmdds 
											LEFT JOIN commanddetails cmdd ON cmdds.command_detail_id = cmdd.id 
											WHERE cmdd.product_id = :id
											AND cmdd.command_id NOT IN (SELECT command_id FROM invoices WHERE is_visible = 1)
											GROUP BY cmdd.command_id 
										) AS t_s ON t_s.command_id = cmd.id 
								AND cmd.id IN ( SELECT command_id FROM invoices WHERE is_visible = 1)
								JOIN clients cl ON cl.id = cmd.client_id" ;
			$invoices 		= \R::getAll($sqlCommands, array (":id" => $productId)) ;	

			$stats 			= array ("quotations" => $quotations, "commands" => $commands, "invoices" => $invoices) ;		

			$return 		= array(	"success"	=> 'true'											,
										"msg"		=> "Les stats produits sont récupérés avec succés."	,	
										"stats" 	=> $stats	
									);
		}
		else {
			$return = array("success" => 'false',"msg" => "Le token n'est plus valide !","err_code" => "100");
		}
		
		$logger->debug("END getStatsById [PRODUCTS] ------- ");
		return $return;
	}

	public function isProductExistByRef($key, $ref) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START isProductExistByRef [PRODUCTS] ------- ");

		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$product 					= \R::getRow ('select * from products where reference like :ref',array(':ref'=>$ref));
			
			$return 							= array(	"success"	=> 'true',
															"msg"		=> "Vérification existance produit avec succés.",
															"exist"		=> !empty($product)
														);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END isProductExistByRef [PRODUCTS] ------- ");
		return $return;	
	}
}
?>