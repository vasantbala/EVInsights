import React, { useEffect, useState } from 'react';
import api from '../api';
import Loading from './Loading';
import {
  SetVehicleProperty,
  VehicleProperty,
  VehiclePropertyList,
} from './Properties';
import { config } from '../config';

const text = {
  lock: 'Lock',
  unlock: 'Unlock',
  startCharge: 'Start charge',
  stopCharge: 'Stop charge',
  disconnect: 'Disconnect',
  disconnectAll: 'Disconnect all',
};

const Vehicle = ({
  info,
  disconnect,
  vehicles,
  setSelectedVehicle,
  updateProperty,
}) => {
  const { amperage, chargeLimit, chargeState, id, isPluggedIn, vin } = info;
  const attributes = vehicles.find((vehicle) => vehicle.id === id);
  const { make, model, year } = attributes;
  const showChargeToggle =
    isPluggedIn &&
    chargeState !== 'FULLY_CHARGED' &&
    config.vehicleProperties.some(
      (property) => property.name === 'startStopCharge'
    );
  const showVin = config.vehicleProperties.some(
    (property) => property.name === 'vin'
  );
  const showLockUnlock = config.vehicleProperties.some(
    (property) => property.name === 'lockUnlock'
  );
  // If enabled, stores inputs to update respective properties e.g. setAmperage
  const [newVehicleProperty, setNewVehicleProperty] = useState({
    chargeLimit: '',
    amperage: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Resets state when vehicle is switched or if the current vehicle's status has changed
  useEffect(() => {
    setNewVehicleProperty({
      chargeLimit: chargeLimit * 100,
      amperage: amperage,
    });
  }, [chargeLimit, amperage]);

  // Removes the loading screen if the vehicle has been retrieved
  useEffect(() => {
    setIsLoading(false);
  }, [id]);

  const handleVehicleChange = async (e) => {
    setIsLoading(true);
    // Obtains the selected vehicle id
    const data = await api.getVehicle(e.target.value);
    setSelectedVehicle(data);
  };

  // Map through properties listed in config and display respective information
  const properties = config.vehicleProperties.map((property) => {
    if (property.permission === 'read_vin') {
      return null;
    } else if (property.componentType === 'VehicleProperty') {
      return (
        <VehicleProperty
          property={{ ...property, status: info[property.name] }}
          key={property.name}
          text={property.text}
        />
      );
    } else if (property.componentType === 'VehiclePropertyList') {
      return (
        <VehiclePropertyList
          property={{ ...property, status: info[property.name] }}
          key={property.name}
          text={property.text}
        />
      );
    } else if (property.componentType === 'SetVehicleProperty') {
      const { targetProperty } = property;
      return (
        <SetVehicleProperty
          property={property}
          key={property.name}
          targetProperty={targetProperty}
          currentValue={info[targetProperty]}
          newVehicleProperty={newVehicleProperty}
          setNewVehicleProperty={setNewVehicleProperty}
          text={property.text}
          updateProperty={updateProperty}
        />
      );
    } else {
      return null;
    }
  });

  return (
    <div className="container vehicle">
      {vehicles.length === 1 ? (
        <h2>
          {year} {make} {model}
        </h2>
      ) : (
        <div>
          <select className="vehicles" onChange={handleVehicleChange}>
            {vehicles.map((vehicle) => (
              <option value={vehicle.id} key={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
        </div>
      )}
      {isLoading ? (
        <Loading showText={false} />
      ) : (
        <>
          {showVin && <p>{vin}</p>}
          {showLockUnlock && (
            <div>
              <button
                className="property-action"
                name="lock"
                onClick={(e) => updateProperty(e.target.name, 'LOCK')}
              >
                {text.lock}
              </button>
              <button
                className="property-action"
                name="unlock"
                onClick={(e) => updateProperty(e.target.name, 'UNLOCK')}
              >
                {text.unlock}
              </button>
            </div>
          )}
          {showChargeToggle && (
            <div>
              <button
                className="property-action"
                name="chargeState"
                onClick={(e) =>
                  updateProperty(
                    e.target.name,
                    chargeState === 'CHARGING' ? 'STOP' : 'START'
                  )
                }
              >
                {chargeState === 'CHARGING'
                  ? text.stopCharge
                  : text.startCharge}
              </button>
            </div>
          )}
          <div className="container stats">{properties}</div>
          <div>
            <button
              className="disconnect"
              name="disconnect"
              onClick={disconnect}
            >
              {text.disconnect}
            </button>
            {vehicles.length > 1 && (
              <button
                className="disconnect"
                name="disconnectAll"
                onClick={disconnect}
              >
                {text.disconnectAll}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Vehicle;
