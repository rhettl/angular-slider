(function($){

    $.fn.iSlider = function(opt){
        var defaults = {
            type: 'range',
            sType: {
                range: false,
                scale: false
            },
            name: "",
            scale: [0, 100],
            values: false,
            rangeMarkers: false,
            roundTo: 0,
            fromName: "from",
            toName: "to",
            leftClass: "arrow-left",
            rightClass: "arrow-right",
            leftInputClass: "",
            rightInputClass: "",
            bodyClass: "main-slider",
            animate: true
        };

        if (opt === 'update'){
            options = this.data('options');
            if (options.sType.range){
                this.find('input').first().trigger('keyup');
            } else if (options.sType.scale){
                i0 = options.scale.indexOf(this.find('input').first().val());
                i1 = options.scale.indexOf(this.find('input').last().val()) + 1;

                this.data('slider').slider('values', [i0, i1]);
            }
            return;
        } else if (opt === 'hide'){
            this.data('slider', null);
            this.empty();
            return;
        } else if (opt === 'reshow'){
            var options = this.data('options');
        } else if (opt === 'hasData'){
            return this.data('options');
        } else if (opt === 'destroy'){
            this.data('options', null);
            this.data('slider', null);
            this.empty();
            return;
        } else {
            var options = $.extend(defaults, opt);
            options.sType[options.type] = true;
            this.data('options', options);
        }

        getPointerValue = function(value, rangeMarkers, scale){
            if( rangeMarkers && rangeMarkers.length > 0) {
                h = rangeMarkers;

                _startPerc = 0;
                _fromVal = scale[0];

                for (i = 0; i <= h.length; i++) {
                    if (h[i])   v = h[i].split("/");
                    else        v = [100, scale[1]];
                    v[0] = new Number(v[0]); v[1] = new Number(v[1]);

                    if (value >= _startPerc && value <= v[0]) {
                        return (value - _startPerc) / (v[0] - _startPerc) * (v[1] - _fromVal) + _fromVal;
                    }

                    _startPerc = v[0]; _fromVal = v[1];
                }
                ;

            } else {
                return (value / 100) * (scale[1] - scale[0]) + scale[0];
            }
        };
        getLocForPointer = function (value, rangeMarkers, scale){
            if( rangeMarkers && rangeMarkers.length > 0) {
                h = rangeMarkers;

                _startPerc = 0;
                _fromVal = opt.scale[0];

                for (var i = 0; i <= h.length; i++) {
                    if (h[i])   v = h[i].split("/");
                    else        v = [100, scale[1]];
                    v[0] = new Number(v[0]); v[1] = new Number(v[1]);

                    if (value >= _fromVal && value <= v[1]) {
                        return (((value - _fromVal) * (v[0] - _startPerc)) / (v[1] - _fromVal)) + _startPerc;
                    }

                    _startPerc = v[0]; _fromVal = v[1];
                }
                ;

            } else {
                return ((value - scale[0]) / (scale[1] - scale[0])) * 100;
            }
        };

        updateLiClasses = function (ui, sliderParent){
            li = sliderParent.find('li');
            li.addClass('active');
            li.eq(ui.values[0]).prevAll().removeClass('active');
            li.eq(ui.values[1]-1).nextAll().removeClass('active');
        },



            //init elements//
            this.addClass('slider scale').append('<div class="'+options.bodyClass+'" style="width:100%"></div>');

        if (options.sType.range){
            this.append('<input type="text" style="width: 50%" class="from" name="'+options.fromName+'" value="'+(options.values ? options.values[0] : options.scale[0]).toFixed(options.roundTo)+'" />')
                .append('<input type="text" style="width: 50%" class="to" name="'+options.toName+'" value="'+(options.values ? options.values[1] : options.scale[1]).toFixed(options.roundTo)+'" />');

        } else if (options.sType.scale){
            this.append('<ul class="scale"></ul>')
                .append('<input type="hidden" class="from '+options.leftInputClass+'" name="'+options.fromName+'" value="'+options.scale[0]+'" />')
                .append('<input type="hidden" class="to '+options.rightInputClass+'" name="'+options.toName+'" value="'+options.scale[(options.scale.length - 1)]+'" />');

        }

        if (options.name != ""){
            this.prepend('<h3>'+options.name+'</h3>');
        }

        //slider
        this.data('slider', this.find('.'+options.bodyClass).slider({
            range: true,
            min: 0.0,
            max: options.sType.range ? 100.0 : options.scale.length,
            step: options.sType.range ? 0.1 : 1,
            values: options.sType.range ? (options.values ? [getLocForPointer(options.values[0], options.rangeMarkers, options.scale), getLocForPointer(options.values[1], options.rangeMarkers, options.scale)] : [0, 100]) : [ 0, options.scale.length ],
            animate: options.animate,
            slide: function(e, ui){
                $this = $(this);
                sliderParent = $this.closest('.slider');
                opt = sliderParent.data('options');

                if (opt.sType.range){
                    inputs = $this.closest('.slider').find('input[type="text"]');

                    inputs.first().val(getPointerValue(ui.values[0], opt.rangeMarkers, opt.scale).toFixed(opt.roundTo));
                    inputs.last().val(getPointerValue(ui.values[1], opt.rangeMarkers, opt.scale).toFixed(opt.roundTo));
                } else if (opt.sType.scale){
                    if (ui.values[0] == ui.values[1]) return false;

                    inputs = sliderParent.find('input');
                    inputs.filter('.from').val(opt.scale[ui.values[0]]);
                    inputs.filter('.to').val(opt.scale[ui.values[1] - 1]);

                    updateLiClasses(ui, sliderParent);
                }
            },
            change: function (e, ui){
                $this = $(this);
                sliderParent = $this.closest('.slider');
                opt = sliderParent.data('options');

                if (!opt.sType.scale) return;

                updateLiClasses(ui, sliderParent);
                //$(this).trigger('change');
            },
            stop: function(){
                $(this).trigger('change');
            }
        }));

        $('ui-slider-handle', this).first().addClass(options.leftClass);
        $('ui-slider-handle', this).last().addClass(options.rightClass);

        if (typeof options.height == 'number'){
            this.find('.'+options.bodyClass).height(options.height);

            dragables = this.find('.'+options.bodyClass + ' a.ui-slider-handle');
            dragables.css('top', (options.height - dragables.height()) / 2);
            dragables.last().addClass(opt.rightClass);
            dragables.first().addClass(opt.leftClass);
        }

        if (options.sType.scale){
            pWidth = this.width();
            scaleUL = this.find('ul');
            $.each(opt.scale, function (i, item){
                li = $('<li>'+item+'</li>').data('index', i).addClass('active').css('width', (Math.floor((((pWidth-1)/options.scale.length) - 1) * 100)/100).toFixed(2));
                scaleUL.append(li);
            });
            scaleUL.on('click', 'li', function(e){
                $this = $(this);
                //console.log(this, $this)
                sliderParent = $this.closest('.slider');
                distance = null;
                closestHandle = null;
                dragables = sliderParent.find('a.ui-slider-handle');
                slider = sliderParent.data('slider');


                dragables.each(function (i){
                    offset = (i == 1 ? 1 : 0);
                    thisDistance = Math.abs( $this.data('index') - slider.slider('values', i));

                    if(distance === null || distance >= thisDistance){
                        distance = thisDistance;
                        closestHandle = i;
                    }
                });

                if (closestHandle == 1){
                    slider.slider('values', closestHandle, $this.data('index')+1);
                } else {
                    slider.slider('values', closestHandle, $this.data('index'));
                }

                opt = sliderParent.data('options');
                inputs = sliderParent.find('input');
                //console.log(opt.scale, slider.slider('values', 1)-1, opt.scale[slider.slider('values', 1)-1], inputs);
                inputs.filter('.from').val(opt.scale[slider.slider('values', 0)]);
                inputs.filter('.to').val(opt.scale[slider.slider('values', 1)-1]);

                inputs.first().trigger('change');
            });
        } else if (options.sType.range){
            this.on('keyup', 'input[type="text"]', function () {
                sliderParent = $(this).closest('.slider');
                inputs = sliderParent.find('input[type="text"]');

                slider = sliderParent.data('slider');
                scale = sliderParent.data('options').scale;
                rangeMarkers = sliderParent.data('options').rangeMarkers;

                lower = getLocForPointer(inputs.first().val(), rangeMarkers, scale);
                upper = getLocForPointer(inputs.last().val(), rangeMarkers, scale);

                if (lower > upper){
                    temp = lower;
                    lower = upper;
                    upper = temp;
                }

                slider.slider('values', [lower, upper]);
            });
        }
    };

    $.fn.iPaginate = function(optsOrCurrent, newTotal){
        dataStorage = 'pagination';
        newObject = true;
        defaults = {
            span: 5,
            childType: '<li></li>',
            innerWrapper: '',
            activeOn: 'self',
            activeClass: 'current',
            seperator: '',
            currentPage: 1,
            totalPages: 1,
            nextPrev: true,
            firstLast: true,
            first: '|<<',
            prev: '<',
            next: '>',
            last: '>>|',
            bodyClass: 'pagination',
            click: function(event, pg_num){}
        };

        if (typeof optsOrCurrent == 'number'){
            newObject = false;

            options = this.data(dataStorage);
            options.currentPage = optsOrCurrent;
            if (newTotal)
                options.totalPages = newTotal;
        } else {
            options = $.extend(defaults, optsOrCurrent);
        }
        this.data(dataStorage, options);

        if (newObject){
            this.addClass(options.bodyClass).on('click', $(options.childType).get(0).tagName, function(e){
                $this = $(this);
                newPage = parseInt($this.attr('data-page-num'));

                //console.log(newPage, this);

                result = options.click(e, newPage);
                if (result === false)
                    return false;

                $('.'+options.bodyClass).iPaginate(newPage);
            });
        }

        //clean
        this.empty();

        //make numbers
        start = options.currentPage - options.span > 0 ? options.currentPage - options.span : 1;
        end = options.currentPage + options.span <= options.totalPages ? options.currentPage + options.span : options.totalPages;

        for(var i = start; i <= end; i++){
            child = $(options.childType).attr('data-page-num', i);
            if (options.innerWrapper == ''){
                child.html(i);
            } else {
                child.append($(options.innerWrapper).html(i));
            }
            if (i == options.currentPage) {
                if (options.activeOn == "self"){
                    child.addClass(options.activeClass);
                } else if (options.activeOn == "child"){
                    child.children(':first-child').addClass(options.activeClass);
                }

            }
            if (i != end) child.append(options.seperator);
            this.append(child);
        }

        //arrows
        if (options.nextPrev){
            next = $(options.childType).addClass('next').attr('data-page-num', options.currentPage + 1);
            prev = $(options.childType).addClass('prev').attr('data-page-num', options.currentPage - 1);

            if (options.innerWrapper == ''){
                next.html(options.next);
                prev.html(options.prev);
            } else {
                next.append($(options.innerWrapper).html(options.next));
                prev.append($(options.innerWrapper).html(options.prev));
            }

            if (options.currentPage > 1)
                this.prepend(prev);
            if (options.currentPage < options.totalPages)
                this.append(next);
        }

        //firat/last arrows
        if (options.firstLast){
            first = $(options.childType).addClass('first').attr('data-page-num', 1);
            last = $(options.childType).addClass('last').attr('data-page-num', options.totalPages);

            if (options.innerWrapper == ''){
                first.html(options.first);
                last.html(options.last);
            } else {
                first.append($(options.innerWrapper).html(options.first));
                last.append($(options.innerWrapper).html(options.last));
            }

            if (options.currentPage > 1)
                this.prepend(first);
            if (options.currentPage < options.totalPages)
                this.append(last);
        }
    };

})(jQuery);



//
//$('.price-slider').iSlider({
//    type: 'range',
//    scale: [0, 100000],
//    rangeMarkers: ['5/350', '50/3000', '75/10000'],
//    fromName: "price_total_from",
//    toName: "price_total_to"
//});