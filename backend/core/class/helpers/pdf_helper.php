<?php
namespace UTILE;

class PdfHelper extends \FPDF{

	function Footer(){
        $this->SetY(-15);
        $this->SetFont('Arial','I',8);
        $this->Cell(0,10,'Page '.$this->PageNo().' / {nb}',0,0,'C');
    }

	public function generatePagesOfExtract(	$categoriesProducts						,
											$isPicture 		= 1 					,
											$isPAchat 								,
											$isPTarif 								,
											$isPPublic 								,
											$isPVanam 		= 1						,
											$isZonage   							,
											$isTransport							,
											$formatStock 							,
											$typeDocument 							,
											$headerObject 							,
											$quotationInformationObject				,
											$clientInformationObjectForQuotation	,
											$commandInformationObject				,
											$clientInformationObjectForCommand		,
											$printWithHeader
										  ){
		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generatePagesOfExtract ------- ");

		$tabAllStocks 		= [] ;
		$totDevisOrCommand 	= 0 ;
		$xD 				= 109 ; 
		$yD 				= 5 ;
		$totAllProducts  	= 0 ;
		
		if ($typeDocument == 1) {
			$this->generateHeaderOfProductsDdocument();
		}
		else if ($typeDocument == 2) {
			if ($printWithHeader) {
				$this->generateCompanyInformationInHeaderOfAnObjectDocument($headerObject);
				$this->generateQuotationInformationInHeaderOfAnObjectDocument ($typeDocument, $quotationInformationObject);
				$this->generateCustomerInformationInHeaderOfAnObjectDocument ($clientInformationObjectForQuotation);
				
				$xD = 0 ; $yD = 50 ;
			}
			else {
				$xD = 5 ; $yD = 5 ;
			}
		}
		else if ($typeDocument == 3) {
			if ($printWithHeader) {
				$this->generateCompanyInformationInHeaderOfAnObjectDocument($headerObject);		
				$this->generateQuotationInformationInHeaderOfAnObjectDocument ($typeDocument, $commandInformationObject);
				$this->generateCustomerInformationInHeaderOfAnObjectDocument ($clientInformationObjectForCommand);
				$xD = 0 ; $yD = 50 ;
			}
			else {
				$xD = 5 ; $yD = 5 ;
			}
		}

		$this->SetXY($this->GetX()- $xD ,$this->GetY()+ $yD);

		foreach ($categoriesProducts as $catName => $tabProductsByBrand) {

			$this->SetFont('Courier','B',10);
			$this->Cell(35,7,$catName,0,0,'L',false );
			$this->SetXY($this->GetX() - 35 ,$this->GetY() + 5);

			$totStock = 0 ; 
			$totRange = 0 ;
			foreach ($tabProductsByBrand as $brandName => $products) {
				$this->SetXY($this->GetX() ,$this->GetY());
				$this->SetFont('Courier','B',10);

				$this->Cell(35,7,'MARQUE : '.$brandName,0,0,'L',false );
				$this->SetXY($this->GetX() - 35 ,$this->GetY() + 7 );
				
				foreach ($products as $product) {
					$allSotcks = [] ;
					if (!empty($product['stocks'])) {
						$allSotcks 		= explode('#',$product['stocks']) ;
					}
					$tmpTab = [] ;
					foreach ($allSotcks as $line) {
						$tS = explode ('>',$line) ;
						if ($tS[1] > 0) {
							array_push($tmpTab,$line) ;
						}
					}
					$allSotcks = $tmpTab; 
					$qteTotalProducts = $product['qtr'];
					if ($typeDocument > 1) {
						$qteTotalProducts = 0 ;
						foreach ($allSotcks as $line) {
							$tS = explode ('>',$line) ;
							$qteTotalProducts +=$tS[1] ;
						}
					}
					$allSotcks[]	= 'Total>'.$qteTotalProducts;

					$nbLineBoxes 		= round(count($allSotcks) / 5) ;
					$yAddedToCurrentBox = 2;
					if ($nbLineBoxes > 3) {
						$yAddedToCurrentBox = ( $nbLineBoxes - 3 ) * 8 ;
					}

					$noPicture = true ;
					if ($isPicture){
						if (!empty($product['url_picture'])){
							$this->Cell(33,24 + $yAddedToCurrentBox,'',1,0,'L',false );
							$this->Image($product['url_picture'],$this->GetX() - 27.5,$this->GetY() + ( $nbLineBoxes * 2.3 ),22);
							$noPicture = false ;
						}
					}
					if ($noPicture) {
						$this->Cell(33,24 + $yAddedToCurrentBox,'',1,0,'L',false );
						$this->Image('resources/p_n_i.png',$this->GetX() - 30,$this->GetY()+3, 25);
					}
					$totStock += $product['qtr'] ;
					$totRange += $product['qtr'] ;
					$this->SetFont('Courier','',8);
					$this->Cell(67,24 + $yAddedToCurrentBox,'',1,0,'L',false );
					
					$tabAllStocks[] = array (	"x" 		=> $this->GetX()  					,
												"y" 		=> $this->GetY()					,
												"stocks" 	=> $allSotcks 						,
												"page" 		=> $this->PageNo()
										  	);
					
					$this->SetFont('Courier','',7);
					$changeName = "";
					if (isset($product['change_name'])) {
						$changeName = strtr($product['change_name'], array('€' => chr(128) ,'$' => chr(36)));
					}
					if ($typeDocument == 1) {
						$pAchatLabel = "";
						if ($isPAchat) {
							$pAchatLabel = "P.achat  : - ".$changeName;
						}
						$pTarifLabel = "";
						if ($isPTarif) {
							$pTarif = number_format($product['sale_rate_public'],2);
							$pTarifLabel = "P.tarif  : {$pTarif} ".$changeName;
						}
						$pPublicLabel = "";
						if ($isPPublic) {
							$pPublic = number_format($product['sale_public_price'], 2) ;
							$pPublicLabel = "P.public : {$pPublic} ".$changeName;
						}
						$pVanamLabel = "";
						if ($isPVanam) {
							$pVanam = number_format($product['sale_vanam_price'], 2) ;
							$pVanamLabel = "P.vanam  : {$pVanam} ".$changeName;
						}
						
						$this->SetXY($this->GetX() + 64 ,$this->GetY());
						$this->Cell(30,4,$pAchatLabel.' '.$changeName,0,0,'L',false);
						$this->SetXY($this->GetX() - 30 ,$this->GetY() + 4);
						$this->Cell(30,4,$pTarifLabel.' '.$changeName,0,0,'L',false);
						$this->SetXY($this->GetX() - 30 ,$this->GetY() + 4);
						$this->Cell(30,4,$pPublicLabel.' '.$changeName,0,0,'L',false);
						$this->SetXY($this->GetX() - 30 ,$this->GetY() + 4);
						$this->Cell(30,4,$pVanamLabel.' '.$changeName,0,0,'L',false);
						$yD = 12 ;
						$xD = 160 ;
					}
					else {
						if ($isPVanam) {
							$price = number_format($product['sale_price'], 2).' '.strtr($product['change_name'], array('€' => chr(128) ,'$' => chr(36))); 
							$this->SetXY($this->GetX() + 64 ,$this->GetY() );
							$this->Cell(30,4,"PU H.T   :  {$price}",0,0,'L',false );
							$this->SetXY($this->GetX() - 30 ,$this->GetY() + 4);
							
							if ($typeDocument == 3) {
								$totalPD 			= number_format($product['sale_price'] * $product['qte_stock_current_cmd'], 2) ;
								$totDevisOrCommand 	+= $product['sale_price'] * $product['qte_stock_current_cmd'] ;
							}
							else if ($typeDocument == 2){
								$stockQuotation = explode ('#',$product['stocks'] );
								$qte = 0 ;
								foreach ($stockQuotation as $lineStock) {
									$strLinetock 		= str_replace (']','',$lineStock);
									$tmpStockQuotation 	= explode ('>',$strLinetock);
									$qte 				+= $tmpStockQuotation[1] ;
								}
								$totalPD 			= number_format($product['sale_price'] * $qte, 2) ;
								$totDevisOrCommand 	+= $product['sale_price'] * $qte ;
							}
							
							$totalPDLabel 		= $totalPD.' '.strtr($product['change_name'], array('€' => chr(128) ,'$' => chr(36))) ; 
							$this->Cell(30,4,"Total    :  {$totalPDLabel}",0,0,'L',false );
							$yD = 2;
							$xD = 160;
						}
						else {
							$yD = 0;
							$xD = 64;
						}
					}
					$this->SetFont('Courier','',10);
					$this->SetXY($this->GetX() - $xD ,$this->GetY() - $yD );
					$pZonageLabel = "" ;
					if ($isZonage) {
						$pZonageLabel = $product['location'];
					}
					$this->MultiCell(60,5,	$product['description'].
											"\n".'Ref : '.$product['reference'].' - '.$product['categorie'].
											"\n".'Gamme : '.$product['range_name']
										,0,'L',false) ;
					$this->SetXY($this->GetX() + 65  ,$this->GetY());
					$this->SetFont('Courier','BI',9);
					$this->Cell(30,4,$pZonageLabel,0,0,'R',false );
					$this->SetXY($this->GetX() - 305  ,$this->GetY() + 10 + $yAddedToCurrentBox);
				}

				$totAllProducts += $totStock;

				$this->SetFont('Courier','B',8);
				$this->SetXY($this->GetX() + 115,$this->GetY() + 2);
				$this->Cell(70,4,$catName.' - '.$brandName,1,0,'L',false );

				$this->SetXY($this->GetX() - 20 ,$this->GetY());
				$this->Cell(20,4,$totStock,0,0,'R',false );

				$this->SetXY($this->GetX() - 185,$this->GetY());
			}

			$this->SetXY($this->GetX() + 115  ,$this->GetY() + 5 );
			$this->Cell(70,4,$catName,1,0,'L',false );
			$this->SetXY($this->GetX() - 20 ,$this->GetY() );
			$this->Cell(20,4,$totRange,0,0,'R',false );

			$this->SetXY($this->GetX() - 185 ,$this->GetY() + 2 );
		}

		$this->SetFont('Courier','B',8);
		$this->SetXY($this->GetX() + 115,$this->GetY() + 4);
		$this->Cell(70,4,'TOTAL',1,0,'L',false );
		$this->SetXY($this->GetX() - 20 ,$this->GetY() );
		$this->Cell(20,4,$totAllProducts,0,0,'R',false );
		
		if ($typeDocument == 2 || $typeDocument == 3 ) {
			if ($isTransport) {
				$trspAmount = isset($product['transport_amount']) ? $product['transport_amount'] : 0 ;
				$this->SetXY($this->GetX() - 70,$this->GetY() + 5);
				$this->Cell(70,4,'TRANSPORT ',1,0,'L',false );
				$this->SetXY($this->GetX() - 20,$this->GetY());
				$this->Cell(20,4,number_format($trspAmount,2).' '.strtr($product['change_name'], array('€' => chr(128) ,'$' => chr(36))),0,0,'R',false );
			}
			$this->SetXY($this->GetX() - 70,$this->GetY() + 5);
			$this->Cell(70,4,'MONTANT H.T ',1,0,'L',false );
			$this->SetXY($this->GetX() - 20,$this->GetY());
			$this->Cell(20,4,number_format($totDevisOrCommand,2).' '.strtr($product['change_name'], array('€' => chr(128) ,'$' => chr(36))),0,0,'R',false );
		}
		
		// Creation Stocks
		if (!empty($tabAllStocks)) {
			if ($formatStock == 1) {
				foreach ($tabAllStocks as $stocksDetail) {
					$this->page = $stocksDetail['page'];
					$allstocks 	= $stocksDetail['stocks'] ;
					if (!empty($allstocks)) {
						$length = 0 ;
						$round 	= 1 ;
						$xI 	= 0 ;
						$yI		= 0 ;
						foreach ($allstocks as $stockG) {
							$xI  = ( $xI == 0 ? $stocksDetail['x'] : $xI ) + $length ;
							$yI  = $yI == 0 ? $stocksDetail['y'] : $yI ;
							if ($round == 6) {
								$xI = $stocksDetail['x'];
								$length = 0 ;	
								$yI 	+= 8 ;
								$round 	= 2 ;						
							}
							else {
								$round ++ ;
							}
							$yII 	= $yI + 4 ;
							$length = 12 ;
							$tabS 	=  explode('>',str_replace (']','',str_replace ('[','',$stockG)));
							$this->SetFont('Courier','B',8);
							$this->SetXY($xI,$yI);
							$this->Cell(12,4,$tabS[0],1,0,'C',false );
							$this->SetXY($xI ,$yII);
							$isBold = $tabS[0] == "Total" ? "B" : "" ;
							$this->SetFont('Courier',$isBold,8);
							$this->Cell(12,4,$tabS[1],1,0,'C',false );							
							
						}
					}
				}
			}
			else {
				foreach ($tabAllStocks as $stocksDetail) {
					$elementTotal 	= "";
					$filtredStocks	= [] ;
					$this->page 	= $stocksDetail['page'];
					foreach ($stocksDetail['stocks'] as $i=>$stock) {
						if (strpos($stock,'Total>') !== false) {
							$elementTotal 	= str_replace('Total>','',$stock) ;
						}
						else {
							array_push($filtredStocks,$stock);
						}
					}
					
					$allstocks = implode(',',$filtredStocks) ;
					$this->SetFont('Courier','',8);
					$this->SetXY($stocksDetail['x'], $stocksDetail['y']);
					$this->MultiCell(62,5,$allstocks,1,'L',false) ; 

					$this->SetFont('Courier','B',8);
					$this->SetXY($stocksDetail['x'] ,$this->GetY() );
					$this->Cell(10,4,'Total',1,0,'C',false );
					$this->SetXY($this->GetX() - 10,$this->GetY() + 4 );
					$this->Cell(10,4,$elementTotal,1,0,'C',false );
				}
			}
		}
		$logger->debug("END generatePagesOfExtract ------- ");
	}

