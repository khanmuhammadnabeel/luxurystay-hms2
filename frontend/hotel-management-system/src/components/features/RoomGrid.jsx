import React from 'react';
import PropTypes from 'prop-types';
import RoomCard from './RoomCard';

const RoomGrid = ({ rooms }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {rooms.map(room => (
                <RoomCard key={room.id} room={room} />
            ))}
        </div>
    );
};

RoomGrid.propTypes = {
    rooms: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default RoomGrid;
