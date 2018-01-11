declare var $: any;

/*
 * A thin wrapper around Javascripts Date object
 * Provides extra methods for better managing
 * the date.
 * 
 * Javascript handles time in 24-hour format so we keep
 * to that but add some extra methods for exporting and
 * importing it to and from 12/hour format
*/

// Required interfce for 12 hour import/export format
interface Time12
{
	hours: number;
	minutes: number;
	pm: boolean;
}

class Time {
	// A date object can be provided if desired to give a preset time
	// otherwise a current date will be creted
    constructor(date: Date = new Date())
    {
        this.date = date;
    }
    
    // Import a time from 12 hour format to 24 hour format
    // If a current Time object is given it will be updated
    // with the new time otherwise a new Time object will be
    // created
    static from12(time12: Time12, time24: Time = new Time()) {
        var hours24 = time12.hours;
        var minutes = time12.minutes;

        if (!time12.pm && hours24 == 12) {
            hours24 = 0;
        }

        if (time12.pm && hours24 < 12) {
            hours24 = hours24 + 12;
        }

        time24.date.setHours(hours24);
        time24.date.setMinutes(minutes);

        return time24;
    }
	
	// Export a time to 12 hour format from 24 hour format
	to12(time12: Time12 = {hours: 0, minutes: 0, pm: false})
	{
		var hours24 = this.hours;
	    var hours12 = ((hours24 + 11) % 12 + 1);
	    var pm = hours24 > 11;
	    
	    var minutes = this.minutes;
	    
	    time12.hours = hours12;
	    time12.minutes = minutes;
	    time12.pm = pm;
	    
	    return time12;
	}
	
	// Getters and setters for conv.
	// Upon hours or minutes changing, an event will be fired
	// the event object will contain the new and old value

	get hours()
	{
		return this.date.getHours();
	}
	
	set hours(hours: number)
	{
		if (hours === this.hours) return;

		$(this).trigger("hoursChange", [hours, this.hours]);
		this.date.setHours(hours);
	}
	
	get minutes()
	{
		return this.date.getMinutes();
	}
	
	set minutes(minutes: number)
	{
		if (minutes === this.minutes) return;

		$(this).trigger("minutesChange", [minutes, this.minutes]);
		this.date.setMinutes(minutes);
	}
    
    date: Date;
}

/*
 * Interfaces with a spinner
*/

class Spinner
{
	// To what spinner group and spinner group entry does this interface belong
	// What should the spinner be set to automatically
	constructor(groupName: string, groupEntryId: number, notchId: number = 0)
	{
		this.groupName = groupName;
		this.groupEntryId = groupEntryId;
		this.notchId = notchId;
	}
	
	// Re-update the spinner based on the eisting value stored here
	refresh()
	{
		$("." + this.groupName 
			+ " .slot-" + this.groupEntryId 
			+ " .strip").removeClass(Spinner.notchesCSS);
        
        $("." + this.groupName 
			+ " .slot-" + this.groupEntryId 
			+ " .strip").addClass("pos-" + this.notchId);
	}
	
	get notchId()
	{
		return this._notchId;
	}
	
	// Re-adjust the spinner to a new value
	set notchId(value: number)
	{
		if(this.notchId == value) return;
		
		$(this).trigger("notchIdChange", [value, this._notchId]);
		this._notchId = value;
		this.refresh();
	}
	
	groupName: string;
	groupEntryId: number;
	_notchId: number;
	
	// A spinner has 9 notches
	static notchesCSS: string = "pos-0 pos-1 pos-2 pos-3 pos-4 pos-5 pos-6 pos-7 pos-8 pos-9";
}

/*
 * This interfaces to 2 spinners and treats them like 2-digit
 * numbers with an optionally clamped min and max range
*/

class SpinnerGroupDigits
{
	constructor(
		groupName: string,
		value: number = 0,
		min : number = undefined,
        max: number = undefined,
		spinner1: Spinner = new Spinner(groupName, 1), 
		spinner2: Spinner = new Spinner(groupName, 2))
	{
		this.groupName = groupName;
		this.spinner1 = spinner1;
		this.spinner2 = spinner2;
		this.maxLimit = max;
		this.minLimit = min;
		this.value = value;
	}
	
	// Re-update both spinners to the existing value
	// Useful for when switching from another SpinnerGroupDigits
	refresh()
	{
		this.spinner1.refresh();
		this.spinner2.refresh();
	}
    