	public function generateProformaOrInvoiceDocument ($company, $commandId, $client, $products, $transport, $totAmount, $nbPages, $currentPage, $typePayment, $typeDocument, $change, $isExenorateTVA, $billDate) {
		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateProformaDocument ------- ");

		$changeName = "";
		if (isset($change)) {
			$changeName = strtr($change, array('€' => chr(128) ,'$' => chr(36)));
		}

		$this->generateHeaderOfProformaDdocument($company, $client, $typeDocument, $commandId, $billDate);

		$this->generateMiddleContentOfProformaDocument($client, $typePayment, $typeDocument, $commandId);

		$this->generateTableDataContentOfProformaDocument($products, $changeName, $nbPages, $currentPage, $totAmount);

		$this->generateTableDataPricesOfProformaDocument($totAmount, $transport, $nbPages, $currentPage, $changeName, $isExenorateTVA);

		$logger->debug("END generateProformaDocument ------- ");
	}

	public function generateBpDocument($commandDetails, $commandId, $nbPages, $currentPage, &$totalProduct) {
		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateBpDocument ------- ");

		$tabProductsByCategories = array_column($commandDetails, NULL, "location");
		$tabProductsByCategories = array_map(function($val) { return array(); }, $tabProductsByCategories);
		
		foreach ($commandDetails as $product) {
			if (!isset($tabProductsByCategories[$product["location"]])) {
				$tabProductsByCategories[$product["location"]] = [] ;
			}
			array_push($tabProductsByCategories[$product["location"]] ,  $product) ;
		}

		$this->SetXY(7, 11);
		$this->generateHeaderOfBpDdocument($commandId);

		foreach ($tabProductsByCategories as $location => $commandDetails) {
			if (!empty($commandDetails)) {
				$this->generateContentBlocOfBpDdocument($commandDetails, $location,$totalProduct);
			}
		}

		if ($nbPages == $currentPage) {
			$this->generateFooterOfBpDdocument($totalProduct);
		}

		$logger->debug("END generateBpDocument ------- ");
	}

