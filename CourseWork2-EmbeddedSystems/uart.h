#ifndef UART_H__
#define UART_H__

#include "filter.h"

extern void uart_init(int curr_LED);
extern signed char read_filter_write(filterType *filter, int filter_number);
extern int data_exists();

#endif
