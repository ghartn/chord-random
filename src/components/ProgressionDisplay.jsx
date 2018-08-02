import React, { Component } from 'react';
import ChordDisplay from "./ChordDisplay";
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const SortableItem = SortableElement(({ chord, toggleLock, togglePlay }) =>
    <ChordDisplay
        chord={chord}
        toggleLock={toggleLock}
        togglePlay={togglePlay}
    />
);

const SortableList = SortableContainer(({ progression, toggleLock, togglePlay }) => {
    return (
        <ul className="list-reset flex flex-col md:flex-row flex-wrap mb-8 transition bg-grey-lighter">
            {progression.map((chord, index) => (
                <SortableItem key={`chord-${index}`} index={index} chord={chord} toggleLock={toggleLock}
                    togglePlay={togglePlay} />
            ))}
        </ul>
    );
});

class ProgressionDisplay extends Component {
    render() {


        return (
            <SortableList progression={this.props.progression} toggleLock={this.props.toggleLock}
                togglePlay={this.props.togglePlay} onSortEnd={this.props.onSort} axis="xy" distance={10} />
        );
    }
}

export default ProgressionDisplay;