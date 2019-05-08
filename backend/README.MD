#Requirement before install this project
```
-> PHP version : 5 version
-> MySQL version : 5.7.19
```

#What you need to change
```
1. Change your database config
  => Go to includes folder->define.php
2. For allowing frontend can call your api(backend) and loading your route.
 => index.php
if (isset($_SERVER['HTTP_ORIGIN'])) {

    $http_origin = $_SERVER['HTTP_ORIGIN'];

    if ($http_origin == "http://localhost:3000" ||
        $http_origin == "http://localhost:3000") {
        header("Access-Control-Allow-Origin: $http_origin");
    }

    header('Access-Control-Allow-Credentials: true');

    header('Access-Control-Allow-Methods: GET,PUT,POST,DELETE,PATCH,OPTIONS');
    header('Access-Control-Allow-Headers: authorization,Access-Control-Allow-Origin,Content-Type,SOAPAction,Authorization,token');
}

3. Copy .htaccess to pass into folder core\commons\slim\vendor\slim\slim
```


#Folder For
```
1. Route folder
  => comunication from database to view(client server)
2. Batchs, pictures, resource and template folder are for keeping image, file excel.
3. Logs folder => keeping log file
4. PHP folder => for php excel
5. Core folder is slim containt folder and our customize class for comunication with database
6 -> core/class/beans for set and get property of class
  -> core/class/helper for helper customize class
  -> core/class/Interface for method
  -> core/class/SErvice for query from database
  -> core/common is slim library
```
