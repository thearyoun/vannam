<?php

$app->group('/client', function () use ($app) {

    $app->group('/stats', function () use ($app) {

        $app->get('/', function () use ($app) {
            $logger = \Logger::getLogger(basename(__FILE__));
            $logger->debug('START /client/stats ----------');
            $return = array();
            try {
                $token = $app->request->headers->get('token');
                $clientId = $app->request->params('client_id');

                $clientService = new \UTILE\ClientService ();
                $return = $clientService->getStatsById($token, $clientId);

            } catch (Exception $e) {
                $logger->debug($e);
                $app->response()->status(400);
                $app->response()->header('X-Status-Reason', $e->getMessage());
            }
            if ($return['success'] == "false") {
                $app->response()->status(401);
            }
            $logger->debug('END /client/stats ----------');
            $app->response()->header('Content-Type', 'application/json');
            echo json_encode($return);

        });
    });

    $app->group('/informations', function () use ($app) {

        $app->put('/', function () use ($app) {
            $logger = \Logger::getLogger(basename(__FILE__));
            $logger->debug('START /client/informations ----------');
            $return = array();
            try {
                $token = $app->request->headers->get('token');

                $clientBean = new \UTILE\Client ();
                $body = $app->request->getBody();
                $dataBody = json_decode($body, true);
                $clientBean->set_id($dataBody['client_id']);
                $clientBean->set_companyId($dataBody['company_id']);
                $clientBean->set_companyName($dataBody['company_name']);
                $clientBean->set_siret(isset($dataBody['siret']) ? $dataBody['siret'] : "");
                $clientBean->set_tvaIntra(isset($dataBody['tva_intra']) ? $dataBody['tva_intra'] : "");
                $clientBean->set_apeCode(isset($dataBody['ape_code']) ? $dataBody['ape_code'] : "");
                $clientBean->set_capital(isset($dataBody['capital']) ? $dataBody['capital'] : "");
                $clientBean->set_siteUrl(isset($dataBody['site_url']) ? $dataBody['site_url'] : "");
                $clientBean->set_contactName($dataBody['contact_name']);
                $clientBean->set_contactFirstName($dataBody['contact_firstname']);
                $clientBean->set_contactTelLine(isset($dataBody['contact_tel_line']) ? $dataBody['contact_tel_line'] : "");
                $clientBean->set_contactMobileLine(isset($dataBody['contact_mobile_line']) ? $dataBody['contact_mobile_line'] : "");
                $clientBean->set_contactFax(isset($dataBody['contact_fax']) ? $dataBody['contact_fax'] : "");
                $clientBean->set_contactEmail($dataBody['contact_email']);
                $clientBean->set_refererContactId($dataBody['referer_contact_id']);

                $clientService = new \UTILE\ClientService ();
                $return = $clientService->updateEntityById($token, $clientBean);
            } catch (Exception $e) {
                $logger->debug($e);
                $app->response()->status(400);
                $app->response()->header('X-Status-Reason', $e->getMessage());
            }
            if ($return['success'] == "false") {
                $app->response()->status(401);
            }
            $logger->debug('END /client/informations ----------');
            $app->response()->header('Content-Type', 'application/json');
            echo json_encode($return);
        });

        $app->post('/', function () use ($app) {
            $logger = \Logger::getLogger(basename(__FILE__));
            $logger->debug('START /client/informations ----------');
            $return = array();
            try {
                $token = $app->request->headers->get('token');

                $clientBean = new \UTILE\Client ();
                $body = $app->request->getBody();
                $dataBody = json_decode($body, true);
                $clientBean->set_companyId($dataBody['company_id']);
                $clientBean->set_companyName($dataBody['company_name']);
                $clientBean->set_siret(isset($dataBody['siret']) ? $dataBody['siret'] : "");
                $clientBean->set_tvaIntra(isset($dataBody['tva_intra']) ? $dataBody['tva_intra'] : "");
                $clientBean->set_apeCode(isset($dataBody['ape_code']) ? $dataBody['ape_code'] : "");
                $clientBean->set_capital(isset($dataBody['capital']) ? $dataBody['capital'] : "");
                $clientBean->set_siteUrl(isset($dataBody['site_url']) ? $dataBody['site_url'] : "");
                $clientBean->set_contactName($dataBody['contact_name']);
                $clientBean->set_contactFirstName($dataBody['contact_firstname']);
                $clientBean->set_contactTelLine(isset($dataBody['contact_tel_line']) ? $dataBody['contact_tel_line'] : "");
                $clientBean->set_contactMobileLine(isset($dataBody['contact_mobile_line']) ? $dataBody['contact_mobile_line'] : "");
                $clientBean->set_contactFax(isset($dataBody['contact_fax']) ? $dataBody['contact_fax'] : "");
                $clientBean->set_contactEmail($dataBody['contact_email']);
                $clientBean->set_refererContactId($dataBody['referer_contact_id']);

                $clientService = new \UTILE\ClientService ();
                $return = $clientService->addNewEntity($token, $clientBean);
            } catch (Exception $e) {
                $logger->debug($e);
                $app->response()->status(400);
                $app->response()->header('X-Status-Reason', $e->getMessage());
            }
            if ($return['success'] == "false") {
                $app->response()->status(401);
            }
            $logger->debug('END /client/informations ----------');
            $app->response()->header('Content-Type', 'application/json');
            echo json_encode($return);
        });
    });

    $app->group('/authorization', function () use ($app) {

        $app->post('/', function () use ($app) {
            $logger = \Logger::getLogger(basename(__FILE__));
            $logger->debug('START /client/authorization ----------');
            $return = array();
            try {
                $token = $app->request->headers->get('token');
                $body = $app->request->getBody();
                $dataBody = json_decode($body, true);

                $authorizationBean = new \UTILE\Authorization ();
                $authorizationBean->set_clientId($dataBody['client_id']);
                $authorizationBean->set_companyId($dataBody['company_id']);
                $authorizationBean->set_roleId("4");

                $userBean = new \UTILE\User ();
                $userBean->set_name($dataBody['contact_name']);
                $userBean->set_firstName($dataBody['contact_firstname']);
                $userBean->set_mail($dataBody['authorization_contact_mail']);
                $userBean->set_passwd($dataBody['authorization_contact_passwd']);
                $userBean->set_mobileLine($dataBody['contact_mobile_line']);
                $userBean->set_directLine($dataBody['contact_direct_line']);

                if (isset($dataBody['brands'])) {
                    $allBrands = array();
                    foreach ($dataBody['brands'] as $lineItem) {
                        $brandLine = new \UTILE\Brand ();
                        $brandLine->set_id($lineItem['id']);
                        array_push($allBrands, $brandLine);
                    }
                    $authorizationBean->set_brands($allBrands);
                }

                if (isset($dataBody['categories'])) {
                    $allCategories = array();
                    foreach ($dataBody['categories'] as $lineItem) {
                        $categoryLine = new \UTILE\Category ();
                        $categoryLine->set_id($lineItem['id']);
                        array_push($allCategories, $categoryLine);
                    }
                    $authorizationBean->set_categories($allCategories);
                }

                $clientService = new \UTILE\ClientService ();
                $return = $clientService->createAuthorizationForClient($token, $authorizationBean, $userBean);
            } catch (Exception $e) {
                $logger->debug($e);
                $app->response()->status(400);
                $app->response()->header('X-Status-Reason', $e->getMessage());
            }
            if ($return['success'] == "false") {
                $app->response()->status(401);
            }
            $logger->debug('END /client/authorization ----------');
            $app->response()->header('Content-Type', 'application/json');
            echo json_encode($return);
        });

        $app->put('/', function () use ($app) {
            $logger = \Logger::getLogger(basename(__FILE__));
            $logger->debug('START /client/authorization ----------');
            $return = array();
            try {
                $token = $app->request->headers->get('token');
                $body = $app->request->getBody();
                $dataBody = json_decode($body, true);

                $userBean = new \UTILE\User ();
                $userBean->set_mail($dataBody['authorization_contact_mail']);
                $userBean->set_passwd($dataBody['authorization_contact_passwd']);

                $clientBean = new \UTILE\Client ();
                $clientBean->set_isAuthorizationAccess($dataBody['is_authorization_access']);
                $clientBean->set_id($dataBody['client_id']);
                $clientService = new \UTILE\ClientService ();
                $return = $clientService->updateAuthorizationClient($token, $userBean, $clientBean);
            } catch (Exception $e) {
                $logger->debug($e);
                $app->response()->status(400);
                $app->response()->header('X-Status-Reason', $e->getMessage());
            }
            if ($return['success'] == "false") {
                $app->response()->status(401);
            }
            $logger->debug('END /client/authorization ----------');
            $app->response()->header('Content-Type', 'application/json');
            echo json_encode($return);
        });
    });

    $app->post('/brand', function () use ($app) {
        $logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /client/brand ----------');
        $return = array();
        try {
            $token = $app->request->headers->get('token');

            $body = $app->request->getBody();
            $dataBody = json_decode($body, true);
            $clientId = $dataBody['client_id'];
            $brands = $dataBody['brands'];

            $clientService = new \UTILE\ClientService ();
            $return = $clientService->updateBrandsForClientAuthorization($token, $clientId, $brands);
        } catch (Exception $e) {
            $logger->debug($e);
            $app->response()->status(400);
            $app->response()->header('X-Status-Reason', $e->getMessage());
        }
        if ($return['success'] == "false") {
            $app->response()->status(401);
        }
        $logger->debug('END /client/brand ----------');
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($return);
    });

    $app->post('/category', function () use ($app) {
        $logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /client/category ----------');
        $return = array();
        try {
            $token = $app->request->headers->get('token');

            $body = $app->request->getBody();
            $dataBody = json_decode($body, true);
            $clientId = $dataBody['client_id'];
            $categories = $dataBody['categories'];

            $clientService = new \UTILE\ClientService ();
            $return = $clientService->updateCategoriesForClientAuthorization($token, $clientId, $categories);
        } catch (Exception $e) {
            $logger->debug($e);
            $app->response()->status(400);
            $app->response()->header('X-Status-Reason', $e->getMessage());
        }
        if ($return['success'] == "false") {
            $app->response()->status(401);
        }
        $logger->debug('END /client/category ----------');
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($return);
    });

    $app->get('/', function () use ($app) {
        $logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /client ----------');
        $return = array();
        try {
            $token = $app->request->headers->get('token');
            $companyId = $app->request->params('company_id');
            $query = $app->request->params('query');
            $fileType = $app->request->params('file_type');
            $clientService = new \UTILE\ClientService ();
            $return = $clientService->getAllClientsByCompany($token, $companyId, $query, $fileType);

        } catch (Exception $e) {
            $logger->debug($e);
            $app->response()->status(400);
            $app->response()->header('X-Status-Reason', $e->getMessage());
        }
        if ($return['success'] == "false") {
            $app->response()->status(401);
        }
        $logger->debug('END /client ----------');
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($return);
    });

    $app->get('/:id', function ($id) use ($app) {
        $logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /client ----------');
        $return = array();
        try {
            $token = $app->request->headers->get('token');

            $clientService = new \UTILE\ClientService ();
            $return = $clientService->getEntityById($token, $id);

        } catch (Exception $e) {
            $logger->debug($e);
            $app->response()->status(400);
            $app->response()->header('X-Status-Reason', $e->getMessage());
        }
        if ($return['success'] == "false") {
            $app->response()->status(401);
        }
        $logger->debug('END /client ----------');
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($return);
    });

    $app->delete('/:id', function ($id) use ($app) {
        $logger = \Logger::getLogger(basename(__FILE__));
        $logger->debug('START /client ----------');
        $return = array();
        try {
            $token = $app->request->headers->get('token');

            $clientService = new \UTILE\ClientService ();
            $return = $clientService->deleteEntityById($token, $id);

        } catch (Exception $e) {
            $logger->debug($e);
            $app->response()->status(400);
            $app->response()->header('X-Status-Reason', $e->getMessage());
        }
        if ($return['success'] == "false") {
            $app->response()->status(401);
        }
        $logger->debug('END /client ----------');
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($return);
    });
});

?>
