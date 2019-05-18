<?php

namespace UTILE;

use ImageOrientationFix;
use Logger;
use R;
use ZipArchive;

class EntryEventService implements EntryEventInterface
{

    public function __construct()
    {

    }

    public function addNewEntity($key, $entryEventBean)
    {
        $logger = Logger::getLogger(basename(__FILE__));
        $logger->debug("START addNewEntity [ENTRY EVENT] ------- ");

        $token = R::getRow('select * from token  where token like :token ', array(":token" => $key));
        $currentTime = time();

        $return = array();
        if ($currentTime < $token['validation_date']) {
            $entryEvent = R::dispense('entryevents');
            $entryEvent->information = $entryEventBean->get_information();
            $entryEvent->parcel_nb = $entryEventBean->get_parcelNb();
            $entryEvent->change_id = $entryEventBean->get_changeId();
            $entryEvent->user_id = $token["user_id"];
            $entryEvent->company_id = $entryEventBean->get_companyId();
            $idEntryEvent = R::store($entryEvent);

            foreach ($entryEventBean->get_entryEventDetails() as $entryEventDetailBean) {
                $entryEventDetail = R::dispense('entryeventdetails');
                $entryEventDetail->entry_event_id = $idEntryEvent;
                $entryEventDetail->product_id = $entryEventDetailBean->get_productId();
                $entryEventDetail->purchase_price = $entryEventDetailBean->get_purchasePrice();
                $entryEventDetail->sale_rate_price = $entryEventDetailBean->get_saleRatePrice();
                $idEntryEventDetail = R::store($entryEventDetail);

                $product = R::load('products', $entryEventDetailBean->get_productId());
                if ($product->sale_vanam_price == 0) {
                    $brand = R::load('brands', $product->brand_id);
                    $product->sale_vanam_price = $entryEventDetailBean->get_purchasePrice() * $brand->marge;
                    $idProduct = R::store($product);
                }

                if (!empty($entryEventDetailBean->get_location())) {
                    $location = R::dispense('productlocations');
                    $location->product_id = $entryEventDetailBean->get_productId();
                    $location->user_id = $token['user_id'];
                    $location->zonage_city_id = $entryEventDetailBean->get_location()->get_zonageCityId();
                    $location->aisle = $entryEventDetailBean->get_location()->get_aisle();
                    $location->palette = $entryEventDetailBean->get_location()->get_palette();
                    $idLocation = R::store($location);
                }

                foreach ($entryEventDetailBean->get_entryEventDetailStocks() as $entryEventDetailStockBean) {
                    $entryEventDetailStock = R::dispense('productstocks');
                    $entryEventDetailStock->range_detail_id = $entryEventDetailStockBean->get_rangeDetailId();
                    $entryEventDetailStock->value = $entryEventDetailStockBean->get_value();
                    $entryEventDetailStock->entry_event_detail_id = $idEntryEventDetail;
                    $entryEventDetailStock->product_id = $entryEventDetailBean->get_productId();
                    $idEntryEventDetailStock = R::store($entryEventDetailStock);

                    // Update Stock suite à la mise à jour du stock
                    if (!empty($entryEventDetailStockBean->get_value())) {
                        R::exec("	UPDATE productstocks 
									SET value = value + {$entryEventDetailStockBean->get_value()}
									WHERE product_id = {$entryEventDetailBean->get_productId()} 
									AND range_detail_id = {$entryEventDetailStockBean->get_rangeDetailId()}
									AND entry_event_detail_id IS NULL");
                    }
                }
            }

            $return = array("success" => 'true',
                "msg" => "Le mouvement d'entrée est ajouté avec succés.",
                "entry_event_id" => $idEntryEvent
            );
        } else {
            $return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
        }

        $logger->debug("END addNewEntity [ENTRY EVENT] ------- ");
        return $return;
    }

    public function updateEntityById($key, $entryEventBean)
    {
        $logger = Logger::getLogger(basename(__FILE__));
        $logger->debug("START updateEntityById [ENTRY EVENT] ------- ");

        $token = R::getRow('select * from token  where token like :token ', array(":token" => $key));
        $currentTime = time();

        $return = array();
        if ($currentTime < $token['validation_date']) {
            $entryEvent = R::load('entryevents', $entryEventBean->get_id());
            $entryEvent->information = $entryEventBean->get_information();
            $entryEvent->parcel_nb = $entryEventBean->get_parcelNb();
            $entryEvent->change_id = $entryEventBean->get_changeId();
            $idEntryEvent = R::store($entryEvent);
            foreach ($entryEventBean->get_entryEventDetails() as $entryEventDetailBean) {
                if (empty($entryEventDetailBean->get_id())) {
                    $entryEventDetail = R::dispense('entryeventdetails');
                } else {
                    $entryEventDetail = R::load('entryeventdetails', $entryEventDetailBean->get_id());
                }
                $entryEventDetail->entry_event_id = $idEntryEvent;
                $entryEventDetail->product_id = $entryEventDetailBean->get_productId();
                $entryEventDetail->purchase_price = $entryEventDetailBean->get_purchasePrice();
                $entryEventDetail->sale_rate_price = $entryEventDetailBean->get_saleRatePrice();
                $idEntryEventDetail = R::store($entryEventDetail);

                $product = R::load('products', $entryEventDetailBean->get_productId());
                if ($product->sale_vanam_price == 0) {
                    $brand = R::load('brands', $product->brand_id);
                    $product->sale_vanam_price = $entryEventDetailBean->get_purchasePrice() * $brand->marge;
                    $idProduct = R::store($product);
                } else {
                    $product->sale_vanam_price = $entryEventDetailBean->get_vanamPrice();
                    $idProduct = R::store($product);
                }

                if (!empty($entryEventDetailBean->get_location())) {
                    $location = R::dispense('productlocations');
                    $location->product_id = $entryEventDetailBean->get_productId();
                    $location->user_id = $token['user_id'];
                    $location->zonage_city_id = $entryEventDetailBean->get_location()->get_zonageCityId();
                    $location->aisle = $entryEventDetailBean->get_location()->get_aisle();
                    $location->palette = $entryEventDetailBean->get_location()->get_palette();
                    $idLocation = R::store($location);
                }

                foreach ($entryEventDetailBean->get_entryEventDetailStocks() as $entryEventDetailStockBean) {
                    if (empty($entryEventDetailStockBean->get_id())) {
                        $entryEventDetailStock = R::dispense('productstocks');
                        $entryEventDetailStock->range_detail_id = $entryEventDetailStockBean->get_rangeDetailId();
                        $entryEventDetailStock->value = $entryEventDetailStockBean->get_value();
                        $entryEventDetailStock->entry_event_detail_id = $idEntryEventDetail;
                        $entryEventDetailStock->product_id = $entryEventDetailBean->get_productId();
                        $idEntryEventDetailStock = R::store($entryEventDetailStock);
                        if (!empty($entryEventDetailStockBean->get_value())) {
                            R::exec("	UPDATE productstocks 
										SET value = value + {$entryEventDetailStockBean->get_value()}
										WHERE product_id = {$entryEventDetailBean->get_productId()} 
										AND range_detail_id = {$entryEventDetailStockBean->get_rangeDetailId()}
										AND entry_event_detail_id IS NULL");
                        }
                    }
                }
            }

            $return = array("success" => 'true', "msg" => "Le mouvement d'entrée est modifé avec succés.");
        } else {
            $return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
        }

        $logger->debug("END updateEntityById [ENTRY EVENT]------- ");
        return $return;
    }

    public function getAllEntryEventsByCriteria($key, $companyId, $criteria)
    {

        $logger = Logger::getLogger(basename(__FILE__));
        $logger->debug("START getAllEntities [ENTRY EVENT] ------- ");

        $token = R::getRow('select * from token  where token like :token ', array(":token" => $key));
        $currentTime = time();

        $return = array();
        if ($currentTime < $token['validation_date']) {
            $andNumInf = "";
            if (!empty($criteria->get_numInfValue())) {
                $andNumInf = " AND (CAST(ev.id AS char(50)) LIKE '%{$criteria->get_numInfValue()}%'  
									OR ev.information LIKE '%{$criteria->get_numInfValue()}%'
									OR concat(u.name,' ',u.firstname) LIKE '%{$criteria->get_numInfValue()}%'
									)";
            }

            $andStartDate = "";
            if (!empty($criteria->get_startDate())) {
                $andStartDate = " AND DATE_FORMAT(insert_date,'%Y/%m/%d') >= '{$criteria->get_startDate()}' ";
            }

            $andEndDate = "";
            if (!empty($criteria->get_startDate())) {
                $andEndDate = " AND DATE_FORMAT(insert_date,'%Y/%m/%d') <= '{$criteria->get_endDate()}' ";
            }

            $entryEvents = R::getall("SELECT 	ev.id, IF (sum(ps.value) IS NOT NULL, SUM(ps.value) , 0 ) quantity,
												ev.information, DATE_FORMAT(ev.insert_date,'%d/%m/%Y') insert_date,
												concat(u.name,' ',u.firstname) name, ch.name change_name, b.name brand 
										FROM entryevents ev 
										LEFT JOIN entryeventdetails evd ON evd.entry_event_id = ev.id 
										LEFT JOIN productstocks ps ON ps.entry_event_detail_id = evd.id
										LEFT JOIN users u ON u.id = ev.user_id
										LEFT JOIN changes ch ON ch.id = ev.change_id
										LEFT JOIN brands b ON b.id = evd.product_id
										WHERE ev.company_id = :id {$andNumInf} {$andStartDate} {$andEndDate}
  										GROUP BY ev.id , ev.information, DATE_FORMAT(ev.insert_date,'%d/%m/%Y'),
											concat(u.name,' ',u.firstname), ch.name, b.name ",
                array(":id" => $companyId
                ));
            $return = array("success" => 'true',
                "msg" => "La liste des mouvements d'entrée est récupérée avec succés.",
                "entry_events" => $entryEvents
            );
        } else {
            $return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
        }

        $logger->debug("END getAllEntities [ENTRY EVENT] ------- ");
        return $return;
    }

    public function getEntityById($key, $id)
    {
        return null;
    }

    public function getEntryEventByIdAndByPage($key, $id, $nbElements, $page)
    {
        $logger = Logger::getLogger(basename(__FILE__));
        $logger->debug("START getEntityById [ENTRY EVENT] ------- ");

        $token = R::getRow('select * from token  where token like :token ', array(":token" => $key));
        $currentTime = time();

        $return = array();
        if ($currentTime < $token['validation_date']) {

            $entryEvent = R::getRow("	SELECT ev.id, ev.information, ev.parcel_nb,
											   DATE_FORMAT(ev.insert_date,'%d/%m/%Y') insert_date,
											   ch.name change_name,ch.id change_id 
										FROM entryevents ev 
										LEFT JOIN changes ch ON ch.id = ev.change_id 
										WHERE ev.id = :id",
                array(':id' => $id)
            );
            $sqlLimit = "";
            if ($nbElements > 0 && $page > 0) {
                $offset = ($page - 1) * $nbElements;
                $sqlLimit = "limit {$offset} , {$nbElements}";
            }

            $entryEvent['entry_event_details'] = R::getAll("	SELECT 	evd.*, b.name brand, p.reference, p.description, c.name category,
																		IF (sum(ps.value) IS NOT NULL, SUM(ps.value) , 0 ) quantity,
																		CONCAT (t_locations.aisle,t_locations.palette) zone,
																		IF ( t_s.qtr IS NOT NULL, t_s.qtr, 0) qtr ,
																		t_locations.aisle,t_locations.palette,p.sale_public_price,
																		p.sale_vanam_price 
																FROM entryeventdetails evd 
																LEFT JOIN products p ON p.id = evd.product_id
																LEFT JOIN brands b ON b.id = p.brand_id
																LEFT JOIN categories c ON c.id = p.category_id
																LEFT JOIN ( 
																	SELECT product_id,aisle,palette,id
																	FROM productlocations 
																	GROUP BY product_id HAVING MAX(id)
																) AS t_locations ON t_locations.product_id = p.id
																LEFT JOIN productstocks ps ON ps.entry_event_detail_id = evd.id
																LEFT JOIN (
																	SELECT SUM(value) qtr,product_id 
																	FROM productstocks 
																	WHERE entry_event_detail_id IS NULL
																	GROUP BY product_id 
																) as t_s ON t_s.product_id = evd.product_id
																WHERE evd.entry_event_id = :id 
																GROUP BY evd.product_id 
																{$sqlLimit}",
                array(':id' => $id)
            );
            $return = array("success" => 'true',
                "msg" => "Le mouvement d'entrée est récupéré avec succés.",
                "entry_event" => $entryEvent
            );
        } else {
            $return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
        }

        $logger->debug("END getEntityById [ENTRY EVENT] ------- ");
        return $return;
    }

    public function getEntryEventDetailStockById($key, $entryDetailId)
    {

        $logger = Logger::getLogger(basename(__FILE__));
        $logger->debug("START getEntityById [ENTRY EVENT] ------- ");

        $token = R::getRow('select * from token  where token like :token ', array(":token" => $key));
        $currentTime = time();

        $return = array();
        if ($currentTime < $token['validation_date']) {

            $stock = R::getAll(" 	SELECT  ps.id,ps.range_detail_id,ps.value,ps.entry_event_detail_id,rd.name,evd.product_id,pss.value qtr
									FROM productstocks ps
									LEFT JOIN rangedetails rd ON rd.id = ps.range_detail_id
									LEFT JOIN entryeventdetails evd ON evd.id=ps.entry_event_detail_id
									LEFT JOIN productstocks pss ON (
										pss.range_detail_id = ps.range_detail_id 
										AND evd.product_id = pss.product_id 
										AND pss.entry_event_detail_id IS NULL
									)
									WHERE ps.entry_event_detail_id = :id 
									GROUP BY range_detail_id",
                array(":id" => $entryDetailId)
            );
            if (empty($stock)) {
                $stock = R::getAll("	SELECT ps.product_id,ps.range_detail_id,ps.value,':id' entry_detail_id,rd.name,'0' qtr
										FROM productstocks ps
										LEFT JOIN entryeventdetails evd ON evd.product_id = ps.product_id 
										LEFT JOIN rangedetails rd on rd.id = ps.range_detail_id
										WHERE ps.entry_event_detail_id IS NULL
										AND ps.range_detail_id IN ( 
											SELECT id 
											FROM rangedetails 
											WHERE range_id IN ( 
												SELECT range_id 
												FROM products 
												WHERE id IN (
													SELECT product_id 
													FROM entryeventdetails
													WHERE id = :id 
												) 
											) 
										)
										AND ps.product_id IN ( 
											SELECT id 
											FROM products 
											WHERE id IN (
												SELECT product_id 
												FROM entryeventdetails 
												WHERE id = :id 
											) 
										)",
                    array(":id" => $entryDetailId)
                );
            }
            $return = array("success" => 'true',
                "msg" => "Le stock de la ligne du mouvement d'entrée est récupéré avec succés.",
                "stock" => $stock
            );
        } else {
            $return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
        }

        $logger->debug("END getEntityById [ENTRY EVENT] ------- ");
        return $return;
    }

    public function deleteEntityById($key, $entryEventId)
    {
        $logger = Logger::getLogger(basename(__FILE__));
        $logger->debug("START deleteEntityById [ENTRY EVENT] ------- ");

        $token = R::getRow('select * from token  where token like :token ', array(":token" => $key));
        $currentTime = time();

        $return = array();
        if ($currentTime < $token['validation_date']) {
            $entryEventDetails = R::getAll('	select * from entryeventdetails where entry_event_id = :id',
                array(':id' => $entryEventId)
            );
            foreach ($entryEventDetails as $entryEventDetail) {
                R::exec("DELETE from productstocks where entry_event_detail_id = {$entryEventDetail['id']}");
                R::exec("DELETE from entryeventdetails where id = {$entryEventDetail['id']}");
            }
            R::exec("DELETE from entryevents where id = {$entryEventId}");

            $return = array("success" => 'true',
                "msg" => "Le mouvement d'entrée est supprimé avec succés."
            );
        } else {
            $return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
        }

        $logger->debug("END deleteEntityById [ENTRY EVENT] ------- ");
        return $return;
    }

    public function deleteProductFromEntryEvent($key, $entryEventDetailId)
    {
        $logger = Logger::getLogger(basename(__FILE__));
        $logger->debug("START deleteProductFromEntryEvent ------- ");

        $token = R::getRow('select * from token  where token like :token ', array(":token" => $key));
        $currentTime = time();

        $return = array();
        if ($currentTime < $token['validation_date']) {
            $stocksToDelete = R::getAll("select * from productstocks where entry_event_detail_id = :id", array(':id' => $entryEventDetailId));
            if (!empty($stocksToDelete)) {
                foreach ($stocksToDelete as $line) {
                    R::exec("	UPDATE productstocks SET value = value -{$line['value']}
							WHERE product_id = {$line['product_id']} 
							AND range_detail_id= {$line['range_detail_id']}
							AND entry_event_detail_id IS NULL"
                    );
                }
            }
            R::exec("DELETE from productstocks where entry_event_detail_id = {$entryEventDetailId}");
            R::exec("DELETE from entryeventdetails where id = {$entryEventDetailId}");
            $return = array("success" => 'true',
                "msg" => "Le produit est supprimé du mouvement d'entrée avec succés."
            );
        } else {
            $return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
        }

        $logger->debug("END deleteProductFromEntryEvent ------- ");
        return $return;
    }

    public function getAllEntities($key, $companyId)
    {
        return null;
    }

    public function updateStockProductRangeOfEntryEvent($key, $productId, $entryEventDetailId, $rangeDetailId, $newValue)
    {
        $logger = Logger::getLogger(basename(__FILE__));
        $logger->debug("START updateStockProductRangeOfEntryEvent ------- ");

        $token = R::getRow('select * from token  where token like :token ', array(":token" => $key));
        $currentTime = time();

        $return = array();
        if ($currentTime < $token['validation_date']) {
            $oldLine = R::getRow("	SELECT * 
										FROM productstocks 
										WHERE entry_event_detail_id = :entry_id
										AND range_detail_id = :range_id",
                array(':entry_id' => $entryEventDetailId, ':range_id' => $rangeDetailId)
            );

            $diffStock = $oldLine['value'] - $newValue;

            R::exec("	UPDATE productstocks 
						SET value = {$newValue} 
						WHERE entry_event_detail_id = {$entryEventDetailId} 
						AND range_detail_id = {$rangeDetailId}
						  ");

            R::exec("	UPDATE productstocks 
						SET value = value - {$diffStock}
						WHERE product_id = {$productId} 
						AND range_detail_id = {$rangeDetailId}
						AND entry_event_detail_id IS NULL");

            $return = array("success" => 'true',
                "msg" => "Le stock produit est mis à jour avec succés."
            );
        } else {
            $return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
        }

        $logger->debug("END updateStockProductRangeOfEntryEvent ------- ");
        return $return;
    }

    public function printCurrentEntryEvent($key, $id, $ratePrice, $purchasePrice)
    {

        $logger = Logger::getLogger(basename(__FILE__));
        $logger->debug("START printCurrentEntryEvent ------- ");

        $token = R::getRow('select * from token  where token like :token ', array(":token" => $key));
        $currentTime = time();

        $return = array();
        if ($currentTime < $token['validation_date']) {

            $data = $this->getEntryEventByIdAndByPage($key, $id, 0, 0);

            // Création du fichier Excel
            $fileHelper = new FileHelper ();
            $urlFile = $fileHelper->generateXlsxEntryEventFile($data['entry_event'], $token['user_id'], $ratePrice, $purchasePrice);
            $return = array("success" => 'true',
                "msg" => "L'impression du mouvement d'entrée est avec succés.",
                "url_file" => $urlFile
            );
        } else {
            $return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
        }

        $logger->debug("END printCurrentEntryEvent ------- ");
        return $return;

    }

    public function makeDataAsNewTable($key, $fileName, $data)
    {
        $logger = Logger::getLogger(basename(__FILE__));
        $logger->debug("START makeDataAsNewTable ------- ");
        $token = R::getRow('select * from token  where token like :token ', array(":token" => $key));
        $currentTime = time();
        if ($currentTime < $token['validation_date']) {
            $fileHelper = new FileHelper ();
            $newData = $fileHelper->createNewExcelFileUsingNewColumnsFormat($token['user_id'], $fileName, $data);
            $logger->debug("END makeDataAsNewTable ------- ");
            return $return = array(
                "success" => 'true',
                "msg" => "Le traitement des données est fait avec succés.",
                "data" => $newData
            );
        } else {
            $logger->debug("END makeDataAsNewTable ------- ");
            return $return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
        }
    }

    public function injectDataAndUpdateProducts($key, $data, $companyId)
    {

        $logger = Logger::getLogger(basename(__FILE__));
        $logger->debug("START injectDataAndUpdateProducts ------- ");

        $token = R::getRow('select * from token  where token like :token ', array(":token" => $key));
        $currentTime = time();

        $return = array();
        if ($currentTime < $token['validation_date']) {
            $tabErrors = [];
            $tabEntities = [];
            $tabProductsWithoutRanges = [];
            $nbProductsOK = 0;
            if (!empty($data)) {
                //\R::begin();

                // AJout du mouvement d'entrée
                $entryEvent = R::dispense('entryevents');
                $entryEvent->information = "";
                $entryEvent->user_id = $token["user_id"];
                $entryEvent->company_id = $companyId;
                $entryEvent->information = "Fichier import en masse du " . date('d/m/Y');
                $idEntryEvent = R::store($entryEvent);
                foreach ($data as $row) {
                    $ifRefProductExist = R::getRow("select id,range_id from products where reference = :ref", array(':ref' => $row['Référence']));
                    if (empty($ifRefProductExist)) {
                        $brand = R::load('brands', $row['marque']['id']);
                        $product = R::dispense('products');
                        $product->company_id = $companyId;
                        $product->reference = $row['Référence'];
                        $product->description = $row['Description'];
                        $product->category_id = $row['categorie']['id'];
                        $product->brand_id = $row['marque']['id'];
                        $product->range_id = $row['range_id'];

                        if (isset($row['Prix vente vanam'])) {
                            $product->sale_vanam_price = $row['Prix vente vanam'];
                        } else {
                            $product->sale_vanam_price = $row['Prix achat'] * $brand['marge'];
                        }

                        if (isset($row['gender'])) {
                            $product->gender_id = $row['gender']['id'];
                        }
                        if (isset($row['sport'])) {
                            $product->sport_id = $row['sport']['id'];
                        }
                        $product->color = isset($row['Color']) ? $row['Color'] : '';
                        if (isset($row['Prix vente public'])) {
                            $product->sale_public_price = $row['Prix vente public'];
                        }
                        if (isset($row['Prix vente tarif'])) {
                            $product->sale_rate_public = $row['Prix vente tarif'];
                        }

                        $idProduct = R::store($product);
                        $nbProductsOK++;

                        $entryEventDetail = R::dispense('entryeventdetails');
                        $entryEventDetail->entry_event_id = $idEntryEvent;
                        $entryEventDetail->product_id = $idProduct;

                        $entryEventDetail->purchase_price = isset($row['Prix achat']) ? $row['Prix achat'] : 0;

                        $entryEventDetail->sale_rate_price = isset($row['Prix vente tarif']) ? $row['Prix vente tarif'] : 0;


                        $idEntryEventDetail = R::store($entryEventDetail);

                        if (!empty($row['Aisle']) &&
                            !empty($row['Palette'])
                        ) {
                            $location = R::dispense('productlocations');
                            $location->product_id = $idProduct;
                            $location->user_id = $token['user_id'];
                            $location->zonage_city_id = isset($row['Ville zonage']) ? $row['Ville zonage'] : 1;
                            $location->aisle = $row['Aisle'];
                            $location->palette = $row['Palette'];
                            $idLocation = R::store($location);
                        }
                        if (isset($row['ranges'])) {
                            if (!empty($row['ranges'])) {
                                foreach ($row['ranges'] as $key => $range) {

                                    $name = isset ($range['name']) ? $range['name'] : $key;

                                    $pStock = R::dispense('productstocks');
                                    $rangeByName = R::getRow('select * from rangedetails where name = :name and range_id = :id',
                                        array(":name" => $name, ":id" => $row['range_id'])
                                    );
                                    if (!empty($rangeByName)) {
                                        $pStock->product_id = $idProduct;
                                        $pStock->range_detail_id = $rangeByName['id'];
                                        $pStock->value = $range['value'];
                                        $idPStock = R::store($pStock);

                                        $pStockEntryEvent = R::dispense('productstocks');
                                        $pStockEntryEvent->product_id = $idProduct;
                                        $pStockEntryEvent->range_detail_id = $rangeByName['id'];
                                        $pStockEntryEvent->value = $range['value'];
                                        $pStockEntryEvent->entry_event_detail_id = $idEntryEventDetail;
                                        $idPStockEntryEvent = R::store($pStockEntryEvent);
                                    }
                                }
                            }
                        } else {
                            array_push($tabProductsWithoutRanges, $row['Référence']);
                        }
                        //\R::commit();
                    } else {

                        $product = R::load('products', $ifRefProductExist['id']);
                        $brand = R::load('brands', $row['marque']['id']);

                        if (isset($row['Prix vente vanam'])) {
                            $product->sale_vanam_price = $row['Prix vente vanam'];
                        } else if ($product->sale_vanam_price == 0) {
                            $product->sale_vanam_price = $row['Prix achat'] * $brand['marge'];
                        }
                        $idProduct = R::store($product);

                        $nbProductsOK++;

                        $entryEventDetail = R::dispense('entryeventdetails');
                        $entryEventDetail->entry_event_id = $idEntryEvent;
                        $entryEventDetail->product_id = $ifRefProductExist['id'];

                        $entryEventDetail->purchase_price = isset($row['Prix achat']) ? $row['Prix achat'] : 0;

                        $entryEventDetail->sale_rate_price = isset($row['Prix vente tarif']) ? $row['Prix vente tarif'] : 0;


                        $idEntryEventDetail = R::store($entryEventDetail);

                        if (isset($row['ranges'])) {
                            if (!empty($row['ranges'])) {
                                $allRangeDetails = R::getRow("select group_concat(id,',') ranges from rangedetails where range_id =:id",
                                    array(":id" => $row['range_id'])
                                );
                                $tabRanges = explode(',', $allRangeDetails['ranges']);
                                $isOkToUpdate = true;
                                foreach ($row['ranges'] as $key => $range) {

                                    $name = isset ($range['name']) ? $range['name'] : $key;

                                    $rangeByName = R::getRow('select * from rangedetails where name = :name and range_id = :id',
                                        array(":name" => $name, ":id" => $row['range_id'])
                                    );

                                    if (in_array($rangeByName['id'], $tabRanges) &&
                                        !empty($rangeByName)) {

                                        $pStockEntryEvent = R::dispense('productstocks');
                                        $pStockEntryEvent->product_id = $ifRefProductExist['id'];
                                        $pStockEntryEvent->range_detail_id = $rangeByName['id'];
                                        $pStockEntryEvent->value = $range['value'];
                                        $pStockEntryEvent->entry_event_detail_id = $idEntryEventDetail;

                                        array_push($tabEntities,
                                            array(
                                                "entity" => $pStockEntryEvent,
                                                "sql" => "	update productstocks set value = value + {$range['value']}
																				where 
																				product_id = {$ifRefProductExist['id']} 
																				and 
																				range_detail_id = {$rangeByName['id']}"
                                            )
                                        );
                                    } else {
                                        $isOkToUpdate = false;
                                        array_push($tabErrors, $row ["Référence"]);
                                        break;
                                    }
                                }
                                if ($isOkToUpdate) {
                                    foreach ($tabEntities as $entity) {
                                        $idEntity = R::store($entity['entity']);
                                        R::exec($entity['sql']);
                                    }
                                }
                            }
                        } else {
                            array_push($tabProductsWithoutRanges, $row['Référence']);
                        }
                        // Mise à jour des stocks
                    }
                }
            }
            $nbProductsNOK = count($tabErrors);
            $nbProductsWithoutStocks = count($tabProductsWithoutRanges);
            $return = array("success" => 'true',
                "msg" => "Le traitement des données est fait avec succés.",
                "products_ok" => array(
                    "msg" => "Traitement produits avec succès : {$nbProductsOK} produit(s) ."
                ),
                "products_nok" => array(
                    "msg" => "Traitement produits erronées : {$nbProductsNOK} produit(s) .",
                    "products" => $tabErrors

                ),
                "products_without_ranges" => array(
                    "msg" => "Dont produits sans stocks : {$nbProductsWithoutStocks} produit(s).",
                    "products" => $tabProductsWithoutRanges
                )
            );
        } else {
            $return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
        }

        $logger->debug("END injectDataAndUpdateProducts ------- ");
        return $return;
    }

    public function importPicturesFromZipFile($key, $file)
    {
        $logger = Logger::getLogger(basename(__FILE__));
        $logger->debug("START importPicturesFromZipFile ------- ");

        $token = R::getRow('select * from token  where token like :token ', array(":token" => $key));
        $currentTime = time();

        $return = array();
        if ($currentTime < $token['validation_date']) {
            $report = [];
            $this->unzipFile($file['tmp_name'], "documents/tmp_files/");
            $tabName = explode(".", $file['name']);
            $nameWithoutExtension = $tabName[0];
            $toolsService = new ToolsService ();

            $tabAllReferences = scandir("documents/tmp_files/" . $nameWithoutExtension);
            $nbPictures = 0;
            $nbProductsOK = 0;

            foreach ($tabAllReferences as $reference) {
                if (is_dir("documents/tmp_files/" . $nameWithoutExtension . "/" . $reference)
                    &&
                    !in_array($reference, [".", ".."])) {

                    $tabPictures = scandir("documents/tmp_files/" . $nameWithoutExtension . "/" . $reference);
                    $product = R::getRow("select * from products where reference = :ref", array(":ref" => $reference));
                    $outputOriginal = "pictures/originals/";
                    $outputMiniature = "pictures/thumbnails/";
                    if (!is_dir($outputOriginal . $product['id'])) {
                        if (!mkdir($outputOriginal . $product['id'], 0777, true)) {
                            $logger->debug("Erreur de création de dossier {$outputOriginal}");
                            return array("success" => 'false', "msg" => "Erreur de création de photo", "err_code" => "100");
                        }
                    }
                    if (!is_dir($outputMiniature . $product['id'])) {
                        if (!mkdir($outputMiniature . $product['id'], 0777, true)) {
                            $logger->debug("Erreur de création de dossier {$outputMiniature}");
                            return array("success" => 'false', "msg" => "Erreur de création de photo", "err_code" => "100");
                        }
                    }

                    foreach ($tabPictures as $picture) {
                        $filePath = "documents/tmp_files/" . $nameWithoutExtension . "/" . $reference . "/" . $picture;
                        $logger->debug($filePath);
                        if (is_file($filePath) && !in_array($picture, [".", ".."])) {
                            rename($filePath, $outputOriginal . $product['id'] . "/" . $picture);
                            $type = mime_content_type($outputOriginal . $product['id'] . "/" . $picture);
                            if (in_array(strtolower($type), array('image/jpg', 'image/jpeg'))) {
                                try {
                                    $exif = @exif_read_data($outputOriginal . $product['id'] . "/" . $picture);
                                    if (empty($exif['SectionsFound'])) {
                                        $iof = new ImageOrientationFix($outputOriginal . $product['id'] . "/" . $picture);
                                        $iof->fix();
                                    }
                                } catch (Exception $e) {
                                    $logger->debug($e);
                                }
                            }

                            $toolsService->createMiniatureForProduct(150,
                                120,
                                $type,
                                $outputOriginal . $product['id'] . "/" . $picture,
                                $outputMiniature . $product['id'] . "/" . $picture);

                            $pictureObject = R::dispense('productpictures');
                            $pictureObject->product_id = $product['id'];
                            $pictureObject->name = $picture;
                            $idPicture = R::store($pictureObject);
                            $nbPictures++;
                        }
                    }
                    $nbProductsOK++;
                }
            }

            $this->deleteDirectory("documents/tmp_files/" . $nameWithoutExtension);

            array_push($report, array("pictures_number" => $nbPictures, "products_ok" => $nbProductsOK));

            $return = array("success" => 'true', "msg" => "Ajout images avec succès.", "report" => $report);
        } else {
            $return = array("success" => 'false', "msg" => "Le token n'est plus valide !", "err_code" => "100");
        }

        $logger->debug("END importPicturesFromZipFile ------- ");
        return $return;

    }

    private function unzipFile($file, $destination)
    {
        $zip = new ZipArchive();
        if ($zip->open($file) !== TRUE) {
            return false;
        }
        $zip->extractTo($destination);
        $zip->close();
        return true;
    }

    private function deleteDirectory($directory)
    {
        if (!$dh = opendir($directory)) {
            return false;
        }
        while ($file = readdir($dh)) {
            if ($file == "." || $file == "..") {
                continue;
            }
            if (is_dir($directory . "/" . $file)) {
                $this->deleteDirectory($directory . "/" . $file);
            }

            if (is_file($directory . "/" . $file)) {
                unlink($directory . "/" . $file);
            }
        }
        closedir($dh);
        rmdir($directory);
    }
}

?>