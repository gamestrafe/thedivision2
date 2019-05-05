/* global L */

// Division 2 clock
L.Control.Division2Clock = L.Control.extend({
    options: {
        position: 'bottomleft',
        autoZIndex: true,
    },

    onAdd: function (map) {
        this._initLayout();
        return this._container;
    },

    _initLayout: function () {
        var className = 'leaflet-control-division2clock',
            classNameDisplay = className + '-display',
            container = this._container = L.DomUtil.create('div', className);

        var display = L.DomUtil.create('div', classNameDisplay, container);
        display.id = 'division2clock';
        display.innerHTML = '00:00';

        var addHour = L.DomUtil.create('a', className + '-hour', container);
        addHour.href = '';
        addHour.title = 'Add Hour';
        addHour.innerHTML = ' Add Hour ';
        L.DomEvent.on(addHour, 'click', this._addHour, this);

        var addMinute = L.DomUtil.create('a', className + '-minute', container);
        addMinute.href = '';
        addMinute.title = 'Add Minute';
        addMinute.innerHTML = ' Add Minute ';
        L.DomEvent.on(addMinute, 'click', this._addMinute, this);

        var test = 0;
        var hours    = new Date().getHours();
        var minutes  = new Date().getMinutes();
        var seconds  = new Date().getSeconds();
        var time = {h: hours, m: minutes, s: seconds};

        // Start the clock
        setInterval(drawClock, 1000);

        function drawClock() {
            time.s = time.s + 1;

            if (time.s > 5) {
                time.s = 0;
                time.m = time.m +1;
            }
            if (time.m > 59) {
                time.m = 0;
                time.h = time.h +1;
            }
            if (time.h > 23) {
                time.h = 0;
            }

            var outTime = ( time.h < 10 ? '0' : '' ) + time.h + ':' + ( time.m < 10 ? '0' : '' ) + time.m;


            document.getElementById('division2clock').innerHTML = outTime;
        }
        //container.appendChild(form);
    },

    _addHour: function () {

    },
    _addMinute: function () {

    }
});