    // Re-update the spinners to the value stored here
    updateValue()
    {
        if(this.value < 10)
		{
			this.spinner1.notchId = 0;
			this.spinner2.notchId = this.value;
		}
		else
		{
			var tmp: string = this.value.toString();
            
			var digit1 = tmp[0];
			var digit2 = tmp[1];
			
			this.spinner1.notchId = parseInt(digit1);
			this.spinner2.notchId = parseInt(digit2);
		}
    }
	
	// Ensure the value stored here is within valid range if set
	validate()
	{
		if(this.maxLimit !== undefined && this.value > this.maxLimit) this._value = this.maxLimit;
		else if(this.minLimit !== undefined && this.value < this.minLimit) this._value = this.minLimit;
	}
	
	get value()
	{
		return this._value;
	}
	
	set value(value: number)
	{
		if(this.value === value) return;
        
        $(this).trigger("valueChange", [value, this._value]);
		this._value = value;
        this.validate();
        this.updateValue();
	}
	
	set maxLimit(value: number)
	{
		$(this).trigger("maxLimitChange", [value, this._maxLimit]);
		this._maxLimit = value;
		this.validate();
	}
	
	get maxLimit()
	{
		return this._maxLimit;
	}
	
	set minLimit(value: number)
	{
		$(this).trigger("minLimitChange", [value, this._minLimit]);
		this._minLimit = value;
		this.validate();
	}
	
	get minLimit()
	{
		return this._minLimit;
	}
	
	spinner1: Spinner;
	spinner2: Spinner;
	_maxLimit: number;
	_minLimit: number;
	_value: number;
	groupName: string;
}

/*
 * A clock interfaces with the dials on the page
 * Multiple clocks can exist but they will all use the same dials
 * so its important to ensure only one clock is actively used
 * at a time if more than one exists
*/

class Clock
{
	// Create
	constructor()
	{
		// Create proper interfaces to the dials
		this.hours = new SpinnerGroupDigits("hours", 1, 1, 12);
		this.minutes = new SpinnerGroupDigits("minutes", 1, 0, 59);
		this.amPm = new Spinner("am-pm", 1);

		// disable 24 hour mode by default
		this._hr24Mode = false;

		// Create a 24-hour clock backend
		this.time24 = new Time();
	}
	
	// Forces the dials to refresh themselves with the values stored in
	// cache, if the 24-hour clock backend has changed it wont be reflected
	// here as only old values are refreshed.

	// Useful when switching active clocks
	refresh()
	{
		this.hours.refresh();
		this.minutes.refresh();
		this.amPm.refresh();
	}
	
	// Update the 24-hour backend to represent the current time
	// and reflect those changes on the dials
	currentTime()
	{
		this.time24 = new Time();
		this.updateTime();
	}
	
	// Update the dials to whatever the current 24-hour backend has
	updateTime()
	{
		if(this.hr24Mode)
		{
			this.hours.value = this.time24.hours;
			this.minutes.value = this.time24.minutes;
			this.amPm.notchId = 2;
		}
		else
		{
			this.hours.value = this.time24.to12().hours;
			this.minutes.value  = this.time24.to12().minutes;
			
			if(this.time24.to12().pm)
				this.amPm.notchId = 1;
			else
				this.amPm.notchId = 0;
		}
	}
	
	// When changing 24-hour mode, the hours dial must be updated
	get hr24Mode()
	{
		return this._hr24Mode;
	}
	
	set hr24Mode(value: boolean)
	{
		this._hr24Mode = value;
		
		if(value)
		{
			this.hours = new SpinnerGroupDigits("hours", 0, 0, 23);
		}
		else
		{
			this.hours = new SpinnerGroupDigits("hours", 0, 1, 12);
		}
		
		this.updateTime();
	}
	
	hours: SpinnerGroupDigits;
	minutes: SpinnerGroupDigits;
	amPm: Spinner;
	_hr24Mode: boolean;
	time24: Time;
}

/*
 * Main Loop OOP Style
*/

// Bleed main instance to Window for debugging purposes
interface Window
{
    main: any;
}

