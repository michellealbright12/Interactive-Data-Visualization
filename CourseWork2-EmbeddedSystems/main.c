/*
* Bare metal template created by Harry Wagstaff
* Based on Freescale Codewarrior Bareboard project template
* Edited by Stan Manilov
*/
#include <stdio.h>
#include "MK70F12.h"
#include "button.h"
#include "filter.h"
#include "uart.h"
#include "led.h"
#include "vectors.h"


// __init_hardware is called by the Freescale __thumb_startup function (see
// vectors.c)
int data_present, curr_filter;
filterType * filter;
signed char output;

void __init_hardware()
{
	// Disable the Watchdog module. This module is designed to reset
	// the board in case it crashes for some reason. We don't need it,
	// so we disable it here.
	WDOG_UNLOCK = 0xC520;
	WDOG_UNLOCK = 0xD928;
	WDOG_STCTRLH = 0xD2;

	// Configure the MCG - set up clock dividers on
	SIM_CLKDIV1 = SIM_CLKDIV1_OUTDIV1(0) | SIM_CLKDIV1_OUTDIV2(0) | SIM_CLKDIV1_OUTDIV3(1) | SIM_CLKDIV1_OUTDIV4(1);
	MCG_C1 = MCG_C1_CLKS(2);

	//init leds and buttons
	led_init();
	button_init(0);
	uart_init(0);
}

void main()
{
	led_on(0);

	filter = filter_create();
	filter_init(filter);

	while(1)
	{
		data_present = data_exists();

		if (data_present) {
			curr_filter = getFilter();
			output = read_filter_write(filter, curr_filter);
		}
	}
}
