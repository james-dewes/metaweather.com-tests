/// <reference types="Cypress" />

function Tomorrow(){
  let today = new Date();
  let tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1);
  let Pad = function(number){
    return ("00"+number).slice(-2);
  }
  this.getTimeStamp = function(){
    return tomorrow;
  };
  this.getDate = function(seperator){
    return [
        tomorrow.getFullYear(),
        Pad(tomorrow.getMonth() + 1), //0 indexed, not 1-12
        Pad(tomorrow.getDate())
        ].join(seperator)
  }  
}

//set up some key variables
let tomorrow = new Tomorrow();
let locations = [{
                  name:"Nottingham",
                  woeid:"30720"
                }];
let weatherStateAbbreviations = ['sn','sl','h','t','hr','lr','s','hc','lc','c']

locations.forEach(function(locaton){
  describe('Test metaweather.com for ' + locaton.name, function() {
    it('Tests the API for Nottingham on ' + tomorrow.getDate('/'), function() {
      cy.request( '/api/location/' + locaton.woeid + '/' + tomorrow.getDate('/')).then((response) => {
        expect(response.status).to.equal(200) //expect a good response
        expect(response.body).to.be.an('array').that.is.not.empty; //expect the body not to be empty
        cy.wrap(response.body).each(function(value, index){ //for each element of the response
            let weather = response.body[index];
            expect(weather).to.be.an('Object')
            expect(weather.applicable_date).to.equal(tomorrow.getDate('-')); //expect the applicable date to match the searched for date
            expect(weather.weather_state_abbr).to.have.oneOf(weatherStateAbbreviations); //expect the abbreviation to be in the abbreviations list
            //TODO: build out the following tests
            //date ordered
            //weather_state_name
            //wind_speed
            //wind_direction (0-360)
            //wind_direction_compass
            //min_temp
            //max_temp
            //air_pressure
            //humidity
            //visibility
            //predictability (max 100)
        });
      });
    });
  });
});



 