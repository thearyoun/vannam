<?php

namespace UTILE;

interface EntryEventInterface extends PreferenceEntityInterface{
	
	public function getAllEntryEventsByCriteria ($key, $companyId, $criteria)												;
	public function deleteProductFromEntryEvent ($key, $entryEventDetailId)													;
	public function updateStockProductRangeOfEntryEvent ( $key, $productId, $entryEventDetailId, $rangeDetailId, $newValue)	;
	public function printCurrentEntryEvent ($key, $id, $ratePrice, $purchasePrice) 											;
	public function makeDataAsNewTable($key, $fileName, $data)																;
	public function injectDataAndUpdateProducts($key, $data, $companyId)													;
	public function getEntryEventByIdAndByPage ($key, $id, $nbElements, $page)  											;
	public function importPicturesFromZipFile ($key, $file)																	;
	public function getEntryEventDetailStockById ($key, $entryDetailId)													;
}

?>