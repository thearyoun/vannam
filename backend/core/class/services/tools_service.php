<?php

namespace UTILE;

class ToolsService implements ToolsInterface{
    
	public function __construct(){
	
	}

	public function getAllCompanies ($key) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllCompanies ------- ");
		$logger->debug($key);


		$return = array ();
		if ($key == null ){
			$companies = \R::getAll ("select * from companies");
			$return = array("success"		=> "true",
							"msg"			=> "La liste des compagnies est récupérée avec succés.",
							"compagnies"	=> $companies);
		}
		else {
				$user = \R::getRow ('select * from users where id in (select user_id from token where token = :key)',
						array (':key'=>$key));
				$companies = \R::getAll ("select id,name,if ( logo = '' , null ,concat('resources/companies/',logo) ) url_logo from companies where id in (
										select company_id  from authorization where user_id = :id
										)",array (":id"=>$user['id']));
				$return = array(	"success"		=> "true",
									"msg"			=> "La liste des compagnies est récupérée avec succés.",
									"compagnies"	=> $companies);
		}
		
		$logger->debug("END getAllCompanies ------- ");
		return $return;	
	}

	public function getAllManagers ($key,$companyId) {
		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START getAllManagers ------- ");
		$token = \R::getRow( 'select * from token  where token like :token ', array(":token"=>$key));
        $currentTime = time();
        $data = array ();
		if ($currentTime < $token['validation_date']){
			$managers = \R::getAll ("select * from users where id in (
										select user_id from authorization where company_id = :id and role_id in (1,2,5)
									) and activate = 1 ",array(":id"=>$companyId));
			$data = array(	"success"		=> "true",
								"msg"			=> "La liste des managers est récupérée avec succés.",
								"managers"	=> $managers);
		}
        else {
        	$data = array("success"=>'false',"msg"=> "Le token n'est plus valide !","err_code"=>"100");
        }
        $logger->debug('-----------------------------------------------------------------------------------');
        return $data;
	}

	public function createMiniatureForProduct($width, $height,$type,$originalPicture, $miniaturePicture){

		$logger = \Logger::getLogger(basename(__FILE__));	
		$logger->debug("START createMiniatureForProduct ------- ");

        list($w, $h) = getimagesize($originalPicture);

        $w = $w == 0 ? 1 : $w ;
        $h = $h == 0 ? 1 : $h ;

        $widthRatio = $width / $w;
        $heightRatio = $height / $h;

        $ratio = min($widthRatio, $heightRatio);

        $width  = (int)$w  * $ratio;
        $height = (int)$h * $ratio;

        if($type == 'image/jpeg'){
            $imgString = file_get_contents($originalPicture);
            $image = imagecreatefromstring($imgString);
            $tmp = imagecreatetruecolor($width, $height);
            imagecopyresampled($tmp, $image, 0, 0, 0, 0, $width, $height, $w, $h);
            imagejpeg($tmp, $miniaturePicture, 100);
        }
        else if($type == 'image/png'){
        	$image = imagecreatefrompng($originalPicture);
        	$tmp = imagecreatetruecolor($width,$height);
        	imagealphablending($tmp, false);
        	imagesavealpha($tmp, true);
        	imagecopyresampled($tmp, $image,0,0,0,0,$width,$height,$w, $h);
        	imagepng($tmp, $miniaturePicture, 0);
        }
        else if($type == 'image/gif'){
            $image = imagecreatefromgif($originalPicture);
            $tmp = imagecreatetruecolor($width,$height);
            $transparent = imagecolorallocatealpha($tmp, 0, 0, 0, 127);
            imagefill($tmp, 0, 0, $transparent);
            imagealphablending($tmp, true); 

            imagecopyresampled($tmp, $image,0,0,0,0,$width,$height,$w, $h);
            imagegif($tmp, $miniaturePicture);
        }
        else{
            return false;
        }
        imagedestroy($image);
        imagedestroy($tmp);
        return true;
    }
}
?>