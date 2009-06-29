class CalendarsController < ApplicationController
  
  def index
    @now = Time.now
  end
  
end
