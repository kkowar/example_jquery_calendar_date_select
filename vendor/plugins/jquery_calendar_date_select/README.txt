= jQuery CalendarDateSelect

A jQuery based version of the calendardateselect plugin.

= Installation

  1. script/plugin install git://github.com/railssignals/jquery_calendar_date_select.git
  
  2. Add the javascript and css include tags to your /app/views/layouts/application.html.erb 
     (or whatever layout you want it included in)
      
     <%= javascript_include_tag 'calendar_date_select/jquery/jquery-1.3.2.min.js' %>
  	 <%= javascript_include_tag 'calendar_date_select/jquery/jquery.string.1.0.js' %>
  	 <%= javascript_include_tag 'calendar_date_select/jquery/jquery.calendardateselect.js' %>
  	  
     <%= stylesheet_link_tag '/stylesheets/calendar_date_select/jquery.calendardateselect.css' %>
      
  3. Add the setup function to your /public/javascripts/application.js
  
     jQuery(document).ready(function($){
     	 $("[selector]").datetimeselect();
     });
      
  4. Add elements in your pages with the class or id that matches [selector]
     
     INPUT Elements
     
       Input Elements will show a Calendar in response to the onClick event.
       <input class="[selector]"> OR <input id="[selector]">
     
       To place existing date/time information into the calendar set the value attribute.
       <input value="[existing date or time formatted to a javascript parsable format]">
     
     DIV and SPAN Elements
     
       Div and Span Elements will have the calendar placed within them and always show the Calendar.
       <div class="[selector]"> OR <div id="[selector]">
       <span class="[selector]"> OR <span id="[selector]">
       
       To place existing date/time information into the calendar create a value attribute.
       <div value="[existing date or time formatted to a javascript parsable format]">
       <span value="[existing date or time formatted to a javascript parsable format]">
     
= Configuration
  
  Create a calendar that uses date and time for a .date selector.
  $('.date').datetimeselect();
  OR
  $('.date').datetimeselect({time: 'true'});
  
  Create a calendar that uses only the date for a .datenotime selector.
  $('.datenotime').datetimeselect({time: 'false'});
     
= TODO:

  List to come soon...
      
= Based upon the popular:

= CalendarDateSelect

http://code.google.com/p/calendardateselect/

== Examples

  Coming Soon...

== Submitting patches

Please take care to do the following:

* Clean up your patch (don't send a patch bomb with a hundred features in one)
* Write test cases!
* As a general rule of thumb, think of ways to make things more general purpose than specific. 