	private function generateHeaderOfBpDdocument($commandID) {
		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateHeaderOfBpDdocument ------- ");

		$dX = $this->GetX();
		$dY = $this->GetY();

		$this->SetFont('Courier','B',13);
		$this->Text($dX, $dY, utf8_decode("Bon de préparation : BP{$commandID}"));
		$this->SetFont('Courier','',9);
		$this->Text($dX, $dY+4, date('d/m/Y'));

		$this->SetXY($dX, $dY+8);

		$logger->debug("END generateHeaderOfBpDdocument ------- ");

	}

	private function generateContentBlocOfBpDdocument($commandDetails, $location, &$totalProduct) {

		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateContentBlocOfBpDdocument ------- ");

		$this->SetX(7);

		$dX = $this->GetX();
		$dY = $this->GetY() + 8;
		
		$this->SetXY($dX, $dY);
		$this->SetFont('Courier','B',10);
		$this->Text($dX, $dY+4, "Zone : {$location}");
		$this->SetXY($dX+3, $dY+6);

		$dX 	= $this->GetX();
		$dY 	= $this->GetY();
		
		for ($i = 0 ; $i < count($commandDetails) ; $i ++) {
			$this->generateProductBlocBp($this->GetX(), $this->GetY(), $commandDetails[$i], $location, $totalProduct);
		}
		
		$logger->debug("END generateContentBlocOfBpDdocument ------- ");

	}

