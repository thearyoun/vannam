<?php

namespace UTILE;

class ExcelHelper{

	public function __construct(){

	}

	public function generateExcelProductsFileFromData (	$products, $userId, $isImages, $isPAchat, $isPTarif, $isPPublic, $isPVanam, $formatStock, $typeDocument) {
		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateExcelFileFromData ------- ");

		$objPHPExcel = new \PHPExcel();

		$objPHPExcel->getProperties()->setCreator("VANAM SARL")
							->setLastModifiedBy("VANAM SARL")->setTitle("Office 2007 XLSX VANAM")
							->setSubject("Office 2007 XLSX Produits")->setDescription("Liste des produits vanam.")
							->setKeywords("xlsx")->setCategory("Produits");
		$objPHPExcel->getActiveSheet()->getHeaderFooter()->setOddHeader( '&L&D&CVANAM contact@vanam.fr &R&P/&N');

		$indexRow = 1 ;
		$indexCol = -1 ;
		
		$currentTabGeneralFile = unserialize(PARAMS_EXCEL_FILE)['columns_products_params'] ; 
		
		if (!$isImages) {
			unset($currentTabGeneralFile['image']) ;
		}

		if ($typeDocument == 1) {
			if (!$isPAchat) {
				unset($currentTabGeneralFile['p_achat']) ;
			}
			if (!$isPTarif) {
				unset($currentTabGeneralFile['p_tarif']) ;
			}
			if (!$isPPublic) {
				unset($currentTabGeneralFile['p_public']) ;
			}
		}
		else {
			unset($currentTabGeneralFile['p_achat']) ;
			unset($currentTabGeneralFile['p_tarif']) ;
			unset($currentTabGeneralFile['p_public']) ;
			//unset($currentTabGeneralFile['zone']) ;
			unset($currentTabGeneralFile['gamme']) ;
		}
		
		if (!$isPVanam) {
			unset($currentTabGeneralFile['p_vente']) ;
		}

		if ($formatStock == 1) {
			unset($currentTabGeneralFile['tailles_dispo']) ;
		}

		foreach($currentTabGeneralFile as $dataColumn) {
			$lastLetter 		= chr(65 + ++$indexCol);
			$lastLetterInFile 	= $lastLetter.$indexRow ;
			$objPHPExcel->setActiveSheetIndex(0)
        				->setCellValue($lastLetterInFile, $dataColumn['label']) ;
        }
        
        if (!empty( $products)) {	

        	if ($formatStock == 1) {
        		$tabAllStocks 	= array_column($products, "stocks", "stocks");
				$allRanges 		= [] ;
				foreach ($tabAllStocks as $allStocks) {
					$tabStocks = explode ("#",$allStocks) ;
					foreach ($tabStocks as $stock){
						$range = str_replace('[','',preg_replace('/>.*/', '', $stock));
						if (!empty($range)) {
							if (!in_array($range, $allRanges) )  {
								array_push($allRanges ,$range);	
							}
						}
					}
				}
				$col = $objPHPExcel->getActiveSheet()->fromArray(array_values($allRanges), null, chr(65 + ++$indexCol).$indexRow);

				$columnIndex 						= \PHPExcel_Cell::columnIndexFromString($lastLetter);
				$adjustedColumn 					= \PHPExcel_Cell::stringFromColumnIndex($columnIndex);
				$dataOfCurrentStockColumnsWithEggs 	= $objPHPExcel->setActiveSheetIndex(0)->rangeToArray($adjustedColumn.$indexRow.':'.$col.$indexRow);
			  	$dataOfCurrentStockColumns 			= $dataOfCurrentStockColumnsWithEggs[1] ;
				$objPHPExcel->getActiveSheet()->getStyle("A1:{$col}1")->applyFromArray(unserialize(PARAMS_EXCEL_FILE)['headers_style']);
			}
			else {
				$objPHPExcel->getActiveSheet()->getStyle("A1:P1")->applyFromArray(unserialize(PARAMS_EXCEL_FILE)['headers_style']);
			}

			$indexRow ++;
    									
        	$objPHPExcel->getActiveSheet()->getStyle("A2:P17")->applyFromArray(unserialize(PARAMS_EXCEL_FILE)['rows_style']);
			
			$indexCol = -1 ;	

			foreach ($currentTabGeneralFile as $dataColumn) {
				$objPHPExcel->getActiveSheet()->getColumnDimension(chr(65 + ++$indexCol))->setWidth($dataColumn['width']);
			}

        	foreach ($products as $product) {
        		
    			$indexCol = -1 ;

    			if ($isImages) {
					if (!empty($product['url_picture']) && file_exists ($product['url_picture'])) {
						$objPHPExcel->getActiveSheet()->getRowDimension($indexRow)->setRowHeight(92);
						$objDrawing = new \PHPExcel_Worksheet_Drawing();
						$objDrawing->setName('Miniature');
						$objDrawing->setDescription('Miniature');
						$objDrawing->setPath($product['url_picture']); 
						$objDrawing->setCoordinates(chr(65 + ++$indexCol).$indexRow);
						$objDrawing->setHeight(120); 
						$objDrawing->setWorksheet($objPHPExcel->getActiveSheet()); 
					}
					else {
						$objPHPExcel->getActiveSheet()->getRowDimension($indexRow)->setRowHeight(17);
						$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, "");
					}
				}
        		
        		$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $product['reference']);
        		$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $product['description']);
        		$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $product['brand']);
        		$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $product['categorie']);
        		$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $product['gender']);
        		$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $product['sport']);
        		$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $product['color']);

        		if ($typeDocument == 1) {
       				$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $product['range_name']);
       			}

        		$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $product['qtr']);

        		//if ($typeDocument == 1) {
        			$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $product['location']);
        		//}
        		if ($isPAchat){
        			$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, "00");
				}
        		if ($isPVanam){
					$pVanam = isset($product['sale_price']) ? $product['sale_price'] : $product['sale_vanam_price'] ;
        			$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $pVanam);
        		}
        		if ($isPTarif){
      				$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $product['sale_rate_public']);
        		}
        		if ($isPPublic){
        			$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $product['sale_public_price']);
        		}
        		if ($formatStock == 2) {
        			$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $product['stocks']);
        		}
        		else {
					$tabStocks = explode ("#",$product['stocks']) ;
					foreach ($tabStocks as $stock){
						$dataRange 		= str_replace (']','',str_replace('[','',$stock));
						$tabDataRange 	= explode ('>',$dataRange);	
						foreach ($dataOfCurrentStockColumns as $letter=>$rangeName) {
							if ($tabDataRange[0] == "{$rangeName}"){
								if (isset($tabDataRange[1])) {
									$objPHPExcel->setActiveSheetIndex(0)->setCellValue($letter.$indexRow, $tabDataRange[1]);
									break;
								}
							}
						}
					}
        		}
        				    	;
				$indexRow ++ ;
        	}
       	}

       	if ($typeDocument == 1 ) {
       		$objPHPExcel->getActiveSheet()->setTitle('Produits');
       		$objPHPExcel->setActiveSheetIndex(0);

       		$fileName = "produits_{$userId}.xlsx";

			header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			header('Content-Disposition: attachment;filename="'.$fileName.'"');
			header('Cache-Control: max-age=0');
			header('Cache-Control: max-age=1');
			header ('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); 
			header ('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT'); 
			header ('Cache-Control: cache, must-revalidate'); 
			header ('Pragma: public'); 
			$urlFile 	= 'templates/produits/'.$fileName ;
			$objWriter 	= \PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
       	}
       	else if ($typeDocument == 2){
       		$objPHPExcel->getActiveSheet()->setTitle('Devis');
       		$objPHPExcel->setActiveSheetIndex(0);

       		$fileName = "devis_{$userId}.xlsx";

			header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			header('Content-Disposition: attachment;filename="'.$fileName.'"');
			header('Cache-Control: max-age=0');
			header('Cache-Control: max-age=1');
			header ('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); 
			header ('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT'); 
			header ('Cache-Control: cache, must-revalidate'); 
			header ('Pragma: public'); 
			$urlFile 	= 'templates/quotations/'.$fileName ;
			$objWriter 	= \PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');	
       	}
       	else if ($typeDocument == 3){
       		$objPHPExcel->getActiveSheet()->setTitle('Commande');
       		$objPHPExcel->setActiveSheetIndex(0);

       		$fileName = "commande_{$userId}.xlsx";

			header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			header('Content-Disposition: attachment;filename="'.$fileName.'"');
			header('Cache-Control: max-age=0');
			header('Cache-Control: max-age=1');
			header ('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); 
			header ('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT'); 
			header ('Cache-Control: cache, must-revalidate'); 
			header ('Pragma: public'); 
			$urlFile 	= 'templates/commands/'.$fileName ;
			$objWriter 	= \PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');	
       	}
        
		$objWriter->save($urlFile);
		$logger->debug("END generateExcelFileFromData ------- ");

		return $urlFile;
	}	

 	public function generateXlsxEntryEventFile(	$entryEnvent, $userId, $isPTarif, $isPAchat) {
 		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateXlsxEntryEventFile ------- ");
		$logger->debug($entryEnvent);
		$objPHPExcel = new \PHPExcel();

		$objPHPExcel->getProperties()->setCreator("VANAM SARL")
							->setLastModifiedBy("VANAM SARL")->setTitle("Office 2007 XLSX VANAM")
							->setSubject("Office 2007 XLSX Mouvement d'entrée")->setDescription("Mouvement d'entrée vanam.")
							->setKeywords("xlsx")->setCategory("Mouvement d'entrée");

		$currentTabGeneralFile = unserialize(PARAMS_EXCEL_FILE)['columns_entry_events_params'] ; 
		$objPHPExcel->getActiveSheet()->getStyle("C1:E2")->applyFromArray(unserialize(PARAMS_EXCEL_FILE)['headers_style']);
		
		$objPHPExcel->setActiveSheetIndex(0)->setCellValue("C1", "Mouvement d'entrée n° : ".$entryEnvent['id']) ;
		$objPHPExcel->setActiveSheetIndex(0)->mergeCells("C1:E1");

		$objPHPExcel->setActiveSheetIndex(0)->setCellValue("C2", $entryEnvent['information']) ;
		$objPHPExcel->setActiveSheetIndex(0)->mergeCells("C2:E2");


		if (!$isPAchat) {
			unset($currentTabGeneralFile['p_achat']) ;
		}
		if (!$isPTarif) {
			unset($currentTabGeneralFile['p_tarif']) ;
		}

		$indexRow = 3 ;
		$indexCol = -1 ;

		foreach($currentTabGeneralFile as $dataColumn) {
			$lastLetter = chr(65 + ++$indexCol);
			$lastLetterInFile = $lastLetter.$indexRow ;
			$objPHPExcel->setActiveSheetIndex(0)
        				->setCellValue($lastLetterInFile, $dataColumn['label']) ;
        }

        $objPHPExcel->getActiveSheet()->getStyle("A3:P3")->applyFromArray(unserialize(PARAMS_EXCEL_FILE)['headers_style']);
       	
       	$indexCol = -1 ;
       	foreach ($currentTabGeneralFile as $dataColumn) {
			$objPHPExcel->getActiveSheet()->getColumnDimension(chr(65 + ++$indexCol))->setWidth($dataColumn['width']);
		}

		$indexRow ++ ;

		$objPHPExcel->getActiveSheet()->getStyle("A4:P3")->applyFromArray(unserialize(PARAMS_EXCEL_FILE)['rows_style']);

		foreach ($entryEnvent['entry_event_details'] as $detail) {
			$indexCol = -1 ;
			$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $detail['reference']);
        	$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $detail['zone']);
        	$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $detail['description']);
        	$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $detail['brand']);
        	$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $detail['category']);
        	if ($isPAchat) {
        	    $objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $detail['purchase_price']);	
        	}
        	if ($isPTarif) {
        		$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $detail['sale_rate_price']);
			}
        	$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $detail['quantity']);
        	$objPHPExcel->setActiveSheetIndex(0)->setCellValue(chr(65 + ++$indexCol).$indexRow, $detail['qtr']);
			$indexRow ++ ;
		}

        $objPHPExcel->getActiveSheet()->setTitle("Mouvement d'entrée");

        $objPHPExcel->setActiveSheetIndex(0);

        $fileName = "entry_events_{$userId}.xlsx";

		header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		header('Content-Disposition: attachment;filename="'.$fileName.'"');
		header('Cache-Control: max-age=0');
		header('Cache-Control: max-age=1');
		header('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); 
		header('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT'); 
		header('Cache-Control: cache, must-revalidate'); 
		header('Pragma: public'); 
		$urlFile 	= 'templates/entry_events/'.$fileName ;
		$objWriter 	= \PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
		$objWriter->save($urlFile);
		$logger->debug("END generateExcelFileFromData ------- ");

		return $urlFile;

 	}

 	public function prepareImportEntryEventFile ($userId, $file) {
 		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START prepareImportEntryEventFile ------- ");

		try {
			
			$name 			= PATH_EXCEL_FILES_BATCH.$userId.'_'.$file['name'] ;
			move_uploaded_file($file['tmp_name'], $name);
			$data 			= [] ;
			$headers 		= [] ;
    		$inputFileType 	= \PHPExcel_IOFactory::identify($name);
    		$objReader 		= \PHPExcel_IOFactory::createReader($inputFileType);
    		$objPHPExcel 	= $objReader->load($name);

    		$sheet 			= $objPHPExcel->getSheet(0); 
    		$highestColumn 	= $sheet->getHighestColumn();

    		$headers 		= $sheet->rangeToArray("A1:{$highestColumn}1",
                                            		NULL,
                                            		TRUE,
                                            		FALSE
													);
    		$headers		= array_filter($headers[0],function($value, $key) {
       							return !empty($value);
								}, ARRAY_FILTER_USE_BOTH);
    		$data['headers'] = $headers ;

    		$objPHPExcel->disconnectWorksheets();
    		unset($objPHPExcel) ;

		} catch(Exception $e) {
    		$logger->debug('Error loading file "'.pathinfo($inputFileName,PATHINFO_BASENAME).'": '.$e->getMessage());
		}

		$logger->debug("END prepareImportEntryEventFile ------- ");
		return $data ;
 	}

	 
 	public function createNewEntryEventFileAsNewFormat ($userId, $fileName, $data) {
 		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START createNewEntryEventFileAsNewFormat ------- ");

		 $name = PATH_EXCEL_FILES_BATCH.$userId.'_'.$fileName ;
		 
		try {

			$inputFileType 		= \PHPExcel_IOFactory::identify($name);
    		$objReader 			= \PHPExcel_IOFactory::createReader($inputFileType);
    		$objPHPExcel 		= $objReader->load($name);
    		$wsD 				= $objReader->listWorksheetInfo($name);

    		$tabNamesOfRanges	= [] ;
    		
    		$sheet 				= $objPHPExcel->getSheet(0);
    		$objPHPExcel->createSheet();
			$objPHPExcel->setActiveSheetIndex(1);
		
   			foreach ($data as $row) {
				   return $row;
  
   				$nameNewColumn 		= $row[1][0]['value'] ;
   				$isMultipleColumns 	= false ;
   				$oldRangeValues		= [] ;

   				if ($row[1][0]['is_range'] ) {
   					$isMultipleColumns 	= true ;
   					$oldRangeValues		= \R::getRow('select * from ranges where name like :name',array(':name'=>$row[1][0]['value'])); 
   				}
   				if ($isMultipleColumns) {
   					$indexRange 			= 0 ;
   				}

   				foreach ($row[0] as $column) {
   					if ($isMultipleColumns) {
   						$currentRangeInUtile 	= \R::getRow ("select * from rangedetails where name = :range",
   																array(':range'=>$column['value'])
   															) ;
   						$nameNewColumn 		= $column['value'] ;
   						$nameRangeInFile 	= "";
   						$nameIdInFile 		= "";
   						if (!empty($currentRangeInUtile)) {
   							$nameRangeInFile 	= $currentRangeInUtile['name'] ;
   							$nameNewColumn  	= $currentRangeInUtile['name'] ;
   							$nameIdInFile 		= $currentRangeInUtile['range_id'];
   						}
   						
   						$status 				= !empty($nameRangeInFile) ? 'true' : 'false' ;
   						array_push($tabNamesOfRanges,array(	"old_name" 		=> $nameNewColumn 	,
   															"range_id"		=> $nameIdInFile	,
   															"status"		=> $status 			,
   															"old_range_id"	=> isset($oldRangeValues['id']) ? $oldRangeValues['id'] : null 
   														)
   									) ;
   						$indexRange ++ ;
   					}
    				$charOldColumn	= $column['key'] ;
    				$AllcolumnsData = $sheet->rangeToArray("{$charOldColumn}2:{$charOldColumn}{$wsD[0]['totalRows']}",
                       	                    			NULL,
                                            			TRUE,
                   	                        			FALSE
            	                            			);
    				array_unshift($AllcolumnsData, array ($charOldColumn => $nameNewColumn));

    				$i = 1 ;
   					foreach ($AllcolumnsData as $nRow) {
   						$tabArrayValue 			= [] ;
   						$letterOfCurrentColumn 	= "";
   						foreach ($nRow as $let => $val) {
   							$letterOfCurrentColumn = $let ;
   							array_push($tabArrayValue, $val);
   						}
   						$objPHPExcel->getActiveSheet()->fromArray($tabArrayValue,NULL,"{$letterOfCurrentColumn}{$i}");
    					$i ++;
    				}
   				}	
    		}

    		$objWriter = \PHPExcel_IOFactory::createWriter($objPHPExcel, $inputFileType);
    		$objWriter->save($name) ;

			$objPHPExcel->disconnectWorksheets();
    		unset($objPHPExcel) ;

    		
    		$objReaderSecond 		= \PHPExcel_IOFactory::createReader($inputFileType);
    		$objPHPExcelSecond	 	= $objReaderSecond->load($name);
    		$sheetSecond 			= $objPHPExcelSecond->getSheet(1);

    		$wsDS		 			= $objReaderSecond->listWorksheetInfo($name);

    		$AllNewData 			= $sheetSecond->rangeToArray("A1:{$wsDS[0]['lastColumnLetter']}{$wsDS[0]['totalRows']}",
                       	                    						NULL,
                                            						TRUE,
                   	                        						FALSE
            	                            					);
    		$newTableData 			= [] ;
    		
    		foreach ($AllNewData as $key=>$dataParsed){
    			$newTableDataRanges 	= [] ;
    			if ($key > 1 ) {
    				$productData = [] ;
    				foreach ($dataParsed as $car => $rowParsed) {
    					if (!empty($rowParsed)) {
    						$isInRange 		= false ;
    						$statusOfRange 	= "" ;
    						$rangeId	 	= "" ;
    						$oldRangeId	 	= "" ;
    						foreach ($tabNamesOfRanges as $rangeRow) {
    							$oldRangeId		= $rangeRow['old_range_id'] ;
    							if ($rangeRow['old_name'] == $AllNewData[1][$car]) {
    								$isInRange 		= true ;
    								$statusOfRange 	= $rangeRow['status'] ;
    								$rangeId		= $rangeRow['range_id'] ;    								
    								break;
    							}
    						}
    						$productData['range_id'] 		= empty($rangeId) ? $oldRangeId : $rangeId ;
    						if ($isInRange){
    							$newTableDataRanges[$AllNewData[1][$car]] = array(	"value" 		=> $rowParsed 		, 
    																				"status" 		=> $statusOfRange 	,
    																				"range_id"		=> $rangeId 		 		
    																			 );
    						}
    						else {
    							$productData[$AllNewData[1][$car]] = $rowParsed ;
    						}
    					}
    				}
    			}
    			else {
    				continue ;
    			}
    			if (!empty($newTableDataRanges)) {
    				$productData['ranges'] = $newTableDataRanges ;
    			}
    			array_push($newTableData ,$productData);	
    		}
    	} catch(Exception $e) {
			$logger->debug('Error loading file "'.pathinfo($inputFileName,PATHINFO_BASENAME).'": '.$e->getMessage());
			return $e->getMessage();
		}

		$logger->debug("END createNewEntryEventFileAsNewFormat ------- ");

		$newTableData		= array_filter($newTableData,function($value, $key) {
       							return !empty($value);
							  }, ARRAY_FILTER_USE_BOTH);

 		return $newTableData ;
	 }
	/*public function createNewEntryEventFileAsNewFormat ($userId, $fileName, $data) {
		$logger = \Logger::getLogger(basename(__FILE__));
	   $logger->debug("START createNewEntryEventFileAsNewFormat ------- ");

		$name = PATH_EXCEL_FILES_BATCH.$userId.'_'.$fileName ;
	   try {

			$inputFileType 	= \PHPExcel_IOFactory::identify($name);
			$objReader = \PHPExcel_IOFactory::createReader($inputFileType);
			$objPHPExcel = $objReader->load($name);
			$objPHPExcel->setActiveSheetIndex(0);
			$sheet = $objPHPExcel->getActiveSheet();

			$tabNamesOfRanges	= [] ;

			foreach ($data as $row) {
				return $row;

				$nameNewColumn 		= $row[1][0]['value'] ;
				$isMultipleColumns 	= false ;
				$oldRangeValues		= [] ;

				if ($row[1][0]['is_range'] ) {
					$isMultipleColumns 	= true ;
					$oldRangeValues		= \R::getRow('select * from ranges where name like :name',array(':name'=>$row[1][0]['value'])); 
				}
				if ($isMultipleColumns) {
					$indexRange 			= 0 ;
				}

				foreach ($row[0] as $column) {
					if ($isMultipleColumns) {
						$currentRangeInUtile 	= \R::getRow ("select * from rangedetails where name = :range",
																array(':range'=>$column['value'])
															) ;
						$nameNewColumn 		= $column['value'] ;
						$nameRangeInFile 	= "";
						$nameIdInFile 		= "";
						if (!empty($currentRangeInUtile)) {
							$nameRangeInFile 	= $currentRangeInUtile['name'] ;
							$nameNewColumn  	= $currentRangeInUtile['name'] ;
							$nameIdInFile 		= $currentRangeInUtile['range_id'];
						}
						
						$status 				= !empty($nameRangeInFile) ? 'true' : 'false' ;
						array_push($tabNamesOfRanges,array(	"old_name" 		=> $nameNewColumn 	,
															"range_id"		=> $nameIdInFile	,
															"status"		=> $status 			,
															"old_range_id"	=> isset($oldRangeValues['id']) ? $oldRangeValues['id'] : null 
														)
									) ;
						$indexRange ++ ;
					}
				 $charOldColumn	= $column['key'] ;
				 $AllcolumnsData = $sheet->rangeToArray("{$charOldColumn}2:{$charOldColumn}{$wsD[0]['totalRows']}",
														NULL,
													 TRUE,
														FALSE
													 );
				 array_unshift($AllcolumnsData, array ($charOldColumn => $nameNewColumn));

				 $i = 1 ;
					foreach ($AllcolumnsData as $nRow) {
						$tabArrayValue 			= [] ;
						$letterOfCurrentColumn 	= "";
						foreach ($nRow as $let => $val) {
							$letterOfCurrentColumn = $let ;
							array_push($tabArrayValue, $val);
						}
						$objPHPExcel->getActiveSheet()->fromArray($tabArrayValue,NULL,"{$letterOfCurrentColumn}{$i}");
					 $i ++;
				 }
				}
			}
			$objWriter = \PHPExcel_IOFactory::createWriter($objPHPExcel, $inputFileType);
    		$objWriter->save($name) ;

			$objPHPExcel->disconnectWorksheets();
    		unset($objPHPExcel) ;

    		
    		$objReaderSecond 		= \PHPExcel_IOFactory::createReader($inputFileType);
    		$objPHPExcelSecond	 	= $objReaderSecond->load($name);
    		$sheetSecond 			= $objPHPExcelSecond->getSheet(1);

    		$wsDS		 			= $objReaderSecond->listWorksheetInfo($name);

    		$AllNewData 			= $sheetSecond->rangeToArray("A1:{$wsDS[0]['lastColumnLetter']}{$wsDS[0]['totalRows']}",
                       	                    						NULL,
                                            						TRUE,
                   	                        						FALSE
            	                            					);
    		$newTableData 			= [] ;
    		
    		foreach ($AllNewData as $key=>$dataParsed){
    			$newTableDataRanges 	= [] ;
    			if ($key > 1 ) {
    				$productData = [] ;
    				foreach ($dataParsed as $car => $rowParsed) {
    					if (!empty($rowParsed)) {
    						$isInRange 		= false ;
    						$statusOfRange 	= "" ;
    						$rangeId	 	= "" ;
    						$oldRangeId	 	= "" ;
    						foreach ($tabNamesOfRanges as $rangeRow) {
    							$oldRangeId		= $rangeRow['old_range_id'] ;
    							if ($rangeRow['old_name'] == $AllNewData[1][$car]) {
    								$isInRange 		= true ;
    								$statusOfRange 	= $rangeRow['status'] ;
    								$rangeId		= $rangeRow['range_id'] ;    								
    								break;
    							}
    						}
    						$productData['range_id'] 		= empty($rangeId) ? $oldRangeId : $rangeId ;
    						if ($isInRange){
    							$newTableDataRanges[$AllNewData[1][$car]] = array(	"value" 		=> $rowParsed 		, 
    																				"status" 		=> $statusOfRange 	,
    																				"range_id"		=> $rangeId 		 		
    																			 );
    						}
    						else {
    							$productData[$AllNewData[1][$car]] = $rowParsed ;
    						}
    					}
    				}
    			}
    			else {
    				continue ;
    			}
    			if (!empty($newTableDataRanges)) {
    				$productData['ranges'] = $newTableDataRanges ;
    			}
    			array_push($newTableData ,$productData);	
			}
		} catch(Exception $e) {
			$logger->debug('Error loading file "'.pathinfo($inputFileName,PATHINFO_BASENAME).'": '.$e->getMessage());
			return "rerro";
		}
	}*/

 	public function generateXlsxProformaOrInvoiceFile ($userId, $commandId, $company, $client, $typePayment, $transport, $tabProducts, $typeDocument, $change, $isExenorateTVA){
		$logger = \Logger::getLogger(basename(__FILE__));
 		$labelType = "PROFORMA" ;
 		if ($typeDocument == INVOICE_TYPE) {
 			$labelType = "FACTURE" ;
 		}

 		$objPHPExcel 	= new \PHPExcel();

		$objPHPExcel->getProperties()->setCreator("VANAM")
        		                    ->setLastModifiedBy("VANAM")
               		            	->setTitle("Office 2007 XLSX Test Document")
                             		->setSubject("Office 2007 XLSX Test Document")
                             		->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.")
                             		->setKeywords("office 2007 openxml php")
                             		->setCategory($labelType);
        $indexRow 		= 0 ;
        $totalInvoice 	= 0 ;
        $currentPage 	= 1 ;
        $nbPages 		= count($tabProducts);
        foreach ($tabProducts as $products) {

			if ($nbPages > 1) {
				if ($currentPage > 1) {
					array_unshift($products, array (	"description" 	=> "REPORT", 
														"sale_price" 	=> $totalInvoice, 
														"qte" 			=> 1 ,
														"brand" 		=> "" ,
														"reference" 	=> "" ,
														"category" 		=> ""
													)
									);
				}
			}
        	$this->generateCompanyInformationHeaderForInvoice($objPHPExcel, $commandId, $company, $indexRow, $typeDocument) 	;
        	$this->generateClientInformationHeaderForInvoice($objPHPExcel, $client, $indexRow, $currentPage, $nbPages, $typeDocument) ;
			$this->generateDeliveryInformationHeaderForInvoice($objPHPExcel, $typePayment, $indexRow);
        	$totalInvoice = $this->generateProductsInformationContentForInvoice($objPHPExcel, $indexRow, $products, $change);
			$this->generatePricesInformationContentForInvoice($objPHPExcel, $indexRow, $totalInvoice, $transport, $change, $nbPages == $currentPage, $isExenorateTVA);
        	$this->generateAllFontStyleOfInvoice($objPHPExcel, $indexRow, $typeDocument);
        	$this->generateAllBordersStyleOfInvoice($objPHPExcel, $indexRow);
        	$indexRow += 62  ;
        	$currentPage ++ ;
    	}
       	
       	$fileName = $labelType."_{$userId}.xlsx";

		header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		header('Content-Disposition: attachment;filename="'.$fileName.'"');
		header('Cache-Control: max-age=0');
		header('Cache-Control: max-age=1');
		header ('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); 
		header ('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT'); 
		header ('Cache-Control: cache, must-revalidate'); 
		header ('Pragma: public'); 
		$urlFile 	= 'templates/commands/'.$fileName ;
		$objWriter 	= \PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
		$objWriter->save($urlFile);

		return $urlFile;
	}

 	private function generateCompanyInformationHeaderForInvoice(&$objPHPExcel, $commandId, $company, $indexRow, $typeDocument) {
 		$labelType = "PROFORMA" ;
 		if ($typeDocument == INVOICE_TYPE) {
 			$labelType = "FACT N° ".$commandId ;
 		}
 		$objPHPExcel->setActiveSheetIndex(0)
            		->setCellValue(chr(65).($indexRow+1), utf8_decode($company['name']))
            		->setCellValue(chr(75).($indexRow+1), $labelType)
            		->setCellValue(chr(75).($indexRow+2), 'Date : '.date('d/m/Y'))
            		->setCellValue(chr(65).($indexRow+3), utf8_decode($company['address']))
            		->setCellValue(chr(65).($indexRow+4), utf8_decode($company['cp'].' '.$company['city']))
            		->setCellValue(chr(65).($indexRow+5), 'Tél : '.$company['phone'])
            		->setCellValue(chr(65).($indexRow+6), 'Fax : '.$company['fax'])
           		 	->setCellValue(chr(65).($indexRow+8), 'SIRET : '.$company['siret'])
   					->setCellValue(chr(65).($indexRow+9), 'CODE APE : '.$company['code_ape'])
   					->setCellValue(chr(65).($indexRow+10), 'N° Identific : '.$company['identific']);
 	}

 	private function generateClientInformationHeaderForInvoice (&$objPHPExcel, $client, $indexRow, $currentPage, $nbPages, $typeDocument) {
 		$labelType = "PROFORMA" ;
 		if ($typeDocument == INVOICE_TYPE) {
 			$labelType = "FACTURE" ;
 		}
 		$objPHPExcel->setActiveSheetIndex(0)   
            		->setCellValue(chr(75).($indexRow+8), 'Adresse de facturation')
            		->setCellValue(chr(75).($indexRow+9), utf8_decode($client['company_name']))
            		->setCellValue(chr(75).($indexRow+10), utf8_decode($client['addresses']['billing']['address']))
            		->setCellValue(chr(75).($indexRow+11), utf8_decode($client['addresses']['billing']['postal_code'].' '.$client['addresses']['billing']['city'].' '.$client['addresses']['billing']['country']))
            		->setCellValue(chr(75).($indexRow+12), 'TVA intra : '.$client['tva_intra'])
					->setCellValue(chr(70).($indexRow+13), $labelType.' '.$currentPage.'/'.$nbPages)
					->setCellValue(chr(70).($indexRow+14), 'EXPORT')
            		->setCellValue(chr(65).($indexRow+15), 'Mode d\'expédition     MARCHANDISE VENDUE DEPART ENTREPÔT')
            		->setCellValue(chr(75).($indexRow+15), 'Adresse de livraison')
            		->setCellValue(chr(75).($indexRow+17), utf8_decode($client['company_name']))
            		->setCellValue(chr(75).($indexRow+20), utf8_decode($client['addresses']['delivery']['address']))
					->setCellValue(chr(75).($indexRow+21), utf8_decode($client['addresses']['delivery']['postal_code'].' '.$client['addresses']['delivery']['city'].' '.$client['addresses']['delivery']['country'])) ;
	}

 	private function generateDeliveryInformationHeaderForInvoice(&$objPHPExcel, $typePayment, $indexRow) {
 		$tab = ["1" => "Chèque", "2" => "Virement", "3" => "Carte Bleue", "4" => "Espèce", "5" => "Traite"] ;
 		$reglement 	= isset($tab[$typePayment]) ? $tab[$typePayment] :"" ;
 		$objPHPExcel->setActiveSheetIndex(0)
            		->setCellValue(chr(65).($indexRow+21), 'Mode règlement : '.$reglement)
            		->setCellValue(chr(65).($indexRow+22), 'Date de réglement : Comptant Livraison');
 	}

 	private function generateProductsInformationContentForInvoice(&$objPHPExcel, $indexRow, $products, $change) {
 		$objPHPExcel->setActiveSheetIndex(0)
            		->setCellValue(chr(66).($indexRow+24), 'MARQUE' )
            		->setCellValue(chr(68).($indexRow+24), 'DESIGNATION' )
            		->setCellValue(chr(70).($indexRow+24), 'REFERENCE' )
            		->setCellValue(chr(71).($indexRow+24), 'TYPE' )
            		->setCellValue(chr(72).($indexRow+24), 'QTE' )
            		->setCellValue(chr(73).($indexRow+24), 'PRIX U '.$change )
            		->setCellValue(chr(75).($indexRow+24), 'MONTANT HT ' )
            		->setCellValue(chr(76).($indexRow+24), $change );
        
        $i 			= 26 ;
        $qteTotal 	= 0 ;
        $priceTotal 	= 0 ;
        foreach ($products as $product) {   
        	$tot = number_format($product['qte']*$product['sale_price'],2) ; 
        	$priceTotal += $product['qte']*$product['sale_price'] ;
        	$objPHPExcel->setActiveSheetIndex(0)
            			->setCellValue(chr(66).($indexRow+$i), utf8_decode($product['brand']))
            			->setCellValue(chr(68).($indexRow+$i), utf8_decode($product['description']))
            			->setCellValue(chr(70).($indexRow+$i), utf8_decode($product['reference']))
            			->setCellValue(chr(71).($indexRow+$i), utf8_decode($product['category']))
            			->setCellValue(chr(72).($indexRow+$i), $product['qte'])
            			->setCellValue(chr(73).($indexRow+$i), number_format($product['sale_price'], 2).' '.$change)
            			->setCellValue(chr(75).($indexRow+$i), $tot)
            			->setCellValue(chr(76).($indexRow+$i), $change);
            $i ++ ;
            $qteTotal+= $product['qte'];
        }
        
        $objPHPExcel->setActiveSheetIndex(0)
            		->setCellValue(chr(68).($indexRow+38), 'QUANTITE TOTALE')
            		->setCellValue(chr(72).($indexRow+38), $qteTotal);
        return $priceTotal ;
 	}

 	private function generatePricesInformationContentForInvoice(&$objPHPExcel, $indexRow, $totalInvoice, $transport, $change, $isOnePage, $isExenorateTVA) {

		$totalInvoiceToShow 	= "A REPORTER";
		$transportAmount 		= "A REPORTER";
		$baseTVA				= "A REPORTER";
		$tvaAmount				= "A REPORTER";
		$totalTTC 				= "A REPORTER";
		if ($isOnePage) {
			$totalInvoiceToShow 	= number_format($totalInvoice,2).' '.$change;
			$transportAmount		= number_format($transport['transport_amount'], 2).' '.$change ;	
			$baseTVA				= number_format($totalInvoice + $transport['transport_amount'], 2).' '.$change ;
			$tvaAmount 				= number_format(!$isExenorateTVA ? ($transport['transport_amount'] + $totalInvoice) * 0.2 : 0, 2).' '.$change;
			$totalTTC				= number_format($totalInvoice + $transport['transport_amount'] + (!$isExenorateTVA ? ($transport['transport_amount'] + $totalInvoice) * 0.2 : 0) , 2 )  ; 
		}

 		$objPHPExcel->setActiveSheetIndex(0)
            		->setCellValue(chr(65).($indexRow+40), '*' )
            		->setCellValue(chr(66).($indexRow+40), 'MONTANT HT' )
            		->setCellValue(chr(68).($indexRow+40), 'PORT/EMBAL' )
            		->setCellValue(chr(70).($indexRow+40), 'BASE TVA' )
            		->setCellValue(chr(71).($indexRow+40), 'TVA %' )
            		->setCellValue(chr(72).($indexRow+40), 'MONT. TVA' )
            		->setCellValue(chr(73).($indexRow+40), 'TOTAL' )
            		->setCellValue(chr(74).($indexRow+40), /*'ESCOMPTE'*/'' )

            		->setCellValue(chr(66).($indexRow+41), $totalInvoiceToShow )
            		->setCellValue(chr(68).($indexRow+41), $transportAmount)
            		->setCellValue(chr(70).($indexRow+41), $baseTVA)
            		->setCellValue(chr(71).($indexRow+41), !$isExenorateTVA ? 20 : 0 )
            		->setCellValue(chr(72).($indexRow+41), $tvaAmount)
            		->setCellValue(chr(73).($indexRow+41), $totalTTC)

            		->setCellValue(chr(66).($indexRow+50), $totalInvoiceToShow)
            		->setCellValue(chr(68).($indexRow+50), $transportAmount)
            		->setCellValue(chr(70).($indexRow+50), $baseTVA )
            		->setCellValue(chr(71).($indexRow+50), !$isExenorateTVA ? 20 : 0 )
            		->setCellValue(chr(72).($indexRow+50), $tvaAmount)
					->setCellValue(chr(73).($indexRow+50), $totalTTC)
					
					->setCellValue(chr(75).($indexRow+43), 'TOTAL HT ' )
            		->setCellValue(chr(75).($indexRow+44), 'TOTAL NET ' )
            		->setCellValue(chr(75).($indexRow+45), 'TOTAL TVA ' )
            		->setCellValue(chr(75).($indexRow+46), 'TOTAL TTC ' )
            		->setCellValue(chr(75).($indexRow+48), 'ACOMPTE' )
            		->setCellValue(chr(75).($indexRow+50), 'MONT. NET ' )


            		->setCellValue(chr(77).($indexRow+43), $totalInvoiceToShow)
            		->setCellValue(chr(77).($indexRow+44), $baseTVA)
            		->setCellValue(chr(77).($indexRow+45), $tvaAmount)
            		->setCellValue(chr(77).($indexRow+46), $totalTTC)
            		->setCellValue(chr(77).($indexRow+48), '' )
            		->setCellValue(chr(77).($indexRow+50), $totalTTC)

            		->setCellValue(chr(65).($indexRow+51), "EXONERATION DE TVA : ART 262 TER I DU CGI - AUTOLIQUIDATION PAR L'ACQUEREUR" )
            		->setCellValue(chr(65).($indexRow+52), "*EN CAS DE RETARD DE PAIEMENT, IL SERA APPLIQUE DES PENALITES DE 0,50% PAR MOIS DE RETARD.")
            		->setCellValue(chr(65).($indexRow+53), "*EN APPLICATION DE LA LOI N° 80.335 DU 12/05/80 LE TRANSFERT DE PROPRIETE DE MARCHANDISE EST SUSPENDU JUSQU AU\nPAIEMENT INTEGRAL DU PRIX.")
            		->setCellValue(chr(65).($indexRow+54), "*EN REVANCHE LE TRANSFERT DES RISQUES INTERVIENT DES LA DELIVRANCE DE LA MARCHANDISES A L'ACQUEREUR OU A SON\nMANDATAIRE.")
            		->setCellValue(chr(65).($indexRow+55), "*EN CAS DE LITIGE LE TRIBUNAL DE COMMERCE DE MARSEILLE EST SEUL COMPETENT ET CE MEME EN CAS D'APPEL EN GARANTIE\nOU DE PLURALITE DE DEFENDEURS.")
            		->setCellValue(chr(65).($indexRow+56), "*LA LOI APPLICABLE EST LA LOI FRANCAISE.")
            		->setCellValue(chr(65).($indexRow+57), "*NOS TRAITES OU ACCEPTATIONS N'OPERENT NI NOVATION NI DEROGATION A CETTE REGLE.");
 	}

 	private function generateAllFontStyleOfInvoice(&$objPHPExcel, $indexRow, $typeDocument) {

 		$fontStyle11 = [
    		'font' => [
        		'name' => 'Arial',
        		'size' => 8
    		]
		];

		$fontStyle12 = [
    		'font' => [
        		'name' => 'Arial',
        		'size' => 9,
        		'bold' => true
    		]
		];

		$fontStyle14 = [
    		'font' => [
        		'name' => 'Arial',
        		'size' => 9,
        		'bold' => true
    		]
		];
		$fontStyle17 = [
		    'font' => [
		        'name' => 'Arial',
		        'size' => 10,
		        'bold' => true
		    ]
		];
		$fontStyle18 = [
		    'font' => [
		        'name' => 'Arial',
		        'size' => 9,
		    ]
		];
		$fontStyle27 = [
		    'font' => [
		        'name' => 'Arial',
		        'size' => 13,
		        'bold' => true
		    ]
		];
		$fontStyle30 = [
		    'font' => [
		        'name' => 'Arial',
		        'size' => 14,
		        'bold' => true,
		    ]
		];
		$fontStyle35 = [
		    'font' => [
		        'name' => 'Arial',
		        'size' => 24,
		        'bold' => true,
		        'italic' => true,
		
		    ]
		];

		$labelType = "PROFORMA" ;
 		if ($typeDocument == INVOICE_TYPE) {
 			$labelType = "FACTURE" ;
 		}
		
		$objPHPExcel->getDefaultStyle()->applyFromArray($fontStyle11);
		
		$objPHPExcel->getActiveSheet()->getStyle(chr(66).($indexRow+15))->applyFromArray($fontStyle14);
		$objPHPExcel->getActiveSheet()->getStyle(chr(73).($indexRow+15))->applyFromArray($fontStyle14);
		$objPHPExcel->getActiveSheet()->getStyle(chr(73).($indexRow+8))->applyFromArray($fontStyle14);
		
		$objPHPExcel->getActiveSheet()->getStyle(chr(65).($indexRow+21))->applyFromArray($fontStyle17);
		$objPHPExcel->getActiveSheet()->getStyle(chr(65).($indexRow+22))->applyFromArray($fontStyle17);
				
		$objPHPExcel->getActiveSheet()->getStyle(chr(73).($indexRow+9).":".chr(73).($indexRow+12))->applyFromArray($fontStyle18);
		$objPHPExcel->getActiveSheet()->getStyle(chr(73).($indexRow+17).":".chr(73).($indexRow+21))->applyFromArray($fontStyle18);
		
		$objPHPExcel->getActiveSheet()->getStyle(chr(75).($indexRow+1))->applyFromArray($fontStyle27);
		$objPHPExcel->getActiveSheet()->getStyle(chr(75).($indexRow+2))->applyFromArray($fontStyle27);
		$objPHPExcel->getActiveSheet()->getStyle(chr(75).($indexRow+8))->applyFromArray($fontStyle17);
		$objPHPExcel->getActiveSheet()->getStyle(chr(75).($indexRow+15))->applyFromArray($fontStyle17);

		
		$objPHPExcel->getActiveSheet()->getStyle(chr(70).($indexRow+13))->applyFromArray($fontStyle30);
		$objPHPExcel->getActiveSheet()->getStyle(chr(70).($indexRow+14))->applyFromArray($fontStyle30);
		
		$objPHPExcel->getActiveSheet()->getStyle(chr(65).($indexRow+1))->applyFromArray($fontStyle35);
		
		$objPHPExcel->getActiveSheet()->setTitle($labelType);
 	}

 	public function generateAllBordersStyleOfInvoice(&$objPHPExcel, $indexRow) {
 		$borders = array(
		        'font' => [
		            'name' => 'Arial',
		            'size' => 8,
		            'bold' => false
				],
				'alignment' => [
					'horizontal' => \PHPExcel_Style_Alignment::HORIZONTAL_CENTER,
				],
		      	'borders' => array(
		          'outline' => array(
		              'style' => \PHPExcel_Style_Border::BORDER_THIN
		          )
		      )
		);

		$bordersInBoldFont = array(
			'font' => [
				'name' => 'Arial',
				'size' => 8,
				'bold' => true
			],
			'alignment' => [
				'horizontal' => \PHPExcel_Style_Alignment::HORIZONTAL_CENTER,
			],
			  	'borders' => array(
			  	'outline' => array(
				  'style' => \PHPExcel_Style_Border::BORDER_THIN
			  	)
		  	)
		);

		$bordersTotLabels = array(
			'font' => [
				'name' => 'Arial',
				'size' => 8,
				'bold' => false
			],
			'alignment' => [
				'horizontal' => \PHPExcel_Style_Alignment::HORIZONTAL_LEFT,
			]
		);

		$bordersTotAmounts = array(
			'font' => [
				'name' => 'Arial',
				'size' => 8,
				'bold' => false
			],
			'alignment' => [
				'horizontal' => \PHPExcel_Style_Alignment::HORIZONTAL_RIGHT,
			]
		);

		$borderBottom = array(
		    'font' => [
		        'name' => 'Arial',
		        'size' => 5,
		        'bold' => false
		    ]
		);
		$objPHPExcel->getActiveSheet()->getStyle(chr(65).($indexRow+24).":".chr(69).($indexRow+24))->applyFromArray($bordersInBoldFont);
		$objPHPExcel->getActiveSheet()->getStyle(chr(67).($indexRow+24).":".chr(69).($indexRow+24))->applyFromArray($bordersInBoldFont);
		$objPHPExcel->getActiveSheet()->getStyle(chr(70).($indexRow+24))->applyFromArray($bordersInBoldFont);
		$objPHPExcel->getActiveSheet()->getStyle(chr(71).($indexRow+24))->applyFromArray($bordersInBoldFont);
		$objPHPExcel->getActiveSheet()->getStyle(chr(72).($indexRow+24))->applyFromArray($bordersInBoldFont);
		$objPHPExcel->getActiveSheet()->getStyle(chr(73).($indexRow+24).":".chr(74).($indexRow+24))->applyFromArray($bordersInBoldFont);
		$objPHPExcel->getActiveSheet()->getStyle(chr(75).($indexRow+24).":".chr(77).($indexRow+24))->applyFromArray($bordersInBoldFont);

		$objPHPExcel->getActiveSheet()->getStyle(chr(65).($indexRow+25).":".chr(66).($indexRow+38))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(67).($indexRow+25).":".chr(69).($indexRow+38))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(70).($indexRow+25).":".chr(70).($indexRow+38))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(71).($indexRow+25).":".chr(71).($indexRow+38))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(72).($indexRow+25).":".chr(72).($indexRow+38))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(73).($indexRow+25).":".chr(74).($indexRow+38))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(75).($indexRow+25).":".chr(77).($indexRow+38))->applyFromArray($borders);
				
		$objPHPExcel->getActiveSheet()->getStyle(chr(65).($indexRow+40).":".chr(73).($indexRow+40))->applyFromArray($bordersInBoldFont);
		$objPHPExcel->getActiveSheet()->getStyle(chr(66).($indexRow+40).":".chr(67).($indexRow+40))->applyFromArray($bordersInBoldFont);
		$objPHPExcel->getActiveSheet()->getStyle(chr(68).($indexRow+40).":".chr(69).($indexRow+40))->applyFromArray($bordersInBoldFont);
		$objPHPExcel->getActiveSheet()->getStyle(chr(70).($indexRow+40).":".chr(70).($indexRow+40))->applyFromArray($bordersInBoldFont);
		$objPHPExcel->getActiveSheet()->getStyle(chr(71).($indexRow+40).":".chr(71).($indexRow+40))->applyFromArray($bordersInBoldFont);
		$objPHPExcel->getActiveSheet()->getStyle(chr(72).($indexRow+40).":".chr(72).($indexRow+40))->applyFromArray($bordersInBoldFont);
		$objPHPExcel->getActiveSheet()->getStyle(chr(73).($indexRow+40).":".chr(73).($indexRow+40))->applyFromArray($bordersInBoldFont);

		$objPHPExcel->getActiveSheet()->getStyle(chr(65).($indexRow+41).":".chr(65).($indexRow+49))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(66).($indexRow+41).":".chr(67).($indexRow+49))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(68).($indexRow+41).":".chr(69).($indexRow+49))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(70).($indexRow+41).":".chr(70).($indexRow+49))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(71).($indexRow+41).":".chr(71).($indexRow+49))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(72).($indexRow+41).":".chr(72).($indexRow+49))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(73).($indexRow+41).":".chr(73).($indexRow+49))->applyFromArray($borders);

		$objPHPExcel->getActiveSheet()->getStyle(chr(65).($indexRow+50).":".chr(65).($indexRow+50))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(66).($indexRow+50).":".chr(67).($indexRow+50))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(68).($indexRow+50).":".chr(69).($indexRow+50))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(70).($indexRow+50).":".chr(70).($indexRow+50))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(71).($indexRow+50).":".chr(71).($indexRow+50))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(72).($indexRow+50).":".chr(72).($indexRow+50))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(73).($indexRow+50).":".chr(73).($indexRow+50))->applyFromArray($borders);
		
		$objPHPExcel->getActiveSheet()->getStyle(chr(74).($indexRow+40).":".chr(77).($indexRow+50))->applyFromArray($borders);
		$objPHPExcel->getActiveSheet()->getStyle(chr(75).($indexRow+40).":".chr(75).($indexRow+50))->applyFromArray($bordersTotLabels);
		$objPHPExcel->getActiveSheet()->getStyle(chr(77).($indexRow+40).":".chr(77).($indexRow+50))->applyFromArray($bordersTotAmounts);

		$objPHPExcel->getActiveSheet()->getStyle(chr(65).($indexRow+51).":".chr(65).($indexRow+57))->applyFromArray($borderBottom);
		$objPHPExcel->getActiveSheet()->setShowGridlines(false);

		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(65))->setWidth(2.4);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(66))->setWidth(15);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(67))->setWidth(4);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(68))->setWidth(20);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(69))->setWidth(1);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(70))->setWidth(17);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(71))->setWidth(15);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(72))->setWidth(14);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(73))->setWidth(0);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(74))->setWidth(0);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(75))->setWidth(14);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(76))->setWidth(2);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(77))->setWidth(9);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(78))->setWidth(0);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(79))->setWidth(0);
		$objPHPExcel->getActiveSheet()->getColumnDimension(chr(80))->setWidth(0);
	 }
	 
	 public function generateAllCustomers($clients, $userId) {
		$objPHPExcel = new \PHPExcel();
		$objPHPExcel->getActiveSheet()->getStyle('A1:F1')->getFont()->setBold(true);
		$objPHPExcel->getActiveSheet()->getStyle('A1:F1')->getFont()->setSize(12);
		$objPHPExcel->getProperties()->setCreator("VANAM SARL")
					->setLastModifiedBy("VANAM SARL")->setTitle("Office 2007 XLSX VANAM")
					->setSubject("Office 2007 XLSX Clients")->setDescription("Liste des clients vanam.")
					->setKeywords("xlsx")->setCategory("Clients");
		$objPHPExcel->setActiveSheetIndex(0)
        			->setCellValue('A1', 'Nom société')->setCellValue('B1', 'Nom contact')
        			->setCellValue('C1', 'E-mail')->setCellValue('D1', 'Ville')
        			->setCellValue('E1', 'Pays')->setCellValue('F1', 'Live');

        if (!empty( $clients)) {
        	$index = 2 ;
        	foreach ($clients as $client) {
        		$objPHPExcel->setActiveSheetIndex(0)
        			->setCellValue('A'.$index, $client['company_name'])->setCellValue('B'.$index, $client['contact'])
        			->setCellValue('C'.$index, $client['contact_email'])->setCellValue('D'.$index, $client['city'])
        			->setCellValue('E'.$index, $client['country'])->setCellValue('F'.$index, $client['access_live']);
        			$index ++ ;
        	}
        }

        $objPHPExcel->getActiveSheet()->setTitle('Clients');

        $objPHPExcel->setActiveSheetIndex(0);

		header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		header('Content-Disposition: attachment;filename="clients_'.$userId.'.xlsx"');
		header('Cache-Control: max-age=0');
		header('Cache-Control: max-age=1');
		header ('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); 
		header ('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT'); 
		header ('Cache-Control: cache, must-revalidate'); 
		header ('Pragma: public'); 
		$urlFile = 'templates/clients/clients_'.$userId.'.xlsx' ;
		$objWriter = \PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
		$objWriter->save($urlFile);

		return $urlFile;
	}
}

?>