# Brisk DataTable
Brisk works on making the process of producing datatables easier and faster by keeping the hard usually repeated stuff on Brisk and focusing on building your special tables without giving any care about the small trivial issues if they were clearly constrained or not.
 
![Brisk DataTable Workflow Chart](https://github.com/MohammedFuad97/Brisk-DataTable/blob/master/Brisk%20Datatable%20Workflow%20Chart.jpg)

<h1>Requested Backend JSON Format:</h1>
<label>Used to control frontend</label>
<blockquote>Coming versions will work on enabling the control of all frontend attributes from backend side.</blockquote>
<h3>Table resource GET JSON Format:</h3>

    {
       "filters_title":"Filters Panel Title",
       "filters":[
          {
             "title":"Select Filter Title", //filter title
             "type":"select", //filter type
             "name":"type_serial_no", //filter name
             "classes":[ //any custom classes

             ],
             "data":{
                "options_source":"treatment_types", //filter resource name
                "has_empty":false, //show/hide [empty option] in the list
                "has_all":true, //show/hide [all options] option in the list
                "has_none":false //show/hide [none of options] option in the list
             }
          },
          {
             "title":"Input Filter Title",
             "type":"input",
             "name":"full_name",
             "placeholder":"Type here full name plz..",
             "classes":[

             ]
          },
          {
             "title":"From Date:",
             "type":"input",
             "name":"from_date",
             "placeholder":"",
             "classes":[

             ],
             "date":true //so frontend will MASK this input to date format
          },
          {
             "title":"To Date:",
             "type":"input",
             "name":"to_date",
             "placeholder":"",
             "classes":[

             ],
             "date":true
          }
       ],
       "table_title":"Table Panel Title",
       "columns":[
          {
             "title":"Type", //column title
             "sortable":true, //to enable/disable sotring by this column
             "column":"type_title" //column title in DB
          },
          {
             "title":"Full Name",
             "sortable":true,
             "column":"full_name"
          },
          {
             "title":"Zone",
             "sortable":true,
             "column":"zone_title"
          },
          {
             "title":"Record Date",
             "sortable":true,
             "column":"record_date",
             "numeric":true //to make sure of displaying it in a good numeric format
          },
          {
             "title":"Sector Title",
             "sortable":true,
             "column":"redirect_to_sector_title"
          }
       ],
       "footer":{
          "info":"Some text about client balance for example.", //allows you to push any notification about this table to its view
          "execution_time":"0.0090" //allows you to pass server side processing time in seconds to frontend
       },
       "current_page":1,
       "data":[], //your table data comes here
       "from":1,
       "last_page":25,
       "per_page":30,
       "to":30,
       "total":726
    }

<h1>Frontend Part:</h1>

<strong>1. You need to declare very simple \<div> and give it any ID you want, in our demo:</strong>
    
    <div id="brisk-demo"></div>
    
<strong>2. Brisk Instance Options declaration:</strong>

You can check the full list of attributes in [Attributes Reference](#attributes-reference-still-under-preparing)

    var initOptions = {
        language: 'en',
        filters: {
            title: "Filtering Tools",
            enable: true,
            active: true
        },
        datatable: {
            title: "Brisk DataTable Demo",
            resource: {
                base_url: 'http://domain-name.com',
                entity: '/resource',
                datatable: '/datatable-get-method' //required returned JSON format was described in the beginning of README 
            },
            buttons: [
                {
                    title: "New record",
                    data_action: "insert",
                    classes: {
                        button: "btn btn-xs btn-primary",
                        icon: "fa fa-plus"
                    }
                }
            ],
            order_by: {
                column: 'serial_no',
                method: 'DESC'
            }
        }
    };

<strong>3. Brisk Instance declaration:</strong>

    var briskDemo = new $.BriskDataTable($("#brisk-demo"), initOptions);
    
    briskDemo.InitBrisk(); //initilaize the table and its filters HTML
    briskDemo.get(); //gets table data, and filters
    
<strong>4. Reach Brisk table buttons:</strong>

You can access any event of the injected buttons to the table using this format, by [data_action] which you already declared in the options:

    briskDemo.datatable.element.find('[data-action="insert"]').click(function(){
        alert();
    });
    
<strong>In case you are going to enable Filters, you need to declare this GLOBALS over your entire app before step #2:</strong>

    const GLOBALS = {
        base_url: 'http://domain-name.com',
        lists: {
            /*
            * These standard options are controlled by backend JSON attributes
            */
            standard_options: function(select){
                if($(select).data('has_empty') === true){
                    $(select).append("<option></option>");
                }
                if($(select).data('has_all') === true){
                    $(select).append("<option value='all'>كافة الخيارات</option>"); //you can change this text to anything fits you
                }
                if($(select).data('has_none') === true){
                    $(select).append("<option value='none'>لا يوجد</option>"); //you can change this text to anything fits you
                }
            },
            /*
            * user_types is the sample which you can make unlimited number of lists like its format
            */
            user_types: {
                data: [],
                get: function(){
                    $.get(GLOBALS.base_url + "/lists/user-types", //your list GET resource
                    $(this).serialize(),
                    function(response, status){
                        GLOBALS.lists.user_types.data = response;

                        var options = "";

                        $.each(response, function(key, value) {
                            options += "<option value='" + value.serial_no + "' data-title-en='" + value.title_en + "' data-calls='" + value.calls + "' data-visits='" + value.visits + "'>" + value.title + "</option>";
                        });

                        $('select[data-options_source="user_types"]').each(function() {
                            if($.trim($(this).html()) == ""){
                                GLOBALS.lists.standard_options(this);

                                $(this).append(options);
                            }
                        }); 
                    })
                    .fail(function() {
                        GLOBALS.lists.user_types.get();
                    }); 
                }
            }
        }
    }

# Attributes Reference (still under preparing) 
## General Object
| Attribute        | Default           | Options  |
| ------------- |:-------------:|:-------------:|
| language      | ar | ['ar', 'en'] |
| direction      | language direction      |   ['rtl', 'ltr'] |

## Filters Object
| Attribute        | Default           | Options  | Notes |
| ------------- |:-------------:|:-------------:|:-------------:|
| title | depends on the language      |    Any Text is Fine | Comes from backend JSON or Brisk default language titles or You can override it here
| classes |   [ ]    |      | allows you to injects css classes to filters panel
| enable |     false  |  [true, false]    | show/hide filters panel
| active |  false     |   [true, false]   | activate/deactivate filters directly once table loaded

## Datatable Object
| Attribute        | Default           | Options  | Notes |
| ------------- |:-------------:|:-------------:|:-------------:|
| title | depends on the language      |    Any Text is Fine | Comes from backend JSON or Brisk default language titles or You can override it here
| resource.base_url |       |      |
| resource.entity |       |      |
| resource.datatable |       |      |
| classes |    [ ]   |      |allows you to injects css classes to datatable panel
| buttons[].title |       |      |
| buttons[].data_action |       |      |
| buttons[].classes.button |       |      |
| buttons[].classes.icon |       |      |
| refresh.enable |  true     |    [true, false]  |
| refresh.clear |  false     |   [true, false]   |
| refresh.auto.active |  false     |   [true, false]   |
| refresh.auto.unit |     'seconds'  |    ['seconds', 'minutes']  |
| refresh.auto.duration |     1  |      |
| order_by.column |       |      | column of first data GET call sort
| order_by.method |       |      | method of first data GET call sort
| execution_time |     true  |  [true, false]    | shows execution time in table footer
| tbody.height |   '60vh'    |      | table body height

### Datatable Methods Override
| Method        | Default           | Options  |
| ------------- |:-------------:|:-------------:|
| rows_reformat |       |      |
| row_reformat |       |      |
