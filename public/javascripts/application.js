// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

jQuery(document).ready(function($){
	// Use jQuery Calendar Date Select straight out of the box for date and time.
	// All you have to do is pick the class or id you want to use.
	$(".jqueryCDS").datetimeselect();
	// OR feel free to specify options as well.  This example does not show time.
	$("#date_no_time").datetimeselect({time:false});
	
	// Works with livequery, example coming soon...
	//$('.datetime').livequery(function(){ $(this).datetimeselect(); });
	
  $('a').click(function() { this.blur(); });
});