	private function generateProductBlocBp($dX, $dY, $commandDetail, $location, &$totalProduct) {

		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateProductBlocBp ------- ");

		if (!empty($location)) {
			$location = " - ".$location;
		}

		$this->MultiCell(90,5,	utf8_decode($commandDetail['reference'].' - '.$commandDetail['category'].' '.$location).
											"\n". utf8_decode($commandDetail['description'].' - '.$commandDetail['brand']).
											"\n".utf8_decode('Gamme: '.$commandDetail['gamme']).
											"\n".utf8_decode("QTT: {$commandDetail['qtt']}")
										,1,'L',false) ;
		$yBasic = $this->getY()+5 ;
		$this->SetXY($this->getX(), $this->getY()+5);
		$tab 	= [] ; 
		$sum = array_sum(array_map(function($i) {return $i['value'];}, $commandDetail['stock']));
		array_push($commandDetail['stock'], array ("name" => "Total", "value" => $sum));
		array_push ($tab, array("x" => $this->GetX(), "y" => $this->GetY(), "s" => $commandDetail['stock']));

		foreach ($tab as $line) {
			$x = $line['x'] ;
			$y = $line['y'] ; 
			for ($i=0;$i<count($line['s']);$i++) {
				if ($i%5 == 0 && $i > 0) {
					$y = $y + 10 ;
					$x = $line['x'] ;
				}
				else if ($i > 0) {
					$x = $x + 12 ;
				}
				$this->SetXY($x + 90, $y - 25);
				$this->Cell(12, 5, $line['s'][$i]['name'], 1, 1, 'C', false);
				$this->SetXY($x + 90, $y - 20);
				$this->Cell(12, 5, $line['s'][$i]['value'], 1, 1, 'C', false);
			}
		}
		$tab = [] ;
		$this->SetY($yBasic);
		$totalProduct+=$sum ;
		$logger->debug("END generateProductBlocBp ------- ");

	}

