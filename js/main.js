// jshint esversion: 6
$(function() {
    $('.fa-power-off').click(function(e) {
        e.preventDefault();
        $(this).toggleClass('on');
    });

    //create a synth and connect it to the master output (your speakers)
    var synth = new Tone.Synth().toMaster();

    // var thisObj;
    $('.btns')
        .mousedown(function(e) {
            if (power.state === 1 || user.turn === 1) {
                $(this).addClass('on');
                switch (e.target.id) {
                    case 'btn-1':
                        //play a middle 'C' for the duration of an 8th note
                        synth.triggerAttackRelease("C4", "8n");
                        break;
                    case 'btn-2':
                        synth.triggerAttackRelease("E4", "8n");
                        break;
                    case 'btn-4':
                        synth.triggerAttackRelease("G4", "8n");
                        break;
                    case 'btn-3':
                        synth.triggerAttackRelease("C5", "8n");
                        break;
                    default:
                }
            }
        })
        .mouseup(function(e) {
            $(this).removeClass('on');

            if (e.originalEvent === undefined) {
                // trigger from computer
            }
            // click from user
            else {
                // record user input
                var temp = e.target.id.split('');
                user.record.push(temp[temp.length - 1]);

                // check if the click is true(1)
                if (user.check()) {
                    // check if need to wait more click

                    return true;
                }
                // or false(0)
                else {
                    // false signal
                    user.fail();
                    // game restart
                    setTimeout(function () {
                        game.end();
                    }, 500)
                    setTimeout(function () {
                        game.start();
                    }, 2000)
                }
            }
            e.stopPropagation();
        });

    var power = {
        state: 0,
        on: function() {
            this.state = 1;
            game.start();
        },
        off: function() {
            this.state = 0;
            game.end();
        }
    };

    var watchButtons = (function() {
        // create an power instance
        var powerSwitch = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Operate callback here...
                // power on.
                if (mutation.target.className.indexOf(' on') != -1) {
                    console.log('power on');
                    power.on();
                } else {
                    // power off
                    console.log('power off');
                    power.off();
                }
            });
        });

        // configure power:
        var config = {
            attributes: true,
            childList: true,
            characterData: true
        };

        // pass in the target node, as well as the power options
        powerSwitch.observe($('#power')[0], config);
    })();



    var game = {
        mission: [],
        missionCreate: function() {
            this.mission = [];

            for (var i = 0; i < 10; i++) {
                this.mission.push(number());
            }

            function number() {
                return Math.floor(Math.random() * 4) + 1; //The maximum is exclusive and the minimum is inclusive
            }
        },
        round: null,
        start: function() {
            this.missionCreate();
            this.round = 1;
            //  play during 600ms
            this.startSignal();
            // round board up after startSignal
            (function (that) {
                setTimeout(function () {
                    that.roundBoardUp();
                }, 1000);
            })(this);
            // com.play();
            setTimeout(function () {
                com.play();
            }, 1500);
        },
        end: function () {
            this.round= null;
            this.roundBoardUp();
            user.record = [];
            this.endSignal();
        },
        roundBoardUp: function () {
            var n = this.round ? this.round.toString() : '0';
            $('.count h3').text(n.length == 1 ? '0' + n : n);
        },
        btnSignal: function () {
            // button on & off
            var interval = [0, 200, 400, 600];
            for (var k = 0; k < interval.length; k++) {
                (function(idx) {
                    setTimeout(function () {
                        $('.btns').toggleClass('on');
                    }, interval[idx]);
                })(k);
            }
        },
        startSignal: function () {
            var tab = ['c4', 'e4', 'g4', 'c5'];
            for (var i = 0; i < tab.length; i++) {
                (function(idx) {
                    // play melody
                    setTimeout(function() {
                        synth.triggerAttackRelease(tab[idx], "8n");
                    }, idx * 150);
                })(i);
            }
            this.btnSignal();
        },
        endSignal: function () {
            var tab = ['c5', 'g4', 'e4', 'c4'];
            for (var i = 0; i < tab.length; i++) {
                (function(idx) {
                    // end melody
                    setTimeout(function() {
                        synth.triggerAttackRelease(tab[idx], "8n");
                    }, idx * 150);
                })(i);
            }
            this.btnSignal();
        },
        falseSignal: function () {
            var tab = ['c6', 'c6'];
            for (var i = 0; i < tab.length; i++) {
                (function (idx) {
                    setTimeout(function () {
                        synth.triggerAttackRelease(tab[idx], "8n");
                    }, idx * 150);
                })(i);
            }
            this.btnSignal();
        },
        finishSignal: function () {
            var tab = ['c5', 'c5', 'c5', 'c5', 'd5', 'c5', 'd5', 'e5', 'e5', 'e5', 'e5'];
            for (var i = 0; i < tab.length; i++) {
                (function (idx) {
                    setTimeout(function () {
                        synth.triggerAttackRelease(tab[idx], "8n");
                    }, idx * 150);
                })(i);
            }
            this.btnSignal();
        }
    };

    var com = {
        play: function() {
            for (var i = 0; i < game.round; i++) {
                (function(idx) {
                    var target = '#btn-' + game.mission[idx];
                    // configure mousedown moment
                    setTimeout(function() {
                        $(target).trigger('mousedown');
                    }, idx * 800);
                    // configure mouseup moment
                    setTimeout(function() {
                        $(target).trigger('mouseup');
                        if (idx + 1 === game.round) {
                            user.turn = 1;
                        }
                    }, idx * 800 + 500);
                })(i);
            }

        }
    };

    var user = {
        turn: 0,
        record: [],
        check: function() {
            var idx = this.record.length - 1,
                val = this.record[idx];
            // match
            if (val == game.mission[idx]) {
                // check if the click is the last of this round
                if (game.round == user.record.length) {
                    // check if the click is the last of all rounds
                    // game finish
                    if (game.round == game.mission.length) {
                        game.finishSignal();
                    }
                    // round sucess
                    else {
                        this.success();
                    }
                }
                return true;
            }
            // unmatch
            else {
                this.fail();
                return false;
            }

        },
        fail: function() {
            game.falseSignal();
        },
        success: function () {
            // count up round
            game.round++;
            // init user record
            this.record = [];
            // Plus one on score(round) board
            game.roundBoardUp();
            // play com
            setTimeout(function () {
                com.play();
            }, 1000);

        }
    };

});
