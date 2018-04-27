(function ($) {
    $.fn.briskDataTable = function(argFunction) {
        var baseFunctions = {
            init: function(settings) {    
                var defaultSettings = {
                    language: 'ar', //avaliable languages are ['ar', 'en'], default language is 'ar'
                    direction: "rtl", //['rtl', 'ltr'] and the default is table language direction
                    filters: {
                        title: "", //Comes from backend JSON by default, and you can override it here
                        classes: [],
                        enable: false, //to show filters panel
                        active: false, //to set filters as Active direct once table loaded
                        initialized: false
                    },
                    datatable: {
                        title: "", //Comes from backend JSON by default, and you can override it here
                        classes: [],
                        buttons: [],
                        refresh: {
                            enable: true, //to show/hide refresh button. The defualt is true.
                            clear: false, //to clear table results when refresh. The defualt is false. 
                            auto: {
                                active: false, //default is false
                                unit: 'seconds', //['seconds' (default), 'minutes']
                                duration: 5 //default is 1
                            }
                        },
                        order_by: {
                            column: null, //column of first GET call sort
                            method: null //method of first GET call sort
                        },
                        execution_time: true, //to show/hide the execution time of the table
                        tbody: {
                            height: '60vh'
                        },
                        current_page: 1
                    },
                    resource: {
                        api: 'http://domain-name.com',
                        entity: 'resource',
                        datatable: 'datatable-get-method' //required returned JSON format was described in the beginning of README 
                    }
                };

                var instanceSettings = $.extend(true, defaultSettings, settings);
                
                instanceSettings.language = $.fn.briskDataTable.languages[instanceSettings.language];
    
                /**
                 * START:: Refresh Methods Setup
                 */
                if(instanceSettings.datatable.refresh.enable){
                    instanceSettings.datatable.buttons.unshift({
                        data_action: "refresh",
                        classes: {
                            button: "btn btn-xs btn-warning",
                            icon: "fa fa-sync"
                        },
                        title: instanceSettings.language.buttons.refresh
                    });
                }
    
                if(instanceSettings.datatable.refresh.auto.active){
                    var interval;
    
                    if(instanceSettings.datatable.refresh.auto.unit == "seconds"){
                        interval = instanceSettings.datatable.refresh.auto.duration * 1000;
                    }else if(instanceSettings.datatable.refresh.auto.unit == "minutes"){
                        interval = instanceSettings.datatable.refresh.auto.duration * 1000 * 60;
                    }
    
                    setInterval(function(){
                        internalFunctions.get();
                    }, interval);
                }

                return this.each(function() {
                    /*
                    * You can reinitialize here if you wish
                    */

                    var $this = $(this);

                    $this.data('briskTableSettings', instanceSettings);

                            
                    /**
                     * START:: HTML Templates Appending
                     */
                    var filters_template_html = '';
                    var filters_switch_template_html = '';
                    var datatable_template_html = '';
                    var datatable_pagination_template_html = '';

                    if(instanceSettings.filters.enable){
                        /**
                         * START:: Filters template
                         */
                        if($.trim($this.find('.brisk-filters').html()) === ""){
                            filters_template_html += '<div class="brisk-filters">';
                            filters_template_html += '    <div class="panel-heading">';
                            filters_template_html += '        <span class="panel-title"></span>';
                            filters_template_html += '        <div class="panel-heading-controls">';
                            filters_template_html += '        </div>';
                            filters_template_html += '    </div>';
                            filters_template_html += '    <div class="panel-body">';
                            filters_template_html += '    </div>';
                            filters_template_html += '</div>';

                            //Inject Template HTML
                            $this.prepend($('<div />', {html: filters_template_html}).html());
                        }
                        //END
                        
                        filters_switch_template_html += '<select id="filters-status" class="form-control filters-switch">';
                        filters_switch_template_html += '  <option value="0">' + instanceSettings.language.filters_status[0] + '</option>';
                        filters_switch_template_html += '  <option value="1">' + instanceSettings.language.filters_status[1] + '</option>';
                        filters_switch_template_html += '</select>';

                        $this.find('.brisk-filters .panel-heading-controls').prepend(filters_switch_template_html);
                        $this.find('.brisk-filters').addClass('rtl');

                        if(instanceSettings.filters.active){
                            $this.find('.brisk-filters #filters-status option[value="1"]').attr('selected', true);
                        }else{
                            $this.find('.panel.panel-body').fadeOut();
                        }

                        $this.find('.brisk-filters .panel-title').html(instanceSettings.filters.title);

                        $.each(instanceSettings.filters.classes, function(key, class_title){
                            $this.find('.brisk-filters').addClass(class_title);
                        });
                        
                        //Structure Template Default Classes
                        $this.find('.brisk-filters').addClass(['panel']);
                        $this.find('.brisk-filters .panel-heading').addClass(['clearfix']);
                    }

                    /**
                     * START:: Datatable template
                     */
                    if($.trim($this.find('.brisk-datatable').html()) === ""){
                        datatable_template_html += '<div class="brisk-datatable">';
                        datatable_template_html += '    <div class="panel-heading">';
                        datatable_template_html += '        <span class="panel-title"></span>';
                        datatable_template_html += '        <div class="panel-heading-controls">';
                        datatable_template_html += '            ';
                        datatable_template_html += '        </div>';
                        datatable_template_html += '    </div>';
                        datatable_template_html += '    <div class="panel-body">';
                        datatable_template_html += '        <table>';
                        datatable_template_html += '            <thead></thead>';
                        datatable_template_html += '            <tbody></tbody>';
                        datatable_template_html += '        </table>';
                        datatable_template_html += '    </div>';
                        datatable_template_html += '</div>';

                        //Inject Template HTML
                        $(datatable_template_html).appendTo(this);
                    }
                    //END
                        
                    datatable_pagination_template_html = '<ul class="pagination pagination-xs numeric hidden"></ul>';

                    $this.find('.brisk-datatable .panel-heading-controls').prepend(datatable_pagination_template_html);
                    $this.find('.brisk-datatable').addClass(instanceSettings.direction);
                    $this.find('.brisk-datatable tbody').css({'height': instanceSettings.datatable.tbody.height});
                    $this.find('.brisk-datatable .panel-title').html(instanceSettings.language.datatable.title);

                    $.each(instanceSettings.datatable.buttons, function(key, button){
                        $this.find('.brisk-datatable .panel-heading-controls').prepend('<button class="' + button.classes.button + '" data-action="' + button.data_action + '"><span class="' + button.classes.icon + '"></span>&nbsp;&nbsp;' + button.title + '</button>');
                    });

                    $.each(instanceSettings.datatable.classes, function(key, class_title){
                        $this.find('.brisk-datatable').addClass(class_title);
                    });
                    
                    //Structure Template Default Classes
                    $this.find('.brisk-datatable').addClass(['panel']);
                    $this.find('.brisk-datatable table').addClass(['table', 'table-striped', 'table-hover']);
                    //END:: HTML Templates Appending
                    
                    var $filterElement = $this.find('.brisk-filters');
                    var $datatableElement = $this.find('.brisk-datatable');

                    /**
                     * START:: Events Init.
                     */
                    $datatableElement.find('button[data-action="refresh"]').on("click.internalFunctions", function(){
                        internalFunctions.get.call($this[0]);
                    });

                    $datatableElement.on('click.internalFunctions', 'ul.pagination a[data-page-id]', function(){
                        internalFunctions.datatable.current_page = $this.attr('data-page-id');
                        internalFunctions.get.call($this[0]);
                    });
                    
                    $datatableElement.on('click.internalFunctions', 'table thead tr th[data-sort]', function(){
                        internalFunctions.orderBy($this.data('sort'));
                        internalFunctions.get.call($this[0]);
                    }); 
                    
                    $filterElement.on('change.internalFunctions', '#filters-status', function(){
                        internalFunctions.filters.active = Number($this.val());

                        if(internalFunctions.filters.active){
                            internalFunctions.filters.element.find('.panel-body').fadeIn();
                        }else{
                            internalFunctions.filters.element.find('.panel-body').fadeOut();
                            internalFunctions.get.call($this[0]);
                        }
                    }); 

                    $filterElement.on('change.internalFunctions', '.panel-body input, .panel-body select', function(){
                        internalFunctions.get.call($this[0]);
                    }); 

                    $filterElement.on('keypress.internalFunctions', '.panel-body input', function(event){
                        var keycode = (event.keyCode ? event.keyCode : event.which);

                        if(keycode == '13'){
                            internalFunctions.get.call($this[0]);
                        }           
                    }); 
                    //END:: Events Init.

                    internalFunctions.get.call(this);
                });

                //END:: Refresh Methods Setup
    
                /**
                 * START:: Overridden Methods Setup
                 */

                /*if(typeof instanceSettings.datatable.row_format == "function"){
                    this.row_format = instanceSettings.datatable.row_format;
                }
    
                if(typeof instanceSettings.datatable.row_reformat == "function"){
                    this.row_reformat = instanceSettings.datatable.row_reformat;
                }*/
                //END:: Overridden Methods Setup
            },
            refresh: function() {
                return this.each(function() {
                    internalFunctions.get.call(this);
                });
            }
        };

        var internalFunctions = {
            get : function() {
                var $this = $(this);
                
                var internalSettings = $this.data('briskTableSettings');

                internalFunctions.loading.call(this);

                var URL = internalSettings.resource.api + "/" + internalSettings.resource.entity + "/" + internalSettings.resource.datatable;

                URL += "?page=" + internalSettings.datatable.current_page;

                if(internalSettings.datatable.order_by.column !== null){
                    URL += "&order_by_column=" + internalSettings.datatable.order_by.column;
                }
                if(internalSettings.datatable.order_by.method !== null){
                    URL += "&order_by_method=" + internalSettings.datatable.order_by.method;
                }
                
                if(internalSettings.filters.enable){
                    URL += "&filters_status=" + internalSettings.filters.active;

                    if(internalSettings.filters.active){
                        internalSettings.filters.element.find('[name]').each(function() {
                            URL += "&" + $(this).attr('name') + "=" + $(this).val();
                        }); 
                    }
                }
            
                $.get(URL,
                function(response, status){
                    internalFunctions.setFilters.call($this[0], response.filters);
                    internalFunctions.setColumns.call($this[0], response.columns);
                    internalFunctions.setPagination.call($this[0], response.current_page, response.last_page);
                    internalFunctions.setTitles.call($this[0], response);
                    
                    $this.find('.brisk-datatable table tbody').html("");
            
                    $.each(response.data, function(key, record) {
                        var row = "";
                        row = internalFunctions.rows_reformat.call($this[0], response.columns, key, record);
                        row = internalFunctions.row_reformat.call($this[0], $(row), key, record);
                        $this.find('.brisk-datatable table tbody').append(row);
                    }); 
            
                    internalFunctions.setFooter.call($this[0], response.total, response.footer);
                })
                .fail(function() {
                    setTimeout(function(){
                        internalFunctions.get.call($this[0]);
                    }, 1000);
                });
            },
            setFilters: function(filters) {                
                var internalSettings = $(this).data('briskTableSettings');

                if(!internalSettings.filters.enable){
                    return;
                }

                if(internalSettings.filters.initialized){
                    return;
                }

                internalSettings.filters.initialized = true;

                /**
                 * START:: Filters Appending
                 */
                $.each(filters, function(key, filter) {
                    var filter_default_classes = ['form-control'];
                    var html = '';
                    html += '<div class="col-sm-2">';
                    html += '   <label class="input-group">' + filter.title + '</label>';

                    html += '   <' + filter.type;
                    html += '       name="' + filter.name + '" ';

                    /**
                     * START:: Classes Init.
                     */
                    if(filter.classes.length > 0){
                        $.each(filter.classes, function(filter_key, filter_class){
                            filter_default_classes.push(filter_class);
                        });
                    }

                    if(filter.date){
                        filter_default_classes.push('text-center');
                        filter_default_classes.push('masked-input-date');
                    }

                    html += ' class="';
                    $.each(filter_default_classes, function(filter_key, filter_class){
                        html += filter_class + ' ';
                    });
                    html += '" ';
                    //END:: Classes Init.

                    html += ' placeholder="' + filter.placeholder + '"';

                    if(filter.data !== undefined){
                        $.each(filter.data, function(key, attribute){
                            html += ' data-' + key + '="' + attribute + '"';
                        });
                    }

                    if(filter.type === "select"){
                        html += '   >';
                        html += '   </' + filter.type + '>';
                    }else{
                        html += '   />';
                    }
                    html += '</div>';

                    $(this).find('.brisk-filters .panel-body').append(html);
                });
                //END:: Filters Appending

                /**
                 * START:: Filters Init.
                 */
                if(typeof GLOBALS !== 'undefined' && GLOBALS.lists !== undefined){
                    $.each(filters, function(key, filter) {
                        if(filter.data !== undefined && filter.data.options_source !== undefined && $.trim(filter.data.options_source) !== ""){
                            GLOBALS.lists[filter.data.options_source].get();
                        }
                    });
                }
                $(this).find('.brisk-filters .masked-input-date').mask("0000/00/00", {placeholder: "__/__/____"});
                //END:: Filters Init.
            },
            setColumns: function(columns) {                
                var internalSettings = $(this).data('briskTableSettings');

                var datatable = internalSettings.datatable;
                var html = "<tr>";
                
                $.each(columns, function(key, column) {
                    html += "<th";
        
                    if(column.sortable){
                        html += " data-sort='" + column.column + "'";
                    }
        
                    html += ">";
        
                    if(column.sortable){
                        if(datatable.order_by.column == column.column){
                            if(datatable.order_by.method == "ASC"){
                                if(brisk.language.code === "en"){
                                    html += "<i class='fa fa-angle-down pull-right'></i>";                
                                }else{
                                    html += "<i class='fa fa-angle-down'></i>"; 
                                }
                            }else{
                                if(brisk.language.code === "en"){
                                    html += "<i class='fa fa-angle-up pull-right'></i>";
                                }else{
                                    html += "<i class='fa fa-angle-up'></i>";
                                }                
                            }
                        }    
                    }
                        
                    html += column.title + "</th>";
                });
                
                html += "</tr>";

                $(this).find('.brisk-datatable table thead').html(html);
            },
            setPagination: function(current_page, last_page) {
                var internalSettings = $(this).data('briskTableSettings');

                var html = "";
                html =  '<li title="الصفحة الأولى"><a data-page-id="1">«</a></li>';
            
                if(current_page !== 1){
                    html += '<li><a data-page-id="' + (current_page - 1) + '">' + (current_page - 1) + '</a></li>';
                }
            
                html += '<li class="active"><a data-page-id="' + current_page + '">' + current_page + '</a></li>';
            
                if(current_page !== last_page && last_page !== 0){
                    html += '<li><a data-page-id="' + (current_page + 1) + '">' + (current_page + 1) + '</a></li>';
                }
            
                html += '<li title="الصفحة الأخيرة"><a data-page-id="' + last_page + '">»</a></li>';
            
                $(this).find('.brisk-datatable ul.pagination').html(html).removeClass("hidden");
            },
            setTitles: function(response) {
                var internalSettings = $(this).data('briskTableSettings');

                //filters panel title
                if($.trim(internalSettings.filters.title) == ""){
                    var filters_title;

                    if(internalSettings.filters.title !== ""){
                        filters_title = internalSettings.filters.title;
                    }else if($.trim(response.filters_title) !== ""){
                        filters_title = response.filters_title;
                    }else{
                        filters_title = internalSettings.language.filters.title;
                    }

                    // internalSettings.filters.element.find('.panel-title').html(filters_title);
                    $(this).find('.brisk-filters .panel-title').html(response.table_title);
                }
                //table panel title
                if($.trim(internalSettings.datatable.title) == ""){
                    var table_title;

                    if(internalSettings.datatable.title !== ""){
                        table_title = internalSettings.datatable.title;
                    }else if($.trim(response.table_title) !== ""){
                        table_title = response.table_title;
                    }else{
                        table_title = internalSettings.language.datatable.title;
                    }

                    // internalSettings.datatable.element.find('.panel-title').html(response.table_title);
                    $(this).find('.brisk-datatable .panel-title').html(response.table_title);
                }
            },
            rows_reformat: function(columns, key, record) {
                var internalSettings = $(this).data('briskTableSettings');

                var row = ""; 

                row += "<tr>";

                $.each(columns, function(column_key, column){
                    if(record[column.column] == null){
                        row += "    <td data-column='" + column.column + "'>-</td>"; 
                    }else{
                        row += "    <td data-column='" + column.column + "'";
                        if(column.numeric){
                            row += " class='numeric'"
                        }
                        row += ">";
                        row += record[column.column] + "</td>"; 
                    }
                });

                row += "</tr>"; 

                return row;
            },
            row_reformat: function(row, key, record) {     
                var internalSettings = $(this).data('briskTableSettings');

                /**
                 * Can be used to reformat row HTML from outside the class
                 * by overriding it
                 */

                return row;
            },
            setFooter: function(total, footer) {
                var internalSettings = $(this).data('briskTableSettings');

                var row = "";
        
                if(!total){
                    row = "<tr>";
                    row += "    <td class='rows-alternative' colspan='100'>" + internalSettings.language.results.not_found + "</td>";
                    row += "</tr>";
                }else{
                    row = "<tr class='footer'>";
                    row += "    <td colspan='100'>";
                    row += "        " + internalSettings.language.results.found[0] + " <span class='numeric'>" + total + "</span> " + internalSettings.language.results.found[1] + ".";
                    row += "        <span class='info'>";
                    
                    if(footer.info !== undefined){
                        row += footer.info;
                    }
        
                    if(internalSettings.datatable.execution_time){
                        row += "            " + internalSettings.language.execution_time[0] + ": <span class='numeric'>" + footer.execution_time + "</span> " + internalSettings.language.execution_time[1];
                    }
        
                    row += "        </span>";
                    row += "    </td>";
                    row += "</tr>";
                }

                $(this).find('.brisk-datatable table tbody').append(row);
            },
            loading: function() {
                var internalSettings = $(this).data('briskTableSettings');

                var row = "";
        
                if(!internalSettings.datatable.refresh.clear){
                    row += internalSettings.language.results.refresh;
        
                    $(this).find('.brisk-datatable table tbody tr.footer span.info').html(row);
                }else{
                    $(this).find('.brisk-datatable table tbody').html("");
                    
                    row = "<tr>";
                    row += "    <td class='rows-alternative' colspan='100'>" + internalSettings.language.results.refresh + "</td>";
                    row += "</tr>";
        
                    $(this).find('.brisk-datatable table tbody').append(row);
                }
            },
            orderBy: function(column){
                var internalSettings = $(this).data('briskTableSettings');

                if(internalSettings.datatable.order_by.column == column){
                    if(internalSettings.datatable.order_by.method == "ASC"){
                        internalSettings.datatable.order_by.method = "DESC";
                        return;
                    }
        
                    internalSettings.datatable.order_by.method = "ASC";
                }else{
                    internalSettings.datatable.order_by.column = column;
                    internalSettings.datatable.order_by.method = "ASC";
                }
                
                $(this).find('.brisk-datatable table thead tr th[data-sort="' + column + '"] i.fa').removeClass("fa-angle-up").addClass("fa-angle-down"); 
            }
        };
        
        // Functions dynamic calling methodology
        if (baseFunctions[argFunction]) {
            return baseFunctions[argFunction].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof argFunction === 'object' || !method) {
            return baseFunctions.init.apply(this, arguments);
        } else {
            $.error("Function " + method + " doesn’t exist!");
        }
    };

    $.fn.briskDataTable.languages = {
        ar: {
            code: "ar",
            direction: "rtl",
            filters: {
                title: "أدوات البحث"
            },
            datatable: {
                title: "النتائج"
            },
            filters_status: {
                0: "تعطيل",
                1: "تفعيل"
            },
            buttons: {
                refresh: "تحديث البيانات"
            },
            execution_time: {
                0: "استغرقت العملية",
                1: "ثانية"
            },
            results: {
                refresh: "جاري تحديث البيانات...",
                not_found: "لم يتم العثور على نتائج",
                found: {
                    0: "تم العثور على",
                    1: "من النتائج"
                }
            }
        },
        en: {
            code: "en",
            direction: "ltr",
            filters: {
                title: "Filtering Tools"
            },
            datatable: {
                title: "Results"
            },
            filters_status: {
                0: "Deactivated",
                1: "Activated"
            },
            buttons: {
                refresh: "Refresh data"
            },
            execution_time: {
                0: "Rendered in",
                1: "second"
            },
            results: {
                refresh: "Loading data...",
                not_found: "No results found",
                found: {
                    0: "We found",
                    1: "of results"
                }
            }
        }
    };
}(jQuery));