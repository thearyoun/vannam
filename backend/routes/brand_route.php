<?php

$app->group('/brand', function () use ($app) {

    $app->post('/', function () use ($app) {
        $logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /brand ----------');
        $return = array();
        try {
            $token = $app->request->headers->get('token');
//				echo json_encode($app->request->getBody());
//				exit;
            $body = $app->request->getBody();
            $dataBody = json_decode($body, true);

            $brand = new \UTILE\Brand ();
            $brand->set_name($dataBody['name']);
            $brand->set_companyId($dataBody['company_id']);
            $brand->set_marge($dataBody['marge']);

            $brandService = new \UTILE\BrandService ();
            $return = $brandService->addNewEntity($token, $brand);

        } catch (Exception $e) {
            $logger->debug($e);
            $app->response()->status(400);
            $app->response()->header('X-Status-Reason', $e->getMessage());
        }
        if ($return['success'] == "false") {
            $app->response()->status(401);
        }
        $logger->debug('END /brand ----------');
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($return);
    });

    $app->post('/media', function () use ($app) {
        $logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /brand/media ----------');
        $return = array();
        try {
            $token = $app->request->headers->get('token');
            $brand = new \UTILE\Brand ();
            $brand->set_id($app->request->params('id'));
            $files = $_FILES['picture'];

            $brandService = new \UTILE\BrandService ();
            $return = $brandService->updateBrandLogo($token, $brand, $files);

        } catch (Exception $e) {
            $logger->debug($e);
            $app->response()->status(400);
            $app->response()->header('X-Status-Reason', $e->getMessage());
        }
        if ($return['success'] == "false") {
            $app->response()->status(401);
        }
        $logger->debug('END /brand/media ----------');
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($return);
    });

    $app->delete('/media', function () use ($app) {
        $logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /brand/media ----------');
        $return = array();
        try {
            $body = $app->request->getBody();
            $dataBody = json_decode($body, true);
            $brandId = $dataBody['id'];
            $token = $app->request->headers->get('token');
            $brandService = new \UTILE\BrandService();
            $return = $brandService->deletePictureOfCurrentBrand($token, $brandId);
        } catch (Exception $e) {
            $logger->debug($e);
            $app->response()->status(400);
            $app->response()->header('X-Status-Reason', $e->getMessage());
            $return = array("success" => 'false', "msg" => $e->getMessage());
        }
        $logger->debug('END /brand/media ----------');
        if ($return['success'] == "false") {
            $app->response()->status(401);
        }
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($return);
    });

    $app->put('/', function () use ($app) {
        $logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /brand ----------');
        $return = array();
        try {
            $token = $app->request->headers->get('token');
            $body = $app->request->getBody();
            $dataBody = json_decode($body, true);

            $logger->debug($dataBody);

            $brand = new \UTILE\Brand ();
            $brand->set_id($dataBody['brand_id']);
            $brand->set_name($dataBody['name']);
            $brand->set_marge($dataBody['marge']);

            $logger->debug($brand);

            $brandService = new \UTILE\BrandService ();
            $return = $brandService->updateEntityById($token, $brand);

        } catch (Exception $e) {
            $logger->debug($e);
            $app->response()->status(400);
            $app->response()->header('X-Status-Reason', $e->getMessage());
        }
        if ($return['success'] == "false") {
            $app->response()->status(401);
        }
        $logger->debug('END /brand ----------');
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($return);
    });

    $app->get('/', function () use ($app) {

        $logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /brand ----------');
        $return = array();

        try {
            $token = $app->request->headers->get('token');
            $companyId = $app->request->params('company_id');

            $brandService = new \UTILE\BrandService ();
            $return = $brandService->getAllEntities($token, $companyId);

        } catch (Exception $e) {
            $logger->debug($e);
            $app->response()->status(400);
            $app->response()->header('X-Status-Reason', $e->getMessage());
        }
        if ($return['success'] == "false") {
            $app->response()->status(401);
        }

        $logger->debug('END /brand ----------');
        $app->response()->header('Content-Type', 'application/json');

        echo json_encode($return);
    });

    $app->get('/:id', function ($id) use ($app) {
        $logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /brand/:id ----------');
        $return = array();
        try {
            $token = $app->request->headers->get('token');

            $brandService = new \UTILE\BrandService ();
            $return = $brandService->getEntityById($token, $id);

        } catch (Exception $e) {
            $logger->debug($e);
            $app->response()->status(400);
            $app->response()->header('X-Status-Reason', $e->getMessage());
        }
        if ($return['success'] == "false") {
            $app->response()->status(401);
        }
        $logger->debug('END /brand/:id ----------');
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($return);
    });

    $app->delete('/', function () use ($app) {
        $logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /brand ----------');
        try {

            $token = $app->request->headers->get('token');
            $body = $app->request->getBody();
            $dataBody = json_decode($body, true);
            $brandId = $dataBody['brand_id'];

            $brandService = new \UTILE\BrandService ();
            $return = $brandService->deleteEntityById($token, $brandId);
            $app->response()->header('Content-Type', 'application/json');
            echo json_encode($return);
        } catch (Exception $e) {
            $logger->debug($e);
            $app->response()->status(400);
            $app->response()->header('X-Status-Reason', $e->getMessage());
        }
        $logger->debug('END /brand ----------');
    });

});

?>
