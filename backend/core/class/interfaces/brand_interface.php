<?php

namespace UTILE;

interface BrandInterface extends PreferenceEntityInterface{
	
	public function updateBrandLogo ($key, $brand, $files) 	;
	public function deletePictureOfCurrentBrand($key, $id) 	;
}

?>