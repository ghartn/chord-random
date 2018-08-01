import React, { Component } from "react";
import {
    generateProgression,
    generateMidi,
    mapProgressionToKey
} from "../utils/chords";
import Loader from "../components/Loader";
import ProgressionDisplay from "../components/ProgressionDisplay";
import { CSSTransition } from 'react-transition-group';
import { arrayMove } from "react-sortable-hoc"
import KEYS from "../utils/keys";
import isEqual from "lodash/isEqual";
import Tone from "tone";
import palette from "../utils/palette";

class HomePage extends Component {
    constructor() {
        super();
        this.state = {
            loading: false,
            color: "grey-darkest",
            progression: [],
            previousKey: "C",
            key: "C",
            bpm: 120,
            playing: false,
            chordPart: null,
            stopEvent: null
        };
    }

    componentDidMount() {
        this._randomizeColor();
    }

    _randomizeColor = () => {
        let colors = Object.keys(palette)
        let randomIndex = Math.floor(Math.random() * colors.length);
        let color = colors[randomIndex];
        while (color === this.state.color) {
            randomIndex = Math.floor(Math.random() * colors.length);
            color = colors[randomIndex];
        }
        this.setState({
            color
        });
    };

    _downloadMidi = () => {
        return generateMidi(this.state.progression);
    };

    _onKeyChange = e => {
        let previousKey = this.state.key;
        let key = e.target.value;
        let progression = mapProgressionToKey(
            [...this.state.progression],
            previousKey,
            key
        );
        this.setState({
            progression,
            previousKey,
            key
        });
    };

    _toggleChordLock = chord => {
        let chords = [...this.state.progression];
        let lockedChord = chords.find(element => {
            return isEqual(chord, element);
        });
        if (lockedChord) lockedChord.lock = !lockedChord.lock;
        this.setState({
            progression: chords
        });
    };

    _togglePlay = chord => {
        let chords = [...this.state.progression];

        let playingChord = chords.find(element => {
            return isEqual(chord, element);
        });

        playingChord.playing = !playingChord.playing;

        this.setState({
            progression: chords
        })

        if (playingChord.playing) {
            this._playChord(chord);
        }

    };

    _playChord = chord => {
        let chordNotes = chord.notes;
        let polySynth = new Tone.PolySynth(10, Tone.Synth).toMaster();

        polySynth.set({
            "oscillator.type": "triangle",
            volume: -16,
            portamento: 0.1,
            envelope: {
                attack: 0.1,
                decay: 1.2,
                sustain: 0,
                release: 0.8
            }
        });

        Tone.Master.mute = false;

        polySynth.triggerAttackRelease(chordNotes, "1m");

        new Tone.Event((time, chord) => {
            this._stopChord(chord);
        }, chord).start("+1m");

        if (Tone.Transport.state !== "started") {
            Tone.Transport.start();
        }

        return;
    }

    _stopChord = chord => {
        let chords = [...this.state.progression];

        let playingChord = chords.find(element => {
            return isEqual(chord, element);
        });

        playingChord.playing = false;

        this.setState({
            progression: chords
        })
    }

    _onSort = ({ oldIndex, newIndex }) => {
        this.setState({
            progression: arrayMove(this.state.progression, oldIndex, newIndex),
        });
    }

    _cleanup = () => {
        if (this.state.chordPart) {
            this.state.chordPart.dispose();
        }
        if (this.state.stopEvent) {
            this.state.stopEvent.dispose();
        }
        Tone.Master.mute = true;
        Tone.Transport.stop();
        Tone.Transport.cancel(0);
        this.setState({
            playing: false,
            chordPart: null,
            stopEvent: null
        });
        return;
    };

    _generate = () => {
        this.setState({
            key: this.state.key,
            previousKey: this.state.key
        });
        this._cleanup();
        this._randomizeColor();
        let progression = generateProgression(
            this.state.key,
            this.state.progression
        );
        this.setState({
            progression
        });
    };

    _playProgression = () => {
        if (this.state.playing) {
            this._cleanup();
            return;
        }

        let progessionInKey = [...this.state.progression];
        let chordNotes = progessionInKey.map(chord => chord.notes)
        let polySynth = new Tone.PolySynth(10, Tone.Synth).toMaster();

        polySynth.set({
            "oscillator.type": "triangle",
            volume: -16,
            portamento: 0.1,
            envelope: {
                attack: 0.1,
                decay: 1.2,
                sustain: 0,
                release: 0.8
            }
        });

        Tone.Master.mute = false;
        Tone.Transport.bpm.value = this.state.bpm;

        let chords = [];
        let endTime = "";
        for (let index in chordNotes) {
            let chord = chordNotes[index];
            let time = `${Number(index)}${Number(index) !== 0 ? "m" : ""}`;
            chords.push([time, chord]);
            endTime = `+${Number(index) + 1}m`;
        }

        let chordPart = new Tone.Part((time, chord) => {
            polySynth.triggerAttackRelease(chord, "1m", time);
        }, chords).start(0);

        let stopEvent = new Tone.Event((time, x) => {
            this._cleanup();
        }).start(endTime);

        Tone.Transport.stop();
        Tone.Transport.start("+0.1");

        this.setState({
            playing: true,
            chordPart,
            stopEvent
        });
    };

    _renderChords = () => {
        return (
            <ProgressionDisplay
                progression={this.state.progression}
                toggleLock={this._toggleChordLock}
                togglePlay={this._togglePlay}
                onSort={this._onSort}
            />
        );
    };

    _renderProgression = () => {
        const progressionDisplay = this._renderChords();
        return (
            <div className="flex flex-col text-center p-4 md:p-12 shadow-lg bg-white rounded m-2">
                {progressionDisplay}
                <div className="flex justify-between items-center mb-6">
                    <select
                        name="key"
                        className="rounded bg-grey-lighter leading-none text-secondary p-2"
                        value={this.state.key}
                        onChange={this._onKeyChange}
                    >
                        {KEYS.map((key, index) => (
                            <option key={index} value={key.value}>
                                {key.label}
                            </option>
                        ))}
                    </select>
                    <a
                        className="no-underline text-grey-dark hover:text-grey cursor-pointer transition"
                        href={this._downloadMidi()}
                    //download
                    >
                        download midi
					</a>
                </div>
                <div className="flex justify-end">
                    <button
                        className={`btn bg-${this.state.color} text-white transition mr-4`}
                        onClick={this._playProgression}
                    >
                        {!this.state.playing ? "listen" : "stop"}
                    </button>
                    <button className="btn btn-ghost transition" onClick={this._generate}>
                        regenerate
					</button>
                </div>
            </div>
        );
    };

    render() {
        const { color } = this.state;
        return (
            <div
                className={`flex flex-1 items-center justify-center w-full bg-${color} transition`}
            >
                <div className="flex flex-col container mx-auto">
                    <Loader loading={this.state.loading} color={color} />
                    {this.state.progression.length > 0 ? (
                        <CSSTransition
                            appear
                            in={this.state.progression.length > 0}
                            timeout={300}
                            classNames="pop"
                            unmountOnExit
                        >
                            {this._renderProgression()}
                        </CSSTransition>

                    ) : (
                            <button
                                className="text-5xl text-grey-lightest hover:text-white text-shadow transition"
                                onClick={() => this._generate()}
                            >
                                generate
						</button>
                        )}
                </div>
            </div>
        );
    }
}

export default HomePage;
