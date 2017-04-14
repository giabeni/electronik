
app.controller("CategoryCtrl", function( DB,  $scope, $timeout, $rootScope, $stateParams, $state, $ionicModal, $ionicViewSwitcher, $ionicPopup, $ionicLoading, $ionicHistory){

  $scope.cat = $stateParams.cat;


  $scope.goToBuy = function(){
    $state.go('buy');
  };

  $scope.goToAdd = function(){
    $state.go('add');
  };

  $scope.goToSearch = function(){
    $state.go('search');
  };

  $scope.goToComponent = function(id){
    $state.go('component', { id : id });
  };

  $scope.goToCat = function(cat){
    $state.go('category', { cat: cat});
  };



  $scope.$on('$ionicView.enter', function() {
    $ionicLoading.show({
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0,
      template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>' +
      '<br/>Loading...'
    });


    $scope.cats = [];
    DB.getCategories().then(function (result) {
      $scope.cats = result.data;
      console.log("categories:");
      console.log($scope.cats);
    });

    $scope.types = [];
    DB.typesFromCategory($scope.cat).then(function (result) {
      $scope.types = result.data;
      console.log("types:");
      console.log($scope.types);
      $scope.types.forEach(function(item, index){
        DB.allFromCategoryType($scope.cat, item.type).then(function (result){
          $scope.types[index][item.type] = result.data;
          console.log("types:");
          console.log($scope.types);
        });
      });
    });


    $scope.all = [];
    DB.allFromCategory($scope.cat).then(function (result) {
      $scope.all = result.data;
      console.log("all:");
      console.log($scope.all);
      $ionicLoading.hide();
    });
  });



});


app.controller("ComponentCtrl", function(DB, $scope, $timeout, $rootScope, $stateParams, $state, $ionicModal, $ionicViewSwitcher, $ionicPopup, $ionicLoading, $ionicHistory){
  $ionicLoading.show({
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0,
    template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>' +
    '<br/>Loading...'
  });

  $scope.id = $stateParams.id;
  $scope.edited = false;
  $scope.disabled = false;
  $scope.stock_edited = false;

  $scope.edit = function(){
    $scope.disabled = !$scope.disabled;
    $scope.edited = true;
  };

  $scope.editStock  = function(){
    $scope.stock_edited = true;
  };

  var date = new Date();



  $scope.comp = {};
  DB.fetch($scope.id).then(function(result) {
    $scope.comp = result.data;
    console.log("comp:");
    console.log($scope.comp);

    if($scope.comp.lastupdate == null) $scope.comp.date = "No data";
    else {
      var dateString = $scope.comp.lastupdate.replace('T', ' ');
      var date = mysqlTimeStampToDate(dateString);
      $scope.comp.date = ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2) + '/' + date.getFullYear();
    }
    $ionicLoading.hide();
    $scope.$apply;
  });



  function mysqlTimeStampToDate(timestamp) {
    //function parses mysql datetime string and returns javascript Date object
    //input has to be in this format: 2007-06-05 15:26:02
    var regex=/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
    var parts=timestamp.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
    return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
  }


  $scope.gap = function(){
    return $scope.comp.qty - $scope.comp.cs;
  };

  $scope.csMinus = function(){
    $scope.stock_edited = true;
    $scope.comp.cs = $scope.comp.cs - 1;
  };
  $scope.csPlus = function(){
    $scope.stock_edited = true;
    $scope.comp.cs = $scope.comp.cs + 1;
  };

  $scope.qtyMinus = function(){
    $scope.stock_edited = true;
    $scope.comp.qty = $scope.comp.qty - 1;
  };

  $scope.qtyPlus = function(){
    $scope.stock_edited = true;
    $scope.comp.qty = $scope.comp.qty + 1;
  };

  $scope.tobuyMinus = function(){
    $scope.stock_edited = true;
    $scope.comp.tobuy = $scope.comp.tobuy - 1;
  };

  $scope.tobuyPlus = function(){
    $scope.stock_edited = true;
    $scope.comp.tobuy = $scope.comp.tobuy + 1;
  };


  $scope.$on('$ionicView.beforeLeave', function (event) {
   if($scope.edited || $scope.stock_edited) {
       $ionicLoading.show({
         animation: 'fade-in',
         showBackdrop: true,
         maxWidth: 200,
         showDelay: 0,
         template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>' +
         '<br/>Updating...'
       });


       if($scope.gap() < 0 || $scope.comp.tobuy > 0){
         $scope.comp.cart = true;
       }else{
         $scope.comp.cart = false;
       }

       $scope.comp.lastupdate = new Date().toISOString().slice(0, 19).replace('T', ' ');

       DB.update($scope.id, $scope.comp).then(function(result) {
         console.log('Updated!');
         $ionicLoading.hide();
       });


     }

   });

  $scope.deleteComp = function (id) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Delete component?',
      template: 'Are you sure you want to delete this component ?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        $ionicLoading.show({
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0,
          template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>' +
          '<br/>Deleting...'
        });
        DB.delete(id).then(function (result) {
          $ionicLoading.hide();
          $ionicHistory.goBack();
        });
      } else {
        console.log('You are not sure');
      }
    });


  };

  $scope.duplicateComp = function (id, code) {
    $ionicLoading.show({
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0,
      template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>' +
      '<br/>Duplicating...'
    });
    var newCode = code + "_copy";
    DB.duplicate(id, newCode).then(function(){
      $ionicLoading.hide();
      $ionicHistory.goBack();
    });
  };
  
  $scope.openLink = function(href){
  	window.open(href, '_system', 'location=yes'); 
  	return false;
  };

});

