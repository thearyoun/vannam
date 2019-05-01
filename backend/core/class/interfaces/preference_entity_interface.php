<?php

namespace UTILE;

interface PreferenceEntityInterface{

	public function addNewEntity ($key, $entityBean) 	;

	public function updateEntityById ($key, $entityBean) ;	

	public function getAllEntities ($key, $id) 	;

	public function getEntityById ($key, $id) 			;

	public function deleteEntityById ($key, $id) 		;
}

?>