<?php

namespace UTILE;

interface ProductInterface extends PreferenceEntityInterface{
	
	public function getProductsByCriteria ($key, $criteria) 							;
	public function addPicturesForProduct ($key, $product, $files) 						;
	public function deletePictureFromProductCatalog($key, $pictureId)					;
	public function updateDefaultPicturesOfProduct ($key, $productId, $pictureId)		;
	public function updateProductZonage($key, $locationBean)							;
	public function getStatsById ($key, $productId)											;	

}

?>