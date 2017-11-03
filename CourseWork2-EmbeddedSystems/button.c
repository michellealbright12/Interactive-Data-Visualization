#include "led.h"
#include "button.h"
#include "MK70F12.h"

int current_filter;

void button_init(int curr_LED)
{
	// Enable clock gating to the correct pin port
	SIM_SCGC5 |= SIM_SCGC5_PORTD_MASK;
	SIM_SCGC5 |= SIM_SCGC5_PORTE_MASK;

	// Configure the button pins to be GPIOs
	PORTD_PCR0 = PORT_PCR_MUX(1) | PORT_PCR_DSE_MASK | PORT_PCR_PE_MASK | PORT_PCR_PS_MASK | PORT_PCR_ISF_MASK | PORT_PCR_IRQC(0b1010);
	PORTE_PCR26 = PORT_PCR_MUX(1) | PORT_PCR_DSE_MASK | PORT_PCR_PE_MASK | PORT_PCR_PS_MASK | PORT_PCR_ISF_MASK | PORT_PCR_IRQC(0b1010);

	// Set the button GPIO pins as inputs, and set them by default
	GPIOD_PDDR = 0;
	GPIOE_PDDR = 0 << 26;

	NVICISER2 = (1 << 26) | (1 << 27);

	current_filter = 0;
}

int getFilter() {
	return current_filter;
}

void button_press(int button_id)
{
	switch(button_id)
	{
		case UP:
			led_off(current_filter);
			current_filter += 1;
            
            //loop back to the first filter after the last one
			if (current_filter == 4){
				current_filter = 0;
			}
			led_on(current_filter);
			//return current_filter;
			break;

		case DOWN:
			led_off(current_filter);
			current_filter -= 1;
            
            //loop back to last filter after the first one
			if (current_filter < 0){
				current_filter = 3;
			}
			led_on(current_filter);
			//return current_filter;
			break;
	}
}