	private function generateFooterOfBpDdocument($sum){
		$this->SetFont('Courier','B',10);
		$this->SetXY($this->getX() + 125, $this->getY() + 5);
		$this->Cell(70, 5, "TOTAL                 ".$sum, 1, 1, 'C', false);
	}

	private function generateTableDataPricesOfProformaDocument($totAmount, $transport, $nbPages, $currentPage, $change, $isExenorateTVA) {

		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateTableDataPricesOfProformaDocument ------- ");

		$baseTVA 			= "A REPORTER" ;
		$tvaAmount 			= "A REPORTER" ;
		$total 				= "A REPORTER" ;
		$tva 				= "A REPORTER" ;
		$amountHT  			= "A REPORTER" ;
		$transportAmount 	= "A REPORTER" ;
		$firstLine = array( array("w" => 5, "h" => 25 , "x" => 5, "v" => ""), 
							array("w" => 25, "h" => 25, "x" => 20, "v" => $amountHT), 
							array("w" => 25, "h" => 25, "x" => 19, "v" => $transportAmount), 
							array("w" => 20, "h" => 25, "x" => 16, "v" => $baseTVA),
							array("w" => 15, "h" => 25, "x" => 13.4, "v" => $tva),
							array("w" => 15, "h" => 25, "x" => 14, "v" => $tvaAmount),
							array("w" => 25, "h" => 25, "x" => 19, "v" => $total)
					);
		if ($nbPages == $currentPage ) {
			$baseTVA 			= number_format($transport['transport_amount'] + $totAmount, 2);
        	$tvaAmount 			= number_format(!$isExenorateTVA ? ($transport['transport_amount'] + $totAmount) * 0.2 : 0, 2) ;
        	$total 				= number_format((!$isExenorateTVA ? ($transport['transport_amount'] + $totAmount) * 0.2 : 0) + ($transport['transport_amount'] + $totAmount), 2) ;
        	$tva 				= !$isExenorateTVA ? 20 : 0 ;
        	$amountHT  			= number_format($totAmount, 2) ;
        	$transportAmount 	= number_format($transport['transport_amount'], 2) ;
        	$firstLine = array( array("w" => 5, "h" => 25 , "x" => 15, "v" => ""), 
							array("w" => 25, "h" => 25, "x" => 15, "v" => $amountHT), 
							array("w" => 25, "h" => 25, "x" => 15, "v" => $transportAmount), 
							array("w" => 20, "h" => 25, "x" => 13, "v" => $baseTVA),
							array("w" => 15, "h" => 25, "x" => 9,  "v" => $tva),
							array("w" => 15, "h" => 25, "x" => 12, "v" => $tvaAmount),
							array("w" => 25, "h" => 25, "x" => 17, "v" => $total)
					);
    	}

		$dX = $this->GetX() + 8;
		$dY = $this->GetY();

		$this->SetXY($dX, $dY) ;

		$this->Cell(180,3,"",1,0,'C',true);
        $this->Ln();

        $this->SetXY($this->GetX() + 8, $this->GetY()) ;
		$header = array("*", "MONTANT HT", "PORT/EMBAL", "BASE TVA", "TVA%", "MONT.TVA", "TOTAL");
		$this->SetFillColor(255,255,255);
    	$this->SetTextColor(0);
    	$this->SetDrawColor(0,0,0);
    	$this->SetLineWidth(.3);
    	$this->SetFont('Courier','B',7);
		$hmValues = array( 	array("w" => 5, "h" => 5), 
							array("w" => 25, "h" => 5), 
							array("w" => 25, "h" => 5), 
							array("w" => 20, "h" => 5),
							array("w" => 15, "h" => 5),
							array("w" => 15, "h" => 5),
							array("w" => 25, "h" => 5),
							array("w" => 50, "h" => 30)
					);
		$i = 0 ;
    	foreach($hmValues as $hm){
    		$value = isset($header[$i]) ? $header[$i] : "" ;
        	$this->Cell($hm["w"], $hm["h"], $value, 1, 0, 'C', true);
        	$i ++;
        }
        $this->Ln();

        $this->SetXY($this->GetX() + 138, $this->GetY() - 30);
		$this->MultiCell(50,4,"ESCOMPTE\nTotal HT      {$amountHT} {$change}\nMONT.N\nTOTAL TVA     {$tvaAmount} {$change}\nTOTAL TTC     {$total} {$change}\nACOMPTE    \nMONT.NET      {$total} {$change}",0,'L',false) ; 
		
        $this->SetFont('Courier','',6);
        $this->SetXY($this->GetX() + 8, $this->GetY() - 23) ;

		$i = 0 ;
        foreach($firstLine as $line){
			$this->Cell($line["w"],$line["h"],"",1,0,'C',true);
			if ($i == 4 || empty($line['v'])) {
				$this->Text($this->GetX() - $line['x'], $this->GetY() + 21.6, utf8_decode($line['v']));
			}
			else {
				$this->Text($this->GetX() - $line['x'], $this->GetY() + 21.6, utf8_decode($line['v']).' '.$change);
			}
        	$i ++;
        }

        $this->SetFont('Courier','B',6);
        $this->Text($this->GetX() - 130, $this->GetY() + 28, utf8_decode('EXONERATION DE TVA - ART 262 TER I DU CGI'));
        $this->SetFont('Courier','',5);
        $this->Text($this->GetX() - 130, $this->GetY() + 31, utf8_decode('*EN CAS DE RETARD DE PAIEMENT, IL SERA APPLIQUE DES PENALITES DE 0,50% PAR MOIS DE RETARD.'));
        $this->Text($this->GetX() - 130, $this->GetY() + 34, utf8_decode('*EN APPLICATION DE LA LOI N° 80.335 DU 12/05/80 LE TRANSFERT DE PROPRIETE DE MARCHANDISE EST SUSPENDU JUSQU AU PAIEMENT INTEGRAL DU PRIX.'));
        $this->Text($this->GetX() - 130, $this->GetY() + 37, utf8_decode('*EN REVANCHE LE TRANSFERT DES RISQUES INTERVIENT DES LA DELIVRANCE DE LA MARCHANDISES A L\'ACQUEREUR OU A SON MANDATAIRE.'));
        $this->Text($this->GetX() - 130, $this->GetY() + 40, utf8_decode('*EN CAS DE LITIGE LE TRIBUNAL DE COMMERCE DE MARSEILLE EST SEUL COMPETENT ET CE MEME EN CAS D\'APPEL EN GARANTIE OU DE PLURALITE DE DEFENDEURS.'));
        $this->Text($this->GetX() - 130, $this->GetY() + 43, utf8_decode('*LA LOI APPLICABLE EST LA LOI FRANCAISE.'));
        $this->Text($this->GetX() - 130, $this->GetY() + 46, utf8_decode('*NOS TRAITES OU ACCEPTATIONS N\'OPERENT NI NOVATION NI DEROGATION A CETTE REGLE.'));
        
        $logger->debug("END generateTableDataPricesOfProformaDocument ------- ");

	}

