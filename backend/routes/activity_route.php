<?php

$app->post('/login', function () use ($app) {
    $logger = \Logger::getLogger(basename(__FILE__));
    $logger->debug('START /login ----------');
    $return = array();
    try {
        $userBean = new \UTILE\User ();
        $body = $app->request->getBody();
        $dataBody = json_decode($body, true);

        $userBean->set_mail($dataBody['mail']);
        $userBean->set_passwd($dataBody['passwd']);
        $userService = new \UTILE\UserService ();
        $return = $userService->authentifyUser($userBean);


    } catch (Exception $e) {
        $logger->debug($e);
        $app->response()->status(400);
        $app->response()->header('X-Status-Reason', $e->getMessage());
    }

    $logger->debug('END /login ----------');
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($return);
});

$app->post('/logout', function () use ($app) {
    $logger = \Logger::getLogger(basename(__FILE__));
    $logger->debug('START /logout ----------');
    try {
        $token = $app->request->headers->get('token');

        $userService = new \UTILE\UserService ();
        $return = $userService->logoutUser($token);
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($return);
    } catch (Exception $e) {
        $logger->debug($e);
        $app->response()->status(400);
        $app->response()->header('X-Status-Reason', $e->getMessage());
    }
    $logger->debug('END /logout ----------');
});

$app->get('/company', function () use ($app) {
    $logger = \Logger::getLogger(basename(__FILE__));
    $logger->debug('START /company ----------');
    $return = array();
    try {
        $token = $app->request->headers->get('token');
        $toolsService = new \UTILE\ToolsService ();
        $return = $toolsService->getAllCompanies($token);
    } catch (Exception $e) {
        $logger->debug($e);
        $app->response()->status(400);
        $app->response()->header('X-Status-Reason', $e->getMessage());
    }
    if ($return['success'] == "false") {
        $app->response()->status(401);
    }
    $logger->debug('END /company ----------');
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($return);

});

$app->get('/manager', function () use ($app) {
    $logger = \Logger::getLogger(basename(__FILE__));
    $logger->debug('START /manager ----------');
    $return = array();
    try {
        $token = $app->request->headers->get('token');
        $companyId = $app->request->params('company_id');
        $toolsService = new \UTILE\ToolsService ();
        $return = $toolsService->getAllManagers($token, $companyId);
    } catch (Exception $e) {
        $logger->debug($e);
        $app->response()->status(400);
        $app->response()->header('X-Status-Reason', $e->getMessage());
    }
    if ($return['success'] == "false") {
        $app->response()->status(401);
    }
    $logger->debug('END /manager ----------');
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($return);

});

?>