class Main {
	constructor() {
		// Creae the clock
		this.clock = new Clock();
        
        // and the alarm clock, disabling alarm mode
		this.alarm = new Clock();
		this.alarm.time24.hours = 0;
		this.alarm.time24.minutes = 0;
        this.alarmMode = false;

        // Enable Alarm features
        this.enableAlarmFeatures();

        // Wireup some event handlers
        $(".alarm-set").click(this.toggleAlarmMode.bind(this));
        $(".alarm-24hr").click(this.toggle24hrMode.bind(this));

        $(".hours .up").click(this.incrementAlarmHours.bind(this));
        $(".hours .down").click(this.decrementAlarmHours.bind(this));

        $(".minutes .up").click(this.incrementAlarmMinutes.bind(this));
        $(".minutes .down").click(this.decrementAlarmMinutes.bind(this));

        $(".am-pm .up").click(this.alarmToAm.bind(this));
        $(".am-pm .down").click(this.alarmToPm.bind(this));

        $(".alarm-melody").click(this.loadAlarmMelodyFile.bind(this));
        $("#alarmTone").change(this.isLoadedAlarmMelodyFile.bind(this));

        $(".alarm-melody-play").click(this.soundAlarm.bind(this));

        this.alarmEnabled = false;
        $(".alarm-enable").click(this.alarmEnable.bind(this));

        this.alarmSleepActivated = false;
        $(".alarm-snooze").click(this.alarmSleep.bind(this));
		
		// Update clock to current time and begin ticking every second
		this.updateClock();
		setInterval(this.updateClock.bind(this), 1000);
	}
	
	// Gets called every second
	updateClock() {
		if (!this.alarmMode)
		{
			this.clock.currentTime();

			if(this.alarmEnabled && !this.alarmPlaying)
			{
				var alarmHours = this.alarm.time24.hours;
				var alarmMinutes = this.alarm.time24.minutes;

				var clockHours = this.clock.time24.hours;
				var clockMinutes = this.clock.time24.minutes;

				if (alarmHours == clockHours &&
					alarmMinutes == clockMinutes)
					this.soundAlarm();
			}
		}
	}

	// Used when switching clocks between curren clock and alarm clock
	refreshClock() {
		if (this.alarmMode) {
			// Apply new values to all the sliders for this clock
            this.alarm.updateTime();

            // Re-apply old values since the dial positions are from a
            // previous clock and need changing to reflect this clock again
            this.alarm.refresh();
        }
		else {
            this.updateClock();
            this.clock.refresh();
        }
	}

	get alarmMode() {
		return this._alarmMode;
	}

	// Force a refresh on clock switch
	set alarmMode(value: boolean) {
		this._alarmMode = value;
		this.refreshClock();

		if (value) {
			$(".alarm-set").addClass("toggled");

			$(".arrow").removeClass("hidden");
			$(".arrow").removeClass("hidden");

			if(this.alarm.hr24Mode)
			{
				$(".am-pm .arrow").addClass("hidden");
			}

			if(this.alarm.hr24Mode) $(".alarm-24hr").addClass("toggled");
			else $(".alarm-24hr").removeClass("toggled");
		}
		else {
			$(".alarm-set").removeClass("toggled");

			$(".arrow").addClass("hidden");
			$(".arrow").addClass("hidden");

			if(this.clock.hr24Mode) $(".alarm-24hr").addClass("toggled");
			else $(".alarm-24hr").removeClass("toggled");
		}
	}

	toggleAlarmMode()
	{
		this.alarmMode = !this.alarmMode;
	}

	toggle24hrMode()
	{
		// Best to toggle both to skip confusion
		this.alarm.hr24Mode = this.clock.hr24Mode = !this.clock.hr24Mode;
		this.alarmMode = this.alarmMode;
	}

	incrementAlarmHours()
	{
		if(this.alarmMode)
		{
			if(!this.alarm.hr24Mode)
			{
				var time12: Time12 = this.alarm.time24.to12();
				time12.hours++;

				if (time12.hours > 12) time12.hours = 1;
				this.alarm.time24 = Time.from12(time12);
			}
			else
			{
				var hours = this.alarm.time24.hours;
				hours++;
				if (hours > 23) hours = 0;
				this.alarm.time24.hours = hours;
			}

			this.alarm.updateTime();
		}
	}

	decrementAlarmHours()
	{
		if(this.alarmMode)
		{
			if(!this.alarm.hr24Mode)
			{
				var time12: Time12 = this.alarm.time24.to12();
				time12.hours--;

				if (time12.hours < 1) time12.hours = 12;
				this.alarm.time24 = Time.from12(time12);
			}
			else
			{
				var hours = this.alarm.time24.hours;
				hours--;
				if (hours < 0) hours = 23;
				this.alarm.time24.hours = hours;
			}

			this.alarm.updateTime();
		}
	}

