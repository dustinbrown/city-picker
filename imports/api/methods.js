import { Meteor } from 'meteor/meteor';
import { Cities } from './cities';

Meteor.methods({
    'cities.insert'(name, cities) {
        Cities.insert({ name, cities });
    },
    'cities.remove'(personId) {
        Cities.remove(personId);
    },
    'cities.toggleVisibility'(personId) {
        const person = Cities.findOne(personId);
        if (person) {
            const newVisibility = !person.showCities;
            Cities.update(personId, { $set: { showCities: newVisibility } });
        }
    },
});
