angular.module('hcApp', []).controller('HcController', [
    '$scope', '$window', '$location',
    function ($scope, $window, $location) {
        var nameSplitter = ',',
            cardNames = [];

        for (var i = 0; i < 11; i++) {
            cardNames.push(i + '.png');
        }

        $scope.users = [];
        $scope.results = [];
        $scope.warn = '';

        parseFromSearchString();

        function jumpToInput () {
            var input = $window.document.getElementById('new-user-textbox');
            setTimeout(function () {
                input.focus();
                input.select();
            }, 100)
        }

        function shuffle (array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }

        function dumpToSearchString () {
            var result = [];
            for (var i = 0; i < $scope.users.length; i++) {
                result.push($scope.users[i].name);
            }

            $location.search('users', result.join(nameSplitter));
        }

        function parseFromSearchString () {
            var search = $location.search(),
                rawUsernames,
                usernames;

            if (!search) {
                return;
            }

            rawUsernames = $location.search()['users']
            if (!rawUsernames) {
                return;
            }

            usernames = rawUsernames.split(nameSplitter);

            $scope.users = [];
            for (var i = 0; i < usernames.length; i++) {
                $scope.users.push({name: usernames[i]});
            }
        }

        $scope.addUser = function () {
            $scope.userText = $scope.userText.replace(nameSplitter, '_');

            if ($scope.userText === '') {
                $scope.warn = 'username have to be non empty!';
                jumpToInput();
                return;
            }

            for (var i = 0; i < $scope.users.length; i++) {
                if ($scope.users[i].name === $scope.userText) {
                    $scope.warn = 'username is already exists!';
                    jumpToInput();
                    return;
                }
            }

            $scope.warn = '';
            $scope.users.push({name: $scope.userText});
            $scope.userText = '';
            jumpToInput();

            dumpToSearchString();
            $scope.results = [];
        };

        $scope.removeUser = function (item) {
            var index = $scope.users.indexOf(item);
            $scope.users.splice(index, 1);
            jumpToInput();

            dumpToSearchString();
            $scope.results = [];
        }

        $scope.randomize = function () {
            var users = [...$scope.users],
                results_by_user = {},
                userIndex = 0,
                username;

            shuffle(users);
            shuffle(cardNames);

            cardNames.forEach(function (cardName, index, array) {
                if (userIndex >= users.length) {
                    userIndex = 0;
                }

                username = users[userIndex].name;
                if (results_by_user[username] === undefined) {
                    results_by_user[username] = [];
                }

                results_by_user[username].push(cardName);
                userIndex += 1;
            });

            // transform data to can be sortable
            $scope.results = [];
            angular.forEach(results_by_user, function (cards, user) {
                $scope.results.push({
                    user: user,
                    cards: cards,
                });
            });
        }
    }
]);
