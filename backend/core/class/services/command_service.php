<?php

namespace UTILE;

class CommandService implements CommandInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key,$commandBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [COMMAND] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$command 						= \R::dispense('commands');
			$command->client_id 			= $commandBean->get_clientId() ;
			$command->company_id 			= $commandBean->get_companyId() ;
			$command->user_id 				= $token['user_id'] ;
			$command->change_id 			= $commandBean->get_changeId() ;
			$command->status 				= $commandBean->get_status() ;
			$command->comment 				= $commandBean->get_comment() ;
			$command->transport_amount 		= $commandBean->get_transportAmount() ;
			$command->tva_exoneration 		= $commandBean->get_tvaExoneration() ;
			$command->is_invoice_pdf 		= $commandBean->get_isInvoicePDF() ;
			$command->is_invoice_excel 		= $commandBean->get_isInvoiceEXCEL() ;

			$idCommand				= \R::store($command);

			foreach ($commandBean->get_details() as $commandDetailBean) {
				$commandDetail 					= \R::dispense ('commanddetails');
				$commandDetail->command_id 		= $idCommand;
				$commandDetail->product_id 		= $commandDetailBean->get_productId();
				$commandDetail->sale_price  	= $commandDetailBean->get_salePrice();
				$idCommandDetail				= \R::store ($commandDetail);	

				foreach ($commandDetailBean->get_detailStocks() as $commandDetailStockBean) {
					$commandDetailsStock 						= \R::dispense ('commanddetailstocks');
					$commandDetailsStock->range_detail_id 		= $commandDetailStockBean->get_rangeDetailId();
					$commandDetailsStock->value 				= $commandDetailStockBean->get_value();
					$commandDetailsStock->command_detail_id 	= $idCommandDetail ;
					$idCommandDetailStock						= \R::store ($commandDetailsStock);
				}	
			}

			$return = array("success"=>'true',"msg"=> "La commande est ajoutée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [COMMAND] ------- ");
		return $return;	
	}

	public function updateEntityById ($key,$commandBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [COMMAND] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$command 						= \R::load('commands',$commandBean->get_id ());
			$command->client_id 			= $commandBean->get_clientId() ;
			$command->change_id 			= $commandBean->get_changeId() ;
			$command->status 				= $commandBean->get_status() ;
			$command->comment 				= $commandBean->get_comment() ;
			$command->transport_amount 		= $commandBean->get_transportAmount() ;
			$command->tva_exoneration 		= $commandBean->get_tvaExoneration() ;
			$command->is_invoice_pdf 		= $commandBean->get_isInvoicePDF() ;
			$command->is_invoice_excel 		= $commandBean->get_isInvoiceEXCEL() ;
			$idCommand 						= \R::store($command);

			foreach ($commandBean->get_details() as $commandDetailBean) {

				if (empty($commandDetailBean->get_id ()))  {
					$commandDetail 					= \R::dispense ('commanddetails');
				}
				else {
					$commandDetail 					= \R::load ('commanddetails',$commandDetailBean->get_id ());
				}
				$commandDetail->command_id 		= $idCommand;
				$commandDetail->product_id 		= $commandDetailBean->get_productId();
				$commandDetail->sale_price  	= $commandDetailBean->get_salePrice();
				$idCommandDetail				= \R::store ($commandDetail);

				foreach ($commandDetailBean->get_detailStocks() as $commandDetailStockBean) {
					if (empty($commandDetailStockBean->get_id ()))  {
						$commandDetailStock 	= \R::dispense ('commanddetailstocks');
					}
					else {
						$commandDetailStock 	= \R::load ('commanddetailstocks',$commandDetailStockBean->get_id ());
					}

					$commandDetailStock->range_detail_id 		= $commandDetailStockBean->get_rangeDetailId();
					$commandDetailStock->value 					= $commandDetailStockBean->get_value();
					$commandDetailStock->command_detail_id 		= $idCommandDetail ;
					$idCommandDetailStock						= \R::store ($commandDetailStock);
				}	
			}

			$return 		= array("success"=>'true',"msg"=> "La commande est modifiée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateEntityById [COMMAND] ------- ");
		return $return;	
	}	

	public function getAllCommandsByCriteria ($key, $criteria, $companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [COMMAND] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$sqlID = "" ;
			if (!empty($criteria->get_num())) {
				$sqlID = " and cmd.id like '%{$criteria->get_num()}%'" ;
			}
			$sqlCreator = "" ;
			if (!empty($criteria->get_creator())) {
				$sqlCreator = " and cmd.user_id in (select id from users where name like '%{$criteria->get_creator()}%' or firstname like '%{$criteria->get_creator()}%' )" ;
			}
			$sqlCompany = "" ;
			if (!empty($criteria->get_company())) {
				$sqlCompany = " and c.company_name like '%{$criteria->get_company()}%'" ;
			}

			$sqlOnlyMyCommands = "";
			$authorization = \R::getRow("select * from authorization where user_id = :id", array (":id"=>$token['user_id']));
			if ($authorization['role_id'] == 4) {
				$sqlOnlyMyCommands 	.= " AND cmd.client_id =  ( 
											SELECT client_id 
											FROM authorization 
											WHERE user_id = {$token['user_id']} 
										)  ";
			}
			if ($authorization['role_id'] == 5) {
				$sqlOnlyMyCommands 	.= " AND cmd.client_id IN (
											SELECT id 
											FROM clients 
											WHERE referer_contact_id = {$token['user_id']}
										) ";
			}

			$commands = \R::getAll ("	
				SELECT cmd.*, c.company_name, concat(u.name,' ',u.firstname) user_name, 
				(t_s.qte + IF(cmd.transport_amount IS NULL, 0, cmd.transport_amount) ) total 
				FROM commands cmd 
				LEFT JOIN clients c ON c.id = cmd.client_id
				LEFT JOIN users u ON u.id = cmd.user_id
				LEFT JOIN (	
					SELECT SUM(cmdds.value * cmdd.sale_price) qte,cmdd.command_id 
					FROM commanddetailstocks cmdds
                    LEFT JOIN commanddetails cmdd ON cmdds.command_detail_id = cmdd.id
					GROUP BY cmdd.command_id 
				) AS t_s ON t_s.command_id = cmd.id
				WHERE cmd.company_id = :company_id 
				and cmd.status NOT IN ('INVOICED')
				{$sqlID}
				{$sqlCreator}
				{$sqlCompany} 
				{$sqlOnlyMyCommands}
				group by cmd.id order by cmd.id DESC",
				array (
						":company_id" 	=> $companyId
			  	)
			) ;

			$return = array(	"success" 		=> "true"											,
								"msg"	 		=> "Récupération liste des commandes avec succés."	,
								"commands" 		=> $commands
							);
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [COMMAND] ------- ");
		return $return;	
	}

	public function getEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getEntityById [COMMAND] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$command   			= \R::getRow ("	select cmd.*,concat(u.name,' ',u.firstname) user_name, ch.name change_name
												from commands cmd 
												left join users u on u.id = cmd.user_id
												left join changes ch on ch.id=cmd.change_id
												where cmd.id=:id",array (":id"=>$id)) ;
			$command['client'] 	= \R::getRow ("	select c.*
												from clients c 
												where c.id = :id",array (":id"=>$command['client_id'])) ;
			$command['client']['addresses']['billing'] = \R::getRow ("	select ca.*, c.name country
																		from clientaddresses ca
																		left join countries c on c.id = ca.country
																		where ca.client_id = :id 
																		and ca.is_billing_address = 1"
																	,array (":id" => $command['client']['id'])
																	);
			$command['client']['addresses']['delivery'] = \R::getRow ("	select ca.*, c.name country
																		from clientaddresses ca
																		left join countries c on c.id = ca.country
																		where ca.client_id = :id 
																		and ca.is_delivery_address = 1"
																	,array (":id" => $command['client']['id'])
																	);

			$command['files'] 	= \R::getAll("	select id,concat('resources/commands/',command_id,'/') url, name 
												from commandfiles 
												where command_id=:id"
												, array (':id' => $id)
											);
			$command['command_details'] = \R::getAll ('	
				SELECT cmdd.*, b.name brand, p.reference, p.description, c.name category, 
				t_s_c.qte, concat(pl.aisle,pl.palette) location, 
				r.name gamme, t_stocks.qtr - if (t_s.qte_s IS NULL , 0 , t_s.qte_s)  qtt
				FROM commanddetails cmdd 
				LEFT JOIN products p ON p.id = cmdd.product_id
				LEFT JOIN brands b ON b.id = p.brand_id
				LEFT JOIN categories c ON c.id = p.category_id
				LEFT JOIN ranges r ON r.id = p.range_id
				LEFT JOIN productlocations pl ON pl.product_id = p.id
				LEFT JOIN (
					SELECT SUM(cmdds.value) qte_s, cmdd.product_id 
					FROM commanddetailstocks cmdds
					LEFT JOIN commanddetails cmdd ON cmdd.id=cmdds.command_detail_id
					WHERE cmdd.command_id NOT IN (SELECT command_id FROM invoices)
					GROUP BY cmdds.command_detail_id 
				) AS t_s ON t_s.product_id = cmdd.product_id

				LEFT JOIN (
					SELECT SUM(cmdds.value) qte, cmdd.product_id 
					FROM commanddetailstocks cmdds
					LEFT JOIN commanddetails cmdd ON cmdd.id=cmdds.command_detail_id
					WHERE cmdd.command_id = :id
					GROUP BY cmdds.command_detail_id 
				) AS t_s_c ON t_s_c.product_id = cmdd.product_id

				LEFT JOIN (
					SELECT sum(value) qtr , product_id 
					FROM productstocks 
					WHERE entry_event_detail_id IS NULL
					GROUP BY product_id 
				) AS t_stocks ON t_stocks.product_id = cmdd.product_id
				WHERE cmdd.command_id = :id GROUP BY cmdd.product_id',
				array (':id'=>$id)
			);

			foreach ($command['command_details'] as &$commandDetail) {
				$commandDetail['stock'] = \R::getAll (" select cds.*,rd.name
																from commanddetailstocks cds
																left join rangedetails rd on rd.id = cds.range_detail_id							
																where cds.command_detail_id = :id group by range_detail_id",
															array (":id"=>$commandDetail['id'])
														);
				$commandDetail['qte'] = intval($commandDetail['qte']);
			}
			
			$return 		= array(	"success" 		=> "true"										,
										"msg"	 		=> "Récupération de la commande avec succès."	,
										"command" 		=> $command
							);
		}
		else {
			$return = array("success" => 'false',"msg" => "Le token n'est plus valide !","err_code" => "100");
		}
		
		$logger->debug("END getEntityById [COMMAND] ------- ");
		return $return;	
	}

	public function deleteEntityById ($key,$id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [COMMAND] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$command   	= \R::load ("commands", $id) ;
			\R::trash ($command);	
			\R::exec("DELETE FROM commanddetailstocks where command_detail_id in (select id FROM commanddetails where command_id = {$id}) ");
			\R::exec("DELETE FROM commanddetails where command_id = {$id}")	;	
			$return = array(	"success" 	=> "true"										,
								"msg"	 	=> "Suppression de la commande avec succès."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [COMMAND] ------- ");
		return $return;	
	}

	public function getCommandDocumentById ($key, $id,$typeRendering, $isImage,$formatStock, $vanamPrice, $header, $companyId){
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getCommandDocumentById [COMMAND] ------- ");
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
			$criteria->set_idCommand($id);
			$criteria->set_header($header);


			$criteria->set_renderingType($typeRendering);
			$criteria->set_isImages($isImage);
			$criteria->set_isPAchat(0);
			$criteria->set_isPTarif(0);
			$criteria->set_isPPublic(0);
			$criteria->set_isPVanam($vanamPrice);
			$criteria->set_isZonage(1);
			$criteria->set_isByZone(0);
			$criteria->set_isTransport(1);
			$criteria->set_formatStock($formatStock);

			$productService = new \UTILE\ProductService () ;
			$return 		= $productService->getProductsByCriteria ($key, $criteria)	;
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getCommandDocumentById [COMMAND] ------- ");
		return $return;	
	}

	public function getCommandLissageById ($key, $productId, $quantity, $commandId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getCommandLissageById [COMMAND] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();

		if ($currentTime < $token['validation_date']){
			$lissage 			= array();
			$allProductStocks 	= \R::getAssoc('select ps.range_detail_id,ps.value,rgd.name
												from productstocks ps
												left join rangedetails rgd on rgd.id = ps.range_detail_id
												where ps.entry_event_detail_id is null
												and ps.product_id = :id order by ps.value DESC' ,
												array (':id' => $productId)
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
					SELECT pst.range_detail_id,rd.name,pst.value qtr, if (pst.value - if (t_qtt.qte_cmds is null , 0 ,t_qtt.qte_cmds) < 0, 0 , pst.value - if (t_qtt.qte_cmds is null , 0 ,t_qtt.qte_cmds)) as  qtt    
					FROM `productstocks` pst
					LEFT JOIN rangedetails rd on rd.id = pst.range_detail_id
					LEFT JOIN( 
						SELECT sum(cmds.value) qte_cmds, cmds.range_detail_id, cmdd.product_id
						FROM commanddetailstocks cmds
                        LEFT JOIN commanddetails cmdd on cmdd.id = cmds.command_detail_id
                        WHERE cmdd.command_id NOT IN (SELECT command_id FROM invoices)
                       	AND cmdd.product_id = :id 
                        GROUP BY cmds.range_detail_id 
					) AS t_qtt ON t_qtt.range_detail_id = pst.range_detail_id
					WHERE pst.product_id = :id 
					AND pst.entry_event_detail_id is null ",
					array(":id" =>  $productId)
				);
				if(!empty($commandId)) {
					$oldQT = \R::getRow ("	select sum(value) qte 
											from commanddetailstocks 
											where command_detail_id in (	
												SELECT id FROM `commanddetails` where command_id = :id
											)  ",array(":id"=>$commandId)) ;
					if ($oldQT['qte'] > $quantity  || $oldQT['qte'] < $quantity) {
						$return 		= array("success" 	=> 'true'											,
										"msg"		=> "Le lissage de produit est fait avec succés !"	,
										"lissage"	=> $lissage 										,
										"stock" 	=> $sotckDetails
										);
					}
					else {
						$lissage = \R::getAssoc ("	select rd.name,cmdds.value
												from commanddetailstocks cmdds
												left join rangedetails rd on rd.id = cmdds.range_detail_id
												where cmdds.command_detail_id in (
													select id from commanddetails where command_id = :id
												)", array(":id"=>$commandId) ) ;

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
			$return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
		}
		
		$logger->debug("END getCommandLissageById [COMMAND] ------- ");
		return $return;	
	}

	public function getAllEntities ($key,$companyId) {
		return null ;
	}

	public function addFileToCommandById ($key, $commandId, $files) {
		$logger 		= \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addFileToCommandById [COMMAND] ------- ");
		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();
		$return 		= array ();

		if ($currentTime < $token['validation_date']){
			$output 	= "resources/commands/";
			$urlLogo 	= "";
			if (!empty($files)) {
				$command = \R::load('commands',$commandId);
				$output = "resources/commands/{$command['id']}/";
				if(!file_exists($output)){
					if (!mkdir($output, 0777, true)) {
			    		die('Failed to create folder...');
			   		}
				}
				if (!empty($files)) {
					$name = $files['name'];
					move_uploaded_file($files['tmp_name'], $output.$name);
					$fileObject 			= \R::dispense('commandfiles');
					$fileObject->name 		= $name;
					$fileObject->command_id = $commandId;
					$id 					= \R::store($fileObject);
				}
						
				$return = array("success"=>'true',"msg"=> "Ajout document avec succés.");
			}
		}
		else {
			$return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
		}
		
		$logger->debug("END addFileToCommandById [COMMAND] ------- ");
		return $return;	

	}

	public function deleteFileFromCommandById($key, $id, $fileId) {
		$logger 		= \Logger::getLogger(basename(__FILE__));
        $logger->debug('---------- START deleteFileFromCommandById [COMMAND] ----------');
        $token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
       	$currentTime 	= time();
        $data 			= array ();
        if ($currentTime < $token['validation_date']){
			$file 		= \R::load("commandfiles",$fileId);
			$command 	= \R::load("commands",$id);			
			$filePath 	= "/resources/commands/{$command['id']}/";
			unlink (getcwd().$filePath.$file['name']);
			\R::trash($file);
            $data = array("success"=>'true',"msg"=> "Suppression document  avec succés.");
       	}
        else {
        	$data = array("success"=>'false',"msg"=> "Le token n'est plus valide !");
        }
		$logger->debug("END deleteFileFromCommandById [COMMAND] ------- ");
        return $data;	
    }

    public function generateProformaOrInvoiceById ($key, $commandId, $typePayment, $typePrint, $typeDocument)	{
    	$logger 		= \Logger::getLogger(basename(__FILE__));
        $logger->debug('---------- START generateProformaById [COMMAND] ----------');
        $token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
       	$currentTime 	= time();
        $data 			= array ();
        if ($currentTime < $token['validation_date']){

        	$data 		= $this->getEntityById ($key, $commandId) ;
			$command 	= $data['command'] ;

			$company 	= \R::getRow('select * from companies where id =:id', array(':id'=>$command['company_id'])) ;

        	$transport  = array("transport_amount"=>$command['transport_amount']); 
        	$fileHelper = new \UTILE\FileHelper ();
        	$urlFile 	= "";
        	if ($typePrint == 1) {
				$billDate = '';
				if ($typeDocument == INVOICE_TYPE) {
					$invoice  = \R::getRow ("SELECT CONCAT(DATE_FORMAT(creation_date,'%y'),'-', DATE_FORMAT(creation_date,'%m'),'-') bill_date FROM invoices  WHERE command_id = :id", array (':id' => $commandId)) ;
					$billDate = $invoice['bill_date'];
				}
        		$urlFile 	= $fileHelper->generateProformaOrInvoicePDF ($token['user_id'], $commandId, $company, $command['client'], $command['command_details'], $transport, $typePayment, $typeDocument, $command['change_name'], $command['tva_exoneration'], $billDate);
        	}
        	else {
        		$urlFile 	= $fileHelper->generateProformaOrInvoiceExcel ($token['user_id'],$commandId, $company, $command['client'], $command['command_details'], $transport, $typePayment, $typeDocument, $command['change_name'], $command['tva_exoneration']);
        	}
        	$data 		= array(	"success"	=> 'true'									,
									"msg"		=> "Proforma est générée avec succés."		,
									"url_file"	=> $urlFile
								);
        }
         else {
        	$data = array("success"=>'false',"msg"=> "Le token n'est plus valide !");
        }
		$logger->debug("END generateProformaById [COMMAND] ------- ");
		return $data ;
    }

    public function generateInvoiceById ($key, $commandId){
    	$logger 		= \Logger::getLogger(basename(__FILE__));
        $logger->debug('---------- START generateInvoiceById [COMMAND] ----------');
        $token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
       	$currentTime 	= time();
        $data 			= array ();
        if ($currentTime < $token['validation_date']){
        	$currentInvoice = \R::getRow ('select * from invoices where command_id = :id' ,array (":id" => $commandId)) ;
        	$command 		= \R::load("commands", $commandId);
        	if (empty($currentInvoice)) {
        		$invoice 					= \R::dispense ('invoices');
        		$invoice->command_id 		= $commandId ;
        		$invoice->company_id 		= $command->company_id ;
        		$idInvoice 					= \R::store ($invoice);

        		$data = $this->getEntityById($key, $commandId) ;
				$commandDetails 	= $data['command']['command_details'] ;
        		foreach ($commandDetails as $product) {
        			foreach ($product['stock'] as $lineStock) {
						
        				$sql = "UPDATE productstocks 
        						SET value = if (value-{$lineStock['value']}=0, 0, value-{$lineStock['value']})
								WHERE range_detail_id={$lineStock['range_detail_id']}
								AND product_id={$product['product_id']}" ;
        				\R::exec($sql);
        			}
        		}

        	}
        	else {
        		$currentInvoice['is_visible'] 	= 1 ;
        		$invoice 						= \R::dispense ('invoices');
        		$invoice->import($currentInvoice);
        		$idInvoice 						= \R::store ($invoice);
        	}
        	$command->status 	= 'INVOICED' ;
        	$commandId 			= \R::store($command);	 
        	$data 				= array(	"success"	=> 'true'								,
											"msg"		=> "Facture est générée avec succés."	,
											"invoice" 	=> $currentInvoice		
								);
        }
         else {
        	$data = array("success"=>'false',"msg"=> "Le token n'est plus valide !");
        }
		$logger->debug("END generateInvoiceById [COMMAND] ------- ");
		return $data ;
    }

    public function printBpOfCommandById ($key, $commandId) {
    	$logger 		= \Logger::getLogger(basename(__FILE__));
        $logger->debug('---------- START printBpOfCommandById [COMMAND] ----------');
        $token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
       	$currentTime 	= time();
        $data 			= array ();
        if ($currentTime < $token['validation_date']){
        	$fileHelper 		= new \UTILE\FileHelper ();
        	$data 				= $this->getEntityById ($key, $commandId) ;
        	$commandDetails 	= $data['command']['command_details'] ;
			
			foreach ($commandDetails as &$details) {
				$stockCommands 		= [] ;
				foreach ($details['stock'] as $lineStock) {
					if ($lineStock['value'] > 0) {
						array_push($stockCommands, $lineStock) ;
					}
				}
				$details['stock'] = $stockCommands ;
			}
			
        	$urlFile 					= $fileHelper->generateBpPDF ($token['user_id'], $commandDetails, $commandId);

        	$data 				= array(	"success"	=> 'true'										,
											"msg"		=> "Bon de préparation est généré avec succés."	,
											"url_file" 	=> $urlFile		
									);
        }
         else {
        	$data = array("success"=>'false',"msg"=> "Le token n'est plus valide !");
        }
		$logger->debug("END printBpOfCommandById [COMMAND] ------- ");
		return $data ;
    }

    public function convertCommandToQuotationById ($key, $commandId)	{
    	$logger 		= \Logger::getLogger(basename(__FILE__));
        $logger->debug('---------- START convertCommandToQuotationById [COMMAND] ----------');
        $token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
       	$currentTime 	= time();
        $data 			= array ();
        if ($currentTime < $token['validation_date']){
        	$data 		= $this->getEntityById ($key, $commandId) ;
        	$command 	= $data['command'] ;

        	$quotation 				= \R::dispense('quotations');
			$quotation->client_id 	= $command['client_id'] ;
			$quotation->company_id 	= $command['company_id'] ;
			$quotation->user_id 	= $token['user_id'] ;
			$quotation->change_id 	= $command['change_id'] ;
			$quotation->comment 	= $command['comment'] ;
			$idQuotation			= \R::store($quotation);

			foreach ($command['command_details'] as $commandDetails) {
				$quotationDetail 					= \R::dispense ('quotationdetails');
				$quotationDetail->quotation_id 		= $idQuotation;
				$quotationDetail->product_id 		= $commandDetails['product_id'];
				$quotationDetail->sale_price  		= $commandDetails['sale_price'];
				$idQuotationDetail					= \R::store ($quotationDetail);	

				foreach ($commandDetails['stock'] as $stock) {
					$quotationDetailsStock 							= \R::dispense ('quotationdetailstocks');
					$quotationDetailsStock->range_detail_id 		= $stock['range_detail_id'];
					$quotationDetailsStock->value 					= $stock['value'];
					$quotationDetailsStock->quotation_detail_id 	= $idQuotationDetail ;
					$idQuotationDetailStock							= \R::store ($quotationDetailsStock);
				}	
			}

        	$data 				= array(	"success"		=> 'true'							,
											"msg"			=> "Devis est généré avec succés."	,
											"quotation_id" 	=> $idQuotation
									);
        }
         else {
        	$data = array("success"=>'false',"msg"=> "Le token n'est plus valide !");
        }
		$logger->debug("END convertCommandToQuotationById [COMMAND] ------- ");
		return $data ;
	}
	
	public function deleteProductFromCommandById ($key, $commandId, $productId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteProductFromCommandById [COMMAND] ------- ");
		$token 			= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime 	= time();
		$return 		= array ();
		if ($currentTime < $token['validation_date']){

			$tabStocks = \R::getAll ('	SELECT * FROM commanddetailstocks 
										WHERE command_detail_id IN (
											SELECT id FROM commanddetails WHERE command_id = '.$commandId.'
											AND product_id = '.$productId.' )');
			foreach ($tabStocks as $lineStock) {
				\R::exec("UPDATE productstocks set value = value + {$lineStock['value']}
							  WHERE product_id = {$productId} AND range_detail_id = {$lineStock['range_detail_id']}
							  AND entry_event_detail_id IS NULL");
			}
			\R::exec("	DELETE FROM commanddetailstocks 
						WHERE command_detail_id IN (
								SELECT id 
									FROM commanddetails 
									WHERE command_id = {$commandId}
									AND product_id = {$productId}
						)");
			\R::exec("	DELETE FROM commanddetails  WHERE command_id = {$commandId} AND product_id = {$productId}");
			$return = array("success"=>'true',"msg"=> "Le produit est supprimé avec succès de la commande.");

		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteProductFromCommandById [QUOTATION] ------- ");
		return $return;	
	}
}
?>