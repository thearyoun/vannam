<?php

ini_set('memory_limit', '256M');

if (isset($_SERVER['HTTP_ORIGIN'])) {

    $http_origin = $_SERVER['HTTP_ORIGIN'];

    if ($http_origin == "http://localhost:3000" ||
//    if ($http_origin == "http://vannam.frontend.localhost:81" ||
//        $http_origin == "http://devvanam.ithubkh.com") {
        $http_origin == "http://localhost:3000") {
        header("Access-Control-Allow-Origin: $http_origin");
    }

    header('Access-Control-Allow-Credentials: true');

    header('Access-Control-Allow-Methods: GET,PUT,POST,DELETE,PATCH,OPTIONS');
    header('Access-Control-Allow-Headers: authorization,Access-Control-Allow-Origin,Content-Type,SOAPAction,Authorization,token');
}

require 'includes/loaders.php';

\R::setup('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PWD);

\R::freeze(IS_FREEZE);
\R::debug(IS_DEBUG);

$app = new \Slim\Slim();


$app->contentType('text/html; charset=utf-8');

if ($app->request->isOptions()) {
    return true;
}


require 'routes/activity_route.php';
require 'routes/user_route.php';
require 'routes/client_route.php';
require 'routes/address_route.php';
require 'routes/brand_route.php';
require 'routes/category_route.php';
require 'routes/country_route.php';
require 'routes/product_route.php';
require 'routes/gender_route.php';
require 'routes/sport_route.php';
require 'routes/range_route.php';
require 'routes/zonage_city_route.php';
require 'routes/entry_event_route.php';
require 'routes/change_route.php';
require 'routes/quotation_route.php';
require 'routes/command_route.php';
require 'routes/invoice_route.php';

//$app->get('/', function () {
//    echo "Hello";
//});

$app->run();
?>

<?php
/*
error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

define('EOL',(PHP_SAPI == 'cli') ? PHP_EOL : '<br />');

date_default_timezone_set('Europe/London');


if (!file_exists("./batchs/import_ev/abc - Sheet1.csv")) {
	exit("Please run 05featuredemo.php first." . EOL);
}
//$objPHPExcel = PHPExcel_IOFactory::load("./batchs/import_ev/1_export-2018-08-01_18_36_05.xls");
echo "test";
$inputFileType 		= PHPExcel_IOFactory::identify("./batchs/import_ev/abc - Sheet1.csv");
$objReader = PHPExcel_IOFactory::createReader($inputFileType);
$objPHPExcel = $objReader->load("./batchs/import_ev/abc - Sheet1.csv");
$objPHPExcel->setActiveSheetIndex(0);
$sheetData = $objPHPExcel->getActiveSheet();

foreach( $sheetData->getRowIterator(2, 1) as $row ){
    foreach( $row->getCellIterator() as $cell ){
        echo $value = $cell->getCalculatedValue();
    }
}
*/
?>