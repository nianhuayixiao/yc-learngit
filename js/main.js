/**
 * Created by yc on 16/10/10.
 */
angular.module("myApp",[])
        .controller('mainController', function ($scope) {
        $scope.submitForm = function () {
            console.log('表单提交了');
        }
    })