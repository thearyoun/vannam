<?php

namespace UTILE;

interface ToolsInterface {
	
	public function getAllCompanies ($key) 								;
	public function getAllManagers ($key, $companyId) 					;
	public function createMiniatureForProduct(	$width				, 
												$height				,
												$type				,
												$originalPicture	,	 
												$miniaturePicture) 		;
}

?>