app.controller("AddCtrl", function(DB, $scope, $timeout, $rootScope, $stateParams, $state, $ionicModal, $ionicViewSwitcher, $ionicPopup, $ionicLoading, $ionicHistory){

  $scope.goTo = function(s){
    $state.go(s);
  };

  $scope.goBack = function(){
    $ionicHistory.goBack();
  };

  var date = new Date();

  //Vetor de dados
  $scope.data = {};
  //Dados requeridos no cadastro
  $scope.data.code = '';
  $scope.data.category = '';
  $scope.data.type = 'none';
  $scope.data.description = '';
  $scope.data.parameters = '';
  $scope.data.remark = '';
  $scope.data.cs = 0;
  $scope.data.qty = 0;
  $scope.data.tobuy = 0;
  $scope.data.datasheet = '';
  $scope.data.cart = false;
  $scope.data.lastupdate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  $scope.gap = function(){
    return $scope.data.qty - $scope.data.cs;
  };



  $scope.Save = function () {
  	if($scope.data.type == "") $scope.data.type = 'none';
    $scope.data.category = $scope.data.category.toLowerCase();
    if($scope.gap() < 0 || $scope.data.tobuy > 0){
      $scope.data.cart = true;
    }

    $ionicLoading.show({
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0,
      template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>' +
      '<br/>Saving...'
    });

    /* save  to backand db */
    DB.create($scope.data)
      .then(function(result) {
          $ionicLoading.hide();
          $scope.goBack();
      });
  };

});

