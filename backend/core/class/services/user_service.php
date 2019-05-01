<?php

namespace UTILE;

class UserService implements UserInterface{
    
	public function __construct(){
	
	}

	public function addNewEntity ($key,$userBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START addNewEntity [USER] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$user = \R::dispense('users');
			$user->name 		= $userBean->get_name() ;
			$user->firstname 	= $userBean->get_firstname() ;
			$user->mail 		= $userBean->get_mail() ;
			$user->passwd 		= $userBean->get_passwd() ;
			$user->mobile_line 	= $userBean->get_mobileLine() ;
			$user->direct_line 	= $userBean->get_directLine() ;
			//$user->picture 		= $userBean->get_picture() ;
			$idUser = \R::store($user);

			$authorization = \R::dispense('authorization');
			$authorization->role_id = $userBean->get_roleId() ;
			$authorization->company_id = $userBean->get_companyId() ;
			$authorization->user_id = $idUser ;
			$idAutho = \R::store($authorization);

			$return = array("success"=>'true',"msg"=> "L'utilisateur est ajouté avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END addNewEntity [USER] ------- ");
		return $return;	
	}

	public function updateEntityById ($key,$userBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START updateEntityById [USER] ------- ");
		$logger->debug($key);

		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$user = \R::load('users',$userBean->get_id ());
			$user->name 		= $userBean->get_name() ;
			$user->firstname 	= $userBean->get_firstname() ;
			$user->mail 		= $userBean->get_mail() ;
			$user->passwd 		= $userBean->get_passwd() ;
			$user->mobile_line 	= $userBean->get_mobileLine() ;
			$user->direct_line 	= $userBean->get_directLine() ;
			$user->activate 	= $userBean->get_activate() ;
			//$user->picture 		= $userBean->get_picture() ;

			$idUser = \R::store($user);

			$auth = \R::getRow('select * from authorization where user_id = :id',array (":id"=>$userBean->get_id ()));
			$auth['role_id'] = $userBean->get_roleId () ;
			$authObject = \R::dispense ('authorization');
			$authObject->import($auth);
			$idAuth = \R::store ($authObject);

			$return = array("success"=>'true',"msg"=> "L'utilisateur est modifié avec succés.");
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END updateENTITYById [USER] ------- ");
		return $return;	
	}	

