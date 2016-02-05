"use strict"   

var user;

angular.module('transactApp', [
  'ngRoute',
  'transactControllers'
])

.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'offers.html',
        controller: 'offers'
      }).
      when('/offer/:category/:id', {
        templateUrl: 'offer.html',
        controller: 'offer'
      }).
      when('/myaccount', {
        templateUrl: 'myaccount.html',
        controller: 'myaccount'
      }).
      when('/add', {
        templateUrl: 'addoffer.html',
        controller: 'addoffer'
      }).
      otherwise({
        redirectTo: '/'
      });
  }])

.controller('sessionController', ['$scope', '$http',
  function($scope, $http) {
    $scope.logout = function() {
      $http.get('/logout').success(function() {
        $scope.user = {};
        user = {};
      });
    };
    
    $http.get('/myaccount').success(function(response) {
      $scope.user = response.user;
      user = response.user;
    });
  }]);

angular.module("transactControllers", [])

   .factory('offers', ['$http', function($http){
      return $http.post('/offers', {
		category : "electronics",
		from : 0,
        numOffers : 5});
    }])

    .controller('offers', ['$scope', 'offers', '$http', function ($scope, offers, $http) {
      $scope.offers = [];
      $scope.activeCategory = 'electronics';
      $scope.startIndex = 0;
      $scope.changeCategory = function(category) {
    
            document.getElementById($scope.activeCategory).className = "list-group-item";
            document.getElementById(category).className = "list-group-item active";
            $scope.activeCategory = category;
            $scope.startIndex = 0;
            
            $http.post('/offers', {
        		category : category,
        		from : $scope.startIndex,
                numOffers : 5}).success(
                function(response) {
                  if (response === 'Error')
                    return;
                  $scope.offers = response.offers;
                  $scope.count = response.count;
        		});
      };
  
      $scope.previousPage = function() {
          var newIndex = $scope.startIndex - 5;
          $http.post('/offers', {
		        category : $scope.activeCategory,
		        from : newIndex,
            numOffers : 5}).success(
              function(response) {
                if (response === 'Error')
                  return;
                $scope.offers = response.offers;
                $scope.startIndex = $scope.startIndex - 5;
              });  
      };
      
      $scope.nextPage = function() {
          var newIndex = $scope.startIndex + 5;
          $http.post('/offers', {
		        category : $scope.activeCategory,
		        from : newIndex,
            numOffers : 5}).success(
              function(response) {
                if (response === 'Error')
                  return;
                $scope.offers = response.offers;
                $scope.startIndex = $scope.startIndex + 5;
              });          
      };
      
      offers.success(function(data){
        $scope.offers = data.offers;
        $scope.count = data.count;
      }).error(function(data, status){
        console.log(data, status);
        $scope.offers = [];
      });
    }])
    
    .controller('offer', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
        $scope.id = $routeParams.id;
        $scope.category = $routeParams.category;
        
        $scope.buy = function() {
          $http.post('/buy', {category : $scope.category, id : $scope.id,
                              date : document.getElementsByName('date')[0].value,
                              offeringUser : $scope.offer.username, offerName : $scope.offer.offerName,
                              delivery : document.getElementsByName('delivery')[0].value})
                    .success(function(response) {
                      window.alert(response.message);
                      window.location = '/';
                    });
        };
        
        $http.get('/offer', {params : {category : $scope.category, id : $scope.id}})
        .success(function(response) {
              if (response.error)
                return;
                
              $scope.offer = response.offer;
              $scope.user = user;
        		
              var position = new google.maps.LatLng($scope.offer.position.lat, $scope.offer.position.lng);
              var myOptions = {
                zoom: 10,
                center: position,
                mapTypeId: google.maps.MapTypeId.ROADMAP
              };
          
              var map = new google.maps.Map(
                document.getElementById("mapCanvas"),
                myOptions);
          
              new google.maps.Marker({
      	        position: position,
      	        map: map,
      	        title:"Meeting place."
              });
        });
    }])
    
    .controller('myaccount', ['$scope', '$http',
      function($scope, $http) {
        $http.get('/myaccount').success(function(response) {
          $scope.user = response.user;
        });
    }])
    
    .controller('addoffer', ['$scope', function() {
      createMap();
    }]);
    