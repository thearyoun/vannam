<?php

namespace UTILE;

interface QuotationInterface extends PreferenceEntityInterface{
	public function getQuotationDocumentById ($key, $id, $typeRendering, $isImage, $formatStock, $vanamPrice, $header, $companyId) 	;
	public function getQuotationLissageById ($key, $productId, $quantity, $quotationId)  ;
	public function duplicateQuotationById ($key, $id) ;
	public function convertQuotationToCommandById ($key, $id) ;
	public function getAllQuotationsByCriteria ($key, $criteria, $companyId) ;
	public function deleteProductFromQuotationById ($key, $quotationId, $productId) ;
}

?>