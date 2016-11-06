/// <reference path="../../typings/tsd.d.ts" />
(function() {
    'use strict';

    angular
        .module('app.core')
        .constant('WODconstants', {
            familyList: [{
                filter: '',
                title: 'All'
            },{
                filter: 'Squats',
                title: 'Squat'
            },{
                filter: 'Presses',
                title: 'Press'
            },{
                filter: 'Pull',
                title: 'Pulls'
            },{
                filter: 'Misc',
                title: 'Misc'
            }],
            movementList: [{
                id: "Back-Squat",
                family: "Squats"
            }, {
                id: "Front-Squat",
                family: "Squats"
            }, {
                id: "Overhead-Squat",
                family: "Squats"
            }, {
                id: "Lunge",
                family: "Squats"
            }, {
                id: "Overhead-Lunge",
                family: "Squats"
            }, {
                id: "Press",
                family: "Presses"
            }, {
                id: "Push-Press",
                family: "Presses"
            }, {
                id: "Thruster",
                family: "Presses"
            }, {
                id: "Jerk",
                family: "Presses"
            }, {
                id: "Push-Jerk",
                family: "Presses"
            }, {
                id: "Clean-Jerk",
                family: "Presses"
            }, {
                id: "Deadlift",
                family: "Pulls"
            }, {
                id: "Clean",
                family: "Pulls"
            }, {
                id: "Power-Clean",
                family: "Pulls"
            }, {
                id: "Hang-Clean",
                family: "Pulls"
            }, {
                id: "Hang-Power-Clean",
                family: "Pulls"
            }, {
                id: "Snatch",
                family: "Pulls"
            }, {
                id: "Power-Snatch",
                family: "Pulls"
            }, {
                id: "Hang-Snatch",
                family: "Pulls"
            }, {
                id: "Hang-Power-Snatch",
                family: "Pulls"
            }, {
                id: "Bench-Press",
                family: "Misc"
            }, {
                id: "Barbell-Row",
                family: "Misc"
            }],
            movements: {
                "Back-Squat": {
                    name: "Back Squat",
                    id: "Back-Squat",
                    family: "Squats",
                    units: "lbs",
                    convert: [{
                        name: "Front Squat",
                        id: "Front-Squat",
                        multiplier: 85
                    }, {
                        name: "Overhead Squat",
                        id: "Overhead-Squat",
                        multiplier: 65
                    }, {
                        name: "Lunge",
                        id: "Lunge",
                        multiplier: 55
                    }, {
                        name: "Overhead Lunge",
                        id: "Overhead-Lunge",
                        multiplier: 45
                    }]
                },
                "Front-Squat": {
                    name: "Front Squat",
                    id: "Front-Squat",
                    family: "Squats",
                    units: "lbs",
                    convert: [{ //118,100,76,64,53
                        name: "Back Squat",
                        id: "Back-Squat",
                        multiplier: 118
                    }, {
                        name: "Overhead Squat",
                        id: "Overhead-Squat",
                        multiplier: 76
                    }, {
                        name: "Lunge",
                        id: "Lunge",
                        multiplier: 64
                    }, {
                        name: "Overhead Lunge",
                        id: "Overhead-Lunge",
                        multiplier: 53
                    }]
                },
                "Overhead-Squat": {
                    name: "Overhead Squat",
                    id: "Overhead-Squat",
                    family: "Squats",
                    units: "lbs",
                    convert: [{ //154,131,100,85,69
                        name: "Back Squat",
                        id: "Back-Squat",
                        multiplier: 154
                    }, {
                        name: "Front Squat",
                        id: "Front-Squat",
                        multiplier: 131
                    }, {
                        name: "Lunge",
                        id: "Lunge",
                        multiplier: 85
                    }, {
                        name: "Overhead Lunge",
                        id: "Overhead-Lunge",
                        multiplier: 69
                    }]
                },
                "Lunge": {
                    name: "Lunge",
                    id: "Lunge",
                    family: "Squats",
                    units: "lbs",
                    convert: [{ //182,155,118,100,82
                        name: "Back Squat",
                        id: "Back-Squat",
                        multiplier: 182
                    }, {
                        name: "Front Squat",
                        id: "Front-Squat",
                        multiplier: 155
                    }, {
                        name: "Overhead Squat",
                        id: "Overhead-Squat",
                        multiplier: 118
                    }, {
                        name: "Overhead Lunge",
                        id: "Overhead-Lunge",
                        multiplier: 82
                    }]
                },
                "Overhead-Lunge": {
                    name: "Overhead Lunge",
                    id: "Overhead-Lunge",
                    family: "Squats",
                    units: "lbs",
                    convert: [{ //222,190,144,122,100
                        name: "Back Squat",
                        id: "Back-Squat",
                        multiplier: 222
                    }, {
                        name: "Front Squat",
                        id: "Front-Squat",
                        multiplier: 190
                    }, {
                        name: "Overhead Squat",
                        id: "Overhead-Squat",
                        multiplier: 144
                    }, {
                        name: "Lunge",
                        id: "Lunge",
                        multiplier: 122
                    }]
                },
                "Press": {
                    name: "Press",
                    id: "Press",
                    family: "Presses",
                    units: "lbs",
                    convert: [{ //100,130,120,140,135
                        name: "Push Press",
                        id: "Push-Press",
                        multiplier: 130
                    }, {
                        name: "Thruster",
                        id: "Thruster",
                        multiplier: 120
                    }, {
                        name: "Jerk",
                        id: "Jerk",
                        multiplier: 140
                    }, {
                        name: "Push Jerk",
                        id: "Push-Jerk",
                        multiplier: 135
                    }]
                },
                "Push-Press": {
                    name: "Push Press",
                    id: "Push-Press",
                    family: "Presses",
                    units: "lbs",
                    convert: [{ //77,100,92,108,104
                        name: "Press",
                        id: "Press",
                        multiplier: 77
                    }, {
                        name: "Thruster",
                        id: "Thruster",
                        multiplier: 92
                    }, {
                        name: "Jerk",
                        id: "Jerk",
                        multiplier: 108
                    }, {
                        name: "Push Jerk",
                        id: "Push-Jerk",
                        multiplier: 104
                    }]
                },
                "Thruster": {
                    name: "Thruster",
                    id: "Thruster",
                    family: "Presses",
                    units: "lbs",
                    convert: [{ //83,108,100,117,113
                        name: "Press",
                        id: "Press",
                        multiplier: 83
                    }, {
                        name: "Push Press",
                        id: "Push-Press",
                        multiplier: 108
                    }, {
                        name: "Jerk",
                        id: "Jerk",
                        multiplier: 117
                    }, {
                        name: "Push Jerk",
                        id: "Push-Jerk",
                        multiplier: 113
                    }]
                },
                "Jerk": {
                    name: "Jerk",
                    id: "Jerk",
                    family: "Presses",
                    units: "lbs",
                    convert: [{
                        name: "Clean and Jerk",
                        id: "Clean-Jerk",
                        multiplier: 100
                    }, { //71,93,86,100,96
                        name: "Press",
                        id: "Press",
                        multiplier: 71
                    }, {
                        name: "Push Press",
                        id: "Push-Press",
                        multiplier: 92
                    }, {
                        name: "Thruster",
                        id: "Thruster",
                        multiplier: 86
                    }, {
                        name: "Push Jerk",
                        id: "Push-Jerk",
                        multiplier: 96
                    }]
                },
                "Push-Jerk": {
                    name: "Push Jerk",
                    id: "Push-Jerk",
                    family: "Presses",
                    units: "lbs",
                    convert: [{ //74,96,89,104,100
                        name: "Press",
                        id: "Press",
                        multiplier: 74
                    }, {
                        name: "Push Press",
                        id: "Push-Press",
                        multiplier: 96
                    }, {
                        name: "Thruster",
                        id: "Thruster",
                        multiplier: 89
                    }, {
                        name: "Jerk",
                        id: "Jerk",
                        multiplier: 104
                    }]
                },
                "Clean-Jerk": {
                    name: "Clean and Jerk",
                    id: "Clean-Jerk",
                    family: "Presses",
                    units: "lbs",
                    convert: [{
                        name: "Jerk",
                        id: "Jerk",
                        multiplier: 100
                    }, {
                        name: "Press",
                        id: "Press",
                        multiplier: 71
                    }, {
                        name: "Push Press",
                        id: "Push-Press",
                        multiplier: 92
                    }, {
                        name: "Thruster",
                        id: "Thruster",
                        multiplier: 86
                    }, {
                        name: "Push Jerk",
                        id: "Push-Jerk",
                        multiplier: 96
                    }]
                },
                "Deadlift": {
                    name: "Deadlift",
                    id: "Deadlift",
                    family: "Pulls",
                    units: "lbs",
                    convert: [{ //100,55,50,50,45,45,40,40,35
                        name: "Clean",
                        id: "Clean",
                        multiplier: 55
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 50
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 50
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 45
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 45
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 40
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 40
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 35
                    }]
                },
                "Clean": {
                    name: "Clean",
                    id: "Clean",
                    family: "Pulls",
                    units: "lbs",
                    convert: [{ //182,100,91,91,82,82,73,73,64
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 182
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 91
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 91
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 82
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 82
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 73
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 73
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 64
                    }]
                },
                "Power-Clean": {
                    name: "Power Clean",
                    id: "Power-Clean",
                    family: "Pulls",
                    units: "lbs",
                    convert: [{ //200,110,100,100,90,90,80,80,70
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 200
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 110
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 100
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 90
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 90
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 80
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 80
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 70
                    }]
                },
                "Hang-Clean": {
                    name: "Hang Clean",
                    id: "Hang-Clean",
                    family: "Pulls",
                    units: "lbs",
                    convert: [{ //200,110,100,100,90,90,80,80,70
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 200
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 110
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 100
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 90
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 90
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 80
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 80
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 70
                    }]
                },
                "Hang-Power-Clean": {
                    name: "Hang Power Clean",
                    id: "Hang-Power-Clean",
                    family: "Pulls",
                    units: "lbs",
                    convert: [{ //222,122,111,111,100,100,89,89,78
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 222
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 122
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 111
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 111
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 100
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 89
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 89
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 78
                    }]
                },
                "Snatch": {
                    name: "Snatch",
                    id: "Snatch",
                    family: "Pulls",
                    units: "lbs",
                    convert: [{ //222,122,111,111,100,100,89,89,78
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 222
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 122
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 111
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 111
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 100
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 89
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 89
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 78
                    }]
                },
                "Power-Snatch": {
                    name: "Power Snatch",
                    id: "Power-Snatch",
                    family: "Pulls",
                    units: "lbs",
                    convert: [{ //250,138,125,125,113,113,100,100,88
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 250
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 138
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 125
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 125
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 113
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 113
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 100
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 88
                    }]
                },
                "Hang-Snatch": {
                    name: "Hang Snatch",
                    id: "Hang-Snatch",
                    family: "Pulls",
                    units: "lbs",
                    convert: [{ //250,138,125,125,113,113,100,100,88
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 250
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 138
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 125
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 125
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 113
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 113
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 100
                    }, {
                        name: "Hang Power Snatch",
                        id: "Hang-Power-Snatch",
                        multiplier: 88
                    }]
                },
                "Hang-Power-Snatch": {
                    name: "Hang Power Snatch",
                    id: "Hang-Power-Snatch",
                    family: "Pulls",
                    units: "lbs",
                    convert: [{ //286,157,143,143,129,129,114,114,100
                        name: "Deadlift",
                        id: "Deadlift",
                        multiplier: 286
                    }, {
                        name: "Clean",
                        id: "Clean",
                        multiplier: 157
                    }, {
                        name: "Power Clean",
                        id: "Power-Clean",
                        multiplier: 143
                    }, {
                        name: "Hang Clean",
                        id: "Hang-Clean",
                        multiplier: 143
                    }, {
                        name: "Hang Power Clean",
                        id: "Hang-Power-Clean",
                        multiplier: 129
                    }, {
                        name: "Snatch",
                        id: "Snatch",
                        multiplier: 129
                    }, {
                        name: "Power Snatch",
                        id: "Power-Snatch",
                        multiplier: 114
                    }, {
                        name: "Hang Snatch",
                        id: "Hang-Snatch",
                        multiplier: 114
                    }]
                },
                "Bench-Press": {
                    name: "Bench Press",
                    id: "Bench-Press",
                    family: "Misc",
                    units: "lbs",
                    convert: []
                },
                "Barbell-Row": {
                    name: "Barbell Row",
                    id: "Barbell-Row",
                    family: "Misc",
                    units: "lbs",
                    convert: []
                }
            },
            repOptions: [{
                name: '1',
                value: 1.0
            }, {
                name: '2',
                value: 0.94
            }, {
                name: '3',
                value: 0.91
            }, {
                name: '4',
                value: 0.88
            }, {
                name: '5',
                value: 0.86
            }, {
                name: '6',
                value: 0.83
            }, {
                name: '7',
                value: 0.82
            }, {
                name: '8',
                value: 0.78
            }, {
                name: '9',
                value: 0.77
            }, {
                name: '10-19',
                value: 0.75,
                lower: 10,
                upper: 19
            }, {
                name: '20-29',
                value: 0.7,
                lower: 20,
                upper: 29
            }, {
                name: '30-39',
                value: 0.6,
                lower: 30,
                upper: 39
            }, {
                name: '40-49',
                value: 0.5,
                lower: 40,
                upper: 49
            }, {
                name: '50-59',
                value: 0.45,
                lower: 50,
                upper: 59
            }, {
                name: '60-99',
                value: 0.4,
                lower: 60,
                upper: 99
            }, {
                name: '100+',
                value: 0.3,
                lower: 100,
                upper: 100000
            }],
            overallRepOptions: [{
                name: '1',
                value: 1.0
            }, {
                name: '2',
                value: 0.94
            }, {
                name: '3',
                value: 0.91
            }, {
                name: '4',
                value: 0.88
            }, {
                name: '5',
                value: 0.86
            }, {
                name: '6',
                value: 0.83
            }, {
                name: '7',
                value: 0.82
            }, {
                name: '8',
                value: 0.78
            }, {
                name: '9',
                value: 0.77
            }, {
                name: '10-19',
                value: 0.75,
                lower: 10,
                upper: 19
            }, {
                name: '20-29',
                value: 0.7,
                lower: 20,
                upper: 29
            }, {
                name: '30-39',
                value: 0.6,
                lower: 30,
                upper: 39
            }, {
                name: '40-49',
                value: 0.5,
                lower: 40,
                upper: 49
            }, {
                name: '50-59',
                value: 0.45,
                lower: 50,
                upper: 59
            }, {
                name: '60-99',
                value: 0.4,
                lower: 60,
                upper: 99
            }, {
                name: '100+',
                value: 0.3,
                lower: 100,
                upper: 100000
            }],
            effortOptions: [{
                name: '100%',
                value: 1
            }, {
                name: '95%',
                value: 0.95
            }, {
                name: '90%',
                value: 0.9
            }, {
                name: '85%',
                value: 0.85
            }, {
                name: '80%',
                value: 0.8
            }, {
                name: '75%',
                value: 0.75
            }, {
                name: '70%',
                value: 0.7
            }, {
                name: '65%',
                value: 0.65
            }, {
                name: '60%',
                value: 0.6
            }, {
                name: '55%',
                value: 0.55
            }, {
                name: '50%',
                value: 0.5
            }],
            girls: [{
                name: 'Diane',
                goal: 'time',
                round: [{
                    name: 'Deadlift',
                    id: 'Deadlift',
                    reps: [21, 15, 9],
                    rx: 225.0,
                    rx_units: 'lbs'
                }, {
                    name: 'Handstand Push-ups',
                    id: 'Handstand-Push-Ups',
                    reps: [21, 15, 9],
                    rx: 1.0,
                    rx_units: 'bodyweight'
                }],
                rounds: 3,
                description: ['21-15-9 reps, for time']
            }, {
                name: 'Elizabeth',
                goal: 'time',
                round: [{
                    name: 'Clean',
                    id: 'Clean',
                    reps: [21, 15, 9],
                    rx: 135.0,
                    rx_units: 'lbs'
                }, {
                    name: 'Ring Dips',
                    id: 'Ring-Dips',
                    reps: [21, 15, 9],
                    rx: 1.0,
                    rx_units: 'bodyweight'
                }],
                rounds: 3,
                description: ['21-15-9 reps, for time']
            }, {
                name: 'Fran',
                goal: 'time',
                round: [{
                    name: 'Thruster',
                    id: 'Thruster',
                    reps: [21, 15, 9],
                    rx: 95.0,
                    rx_units: 'lbs'
                }, {
                    name: 'Pull-ups',
                    id: 'Pull-Ups',
                    reps: [21, 15, 9],
                    rx: 1.0,
                    rx_units: 'bodyweight'
                }],
                rounds: 3,
                description: ['21-15-9 reps, for time']
            }, {
                name: 'Grace',
                goal: 'time',
                round: [{
                    name: 'Clean and Jerk',
                    id: 'Clean-Jerk',
                    reps: [30],
                    rx: 135.0,
                    rx_units: 'lbs'
                }],
                rounds: 1,
                description: ['30 reps, for time']
            }, {
                name: 'Isabel',
                goal: 'time',
                round: [{
                    name: 'Snatch',
                    id: 'Snatch',
                    reps: [30],
                    rx: 135.0,
                    rx_units: 'lbs'
                }],
                rounds: 1,
                description: ['30 reps, for time']
            }, {
                name: 'Linda',
                goal: 'time',
                round: [{
                    name: 'Deadlift',
                    id: 'Deadlift',
                    reps: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
                    rx: 1.5,
                    rx_units: 'bodyweight'
                }, {
                    name: 'Bench Press',
                    id: 'Bench-Press',
                    reps: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
                    rx: 1.0,
                    rx_units: 'bodyweight'
                }, {
                    name: 'Clean',
                    id: 'Clean',
                    reps: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
                    rx: 0.75,
                    rx_units: 'bodyweight'
                }],
                rounds: 10,
                description: ['10/9/8/7/6/5/4/3/2/1 rep', 'rounds for time', 'a.k.a. "3 bars of death"']
            }, {
                name: 'Nancy',
                goal: 'time',
                round: [{
                    name: 'Run',
                    id: 'run',
                    reps: [1, 1, 1, 1, 1],
                    rx: 400,
                    rx_units: 'm'
                }, {
                    name: 'Overhead Squat',
                    id: 'Overhead-Squat',
                    reps: [15, 15, 15, 15, 15],
                    rx: 95,
                    rx_units: 'lbs'
                }],
                rounds: 5,
                description: ['5 rounds for time']
            }, {
                name: 'Lynne',
                goal: 'reps',
                round: [{
                    name: 'Bench Press',
                    id: 'Bench-Press',
                    reps: [-1],
                    rx: 1.0,
                    rx_units: 'bodyweight'
                }, {
                    name: 'Pull-ups',
                    id: 'Pull-Ups',
                    reps: [-1],
                    rx: 1.0,
                    rx_units: 'bodyweight'
                }],
                rounds: 5,
                description: ['5 rounds for max reps', 'NO Time Component']
            }, {
                name: 'Amanda',
                goal: 'time',
                round: [{
                    name: 'Muscle-ups',
                    id: 'Muscle-Ups',
                    reps: [9, 7, 5],
                    rx: 1.0,
                    rx_units: 'bodyweight'
                }, {
                    name: 'Snatch',
                    id: 'Snatch',
                    reps: [9, 7, 5],
                    rx: 135,
                    rx_units: 'lbs'
                }],
                rounds: 3,
                description: ['For Time']
            }]
        });
})();
