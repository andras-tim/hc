angular.module('hcApp', []).controller('HcController', [
    '$scope', '$window', '$location',
    function ($scope, $window, $location) {
        var nameSplitter = ',',
            availableVersions;

        $scope.versions = {
            '1.0': {
                'infoUrl'       : 'https://engineering.atspotify.com/2014/09/16/squad-health-check-model/',
                'path'          : 'img/1_0/',
                'cardCount'     : 11,
            },
            '1.1': {
                'infoUrl'       : 'https://agilelogbook.com/2020/03/11/updated-spotify-squad-health-check/',
                'path'          : 'img/1_1/',
                'cardCount'     : 15,
            },
        }
        availableVersions = Object.getOwnPropertyNames($scope.versions);

        $scope.selectedVersion = availableVersions[availableVersions.length - 1];
        $scope.users = [];
        $scope.results = [];
        $scope.warn = '';
        $scope.userCollapsed = false;

        parseFromSearchString();

        $scope.addUser = addUser;
        $scope.removeUser = removeUser;
        $scope.closeUsersAndGenerateRandomizedCards = closeUsersAndGenerateRandomizedCards;
        $scope.onChangeVersion = onChangeVersion;

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

        function updateSearchString () {
            var result = [];
            for (var i = 0; i < $scope.users.length; i++) {
                result.push($scope.users[i].name);
            }

            $location.search('v', $scope.selectedVersion);
            $location.search('u', result.join(nameSplitter));
            $location.search('c', $scope.results.length > 0 ? 1 : 0);
        }

        function parseFromSearchString () {
            var search = $location.search(),
                rawVersion,
                rawUsernames,
                rawShowCards,
                usernames;

            if (!search) {
                return;
            }

            rawVersion = $location.search()['v'];
            rawUsernames = $location.search()['u'];
            rawShowCards = $location.search()['c'];

            if (rawVersion in $scope.versions) {
                $scope.selectedVersion = rawVersion;
            }
            if (rawUsernames) {
                usernames = rawUsernames.split(nameSplitter);

                $scope.users = [];
                for (var i = 0; i < usernames.length; i++) {
                    $scope.users.push({name: usernames[i]});
                }
            }
            if (rawShowCards === '1') {
                $scope.userCollapsed = true;
                generateRandomizedResults();
            }
        }

        function addUser () {
            $scope.userText = $scope.userText.replace(nameSplitter, '_');

            if ($scope.userText === '') {
                $scope.warn = 'username has to be not empty!';
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

            $scope.results = [];
            updateSearchString();
        }

        function removeUser (item) {
            var index = $scope.users.indexOf(item);
            $scope.users.splice(index, 1);
            jumpToInput();

            $scope.results = [];
            updateSearchString();
        }

        function closeUsersAndGenerateRandomizedCards()
        {
            closeUsers();
            generateRandomizedResults();
        }

        function generateRandomizedResults() {
            var cardNames = [],
                users = [...$scope.users],
                versionDetails,
                results_by_user = {},
                userIndex = 0,
                username;

            versionDetails = $scope.versions[$scope.selectedVersion];
            for (var i = 0; i < versionDetails.cardCount; i++) {
                cardNames.push(
                    versionDetails.path + ('0' + i).slice(-2) + '.png'
                );
            }

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

            updateSearchString();
        }

        function onChangeVersion(newVersion) {
            $scope.selectedVersion = newVersion;
            $scope.results = [];
            updateSearchString();
        }

        function closeUsers() {
            var collapseUsers = document.getElementById('collapseUsers');

            new bootstrap.Collapse(collapseUsers, {toggle: false}).hide();
        }
    }
]);
