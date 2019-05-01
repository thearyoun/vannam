<?php

namespace UTILE;

class CriteriaEntryEvent
{

    private $_companyId;
    private $_numInfValue;
    private $_startDate;
    private $_endDate;


    public function __construct()
    {

    }

    public function get_companyId()
    {
        return $this->_companyId;
    }

    public function set_companyId($_companyId)
    {
        $this->_companyId = $_companyId;
    }

    public function get_numInfValue()
    {
        return $this->_numInfValue;
    }

    public function set_numInfValue($_numInfValue)
    {
        $this->_numInfValue = $_numInfValue;
    }

    public function get_startDate()
    {
        return $this->_startDate;
    }

    public function set_startDate($_startDate)
    {
        $this->_startDate = $_startDate;
    }

    public function get_endDate()
    {
        return $this->_endDate;
    }

    public function set_endDate($_endDate)
    {
        $this->_endDate = $_endDate;
    }
}

?>
