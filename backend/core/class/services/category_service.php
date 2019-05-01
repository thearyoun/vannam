<?php

namespace UTILE;

class CategoryService implements PreferenceEntityInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key, $categoryBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [CATEGORY] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$category 				= \R::dispense('categories');
			$category->name 		= $categoryBean->get_name() ;
			$category->company_id 	= $categoryBean->get_companyId() ;
			$idCategory 			= \R::store($category);

			$return = array("success"=>'true',"msg"=> "La catégorie est ajoutée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [CATEGORY] ------- ");
		return $return;	
	}

	public function updateEntityById ($key, $categoryBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [CATEGORY] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$category 			= \R::load('categories',$categoryBean->get_id ());
			$category->name 	= $categoryBean->get_name() ;
			$idCategory			= \R::store($category);

			$return 		= array("success"=>'true',"msg"=> "La catégorie est modifiée avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateEntityById [CATEGORY] ------- ");
		return $return;	
	}	

	public function getAllEntities ($key, $companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [CATEGORY] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){

			$sqlOnlyMyCategories = "";
			$authorization = \R::getRow("select * from authorization where user_id = :id", array (":id"=>$token['user_id']));
			if ($authorization['role_id'] == 4) {
				$sqlOnlyMyCategories 	= " AND id in (select category_id from clientcategories where client_id = {$authorization['client_id']})";
			}

			$categories = \R::getAll ("	SELECT * 
										FROM categories 
										WHERE company_id = :company_id 
										{$sqlOnlyMyCategories}
										ORDER BY name ASC",
											array (
													":company_id" 	=> $companyId
												  )
										) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération liste des catégories avec succés."	,
								"categories" 	=> $categories
							);
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [CATEGORY] ------- ");
		return $return;	
	}

	public function getEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getEntityById [CATEGORY] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$category   = \R::getRow ("select * from categories where id=:id",array (":id"=>$id)) ;
			
			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération de la catégorie avec succès."	,
								"category" 		=> $category
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getEntityById [CATEGORY] ------- ");
		return $return;	
	}

	public function deleteEntityById ($key, $id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [CATEGORY] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$category   	= \R::load ("categories", $id) ;
			\R::trash ($category);			
			$return = array(	"success" 	=> "true"										,
								"msg"	 	=> "Suppression de la catégorie avec succès."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [CATEGORY] ------- ");
		return $return;	
	}
}

?>