app.controller("BuyCtrl", function( DB, $scope, $timeout, $rootScope, $stateParams, $state, $ionicModal, $ionicViewSwitcher, $ionicPopup, $ionicLoading, $ionicHistory){

  $ionicLoading.show({
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0,
    template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>' +
    '<br/>Loading...'
  });

  $scope.goToComponent = function(id){
    $state.go('component', { id : id });
  };

  $scope.components = {};

  DB.allCart().then(function (result) {
    $scope.components = result.data;
    console.log("components:");
    console.log($scope.components);
    $ionicLoading.hide();
  });

  $scope.needed = function(tobuy, cs, qty){
    if(qty - cs < 0)
      return tobuy + cs - qty;
    else
      return tobuy;
  };

  $scope.refresh = function(){
    $ionicLoading.show({
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0,
      template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>' +
      '<br/>Loading...'
    });
    DB.allCart().then(function (result) {
      $scope.components = result.data;
      console.log("components:");
      console.log($scope.components);
      $ionicLoading.hide();
    });

    var elems = document.querySelectorAll(".item.hidden");

    [].forEach.call(elems, function(el) {
      el.classList.remove("hidden");
    });
  };

  $scope.updateComp = function(id, cat, type, code, qty, n , tobuy, cs){
    var e = document.getElementById(code);
    e.className += " hidden";
    if(n >= (cs - qty) + tobuy && (cs - qty) > 0){
      tobuy = 0;
    }else if(n > (cs - qty) && (cs - qty) > 0){
      tobuy = (cs - qty) + tobuy - n;
    }else if((cs - qty) <= 0 && n < tobuy)
      tobuy = tobuy - n;
    else if((cs - qty) <= 0 && n >= tobuy)
      tobuy = 0;

    var updates = {};
    updates.qty = qty + n;
    updates.tobuy = tobuy;


    if(tobuy == 0 && (cs - qty - n) <= 0){
      updates.cart = false;
    }

    DB.update(id, updates).then(function(result) {
      console.log('Updated!');
    });


  };




});

app.controller("SearchCtrl", function( DB, $scope, $timeout, $rootScope, $stateParams, $state, $ionicModal, $ionicViewSwitcher, $ionicPopup, $ionicLoading, $ionicHistory){
  $scope.goToComponent = function(id){
    $state.go('component', { id: id} );
  };

  $scope.goTo = function(s){
    $state.go(s);
  };

  $scope.goBack = function(){
    $ionicHistory.goBack();
  };


  $scope.found = false;
  $scope.q = "";
  $scope.results = [];
  $scope.search = function(q){
    if(q != null) {
      $ionicLoading.show({
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0,
        template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>' +
        '<br/>Saving...'
      });
      DB.search(q).then(function (result) {
        if (result.data != null) {
          $scope.results = result.data;
          console.log($scope.results);
          $scope.found = true;
          $ionicLoading.hide();
        } else {
          $scope.found = false;
        }
      });
    }
    else {
      $scope.results = [];
      $scope.found = false;
    }


  };


});



app.service('DB', function ($http, Backand) {
  var service = this,
    baseUrl = '/1/objects/',
    objectName = 'components/';

  function getUrl() {
    return Backand.getApiUrl() + baseUrl + objectName;
  }

  function getUrlForId(id) {
    return getUrl() + id;
  }

  service.all = function () {
    return $http.get(getUrl());
  };

  service.fetch = function (id) {
    return $http.get(getUrlForId(id));
  };

  service.create = function (object) {
    return $http.post(getUrl(), object);
  };

  service.update = function (id, object) {
    return $http.put(getUrlForId(id), object);
  };

  service.delete = function (id) {
    return $http.delete(getUrlForId(id));
  };

  service.allFromCategory = function (cat){
    return $http ({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/query/data/category',
      params: {
        parameters: {
          cat: cat
        }
      }
    });
  };

  service.typesFromCategory = function (cat){
    return $http ({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/query/data/types',
      params: {
        parameters: {
          cat: cat
        }
      }
    });
  };

  service.allFromCategoryType = function (cat, type){
    return $http ({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/query/data/typecategory',
      params: {
        parameters: {
          type: type,
          cat: cat
        }
      }
    });
  };

  service.allCart = function(){
    return $http ({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/query/data/cart',
      params: {
        parameters: {}
      }
    });
  };

  service.search = function (query){
    return $http ({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/query/data/search',
      params: {
        parameters: {
          q: query
        }
      }
    });
  };

  service.getCategories = function (){
    return $http ({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/query/data/categories',
      params: {
        parameters: {}
      }
    });
  };

  service.duplicate = function (id, code){
    return $http ({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/query/data/duplicate',
      params: {
        parameters: {
          id: id,
          code: code
        }
      }
    });
  };

});
