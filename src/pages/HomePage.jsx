import React, { Component } from "react";
import {
    generateProgression,
    generateMidi,
    mapProgressionToKey
} from "../utils/chords";
import Loader from "../components/Loader";
import ProgressionDisplay from "../components/ProgressionDisplay";
import Piano from "../components/Piano"
import { CSSTransition } from 'react-transition-group';
import { arrayMove } from "react-sortable-hoc"
import keys from "../utils/keys";
import Tone from "tone";
import palette from "../utils/palette";

class HomePage extends Component {
    constructor() {
        super();
        this.state = {
            generating: false,
            color: "grey-darkest",
            progression: [],
            previousKey: "C",
            key: "C",
            bpm: 120,
            playing: false,
            playingChord: {},
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
        let lockedChord = chords.find(element =>
            chord.id === element.id
        );
        if (lockedChord) lockedChord.lock = !lockedChord.lock;
        this.setState({
            progression: chords
        });
    };

    _togglePlay = chord => {
        let chords = [...this.state.progression];

        let playingChord = chords.find(element =>
            chord.id === element.id
        );

        if (playingChord) playingChord.playing = !playingChord.playing;

        this.setState({
            progression: chords,
            playingChord: playingChord
        }, () => {
            if (playingChord.playing) {
                this._playChord(chord);
            }
        })

    };

    _playProgression = () => {
        Tone.Transport.start();

        if (this.state.playing) {
            this._cleanup();
            return;
        }

        let progressionInKey = [...this.state.progression];

        let endTime = "";
        for (let index in progressionInKey) {
            let chord = progressionInKey[index];
            let time = Number(index) === 0 ? "+0.1" : "+" + index + "m";
            new Tone.Event((time, x) => {
                this._togglePlay(chord);
            }).start(time);
            endTime = "+" + (Number(index) + 1) + "m"
        }

        new Tone.Event((time, x) => {
            this._cleanup();
        }).start(endTime);



        this.setState({
            playing: true
        });
    };

    _playChord = chord => {
        Tone.Transport.start();

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

        return;
    }

    _stopChord = chord => {
        let chords = [...this.state.progression];

        let playingChord = chords.find(element =>
            chord.id === element.id
        );

        let currentlyPlayingChord = { ...this.state.playingChord }

        if (playingChord) {
            playingChord.playing = false;
            if (playingChord.id === this.state.playingChord.id) {
                currentlyPlayingChord = {}
            }
        }

        this.setState({
            progression: chords,
            playingChord: currentlyPlayingChord
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
        let progression = [...this.state.progression];
        progression.forEach(chord => {
            chord.playing = false;
        })
        Tone.Master.mute = true;
        Tone.Transport.stop();
        Tone.Transport.cancel(0);
        this.setState({
            progression,
            playing: false,
            playingChord: {},
            chordPart: null,
            stopEvent: null
        });
        return;
    };

    _generate = () => {
        //set state for animation if 'regenerating'
        if (this.state.progression.length > 0) {
            this.setState({
                generating: true
            }, () => {
                setTimeout(() => {
                    this.setState({
                        generating: false
                    })
                }, 300)
            });
        }

        let previousKey = this.state.key;
        this._cleanup();
        this._randomizeColor();
        let progression = generateProgression(
            this.state.key,
            this.state.progression
        );
        this.setState({
            progression,
            key: this.state.key,
            previousKey: previousKey
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
            <div className={`flex flex-col text-center p-4 md:p-12 shadow-lg bg-white rounded m-2 ${this.state.generating ? "shake" : ""}`}>
                {progressionDisplay}
                <div className="flex justify-between items-center mb-6">
                    <select
                        name="key"
                        className="rounded bg-grey-lighter leading-none text-secondary p-2"
                        value={this.state.key}
                        onChange={this._onKeyChange}
                    >
                        {keys.map((key, index) => (
                            <option key={index} value={key.value}>
                                {key.label}
                            </option>
                        ))}
                    </select>
                    <a className="no-underline" href={this._downloadMidi()}>
                        <button className="btn btn-ghost transition">
                            download midi
                        </button>
                    </a>
                </div>
                <div className="flex justify-end mb-6">
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
                <Piano chord={this.state.playingChord.notes} />
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
                            timeout={500}
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
