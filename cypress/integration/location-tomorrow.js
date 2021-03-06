/// <reference types="Cypress" />

/*
 * Wrapper for JavaScript Date which can return the
 * date as a value seperated string in the format
 * of year, month and day.
 * 
 * @param days the number of days from now the user
 *        whishes to represent. Can be negative.
 */

function OtherDate(days){
  let today = new Date();
  let newDate = new Date();

  newDate.setDate(today.getDate() + days);

  let Pad = function(number){
    return ('00'+number).slice(-2);
  }

  this.getTimeStamp = function(){
    return newDate.now;
  };

  this.getDate = function(seperator){
    return [
        newDate.getFullYear(),
        Pad(newDate.getMonth() + 1), //0 indexed, not 1-12
        Pad(newDate.getDate())
        ].join(seperator);
  }  
}

//set up some key variables
let tomorrow = new OtherDate(1);
let locations = [{
                  name:'Nottingham',
                  woeid:'30720'
                }];
let weatherState = {
                    'sn':'Snow',
                    'sl':'Sleet',
                    'h':'Hail',
                    't':'Thunderstorm',
                    'hr':'Heavy Rain',
                    'lr':'Light Rain',
                    's':'Showers',
                    'hc':'Heavy Cloud',
                    'lc':'Light Cloud',
                    'c':'Clear'
                    };
let compassPoints = [
                      'N',
                      'NbE',
                      'NNE',
                      'NEbN',
                      'NE',
                      'NEbE',
                      'ENE',
                      'EbN',
                      'E',
                      'EbS',
                      'ESE',
                      'SEbE',
                      'SE',
                      'SEbS',
                      'SSE',
                      'SbE',
                      'S',
                      'SbW',
                      'SSW',
                      'SWbS',
                      'SW',
                      'SWbW',
                      'WSW',
                      'WbS',
                      'W',
                      'WbN',
                      'WNW',
                      'NWbW',
                      'NW',
                      'NWbN',
                      'NNW',
                      'NbW',
]

locations.forEach(function(locaton){
  describe('Test metaweather.com for ' + locaton.name, function() {
    it('Tests the API for ' + locaton.name + ' on ' + tomorrow.getDate('/'), function() {
      cy.request( '/api/location/' + locaton.woeid + '/' + tomorrow.getDate('/')).then((response) => {

        //expect a good response
        expect(response.status).to.equal(200) 

        //expect the body not to be empty
        expect(response.body).to.be.an('array').that.is.not.empty; 

        //set an initial date for the date ordered test
        let last = Date.now(); 

        cy.wrap(response.body).each(function(value, index){ //for each element of the response
            let weather = response.body[index];

            expect(weather).to.be.an('Object');

            //date ordered, newest first
            expect(new Date(weather.created).valueOf()).to.be.below(last); 
            last = weather.created;

            //expect the applicable date to match the searched for date
            expect(weather.applicable_date).to.equal(tomorrow.getDate('-')); 

            //expect the abbreviation to be in the keys of the weatherState object
            expect(weather.weather_state_abbr).to.have.oneOf(Object.keys(weatherState)); 

            //expect weather_state_name to relate to the weather_state_abbr
            expect(weather.weather_state_name).to.equal(weatherState[weather.weather_state_abbr]); 
            
            //expect the wind_speed to be non-negative
            expect(weather.wind_speed).to.be.least(0);
            
            //expect the wind_direction to be a valid compass reading within (1-360)
            expect(weather.wind_direction).to.be.within(1,360);

            //expect the wind_direction_compass to be a valid compass point value
            expect(weather.wind_direction_compass).to.be.oneOf(compassPoints);
            //TODO - calculate expected value from the wind_direction and check that
            
            //max_temp >= min_temp 
            expect(weather.max_temp).to.be.least(weather.min_temp);
            
            //min_temp <= the_temp <= max_temp 
            expect(weather.the_temp).to.be.within(weather.min_temp,weather.max_temp);
            
            //air_pressure
            expect(weather.air_pressure).to.be.an.number;
            //humidity
            expect(weather.humidity).to.be.an.number;
            //visibility
            expect(weather.visibility).to.be.an.number;

            //expect predictability to be within 0 (no agreement) and 100 (total agreement)
            expect(weather.predictability).to.be.within(0,100);
             
        });
      });
    });
  });
});



 