	private function generateTableDataContentOfProformaDocument($products, $change, $nbPages , $currentPage, $totalInvoice) {

		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateTableDataContentOfProformaDocument ------- ");

		$dX = 18;
		$dY = 120;

		$this->SetXY($dX, $dY) ;
		$header = array("MARQUE", "DESIGNATION", "REFERENCE", "TYPE", "QTE", "PRIX U", "MONTANT HT");
		$this->SetFillColor(255,255,255);
    	$this->SetTextColor(0);
    	$this->SetDrawColor(0,0,0);
    	$this->SetLineWidth(.3);
    	$this->SetFont('Arial','B',7);
		$w = array(30, 45, 30, 25, 10, 20, 20);
    	for($i=0;$i<count($header);$i++){
        	$this->Cell($w[$i],6,$header[$i],1,0,'C',true);
        }
        $this->Ln();
        $this->SetFont('Courier','',7);
		$totAllQte = 0 ;
		
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

    	foreach($products as $product){
    		$this->SetXY($dX, $this->GetY()) ;
        	$this->Cell($w[0], 6, utf8_decode($product['brand']), 'LR', 0, 'C', true);
        	$this->Cell($w[1], 6, utf8_decode($product['description']), 'LR', 0, 'C', true);
        	$this->Cell($w[2], 6, utf8_decode($product['reference']), 'LR', 0, 'C', true);
        	$this->Cell($w[3], 6, utf8_decode($product['category']), 'LR', 0, 'C', true);
        	$this->Cell($w[4], 6, $product['qte'], 'LR', 0, 'C', true);
        	$this->Cell($w[5], 6, utf8_decode(number_format($product['sale_price'],2)).' '.$change, 'LR', 0, 'C', true);
        	$tot = number_format($product['qte']*$product['sale_price'],2) ; 
        	$totAllQte+=$product['qte'] ;
        	$this->Cell($w[6],6,$tot.' '.$change,'LR',0,'C',true);
        	$this->Ln();
    	}

    	$this->SetXY($dX, $this->GetY()) ;
        $this->Cell($w[0],6,"",'LR',0,'C',true);
        $this->Cell($w[1],6,"QUANTITE",'LR',0,'C',true);
        $this->Cell($w[2],6,"",'LR',0,'C',true);
        $this->Cell($w[3],6,"",'LR',0,'C',true);
        $this->Cell($w[4],6,$totAllQte,'LR',0,'C',true);
        $this->Cell($w[5],6,"",'LR',0,'C',true);
        $this->Cell($w[6],6,"",'LR',0,'C',true);
        $this->Ln();

    	$this->Line($this->GetX() + 8, $this->GetY(), $this->GetX() + 188, $this->GetY() ); 

    	$logger->debug("END generateTableDataContentOfProformaDocument ------- ");
	}

