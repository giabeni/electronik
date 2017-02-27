
app.controller("CategoryCtrl", function( Firebase, $scope, $timeout, $rootScope, $stateParams, $state, $ionicModal, $ionicViewSwitcher, $ionicPopup, $ionicLoading, $ionicHistory){

  $ionicLoading.show({
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0,
    template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>' +
    '<br/>Loading...'
  });

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

  $scope.goToComponent = function(cat,type, code){
    $state.go('component', { category : cat, type : type, code : code} );
  };

  $scope.goToCat = function(cat){
    $state.go('category', { cat: cat});
  };


  var ref = firebase.database().ref('Components/' + $scope.cat);

  $scope.types = {};
  ref.on("value", function(snapshot) {
    $timeout(function() {
      $scope.types = snapshot.val();
      console.log($scope.types);
    });
  }, function (error) {
    console.log("Error: " + error.code);
  });

  $timeout(function () {
    $ionicLoading.hide();
  }, 2000);

});



app.controller("ComponentCtrl", function(Firebase, $scope, $timeout, $rootScope, $stateParams, $state, $ionicModal, $ionicViewSwitcher, $ionicPopup, $ionicLoading, $ionicHistory){
  $ionicLoading.show({
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0,
    template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>' +
    '<br/>Loading...'
  });

  $scope.category = $stateParams.category;
  $scope.type = $stateParams.type;
  $scope.code = $stateParams.code;

  $scope.edited = false;
  $scope.disabled = false;
  $scope.stock_edited = false;

  $scope.edit = function(){
    $scope.disabled = !$scope.disabled;
    $scope.edited = true;
  }

  $scope.editStock  = function(){
    $scope.stock_edited = true;
  }

  var date = new Date();

  var ref = firebase.database().ref('Components/' + $scope.category + '/' + $scope.type + '/' + $scope.code);

  $scope.comp = {};
  ref.once("value", function(snapshot) {
    $timeout(function() {
      $scope.comp = snapshot.val();
      console.log($scope.comp);
    });
  }, function (error) {
    console.log("Error: " + error.code);
  });


  $scope.comp.lastupdate =  ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2) + '/' + date.getFullYear() ;


  $scope.gap = function(){
    return $scope.comp.qty - $scope.comp.cs;
  }

  $scope.csMinus = function(){
    $scope.stock_edited = true;
    $scope.comp.cs = $scope.comp.cs - 1;
  }
  $scope.csPlus = function(){
    $scope.stock_edited = true;
    $scope.comp.cs = $scope.comp.cs + 1;
  }

  $scope.qtyMinus = function(){
    $scope.stock_edited = true;
    $scope.comp.qty = $scope.comp.qty - 1;
  }

  $scope.qtyPlus = function(){
    $scope.stock_edited = true;
    $scope.comp.qty = $scope.comp.qty + 1;
  }

  $scope.tobuyMinus = function(){
    $scope.stock_edited = true;
    $scope.comp.tobuy = $scope.comp.tobuy - 1;
  }

  $scope.tobuyPlus = function(){
    $scope.stock_edited = true;
    $scope.comp.tobuy = $scope.comp.tobuy + 1;
  }

  $timeout(function () {
    $ionicLoading.hide();
  }, 1500);

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

       ref.set({
         code: $scope.comp.code.toUpperCase(),
         category: $scope.comp.category.toLowerCase(),
         type: $scope.comp.type.toLowerCase(),
         description: $scope.comp.description,
         parameters: $scope.comp.parameters,
         remark: $scope.comp.remark,
         cs: $scope.comp.cs,
         qty: $scope.comp.qty,
         tobuy: $scope.comp.tobuy,
         datasheet: $scope.comp.datasheet,
         lastupdate: $scope.comp.lastupdate
       });

     if($scope.gap() < 0 || $scope.comp.tobuy > 0){
       /* save component in the cart */
       firebase.database().ref('Cart/' + $scope.comp.code.toUpperCase()).set({
         code: $scope.comp.code.toUpperCase(),
         category: $scope.comp.category.toLowerCase(),
         type: $scope.comp.type.toLowerCase(),
         description: $scope.comp.description,
         parameters: $scope.comp.parameters,
         cs: $scope.comp.cs,
         qty: $scope.comp.qty,
         tobuy: $scope.comp.tobuy
       });
     }else{
       firebase.database().ref('Cart/' + $scope.comp.code.toUpperCase()).remove();
     }

       // Sumir com popup de loading
       $timeout(function () {
         $ionicLoading.hide();
         $scope.goBack();
       }, 1500);

     }

   });

});

