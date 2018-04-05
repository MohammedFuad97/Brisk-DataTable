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