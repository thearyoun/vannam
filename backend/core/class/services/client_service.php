<?php

namespace UTILE;

class ClientService{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key, $clientBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [CLIENT] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$client = \R::dispense('clients');
			$client->company_id 			= $clientBean->get_companyId() ;
			$client->company_name 			= $clientBean->get_companyName() ;
			$client->siret 					= $clientBean->get_siret() ;
			$client->tva_intra 				= $clientBean->get_tvaIntra() ;
			$client->ape_code 				= $clientBean->get_apeCode() ;
			$client->capital 				= $clientBean->get_capital() ;
			$client->site_url 				= $clientBean->get_siteUrl() ;
			$client->contact_name 			= $clientBean->get_contactName() ;
			$client->contact_firstname 		= $clientBean->get_contactFirstName() ;
			$client->contact_tel_line 		= $clientBean->get_contactTelLine() ;
			$client->contact_mobile_line 	= $clientBean->get_contactMobileLine() ;
			$client->contact_fax 			= $clientBean->get_contactFax() ;
			$client->contact_email 			= $clientBean->get_contactEmail() ;
			$client->referer_contact_id 	= $clientBean->get_refererContactId() ;

			$idClient 	= \R::store($client);
			$client 	= \R::load('clients',$idClient);

			$return = array(	"success"	=> 'true'								,
								"msg"		=> "Le client est ajouté avec succés."	,
								"client"	=> $client
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [CLIENT] ------- ");
		return $return;	
	}

		public function updateEntityById ($key, $clientBean)  {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [CLIENT] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$client = \R::load('clients',$clientBean->get_id());
			$client->company_id 			= $clientBean->get_companyId() ;
			$client->company_name 			= $clientBean->get_companyName() ;
			$client->siret 					= $clientBean->get_siret() ;
			$client->tva_intra 				= $clientBean->get_tvaIntra() ;
			$client->ape_code 				= $clientBean->get_apeCode() ;
			$client->capital 				= $clientBean->get_capital() ;
			$client->site_url 				= $clientBean->get_siteUrl() ;
			$client->contact_name 			= $clientBean->get_contactName() ;
			$client->contact_firstname 		= $clientBean->get_contactFirstName() ;
			$client->contact_tel_line 		= $clientBean->get_contactTelLine() ;
			$client->contact_mobile_line 	= $clientBean->get_contactMobileLine() ;
			$client->contact_fax 			= $clientBean->get_contactFax() ;
			$client->contact_email 			= $clientBean->get_contactEmail() ;
			$client->referer_contact_id 	= $clientBean->get_refererContactId() ;

			$idClient 	= \R::store($client);
			$client 	= \R::load('clients',$idClient);

			$return = array(	"success"	=> 'true'								,
								"msg"		=> "Le client est modifiée avec succés."	,
								"client"	=> $client
							);
		}
		else {
			$return = array("success" =>'false',"msg" => "Le token n'est plus valide !","err_code" => "100");
		}
		
