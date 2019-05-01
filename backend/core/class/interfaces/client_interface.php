<?php

namespace UTILE;

interface ClientInterface extends PreferenceEntityInterface{
	
	public function createAuthorizationForClient ($key, $authorizationBean, $userBean) 		;
	public function updateAuthorizationClient ($key, $userBean, $clientBean) 				;
	public function getAllClientsByCompany ($key, $id, $query, $fileType)					;
	public function updateBrandsForClientAuthorization ($key, $clientId, $brands) 			;
	public function updateCategoriesForClientAuthorization ($key, $clientId, $categories)	;
	public function getStatsById ($key, $clientId)											;	
}

?>