	private function generateHeaderOfProformaDdocument ($company, $client, $typeDocument, $commandId, $billDate) {

		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateHeaderOfProformaDdocument ------- ");

		$labelType = "PROFORMA" ;
		if ($typeDocument == INVOICE_TYPE) {
			$labelType 	= "FACTURE ".$billDate.$commandId ;
		}

		$dX = 20;
		$dY = 20;

		$this->SetFont('Courier','B',14);
		$this->Text($dX, $dY, utf8_decode($company['name']));
		$this->SetFont('Courier','',8);
		$this->Text($dX, $dY+=12, utf8_decode($company['address']));
		$this->Text($dX, $dY+=4, utf8_decode($company['cp'].' '.$company['city']));
		$this->Text($dX, $dY+=4, utf8_decode('SIRET : '.$company['siret']));
		$this->Text($dX, $dY+=4, utf8_decode('CODE APE : '.$company['code_ape']));
		$this->Text($dX, $dY+=4, utf8_decode('Tél : '.$company['phone']));
		$this->Text($dX, $dY+=4, utf8_decode('Fax : '.$company['fax']));
		$this->Text($dX, $dY+=4, utf8_decode('N° Identific : '.$company['identific']));

		$dX = $this->GetX() + 120;
		$dY = 20;
		$this->SetFont('Courier','B',14);
		$this->Text($dX, $dY, $labelType);
		$this->Text($dX, $dY+=5, utf8_decode('DATE '.date('d/m/Y')));
		$this->SetFont('Courier','B',8);
		$this->Text($dX, $dY+=12, utf8_decode('Adresse facturation'));

		$this->SetFont('Arial','',8);
		$this->Text($dX, $dY+=6, utf8_decode($client['company_name']));
		$this->Text($dX, $dY+=5, utf8_decode($client['addresses']['billing']['address']));
		$this->Text($dX, $dY+=5, utf8_decode($client['addresses']['billing']['postal_code'].' '.$client['addresses']['billing']['city'].' '.$client['addresses']['billing']['country']));
		$this->Text($dX, $dY+=5, utf8_decode('TVA intra : '.$client['tva_intra']));

		$logger->debug("END generateHeaderOfProformaDdocument ------- ");
	}

	private function generateMiddleContentOfProformaDocument($client, $typePayment, $typeDocument, $commandId){

		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateMiddleContentOfProformaDocument ------- ");

		$labelType = "PROFORMA" ;
		if ($typeDocument == INVOICE_TYPE) {
			$labelType = "FACTURE".$commandId ;
		}

		$tab 		= ["1" => "Chèque", "2" => "Virement", "3" => "Carte Bleue", "4" => "Espèce", "5" => "Traite"] ;
		$reglement 	= isset($tab[$typePayment]) ? $tab[$typePayment] :"" ;
		$dX 		= $this->GetX() + 70; 
		$dY 		= $this->GetY() + 60 ;

		$this->SetFont('Courier','B',12);
		$this->Text($dX, $dY+=6, utf8_decode($labelType.' '.$this->PageNo().' / {nb}'));
		$this->SetFont('Courier','',12);
		$this->Text($dX+=7, $dY+=5, utf8_decode('EXPORT'));

		$this->SetFont('Courier','B',8);
		$this->Text($dX-=67, $dY+=5, utf8_decode("Mode d'expédition : MARCHANDISE VENDUE DEPART ENTREPÔT"));
		$this->Text($dX+=110, $dY, utf8_decode("Adresse de Livraison"));
		$this->SetFont('Courier','',8);
		$this->Text($dX, $dY+=4, utf8_decode($client['company_name']));
		$this->Text($dX, $dY+=4, utf8_decode($client['addresses']['delivery']['address']));
		$this->Text($dX, $dY+=4, utf8_decode($client['addresses']['delivery']['postal_code'].' '.$client['addresses']['delivery']['city'].' '.$client['addresses']['delivery']['country']));

		$this->SetFont('Courier','B',8);
		$this->Text($dX-=110, $dY+=4, utf8_decode("Mode règlement : ".$reglement));
		$this->Text($dX, $dY+=4, utf8_decode("Date de règlement : Comptant Livraison"));

		$logger->debug("END generateMiddleContentOfProformaDocument ------- ");

	}