app.controller("AddCtrl", function(Firebase, $scope, $timeout, $rootScope, $stateParams, $state, $ionicModal, $ionicViewSwitcher, $ionicPopup, $ionicLoading, $ionicHistory){

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
  $scope.data.lastupdate =  ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2) + '/' + date.getFullYear() ;
  $scope.gap = function(){
    return $scope.data.qty - $scope.data.cs;
  }


  //Add to database function
  $scope.Save = function () {// Mostra ao usuario que o cadastro esta sendo realizado
    $ionicLoading.show({
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0,
      template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>' +
      '<br/>Saving...'
    });


    // Envio de dados para o firebase
    firebase.database().ref('Components/' + $scope.data.category.toLowerCase() + '/' + $scope.data.type.toLowerCase() + '/' + $scope.data.code.toUpperCase()).set({
      code: $scope.data.code.toUpperCase(),
      category: $scope.data.category.toLowerCase(),
      type: $scope.data.type.toLowerCase(),
      description: $scope.data.description,
      parameters: $scope.data.parameters,
      remark: $scope.data.remark,
      cs: $scope.data.cs,
      qty: $scope.data.qty,
      tobuy: $scope.data.tobuy,
      datasheet: $scope.data.datasheet,
      lastupdate: $scope.data.lastupdate
    });

    if($scope.gap() < 0 || $scope.data.tobuy > 0){
      /* save component in the cart */
      firebase.database().ref('Cart/' + $scope.data.code.toUpperCase()).set({
        code: $scope.data.code.toUpperCase(),
        category: $scope.data.category.toLowerCase(),
        type: $scope.data.type.toLowerCase(),
        description: $scope.data.description,
        parameters: $scope.data.parameters,
        cs: $scope.data.cs,
        qty: $scope.data.qty,
        tobuy: $scope.data.tobuy
      });
    }

    // Sumir com popup de loading
    $timeout(function () {
      $ionicLoading.hide();
      $scope.goBack();
    }, 1500)

  }

});

app.controller("BuyCtrl", function( Firebase, $scope, $timeout, $rootScope, $stateParams, $state, $ionicModal, $ionicViewSwitcher, $ionicPopup, $ionicLoading, $ionicHistory){

  $ionicLoading.show({
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0,
    template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>' +
    '<br/>Loading...'
  });


  var ref = firebase.database().ref('Cart/');

  $scope.components = {};
  ref.on("value", function(snapshot) {
    $timeout(function() {
      $scope.components = snapshot.val();
      console.log($scope.components);
    });
  }, function (error) {
    console.log("Error: " + error.code);
  });

  $scope.needed = function(tobuy, cs, qty){
    if(qty - cs < 0)
      return tobuy + cs - qty;
    else
      return tobuy;
  };

  $scope.refresh = function(){
    var elems = document.querySelectorAll(".item.hidden");

    [].forEach.call(elems, function(el) {
      el.classList.remove("hidden");
    });
  };

  $scope.updateComp = function(cat, type, code, qty, n , tobuy, cs){
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

    var updates = {
      qty: qty + n,
      tobuy: tobuy
    };
    firebase.database().ref('Components/' + cat + '/' + type + '/' + code ).update(updates);
    firebase.database().ref('Cart/' + code ).update(updates);

    if(tobuy == 0 && (cs - qty - n) <= 0){
      firebase.database().ref('Cart/' + code).remove();
    }
  };



  $timeout(function () {
    $ionicLoading.hide();
  }, 500);


});

app.controller("SearchCtrl", function( Firebase, $scope, $timeout, $rootScope, $stateParams, $state, $ionicModal, $ionicViewSwitcher, $ionicPopup, $ionicLoading, $ionicHistory){
  $scope.goToComponent = function(id){
    $state.go('component', { id: id} );
  };

  $scope.goTo = function(s){
    $state.go(s);
  };

  $scope.goBack = function(){
    $ionicHistory.goBack();
  };


  $scope.q = "";
  $scope.search = function(q){
    var ref = firebase.database().ref('Components/transistor/none');
    $scope.res = {};
    /*ref.on("value", function(snapshot) {
        $timeout(function() {
          $scope.res = snapshot.val();
          console.log($scope.res);
        });
      }, function (error) {
        console.log("Error: " + error.code);
      });*/


    ref.orderByChild('code').startAt(q).endAt(q+"\uf8ff").on("child_added", function(snapshot) {
      $scope.res = snapshot.val();
      console.log($scope.res);
    });



  };


});


// Inicializa integracao com o banco de dados (Firebase)
app.factory('Firebase', function(){
  var config = {
    apiKey: "AIzaSyDAltQogDcToY7f_A7pk42bWrLQupjLTsc",
    authDomain: "electronik-b0cee.firebaseapp.com",
    databaseURL: "https://electronik-b0cee.firebaseio.com",
    storageBucket: "electronik-b0cee.appspot.com"
    //,messagingSenderId: "285285282699"
  };

  var App = firebase.initializeApp(config);

  return App;
});
