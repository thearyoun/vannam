<?php

/***************** DB INFORMATIONS ******************/

define('DB_HOST', 'localhost');
define('DB_NAME', 'vannam');
define('DB_USER', 'root');
define('DB_PWD', 'password');

/***************************************************/

/***************** GENERAL INFORMATIONS ******************/

define('IS_FREEZE', "true");
define('IS_DEBUG', FALSE);

/*********************************************************/

define("PATH_EXCEL_FILES_BATCH", "batchs/import_ev/");
define("TEL_LABEL", "Tèl");
define("FAX_LABEL", "Fax");
define("QUOTATION_LABEL", "DEVIS");
define("QUOTATION_PREFIX_LABEL", "DE");

define("COMMAND_LABEL", "BON DE COMMANDE");
define("COMMAND_PREFIX_LABEL", "BC");

define("PROFORMA_TYPE", 1);
define("INVOICE_TYPE", 2);


define("PARAMS_EXCEL_FILE",
    serialize(
        array(
            'headers_style' => array(
                'alignment' => array(
                    'horizontal' => 'center'
                ),
                'font' => array(
                    'bold' => true,
                    'size' => 11
                )
            ),
            'rows_style' => array(
                'alignment' => array(
                    'horizontal' => 'left',
                ),
                'font' => array(
                    'bold' => false,
                    'size' => 10
                )
            ),
            'columns_products_params' => array(
                'image' => array("width" => 25,
                    "label" => "IMAGE"
                ),
                'reference' => array("width" => 14,
                    "label" => "REFERENCE"
                ),
                'designation' => array("width" => 20,
                    "label" => "DESIGNATION"
                ),
                'marque' => array("width" => 13,
                    "label" => "MARQUE"
                ),
                'categorie' => array("width" => 13,
                    "label" => "CATEGORIE"
                ),
                'style' => array("width" => 13,
                    "label" => "STYLE"
                ),
                'sport_code' => array("width" => 15,
                    "label" => "SPORT CODE"
                ),
                'couleur' => array("width" => 15,
                    "label" => "COULEUR"
                ),
                'gamme' => array("width" => 15,
                    "label" => "GAMME"
                ),
                'quantite' => array("width" => 10,
                    "label" => "QUANTITE"
                ),
                'zone' => array("width" => 15,
                    "label" => "ZONE"
                ),
                'p_achat' => array("width" => 15,
                    "label" => "PRIX ACHAT"
                ),
                'p_vente' => array("width" => 15,
                    "label" => "PRIX VENTE"
                ),
                'p_tarif' => array("width" => 15,
                    "label" => "PRIX TARIF"
                ),
                'p_public' => array("width" => 15,
                    "label" => "PRIX PUBLIC"
                ),
                'tailles_dispo' => array("width" => 15,
                    "label" => "TAILLES DISPO"
                )
            ),
            'columns_entry_events_params' => array(
                'reference' => array("width" => 12,
                    "label" => "REFERENCE"
                ),
                'zone' => array("width" => 7,
                    "label" => "ZONE"
                ),
                'designation' => array("width" => 15,
                    "label" => "DESIGNATION"
                ),
                'marque' => array("width" => 8,
                    "label" => "MARQUE"
                ),
                'type' => array("width" => 7,
                    "label" => "TYPE"
                ),
                'p_achat' => array("width" => 13,
                    "label" => "PRIX D'ACHAT"
                ),
                'p_tarif' => array("width" => 13,
                    "label" => "PRIX TARIF"
                ),
                'quantite' => array("width" => 10,
                    "label" => "QUANTITE"
                ),
                'en_stock' => array("width" => 10,
                    "label" => "EN STOCK"
                )
            )
        )
    )
);

?>