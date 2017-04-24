import promise from 'bluebird'
import request from 'request-promise'
import _ from 'lodash'
import currencyFormatter from 'currency-formatter'

let util = require('util')

let apiKey = 'ha839584452879773285662862394825'

const getLocation = (searchLocation) => {
  let url = util.format(
    'http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/US/USD/en-US/?query=%s&apiKey=%s',
    encodeURIComponent(searchLocation),
    apiKey);

  return request(url).then((body) => {
    let data = JSON.parse(body);

    return data.Places.map((loc) => {
      return {
        id: loc.PlaceId,
        name: loc.PlaceName
      };
    });
  });
}

const searchCache = (country, currency, locale, originPlace, destinationPlace, outboundPartialDate, inboundPartialDate) => {

  let url = util.format(
    'http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/%s/%s/%s/%s/%s/%s/%s?apiKey=%s',
    encodeURIComponent(country),
    encodeURIComponent(currency),
    encodeURIComponent(locale),
    encodeURIComponent(originPlace),
    encodeURIComponent(destinationPlace),
    encodeURIComponent(outboundPartialDate),
    encodeURIComponent(inboundPartialDate),
    apiKey);

  return request(url).then((body) => {
    let data = JSON.parse(body);
    //console.log(data)

    let toReturn = data.Quotes.map((quote) => {

      let segments = [quote.OutboundLeg, quote.InboundLeg].map((segment, index) => {

        let departPlace = _.filter(data.Places, {
          PlaceId: segment.OriginId
        })[0];

        let arrivePlace = _.filter(data.Places, {
          PlaceId: segment.DestinationId
        })[0];

        let carriers = segment.CarrierIds.map(c => _.filter(data.Carriers, {
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

      let price = currencyFormatter.format(quote.MinPrice, {code: currency})

      return {
        segments: segments,
        price: price,
      }
    });

    return toReturn;
  });


};

export default { getLocation, searchCache }
