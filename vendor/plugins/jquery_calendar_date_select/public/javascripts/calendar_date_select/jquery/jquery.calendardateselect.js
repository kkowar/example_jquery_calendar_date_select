
(function($) {
  
  nil = null;
  
  // Additional Date variables and functions.
  Date.one_day = 24*60*60*1000;
  Date.months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
  Date.weekdays = new Array("S", "M", "T", "W", "T", "F", "S");
  Date.first_day_of_week = 0;
  Date.padded2 = function(hour) { var padded2 = parseInt(hour, 10); if (hour < 10) padded2 = "0" + padded2; return padded2; }
  Date.prototype.getPaddedMinutes = function() { return Date.padded2(this.getMinutes()); }
  Date.prototype.getAMPMHour = function() { var hour = this.getHours(); return (hour == 0) ? 12 : (hour > 12 ? hour - 12 : hour ) }
  Date.prototype.getAMPM = function() { return (this.getHours() < 12) ? "AM" : "PM"; }
  Date.prototype.daysDistance = function(compare_date) { return Math.round((compare_date - this) / Date.one_day); };
  Date.prototype.stripTime = function() { return new Date(this.getFullYear(), this.getMonth(), this.getDate());};
  Date.parseFormattedString = function(string) { return new Date(string); }
  Date.prototype.toFormattedString = function(include_time){
    var hour, str;
    str = Date.months[this.getMonth()] + " " + this.getDate() + ", " + this.getFullYear();
    if (include_time) { 
      hour = this.getHours(); 
      str += " " + this.getAMPMHour() + ":" + this.getPaddedMinutes() + " " +   this.getAMPM() 
    }
    return str;
  }
  
  Math.floor_to_interval = function(n, i) { return Math.floor(n/i) * i;}
  
  function jqueryCalendarDateSelect() {
    //
    // plugin defaults
    //
    this.defaults = {
      embedded: false,
      popup: nil,
      month_year: false,
      time: 'mixed',
      buttons: true,
      clear_button: true,
      valid_date_check: nil,
      close_on_click: nil,
      minute_interval: 5,
      year_range: 10,
      popup_by: this.target_element
    };
    this.last_click_at = 0;
  
  }
  
  $.extend(jqueryCalendarDateSelect.prototype, {
    
    parseDate: function (parent){
      var p = parent.dts;
			var nodeName = parent.nodeName.toLowerCase();
			if (nodeName == "input") var value = $.trim($(parent).val());
			// TODO: add error handling if the value attribute is not present.
			if (p.options.embedded) var value = $.trim($(parent).attr("value"));
      p.selection_made = (value != "");
      p.date = value == "" ? NaN : Date.parseFormattedString(p.options.date || value);
      if (isNaN(p.date)) {
        this.clearDate(parent);
        p.date = new Date();
        p.date.setDate(1);
      }
      // TODO - Check on yearRange.start and yearRange.end
      if (!this.validYear(p.date.getFullYear(),parent)) p.date.setYear( (p.date.getFullYear() < p.yearRange(parent).start) ? p.yearRange(parent).start : p.yearRange(parent).end);
      p.selected_date = new Date(p.date);
      p.use_time = /[0-9]:[0-9]{2}/.exec(value) ? true : false;
      this.refresh(parent);
      
    },
    
    validYear: function (year,parent) {
      if (this.flexibleYearRange(parent)) { return true;} else { return ($.inArray(year,this.yearRange(parent))=-1?false:true);}  
    },
  
    yearRange: function (parent) {
      var p = parent.dts;
      if (!this.flexibleYearRange(parent))
        //return $R(options.year_range[0], options.year_range[1]);
        return range(p.options.year_range[0], p.options.year_range[1]);
        
      var y = p.date.getFullYear();
      //return $R(y - options.year_range, y + options.year_range);
      return range(y - p.options.year_range, y + p.options.year_range);
    },
    
    flexibleYearRange: function (parent) { return (typeof(parent.dts.options.year_range) == "number"); },
  
    dateString: function (parent) {
      var p = parent.dts;
      return (p.selection_made) ? p.selected_date.toFormattedString(p.use_time) : "&#160;";
    },
    
    createCalendarDiv: function (element) {
      var p = element.dts;
			//$.inspect(p,'window');
			//var nodeName = parent.nodeName.toLowerCase();
      if (p.options.embedded) {
        var parent = element;
        var style = {padding: "10px"};
      } else {
        // TODO - Coordinate with Reposition Calendar Method
        //var position = $(this.target_element).offset();
        //var height = $(g.target_element).height();
        //var width = $(this.target_element).width();
      
        //var top = position.top ;//+ height;
        //var left = position.left + width + 10;
        var parent = document.body;
        var style = { position:"absolute", display: "none", top: 0, left: 0, padding: "10px" };
      }
      var calendar_div = $(parent).build('div', {className: "calendar_date_select", id: p.id}, style);
			// TODO: Add error handling if name attribute is not present.
			if (p.options.embedded) var calendar_div_hidden = $(parent).build('input', {id: p.id + "_hidden", type: "hidden", name: $(parent).attr("name"), value: "" });
      if (p.options.embedded) $(parent).removeAttr("name");
      // Create header, body, buttons, footer, and bottom divs.
      var top_div = $(calendar_div).build('div', { className: "cds_top" }, { clear: 'left'} );
      var header_div = $(calendar_div).build('div', { className: "cds_header" }, { clear: 'left'} );
      var body_div = $(calendar_div).build('div', { className: "cds_body" }, { clear: 'left'} );
      var buttons_div = $(calendar_div).build('div', { className: "cds_buttons" }, { clear: 'left'} );
      var footer_div = $(calendar_div).build('div', { className: "cds_footer" }, { clear: 'left'} );
      var bottom_div = $(calendar_div).build('div', { className: "cds_bottom" }, { clear: 'left'} );

      this.createHeaderDiv(header_div,element);
      this.createButtonsDiv(buttons_div,element);
      this.createCalendarGrid(body_div,element);
      
      //this.updateFooter("&#160;");
      //this.refresh();
      //this.setUseTime(this.use_time);
      
    },
    
    createHeaderDiv: function (element,parent) {
      
      var p = parent.dts;
      var header_div = element;
      
      // TODO - update close_button. Currently Not used.
      var close_button = $(header_div).build("a", { innerHTML: "x", href:"#", className: "close" });
      $(close_button).bind("click", function() { $.datetimeselect.close(parent); });
          
      var next_month_button = $(header_div).build("a", { innerHTML: "&gt;", href:"#", className: "next" });
      $(next_month_button).bind("click", function() { $.datetimeselect.navMonth(p.date.getMonth() + 1,parent); this.blur(); return false; });

      var prev_month_button = $(header_div).build("a", { innerHTML: "&lt;", href:"#", className: "prev" });
      $(prev_month_button).bind("click", function() { $.datetimeselect.navMonth(p.date.getMonth() - 1,parent); this.blur(); return false; });
      
      // TODO
      if (p.options.month_year == "dropdowns") {
        // TODO - Update Code and Finish the ability for select boxes in the header.
        p.month_select = new SelectBox(header_div, $R(0,11).map(function(m){return [Date.months[m], m]}), {className: "month", onchange: function () { $.datetimeselect.navMonth(p.month_select.getValue(),parent) }.bindAsEventListener(this)}); 
        p.year_select = new SelectBox(header_div, [], {className: "year", onchange: function () { $.datetimeselect.navYear(p.year_select.getValue(),parent) }.bindAsEventListener(this)}); 
        this.populateYearRange(parent);
      } else {
        p.month_year_label = $(header_div).build("span")
      }
  
    },
    
    navMonth: function(month,parent) { (target_date = new Date(parent.dts.date)).setMonth(month); return (this.navTo(target_date,parent)); },
  
    navYear: function (year,parent) { (target_date = new Date(parent.dts.date)).setYear(year); return (this.navTo(target_date,parent)); },

    navTo: function (date,parent) {
      if (!this.validYear(date.getFullYear(),parent)) return false;
      var p = parent.dts;
      //this.target_element = parent
      //this.options = parent.dts.options
      p.date = date;
      p.date.setDate(1);
      this.refresh(parent);
      // TODO - callbacks
      // callback("after_navigate", this.date);
      return true;
    },
    
    createButtonsDiv: function (element,parent) {
      
      var p = parent.dts;
      var buttons_div = element;

      if (p.options.time == "mixed" || p.options.time == "true" ) {
        var blank_time = new Array();
        var o = new Object();
        if (p.options.time == "mixed") {
          o.innerHTML = " - "
          o.value = " "
          blank_time[0] = o
          var incrementor = 1
        } else {
          var incrementor = 0
        }
        $.each(range(0,24),function(x) {
          var t = new Date();
          var o = new Object();
          t.setHours(x);
          o.value = x;
          o.innerHTML = t.getAMPMHour()+ " " + t.getAMPM();
          blank_time[x+incrementor] = o;
        } )
        p.hour_select = new SelectBox;
        p.hour_select.initialize(buttons_div, blank_time, { className: "hour" });
        $(p.hour_select.element).bind("change",function() { $.datetimeselect.updateSelectedDate({ hour: this.value },parent);});
        
        $(buttons_div).build("span", {innerHTML:":", className: "seperator"});
        
        var blank_time = new Array();
        var o = new Object();
        if (p.options.time == "mixed") {
          o.innerHTML = " - "
          o.value = " "
          blank_time[0] = o
          incrementor = 1
        } else {
          incrementor = 0
        }
        var i = 0
        var minute_interval = p.options.minute_interval;
        $.each(range(0,60),function(x) {
          if (x % minute_interval == 0) {
            var t = new Date();
            var o = new Object();
            t.setHours(x);
            o.value = x;
            o.innerHTML = Date.padded2(x);
            blank_time[i+incrementor] = o;
            i = i + 1
          }
        } )
        p.minute_select = new SelectBox;
        p.minute_select.initialize(buttons_div, blank_time, { className: "minute" });
        $(p.minute_select.element).bind("change",function() { $.datetimeselect.updateSelectedDate({ minute: this.value },parent);});
      } else if (p.options.buttons == "false") $(buttons_div).remove();
    
      if (p.options.buttons) {
        var selector = '#' + p.id;
        // Today
        $(buttons_div).build("span", {innerHTML: "&#160;"});
        if (p.options.time == "mixed" || p.options.time == "false") { 
          var b = $(buttons_div).build("a", {innerHTML: "Today", href: "#", className: "today_button"});
          $(b).bind("click", function() {$.datetimeselect.today(false,parent); return false;});
        }
        // Separator
        if (p.options.time == "mixed" || p.options.time == "true") $(buttons_div).build("span", {innerHTML: "&#160;|&#160;", className:"button_seperator"});
        // Now
        if (p.options.time == "mixed") {
          var b = $(buttons_div).build("a", {innerHTML: "Now", href: "#", className: "now_button" });
          $(b).bind("click", function() {$.datetimeselect.today(true,parent); return false;});
        }
        // Clear
        if (p.options.clear_button) {
          $(buttons_div).build("span", {innerHTML: "&#160;|&#160;", className:"button_seperator"})
          var b = $(buttons_div).build("a", { innerHTML: "Clear", href: "#", className: "clear_button" });
          $(b).bind("click", function() {$.datetimeselect.clearDate(parent); return false;});
        }
        // closeOnClickTODO - Check out the closeOnClick stuff.
        if ((!p.options.embedded) && !this.closeOnClick(parent)) {
          $(buttons_div).build("span", {innerHTML: "&#160;|&#160;", className:"button_seperator"})
          var b = $(buttons_div).build("a", { innerHTML: "OK", href: "#", className: "ok_button" });
          $(b).bind("click", function() {$.datetimeselect.close(parent); return false;});
        }
      }
    },
    
    createCalendarGrid: function (element,parent) {
      var p = parent.dts
      var body_div = element;

      p.calendar_day_grid = [];
      var days_table = $(body_div).build("table", { cellPadding: "0px", cellSpacing: "0px", width: "100%" })
      // Weekdays Heading
      var weekdays_row_header = $(days_table).build("thead");
      var weekdays_row = $(weekdays_row_header).build("tr");
      $.each(Date.weekdays, function(index, value) { 
        $(weekdays_row).build("th", {innerHTML: value});
      });
      // Days in Calendar
      var days_tbody = $(days_table).build("tbody")
      var row_number = 0, weekday;
      for(var cell_index = 0; cell_index<42; cell_index++)
      {
        var weekday = (cell_index+Date.first_day_of_week ) % 7;
        if ( cell_index % 7==0 ) var days_row = $(days_tbody).build("tr", {className: 'row_'+row_number++});
        p.calendar_day_grid[cell_index] = $(days_row).build("td", {
            id: cell_index,
            className: (weekday==0) || (weekday==6) ? " weekend" : "" //clear the class
          },{ cursor: "pointer" });
        $(p.calendar_day_grid[cell_index]).bind("mouseover", function() { $.datetimeselect.dayHover(this,parent); });
        $(p.calendar_day_grid[cell_index]).bind("mouseout", function() { $.datetimeselect.dayHoverOut(this,parent); });
        $(p.calendar_day_grid[cell_index]).bind("click", function() { $.datetimeselect.updateSelectedDate(this,parent); });
        $(p.calendar_day_grid[cell_index]).build("div");
        // TODO - cleanup double check this.
        p.calendar_day_grid[cell_index];
      }
    },
    
    dayHover: function(element,parent) {
      var p = parent.dts;
      // TODO set use_time from parent and also make the calendar_day_grid cell id unique
      index = $(element).attr('id');
      var hover_date = new Date(p.selected_date);
      hover_date.setYear(p.calendar_day_grid[index].year); 
      hover_date.setMonth(p.calendar_day_grid[index].month); 
      hover_date.setDate(p.calendar_day_grid[index].day);
			if (p.options.time == "mixed" || p.options.time == "true") {
      	this.updateFooter(parent,hover_date.toFormattedString(p.use_time));
			} else if (p.options.time == "false") {
      	this.updateFooter(parent,hover_date.toFormattedString(false));				
			};
    },
  
    dayHoverOut: function(element,parent) { 
      this.updateFooter(parent); 
    },
    
    updateSelectedDate: function (partsOrElement,parent) {
      var p = parent.dts;
      var index = $(partsOrElement).attr('id');
      if (index){
        var parts = p.calendar_day_grid[index]
      } else {
        var parts = partsOrElement;
      }

			// TODO: work on using the disabled, readOnly, and popup force options.
      if ((parent.disabled || parent.readOnly) && p.options.popup != "force") return false;
        
      if (parts.day) {
        var t_selected_date = p.selected_date, vdc = p.options.valid_date_check;
        for (var x = 0; x<=3; x++) t_selected_date.setDate(parts.day);
        t_selected_date.setYear(parts.year);
        t_selected_date.setMonth(parts.month);
        
        if (vdc && ! vdc(t_selected_date.stripTime())) { return false; }
        p.selected_date = t_selected_date;
        p.selection_made = true;
      }

      if (!isNaN(parts.hour)) p.selected_date.setHours(parts.hour);
      if (!isNaN(parts.minute)) p.selected_date.setMinutes( Math.floor_to_interval(parts.minute, p.options.minute_interval) );

      if (parts.hour === "" || parts.minute === "") {
        this.setUseTime(false,parent);
      } else if (!isNaN(parts.hour) || !isNaN(parts.minute)) {
        this.setUseTime(true,parent);
      }
			
      this.updateFooter(parent);
      this.setSelectedClass(parent);

      //if (p.selection_made) this.updateValue(parent);
      if (this.closeOnClick(parent)) this.close(parent);
      if (index && !p.options.embedded) {
        if ((new Date() - p.last_click_at) < 333) this.close(parent);
        p.last_click_at = new Date();
      }
    },
    
    updateValue: function (parent) {
			// TODO: cleanup old code
      //var last_value = parent.value;
			alert("updateValue");
			if (parent.dts.options.embedded == true) {
				$("#" + parent.dts.id + "_hidden").val(this.dateString(parent));
			} else {
				$(parent).val(this.dateString(parent));
			}
      //if (last_value!=g.target_element.value) 
        // TODO - callbacks
        //callback("onchange");
    },
  
    updateFooter: function (parent,text) { 
      var selector = '#' + parent.dts.id + ' > .cds_footer'
      if (!text) text = this.dateString(parent); 
        $(selector).children().remove(); 
        $(selector).build("span", {innerHTML: text });    
  		if (parent.dts.options.embedded == true) 
				selector = '#' + parent.dts.id + ' > .cds_footer > span';
				text = $(selector).html();
				if (text == "&nbsp;") text = "";
				$("#" + parent.dts.id + "_hidden").val(text);
    },
    
    setUseTime: function (turn_on,parent) {
      var p = parent.dts;
      // TODO: force use_time to true if time==true && time!="mixed"
			// TODO: double check that the switch in the conditional check didn't screw up something else
			//p.use_time = p.options.time && (p.options.time == "mixed" ? turn_on : true) 
      p.use_time = p.options.time && (p.options.time == "mixed" ? true : turn_on) 
      if (p.use_time && p.selected_date) { // only set hour/minute if a date is already selected
        var minute = Math.floor_to_interval(p.selected_date.getMinutes(), p.options.minute_interval);
        var hour = p.selected_date.getHours();
        p.hour_select.setValue(hour);
        p.minute_select.setValue(minute);
      } else if (p.options.time == "mixed") {
        p.hour_select.reset(); p.minute_select.reset();
      }
    },
    
    refresh: function (parent){
      var p = parent.dts;
      this.refreshMonthYear(parent);
      this.refreshCalendarGrid(parent);
      this.refreshCalendarButtons(parent);
      this.setSelectedClass(parent);
      this.updateFooter(parent);
      if (p.hour_select) this.setUseTime(p.use_time,parent);
    },
    
    // TODO - Update Code
    refreshMonthYear: function (parent) {
      var p = parent.dts;
      var m = p.date.getMonth();
      var y = p.date.getFullYear();
      // TODO - update month dropdowns in refreshMonthYear
      // set the month
      if (p.options.month_year == "dropdowns") 
      {
        p.month_select.setValue(m, false);
      
        var e = p.year_select.element; 
        if (this.flexibleYearRange(parent) && (!(p.year_select.setValue(y, false)) || e.selectedIndex <= 1 || e.selectedIndex >= e.options.length - 2 )) this.populateYearRange(parent);
        
        p.year_select.setValue(y);
        
      } else {
        $('#' + p.id + ' > .cds_header > span').html( Date.months[m] + " " + y.toString()  );
      }
    },
    
    // TODO - QA - .makeArray
    populateYearRange: function (parent) {
      parent.dts.year_select.populate($.makeArray(this.yearRange(parent)));
    },
    
    refreshCalendarButtons: function (parent) {
      var p = parent.dts;
      var selector = '#' + p.id;
      var button = "";
			if (p.options.time == "mixed" || p.options.time == "true") {
				if (p.hour_select) {
	        button = $(p.hour_select.element);
	        button.unbind("change");
	        button.bind("change",function() { $.datetimeselect.updateSelectedDate({ hour: this.value },parent); });
	      } if (p.minute_select) {
	        button = $(p.minute_select.element);
	        button.unbind("change");
	        button.bind("change",function() { $.datetimeselect.updateSelectedDate({ minute: this.value },parent); });
	      }
			}
      button = $('#' + p.id + ' > .cds_header > .next');
      button.unbind("click");
      button.bind("click", function() { $.datetimeselect.navMonth(p.date.getMonth() + 1,parent); this.blur(); return false; });
      button = $('#' + p.id + ' > .cds_header > .prev');
      button.unbind("click");
      button.bind("click", function() { $.datetimeselect.navMonth(p.date.getMonth() - 1,parent); this.blur(); return false; });
      button = $('#' + p.id + ' > .cds_buttons > .today_button');
      button.unbind("click");
      button.bind("click", function() {$.datetimeselect.today(false,parent); return false;});
      button = $('#' + p.id + ' > .cds_buttons > .now_button');
      button.unbind("click");
      button.bind("click", function() {$.datetimeselect.today(true,parent); return false;});
      button = $('#' + p.id + ' > .cds_buttons > .ok_button');
      button.unbind("click");
      button.bind("click", function() {$.datetimeselect.close(parent); return false;});
      button = $('#' + p.id + ' > .cds_buttons > .clear_button');
      button.unbind("click");
      button.bind("click", function() {$.datetimeselect.clearDate(parent); return false; });
      //button.bind("click", function() {$.datetimeselect.clearDate(parent); if (!p.options.embedded) $.datetimeselect.close(parent); return false; });
    },
  
    refreshCalendarGrid: function (parent) {
      var p = parent.dts;
      
      p.beginning_date = new Date(p.date).stripTime();
      p.beginning_date.setDate(1);
      p.beginning_date.setHours(12); // Prevent daylight savings time boundaries from showing a duplicate day
      var pre_days = p.beginning_date.getDay() // draw some days before the fact
      if (pre_days < 3) pre_days += 7;
      p.beginning_date.setDate(1 - pre_days + Date.first_day_of_week);
      
      var iterator = new Date(p.beginning_date);
      
      var today = new Date().stripTime();
      var this_month = p.date.getMonth();
      var vdc = p.options.valid_date_check;
      for (var cell_index = 0;cell_index<42; cell_index++)
      {
        var day = iterator.getDate(); 
        var month = iterator.getMonth();
        var cell = p.calendar_day_grid[cell_index];
        $(cell).unbind("mouseover");
        $(cell).bind("mouseover", function() { $.datetimeselect.dayHover(this,parent); });
        $(cell).unbind("mouseout");
        $(cell).bind("mouseout", function() { $.datetimeselect.dayHoverOut(this,parent); });
        $(cell).unbind("click");
        $(cell).bind("click", function() { $.datetimeselect.updateSelectedDate(this,parent); });
        var children = $(cell).children();
        $(children[0]).remove();
        var div = $(cell).build("div", {innerHTML:day});
        if (month!=this_month) div.className = "other";
        cell.day = day; cell.month = month; cell.year = iterator.getFullYear();
        if (vdc) { if (vdc(iterator.stripTime()))$(cell).removeClass("disabled"); else $(cell).addClass("disabled") };
        iterator.setDate( day + 1);
      }

      var today_cell = $('#' + p.id + ' > .cds_body > table > tbody > tr > td.today')
      if (today_cell) today_cell.removeClass("today");
      var days_until = ""
      if ( $.inArray( (days_until = p.beginning_date.stripTime().daysDistance(today)),range( 0, 41 ) ) != -1 ) {
        var today_cell = p.calendar_day_grid[days_until];
        $(today_cell).addClass("today");
      }
    },
    
    setSelectedClass: function (parent) {
      var p = parent.dts;
      if (!p.selection_made) return;
      this.clearSelectedClass(parent);
      if ( $.inArray( ( days_until = p.beginning_date.stripTime().daysDistance(p.selected_date.stripTime()) ) ,range( 0, 42 ) ) != -1 ) {
        var selected_cell = p.calendar_day_grid[days_until];
        $(selected_cell).addClass("selected");
      }
    },
  
    clearSelectedClass: function (parent) {
      var selected_cell = $('#' + parent.dts.id + ' > .cds_body > table > tbody > tr > td.selected')
      if (selected_cell) selected_cell.removeClass("selected");
    },
    
    /* Close date time select if clicked elsewhere. */
	  checkExternalClick: function (parent,dts_id,clicked_element) {
	    if ($('#' + dts_id).css('display') == 'none') {
	      return;
	    } else {
	      var element = $(clicked_element).parents('#' + dts_id);
	      if (element.length == 1) {
	        return; 
        } else {
          //if (clicked_element != input_element) {
          if (this.iframe) $(this.iframe).remove();
          $('#' + dts_id).hide('fast');
          //} 
        }
	    }
	  },
	  
	  clearDate: function(parent) {
	    var p = parent.dts;
      if ((parent.disabled || parent.readOnly) && p.options.popup != "force") return false;
      p.selection_made = false;
      this.clearSelectedClass(parent);
      this.updateFooter(parent,'&#160;');
      if (p.minute_select) p.minute_select.reset();
      if (p.hour_select) p.hour_select.reset();
      //if (last_value!=g.target_element.value) 
        // TODO - callbacks
        //callback("onchange");
    },
    
    // Linked to "OK", "Close", and "x"
    close: function(parent) {
			var p = parent.dts;
			var selector = '#' + parent.dts.id + ' > .cds_footer > span';
			if ($(selector).html() == "&nbsp;") { 
				parent.value = "";
			} else {
				parent.value = $(selector).html();
			}
      if (this.iframe) $(this.iframe).remove();
      $('#' + p.id).hide('fast'); //return false;
			$(parent).focus();
			$(parent).blur();
      // TODO
      //if (this.closed) return false;
      // TODO - callbacks
      // callback("before_close");
      // g.target_element.calendar_date_select = nil;
      // TODO
      // $(document).unbind("mousedown", closeIfClickedOut);
      // $(document).unbind("keypress", keyPress);
      // $(g.calendar_div).remove();
      // this.closed = true;
      //if (this.iframe) $(this.iframe).remove();
      //if (g.target_element.type != "hidden" && ! g.target_element.disabled) g.target_element.focus();
      // TODO - callbacks
      //callback("after_close");
    },
    
    open: function(parent) {
      if ($('#' + parent.dts.id).is (':visible')) this.close(parent);
      $(parent).animate({opacity: 1.0}, 5000);
      this.repositionCalendar(parent);
      this.parseDate(parent); 
      $('#' + parent.dts.id).show('fast');
    },
    
    closeOnClick: function(parent) {
      var p = parent.dts;
      if (p.options.embedded) return false;
      if (p.options.close_on_click === nil )
        return (p.options.time) ? false : true
      else
        return (p.options.close_on_click)
    },
  
    today: function(now,parent) {
      var d = new Date(); 
      parent.dts.date = new Date();
      var o = { 
        day: d.getDate(),
        month: d.getMonth(), 
        year: d.getFullYear(), 
        hour: d.getHours(), 
        minute: d.getMinutes()
      };
      if ( ! now ) o = $.extend(o,{hour: "", minute: ""}); 
      this.updateSelectedDate(o,parent);
      this.refresh(parent);
			if (parent.dts.options.embedded == true) this.updateValue(parent);
    },
    
    repositionCalendar: function (parent) {
			// TODO: Cleanup and organize code in repositionCalendar
			// var dpWidth = inst.dpDiv.outerWidth();
			// var dpHeight = inst.dpDiv.outerHeight();
			// var inputWidth = inst.input ? inst.input.outerWidth() : 0;
			// var inputHeight = inst.input ? inst.input.outerHeight() : 0;
			var viewWidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) + $(document).scrollLeft();
			var viewHeight = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) + $(document).scrollTop();
			//alert("viewWidth: " + viewWidth + " , viewHeight: " + viewHeight);
			// 
			// offset.left -= (this._get(inst, 'isRTL') ? (dpWidth - inputWidth) : 0);
			// offset.left -= (isFixed && offset.left == inst.input.offset().left) ? $(document).scrollLeft() : 0;
			// offset.top -= (isFixed && offset.top == (inst.input.offset().top + inputHeight)) ? $(document).scrollTop() : 0;
			// 
			//alert(parent.border.width);
			//alert($(document).scrollTop());
      var e = $('#' + parent.dts.id);
      var top = $(parent).offset().top;
      var left = $(parent).offset().left;
			//alert("Top: " + top + ", Left: " + left);
      var width = e.outerWidth();
      var height = e.outerHeight();
			//var parent_height = parent.outerHeight;
			//if parentparent.dts.reposition_count = 
			//alert("Height: " + height + ", Width: " + width);
			// // now check if datepicker is showing outside window viewport - move to a better place if so.
			top -= (top + height > viewHeight && viewHeight > height) ? Math.abs(top + height + 20 - viewHeight) : 0;
			//repositioned_left -= (left + width > viewWidth && viewWidth > width) ? Math.abs(left + width - viewWidth) : 0;
			//if (top != repositioned_top) top = 
			e.css({'top' : top});
      e.css({'left' : left});
      // draw an iframe behind the calendar -- ugly hack to make IE 6 happy
      if(navigator.appName=="Microsoft Internet Explorer") this.iframe = $(document.body).build("iframe", {src: "javascript:false", className: "ie6_blocker"}, { left: left, top: top, height: height+"px", width: width+"px", border: "0px"})
    },
    
    setup: function (element) {
      var e = element;
      var nodeName = e.nodeName.toLowerCase();
      if(nodeName == 'input') {
        e.dts.id = "dts_common";
				e.dts.reposition_count = 0
        $(e).bind("mousedown", function() { e.focus(); $.datetimeselect.open(e); return false; });
        $(document).bind("mousedown", function(event) { $.datetimeselect.checkExternalClick(e,"dts_common",event.target); });
        if (!this.initialized) {
          this.createCalendarDiv(e);
          this.common_calendar_day_grid = e.dts.calendar_day_grid;
          this.common_hour_select = e.dts.hour_select;
          this.common_minute_select = e.dts.minute_select;
          this.initialized = true;
        } else {
          e.dts.calendar_day_grid = this.common_calendar_day_grid;
          e.dts.hour_select = this.common_hour_select;
          e.dts.minute_select = this.common_minute_select;
          this.parseDate(e);
        }
      } else {
        e.dts.id = "dts_" + this.uuid + this.count;
        this.count = this.count + 1;
        e.dts.options.embedded = true;
        this.createCalendarDiv(e);
        this.parseDate(e);
      }
    }
    
  });
  
  
  // function keyPress() {
  //   alert("keyPress");
  //   //if (this.keyCode==Event.KEY_ESC) $(this).close(parent);
  // };
 
  //
  // private function for debugging
  //
  function debug($obj) {
    if (window.console && window.console.log)
      window.console.log('calendardateselect selection count: ' + $obj.size());
  };
  
  $.fn.build = function(type, options, style) {
    var e = document.createElement(type);
    if (options) $.each(options, function(index, value) { e[index] = value });
    if (style) $(e).css(style);
    $(this).append(e);
    return e;
  }
  
  function SelectBox () {};
  SelectBox.prototype.initialize = function(parent_element, values, html_options, style_options) {
      this.element = $(parent_element).build("select", html_options, style_options);
      this.populate(values);
    }
  SelectBox.prototype.populate = function(values) {
      $(this.element).children().remove();
      var that = this; 
      $.each(values,function(index,item){ $(that.element).build("option", { value: item.value, innerHTML: item.innerHTML }) });
    }
  SelectBox.prototype.setValue = function(value) {
      var e = this.element;
     //$.inspect(e);
      var matched = false;
      $.each(range(e.options.length),function(i) { if(e.options[i].value==value.toString()) {e.selectedIndex = i; matched = true;}; } );
      return matched;
    }
  SelectBox.prototype.getValue = function() { return this.element.selectedIndex }
  
  SelectBox.prototype.reset = function() { this.element.selectedIndex = 0 }
  
  // Utilities
  
  //
  // Copyright (c) 2007-2008 Matthias Miller
  // http://blog.outofhanwell.com/2006/03/29/javascript-range-function/
  //
  function range(/*[start,] stop[, step]*/) {
    if (!arguments.length) {
    return [];
    }
    
    var min, max, step;
    if (arguments.length == 1) {
    min = 0;
    max = arguments[0]-1;
    step = 1;
    }
    else {
    /* default step to 1 if it's zero or undefined */
    min = arguments[0];
    max = arguments[1]-1;
    step = arguments[2] || 1;
    }
    
    /* convert negative steps to positive and reverse min/max */
    if (step < 0 && min >= max) {
    step *= -1;
    
    var tmp = min;
    min = max;
    max = tmp;
    
    min += ((max-min) % step);
    }
    
    var a = [];
    for (var i = min; i <= max; i += step) {
    a[i] = i;
    }
    return a;
  }
  
  $.bind = function() {
    var _func = arguments[0] || null;
    var _obj = arguments[1] || this;
    var _args = $.grep(arguments, function(v, i) {
            return i > 1;
    });

    return function() {
            return _func.apply(_obj, _args);
    };
  };
  
  // TODO - callbacks
  /*
  function callback(name, param) {
    if (eval('g.options.' + 'name')) {
      eval('$.bind(param,g.options.' + 'name')
      g.options.get(name).bind(g.target_element)(param); 
    } 
  }
  */
  
  descendantOf =
  function( element, ancestor ) {
      if ( ancestor && element && ancestor !== element ) {
          while ( element ) {
              if ( element === ancestor ) {
                  return true;
              }
              element = element.parentNode;
          }
      };
      return false;
  }
  
$.fn.datetimeselect = function(options){
  return this.each(function() {
		
    var dts = $.datetimeselect
    dts.options = $.extend({}, dts.defaults, options);
    dts.options = $.meta ? $.extend({}, dts.options, $(this).data()) : dts.options;
    this.dts = [];
    this.dts.options = dts.options;
    dts.setup(this);
	  
	});
};

$.datetimeselect = new jqueryCalendarDateSelect(); // singleton instance
$.datetimeselect.initialized = false;
$.datetimeselect.uuid = new Date().getTime();
$.datetimeselect.version = "0.0.2";
$.datetimeselect.count = 0;

})(jQuery);
