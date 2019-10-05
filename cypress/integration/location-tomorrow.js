/// <reference types="Cypress" />

/* Re-arranges the tests to make multiple calls and test
 * each attribute separately, checking every object in
 * the response.
 * 
 * NB this set of tests makes multiple requests to the
 * API and you may need to check with the owner for
 * permission to do so.
 */

function Tomorrow(){

  let today = new Date();
  let tomorrow = new Date();

  tomorrow.setDate(today.getDate() + 1);

  let Pad = function(number){
    return ('00'+number).slice(-2);
  }

  this.getTimeStamp = function(){
    return tomorrow.now;
  };

  this.getDate = function(seperator){
    return [
        tomorrow.getFullYear(),
        Pad(tomorrow.getMonth() + 1), //0 indexed, not 1-12
        Pad(tomorrow.getDate())
        ].join(seperator);
  }  
}

//set up some key variables
let tomorrow = new Tomorrow();
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

  let titleString = 'Test for ' + locaton.name +' ' + tomorrow.getDate('/');
  let url = '/api/location/' + locaton.woeid + '/' + tomorrow.getDate('/');

  describe(titleString, function() {
    it('Expect a good response', function() {
      cy.request(url).then((response) => {
        expect(response.status).to.equal(200);
      });
    });

    it('Expect a response that is not empty', function() {
      cy.request(url).then((response) => {
        expect(response.body).to.be.an('array').that.is.not.empty; 
      });
    });

    it('Expect weather to be an object', function() {
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];
          expect(weather).to.be.an('Object');
        });
      });
    });

    it('Expect response to be date ordered, newest first', function() {
      //set an initial date for the date ordered test
      let last = Date.now(); 
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];
          //date ordered, newest first
          expect(new Date(weather.created).valueOf()).to.be.below(last); 
          last = weather.created;
        });
      });
    });

    it('Expect the applicable date to match the searched for date ', function() {
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];
          expect(weather.applicable_date).to.equal(tomorrow.getDate('-')); 
        });
      });
    });

    it('Expect the abbreviation to be in the keys of the weatherState object', function() {
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];
        expect(weather.weather_state_abbr).to.have.oneOf(Object.keys(weatherState)); 
        });
      });
    });

    it('Expect weather_state_name to relate to the weather_state_abbr', function() {
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];
          expect(weather.weather_state_name).to.equal(weatherState[weather.weather_state_abbr]); 
        });
      });
    });

    it('Expect the wind_speed to be non-negative', function() {
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];
          expect(weather.wind_speed).to.be.least(0);
        });
      });
    });

    it('Expect the wind_direction to be a valid compass reading within (1-360)', function() {
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];
          expect(weather.wind_direction).to.be.within(1,360);
        });
      });
    });

    it('Expect the wind_direction_compass to be a valid compass point value', function() {
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];
          expect(weather.wind_direction_compass).to.be.oneOf(compassPoints);      
        });
      });
    });

    //TODO - calculate expected value from the wind_direction and check that

    it('Expect max_temp >= min_temp', function() {
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];
            expect(weather.max_temp).to.be.least(weather.min_temp);          
        });
      });
    });

    it('Expect min_temp <= the_temp <= max_temp', function() {
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];          
          expect(weather.the_temp).to.be.within(weather.min_temp,weather.max_temp);
        });
      });
    });

    it('Expect air_pressure to be a number', function() {
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];
          expect(weather.air_pressure).to.be.an.number;
        });
      });
    });
      
    it('Expect humidity ro be a number', function() {
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];
          expect(weather.humidity).to.be.an.number;
        });
      });
    });
      
    it('Expect visibility to be a number', function() {
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];
          expect(weather.visibility).to.be.an.number;
        });
      });
    });
    
    it('Expect predictability to be within 0 (no agreement) and 100 (total agreement)', function() {
      cy.request(url).then((response) => {
        cy.wrap(response.body).each(function(value, index){
          let weather = response.body[index];
          expect(weather.predictability).to.be.within(0,100);  
        });
      });
    });
  });
});

 