<?php

require './includes/defines.php';

require './core/commons/slim/vendor/autoload.php';
require './core/commons/redbeanPHP/rb.php';
require './core/commons/log4php/Logger.php';
require './core/commons/PHPExcel/PHPExcel.php';
require './core/commons/imageOrientationFix/Image.php';
require './core/commons/imageOrientationFix/MimeType.php';
require './core/commons/imageOrientationFix/ImageOrientationFix.php';
require('./core/commons/fpdf/fpdf.php');

Logger::configure('includes/logconfig.xml');

require './core/class/helpers/file_helper.php';
require './core/class/helpers/pdf_helper.php';
require './core/class/helpers/excel_helper.php';

require './core/class/beans/user.php';
require './core/class/beans/client.php';
require './core/class/beans/address.php';
require './core/class/beans/authorization.php';
require './core/class/beans/pref_object.php';
require './core/class/beans/brand.php';
require './core/class/beans/country.php';
require './core/class/beans/category.php';
require './core/class/beans/product.php';
require './core/class/beans/gender.php';
require './core/class/beans/sport.php';
require './core/class/beans/range.php';
require './core/class/beans/range_detail.php';
require './core/class/beans/location.php';
require './core/class/beans/zonage_city.php';
require './core/class/beans/criteria_product.php';
require './core/class/beans/criteria_entry_event.php';
require './core/class/beans/criteria_quotation.php';
require './core/class/beans/criteria_command.php';
require './core/class/beans/criteria_invoice.php';
require './core/class/beans/product_stock.php';
require './core/class/beans/entry_event.php';
require './core/class/beans/entry_event_detail.php';
require './core/class/beans/entry_event_detail_stock.php';
require './core/class/beans/change.php';
require './core/class/beans/quotation.php';
require './core/class/beans/quotation_detail.php';
require './core/class/beans/quotation_detail_stock.php';
require './core/class/beans/command.php';
require './core/class/beans/command_detail.php';
require './core/class/beans/command_detail_stock.php';
require './core/class/beans/invoice.php';



require 'core/class/interfaces/preference_entity_interface.php';
require 'core/class/interfaces/brand_interface.php';
require 'core/class/interfaces/client_interface.php';
require 'core/class/interfaces/entry_event_interface.php';
require 'core/class/interfaces/product_interface.php';
require 'core/class/interfaces/quotation_interface.php';
require 'core/class/interfaces/command_interface.php';
require 'core/class/interfaces/tools_interface.php';
require 'core/class/interfaces/user_interface.php';
require 'core/class/interfaces/invoice_interface.php';


require 'core/class/services/user_service.php';
require 'core/class/services/tools_service.php';
require 'core/class/services/client_service.php';
require 'core/class/services/address_service.php';
require 'core/class/services/brand_service.php';
require 'core/class/services/category_service.php';
require 'core/class/services/country_service.php';
require 'core/class/services/product_service.php';
require 'core/class/services/gender_service.php';
require 'core/class/services/sport_service.php';
require 'core/class/services/range_service.php';
require 'core/class/services/range_detail_service.php';
require 'core/class/services/zonage_city_service.php';
require 'core/class/services/entry_event_service.php';
require 'core/class/services/change_service.php';
require 'core/class/services/quotation_service.php';
require 'core/class/services/command_service.php';
require 'core/class/services/invoice_service.php';

?>