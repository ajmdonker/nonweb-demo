﻿(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/broker/broker.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            this._layoutRoot = element;

            var backButton = this._layoutRoot.querySelector("#backButton");
            backButton.addEventListener("click", this._goBack);

            var brokerButton = this._layoutRoot.querySelector("#openBroker");
            brokerButton.addEventListener("click", this._openBroker.bind(this));
        },

        _goBack: function () {
            WinJS.Navigation.back(1);
        },

        _openBroker: function () {
            // http://blog.stevenedouard.com/andcontinue-methods-for-windows-universal-apps/
            // app URL: Windows.Security.Authentication.Web.WebAuthenticationBroker.getCurrentApplicationCallbackUri().absoluteUri

            var constants = Surfnet.Constants;
            var clientId = (WinJS.Utilities.isPhone) ? constants.SFOAUTH_CLIENT_ID_PHONE : constants.SFOAUTH_CLIENT_ID;
            var urlString = constants.AUTH_URL + "?client_id=" + clientId  + "&response_type=" + constants.RESPONSE_TYPE + "&state=" + constants.STATE + "&scope=" + constants.SCOPE;
            var startURI = new Windows.Foundation.Uri(urlString);
            var responseStatus = document.getElementById("responseStatus");
            WinJS.Utilities.removeClass(responseStatus, "error");
            WinJS.Utilities.removeClass(responseStatus, "success");
            try {
                //Windows 8/8.1
                Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(
                    Windows.Security.Authentication.Web.WebAuthenticationOptions.none, startURI)
                    .done(function (result) {
                        var responseStatus = document.getElementById("responseStatus");
                        document.getElementById("responseToken").value = result.responseData;
                        if (result.responseStatus === Windows.Security.Authentication.Web.WebAuthenticationStatus.errorHttp) {
                            WinJS.Utilities.addClass(responseStatus, "error");
                            responseStatus.value = "Error returned: " + result.responseErrorDetail;
                        } else {
                            WinJS.Utilities.addClass(responseStatus, "success");
                            responseStatus.value = "Status returned by WebAuth broker: " + result.responseStatus;
                        }
                    }, function (err) {
                        var responseStatus = document.getElementById("responseStatus");
                        WinJS.Utilities.addClass(responseStatus, "error");
                        responseStatus.value = "Error returned by WebAuth broker: " + err;
                    });
            }
            catch (err) {
                //Windows Phone 8.1 will throw a Not Implemented exception when you call authenticateAsync. Use authenticateAndContinue instead
                //continuation is handled in the acivation handler
                //                Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAndContinue(startURI, endURI);
                var endURI = new Windows.Foundation.Uri(Windows.Security.Authentication.Web.WebAuthenticationBroker.getCurrentApplicationCallbackUri().absoluteUri);
                Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAndContinue(startURI);
            }
        }
    });
})();
