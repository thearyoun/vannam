<?php

namespace UTILE;

class QuotationService implements QuotationInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key,$quotationBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [QUOTATION] ------- ");

		$token 	= \R::getRow( 'SELECT * FROM token  WHERE token LIKE :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$quotation 				= \R::dispense('quotations');
			$quotation->client_id 	= $quotationBean->get_clientId() ;
			$quotation->company_id 	= $quotationBean->get_companyId() ;
			$quotation->user_id 	= $token['user_id'] ;
			$quotation->change_id 	= $quotationBean->get_changeId() ;
			$quotation->comment 	= $quotationBean->get_comment() ;
			$idQuotation			= \R::store($quotation);

			foreach ($quotationBean->get_details() as $quotationDetailBean) {
				$quotationDetail 					= \R::dispense ('quotationdetails');
				$quotationDetail->quotation_id 		= $idQuotation;
				$quotationDetail->product_id 		= $quotationDetailBean->get_productId();
				$quotationDetail->sale_price  		= $quotationDetailBean->get_salePrice();
				$idQuotationDetail					= \R::store ($quotationDetail);	

				foreach ($quotationDetailBean->get_detailStocks() as $quotationDetailStockBean) {
					$quotationDetailsStock 							= \R::dispense ('quotationdetailstocks');
					$quotationDetailsStock->range_detail_id 		= $quotationDetailStockBean->get_rangeDetailId();
					$quotationDetailsStock->value 					= $quotationDetailStockBean->get_value();
					$quotationDetailsStock->quotation_detail_id 	= $idQuotationDetail ;
					$idQuotationDetailStock							= \R::store ($quotationDetailsStock);
				}	
			}

			$return = array("success"=>'true',"msg"=> "Le devis est ajouté avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [QUOTATION] ------- ");
		return $return;	
	}

	public function updateEntityById ($key,$quotationBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [QUOTATION] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$quotation 				= \R::load('quotations',$quotationBean->get_id ());
			$quotation->client_id 	= $quotationBean->get_clientId() ;
			$quotation->change_id 	= $quotationBean->get_changeId() ;
			$quotation->comment 	= $quotationBean->get_comment() ;
			$idQuotation 			= \R::store($quotation);

			foreach ($quotationBean->get_details() as $quotationDetailBean) {
				if (empty($quotationDetailBean->get_id ()))  {
					$quotationDetail 					= \R::dispense ('quotationdetails');
				}
				else {
					$quotationDetail 					= \R::load ('quotationdetails',$quotationDetailBean->get_id ());
				}
				$quotationDetail->quotation_id 		= $idQuotation;
				$quotationDetail->product_id 		= $quotationDetailBean->get_productId();
				$quotationDetail->sale_price  		= $quotationDetailBean->get_salePrice();
				$idQuotationDetail					= \R::store ($quotationDetail);

				foreach ($quotationDetailBean->get_detailStocks() as $quotationDetailStockBean) {
					if (empty($quotationDetailStockBean->get_id ()))  {
						$quotationDetailStock 	= \R::dispense ('quotationdetailstocks');
					}
					else {
						$quotationDetailStock 	= \R::load ('quotationdetailstocks',$quotationDetailStockBean->get_id ());
					}

					$quotationDetailStock->range_detail_id 		= $quotationDetailStockBean->get_rangeDetailId();
					$quotationDetailStock->value 				= $quotationDetailStockBean->get_value();
					$quotationDetailStock->quotation_detail_id 	= $idQuotationDetail ;
					$idQuotationDetailStock						= \R::store ($quotationDetailStock);
				}	
			}

			$return 		= array("success"=>'true',"msg"=> "Le devis est modifié avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateEntityById [QUOTATION] ------- ");
		return $return;	
	}	

	public function getAllQuotationsByCriteria ($key, $criteria, $companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [QUOTATION] ------- ");
		$token 	= \R::getRow( 'SELECT * FROM token  WHERE token LIKE :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$sqlID = "" ;
			if (!empty($criteria->get_num())) {
				$sqlID = " AND qt.id LIKE '%{$criteria->get_num()}%'" ;
			}
			$sqlCreator = "" ;
			if (!empty($criteria->get_creator())) {
				$sqlCreator = " AND qt.user_id IN (SELECT ID FROM users WHERE name LIKE '%{$criteria->get_creator()}%' OR firstname LIKE '%{$criteria->get_creator()}%' ) " ;
			}
			$sqlCompany = "" ;
			if (!empty($criteria->get_company())) {
				$sqlCompany = " AND c.company_name LIKE '%{$criteria->get_company()}%'" ;
			}

			$sqlOnlyMyQuotations = "";
			$authorization = \R::getRow("select * from authorization where user_id = :id", array (":id"=>$token['user_id']));
			if ($authorization['role_id'] == 4) {
				$sqlOnlyMyQuotations 	.= " AND qt.client_id =  ( 
												SELECT client_id 
												FROM authorization 
												WHERE user_id = {$token['user_id']} 
											) ";
			}
			if ($authorization['role_id'] == 5) {
				$sqlOnlyMyQuotations 	.= " AND qt.client_id IN (
												SELECT id 
												FROM clients 
												WHERE referer_contact_id = {$token['user_id']}
											) ";
			}
			
			$quotations = \R::getAll ("
				SELECT qt.*,c.company_name,concat(u.name,' ',u.firstname) user_name,t_s.qte total, cmd.id command_id
				FROM quotations qt 
				LEFT JOIN clients c ON c.id = qt.client_id
				LEFT JOIN users u ON u.id = qt.user_id
				LEFT JOIN commands cmd on cmd.quotation_parent_id = qt.id
				LEFT JOIN (	
					SELECT sum(qtds.value * qtd.sale_price) qte,qtd.quotation_id 
					FROM quotationdetailstocks qtds
                    LEFT JOIN quotationdetails qtd ON qtds.quotation_detail_id = qtd.id
					GROUP BY qtd.quotation_id 
				) AS t_s ON t_s.quotation_id = qt.id
				WHERE qt.company_id = :company_id 
				{$sqlID}
				{$sqlCreator}
				{$sqlCompany} 
				{$sqlOnlyMyQuotations}
				ORDER BY qt.id DESC",
				array (
						":company_id" 	=> $companyId
				)
			) ;

			$return = array(	"success" 		=> "true"												,
								"msg"	 		=> "Récupération liste des devis avec succés."	,
								"quotations" 	=> $quotations
							);
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [QUOTATION] ------- ");
		return $return;	
	}

	public function getEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getEntityById [QUOTATION] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$quotation   					= \R::getRow ("	SELECT qt.*, CONCAT(u.name,' ',u.firstname) user_name 
															FROM quotations qt 
															LEFT JOIN users u ON u.id = qt.user_id
															WHERE qt.id=:id",array (":id"=>$id)) ;
			$quotation['client'] 			= \R::getRow ("
				SELECT c.*, ca.name, ca.address, ca.postal_code, ca.city, ct.name country
				FROM clients c 
				LEFT JOIN quotations qt ON qt.client_id = c.id
				LEFT JOIN clientaddresses ca ON ( ca.client_id = c .id AND ca.is_billing_address = 1 )
				LEFT JOIN countries ct ON ct.id = ca.country
				WHERE qt.id=:id",array (":id"=>$id)) ;

			$quotation['quotation_details'] = \R::getAll ('	
							SELECT qt.*,b.name brand,p.reference,p.description,c.name category,t_s.qte ,p.sale_vanam_price, 
							t_stocks.qtr - if (t_stock_cmd.qte_stock_cmd IS NULL , 0 , t_stock_cmd.qte_stock_cmd)  qtt ,
							t_purchase_price.purchase_vanam_price
							FROM quotationdetails qt 
							LEFT JOIN products p ON p.id = qt.product_id
							LEFT JOIN brands b ON b.id = p.brand_id
							LEFT JOIN categories c ON c.id = p.category_id
							LEFT JOIN (
								SELECT sum(value) qte,quotation_detail_id 
								FROM quotationdetailstocks 
								GROUP BY quotation_detail_id 
							) AS t_s ON t_s.quotation_detail_id = qt.id
							LEFT JOIN (	
								SELECT sum(cmds.value) qte_stock_cmd, cmd.product_id AS product_id_stock_cmd 
								FROM commanddetailstocks cmds 
								LEFT JOIN commanddetails cmd ON cmd.id = cmds.command_detail_id 
								WHERE cmd.command_id NOT IN (SELECT command_id FROM invoices)
								GROUP BY cmd.product_id 
							) AS t_stock_cmd ON t_stock_cmd.product_id_stock_cmd = qt.product_id
							LEFT JOIN (
								SELECT sum(value) qtr , product_id 
								FROM productstocks 
								WHERE entry_event_detail_id is NULL
								GROUP BY product_id 
							) AS t_stocks ON t_stocks.product_id = qt.product_id
							LEFT JOIN (
								SELECT AVG(purchase_price) purchase_vanam_price , product_id 
								FROM entryeventdetails 
								GROUP BY product_id
							) AS t_purchase_price ON t_purchase_price.product_id = qt.product_id
							WHERE qt.quotation_id = :id GROUP BY qt.product_id',
							array (':id'=>$id)
			);

			$quotation['command'] = \R::getRow ("select id from commands where quotation_parent_id = :id",array (':id'=>$id));
			foreach ($quotation['quotation_details'] as &$quotationDetail) {
				$quotationDetail['stock'] = \R::getAll (" 	SELECT qds.*,rd.name
															FROM quotationdetailstocks qds
															LEFT JOIN rangedetails rd ON rd.id = qds.range_detail_id																	
															WHERE qds.quotation_detail_id = :id GROUP BY range_detail_id",
															array (":id"=>$quotationDetail['id'])
														);
				$quotationDetail['qte'] = intval($quotationDetail['qte']);
			}
			
			$return 		= array(	"success" 		=> "true"												,
										"msg"	 		=> "Récupération du devis avec succès."	,
										"quotation" 	=> $quotation
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getEntityById [QUOTATION] ------- ");
		return $return;	
	}

	public function deleteEntityById ($key,$id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [QUOTATION] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$quotation   	= \R::load ("quotations", $id) ;
			\R::trash ($quotation);	
			\R::exec("	DELETE FROM quotationdetailstocks WHERE quotation_detail_id IN (
							SELECT id FROM quotationdetails WHERE quotation_id = {$id}
						) ");
			\R::exec("DELETE FROM quotationdetails WHERE quotation_id = {$id}")	;	
			$return = array(	"success" 	=> "true"										,
								"msg"	 	=> "Suppression du devis avec succès."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [QUOTATION] ------- ");
		return $return;	
	}

	public function getQuotationDocumentById ($key, $id, $typeRendering, $isImage,$formatStock, $vanamPrice, $header, $companyId){
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getQuotationDocumentById [QUOTATION] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$criteria 	= new \UTILE\CriteriaProduct () ;
			$criteria->set_companyId($companyId);
			$criteria->set_refDescValue('');
			$criteria->set_categories('');
			$criteria->set_brands('');
			$criteria->set_sports('');
			$criteria->set_color('');
			$criteria->set_entryEventInformation('');
			$criteria->set_entryEventDate('');
			$criteria->set_entryEventAfterBefore('');
			$criteria->set_aisle('');
			$criteria->set_palette('');
			$criteria->set_qtrExhausted('0');
			$criteria->set_isNoPictures('0');
			$criteria->set_idDevis($id);
			$criteria->set_header($header);

			$criteria->set_renderingType($typeRendering);
			$criteria->set_isImages($isImage);
			$criteria->set_isPAchat(0);
			$criteria->set_isPTarif(0);
			$criteria->set_isPPublic(0);
			$criteria->set_isPVanam($vanamPrice);
			$criteria->set_isZonage(1);
			$criteria->set_isByZone(0);
			$criteria->set_isTransport(0);
			$criteria->set_formatStock($formatStock);

			$productService = new \UTILE\ProductService () ;
			$return 		= $productService->getProductsByCriteria ($key, $criteria)	;
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getQuotationDocumentById [QUOTATION] ------- ");
		return $return;	
	}

	public function getQuotationLissageById ($key,$productId, $quantity, $quotationId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getQuotationLissageById [QUOTATION] ------- ");
		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();
		$return 		= array ();

		if ($currentTime < $token['validation_date']){
			$lissage 			= array();
			$allProductStocks 	= \R::getAssoc('SELECT ps.range_detail_id,ps.value,rgd.name
												FROM productstocks ps
												LEFT JOIN rangedetails rgd ON rgd.id = ps.range_detail_id
												WHERE ps.entry_event_detail_id IS NULL
												AND ps.product_id = :id ORDER BY ps.value DESC' ,
												array (':id'=>$productId)
										 );
			$totalStock = 0 ;
			foreach($allProductStocks as $row) {
				if($row['value'] > 0) {
					$totalStock += $row['value'];
				}
			}

			if ( $totalStock == 0 ) {
				$return  = array(	"success" 	=> 'false'									,
									"msg"		=> "Erreur lissage : stock épuisé !"		,
									"lissage"	=> []										,
									"stock" 	=> []	
									);
			}
			else {
				if($quantity > $totalStock) {
					$quantity = $totalStock ;
				}

				$pourcent = $quantity/$totalStock;
				if($pourcent > 1) {
					$pourcent = 1;
				}

				foreach($allProductStocks as $row) {
					if($row['value'] > 0) {
						$lissage[$row['name']] = $row['value']*$pourcent > 0 ? floor($row['value']*$pourcent) : 1 ;
						$quantity -= $lissage[$row['name']];
					}
				}
	
				foreach($allProductStocks as $row) {
					if($row['value']) {
						if(!$quantity)
							break;
						$lissage[$row['name']]++;
						$quantity--;
					}
				}
			
				$sotckDetails 	= \R::getAll("
					SELECT 	pst.range_detail_id,rd.name,pst.value qtr , 
						IF (
							pst.value - IF (
								t_qtt.qte_cmds is NULL , 0 ,t_qtt.qte_cmds
							) < 0, 
							0 , 
							pst.value - IF (
								t_qtt.qte_cmds IS NULL , 0 ,t_qtt.qte_cmds
							)
						) AS  qtt 
					FROM productstocks pst
					LEFT JOIN rangedetails rd ON rd.id = pst.range_detail_id
					LEFT JOIN( 
						SELECT sum(cmds.value) qte_cmds, cmdd.product_id
						FROM commanddetailstocks cmds
                        LEFT JOIN commanddetails cmdd ON cmdd.id = cmds.command_detail_id
                        WHERE cmdd.command_id NOT IN (SELECT command_id FROM invoices)
                        GROUP BY cmdd.product_id 
					) AS t_qtt ON t_qtt.product_id = pst.product_id
					WHERE pst.product_id = :id 
					AND pst.entry_event_detail_id IS NULL ",
					array(":id" =>  $productId));

				if(!empty($quotationId)) {
					$oldQT = \R::getRow ("	SELECT SUM(value) qte 
											FROM quotationdetailstocks 
											WHERE quotation_detail_id IN (	
												SELECT id FROM quotationdetails WHERE quotation_id = :id
											)  ",array(":id"=>$quotationId)) ;
					if ($oldQT['qte'] > $quantity  || $oldQT['qte'] < $quantity) {
						$return 		= array("success" 	=> 'true'											,
										"msg"		=> "Le lissage de produit est fait avec succés !"	,
										"lissage"	=> $lissage 										,
										"stock" 	=> $sotckDetails
										);
					}
					else {
						$lissage = \R::getAssoc ("	SELECT rd.name,qtds.value
													FROM quotationdetailstocks qtds
													LEFT JOIN rangedetails rd ON rd.id = qtds.range_detail_id
													WHERE qtds.quotation_detail_id IN (
														SELECT id 
														FROM quotationdetails 
														WHERE quotation_id = :id
													)", array(":id"=>$quotationId) ) ;

						$return 		= array("success" 	=> 'true'											,
												"msg"		=> "Le lissage de produit est fait avec succés !"	,
												"lissage"	=> $lissage 										,
												"stock" 	=> $sotckDetails
										);
					}
				}
				else {
					$return 		= array("success" 	=> 'true'											,
											"msg"		=> "Le lissage de produit est fait avec succés !"	,
											"lissage"	=> $lissage 										,
											"stock" 	=> $sotckDetails
									);
				}
			}
		}
		else {
			$return 		= array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getQuotationLissageById [QUOTATION] ------- ");
		return $return;	
	}

	public function duplicateQuotationById($key, $id){

		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START duplicateQuotationById [QUOTATION] ------- ");
		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();
		$return 		= array ();
		if ($currentTime < $token['validation_date']){

			$quotation 			= \R::getRow ('select * from quotations where id = :id ',array (':id' => $id));
			unset($quotation['id']);
			$quotationObject 	= \R::dispense('quotations');
			$quotationObject->import($quotation);
			$idQuotation 		= \R::store($quotationObject);

			$quotationDetails 	= \R::getAll("select * from quotationdetails where quotation_id = :id",array (':id' => $id));

			if (!empty($quotationDetails)) {
				foreach ($quotationDetails as &$qtDetail) {
					$qtDStocks = \R::getAll("select * from quotationdetailstocks where quotation_detail_id = :id",array (':id' => $qtDetail['id']));

					unset($qtDetail['id']) ;
					$qtDetail["quotation_id"] 	= $idQuotation;
					$qtDetailObject 			= \R::dispense('quotationdetails');
					$qtDetailObject->import($qtDetail);
					$idQtDetail 				= \R::store($qtDetailObject);

					if (!empty($qtDStocks)) {
						foreach ($qtDStocks as &$qtDStock) {
							unset($qtDStock['id']) ;
							$qtDStock["quotation_detail_id"] 	= $idQtDetail;
							$qtDetailStockObject 				= \R::dispense('quotationdetailstocks');
							$qtDetailStockObject->import($qtDStock);
							$idQtDetailStock 					= \R::store($qtDetailStockObject);
						}
					}
				}
			}

			$return = $this->getEntityById ($key, $idQuotation) ;
		}
		else {
			$return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
		}
		
		$logger->debug("END duplicateQuotationById [QUOTATION] ------- ");
		return $return;	
	}

	public function convertQuotationToCommandById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START convertQuotationToCommandById [QUOTATION] ------- ");
		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();
		$return 		= array ();
		if ($currentTime < $token['validation_date']){
			$dataFromQuotation 				= $this->getEntityById ($key, $id) ;
			$quotation 						= $dataFromQuotation['quotation'] ;
			
			$command 						= \R::dispense("commands");
			$command->company_id 			= $quotation['company_id'];
			$command->user_id 				= $quotation['user_id'];
			$command->client_id 			= $quotation['client_id'];
			$command->change_id				= $quotation['change_id'];
			$command->quotation_parent_id 	= $id;
			$command->comment 				= $quotation['comment'];
			$commandNewId 					= \R::store($command);

			// Il ne faut pas oublier le status par défaut
			$productService = new \UTILE\ProductService(); 
			$logger->debug($quotation['quotation_details']);
			foreach ($quotation['quotation_details'] as $quotationDetail) {
				$product = $productService->getEntityById ($key, $quotationDetail['product_id']) ;
				$updateStockZero = false ;
				//if ($product['product']['qtr'] <= $quotationDetail['qte']) {
				//	$updateStockZero = true ;
				//}
				$commandDetails 			= \R::dispense('commanddetails'); 
				$commandDetails->command_id = $commandNewId ;
				$commandDetails->product_id = $quotationDetail['product_id'] ;
				$commandDetails->sale_price = $quotationDetail['sale_price'] ;
				$commandDetailsId 			= \R::store($commandDetails);
				$logger->debug($quotationDetail['stock']);
				foreach ($quotationDetail['stock'] as $stockRow) {
					$productStock = \R::getRow ("	
						SELECT pst.*, 
						IF (pst.value - IF (t_qtt.qte_cmds IS NULL , 0 ,t_qtt.qte_cmds) < 0, 0 , pst.value - IF (t_qtt.qte_cmds IS NULL , 0 ,t_qtt.qte_cmds)) AS  qtt
						FROM productstocks pst
						LEFT JOIN( 
							SELECT sum(cmds.value) qte_cmds, cmdd.product_id, cmds.range_detail_id
							FROM commanddetailstocks cmds
                            LEFT JOIN commanddetails cmdd ON cmdd.id = cmds.command_detail_id
                            WHERE cmdd.command_id NOT IN (SELECT command_id from invoices)
						) AS t_qtt ON ( t_qtt.range_detail_id = pst.range_detail_id AND t_qtt.product_id = pst.product_id )
						WHERE pst.range_detail_id = :id 
						AND pst.product_id = :pid
						AND pst.entry_event_detail_id IS NULL",
						array (":id" => $stockRow['range_detail_id'],":pid"=>$quotationDetail['product_id'])
					);
					if ($productStock['qtt'] >= $stockRow['value']) {
						$commandDetailStocks 					= \R::dispense ('commanddetailstocks');
						$commandDetailStocks->command_detail_id = $commandDetailsId ;
						$commandDetailStocks->range_detail_id 	= $stockRow['range_detail_id'] ;
						$commandDetailStocks->value 			= $stockRow['value'] ;
						$commandDetailStocksId 					= \R::store($commandDetailStocks);
					
						$newStockValue = $productStock['value'] - $stockRow['value'] ;
						//if ($updateStockZero) {
						//	$newStockValue = 0 ;
						//}
						//$productStock['value'] 	= $newStockValue ;
						//$pStockOBject 			= \R::dispense("productstocks") ;
						//$pStockOBject->import($productStock);
						//$idPStock				= \R::store($pStockOBject);
					}
				}
			}
			$return = array("success"=>'true',"msg"=> "La conversion de devis vers commande est avec succès.","command_id" => $commandNewId);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END convertQuotationToCommandById [QUOTATION] ------- ");
		return $return;	
	}

	public function deleteProductFromQuotationById ($key, $quotationId, $productId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteProductFromQuotationById [QUOTATION] ------- ");
		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();
		$return 		= array ();
		if ($currentTime < $token['validation_date']){
			\R::exec("	DELETE FROM quotationdetailstocks 
						WHERE quotation_detail_id IN (
								SELECT id 
									FROM quotationdetails 
									WHERE quotation_id = {$quotationId}
									AND product_id = {$productId}
						)");
			\R::exec("	DELETE FROM quotationdetails  WHERE quotation_id = {$quotationId} AND product_id = {$productId}");
			$return = array("success"=>'true',"msg"=> "Le produit est supprimé avec succès du devis.");

		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteProductFromQuotationById [QUOTATION] ------- ");
		return $return;	
	}

	public function getAllEntities ($key,$companyId) {
		return null ;
	}
}

?>