	public function getAllEntities ($key,$companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllEntities [USER] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$currentUser = \R::load ('users',$token["user_id"]) ;
			$authorization = \R::getRow ("select * from authorization where user_id = :user_id and company_id = :company_id",
											array (
													":user_id" 		=> $token['user_id'] ,
													":company_id" 	=> $companyId
												  )
										) ;
			if (in_array ($authorization['role_id'],array(1,2))) {
				$inStatment  = "role_id not in (1,4)" ;
				if ($authorization['role_id'] == 2) {
					$inStatment  = "role_id not in (1,2,4)" ;
				}
				$users = \R::getAll("select id,name,firstname,mail,mobile_line,direct_line,passwd,activate,passwd,
									if ( picture is not null ,concat('resources/users/logos/',picture) , '') url_picture from users where id in (
										 select user_id from authorization where {$inStatment} and company_id =:company_id
										) ",array (":company_id" 	=> $companyId));
				foreach ($users as &$user) {
					$authorizationUser = \R::getRow ("select * from authorization where user_id = :user_id and company_id = :company_id",
											array (
													":user_id" 		=> $user['id'] ,
													":company_id" 	=> $companyId
												  )
										);
					$user['role_id'] = $authorizationUser['role_id'];
					$user['role'] = \R::getRow ('select * from roles where id = :id',array (':id'=>$authorizationUser['role_id']));
				}
				$return = array(	"success" 	=> "true"												,
									"msg"	 	=> "Récupération liste des utilisateurs avec succés."	,
									"users" 	=> $users
								);
			}
			else {
				$return = array(	"success" 	=> "false"												,
									"msg"	 	=> "Impossible de récupérer la liste des utilisateurs."	,
									"users" 	=> null
								);
			}
			
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getAllEntities [USER] ------- ");
		return $return;	
	}
	
	public function getEntityById ($key, $id) {

	}

	public function getUserById ($key, $id, $companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getUserById ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();

		$return = array ();
		if ($currentTime < $token['validation_date']){
			$user   = \R::getRow ("select id,name,firstname,mail,mobile_line,direct_line,passwd,activate,
									if ( picture is not null ,concat('resources/users/logos/',picture) , '') url_picture 
									from users where id=:id",array (":id"=>$id)) ;
			
			$authorizationUser = \R::getRow ("select * from authorization where user_id = :user_id and company_id = :company_id",
											array (
													":user_id" 		=> $id ,
													":company_id" 	=> $companyId
												  )
										);
			$user['role_id'] = $authorizationUser['role_id'];
			$user['role'] = \R::getRow ('select * from roles where id = :id',array (':id'=>$authorizationUser['role_id']));

			$return = array(	"success" 	=> "true"												,
								"msg"	 	=> "Récupération de l'utilisateur avec succès."	,
								"user" 		=> $user
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END getUserById ------- ");
		return $return;	
	}

	public function deleteEntityById ($key,$id) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START deleteEntityById [USER] ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$user   	= \R::load ("users", $token['user_id']) ;
			$logger->debug("{$user->name} {$user->firstname} is deleting user id = {$id}");
			\R::exec('DELETE FROM authorization where user_id='.$id);
			$userDel	= \R::load ('users',$id);
			\R::trash ($userDel);

			
			$return = array(	"success" 	=> "true"										,
								"msg"	 	=> "Suppression de l'utilisateur avec succès."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END deleteEntityById [USER] ------- ");
		return $return;	
	}

	public function authentifyUser ($userBean) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug('---------- authentifyUser ----------');
		
		$data = array ();
		
		$user = \R::getRow( "select u.id,u.name,u.firstname,u.mail,u.mobile_line,u.direct_line,u.passwd,
									concat('resources/users/logos/',u.picture) url_picture
								 from users u
								 	where 
								 		u.mail like :mail 
								 	and 
								 		u.passwd like :passwd 
								 	and 
								 		u.activate = 1 ", 
								array(	':mail' 	=> $userBean->get_mail(),
										':passwd'  	=> $userBean->get_passwd()
									  ) 
						   );

		$user['role'] = \R::getRow ('select * from roles where id in (
										select role_id from authorization where company_id = (
											select company_id from authorization where user_id=:id order by id ASC limit 1
											)
										and user_id = :id
									)',
										array (
												':id'         => $user['id']
											));
		$user['role_id'] = $user['role']['id'] ;
		
		$user['company'] = \R::getRow ("select id,name,concat('resources/companies/',logo) url_logo 
									from companies where id = (
											select company_id from authorization where user_id=:id order by id ASC limit 1
											)",
										array (':id' => $user['id']));
		if ($user['role']['id'] == 4){
			$user['referer_contact'] =  \R::getRow("select concat('resources/users/logos/',u.picture) url_picture , u.mail,u.mobile_line,u.name,u.firstname
										from users u where id = (
											select referer_contact_id from clients where id=(
												select client_id from authorization where user_id= :id
											)
										)",array(":id"=>$user['id']));
			$user['client_infos']   = \R::getRow ("	select c.contact_tel_line,c.contact_mobile_line,c.company_name,c.id,contact_email, ca.address
													from clients c
													left join authorization at on at.client_id = c.id
													left join clientaddresses ca on ( ca.client_id = c.id and is_billing_address = 1 )
													where at.user_id = :id",array(":id"=>$user['id'])) ;
		}
		$activationKey = $user != null ? md5(microtime().rand()) : null;
		$status = false ;			
		if($activationKey != null){
			$status = true ;		
			$currentTime = time();
			$tokenArray 	= \R::getRow("SELECT * FROM token where user_id = :user_id" , array(":user_id" =>$user["id"] ));
			if (!empty($tokenArray)){
				$token 			= \R::load( 'token', $tokenArray['id'] );
				$currentTime = time();		
				if ($currentTime >= $tokenArray['validation_date']){	
					$token->token 		= $activationKey ;
				}
				else {
					$activationKey = $token->token ;
				}
				$token->validation_date = $currentTime + 60 * 60 * 24 * 366 ; 
				$id = \R::store($token);
			}
			else {
				$tokenArray['token'] 		= $activationKey;
				$tokenArray['user_id'] 		= $user["id"] ; 
				$tokenArray['validation_date']  = $currentTime + 60 * 60 * 24 * 366 ; 
				$token = \R::dispense('token');
				$token->import($tokenArray);					
				$id = \R::store($token);
			}
		}
		
		$data = array(	"status" 		=> $status				,
						"user"			=> $user 				, 
						"key"			=> $activationKey		
			     );
		$logger->debug($data);
		$logger->debug('---------------------------------------------------');
		return $data ;	
	}

	public function logoutUser ($key) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START logoutUser ------- ");
		$token 	= \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
		$currentTime = time();
		$return = array ();
		if ($currentTime < $token['validation_date']){
			$objectToken   	= \R::load ("token", $token['id']) ;
			\R::trash ($objectToken);
			
			$return = array(	"success" 	=> "true"										,
								"msg"	 	=> "Logout de l'utilisateur avec succès."	
							);
		}
		else {
			$return = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
		}
		
		$logger->debug("END logoutUser ------- ");
		return $return;
	}

	public function savePictureOfUser($key,$userId,$files){
		$logger = \Logger::getLogger(basename(__FILE__));
      	$logger->debug('---------- savePictureOfUser ----------');
        $token = \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
        $currentTime = time();
        $data = array ();
		if ($currentTime < $token['validation_date']){
			$user = \R::load('users',$userId);
			$output = "resources/users/logos/";
			$urlLogo = "";
			if (!empty($files)) {
				$name = $files['name'];
				move_uploaded_file($files['tmp_name'], $output.$name);
				$user->picture = $name;
				$idU = \R::store($user);
				$urlLogo = "/resources/users/logos/".$name;
			}
						
			$data = array("success"=>'true',"msg"=> "Ajout Photo avec succés.","url_logo"=>$urlLogo);
      	}
        else {
        	$data = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
        }
        $logger->debug('-----------------------------------------------------------------------------------');
        return $data;
	}

	public function deletePictureOfCurrentUser($key,$id){
    	$logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('---------- deletePictureOfCurrentUser ----------');
        $token = \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
       	$currentTime = time();
        $data = array ();
        if ($currentTime < $token['validation_date']){
			$user = \R::load('users',$id);
			$filePath = "/resources/users/logos/{$user->picture}";
			unlink (getcwd().$filePath);
			$user->import(json_decode('{"picture":null}'));
			$idU = \R::store($user);
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