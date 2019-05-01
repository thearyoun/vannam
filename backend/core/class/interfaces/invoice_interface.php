<?php

namespace UTILE;

interface InvoiceInterface extends PreferenceEntityInterface{
	public function hideInvoiceById ($key, $invoiceId)	;
	public function getAllInvoicesByCriteria ($key, $criteria, $companyId) ;
}

?>