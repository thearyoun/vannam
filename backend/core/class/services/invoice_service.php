<?php

namespace UTILE;

class InvoiceService implements InvoiceInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key, $zonageCityBean) {
		return null ;
	}

	public function updateEntityById ($key, $zonageCityBean) {
		return null;	
	}

	public function getAllEntities ($key, $companyId) {
		return null;
	}

	public function getEntityById ($key, $id) {
		return null;	
	}

	public function deleteEntityById ($key, $id) {
		return null;	
	}	

	public function getAllInvoicesByCriteria ($key, $criteria, $companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllInvoicesByCriteria [INVOICES] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$data = array ();
		if ($currentTime < $token['validation_date']){

			$sqlID 		= "" ;
			if (!empty($criteria->get_num())) {
				$sqlID 	= " and iv.id like '%{$criteria->get_num()}%' " ;
			}
			$sqlClient 	= "" ;
			if (!empty($criteria->get_client())) {
				$sqlClient = " and cmd.client_id in (select id from clients where company_name like '%{$criteria->get_client()}%' or contact_name like '%{$criteria->get_client()}%' or contact_firstname like '%{$criteria->get_client()}%' ) " ;
			}

			$sqlStartDate 		= "" ;
			if (!empty($criteria->get_startDate())) {
				$sqlStartDate 	= " and iv.creation_date >= '{$criteria->get_startDate()}' " ;
			}

			$sqlEndDate 		= "" ;
			if (!empty($criteria->get_startDate())) {
				$sqlEndDate 	= " and iv.creation_date <= '{$criteria->get_endDate()}' " ;
			}

			$sqlOnlyMyInvoices = "";
			$authorization = \R::getRow("select * from authorization where user_id = :id", array (":id"=>$token['user_id']));
			if ($authorization['role_id'] == 4) {
				$sqlOnlyMyInvoices 	.= " AND cmd.client_id =  ( 
											SELECT client_id 
											FROM authorization 
											WHERE user_id = {$token['user_id']} 
										)  ";
			}
			if ($authorization['role_id'] == 5) {
				$sqlOnlyMyInvoices 	.= " AND cmd.client_id IN (
											SELECT id 
											FROM clients 
											WHERE referer_contact_id = {$token['user_id']}
										) ";
			}

			$invoices 	= \R::getAll ("	select iv.id, iv.creation_date, cl.company_name, (command_prices.total_ht + cmd.transport_amount ) as total_ht,
										if (cmd.tva_exoneration = 0, (command_prices.total_ht + cmd.transport_amount)*0.2, 0) total_tva,
										cmd.is_invoice_excel, cmd.is_invoice_pdf, iv.command_id 
										from invoices iv 
										left join commands cmd on cmd.id = iv.command_id
										left join clients cl on cl.id = cmd.client_id
										left join ( SELECT ROUND(SUM(stock.total * cd.sale_price), 2) total_ht,cd.command_id 
													FROM commanddetails cd 
													LEFT JOIN ( SELECT ROUND(SUM(value), 2) total,command_detail_id 
																FROM `commanddetailstocks` 
																GROUP BY command_detail_id
													) AS stock ON stock.command_detail_id = cd.id 
													GROUP BY cd.command_id 
										) as command_prices on command_prices.command_id = cmd.id
										where iv.company_id = :company_id and is_visible = 1 
										{$sqlID}
										{$sqlClient}
										{$sqlStartDate}
										{$sqlEndDate}
										{$sqlOnlyMyInvoices}
										order by iv.id DESC",
											array (
													":company_id" 	=> $companyId
												  )
										) ;
			
			$data 		= array(	"success" 	=> "true"												,
									"msg"	 	=> "Récupération liste des factures avec succés."	,
									"invoices" 	=> $invoices
							);
			
		}
		else {
			$data = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllInvoicesByCriteria [INVOICES] ------- ");
		return $data;		
	}

	public function hideInvoiceById ($key, $invoiceId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START hideInvoiceById [INVOICES] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$data = array ();
		if ($currentTime < $token['validation_date']){
			$invoice 				= \R::load("invoices", $invoiceId);
			$invoice->is_visible 	= 0 ;
			$invoiceId 				= \R::store($invoice);

			$command 				= \R::load("commands", $invoice->command_id);
			$command->status        = "RESERVED" ;
			$commandId 				= \R::store($command);

			$data 		= array(	"success" 	=> "true"							,
									"msg"	 	=> "Facture cachée avec succés."	
							);
		}
		else {
			$data = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END hideInvoiceById [INVOICES] ------- ");
		return $data;
	}
}

?>