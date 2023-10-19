import React, {useEffect, useState} from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { withTracker } from 'meteor/react-meteor-data';
import { Cities } from '../imports/api/cities';
import { CSSTransition } from 'react-transition-group';
import './main.css';
import {SelectedCity} from "../imports/api/selectedCity";  // Importing CSS for animations

const App = ({ selectedCity }) => {
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [areTogglesActive, setAreTogglesActive] = useState(false);
    const [isKeyComboPressed, setIsKeyComboPressed] = useState(false);
    const [isDeleteKeyComboPressed, setIsDeleteKeyComboPressed] = useState(false);

    const handleToggleAll = () => {
        setAreTogglesActive(prevState => !prevState);  // Toggle the state variable
        setIsKeyComboPressed(prevState => !prevState);  // Toggle the keystroke toggle state
        setIsDeleteKeyComboPressed(prevState => !prevState);  // Toggle the keystroke toggle state
        setIsButtonEnabled(prevState => !prevState);  // Toggle the button enable/disable state
    };
    const [name, setName] = useState('');
    const [city1, setCity1] = useState('');
    const [city2, setCity2] = useState('');
    const [city3, setCity3] = useState('');
    const cities = useTracker(() => {
        Meteor.subscribe('cities');
        return Cities.find({}).fetch();
    });

    const handleSubmit = () => {
        Meteor.call('cities.insert', name, [city1, city2, city3]);
        setName('');
        setCity1('');
        setCity2('');
        setCity3('');
    };


    const [randomCity, setRandomCity] = useState('');
    const [showRandomCity, setShowRandomCity] = useState(false);
    const [mapUrl, setMapUrl] = useState('');  // New state variable for the map URL

    const handleRandomCity = () => {
        const allCities = cities.flatMap(city => city.cities);
        if (allCities.length > 0) {
            const randomCity = allCities[Math.floor(Math.random() * allCities.length)];
            // [1,2,3]
            // 0.3 * 3 = 0.9
            //
            setRandomCity(randomCity);
            console.log(JSON.stringify(Meteor.settings.public));
            const apiKey = Meteor.settings.public.GOOGLE_MAPS_API_KEY;
            console.log("apiKey: " + apiKey);
            setMapUrl(`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(randomCity + ', city')}`);
            setShowRandomCity(true);
            SelectedCity.update(selectedCity._id, { $set: { name: randomCity, mapUrl } });
        } else {
            alert("No cities submitted yet!");
        }
    };

    const handleClearSelectedCity = () => {
        if (selectedCity) {
            SelectedCity.update(selectedCity._id, { $set: { name: '', mapUrl: '' } });
        }
        setRandomCity(undefined);  // Clear the randomCity state
        setMapUrl(undefined);  // Clear the mapUrl state
        setShowRandomCity(false);  // Hide the random city and map
    };
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'a') {
                window.addEventListener('keydown', handleSubsequentKeyDown);
            }
        };

        const handleSubsequentKeyDown = (e) => {
            if (e.key === 'p') {
                setIsButtonEnabled(prevState => !prevState);  // Toggle the button enable/disable state
            }
            window.removeEventListener('keydown', handleSubsequentKeyDown);
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keydown', handleSubsequentKeyDown);
        };
    }, []);


    return (
        <div className="mt-5">
            <h1 className="text-center mb-4">City Picker for the Mitten Kittens</h1>
            <div className="mb-3">
                <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            </div>
            <div className="mb-3">
                <input type="text" className="form-control" value={city1} onChange={(e) => setCity1(e.target.value)} placeholder="City 1" />
            </div>
            <div className="mb-3">
                <input type="text" className="form-control" value={city2} onChange={(e) => setCity2(e.target.value)} placeholder="City 2" />
            </div>
            <div className="mb-3">
                <input type="text" className="form-control" value={city3} onChange={(e) => setCity3(e.target.value)} placeholder="City 3" />
            </div>
            <button className="btn btn-primary me-2" onClick={handleSubmit}>Submit</button>
            <PersonList cities={cities} isKeyComboPressed={isKeyComboPressed} isDeleteKeyComboPressed={isDeleteKeyComboPressed}/>
            <div className="mt-5 text-center">
            <button className="btn btn-secondary btn-lg btn-bounce"
                    onClick={handleRandomCity}
                    disabled={!isButtonEnabled} >
                Pick Random City</button>
                <CSSTransition
                    in={showRandomCity}
                    timeout={300}
                    classNames="fade"
                    unmountOnExit
                    onExited={() => setShowRandomCity(false)}
                >
                    <div className="mt-3 text-center">
                        <div>Random City: {randomCity}</div>
                        {mapUrl && (
                            <iframe
                                width="600"
                                height="450"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={mapUrl}
                                allowFullScreen=""
                                aria-hidden="false"
                                title="Embedded Map"
                            ></iframe>
                        )}
                    </div>
                </CSSTransition>
                <button
                    className="toggle-all-button"
                    onClick={handleToggleAll}
                    style={{
                        position: 'fixed',
                        bottom: '10px',
                        right: '10px',
                        width: '10px',
                        height: '10px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                    }}
                />
                {showRandomCity && (
                    <button onClick={handleClearSelectedCity} className="btn btn-secondary">
                        Clear Selected City
                    </button>
                )}
            </div>
        </div>
    );
};

const PersonList = ({ cities, isKeyComboPressed, isDeleteKeyComboPressed }) => {


    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'a') {
                window.addEventListener('keydown', handleSubsequentKeyDown);
            }
        };

        const handleSubsequentKeyDown = (e) => {
            if (e.key === 's') {
                setIsKeyComboPressed(prevState => !prevState);
            }
            if (e.key === 'd') {
                setIsDeleteKeyComboPressed(prevState => !prevState);
            }
            window.removeEventListener('keydown', handleSubsequentKeyDown);
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keydown', handleSubsequentKeyDown);
        };
    }, []);

    const handleDelete = personId => {
        Meteor.call('cities.remove', personId);
    };

    const toggleShowCities = personId => {
        Meteor.call('cities.toggleVisibility', personId);
    };

    return (
        <div className="mt-5">
            <h2 className="mb-4">City Selections!</h2>
            <ul className="list-group">
                {cities.map(person => (
                    <li className="list-group-item" key={person._id}>
                        {person.name} - {person.cities.length} cities
                        <button
                            className={`btn btn-info btn-sm me-2 float-end ${!isKeyComboPressed && 'disabled'}`}
                            onClick={() => toggleShowCities(person._id)}
                            disabled={!isKeyComboPressed}
                        >
                            {person.showCities ? 'Hide Cities' : 'Show Cities'}
                        </button>
                        <button
                            className={`btn btn-info btn-sm me-2 float-end ${!isDeleteKeyComboPressed && 'disabled'}`}
                            onClick={() => handleDelete(person._id)}
                            disabled={!isDeleteKeyComboPressed}
                        >
                            Delete
                        </button>
                        {person.showCities && (
                            <div className="mt-2">
                                Cities: {person.cities.join(', ')}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default withTracker(() => {
    Meteor.subscribe('selectedCity');
    return {
        selectedCity: SelectedCity.findOne(),
    };
})(App);


Meteor.startup(() => {
    render(<App />, document.getElementById('app'));
});