	incrementAlarmMinutes()
	{
		if(this.alarmMode)
		{
			var minutes = this.alarm.time24.minutes;
			minutes++;
			if (minutes > 59) minutes = 0;
			this.alarm.time24.minutes = minutes;
			this.alarm.updateTime();
		}
	}

	decrementAlarmMinutes()
	{
		if(this.alarmMode)
		{
			var minutes = this.alarm.time24.minutes;
			minutes--;
			if (minutes < 0) minutes = 59;
			this.alarm.time24.minutes = minutes;
			this.alarm.updateTime();
		}
	}

	alarmToAm()
	{
		if(this.alarmMode && !this.alarm.hr24Mode)
		{
			var time12 = this.alarm.time24.to12();
			time12.pm = false;
			this.alarm.time24 = Time.from12(time12);
			this.alarm.updateTime();
		}
	}

	alarmToPm()
	{
		if(this.alarmMode && !this.alarm.hr24Mode)
		{
			var time12 = this.alarm.time24.to12();
			time12.pm = true;
			this.alarm.time24 = Time.from12(time12);
			this.alarm.updateTime();
		}
	}

	loadAlarmMelodyFile()
	{
		$("#alarmTone").click();
	}

	isLoadedAlarmMelodyFile()
	{
		if($("#alarmTone").val())
		{
			this.fileReader = new FileReader();
			this.fileReader.readAsDataURL($('#alarmTone')[0].files[0]);

			this.fileReader.onloadend = function() {
				$("#player")[0].src = this.fileReader.result;
				this.fileReaderDone = true;
				$(".alarm-melody").addClass("toggled");
			}.bind(this);
		}
		else
		{
			$(".alarm-melody").removeClass("toggled");
			this.fileReader = undefined;
		}
	}

	soundAlarm()
	{
		if(this.fileReader !== undefined && this.fileReaderDone)
		{
			if(this.alarmPlaying)
			{
				$("#player")[0].pause();
				$("#player")[0].currentTime = 0;
				$(".alarm-melody-play").removeClass("toggled");
				this.alarmPlaying = false;
			}
			else
			{
				$("#player")[0].play();
				$(".alarm-melody-play").addClass("toggled");
				this.alarmPlaying = true;

				// Disable sleep mode in case it was activated
				$(".alarm-snooze").removeClass("toggled");
				this.alarmSleepActivated = false;
			}
		}
	}

	alarmEnable()
	{
		this.alarmEnabled = !this.alarmEnabled;

		if(this.alarmEnabled)
		{
			$(".alarm-enable").addClass("toggled");
		}
		else
		{
			$(".alarm-enable").removeClass("toggled");

			// Disable sleep mode in case it was activated
			$(".alarm-snooze").removeClass("toggled");
			this.alarmSleepActivated = false;

			if (this.alarmPlaying) this.soundAlarm();
		}
	}

	alarmSleep()
	{
		// Only if the alarm is playing and enabled
		// and sleep hasnt been activated already
		if(this.alarmPlaying 
			&& this.alarmEnabled
			&& !this.alarmSleepActivated)
		{
			// Activate sleep mode
			this.alarmSleepActivated = true;

			// Stop alarm
			this.soundAlarm();

			// Increase alarm by 5 minutes
			this.alarm.time24.minutes += 5;

			// Toggle snooze button
			$(".alarm-snooze").addClass("toggled");
		}

		// If sleep is pressed while its on and in-progress
		// Disable sleep and re-activate alarm
		else if(!this.alarmPlaying 
			&& this.alarmEnabled
			&& this.alarmSleepActivated)
		{
			// Deactivate sleep mode
			this.alarmSleepActivated = false;

			// Restart alarm
			this.soundAlarm();

			// Disable Toggle snooze button
			$(".alarm-snooze").removeClass("toggled");
		}
	}

	enableAlarmFeatures()
	{
		if(FileReader)
        {
            $("button:disabled").prop('disabled', false)
            $(".support").removeClass('not-supported')
            $(".support").addClass('supported')
        }
	}
	
	clock: Clock;
	alarm: Clock;
	_alarmMode: boolean;
	fileReader: FileReader;
	fileReaderDone: boolean;
	alarmPlaying: boolean;
	alarmEnabled: boolean;
	alarmSleepActivated: boolean;
}

$(function()
{
	var main = new Main();
	window.main = main;
});
