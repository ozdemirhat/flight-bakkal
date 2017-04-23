import promise from 'bluebird'
import request from 'request-promise'
import _ from 'lodash'
import currencyFormatter from 'currency-formatter'

var util = require('util')

let apiKey = 'ha839584452879773285662862394825'

const getLocation = function (searchLocation) {
  var url = util.format(
    'http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/US/USD/en-US/?query=%s&apiKey=%s',
    encodeURIComponent(searchLocation),
    apiKey);

  return request(url).then(function (body) {
    var data = JSON.parse(body);

    return data.Places.map(function (loc) {
      return {
        id: loc.PlaceId,
        name: loc.PlaceName
      };
    });
  });
}

const searchCache = function (country = 'US', currency = 'USD', locale = 'en-US', originPlace, destinationPlace, outboundPartialDate, inboundPartialDate) {

  var url = util.format(
    'http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/%s/%s/%s/%s/%s/%s/%s?apiKey=%s',
    encodeURIComponent(country),
    encodeURIComponent(currency),
    encodeURIComponent(locale),
    encodeURIComponent(originPlace),
    encodeURIComponent(destinationPlace),
    encodeURIComponent(outboundPartialDate),
    encodeURIComponent(inboundPartialDate),
    apiKey);

  return request(url).then(function (body) {
    var data = JSON.parse(body);
    //console.log(data)

    var toReturn = data.Quotes.map(function (quote) {

      var segments = [quote.OutboundLeg, quote.InboundLeg].map(function (segment, index) {

        var departPlace = _.filter(data.Places, {
          PlaceId: segment.OriginId
        })[0];

        var arrivePlace = _.filter(data.Places, {
          PlaceId: segment.DestinationId
        })[0];

        var carriers = segment.CarrierIds.map(c => _.filter(data.Carriers, {
          CarrierId: c
        })[0].Name);

        return {
          group: index + 1,
          departAirport: {
            code: departPlace.IataCode,
            name: departPlace.Name
          },
          arriveAirport: {
            code: arrivePlace.IataCode,
            name: arrivePlace.Name
          },
          departCity: {
            code: departPlace.CityId,
            name: departPlace.CityName
          },
          arriveCity: {
            code: arrivePlace.CityId,
            name: arrivePlace.CityName
          },
          departTime: segment.DepartureDate,
          carriers: carriers
        };
      });

      var price = currencyFormatter.format(quote.MinPrice, {code: currency})

      return {
        segments: segments,
        price: price,
      }
    });

    return toReturn;
  });


};

export default { getLocation, searchCache }