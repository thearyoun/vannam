<?php

namespace UTILE;

interface CommandInterface extends PreferenceEntityInterface{
	public function getCommandDocumentById ($key, $id, $typeRendering, $isImage, $formatStock, $vanamPrice, $header, $companyId) 	;
	public function getCommandLissageById ($key, $productId, $quantity, $commandId)  ;
	public function getAllCommandsByCriteria ($key, $criteria, $companyId);
	public function addFileToCommandById ($key, $commandId, $files) ;
	public function deleteFileFromCommandById($key, $id, $fileId) ;
	public function generateProformaOrInvoiceById ($key, $commandId, $typePayment, $typePrint, $typeDocument)	;
	public function generateInvoiceById ($key, $commandId) ;
	public function printBpOfCommandById ($key, $commandId) ;
	public function convertCommandToQuotationById ($key, $commandId)	;
}

?>