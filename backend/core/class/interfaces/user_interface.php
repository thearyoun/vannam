<?php

namespace UTILE;

interface UserInterface extends PreferenceEntityInterface{
	
	public function getUserById ($key, $id, $companyId)			;
	public function authentifyUser ($userBean) 						;
	public function logoutUser ($key)								;
	public function savePictureOfUser($key, $userId, $files)		;
	public function deletePictureOfCurrentUser($key, $id)			;
}

?>