	private function generateHeaderOfProductsDdocument() {
		$this->SetFont('Courier','B',11);
		$this->SetXY($this->GetX()+ 70 ,$this->GetY()- 3);
		$this->Cell(26,0,'EXTRACTION DE STOCK');
		$this->SetXY($this->GetX() - 13,$this->GetY() + 4);
		$this->SetFont('Courier','',8);
		$this->Cell(26,0,date('d/m/Y'));
	}

	private function generateCompanyInformationInHeaderOfAnObjectDocument($headerObject) {

		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateCompanyInformationInHeaderOfAnObjectDocument ------- ");

		$dX = 13;
		$dY = $this->getY() + 9.5;

		$this->Rect(10, 14, 75, 34);
		$this->SetFont('Courier','B',10);
		$this->Text($dX, $dY, $headerObject['name']);
		$this->Text($dX, $dY + 19, utf8_decode(TEL_LABEL.': '));
		$this->Text($dX, $dY + 23, FAX_LABEL.': ');
		$this->SetFont('Arial','',8);
		$this->Text($dX, $dY + 7, utf8_decode($headerObject['address']));
		$this->Text($dX, $dY + 11, utf8_decode("{$headerObject['cp']} {$headerObject['city']}"));
		$this->Text($dX+13, $dY + 19, $headerObject['phone']);
		$this->Text($dX+13, $dY + 23, $headerObject['fax']);

		$logger->debug("END generateCompanyInformationInHeaderOfAnObjectDocument ------- ");
	}

	private function generateQuotationInformationInHeaderOfAnObjectDocument ($typeDocument, $objectInformationObject) {

		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateQuotationInformationInHeaderOfAnObjectDocument ------- ");
		
		$label 		= QUOTATION_LABEL ;
		$prefix 	= QUOTATION_PREFIX_LABEL ;
		if ($typeDocument == 3 ) {
			$label 		= COMMAND_LABEL ;
			$prefix 	= COMMAND_PREFIX_LABEL ;
		}
		$this->Rect(95, 14, 100, 13);
		$dX = $this->getX() + 90;
		$dY = $this->getY() + 9;
		$this->SetFont('Courier','B',9);
		$this->Text($dX, $dY, $label);
		$this->Text($dX + 33, $dY, $prefix.$objectInformationObject['id']);
		$this->Text($dX + 33, $dY+4,  $objectInformationObject['date']);
		if ($typeDocument == 3 ) {
			$this->SetFont('Courier','',8);
			$this->Text($dX + 52, $dY,  $objectInformationObject['comment']);
		}
		$this->SetFont('Courier','',10);
		$this->Text($dX, $dY+4, date('d/m/Y'));

		$logger->debug("END generateQuotationInformationInHeaderOfAnObjectDocument ------- ");
	}

	private function generateCustomerInformationInHeaderOfAnObjectDocument ($clientInformationObject) {

		$logger = \Logger::getLogger(basename(__FILE__));
		$logger->debug("START generateCustomerInformationInHeaderOfAnObjectDocument ------- ");
	
		$this->Rect(95, 30, 100, 19);

		$dX = $this->getX() + 90;
		$dY = $this->getY() + 25;
		
		$this->SetFont('Courier','B',9);
		$this->Text($dX, $dY, utf8_decode('Client N°'));
		$this->Text($dX, $dY+4, $clientInformationObject['company_name']);
		$this->Text($dX, $dY+8, 'Adresse :');
		$this->SetFont('Courier','',8);
		$this->Text($dX+22, $dY, $clientInformationObject['id']);
		$this->Text($dX+22, $dY+8, strtoupper($clientInformationObject['address']));
		$this->Text($dX+22, $dY+12, "{$clientInformationObject['postal_code']} {$clientInformationObject['city']}");

		$logger->debug("END generateCustomerInformationInHeaderOfAnObjectDocument ------- ");	
	}
}
?>