		$logger->debug("END updateEntityById [CLIENT] ------- ");
		return $return;	
	}

	public function deleteEntityById ($key, $id){
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [ENTITY] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			\R::exec('UPDATE clients set is_activate = 0  where id ='.$id) ;

			$return = array(	"success"	=> 'true'										,
								"msg"		=> "La suppression du client est faite avec succés."		
							);
		}
		else {
			$return = array("success" => 'false',"msg" => "Le token n'est plus valide !","err_code" => "100");
		}
		
		$logger->debug("END deleteEntityById [ENTITY] ------- ");
		return $return;	
	}

	public function getAllEntities ($key, $id) {
		
	}

	public function getEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getEntityById [CLIENT] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			
			$client = \R::getRow ('select * from clients where id=:id',array (':id'=>$id));
			$client['capital'] = $client['capital'] == 0 ? NULL : $client['capital'] ; 
			
			$client['authorization'] 	= \R::getRow ('select id,mail as authorization_contact_mail , passwd as authorization_contact_passwd,
											name as contact_name,firstname as contact_firstname, mobile_line as contact_mobile_line,
											direct_line as contact_direct_line from users where id = (
											select user_id from authorization where client_id=:id)',array (":id"=>$id));
			$client['authorization']['brands']		 	= \R::getAll("select id,name from brands where id in (
																			select brand_id from clientbrands where client_id = :id)
																	",array (":id"=>$id));
			$client['authorization']['categories']		= \R::getAll("select id,name from categories where id in (
																			select category_id from clientcategories where client_id = :id
																	)",array (":id"=>$id));
			$return = array(	"success"	=> 'true'										,
								"msg"		=> "Le client est récupérée avec succés."		,
								"client"	=> $client
							);
		}
		else {
			$return = array("success" => 'false',"msg" => "Le token n'est plus valide !","err_code" => "100");
		}
		
		$logger->debug("END getEntityById [CLIENT] ------- ");
		return $return;	
	}

	public function createAuthorizationForClient ($key, $authorizationBean, $userBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START createAuthorizationForClient ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){

			$user 				= \R::dispense('users');
			$user->name 		= $userBean->get_name() ;
			$user->firstname 	= $userBean->get_firstname() ;
			$user->mail 		= $userBean->get_mail() ;
			$user->passwd 		= $userBean->get_passwd() ;
			$user->mobile_line 	= $userBean->get_mobileLine() ;
			$user->direct_line 	= $userBean->get_directLine() ;
			$idUser 			= \R::store($user);

			foreach ($authorizationBean->get_brands() as $brand) {
				$sql = "INSERT INTO clientbrands (client_id,brand_id) VALUES ({$authorizationBean->get_clientId()},{$brand->get_id()})";
				\R::exec($sql);
			}

			foreach ($authorizationBean->get_categories() as $category) {
				$sql = "INSERT INTO clientcategories (client_id,category_id) VALUES ({$authorizationBean->get_clientId()},{$category->get_id()})";
				\R::exec($sql);
			}

			$authorization 				= \R::dispense('authorization');
			$authorization->role_id 	= $authorizationBean->get_roleId() ;
			$authorization->company_id 	= $authorizationBean->get_companyId() ;
			$authorization->client_id 	= $authorizationBean->get_clientId() ;
			$authorization->user_id 	= $idUser ;
			$idAutho 					= \R::store($authorization);

			$client 							= \R::load("clients",$authorizationBean->get_clientId());
			$client->is_authorization_access 	= 1 ;
			$idC 								= \R::store($client);

			$return = array(	"success"	=> 'true'								,
								"msg"		=> "L'autorisation de client est ajoutée avec succés."	
							);
		}
		else {
			$return = array("success" => 'false',"msg" => "Le token n'est plus valide !","err_code" => "100");
		}
		
		$logger->debug("END createAuthorizationForClient ------- ");
		return $return;	
	}

	public function updateAuthorizationClient ($key, $userBean, $clientBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START createAuthorizationForClient [CLIENTS] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){

			$client 							= \R::load("clients",$clientBean->get_id());
			$client->is_authorization_access 	= $clientBean->get_isAuthorizationAccess();
			$idC 								= \R::store($client);

			$authorization 						= \R::getRow("select * from authorization where client_id=:id",array (":id"=>$clientBean->get_id()));

			$user          						= \R::load ("users",$authorization['user_id']);
			$user->mail 						= $userBean->get_mail();
			$user->passwd 						= $userBean->get_passwd();
			$user->activate 					= $clientBean->get_isAuthorizationAccess();
			$idU 								= \R::store ($user);

			$return = array(	"success"	=> 'true'								,
								"msg"		=> "L'autorisation de client est modifiée avec succés."	
							);
		}
		else {
			$return = array("success" =>'false',"msg" => "Le token n'est plus valide !","err_code" => "100");
		}
		
		$logger->debug("END createAuthorizationForClient [CLIENTS] ------- ");
		return $return;	
	}

	public function getAllClientsByCompany ($key, $id, $query, $fileType) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllClientsByCompany [CLIENTS] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$andQuery 			= "";
			$currentUserAuth 	= \R::getRow('select * from authorization where user_id = :id',array (":id"=>$token['user_id']));
			$andForAgent		= "";

			if ($currentUserAuth['role_id'] == 5) {
				$andForAgent	= " and c.referer_contact_id = {$token['user_id']}";
			}
			
			if (!empty($query)) {
				$andQuery = " and (
									c.company_name like '%{$query}%' or 
									c.contact_name like '%{$query}%' or
									c.contact_firstname like '%{$query}%' or
									c.contact_email like '%{$query}%' or
									ca.city like '%{$query}%' or
									u.name like '%{$query}%' or
									u.firstname like '%{$query}%' or
									ct.name like '%{$query}%'
								) ";
			}
			$clients = \R::getAll ("select c.id,c.company_name,concat(c.contact_name,' ',c.contact_firstname) contact ,
										   c.contact_email,ca.city,ct.name as country,c.is_authorization_access,
										   if (c.is_authorization_access = 1 , 'OUI' , 'NON') access_live,
										   c.contact_tel_line , ca.address, ca.postal_code, ca.city, ct.name country
										from clients c 
											left join clientaddresses ca on  ( c.id=ca.client_id and ca.is_billing_address = 1) 
											left join users u on u.id = c.referer_contact_id 
											left join countries ct on ct.id = ca.country
										where c.company_id=:id 
											and c.is_activate = 1
											{$andQuery} {$andForAgent}
										 order by c.id desc",array(":id"=>$id)) ;
			if ($fileType == null) {
				$return = array(	"success"	=> 'true'												,
									"msg"		=> "La liste des client est récupérée avec succés."		,
									"clients"	=> $clients
								);
			}
			else if ($fileType == 1 ) {
				$fileHelper = new \UTILE\FileHelper ();
				$urlFile 	= $fileHelper->generateAllCustomers ($clients, $token['user_id']);
				
				$return 	= array("success"	=> 'true'												,
									"msg"		=> "La liste des clients est récupérée avec succés."	,
									"url_file"	=> $urlFile
							);
			}
		}
		else {
			$return = array("success" => 'false',"msg" => "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllClientsByCompany [CLIENTS] ------- ");
		return $return;	
	}

	public function updateBrandsForClientAuthorization ($key, $clientId, $brands) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateBrandsForClientAuthorization [CLIENTS] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			\R::exec('DELETE FROM clientbrands where client_id ='.$clientId) ;
			foreach ($brands as $brand) {
				\R::exec("INSERT INTO clientbrands (client_id,brand_id) values ({$clientId},{$brand['id']})") ;
			}
			$return = array(	"success"	=> 'true'										,
								"msg"		=> "L'authorisation client pour la marque est ajoutée avec succés."		
							);
		}
		else {
			$return = array("success" => 'false',"msg" => "Le token n'est plus valide !","err_code" => "100");
		}
		
		$logger->debug("END updateBrandsForClientAuthorization [CLIENTS] ------- ");
		return $return;	
	}

	public function updateCategoriesForClientAuthorization ($key, $clientId, $categories) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateCategoriesForClientAuthorization [CLIENTS] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			\R::exec('DELETE FROM clientcategories where client_id ='.$clientId) ;
			foreach ($categories as $category) {
				\R::exec("INSERT INTO clientcategories (client_id,category_id) values ({$clientId},{$category['id']})") ;
			}

			$return = array(	"success"	=> 'true'										,
								"msg"		=> "L'authorisation client pour la catégorie est ajoutée avec succés."		
							);
		}
		else {
			$return = array("success" => 'false',"msg" => "Le token n'est plus valide !","err_code" => "100");
		}
		
		$logger->debug("END updateCategoriesForClientAuthorization [CLIENTS] ------- ");
		return $return;	
	}

	public function getStatsById ($key, $clientId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getStatsById [CLIENTS] ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){

			$sqlQuotations 	= "	SELECT qt.id, qt.creation_date, if ( t_s.total is null , 0 , t_s.total ) total 
								FROM quotations qt 
								LEFT JOIN (	SELECT ROUND(SUM(qtds.value * qtd.sale_price),2) total, qtd.quotation_id 
											FROM quotationdetailstocks qtds
            								LEFT JOIN quotationdetails qtd ON qtds.quotation_detail_id = qtd.id
											GROUP BY qtd.quotation_id 
							  			) AS t_s ON t_s.quotation_id = qt.id
								WHERE qt.client_id = :id" ;
			$quotations 	= \R::getAll($sqlQuotations, array (":id" => $clientId)) ;

			$sqlCommands 	= "	SELECT cmd.id, cmd.creation_date, if ( t_s.total is null , 0 , t_s.total ) total 
								FROM commands cmd 
								LEFT JOIN ( SELECT ROUND(SUM(cmdds.value * cmdd.sale_price),2) total, cmdd.command_id 
											FROM commanddetailstocks cmdds 
											LEFT JOIN commanddetails cmdd ON cmdds.command_detail_id = cmdd.id 
											GROUP BY cmdd.command_id 
										) AS t_s ON t_s.command_id = cmd.id 
								WHERE cmd.client_id = :id 
								AND cmd.id NOT IN ( SELECT command_id FROM invoices )" ;
			$commands 		= \R::getAll($sqlCommands, array (":id" => $clientId)) ;

			$sqlInvoices 	= "	SELECT cmd.id, cmd.creation_date, if ( t_s.total is null , 0 , t_s.total ) total 
								FROM commands cmd 
								LEFT JOIN ( SELECT ROUND(SUM(cmdds.value * cmdd.sale_price),2) total, cmdd.command_id 
											FROM commanddetailstocks cmdds 
											LEFT JOIN commanddetails cmdd ON cmdds.command_detail_id = cmdd.id 
											GROUP BY cmdd.command_id 
										) AS t_s ON t_s.command_id = cmd.id 
								WHERE cmd.client_id = :id 
								AND cmd.id IN ( SELECT command_id FROM invoices )" ;
			$invoices 		= \R::getAll($sqlCommands, array (":id" => $clientId)) ;	

			$stats 			= array ("quotations" => $quotations, "commands" => $commands, "invoices" => $invoices) ;		

			$return 		= array(	"success"	=> 'true'											,
										"msg"		=> "Les stats client sont récupérés avec succés."	,	
										"stats" 	=> $stats	
									);
		}
		else {
			$return = array("success" => 'false',"msg" => "Le token n'est plus valide !","err_code" => "100");
		}
		
		$logger->debug("END getStatsById [CLIENTS] ------- ");
		return $return;
	}
}

?>