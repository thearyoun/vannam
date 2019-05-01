<?php

namespace UTILE;

class BrandService implements BrandInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key, $brandBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [BRAND] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$brand 				= \R::dispense('brands');
			$brand->name 		= $brandBean->get_name() ;
			$brand->company_id 	= $brandBean->get_companyId() ;
			$brand->marge 		= $brandBean->get_marge() ;
			$idBrand 			= \R::store($brand);

			$return = array("success"=>'true',"msg"=> "La marque est ajoutée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [BRAND] ------- ");
		return $return;	
	}

	public function updateEntityById ($key, $brandBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [BRAND] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$brand 			= \R::load('brands',$brandBean->get_id ());
			$brand->name 	= $brandBean->get_name() ;
			$brand->marge 	= $brandBean->get_marge() ;
			$idBrand 		= \R::store($brand);

			$return 		= array("success"=>'true',"msg"=> "La marque est modifiée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateEntityById [BRAND] ------- ");
		return $return;	
	}	

	public function getAllEntities ($key, $companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [BRAND] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){

			$sqlOnlyMyBrands = "";
			$authorization = \R::getRow("select * from authorization where user_id = :id", array (":id"=>$token['user_id']));
			if ($authorization['role_id'] == 4) {
				$sqlOnlyMyBrands 	= " AND id in (select brand_id from clientbrands where client_id = {$authorization['client_id']})";
			}

			$brands = \R::getAll ("
						SELECT	id,name,marge,
								IF (picture IS NULL , picture,CONCAT('/resources/brands/',picture)) picture 
						FROM brands 
						WHERE company_id = :company_id 
						{$sqlOnlyMyBrands}
						ORDER BY name ASC",
											array (
													":company_id" 	=> $companyId
												  )
										) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération liste des marques avec succés."	,
								"brands" 	=> $brands
							);
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [BRAND] ------- ");
		return $return;	
	}

	public function getEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getEntityById [BRAND] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$brand   = \R::getRow ("select * from brands where id=:id",array (":id"=>$id)) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération de la marque avec succès."	,
								"brand" 		=> $brand
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getEntityById [BRAND] ------- ");
		return $return;	
	}

	public function deleteEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [BRAND] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$brand   	= \R::load ("brands", $id) ;
			\R::trash ($brand);			
			$return = array(	"success" 	=> "true"										,
								"msg"	 	=> "Suppression de la marque avec succès."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [BRAND] ------- ");
		return $return;	
	}

	public function updateBrandLogo ($key, $brand, $files){
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateBrandLogo ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$brandObject = \R::load('brands',$brand->get_id());
			$output = "resources/brands/";
			$urlLogo = "";
			if (!empty($files)) {
				$name = $files['name'];
				$name = str_replace('.','_'.$brandObject->id.'.',$name);
				move_uploaded_file($files['tmp_name'], $output.$name);
				$brandObject->picture = $name;
				$idB = \R::store($brandObject);
				$urlLogo = "/resources/brands/".$name;
			}
						
			$return = array("success"=>'true',"msg"=> "Ajout Photo avec succés.","url_logo"=>$urlLogo);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateBrandLogo ------- ");
		return $return;	
	}

	public function deletePictureOfCurrentBrand($key, $id){
    	$logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('---------- deletePictureOfCurrentBrand ----------');
        $token = \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
       	$currentTime = time();
        $data = array ();
        if ($currentTime < $token['validation_date']){
			$brand = \R::load('brands',$id);
			$filePath = "/resources/brands/{$brand->picture}";
			unlink (getcwd().$filePath);
			$brand->import(json_decode('{"picture":null}'));
			$idB = \R::store($brand);
            $data = array("success"=>'true',"msg"=> "Suppression photo avec succés.");
       	}
        else {
        	$data = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
        }
        $logger->debug('-----------------------------------------------------------------------------------');
        return $data;
	}
}

?>