<?php

namespace UTILE;

class FileHelper{

	public function __construct(){

	}

	public function generatePdfFile(	$products 								,
										$userId									,
										$isImages								,
										$isPAchat								,
										$isPTarif								,
										$isPPublic								,
										$isPVanam								,
										$isZonage								,
										$isByZone								,
										$isTransport							,
										$format_stock 							,
										$typeDocument							,
										$headerObject							,
										$quotationInformationObject				,
										$clientInformationObjectForQuotation	,
										$commandInformationObject				,
										$clientInformationObjectForCommand		,
										$printWithHeader 
									) {

		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START generatePdfFile ------- ");

		$typeSelection = 'categorie' ;
		if ($isByZone) {
			$typeSelection = 'location' ;
		}

		$tabProductsByCategories = array_column($products, NULL, $typeSelection);
		$tabProductsByCategories = array_map(function($val) { return array(); }, $tabProductsByCategories);
		
		foreach ($products as $product) {
			if (!isset($tabProductsByCategories[$product[$typeSelection]][$product['brand']])) {
				$tabProductsByCategories[$product[$typeSelection]][$product['brand']] = [] ;
			}
			array_push($tabProductsByCategories[$product[$typeSelection]][$product['brand']] ,  $product) ;
		}		

		$pdf = new \UTILE\PdfHelper();
		$pdf->AliasNbPages();			
		$pdf->AddPage();
		$pdf->generatePagesOfExtract(	$tabProductsByCategories				,
										$isImages								,
										$isPAchat								,
										$isPTarif								,
										$isPPublic								,
										$isPVanam								,
										$isZonage								,
										$isTransport							,
										$format_stock							,			
										$typeDocument							,
										$headerObject							,
										$quotationInformationObject				,
										$clientInformationObjectForQuotation	,
										$commandInformationObject				,
										$clientInformationObjectForCommand		,
										$printWithHeader
									) ;
		if ( $typeDocument == 1 ) {
			$urlFile = "templates/produits/produits_{$userId}.pdf"; 
		}
		else if ( $typeDocument == 2 ) {
			$urlFile = "templates/quotations/devis_{$userId}.pdf"; 
		}
		else if ( $typeDocument == 3 ) {
			$urlFile = "templates/commands/commandes_{$userId}.pdf"; 
		}
		$pdf->Output($urlFile,'F');

		$logger->debug("END generatePdfFile ------- ");
		return $urlFile ;
	}

	public function generateXlsxProductsFile(	$products 		,
												$userId 		,
												$isImages		,
												$isPAchat		,
												$isPTarif		,
												$isPPublic		,
												$isPVanam		,
												$format_stock	,
												$typeDocument
											) {

		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START generateXlsxProductsFile ------- ");

		$excel 		= new \UTILE\ExcelHelper();
		$urlFile 	= $excel->generateExcelProductsFileFromData (	$products 		,
																	$userId 		,
																	$isImages		,
																	$isPAchat		,
																	$isPTarif		,
																	$isPPublic		,
																	$isPVanam		,
																	$format_stock	,
																	$typeDocument
																); 

		$logger->debug("END generateXlsxProductsFile ------- ");
		return $urlFile ;
	}

	public function generateXlsxEntryEventFile(	$entryEnvent 	,
												$userId 		,
												$isPTarif		,
												$isPAchat		
											) {

		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START generateXlsxEntryEventFile ------- ");



		$excel 		= new \UTILE\ExcelHelper();
		$urlFile 	= $excel->generateXlsxEntryEventFile (	$entryEnvent 	,
															$userId 		,
															$isPTarif		,
															$isPAchat
														); 

		$logger->debug("END generateXlsxEntryEventFile ------- ");
		return $urlFile ;
	}

