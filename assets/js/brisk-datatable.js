(function ($) {
    $.BriskDataTable = function (element, initOptions) {
        this.element = (element instanceof $) ? element : $(element);

        if(initOptions.language === undefined){
            initOptions.language = "ar";
        }
        
        this.language = $.BriskDataTable.languages[initOptions.language];

        this.datatable = initOptions.datatable;
        this.filters = initOptions.filters;
        
        if(this.filters == undefined || this.filters.enable == undefined){
            this.filters = {
                enable: false
            };
        }

        this.filters.initialized = false;
        
        this.datatable.current_page = 1;

        if(this.datatable.refresh.enable == undefined || this.datatable.refresh.enable){
            this.datatable.buttons.unshift({
                data_action: "refresh",
                classes: {
                    button: "btn btn-xs btn-warning",
                    icon: "fa fa-sync"
                },
                title: this.language.buttons.refresh
            });
        }

        /**
         * START:: Overridden Methods Setup
         */
        if(typeof this.datatable.row_format == "function"){
            this.row_format = this.datatable.row_format;
        }

        if(typeof this.datatable.row_reformat == "function"){
            this.row_reformat = this.datatable.row_reformat;
        }
        //END:: Overridden Methods Setup
    };

    $.BriskDataTable.languages = {
        ar: {
            code: "ar",
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
    }
    
    $.BriskDataTable.prototype = {
        InitBrisk: function () {
            /**
             * START:: HTML Templates Appending
             */
            var template = '';

            if(this.filters.enable){
                if(this.language.code === "ar"){
                    template += '<div class="panel brisk-filters rtl">';
                }else{
                    template += '<div class="panel brisk-filters">';
                }
                template += '    <div class="panel-heading clearfix">';
                template += '        <span class="panel-title"></span>';
                template += '        <div class="panel-heading-controls">';
                template += '           <select id="filters-status" class="form-control filters-switch">';
                template += '               <option value="0">' + this.language.filters_status[0] + '</option>';
                if(this.filters.active){
                    template += '               <option value="1" selected>' + this.language.filters_status[1] + '</option>';
                }else{
                    template += '               <option value="1">' + this.language.filters_status[1] + '</option>';
                }
                template += '           </select>';
                template += '        </div>';
                template += '    </div>';

                if(this.filters.active){
                    template += '    <div class="panel-body">';
                }else{
                    template += '    <div class="panel-body" style="display: none;">';
                }

                template += '    </div>';
                template += '</div>';
            }

            if(this.language.code === "ar"){
                template += '<div class="panel brisk-datatable rtl">';
            }else{
                template += '<div class="panel brisk-datatable">';
            }
            template += '    <div class="panel-heading">';
            template += '        <span class="panel-title"></span>';
            template += '        <div class="panel-heading-controls">';
            template += '            <ul class="pagination pagination-xs numeric hidden"></ul>';
            template += '        </div>';
            template += '    </div>';
            template += '    <div class="panel-body">';
            template += '        <table class="table table-striped table-hover">';
            template += '            <thead></thead>';
            if(this.datatable.tbody !== undefined && this.datatable.tbody.height !== undefined){
                template += '            <tbody style="height: ' + this.datatable.tbody.height + ';"></tbody>';
            }else{
                template += '            <tbody></tbody>';
            }
            template += '        </table>';
            template += '    </div>';
            template += '</div>';

            var $template = $('<div />', {html: template});

            //filters panel title
            if(this.filters.title !== undefined && $.trim(this.filters.title) !== ""){
                $template.find('div.panel.brisk-filters .panel-title').html(this.filters.title);
            }

            //table panel title
            if(this.datatable.title !== undefined && $.trim(this.datatable.title) !== ""){
                $template.find('div.panel.brisk-datatable .panel-title').html(this.datatable.title);
            }

            $.each(this.datatable.buttons, function(key, button){
                $template.find('div.panel.brisk-datatable .panel-heading-controls').prepend('<button class="' + button.classes.button + '" data-action="' + button.data_action + '"><span class="' + button.classes.icon + '"></span>&nbsp;&nbsp;' + button.title + '</button>');
            });

            $.each(this.filters.classes, function(key, class_title){
                $template.find('div.panel.brisk-filters').addClass(class_title);
            });

            $.each(this.datatable.classes, function(key, class_title){
                $template.find('div.panel.brisk-datatable').addClass(class_title);
            });

            this.element.html($template.html());
            //END:: HTML Templates Appending
            
            var briskDataTable = this;
            this.filters.element = this.element.find('div.panel.brisk-filters');
            this.datatable.element = this.element.find('div.panel.brisk-datatable');

            /**
             * START:: Events Init.
             */
            this.datatable.element.find('button[data-action="refresh"]').click(function(){
                briskDataTable.get();
            });

            this.datatable.element.on('click', 'ul.pagination a[data-page-id]', function(){
                briskDataTable.datatable.current_page = $(this).attr('data-page-id');
                briskDataTable.get();
            });
            
            this.datatable.element.on('click', 'table thead tr th[data-sort]', function(){
                briskDataTable.orderBy($(this).data('sort'));
                briskDataTable.get();
            }); 
            
            this.filters.element.on('change', '#filters-status', function(){
                briskDataTable.filters.active = Number($(this).val());

                if(briskDataTable.filters.active){
                    briskDataTable.filters.element.find('.panel-body').fadeIn();
                }else{
                    briskDataTable.filters.element.find('.panel-body').fadeOut();
                    briskDataTable.get();
                }
            }); 

            this.filters.element.on('change', '.panel-body input, .panel-body select', function(){
                briskDataTable.get();
            }); 

            this.filters.element.on('keypress', '.panel-body input', function(event){
                var keycode = (event.keyCode ? event.keyCode : event.which);
            	if(keycode == '13'){
                    briskDataTable.get();
                }           
            }); 
            //END:: Events Init.
        },

        get: function(){
            var briskDataTable = this;
            var datatable = this;

            datatable.loading(); 

            var URL = this.datatable.resource.base_url + this.datatable.resource.entity + this.datatable.resource.datatable;
            URL += "?page=" + this.datatable.current_page;

            if(this.datatable.order_by.column !== undefined && this.datatable.order_by.method !== undefined){
                URL += "&order_by_column=" + this.datatable.order_by.column;
                URL += "&order_by_method=" + this.datatable.order_by.method;
            }
            
            if(this.filters.enable){
                URL += "&filters_status=" + this.filters.active;

                if(this.filters.active){
                    this.filters.element.find('[name]').each(function() {
                        URL += "&" + $(this).attr('name') + "=" + $(this).val();
                    }); 
                }
            }
        
            $.get(URL,
            function(response, status){
                datatable.setFilters(response.filters);
                datatable.setColumns(response.columns);
                datatable.setPagination(response.current_page, response.last_page);
                
                //filters panel title
                if(briskDataTable.filters.title == undefined || $.trim(briskDataTable.filters.title) == ""){
                    briskDataTable.filters.element.find('.panel-title').html(response.filters_title);
                }
                //table panel title
                if(briskDataTable.datatable.title == undefined || $.trim(briskDataTable.datatable.title) == ""){
                    briskDataTable.datatable.element.find('.panel-title').html(response.table_title);
                }
        
                datatable.element.find('table tbody').html("");
        
                $.each(response.data, function(key, record) {
                    var row = "";
                    row = datatable.rows_reformat(response.columns, key, record);
                    row = datatable.row_reformat($(row), key, record);
                    datatable.element.find('table tbody').append(row);
                }); 
        
                datatable.setFooter(response.total, response.footer);
            })
            .fail(function() {
                datatable.get();
            });
        },

        setFilters: function(filters) {
            if(this.filters.initialized){
                return;
            }

            this.filters.initialized = true;
            var briskDataTable = this;

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
                if(filter.classes !== undefined && filter.classes.length > 0){
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

                briskDataTable.filters.element.find('.panel-body').append(html);
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
            this.filters.element.find(".masked-input-date").mask("0000/00/00", {placeholder: "__/__/____"});
            //END:: Filters Init.
        },

        setColumns: function(columns) {
            var brisk = this;
            var datatable = this.datatable;
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

            this.element.find('table thead').html(html);
        },
    
        setPagination: function(current_page, last_page){
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
        
            this.element.find('ul.pagination').html(html).removeClass("hidden");
        },

        rows_reformat: function(columns, key, record){
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

        /**
         * Can be used to reformat row HTML from outside the class
         * by overriding it
         */
        row_reformat: function(row, key, record){
            return row;
        },
    
        setFooter: function(total, footer){
            var row = "";
    
            if(!total){
                row = "<tr>";
                row += "    <td class='rows-alternative' colspan='100'>" + this.language.results.not_found + "</td>";
                row += "</tr>";
            }else{
                row = "<tr class='footer'>";
                row += "    <td colspan='100'>";
                row += "        " + this.language.results.found[0] + " <span class='numeric'>" + total + "</span> " + this.language.results.found[1] + ".";
                row += "        <span class='info'>" + footer.info;
    
                if(this.datatable.execution_time){
                    row += "            " + this.language.execution_time[0] + ": <span class='numeric'>" + footer.execution_time + "</span> " + this.language.execution_time[1];
                }
    
                row += "        </span>";
                row += "    </td>";
                row += "</tr>";
            }

            this.element.find('table tbody').append(row);
        },
    
        loading: function(){
            var row = "";
    
            if(this.datatable.refresh.clear == undefined || !this.datatable.refresh.clear){
                row += this.language.results.refresh;
    
                this.element.find('table tbody tr.footer span.info').html(row);
            }else{
                this.element.find('table tbody').html("");
             
                row = "<tr>";
                row += "    <td class='rows-alternative' colspan='100'>" + this.language.results.refresh + "</td>";
                row += "</tr>";
    
                this.element.find('table tbody').append(row);
            }
        },
    
        orderBy: function(column){
            if(this.datatable.order_by.column == column){
                if(this.datatable.order_by.method == "ASC"){
                    this.datatable.order_by.method = "DESC";
                    return;
                }
    
                this.datatable.order_by.method = "ASC";
            }else{
                this.datatable.order_by.column = column;
                this.datatable.order_by.method = "ASC";
            }
            
            this.datatable.element.find('table thead tr th[data-sort="' + column + '"] i.fa').removeClass("fa-angle-up").addClass("fa-angle-down"); 
        }
    };
}(jQuery));