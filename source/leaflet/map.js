/* global L */

// Advanced layer control
// Based on GroupedLayers by Ishmael Smyrnow, thanks for your work, made my life much easier!
L.Control.AdvancedLayers = L.Control.extend({

    options: {
        collapsed: true,
        position: 'topright',
        autoZIndex: true,
        groupCheckboxes: true
        //exclusiveGroups: [],
    },

    initialize: function (groupedOverlays, options) {
        var i, j;
        L.Util.setOptions(this, options);

        this._layers = [];
        this._lastZIndex = 0;
        this._handlingClick = false;
        this._domGroups = [];

        for (i in groupedOverlays) {
            for (j in groupedOverlays[i].layers) {
                this._addLayer(groupedOverlays[i].layers[j], groupedOverlays[i], true);
            }
        }
    },

    onAdd: function (map) {
        this._initLayout();
        this._update();

        map
            .on('layeradd', this._onLayerChange, this)
            .on('layerremove', this._onLayerChange, this);

        return this._container;
    },

    onRemove: function (map) {
        map
            .off('layeradd', this._onLayerChange, this)
            .off('layerremove', this._onLayerChange, this);
    },

    addOverlay: function (layer, name, group) {
        this._addLayer(layer, group, true);
        this._update();
        return this;
    },

    removeLayer: function (layer) {
        var id = L.Util.stamp(layer);
        var _layer = this._getLayer(id);
        if (_layer) {
            delete this._layers[this._layers.indexOf(_layer)];
        }
        this._update();
        return this;
    },

    showLayers: function (activeLayerIds) {
        // Remove all first
        this._showNone();

        // Exit if the array is short
        if (activeLayerIds.length === 0) {
            return;
        }

        // Loop through the layers and see if it's in the array given
        for (var i = 0; i < this._layers.length; i++) {
            if (this._layers[i] && activeLayerIds.includes(this._layers[i].id) && !this._map.hasLayer(this._layers[i].layer)) {
                this._map.addLayer(this._layers[i].layer);
            }
        }
    },

    getActiveLayerIds: function() {
        var activeLayerIds = [];
        for (var i = 0; i < this._layers.length; i++) {
            if (this._layers[i] && this._map.hasLayer(this._layers[i].layer)) {
                activeLayerIds.push(this._layers[i].id);
            }
        }

        return activeLayerIds;
    },

    _getLayer: function (id) {
        for (var i = 0; i < this._layers.length; i++) {
            if (this._layers[i] && L.stamp(this._layers[i].layer) === id) {
                return this._layers[i];
            }
        }
    },

    _initLayout: function () {
        var className = 'leaflet-control-layers',
            container = this._container = L.DomUtil.create('div', className);

        // Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
        container.setAttribute('aria-haspopup', true);

        if (L.Browser.touch) {
            L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
        } else {
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.on(container, 'wheel', L.DomEvent.stopPropagation);
        }

        var form = this._form = L.DomUtil.create('form', className + '-list');

        if (this.options.collapsed) {
            if (!L.Browser.android) {
                L.DomEvent
                    .on(container, 'mouseover', this._expand, this)
                    .on(container, 'mouseout', this._collapse, this);
            }
            var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
            link.href = '#';
            link.title = 'Layers';

            if (L.Browser.touch) {
                L.DomEvent
                    .on(link, 'click', L.DomEvent.stop)
                    .on(link, 'click', this._expand, this);
            } else {
                L.DomEvent.on(link, 'focus', this._expand, this);
            }

            this._map.on('click', this._collapse, this);
            // TODO keyboard accessibility
        } else {
            this._expand();
        }

        // Create a all/none link selection here
        var ctrlAll = L.DomUtil.create('a', className + '-all', form);
        ctrlAll.href = '#';
        ctrlAll.title = 'All';
        ctrlAll.innerHTML = ' All ';
        L.DomEvent.on(ctrlAll, 'click', this._showAll, this);

        var ctrlNone = L.DomUtil.create('a', className + '-none', form);
        ctrlNone.href = '#';
        ctrlNone.title = 'None';
        ctrlNone.innerHTML = ' None ';
        L.DomEvent.on(ctrlNone, 'click', this._showNone, this);

        this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

        container.appendChild(form);
    },

    _showAll: function () {
        for (var i = 0; i < this._layers.length; i++) {
            this._map.addLayer(this._layers[i].layer);
        }
    },
    _showNone: function () {
        for (var i = 0; i < this._layers.length; i++) {
            this._map.removeLayer(this._layers[i].layer);
        }
    },

    _addLayer: function (layer, group, overlay) {
        var _layer = {
            id: layer.id,
            layer: layer.layer,
            name: layer.name,
            overlay: overlay
        };
        this._layers.push(_layer);

        _layer.group = {
            name: group.name,
            id: group.id
        };

        if (this.options.autoZIndex && layer.setZIndex) {
            this._lastZIndex++;
            layer.setZIndex(this._lastZIndex);
        }
    },

    _update: function () {
        if (!this._container) {
            return;
        }

        this._overlaysList.innerHTML = '';
        this._domGroups.length = 0;

        var i, obj;

        for (var i = 0; i < this._layers.length; i++) {
            obj = this._layers[i];
            this._addItem(obj);
        }
    },

    _onLayerChange: function (e) {
        var obj = this._getLayer(L.Util.stamp(e.layer)),
            type;

        if (!obj) {
            return;
        }

        if (!this._handlingClick) {
            this._update();
        }

        if (obj.overlay) {
            type = e.type === 'layeradd' ? 'overlayadd' : 'overlayremove';
        } else {
            type = e.type === 'layeradd' ? 'baselayerchange' : null;
        }

        if (type) {
            this._map.fire(type, obj);
        }
    },

    _addItem: function (obj) {
        var label = document.createElement('label'),
            input,
            checked = this._map.hasLayer(obj.layer),
            container,
            groupRadioName;

        input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'leaflet-control-layers-selector';
        input.defaultChecked = checked;

        input.layerId = L.Util.stamp(obj.layer);
        input.groupID = obj.group.id;
        L.DomEvent.on(input, 'click', this._onInputClick, this);

        var name = document.createElement('span');
        name.innerHTML = ' ' + obj.name + ' (' + obj.layer.getLayers().length + ')';

        label.appendChild(input);
        label.appendChild(name);


        container = this._overlaysList;

        var groupContainer = this._domGroups[obj.group.id];

        // Create the group container if it doesn't exist
        if (!groupContainer) {
            groupContainer = document.createElement('div');
            groupContainer.className = 'leaflet-control-layers-group';
            groupContainer.id = 'leaflet-control-layers-group-' + obj.group.id;

            var groupLabel = document.createElement('label');
            groupLabel.className = 'leaflet-control-layers-group-label';

            if (obj.group.name !== '') {
                // ------ add a group checkbox with an _onInputClickGroup function
                if (this.options.groupCheckboxes) {
                    var groupInput = document.createElement('input');
                    groupInput.type = 'checkbox';
                    groupInput.className = 'leaflet-control-layers-group-selector';
                    groupInput.groupID = obj.group.id;
                    groupInput.legend = this;
                    groupInput.checked = true;
                    L.DomEvent.on(groupInput, 'click', this._onGroupInputClick, groupInput);
                    groupLabel.appendChild(groupInput);
                }
            }

            var groupName = document.createElement('span');
            groupName.className = 'leaflet-control-layers-group-name';
            groupName.innerHTML = obj.group.name;
            groupLabel.appendChild(groupName);

            groupContainer.appendChild(groupLabel);
            container.appendChild(groupContainer);

            this._domGroups[obj.group.id] = groupContainer;
        }

        container = groupContainer;

        container.appendChild(label);

        return label;
    },

    _onGroupInputClick: function () {
        var i, input, obj;

        var this_legend = this.legend;
        this_legend._handlingClick = true;

        var inputs = this_legend._form.getElementsByTagName('input');
        var inputsLen = inputs.length;

        for (i = 0; i < inputsLen; i++) {
            input = inputs[i];
            if (input.groupID === this.groupID && input.className === 'leaflet-control-layers-selector') {
                input.checked = this.checked;
                obj = this_legend._getLayer(input.layerId);
                if (input.checked && !this_legend._map.hasLayer(obj.layer)) {
                    this_legend._map.addLayer(obj.layer);
                } else if (!input.checked && this_legend._map.hasLayer(obj.layer)) {
                    this_legend._map.removeLayer(obj.layer);
                }
            }
        }

        this_legend._handlingClick = false;
    },

    _onInputClick: function () {
        var i, input, obj,
            inputs = this._form.getElementsByTagName('input'),
            inputsLen = inputs.length;

        this._handlingClick = true;

        for (i = 0; i < inputsLen; i++) {
            input = inputs[i];
            if (input.className === 'leaflet-control-layers-selector') {
                obj = this._getLayer(input.layerId);

                if (input.checked && !this._map.hasLayer(obj.layer)) {
                    this._map.addLayer(obj.layer);
                } else if (!input.checked && this._map.hasLayer(obj.layer)) {
                    this._map.removeLayer(obj.layer);
                }
            }
        }

        this._handlingClick = false;
    },

    _expand: function () {
        L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');

        // permits to have a scrollbar if overlays taller than the map.
        var acceptableHeight = this._map._size.y - (this._container.offsetTop * 4);
        if (acceptableHeight < this._form.clientHeight) {
            L.DomUtil.addClass(this._form, 'leaflet-control-layers-scrollbar');
            this._form.style.height = acceptableHeight + 'px';
        }
    },

    _collapse: function () {
        this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
    },

    _indexOf: function (arr, obj) {
        for (var i = 0, j = arr.length; i < j; i++) {
            if (arr[i] === obj) {
                return i;
            }
        }
        return -1;
    }
});

L.control.advancedLayers = function (groupedOverlays, options) {
    return new L.Control.AdvancedLayers(groupedOverlays, options);
};