	public function getAllHeadersOfCurrentEntryEventsFile ($key,$files) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllHeadersOfCurrentEntryEventsFile ------- ");

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){

			$excel 	= new \UTILE\ExcelHelper();
			$data 	= $excel->prepareImportEntryEventFile (	$token['user_id'] 		,
															$files
														  );
			$return = array("success"=>"true" , "headers"=>$data['headers']) ;			 
		}
		$logger->debug("END generateXlsxEntryEventFile ------- ");
		return $return ;
	}

	public function createNewExcelFileUsingNewColumnsFormat($userId,$fileName,$data) {
		
		$excel 		= new \UTILE\ExcelHelper();
		$newData 	= $excel->createNewEntryEventFileAsNewFormat ($userId,$fileName,$data);
		return $newData ;
	}

	public function generateProformaOrInvoicePDF ($userId, $commandId, $company, $client, $products, $transport, $typePayment, $typeDocument, $change, $isExenorateTVA, $billDate) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START generateProformaOrInvoicePDF ------- ");
		
		$totAllAmount = 0 ;
		foreach($products as $product){
			$totAllAmount += $product['qte']*$product['sale_price'] ; 
		}
		$tabProducts 	= array_chunk($products, 12) ;
		$nbPages 		= count($tabProducts) ;
		$currentPage	= 1 ;
		$urlFile 		= "templates/commands/proforma_{$userId}.pdf" ;
		if ($typeDocument == INVOICE_TYPE) {
			$urlFile 		= "templates/commands/facture_{$userId}.pdf" ;
		}
		$pdf 			= new \UTILE\PdfHelper();
		$pdf->AliasNbPages();		
		foreach ($tabProducts as $productsData)	 {
			$pdf->AddPage();
			$pdf->generateProformaOrInvoiceDocument($company, $commandId, $client, $productsData, $transport, $totAllAmount, $nbPages, $currentPage, $typePayment, $typeDocument, $change, $isExenorateTVA, $billDate) ;
			$currentPage ++ ;
		}
		$pdf->Output($urlFile, 'F');
		$logger->debug("END generateProformaOrInvoicePDF ------- ");
		return $urlFile ;
	}

	public function generateProformaOrInvoiceEXCEL ($userId, $commandId, $company, $client, $products, $transport, $typePayment, $typeDocument, $change, $isExenorateTVA) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START generateProformaEXCEL ------- ");

		$tabProducts 	= array_chunk($products, 11) ;
		$nbPages 		= count($tabProducts) ;
		$currentPage	= 1 ;

		$excel 		= new \UTILE\ExcelHelper();
		foreach ($tabProducts as $productsData)	 {
			$urlFile 	= $excel->generateXlsxProformaOrInvoiceFile ($userId, $commandId, $company, $client, $typePayment, $transport, $tabProducts, $typeDocument, $change, $isExenorateTVA); 
		}
		$logger->debug("END generateProformaEXCEL ------- ");
		return $urlFile ;
	}

	public function generateBpPDF ($userId, $commandDetails, $commandId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START generateBpPDF ------- ");

		$tabLines 		= array_chunk($commandDetails, 9) ;
		$nbPages 		= count($tabLines) ;
		$currentPage	= 1 ;
		$pdf 			= new \UTILE\PdfHelper();
		$urlFile 		= "templates/commands/bon_preparation_{$userId}.pdf" ;
		$pdf->AliasNbPages();
		$totalProduct = 0 ;
		foreach ($tabLines as $line) {
			$pdf->AddPage();
			$pdf->generateBpDocument($line, $commandId, $nbPages, $currentPage, $totalProduct) ;
			$currentPage ++ ;
		}
		$pdf->Output($urlFile, 'F');

		$logger->debug("END generateBpPDF ------- ");
		return $urlFile ;
	}

	public function generateAllCustomers($clients, $userId) {

		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START generateAllCustomers ------- ");

		$excel 		= new \UTILE\ExcelHelper();
		$urlFile 	= $excel->generateAllCustomers ($clients, $userId); 

		$logger->debug("END generateAllCustomers ------- ");
		return $urlFile ;
	}

}

?>